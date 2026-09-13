"""
Script to generate procedural game sound effects for Infinity Tic-Tac-Toe.
Generates 16-bit 44.1kHz mono WAV files with zero external dependencies (pure Python standard library).
"""

import os
import math
import struct
import wave
import random

SAMPLE_RATE = 44100

def write_wav(filepath: str, samples: list[float]):
    """Writes a list of float audio samples (-1.0 to 1.0) to a 16-bit PCM WAV file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with wave.open(filepath, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        
        raw_bytes = bytearray()
        for s in samples:
            # Soft clamp to avoid harsh digital clipping
            s = max(-1.0, min(1.0, s))
            int_sample = int(s * 32767)
            raw_bytes.extend(struct.pack('<h', int_sample))
        wav_file.writeframes(raw_bytes)
    print(f"Generated: {filepath} ({len(samples)} samples, {len(samples)/SAMPLE_RATE*1000:.1f}ms)")


def generate_move_sound():
    """
    Generates a loud, punchy, tactile piece placement 'thock':
    - Crisp high transient (1600Hz snap + attack click) clearly audible on phone speakers.
    - Resonant mid body sweep (780Hz -> 260Hz) for satisfying tactile weight.
    - High-volume mastering for clear contrast over background music.
    """
    duration = 0.115  # 115ms
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    phase = 0.0
    phase_snap = 0.0
    random.seed(101)
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        
        # 1. Main body pitch sweep (780Hz -> 250Hz)
        f_body = 250.0 + 530.0 * math.exp(-t * 50.0)
        phase += 2.0 * math.pi * f_body / SAMPLE_RATE
        
        # 2. Transient snap pitch (1600Hz -> 600Hz)
        f_snap = 600.0 + 1000.0 * math.exp(-t * 120.0)
        phase_snap += 2.0 * math.pi * f_snap / SAMPLE_RATE
        
        # Body waveform with harmonics for rich timbre
        body = math.sin(phase) + 0.4 * math.sin(2.0 * phase) + 0.15 * math.sin(3.0 * phase)
        snap = math.sin(phase_snap) * 0.5
        
        # Fast 1.5ms attack, punchy decay
        if t < 0.0015:
            env_body = t / 0.0015
        else:
            env_body = math.exp(-(t - 0.0015) * 35.0)
            
        signal = (body + snap) * env_body
        
        # Initial click / wood contact transient (first 6ms)
        if t < 0.006:
            click_env = math.exp(-t * 600.0)
            noise = (random.random() * 2.0 - 1.0) * 0.4
            click_tone = math.sin(2.0 * math.pi * 2400.0 * t) * 0.6
            signal += (click_tone + noise) * click_env
            
        # Punchy soft saturation
        signal = math.tanh(signal * 1.5)
        samples.append(signal)
        
    # Normalize peak to 0.96
    max_peak = max(abs(s) for s in samples) if samples else 1.0
    samples = [s * (0.96 / max_peak) for s in samples]
    return samples


def generate_vanish_sound():
    """
    Generates an ethereal, soft dissolving whoosh for the vanishing piece:
    - Downward frequency sweep with soft breathy dispersion.
    - No sharp attack, smooth fade in and fade out.
    """
    duration = 0.16  # 160ms
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    phase = 0.0
    phase_lfo = 0.0
    random.seed(1337)
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        progress = t / duration
        
        # Frequency gliding down from 340Hz down to 110Hz
        freq = 110.0 + 230.0 * math.exp(-t * 18.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        
        # Gentle tremolo LFO (20Hz)
        phase_lfo += 2.0 * math.pi * 20.0 / SAMPLE_RATE
        lfo = 0.8 + 0.2 * math.sin(phase_lfo)
        
        # Waveform: triangle-like harmonics
        tone = math.sin(phase) + 0.3 * math.sin(3.0 * phase)
        
        # Soft breathy noise layer
        noise = (random.random() * 2.0 - 1.0) * 0.15 * math.exp(-t * 22.0)
        
        # Envelope: 8ms fade-in, smooth exponential decay
        if t < 0.01:
            env = t / 0.01
        else:
            env = math.exp(-(t - 0.01) * 22.0)
            
        signal = (tone * lfo + noise) * env * 0.65
        samples.append(signal)
        
    return samples


def generate_click_sound():
    """
    Generates a tiny, subtle UI tap sound (35ms).
    """
    duration = 0.035
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        freq = 800.0 * math.exp(-t * 70.0)
        tone = math.sin(2.0 * math.pi * freq * t)
        env = math.exp(-t * 120.0)
        samples.append(tone * env * 0.35)
        
    return samples


def main():
    # Base output path in client/public/sounds
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'sounds')
    base_dir = os.path.abspath(base_dir)
    os.makedirs(base_dir, exist_ok=True)
    
    print("Synthesizing game sounds using Python standard library...")
    
    # 1. Piece placement sound
    move_samples = generate_move_sound()
    write_wav(os.path.join(base_dir, 'move.wav'), move_samples)
    
    # 2. UI click sound
    click_samples = generate_click_sound()
    write_wav(os.path.join(base_dir, 'click.wav'), click_samples)
    
    print("All sounds generated successfully!")


if __name__ == '__main__':
    main()
