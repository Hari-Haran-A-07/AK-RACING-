/**
 * Ajith Kumar Racing - Straight-Cut Transmission Gear Whine Simulator
 */
class GearWhineSynthesizer {
    constructor(audioCtx) {
        this.ctx = audioCtx;
        this.osc = null;
        this.gain = null;
    }

    start() {
        if (!this.ctx) return;
        this.osc = this.ctx.createOscillator();
        this.gain = this.ctx.createGain();
        this.osc.type = 'triangle';
        this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.osc.connect(this.gain);
        this.gain.connect(this.ctx.destination);
    }

    updateSpeed(speedKmh, gear) {
        if (!this.osc || !this.gain) return;
        const freq = 400 + (speedKmh * 8.5) + (gear * 60);
        const volume = Math.min(0.18, (speedKmh / 350) * 0.18);
        this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.04);
        this.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.04);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GearWhineSynthesizer };
}
