/**
 * AK Racing - Modularized Engine Audio Synthesis Matrix
 * Multi-layer procedural synthesis of 120° V6 Twin-Turbo + MGU-K Hybrid Powertrain.
 */
export class EngineSynthesizer {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || !this.ctx) return;
    
    // Combustion Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Primary V6 Cylinder firing oscillator
    this.v6Osc = this.ctx.createOscillator();
    this.v6Osc.type = 'sawtooth';
    this.v6Gain = this.ctx.createGain();
    this.v6Osc.connect(this.v6Gain);
    this.v6Gain.connect(this.masterGain);

    // MGU-K Hybrid electric whine
    this.mguOsc = this.ctx.createOscillator();
    this.mguOsc.type = 'triangle';
    this.mguGain = this.ctx.createGain();
    this.mguOsc.connect(this.mguGain);
    this.mguGain.connect(this.masterGain);

    // Filter Node
    this.lowpass = this.ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 1800;
    this.masterGain.connect(this.lowpass);

    this.v6Osc.start();
    this.mguOsc.start();
    this.isInitialized = true;
  }

  updateRPM(rpm, throttle, hybridBoost) {
    if (!this.isInitialized) return;
    const baseFreq = (rpm / 60) * 3; // 6-cylinder 4-stroke = 3 pulses per rev
    this.v6Osc.frequency.setTargetAtTime(Math.max(25, baseFreq), this.ctx.currentTime, 0.04);
    this.v6Gain.gain.setTargetAtTime(0.15 + (throttle * 0.35), this.ctx.currentTime, 0.04);

    // MGU-K Electric whine (increases with speed and hybrid deployment)
    const mguFreq = 1200 + (rpm * 0.8) + (hybridBoost ? 1500 : 0);
    this.mguOsc.frequency.setTargetAtTime(mguFreq, this.ctx.currentTime, 0.05);
    this.mguGain.gain.setTargetAtTime(hybridBoost ? 0.25 : (throttle * 0.08), this.ctx.currentTime, 0.05);
  }
}
