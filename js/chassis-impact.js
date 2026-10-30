/**
 * Ajith Kumar Racing - Curb Impact & Chassis Rumble Sound Generator
 */
class ChassisImpactAudio {
    constructor(audioCtx) {
        this.ctx = audioCtx;
    }

    playCurbStrike(severity = 0.8) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        gain.gain.setValueAtTime(0.3 * severity, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChassisImpactAudio };
}
