/**
 * Ajith Kumar Racing - Exhaust Backfire & Anti-lag Audio Synthesizer
 */
class ExhaustBackfireSynthesizer {
    constructor(audioCtx) {
        this.ctx = audioCtx;
    }

    triggerBackfire(rpm, intensity = 1.0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + (rpm * 0.15), now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4 * intensity, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(now);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExhaustBackfireSynthesizer };
}
