/**
 * AK Racing - Electronic Synthwave Paddock Radio Synthesizer
 * 100% Web Audio API multi-oscillator cyberpunk arpeggiator for garage ambiance.
 */
export class SynthwaveRadio {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.isPlaying = false;
    this.timerId = null;
    this.notes = [110, 130.81, 146.83, 164.81, 196.00, 220.00]; // A2 minor pentatonic
    this.step = 0;
  }

  toggle() {
    this.isPlaying ? this.stop() : this.start();
  }

  start() {
    if (this.isPlaying || !this.ctx) return;
    this.isPlaying = true;
    this.timerId = setInterval(() => this.tick(), 140);
    console.log('[Synthwave] Paddock radio activated.');
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    console.log('[Synthwave] Paddock radio stopped.');
  }

  tick() {
    if (!this.isPlaying || !this.ctx) return;
    const freq = this.notes[this.step % this.notes.length];
    this.step++;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }
}
