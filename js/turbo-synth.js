/**
 * Ajith Kumar Racing - Turbocharger Spool & Blow-Off Wastegate Synthesizer
 */
class TurboSynthesizer {
    constructor(audioCtx) {
        this.ctx = audioCtx;
        this.oscillator = null;
        this.gainNode = null;
    }

    init() {
        if (!this.ctx) return;
        this.oscillator = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();
        this.oscillator.type = 'sine';
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.oscillator.connect(this.gainNode);
    }

    updateBoost(boostBar) {
        if (!this.oscillator || !this.gainNode) return;
        const freq = 1200 + (boostBar * 2400); // 1.2kHz to 6.8kHz whistle
        const gain = Math.min(0.25, boostBar * 0.12);
        this.oscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
        this.gainNode.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.05);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TurboSynthesizer };
}
