"""
Procedural Relaxing Ambient Music Generator for Infinity Tic-Tac-Toe.
Generates a 60-second seamless calming ambient loop using Python's standard library
and converts it to MP3 using ffmpeg.
"""

import os
import math
import struct
import wave
import subprocess

SAMPLE_RATE = 44100
BPM = 64
BEAT_DUR = 60.0 / BPM  # ~0.9375 seconds per beat
BAR_DUR = BEAT_DUR * 4.0  # 3.75 seconds per bar
TOTAL_BARS = 16
TOTAL_DUR = BAR_DUR * TOTAL_BARS  # 60.0 seconds exactly
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_DUR)

def midi_to_freq(midi_note: float) -> float:
    return 440.0 * (2.0 ** ((midi_note - 69.0) / 12.0))

# Note definitions
C3, D3, E3, F3, G3, A3, B3 = 48, 50, 52, 53, 55, 57, 59
C4, D4, E4, F4, G4, A4, B4 = 60, 62, 64, 65, 67, 69, 71
C5, D5, E5, F5, G5, A5, B5 = 72, 74, 76, 77, 79, 81, 83
C6 = 84
Fs4 = 66

# 16-bar Chord Progression (Fmaj7 -> G6 -> Em7 -> Am7 -> ...)
CHORDS = [
    # Bar 0: Fmaj7
    [F3, C4, E4, A4],
    # Bar 1: G6
    [G3, D4, E4, B4],
    # Bar 2: Em7
    [E3, B3, D4, G4],
    # Bar 3: Am7
    [A3, C4, E4, G4],
    # Bar 4: Fmaj7
    [F3, A3, C4, E4],
    # Bar 5: Dm9
    [D3, F3, A3, C4, E4],
    # Bar 6: Gsus4 -> G
    [G3, C4, D4, G4],
    # Bar 7: Cmaj7
    [C3, G3, B3, E4],
    # Bar 8: Fmaj9
    [F3, C4, E4, G4, A4],
    # Bar 9: G6/9
    [G3, D4, E4, A4, B4],
    # Bar 10: Em9
    [E3, B3, D4, Fs4, G4],
    # Bar 11: Am9
    [A3, C4, E4, G4, B4],
    # Bar 12: Fmaj7
    [F3, A3, C4, E4, A4],
    # Bar 13: Dm9
    [D3, F3, A3, C4, E4],
    # Bar 14: G11
    [G3, D4, F4, A4, C5],
    # Bar 15: Cmaj9
    [C3, G3, B3, D4, E4],
]

# Sparse, gentle melodic chime events (time_in_beats, note, velocity)
MELODY_EVENTS = [
    (0.5, E5, 0.40), (2.0, G5, 0.45), (3.0, A5, 0.35),
    (4.5, B4, 0.35), (6.0, G5, 0.45), (7.0, E5, 0.35),
    (8.5, G5, 0.40), (10.0, D5, 0.35), (11.0, E5, 0.40),
    (12.5, C5, 0.45), (14.0, E5, 0.40), (15.0, G5, 0.35),
    (16.5, A5, 0.45), (18.0, C6, 0.35), (19.0, G5, 0.40),
    (20.5, F5, 0.40), (22.0, E5, 0.45), (23.0, D5, 0.35),
    (24.5, E5, 0.40), (26.0, D5, 0.45), (27.0, C5, 0.35),
    (28.5, B4, 0.35), (30.0, D5, 0.40), (31.0, C5, 0.45),

    (32.5, E5, 0.45), (34.0, G5, 0.40), (35.0, C6, 0.35),
    (36.5, B5, 0.40), (38.0, A5, 0.45), (39.0, G5, 0.35),
    (40.5, Fs5 := 78, 0.35), (42.0, G5, 0.45), (43.0, E5, 0.40),
    (44.5, C5, 0.45), (46.0, B4, 0.35), (47.0, A4, 0.40),
    (48.5, C5, 0.40), (50.0, E5, 0.45), (51.0, A5, 0.35),
    (52.5, G5, 0.40), (54.0, F5, 0.45), (55.0, E5, 0.35),
    (56.5, D5, 0.45), (58.0, C5, 0.40), (59.0, D5, 0.35),
    (60.5, E5, 0.40), (62.0, D5, 0.35), (63.0, C5, 0.50),
]


