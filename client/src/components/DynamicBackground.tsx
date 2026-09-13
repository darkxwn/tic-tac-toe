import React, { useEffect, useRef } from 'react';

// ============================================================================
// REGISTRIES: Easily add new shapes and motions here!
// ============================================================================

export type ShapeType = 'square' | 'rectangle' | 'stick' | 'circle' | 'triangle';
export type SceneMotion = 'fly_up' | 'float_up_sway' | 'fly_down' | 'stack_down';

export const ALL_SHAPES: ShapeType[] = ['square', 'rectangle', 'stick', 'circle', 'triangle'];
export const ALL_MOTIONS: SceneMotion[] = ['fly_up', 'float_up_sway', 'fly_down', 'stack_down'];

/**
 * Rules for compatibility:
 * - One shape type per scene
 * - Circles and swaying motion (float_up_sway) are incompatible
 */
export function getValidShapesForMotion(motion: SceneMotion): ShapeType[] {
  if (motion === 'float_up_sway') {
    return ALL_SHAPES.filter((s) => s !== 'circle');
  }
  return ALL_SHAPES;
}

interface ShapeInstance {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  fillColor: string;
  // For float_up_sway
  baseX: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  // For stack_down
  landed: boolean;
  settleTimer: number;
  isFadingOut: boolean;
}

interface DynamicBackgroundProps {
  enabled: boolean;
}

// Subtle theme-compatible palette presets
const THEME_PALETTES = {
  neon: [
    { stroke: 'rgba(139, 92, 246, 0.28)', fill: 'rgba(139, 92, 246, 0.05)' }, // Electric Violet
    { stroke: 'rgba(56, 189, 248, 0.26)', fill: 'rgba(56, 189, 248, 0.04)' },  // Electric Sky
    { stroke: 'rgba(45, 212, 191, 0.26)', fill: 'rgba(45, 212, 191, 0.04)' },  // Cyan Teal
    { stroke: 'rgba(244, 114, 182, 0.24)', fill: 'rgba(244, 114, 182, 0.04)' }, // Soft Magenta
  ],
  dark: [
    { stroke: 'rgba(129, 140, 248, 0.24)', fill: 'rgba(129, 140, 248, 0.04)' }, // Indigo Slate
    { stroke: 'rgba(96, 165, 250, 0.24)', fill: 'rgba(96, 165, 250, 0.04)' },  // Soft Blue
    { stroke: 'rgba(251, 191, 36, 0.20)', fill: 'rgba(251, 191, 36, 0.03)' },  // Warm Amber
    { stroke: 'rgba(148, 163, 184, 0.22)', fill: 'rgba(148, 163, 184, 0.04)' }, // Muted Slate
  ],
  light: [
    { stroke: 'rgba(2, 132, 199, 0.20)', fill: 'rgba(2, 132, 199, 0.04)' },   // Soft Sky
    { stroke: 'rgba(124, 58, 237, 0.18)', fill: 'rgba(124, 58, 237, 0.03)' },  // Soft Purple
    { stroke: 'rgba(100, 116, 139, 0.20)', fill: 'rgba(100, 116, 139, 0.03)' }, // Soft Slate
  ],
};

