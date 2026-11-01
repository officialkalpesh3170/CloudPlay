/**
 * Cyber 2048 Procedural Sound Synthesizer
 *
 * Web Audio API synthesizer for satisfying audio feedback:
 * - Slide swoosh
 * - Merge chime with ascending pitches based on merged tile value
 * - Game over tone
 * - Victory celebration fanfare
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  playSlide() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext suppressed or not ready
    }
  }

  playMerge(tileValue) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Frequencies ascending with powers of 2
      const baseFreqs = {
        4: 261.63,   // C4
        8: 329.63,   // E4
        16: 392.0,   // G4
        32: 523.25,  // C5
        64: 659.25,  // E5
        128: 783.99, // G5
        256: 1046.5, // C6
        512: 1318.5, // E6
        1024: 1567.98,// G6
        2048: 2093.0, // C7
        4096: 2637.0, // E7
      };

      const freq = baseFreqs[tileValue] || (260 + Math.log2(tileValue || 2) * 80);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = tileValue >= 128 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.12);

      const volume = Math.min(0.12, 0.04 + (Math.log2(tileValue) / 11) * 0.08);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch {
      // Ignore audio failure
    }
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch {
      // Ignore audio failure
    }
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [329.63, 293.66, 261.63, 220.0]; // E4, D4, C4, A3 descending

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.1;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {
      // Ignore audio failure
    }
  }
}

export const sound = new SoundEngine();