def render_music():
    print(f"Generating {TOTAL_DUR:.1f}s ambient music track ({TOTAL_SAMPLES} samples)...")
    
    # Left and Right stereo sample arrays
    left = [0.0] * TOTAL_SAMPLES
    right = [0.0] * TOTAL_SAMPLES
    
    # -------------------------------------------------------------
    # Layer 1: Warm Ambient Background Pad (Sustained slow chords)
    # -------------------------------------------------------------
    for bar_idx, chord in enumerate(CHORDS):
        bar_start_sample = int(bar_idx * BAR_DUR * SAMPLE_RATE)
        bar_samples = int(BAR_DUR * SAMPLE_RATE)
        pad_dur = BAR_DUR * 1.3  # Slight overlap with next bar
        num_pad_samples = int(pad_dur * SAMPLE_RATE)
        
        for note in chord:
            freq = midi_to_freq(note)
            detune = 0.6  # Shimmering chorus effect
            
            for i in range(num_pad_samples):
                sample_idx = (bar_start_sample + i) % TOTAL_SAMPLES
                t = i / SAMPLE_RATE
                
                # Smooth swell envelope (0.8s attack, sustained, smooth 1.0s release)
                if t < 0.8:
                    env = (t / 0.8) ** 1.5
                elif t > pad_dur - 1.0:
                    env = max(0.0, (pad_dur - t) / 1.0)
                else:
                    env = 1.0
                
                # Multi-oscillator pad (fundamental + subtle detune + soft 2nd harmonic)
                sig_l = math.sin(2.0 * math.pi * (freq - detune) * t) * 0.7 + \
                        math.sin(2.0 * math.pi * freq * 2.0 * t) * 0.15
                sig_r = math.sin(2.0 * math.pi * (freq + detune) * t) * 0.7 + \
                        math.sin(2.0 * math.pi * freq * 2.0 * t) * 0.15
                
                left[sample_idx] += sig_l * env * 0.055
                right[sample_idx] += sig_r * env * 0.055

    # -------------------------------------------------------------
    # Layer 2: E-Piano / Music Box Arpeggio Chords
    # -------------------------------------------------------------
    for bar_idx, chord in enumerate(CHORDS):
        bar_start_sec = bar_idx * BAR_DUR
        
        # Play arpeggiated notes on beats 0, 1, 2, 3
        for beat in range(4):
            note_idx = beat % len(chord)
            note = chord[note_idx]
            freq = midi_to_freq(note)
            
            note_start_sec = bar_start_sec + beat * BEAT_DUR
            note_start_sample = int(note_start_sec * SAMPLE_RATE)
            note_dur = 2.4  # Sustained decay
            num_note_samples = int(note_dur * SAMPLE_RATE)
            
            # Subtle stereo pan across arpeggio
            pan = 0.5 + 0.25 * math.sin(beat * 1.5)
            
            for i in range(num_note_samples):
                sample_idx = (note_start_sample + i) % TOTAL_SAMPLES
                t = i / SAMPLE_RATE
                
                # Rhodes / music box envelope (quick 3ms attack, warm exponential decay)
                env = math.exp(-t * 1.8) * (t / 0.003 if t < 0.003 else 1.0)
                
                # Warm bell-like timbre (sine + 2nd + 3rd harmonic)
                val = math.sin(2.0 * math.pi * freq * t) + \
                      math.sin(2.0 * math.pi * freq * 2.0 * t) * 0.35 + \
                      math.sin(2.0 * math.pi * freq * 3.0 * t) * 0.12 + \
                      math.sin(2.0 * math.pi * freq * 4.0 * t) * 0.04
                
                amp = val * env * 0.075
                left[sample_idx] += amp * (1.0 - pan)
                right[sample_idx] += amp * pan

    # -------------------------------------------------------------
    # Layer 3: High Chime Melody (Relaxing rain / zen drops)
    # -------------------------------------------------------------
    for beat_time, note, vel in MELODY_EVENTS:
        note_start_sec = beat_time * BEAT_DUR
        if note_start_sec >= TOTAL_DUR:
            continue
        note_start_sample = int(note_start_sec * SAMPLE_RATE)
        freq = midi_to_freq(note)
        chime_dur = 2.8
        num_chime_samples = int(chime_dur * SAMPLE_RATE)
        
        # Alternating gentle stereo panning
        pan = 0.35 if (int(beat_time) % 2 == 0) else 0.65
        
        for i in range(num_chime_samples):
            sample_idx = (note_start_sample + i) % TOTAL_SAMPLES
            t = i / SAMPLE_RATE
            
            env = math.exp(-t * 2.2) * (t / 0.002 if t < 0.002 else 1.0)
            
            # Pure crystalline chime tone
            val = math.sin(2.0 * math.pi * freq * t) + \
                  math.sin(2.0 * math.pi * freq * 2.0 * t) * 0.18 + \
                  math.sin(2.0 * math.pi * freq * 3.0 * t) * 0.06
            
            amp = val * env * vel * 0.08
            left[sample_idx] += amp * (1.0 - pan)
            right[sample_idx] += amp * pan

    # -------------------------------------------------------------
    # Layer 4: Stereo Ambient Delay / Reverb (Seamless Wrap-Around)
    # -------------------------------------------------------------
    delay_samples_l = int(0.340 * SAMPLE_RATE)  # 340ms
    delay_samples_r = int(0.510 * SAMPLE_RATE)  # 510ms
    feedback = 0.28
    
    out_left = list(left)
    out_right = list(right)
    
    # 2 passes of circular delay for lush spatial reverb
    for _ in range(2):
        for i in range(TOTAL_SAMPLES):
            src_l = (i - delay_samples_l) % TOTAL_SAMPLES
            src_r = (i - delay_samples_r) % TOTAL_SAMPLES
            out_left[i] += left[src_l] * feedback
            out_right[i] += right[src_r] * feedback
    
    # -------------------------------------------------------------
    # Mastering: Soft Limiting / Normalization
    # -------------------------------------------------------------
    max_peak = max(max(abs(s) for s in out_left), max(abs(s) for s in out_right))
    print(f"Pre-master peak: {max_peak:.3f}")
    target_peak = 0.88
    gain = target_peak / max_peak if max_peak > 0 else 1.0
    
    final_left = [math.tanh(s * gain) for s in out_left]
    final_right = [math.tanh(s * gain) for s in out_right]
    
    return final_left, final_right