function getActiveThemePalette() {
  const root = document.documentElement;
  if (root.classList.contains('theme-neon')) return THEME_PALETTES.neon;
  if (root.classList.contains('theme-light')) return THEME_PALETTES.light;
  return THEME_PALETTES.dark;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let shapeIdCounter = 0;

    // Viewport dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Scene state management
    let currentMotion: SceneMotion = 'fly_up';
    let currentShape: ShapeType = 'square';
    let isDraining = false; // When true, stop spawning, wait for shapes to leave/fade
    let sceneTimer = 0;
    const SCENE_ACTIVE_DURATION = 26000; // 26 seconds of spawning per scene
    let quietTimer = 0; // Brief pause between scenes when canvas is empty
    const QUIET_PAUSE_DURATION = 1500; // 1.5 seconds

    // Shapes array
    let shapes: ShapeInstance[] = [];
    const MAX_SHAPES_ON_SCREEN = 18; // +5-7 more shapes simultaneously
    let nextSpawnTime = 0;

    // Pick next scene with variety (avoid exact consecutive repeats)
    const pickNextScene = () => {
      const availableMotions = ALL_MOTIONS.filter((m) => m !== currentMotion);
      const nextMotion = availableMotions[Math.floor(Math.random() * availableMotions.length)] || 'fly_up';

      const validShapes = getValidShapesForMotion(nextMotion).filter((s) => s !== currentShape);
      const nextShape = validShapes[Math.floor(Math.random() * validShapes.length)] || 'square';

      currentMotion = nextMotion;
      currentShape = nextShape;
      isDraining = false;
      sceneTimer = 0;
      quietTimer = 0;
      nextSpawnTime = performance.now() + 250;
    };

    // Initialize first scene randomly
    pickNextScene();

    // Spawn a new shape for the current scene
    const spawnShape = () => {
      const palette = getActiveThemePalette();
      const colorScheme = palette[Math.floor(Math.random() * palette.length)];

      // Varying sizes: slightly larger than before, elegant and balanced
      let s = 30 + Math.random() * 30; // 30 - 60px
      let w = s;
      let h = s;

      if (currentShape === 'rectangle') {
        w = 40 + Math.random() * 26; // 40 - 66px
        h = 24 + Math.random() * 14; // 24 - 38px
        s = Math.max(w, h);
      } else if (currentShape === 'stick') {
        w = 7 + Math.random() * 3; // 7 - 10px
        h = 50 + Math.random() * 26; // 50 - 76px
        s = h;
      } else if (currentShape === 'circle') {
        s = 18 + Math.random() * 16; // radius 18 - 34px (diameter 36 - 68px)
        w = s * 2;
        h = s * 2;
      } else if (currentShape === 'triangle') {
        s = 32 + Math.random() * 30; // 32 - 62px
        w = s;
        h = s;
      }

      let spawnY = 0;
      let vy = 0;
      let vx = (Math.random() - 0.5) * 0.25;
      const vRot = (Math.random() - 0.5) * 0.015;

      if (currentMotion === 'fly_up') {
        spawnY = height + s + 20;
        vy = -(0.45 + Math.random() * 0.95);
        vx = (Math.random() - 0.5) * 0.35;
      } else if (currentMotion === 'float_up_sway') {
        spawnY = height + s + 20;
        vy = -(0.40 + Math.random() * 0.85);
      } else if (currentMotion === 'fly_down') {
        spawnY = -s - 20;
        vy = 0.45 + Math.random() * 0.95;
        vx = (Math.random() - 0.5) * 0.35;
      } else if (currentMotion === 'stack_down') {
        spawnY = -s - 20;
        vy = 0.55 + Math.random() * 0.95;
        vx = (Math.random() - 0.5) * 0.5;
      }

      // Best-Candidate Poisson sampling for diverse, well-spaced drop points
      const margin = Math.max(30, s / 2 + 15);
      const availableWidth = Math.max(100, width - margin * 2);
      let spawnX = margin + Math.random() * availableWidth;

      if (shapes.length > 0) {
        let maxScore = -1;
        const numCandidates = 14;

        for (let c = 0; c < numCandidates; c++) {
          const candidateX = margin + Math.random() * availableWidth;
          let minDist = Infinity;

          for (let j = 0; j < shapes.length; j++) {
            const other = shapes[j];
            const dx = Math.abs(candidateX - other.x);

            if (currentMotion === 'stack_down') {
              // In stack_down: penalize landing on top of existing columns or close to falling shapes
              const verticalProximity = Math.max(0.35, 1.0 - Math.abs(spawnY - other.y) / height);
              const effectiveDist = dx / verticalProximity;
              if (effectiveDist < minDist) {
                minDist = effectiveDist;
              }
            } else {
              // For fly_up / fly_down / sway: avoid spawning too close to shapes that just departed
              const dy = Math.abs(spawnY - other.y);
              if (dy < height * 0.45) {
                const proximityWeight = 1.0 - dy / (height * 0.45);
                const effectiveDist = dx / (0.3 + 0.7 * proximityWeight);
                if (effectiveDist < minDist) {
                  minDist = effectiveDist;
                }
              } else {
                if (dx < minDist) {
                  minDist = dx;
                }
              }
            }
          }

          if (minDist > maxScore) {
            maxScore = minDist;
            spawnX = candidateX;
          }
        }
      }

      const shape: ShapeInstance = {
        id: ++shapeIdCounter,
        type: currentShape,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        size: s,
        width: w,
        height: h,
        rotation: Math.random() * Math.PI * 2,
        vRot,
        alpha: 0,
        maxAlpha: 0.85 + Math.random() * 0.15,
        color: colorScheme.stroke,
        fillColor: colorScheme.fill,
        baseX: spawnX,
        swayAmp: 18 + Math.random() * 22,
        swayFreq: 0.0016 + Math.random() * 0.0012,
        phase: Math.random() * Math.PI * 2,
        landed: false,
        settleTimer: 340 + Math.floor(Math.random() * 240), // frames before fadeout
        isFadingOut: false,
      };

      shapes.push(shape);
    };

    // Main animation loop
    const render = (now: number) => {
      const dt = Math.min(now - lastTime, 50); // limit max dt to 50ms to prevent huge jumps
      lastTime = now;

      // Handle scene lifecycle
      if (!isDraining) {
        sceneTimer += dt;
        if (sceneTimer >= SCENE_ACTIVE_DURATION) {
          isDraining = true; // Stop spawning, let current shapes finish
        } else if (shapes.length < MAX_SHAPES_ON_SCREEN && now >= nextSpawnTime) {
          spawnShape();
          // Varied launch intervals: rhythmic waves with varied departure times
          if (shapes.length < 8) {
            nextSpawnTime = now + (280 + Math.random() * 420);
          } else {
            const interval = Math.random() < 0.42
              ? 350 + Math.random() * 450   // quick burst / pair launch
              : 850 + Math.random() * 1100; // breathing pause
            nextSpawnTime = now + interval;
          }
        }
      } else {
        // When all shapes leave or fade, wait quiet pause before transitioning
        if (shapes.length === 0) {
          quietTimer += dt;
          if (quietTimer >= QUIET_PAUSE_DURATION) {
            pickNextScene();
          }
        }
      }

      // Clear canvas cleanly
      ctx.clearRect(0, 0, width, height);

      // Update and draw shapes
      const remainingShapes: ShapeInstance[] = [];

      for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];

        // Fade in gradually when born
        if (!s.isFadingOut && s.alpha < s.maxAlpha) {
          s.alpha = Math.min(s.maxAlpha, s.alpha + 0.02);
        }

        // Motion update based on active scene type
        if (currentMotion === 'fly_up') {
          s.y += s.vy;
          s.x += s.vx;
          s.rotation += s.vRot;

          // Keep if still on screen
          if (s.y > -s.size - 40) {
            remainingShapes.push(s);
          }
        } else if (currentMotion === 'float_up_sway') {
          s.y += s.vy;
          s.x = s.baseX + Math.sin(now * s.swayFreq + s.phase) * s.swayAmp;
          s.rotation = Math.sin(now * s.swayFreq + s.phase) * 0.3;

          if (s.y > -s.size - 40) {
            remainingShapes.push(s);
          }
        } else if (currentMotion === 'fly_down') {
          s.y += s.vy;
          s.x += s.vx;
          s.rotation += s.vRot;

          if (s.y < height + s.size + 40) {
            remainingShapes.push(s);
          }
        } else if (currentMotion === 'stack_down') {
          const halfW = s.width / 2;
          const halfH = s.height / 2;
          const isCircle = s.type === 'circle';

          // Effective vertical and horizontal half-extents taking current angle into account
          const sinR = Math.abs(Math.sin(s.rotation));
          const cosR = Math.abs(Math.cos(s.rotation));
          const extentY = isCircle ? s.size : sinR * halfW + cosR * halfH;
          const extentX = isCircle ? s.size : cosR * halfW + sinR * halfH;

          // 1. Apply gravity & motion integration if not settled
          if (!s.landed) {
            s.vy += 0.12; // Gentle physical gravity
            s.vy = Math.min(s.vy, 4.5); // Terminal velocity
            s.vx *= 0.985; // Air damping
            s.vRot *= 0.985;
            s.x += s.vx;
            s.y += s.vy;
            s.rotation += s.vRot;
          }

          // Screen edges constraint
          if (s.x - extentX < 8) {
            s.x = 8 + extentX;
            s.vx = Math.abs(s.vx) * 0.4;
          } else if (s.x + extentX > width - 8) {
            s.x = width - 8 - extentX;
            s.vx = -Math.abs(s.vx) * 0.4;
          }

          // 2. Floor collision
          const floorY = height - 24;
          if (s.y + extentY >= floorY) {
            s.y = floorY - extentY;

            if (Math.abs(s.vy) > 0.6) {
              s.vy = -s.vy * 0.28; // Elastic bounce
              s.vRot += (Math.random() - 0.5) * 0.03;
            } else {
              s.vy = 0;
            }

            s.vx *= 0.72; // Surface friction

            // Straighten up / align on flat ground
            if (!isCircle) {
              const step = s.type === 'triangle' ? (Math.PI * 2) / 3 : Math.PI / 2;
              const targetRot = Math.round(s.rotation / step) * step;
              const diff = targetRot - s.rotation;
              s.vRot += diff * 0.08;
              s.vRot *= 0.75;
              s.rotation += s.vRot;
            }

            if (Math.abs(s.vy) < 0.15 && Math.abs(s.vx) < 0.15 && Math.abs(s.vRot) < 0.01) {
              s.landed = true;
            }
          }

          // 3. Stacking & collision with other shapes
          for (let j = 0; j < shapes.length; j++) {
            if (i === j) continue;
            const other = shapes[j];
            const otherHalfW = other.width / 2;
            const otherHalfH = other.height / 2;
            const otherIsCircle = other.type === 'circle';
            const otherSinR = Math.abs(Math.sin(other.rotation));
            const otherCosR = Math.abs(Math.cos(other.rotation));
            const otherExtentY = otherIsCircle ? other.size : otherSinR * otherHalfW + otherCosR * otherHalfH;
            const otherExtentX = otherIsCircle ? other.size : otherCosR * otherHalfW + otherSinR * otherHalfH;

            // Check if other is below s and they overlap horizontally
            const dx = s.x - other.x;
            const combinedHalfWidth = (extentX + otherExtentX) * 0.88;

            if (Math.abs(dx) < combinedHalfWidth && s.y < other.y) {
              const otherTopY = other.y - otherExtentY;

              if (s.y + extentY >= otherTopY && s.y + extentY <= otherTopY + 18) {
                const centerOffset = Math.abs(dx) / ((extentX + otherExtentX) * 0.5);

                if (centerOffset > 0.44) {
                  // Off-center impact: slide/tumble off the edge
                  const pushDir = Math.sign(dx) || (Math.random() < 0.5 ? -1 : 1);
                  s.vx += pushDir * 0.45;
                  s.vRot += pushDir * 0.025;
                  s.vy = Math.max(s.vy * 0.5, 0.7);
                  s.landed = false;
                } else {
                  // Stable landing on top of the other shape
                  s.y = otherTopY - extentY;

                  if (Math.abs(s.vy) > 0.6) {
                    s.vy = -s.vy * 0.22;
                  } else {
                    s.vy = 0;
                  }

                  s.vx *= 0.68;

                  // Straighten / align on the shape underneath
                  if (!isCircle) {
                    const step = s.type === 'triangle' ? (Math.PI * 2) / 3 : Math.PI / 2;
                    const targetRot = Math.round(s.rotation / step) * step;
                    const diff = targetRot - s.rotation;
                    s.vRot += diff * 0.08;
                    s.vRot *= 0.75;
                    s.rotation += s.vRot;
                  }

                  if (Math.abs(s.vy) < 0.15 && Math.abs(s.vx) < 0.15 && Math.abs(s.vRot) < 0.01) {
                    s.landed = true;
                  }
                }
              }
            }
          }

          // 4. Settling timer & gentle fadeout
          if (s.landed) {
            s.settleTimer--;
            if (s.settleTimer <= 0) {
              s.isFadingOut = true;
            }
          }

          if (s.isFadingOut) {
            s.alpha -= 0.012;
          }

          if (s.alpha > 0.01) {
            remainingShapes.push(s);
          }
        }

        // DRAW SHAPE
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.strokeStyle = s.color;
        ctx.fillStyle = s.fillColor;
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        if (s.type === 'square') {
          const half = s.size / 2;
          ctx.roundRect(-half, -half, s.size, s.size, 4);
        } else if (s.type === 'rectangle') {
          ctx.roundRect(-s.width / 2, -s.height / 2, s.width, s.height, 4);
        } else if (s.type === 'stick') {
          // Vertical rounded pill stick
          ctx.roundRect(-s.width / 2, -s.height / 2, s.width, s.height, s.width / 2);
        } else if (s.type === 'circle') {
          ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        } else if (s.type === 'triangle') {
          // Equilateral triangle
          const h = (s.size * Math.sqrt(3)) / 2;
          ctx.moveTo(0, -h * (2 / 3));
          ctx.lineTo(s.size / 2, h * (1 / 3));
          ctx.lineTo(-s.size / 2, h * (1 / 3));
          ctx.closePath();
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      shapes = remainingShapes;
      animId = requestAnimationFrame(render);
    };

    // Page visibility handling: pause completely when backgrounded to save battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ touchAction: 'none' }}
      aria-hidden="true"
    />
  );
};
