/**
 * AK Racing - Paddock & Pit Lane Procedural Ambient Sound Generator
 * Generates realistic pneumatic wheel gun impacts, pit crew chatter, and pit speed limit chimes.
 */
export class PaddockAudioGenerator {
  constructor(audioContext) {
    this.ctx = audioContext;
  }

  playWheelGunImpact() {
    if (!this.ctx) return;
    // Rapid pneumatic impact clicks (simulating 3500 RPM torque gun)
    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140 + Math.random() * 60, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }, i * 35);
    }
  }

  playPitLimiterBeep() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }
}