def save_audio(left, right, wav_path, mp3_path):
    os.makedirs(os.path.dirname(wav_path), exist_ok=True)
    
    print(f"Writing 16-bit 44.1kHz Stereo WAV: {wav_path}...")
    with wave.open(wav_path, 'w') as wav:
        wav.setnchannels(2)  # Stereo
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)
        
        raw_bytes = bytearray()
        for l, r in zip(left, right):
            il = int(max(-1.0, min(1.0, l)) * 32767)
            ir = int(max(-1.0, min(1.0, r)) * 32767)
            raw_bytes.extend(struct.pack('<hh', il, ir))
        wav.writeframes(raw_bytes)
        
    print(f"WAV size: {os.path.getsize(wav_path) / (1024*1024):.2f} MB")
    
    # Convert to high-quality MP3 using ffmpeg
    print(f"Converting to MP3 via ffmpeg: {mp3_path}...")
    cmd = [
        "ffmpeg", "-y",
        "-i", wav_path,
        "-codec:a", "libmp3lame",
        "-b:a", "128k",
        mp3_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(mp3_path):
        print(f"MP3 successfully created! Size: {os.path.getsize(mp3_path) / 1024:.1f} KB")
        # Remove intermediate WAV to keep public dir clean
        if os.path.exists(wav_path):
            os.remove(wav_path)
    else:
        print(f"ffmpeg conversion warning: {res.stderr[:200] if res.stderr else 'unknown'}")
        print("Retaining WAV as fallback.")


def main():
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'sounds')
    base_dir = os.path.abspath(base_dir)
    wav_path = os.path.join(base_dir, 'ambient.wav')
    mp3_path = os.path.join(base_dir, 'ambient.mp3')
    
    left, right = render_music()
    save_audio(left, right, wav_path, mp3_path)
    print("Ambient music generation complete!")


if __name__ == '__main__':
    main()
