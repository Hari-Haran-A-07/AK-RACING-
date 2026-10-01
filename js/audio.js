/**
 * ============================================================================
 * AJITH KUMAR RACING - PROCEDURAL GT3 ENGINE SOUND SYNTHESIZER
 * High-Fidelity Web Audio API Simulation (No External Audio Files Required)
 * ============================================================================
 */

class GTAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isRunning = false;
    this.isMuted = false;
    this.masterVolume = 0.85;

    // Engine Acoustic State
    this.rpm = 850; // Idle RPM
    this.targetRpm = 850;
    this.throttle = 0; // 0.0 to 1.0
    this.gear = 0; // 0=N, 1..6
    this.speed = 0; // km/h
    this.isRevLimiting = false;
    this.profile = 'gt3'; // 'gt3', 'v8biturbo', 'v10screamer'

    // Nodes
    this.masterGain = null;
    this.engineGain = null;
    this.gearboxGain = null;
    this.turboGain = null;
    
    // Oscillators & Filters
    this.cylinders = [];
    this.subBassOsc = null;
    this.gearboxOsc = null;
    this.turboOsc = null;
    this.manifoldFilter1 = null;
    this.manifoldFilter2 = null;
    this.exhaustFilter = null;
    this.gearboxFilter = null;
    this.turboFilter = null;

    // Backfire & BOV timers
    this.lastThrottle = 0;
    this.lastRpm = 850;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Engine Bus Gain
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Dual Manifold Formant Filters (simulates intake runner & chamber resonance)
      this.manifoldFilter1 = this.ctx.createBiquadFilter();
      this.manifoldFilter1.type = 'bandpass';
      this.manifoldFilter1.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.manifoldFilter1.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.manifoldFilter2 = this.ctx.createBiquadFilter();
      this.manifoldFilter2.type = 'peaking';
      this.manifoldFilter2.frequency.setValueAtTime(1400, this.ctx.currentTime);
      this.manifoldFilter2.gain.setValueAtTime(6.0, this.ctx.currentTime);
      this.manifoldFilter2.Q.setValueAtTime(2.0, this.ctx.currentTime);

      this.exhaustFilter = this.ctx.createBiquadFilter();
      this.exhaustFilter.type = 'lowpass';
      this.exhaustFilter.frequency.setValueAtTime(4500, this.ctx.currentTime);

      this.manifoldFilter1.connect(this.manifoldFilter2);
      this.manifoldFilter2.connect(this.exhaustFilter);
      this.exhaustFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      // Sub Bass Rumble Oscillator (Deep 60-120Hz exhaust pulse)
      this.subBassOsc = this.ctx.createOscillator();
      this.subBassOsc.type = 'sine';
      this.subBassOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      
      const subBassGain = this.ctx.createGain();
      subBassGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.subBassOsc.connect(subBassGain);
      subBassGain.connect(this.engineGain);
      this.subBassOsc.start();

      // Cylinder Oscillators (Fundamental + Harmonics for Flat-6/V8 GT3 Roar)
      const cylinderHarmonics = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
      const harmonicTypes = ['sawtooth', 'triangle', 'sawtooth', 'square', 'sawtooth', 'triangle'];
      const harmonicGains = [0.45, 0.35, 0.28, 0.18, 0.12, 0.08];

      this.cylinders = cylinderHarmonics.map((mult, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = harmonicTypes[idx];
        osc.frequency.setValueAtTime(mult * 30, this.ctx.currentTime);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(harmonicGains[idx], this.ctx.currentTime);

        osc.connect(gainNode);
        gainNode.connect(this.manifoldFilter1);
        osc.start();
        return { osc, gainNode, mult, baseGain: harmonicGains[idx] };
      });

      // Straight-Cut Sequential Transmission Whine
      this.gearboxGain = this.ctx.createGain();
      this.gearboxGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.gearboxOsc = this.ctx.createOscillator();
      this.gearboxOsc.type = 'sawtooth';
      this.gearboxOsc.frequency.setValueAtTime(200, this.ctx.currentTime);

      this.gearboxFilter = this.ctx.createBiquadFilter();
      this.gearboxFilter.type = 'bandpass';
      this.gearboxFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      this.gearboxFilter.Q.setValueAtTime(5.0, this.ctx.currentTime);

      this.gearboxOsc.connect(this.gearboxFilter);
      this.gearboxFilter.connect(this.gearboxGain);
      this.gearboxGain.connect(this.masterGain);
      this.gearboxOsc.start();

      // Turbo Spool Whine
      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(800, this.ctx.currentTime);

      this.turboFilter = this.ctx.createBiquadFilter();
      this.turboFilter.type = 'highpass';
      this.turboFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.turboOsc.connect(this.turboFilter);
      this.turboFilter.connect(this.turboGain);
      this.turboGain.connect(this.masterGain);
      this.turboOsc.start();

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio initialization pending user gesture:", e);
    }
  }

  resumeContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startEngine() {
    this.resumeContext();
    if (!this.isInitialized) return;

    this.playStarterCrank();
    setTimeout(() => {
      this.isRunning = true;
      if (this.engineGain) {
        this.engineGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.2);
      }
    }, 450);
  }

  stopEngine() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    }
    if (this.gearboxGain) {
      this.gearboxGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
    if (this.turboGain) {
      this.turboGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }

  toggleIgnition() {
    if (this.isRunning) {
      this.stopEngine();
      return false;
    } else {
      this.startEngine();
      return true;
    }
  }

  toggleMute() {
    this.resumeContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  playStarterCrank() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Starter motor electric whir
    const starterOsc = this.ctx.createOscillator();
    const starterGain = this.ctx.createGain();
    starterOsc.type = 'sawtooth';
    starterOsc.frequency.setValueAtTime(140, now);
    starterOsc.frequency.exponentialRampToValueAtTime(220, now + 0.4);

    starterGain.gain.setValueAtTime(0.2, now);
    starterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    starterOsc.connect(starterGain);
    starterGain.connect(this.masterGain);

    starterOsc.start(now);
    starterOsc.stop(now + 0.45);

    // Initial combustion flare catch pop
    setTimeout(() => {
      this.triggerBackfire(0.6);
    }, 420);
  }

  /**
   * Update Engine Dynamics in Real-time Frame
   * @param {number} rpm - Current RPM (800 to 9500)
   * @param {number} throttle - Throttle position (0.0 to 1.0)
   * @param {number} speed - Velocity in km/h
   * @param {number} gear - Current gear (0..6)
   */
  update(rpm, throttle, speed = 0, gear = 0) {
    if (!this.isRunning || !this.isInitialized || !this.ctx) return;

    this.rpm = rpm;
    this.throttle = throttle;
    this.speed = speed;
    this.gear = gear;

    const now = this.ctx.currentTime;

    // Calculate base firing frequency:
    // GT3 Flat-6: 3 firings per rev. At 9000 RPM => 9000 / 60 * 3 = 450 Hz base firing freq
    let cylinderMultiplier = 3.0; // Flat-6
    if (this.profile === 'v8biturbo') cylinderMultiplier = 4.0;
    if (this.profile === 'v10screamer') cylinderMultiplier = 5.0;

    const baseFreq = (this.rpm / 60) * cylinderMultiplier;

    // Update cylinder oscillators
    this.cylinders.forEach(({ osc, gainNode, mult, baseGain }) => {
      const targetFreq = Math.max(20, baseFreq * mult * 0.5);
      osc.frequency.setTargetAtTime(targetFreq, now, 0.03);

      // Modulate harmonic loudness with throttle
      const throttleBoost = 1.0 + this.throttle * 0.8;
      gainNode.gain.setTargetAtTime(baseGain * throttleBoost, now, 0.04);
    });

    // Sub-bass frequency
    if (this.subBassOsc) {
      this.subBassOsc.frequency.setTargetAtTime(Math.max(35, (this.rpm / 60) * 1.5), now, 0.04);
    }

    // Dynamic Filter sweeps with RPM & Throttle load
    if (this.manifoldFilter1) {
      const f1 = 200 + (this.rpm / 9000) * 1200 + this.throttle * 400;
      this.manifoldFilter1.frequency.setTargetAtTime(f1, now, 0.04);
    }

    if (this.manifoldFilter2) {
      const f2 = 800 + (this.rpm / 9000) * 3200 + this.throttle * 800;
      this.manifoldFilter2.frequency.setTargetAtTime(f2, now, 0.04);
    }

    if (this.exhaustFilter) {
      const fExhaust = 1800 + (this.rpm / 9000) * 5500 + this.throttle * 2500;
      this.exhaustFilter.frequency.setTargetAtTime(fExhaust, now, 0.03);
    }

    // Straight-cut Gearbox Whine (scales with wheel speed & gear)
    if (this.gearboxOsc && this.gearboxGain) {
      if (this.gear > 0 && this.speed > 5) {
        const gbFreq = 300 + (this.speed * 18) + (this.gear * 80);
        this.gearboxOsc.frequency.setTargetAtTime(gbFreq, now, 0.05);
        if (this.gearboxFilter) {
          this.gearboxFilter.frequency.setTargetAtTime(gbFreq, now, 0.05);
        }
        const gbVol = Math.min(0.25, (this.speed / 320) * 0.22 + (this.throttle * 0.08));
        this.gearboxGain.gain.setTargetAtTime(gbVol, now, 0.05);
      } else {
        this.gearboxGain.gain.setTargetAtTime(0, now, 0.1);
      }
    }

    // Turbo Spool Whine (builds under high throttle & high RPM)
    if (this.turboOsc && this.turboGain) {
      if (this.throttle > 0.3 && this.rpm > 3500) {
        const turboFreq = 1800 + (this.rpm / 9000) * 4500 + this.throttle * 1200;
        this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.05);
        const turboVol = Math.min(0.2, (this.throttle * 0.15) * (this.rpm / 9000));
        this.turboGain.gain.setTargetAtTime(turboVol, now, 0.08);
      } else {
        this.turboGain.gain.setTargetAtTime(0, now, 0.15);
      }
    }

    // Automatic Backfire detection on sudden throttle lift-off
    if (this.lastThrottle > 0.7 && this.throttle < 0.2 && this.rpm > 5500) {
      this.triggerBackfire(0.85);
      this.triggerBOVFlutter();
    }

    // Rev Limiter Ignition Cutting (at 9,300+ RPM)
    if (this.rpm >= 9300 && this.throttle > 0.8) {
      if (!this.isRevLimiting) {
        this.isRevLimiting = true;
        this.triggerRevLimiterPop();
      }
    } else {
      this.isRevLimiting = false;
    }

    this.lastThrottle = this.throttle;
    this.lastRpm = this.rpm;
  }

  /**
   * Procedural Exhaust Backfire & Pop
   * Simulates unburnt fuel igniting inside glowing red-hot exhaust headers
   */
  triggerBackfire(intensity = 0.8) {
    if (!this.isRunning || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Burst of shaped noise + low-end thud
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Noise burst with rapid decay
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(320, now);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);

    // Deep sub-pressure shockwave
    const subPop = this.ctx.createOscillator();
    const subPopGain = this.ctx.createGain();
    subPop.type = 'sine';
    subPop.frequency.setValueAtTime(160, now);
    subPop.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    subPopGain.gain.setValueAtTime(0.8 * intensity, now);
    subPopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    subPop.connect(subPopGain);
    subPopGain.connect(this.masterGain);

    subPop.start(now);
    subPop.stop(now + 0.14);
  }

  /**
   * Procedural Turbo Blow-off Valve (BOV) Flutter ("stututu")
   */
  triggerBOVFlutter() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const flutterCount = 4;
    for (let i = 0; i < flutterCount; i++) {
      const flutterTime = now + (i * 0.055);
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.25));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400 + i * 200, flutterTime);
      filter.Q.setValueAtTime(4.0, flutterTime);

      const gain = this.ctx.createGain();
      const vol = 0.35 * Math.pow(0.7, i);
      gain.gain.setValueAtTime(vol, flutterTime);
      gain.gain.exponentialRampToValueAtTime(0.001, flutterTime + 0.05);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(flutterTime);
    }
  }

  /**
   * Rev Limiter Staccato Pop ("bap-bap-bap")
   */
  triggerRevLimiterPop() {
    this.triggerBackfire(0.65);
    setTimeout(() => {
      if (this.isRevLimiting) {
        this.triggerBackfire(0.7);
      }
    }, 90);
  }

  setProfile(profileName) {
    this.profile = profileName;
  }
}

// Export single global instance
window.gtAudio = new GTAudioEngine();
