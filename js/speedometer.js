/**
 * ============================================================================
 * AJITH KUMAR RACING - FIRE SPEEDOMETER & TELEMETRY AUTOMATION SYSTEM
 * Particle Fire Simulation, Circular GT3 HUD & Real-time Dyno Automation
 * ============================================================================
 */

class FireSpeedometer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Dynamic Resolution
    this.width = 650;
    this.height = 650;
    this.setupCanvasResolution();

    // Vehicle Telemetry State
    this.speed = 0;           // Current Speed in km/h (0 to 360)
    this.targetSpeed = 0;
    this.rpm = 850;           // Current RPM (800 to 9500)
    this.targetRpm = 850;
    this.gear = 0;            // 0=N, 1=1st, ... 6=6th
    this.throttle = 0;        // 0.0 to 1.0
    this.brake = 0;           // 0.0 to 1.0
    this.boost = 0;           // Turbo Boost in Bar (0.0 to 2.4)
    this.exhaustTemp = 420;   // °C (350 to 950)
    this.gForce = 0.0;
    this.nitrousActive = false;
    this.nitrousCharge = 100;

    // Gear Ratios & Top Speeds per gear (km/h)
    this.gearMaxSpeeds = [0, 85, 142, 198, 252, 298, 345];
    this.gearMinRpms = [850, 1000, 5800, 6200, 6600, 7000, 7400];

    // Automation Modes
    this.autoMode = 'manual'; // 'manual', 'dyno', 'hotlap'
    this.dynoStage = 0;       // Step in dyno run
    this.dynoTimer = 0;
    this.hotlapStage = 0;
    this.hotlapTimer = 0;

    // Fire Particle System
    this.particles = [];
    this.maxParticles = 450;
    this.fireIntensity = 1.0;

    // Shift Light DOM Elements
    this.shiftLeds = Array.from(document.querySelectorAll('#shift-light-array .shift-led'));

    // Bind event listeners
    window.addEventListener('resize', () => this.setupCanvasResolution());

    // Start render loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupCanvasResolution() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 600;
    this.height = rect.height || 600;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setThrottle(val) {
    this.throttle = Math.max(0, Math.min(1, val));
    if (this.throttle > 0 && this.autoMode !== 'manual') {
      this.autoMode = 'manual';
    }
  }

  setBrake(val) {
    this.brake = Math.max(0, Math.min(1, val));
  }

  shiftUp() {
    if (this.gear < 6) {
      this.gear++;
      this.triggerShiftDynamics();
    }
  }

  shiftDown() {
    if (this.gear > 1) {
      this.gear--;
      this.triggerShiftDynamics();
    } else if (this.gear === 1) {
      this.gear = 0; // Neutral
    }
  }

  triggerShiftDynamics() {
    // Drop RPM temporarily to simulate clutch engagement
    if (window.gtAudio) {
      window.gtAudio.triggerBackfire(0.8);
      window.gtAudio.triggerBOVFlutter();
    }
    this.spawnFireExplosion(25);
    this.rpm = Math.max(850, this.rpm - 1800);
  }

  triggerNitrous() {
    if (this.nitrousCharge > 5) {
      this.nitrousActive = true;
      this.spawnFireExplosion(35, true);
      setTimeout(() => { this.nitrousActive = false; }, 2500);
    }
  }

  triggerLaunchControl() {
    this.gear = 1;
    this.throttle = 1.0;
    this.targetRpm = 5800; // Hold at launch RPM
    this.spawnFireExplosion(40);
    if (window.gtAudio) {
      window.gtAudio.triggerRevLimiterPop();
    }
    setTimeout(() => {
      // Dump clutch & launch!
      this.speed += 20;
    }, 1200);
  }

  startAutoDynoRun() {
    this.autoMode = 'dyno';
    this.dynoStage = 1;
    this.dynoTimer = 0;
    this.gear = 1;
    this.speed = 0;
    this.rpm = 1200;
    if (window.gtAudio && !window.gtAudio.isRunning) {
      window.gtAudio.startEngine();
    }
  }

  startHotLapSim() {
    this.autoMode = 'hotlap';
    this.hotlapStage = 0;
    this.hotlapTimer = 0;
    this.gear = 2;
    this.speed = 90;
    this.rpm = 5500;
    if (window.gtAudio && !window.gtAudio.isRunning) {
      window.gtAudio.startEngine();
    }
  }

  resetTelemetry() {
    this.autoMode = 'manual';
    this.speed = 0;
    this.targetSpeed = 0;
    this.rpm = 850;
    this.targetRpm = 850;
    this.gear = 0;
    this.throttle = 0;
    this.brake = 0;
    this.boost = 0;
    this.dynoStage = 0;
  }

  /**
   * Physics & Automation State Updates
   */
  updatePhysics(deltaTime) {
    const dt = Math.min(deltaTime, 0.1);

    // 1. Handle Automation Modes
    if (this.autoMode === 'dyno') {
      this.updateDynoAutomation(dt);
    } else if (this.autoMode === 'hotlap') {
      this.updateHotLapAutomation(dt);
    } else {
      // Manual Physics Model
      this.updateManualPhysics(dt);
    }

    // 2. Smooth Interpolation for Speed and RPM
    this.speed += (this.targetSpeed - this.speed) * (dt * 6.0);
    this.rpm += (this.targetRpm - this.rpm) * (dt * 10.0);

    // 3. Boost calculation
    const targetBoost = (this.throttle * 1.8) + (this.nitrousActive ? 0.6 : 0) * (this.rpm / 9000);
    this.boost += (targetBoost - this.boost) * (dt * 5.0);

    // 4. Exhaust Temp
    const targetTemp = 400 + (this.rpm / 9500) * 480 + (this.throttle * 90);
    this.exhaustTemp += (targetTemp - this.exhaustTemp) * (dt * 1.5);

    // 5. G-Force
    const accelG = ((this.targetSpeed - this.speed) / 10) * 0.8;
    this.gForce = Math.max(-1.5, Math.min(2.4, 0.2 + accelG + (this.speed > 100 ? (Math.sin(Date.now() * 0.003) * 0.3) : 0)));

    // 6. Nitrous Consumption
    if (this.nitrousActive && this.nitrousCharge > 0) {
      this.nitrousCharge = Math.max(0, this.nitrousCharge - dt * 25);
    } else if (!this.nitrousActive && this.nitrousCharge < 100) {
      this.nitrousCharge = Math.min(100, this.nitrousCharge + dt * 4); // Slow refill
    }

    // 7. Synchronize Audio Engine
    if (window.gtAudio && window.gtAudio.isRunning) {
      window.gtAudio.update(this.rpm, this.throttle, this.speed, this.gear);
    }

    // 8. Update Fire Particles
    this.updateParticles(dt);

    // 9. Update UI DOM Elements
    this.updateDOM();
  }

  updateManualPhysics(dt) {
    if (this.gear === 0) {
      // Neutral: Freely revs engine
      if (this.throttle > 0.05) {
        this.targetRpm = 850 + this.throttle * (9400 - 850);
      } else {
        this.targetRpm = 850;
      }
      this.targetSpeed = Math.max(0, this.speed - (dt * 15)); // Coasting down
    } else {
      // In Gear (1..6)
      const maxGearSpeed = this.gearMaxSpeeds[this.gear];
      const minGearSpeed = this.gear > 1 ? this.gearMaxSpeeds[this.gear - 1] * 0.65 : 0;

      if (this.throttle > 0.05) {
        const accelerationRate = (42 - this.gear * 3.5) * (this.nitrousActive ? 1.7 : 1.0) * this.throttle;
        this.targetSpeed = Math.min(maxGearSpeed, this.speed + (accelerationRate * dt));

        // RPM is tied to speed in gear
        const speedRatio = Math.max(0, (this.speed - minGearSpeed) / (maxGearSpeed - minGearSpeed));
        this.targetRpm = Math.min(9450, 4200 + speedRatio * 5200);

        // Auto shift assistance if user revs too high in manual
        if (this.rpm > 9300 && this.gear < 6) {
          this.shiftUp();
        }
      } else if (this.brake > 0.05) {
        // Braking
        this.targetSpeed = Math.max(0, this.speed - (this.brake * 95 * dt));
        this.targetRpm = Math.max(850, this.rpm - (this.brake * 3500 * dt));
        if (this.speed < minGearSpeed && this.gear > 1) {
          this.shiftDown();
        }
      } else {
        // Natural Engine Drag Coasting
        this.targetSpeed = Math.max(0, this.speed - (dt * 12));
        this.targetRpm = Math.max(850, this.rpm - (dt * 1200));
      }
    }
  }

  updateDynoAutomation(dt) {
    this.dynoTimer += dt;
    this.throttle = 1.0; // Flat-out throttle

    const gearStages = [
      { gear: 1, targetSpeed: 82, rpmTarget: 9100, duration: 1.8 },
      { gear: 2, targetSpeed: 140, rpmTarget: 9200, duration: 2.2 },
      { gear: 3, targetSpeed: 195, rpmTarget: 9250, duration: 2.5 },
      { gear: 4, targetSpeed: 248, rpmTarget: 9300, duration: 2.8 },
      { gear: 5, targetSpeed: 295, rpmTarget: 9350, duration: 3.2 },
      { gear: 6, targetSpeed: 338, rpmTarget: 9400, duration: 4.5 }
    ];

    const currentStageInfo = gearStages[this.dynoStage - 1];

    if (currentStageInfo) {
      this.gear = currentStageInfo.gear;
      const progress = Math.min(1.0, this.dynoTimer / currentStageInfo.duration);
      
      const prevSpeed = this.dynoStage > 1 ? gearStages[this.dynoStage - 2].targetSpeed : 0;
      this.targetSpeed = prevSpeed + (currentStageInfo.targetSpeed - prevSpeed) * progress;
      
      const startRpm = this.dynoStage === 1 ? 2500 : 6200;
      this.targetRpm = startRpm + (currentStageInfo.rpmTarget - startRpm) * Math.pow(progress, 0.85);

      // Fire bursts on high RPM
      if (this.targetRpm > 8500 && Math.random() < 0.3) {
        this.spawnFireExplosion(6);
      }

      // Shift to next gear
      if (this.dynoTimer >= currentStageInfo.duration) {
        this.dynoTimer = 0;
        this.dynoStage++;
        if (this.dynoStage <= 6) {
          this.triggerShiftDynamics();
        } else {
          // Top speed hold & flame celebration
          this.spawnFireExplosion(50, true);
        }
      }
    } else if (this.dynoStage > 6) {
      // Top Speed Hold / Dyno Complete
      this.targetSpeed = 340 + Math.sin(Date.now() * 0.005) * 2;
      this.targetRpm = 9350;
      if (Math.random() < 0.4) this.spawnFireExplosion(8);
      
      // Auto loop after 6 seconds of top speed
      if (this.dynoTimer > 6.0) {
        this.resetTelemetry();
        setTimeout(() => this.startAutoDynoRun(), 1500);
      }
    }
  }

  updateHotLapAutomation(dt) {
    this.hotlapTimer += dt;
    
    // Dubai Autodrome Hot Lap simulation cycle (Straights, Heavy Braking, Apex, Exit)
    const lapCycle = [
      { name: "MAIN STRAIGHT BLAST", duration: 4.0, throttle: 1.0, brake: 0, gear: 5, targetSpeed: 285, targetRpm: 9200 },
      { name: "TURN 1 HEAVY BRAKING", duration: 2.0, throttle: 0.0, brake: 0.9, gear: 2, targetSpeed: 105, targetRpm: 6000 },
      { name: "CHICANE APEX ACCEL", duration: 3.5, throttle: 0.85, brake: 0, gear: 3, targetSpeed: 180, targetRpm: 8800 },
      { name: "FAST SWEEPER", duration: 3.0, throttle: 0.95, brake: 0, gear: 4, targetSpeed: 235, targetRpm: 9000 }
    ];

    const currentStep = lapCycle[this.hotlapStage % lapCycle.length];
    this.throttle = currentStep.throttle;
    this.brake = currentStep.brake;
    this.gear = currentStep.gear;
    this.targetSpeed = currentStep.targetSpeed;
    this.targetRpm = currentStep.targetRpm;

    if (this.hotlapTimer >= currentStep.duration) {
      this.hotlapTimer = 0;
      this.hotlapStage++;
      this.triggerShiftDynamics();
    }
  }

  /**
   * Fire Particle Physics System
   */
  spawnFireExplosion(count = 20, isNitrous = false) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 6.0;
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 40,
        y: this.height / 2 + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 10 + Math.random() * 22,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.03,
        isNitrous: isNitrous || this.nitrousActive,
        isSpark: Math.random() < 0.35
      });
    }
  }

  updateParticles(dt) {
    // Generate new flame particles based on RPM & Speed along the needle & dial perimeter
    const flameRate = Math.floor((this.rpm / 9500) * 12 + (this.throttle * 8));
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = this.width * 0.38;

    // Angle of current needle
    // Speedometer arc: from 135deg (bottom-left) to 405deg (bottom-right)
    const angleRange = 270 * (Math.PI / 180);
    const startAngle = 135 * (Math.PI / 180);
    const currentAngle = startAngle + (this.speed / 360) * angleRange;

    // Needle tip position
    const needleTipX = cx + Math.cos(currentAngle) * (radius * 0.88);
    const needleTipY = cy + Math.sin(currentAngle) * (radius * 0.88);

    for (let i = 0; i < flameRate; i++) {
      if (this.particles.length < this.maxParticles) {
        // Emit from needle tip or dial rim
        const fromNeedle = Math.random() < 0.6;
        const spawnX = fromNeedle ? needleTipX : cx + Math.cos(startAngle + Math.random() * ((this.speed / 360) * angleRange)) * radius;
        const spawnY = fromNeedle ? needleTipY : cy + Math.sin(startAngle + Math.random() * ((this.speed / 360) * angleRange)) * radius;

        const pAngle = currentAngle + (Math.random() - 0.5) * 0.8;
        const pSpeed = (2.0 + Math.random() * 5.0) * (this.rpm / 6000);

        this.particles.push({
          x: spawnX + (Math.random() - 0.5) * 12,
          y: spawnY + (Math.random() - 0.5) * 12,
          vx: Math.cos(pAngle) * pSpeed * 0.5 + (Math.random() - 0.5) * 2.0,
          vy: Math.sin(pAngle) * pSpeed * 0.5 - (1.5 + Math.random() * 3.5), // Buoyancy upward
          size: 8 + Math.random() * 18,
          life: 1.0,
          decay: 0.02 + Math.random() * 0.035,
          isNitrous: this.nitrousActive,
          isSpark: Math.random() < 0.3
        });
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.05; // Thermal rising
      p.size = Math.max(0.5, p.size * 0.96);
      p.life -= p.decay;

      if (p.life <= 0 || p.size <= 0.5) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Main Canvas Render Frame
   */
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w * 0.38;

    ctx.clearRect(0, 0, w, h);

    // Speedometer Arc Angles
    const startAngle = 135 * (Math.PI / 180);
    const endAngle = 405 * (Math.PI / 180);
    const totalAngle = endAngle - startAngle;

    // 1. Draw Background Outer Glow Dial
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
    const outerGrad = ctx.createRadialGradient(cx, cy, radius - 30, cx, cy, radius + 30);
    outerGrad.addColorStop(0, 'rgba(10, 10, 15, 0.9)');
    outerGrad.addColorStop(0.85, 'rgba(25, 20, 15, 0.4)');
    outerGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
    ctx.fillStyle = outerGrad;
    ctx.fill();
    ctx.restore();

    // 2. Base Dial Track Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 3. Dynamic Active Speed & Flame Arc
    const currentSpeedAngle = startAngle + (Math.min(360, this.speed) / 360) * totalAngle;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, currentSpeedAngle);
    
    // Gradient changes to Cyan/Purple in Nitrous Mode or Red/Orange in Normal
    const arcGrad = ctx.createLinearGradient(0, h, w, 0);
    if (this.nitrousActive) {
      arcGrad.addColorStop(0, '#06b6d4');
      arcGrad.addColorStop(0.6, '#3b82f6');
      arcGrad.addColorStop(1, '#a855f7');
    } else {
      arcGrad.addColorStop(0, '#f59e0b');
      arcGrad.addColorStop(0.5, '#ea580c');
      arcGrad.addColorStop(0.85, '#dc2626');
      arcGrad.addColorStop(1, '#ff0055');
    }
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.shadowColor = this.nitrousActive ? 'rgba(6, 182, 212, 0.9)' : 'rgba(234, 88, 12, 0.9)';
    ctx.shadowBlur = 24;
    ctx.stroke();
    ctx.restore();

    // 4. Secondary RPM Inner Ring (Inner Arc)
    const rpmRadius = radius - 32;
    const currentRpmAngle = startAngle + (Math.min(9500, this.rpm) / 9500) * totalAngle;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rpmRadius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, rpmRadius, startAngle, currentRpmAngle);
    ctx.strokeStyle = this.rpm > 8500 ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 6;
    ctx.shadowColor = this.rpm > 8500 ? '#ef4444' : '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // 5. Dial Tick Marks & Graduation Numbers
    const numTicks = 36; // Every 10 km/h
    for (let i = 0; i <= numTicks; i++) {
      const tickAngle = startAngle + (i / numTicks) * totalAngle;
      const isMajor = i % 4 === 0; // Every 40 km/h
      const tickSpeed = i * 10;
      const isActive = tickSpeed <= this.speed;

      const innerR = radius - (isMajor ? 20 : 10);
      const outerR = radius - 4;

      const x1 = cx + Math.cos(tickAngle) * innerR;
      const y1 = cy + Math.sin(tickAngle) * innerR;
      const x2 = cx + Math.cos(tickAngle) * outerR;
      const y2 = cy + Math.sin(tickAngle) * outerR;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isActive 
        ? (this.nitrousActive ? '#06b6d4' : (tickSpeed > 280 ? '#ef4444' : '#fbbf24'))
        : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isMajor ? 3.5 : 1.5;
      if (isActive) {
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8;
      }
      ctx.stroke();

      // Major Number Labels
      if (isMajor) {
        const textR = innerR - 16;
        const tx = cx + Math.cos(tickAngle) * textR;
        const ty = cy + Math.sin(tickAngle) * textR;

        ctx.font = "bold 13px 'Orbitron', monospace";
        ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.35)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tickSpeed.toString(), tx, ty);
      }
      ctx.restore();
    }

    // 6. Draw Glowing Fire Particles (Additive Blending)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      let grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      if (p.isNitrous) {
        // Cyan / Blue Plasma Flame
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.life})`);
        grad.addColorStop(0.3, `rgba(6, 182, 212, ${p.life * 0.9})`);
        grad.addColorStop(0.7, `rgba(59, 130, 246, ${p.life * 0.6})`);
        grad.addColorStop(1, `rgba(168, 85, 247, 0)`);
      } else if (p.isSpark) {
        // High-intensity white-yellow ember spark
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.life})`);
        grad.addColorStop(0.5, `rgba(253, 224, 71, ${p.life * 0.9})`);
        grad.addColorStop(1, `rgba(249, 115, 22, 0)`);
      } else {
        // Real Turbo GT3 Exhaust Flame (White -> Yellow -> Orange -> Crimson)
        grad.addColorStop(0, `rgba(255, 255, 240, ${p.life})`);
        grad.addColorStop(0.25, `rgba(251, 191, 36, ${p.life * 0.9})`);
        grad.addColorStop(0.65, `rgba(234, 88, 12, ${p.life * 0.7})`);
        grad.addColorStop(0.9, `rgba(220, 38, 38, ${p.life * 0.4})`);
        grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
      }

      ctx.fillStyle = grad;
      ctx.fill();
    });
    ctx.restore();

    // 7. Dynamic Speedometer Needle
    ctx.save();
    ctx.beginPath();
    const needleAngle = currentSpeedAngle;
    const nx1 = cx + Math.cos(needleAngle + Math.PI / 2) * 5;
    const ny1 = cy + Math.sin(needleAngle + Math.PI / 2) * 5;
    const nx2 = cx + Math.cos(needleAngle - Math.PI / 2) * 5;
    const ny2 = cy + Math.sin(needleAngle - Math.PI / 2) * 5;
    const tipX = cx + Math.cos(needleAngle) * (radius * 0.92);
    const tipY = cy + Math.sin(needleAngle) * (radius * 0.92);

    ctx.moveTo(nx1, ny1);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(nx2, ny2);
    ctx.closePath();

    ctx.fillStyle = this.nitrousActive ? '#06b6d4' : '#fbbf24';
    ctx.shadowColor = this.nitrousActive ? '#38bdf8' : '#f97316';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();

    // 8. Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0f13';
    ctx.strokeStyle = this.nitrousActive ? '#06b6d4' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Synchronize DOM Values
   */
  updateDOM() {
    // Digital Speed
    const speedEl = document.getElementById('digital-speed-value');
    if (speedEl) speedEl.textContent = Math.round(this.speed);

    // Digital Gear
    const gearEl = document.getElementById('digital-gear-value');
    if (gearEl) gearEl.textContent = this.gear === 0 ? 'N' : this.gear;

    // Digital RPM
    const rpmEl = document.getElementById('digital-rpm-value');
    if (rpmEl) rpmEl.textContent = Math.round(this.rpm);

    // Digital Boost
    const boostEl = document.getElementById('digital-boost-value');
    if (boostEl) boostEl.textContent = this.boost.toFixed(1) + ' BAR';

    // Fire Intensity Display
    const fireEl = document.getElementById('digital-fire-intensity');
    if (fireEl) {
      const pct = Math.min(100, Math.round((this.rpm / 9500) * 100));
      fireEl.textContent = pct + '%';
    }

    // Telemetry Bars
    const throttleBar = document.getElementById('bar-throttle');
    if (throttleBar) throttleBar.style.width = (this.throttle * 100) + '%';
    const throttleVal = document.getElementById('metric-throttle-val');
    if (throttleVal) throttleVal.textContent = Math.round(this.throttle * 100) + '%';

    const brakeBar = document.getElementById('bar-brake');
    if (brakeBar) brakeBar.style.width = (this.brake * 100) + '%';
    const brakeVal = document.getElementById('metric-brake-val');
    if (brakeVal) brakeVal.textContent = Math.round(this.brake * 100) + '%';

    const exhaustBar = document.getElementById('bar-exhaust');
    if (exhaustBar) exhaustBar.style.width = Math.min(100, (this.exhaustTemp / 950) * 100) + '%';
    const exhaustVal = document.getElementById('metric-exhaust-val');
    if (exhaustVal) exhaustVal.textContent = Math.round(this.exhaustTemp) + '°C';

    const nosBar = document.getElementById('bar-nos');
    if (nosBar) nosBar.style.width = this.nitrousCharge + '%';
    const nosVal = document.getElementById('metric-nos-val');
    if (nosVal) nosVal.textContent = Math.round(this.nitrousCharge) + '%';

    // G-Force
    const gVal = document.getElementById('g-force-val');
    if (gVal) gVal.textContent = this.gForce.toFixed(2) + ' G';

    // Shift Light LEDs
    this.shiftLeds.forEach(led => {
      const triggerRpm = parseInt(led.getAttribute('data-rpm'), 10);
      if (this.rpm >= triggerRpm) {
        led.classList.add('active');
      } else {
        led.classList.remove('active');
      }
    });

    // Redline Alert Banner
    const redlineAlert = document.getElementById('redline-alert');
    if (redlineAlert) {
      if (this.rpm >= 9100) {
        redlineAlert.style.opacity = '1';
        redlineAlert.style.borderColor = 'rgba(239, 68, 68, 0.8)';
      } else {
        redlineAlert.style.opacity = '0';
        redlineAlert.style.borderColor = 'transparent';
      }
    }
  }

  animate(currentTime) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.updatePhysics(deltaTime);
    this.render();

    requestAnimationFrame(this.animate);
  }
}

// Global Speedometer instance
window.fireSpeedo = null;
window.speedoMovableCtrl = null;

/**
 * ============================================================================
 * AJITH KUMAR RACING - MOVABLE SPEEDOMETER & FLOATING HUD CONTROLLER
 * Enables full dragging, docking, touch gestures & positioning for Speedometer
 * ============================================================================
 */
class SpeedometerMovableController {
  constructor(options = {}) {
    this.card = document.getElementById(options.cardId || 'speedometer-card');
    this.placeholder = document.getElementById(options.placeholderId || 'speedometer-placeholder');
    this.dragBar = document.getElementById(options.dragBarId || 'speedo-drag-bar');

    this.toggleBtns = [
      document.getElementById('speedo-movable-toggle-btn'),
      document.getElementById('header-movable-btn')
    ].filter(Boolean);

    this.dockBtns = [
      document.getElementById('speedo-dock-btn'),
      document.getElementById('placeholder-dock-btn')
    ].filter(Boolean);

    this.closeBtn = document.getElementById('speedo-close-movable-btn');
    this.centerBtn = document.getElementById('speedo-center-btn');
    this.placeholderCenterBtn = document.getElementById('placeholder-center-btn');
    this.compactBtn = document.getElementById('speedo-compact-toggle-btn');
    this.statusLabels = [
      document.getElementById('speedo-movable-status')
    ].filter(Boolean);

    this.isMovable = false;
    this.isCompact = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.posX = null;
    this.posY = null;

    this.init();
  }

  init() {
    if (!this.card) return;

    // 1. Bind Toggle Buttons
    this.toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    });

    // 2. Bind Dock Buttons
    this.dockBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setMovable(false);
      });
    });

    // 3. Bind Close / Lock Button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setMovable(false);
      });
    }

    // 4. Bind Center on Screen Buttons
    const handleCenter = (e) => {
      e.preventDefault();
      this.centerOnScreen();
    };
    if (this.centerBtn) this.centerBtn.addEventListener('click', handleCenter);
    if (this.placeholderCenterBtn) this.placeholderCenterBtn.addEventListener('click', handleCenter);

    // 5. Bind Compact HUD Toggle Button
    if (this.compactBtn) {
      this.compactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleCompact();
      });
    }

    // 6. Setup Mouse and Touch Dragging
    this.setupDragging();

    // 7. Handle Viewport Resize
    window.addEventListener('resize', () => {
      if (this.isMovable) {
        this.clampPosition();
        if (window.fireSpeedo) {
          setTimeout(() => window.fireSpeedo.setupCanvasResolution(), 50);
        }
      }
    });
  }

  toggle() {
    this.setMovable(!this.isMovable);
  }

  setMovable(enable) {
    this.isMovable = enable;

    // Update Status Labels (ON / OFF)
    this.statusLabels.forEach(label => {
      label.textContent = enable ? 'ON' : 'OFF';
      if (enable) {
        label.classList.remove('text-amber-400', 'text-red-400');
        label.classList.add('text-emerald-400');
      } else {
        label.classList.remove('text-emerald-400');
        label.classList.add('text-amber-400');
      }
    });

    // Update Toggle Buttons active styling
    this.toggleBtns.forEach(btn => {
      if (enable) {
        btn.classList.add('active-movable');
      } else {
        btn.classList.remove('active-movable');
      }
    });

    if (enable) {
      // 1. Show Cockpit Dock Placeholder
      if (this.placeholder) {
        this.placeholder.classList.remove('hidden');
      }

      // 2. Show Drag Title Bar
      if (this.dragBar) {
        this.dragBar.classList.remove('hidden');
      }

      // 3. Apply Floating Class
      this.card.classList.add('speedometer-floating-mode');

      // 4. Position on screen (Default: upper-right or clamped previous position)
      if (this.posX === null || this.posY === null) {
        const initialWidth = Math.min(580, window.innerWidth * 0.94);
        this.posX = Math.max(15, window.innerWidth - initialWidth - 30);
        this.posY = Math.max(85, Math.min(window.innerHeight - 560, 95));
      } else {
        this.clampPosition();
      }

      this.card.style.left = `${this.posX}px`;
      this.card.style.top = `${this.posY}px`;
      this.card.style.right = 'auto';
      this.card.style.bottom = 'auto';

      // 5. Re-render canvas DPI
      if (window.fireSpeedo) {
        setTimeout(() => window.fireSpeedo.setupCanvasResolution(), 60);
      }
    } else {
      // DOCK BACK TO COCKPIT
      if (this.placeholder) {
        this.placeholder.classList.add('hidden');
      }
      if (this.dragBar) {
        this.dragBar.classList.add('hidden');
      }

      this.card.classList.remove('speedometer-floating-mode', 'compact-mode', 'is-dragging');
      this.card.style.left = '';
      this.card.style.top = '';
      this.card.style.right = '';
      this.card.style.bottom = '';
      this.card.style.position = '';
      this.card.style.width = '';
      this.card.style.transform = '';

      this.isCompact = false;
      const compactIcon = document.getElementById('speedo-compact-icon');
      if (compactIcon) compactIcon.className = 'fa-solid fa-compress';

      if (window.fireSpeedo) {
        setTimeout(() => window.fireSpeedo.setupCanvasResolution(), 60);
      }
    }
  }

  toggleCompact() {
    if (!this.isMovable) return;
    this.isCompact = !this.isCompact;
    const compactIcon = document.getElementById('speedo-compact-icon');

    if (this.isCompact) {
      this.card.classList.add('compact-mode');
      if (compactIcon) compactIcon.className = 'fa-solid fa-expand';
    } else {
      this.card.classList.remove('compact-mode');
      if (compactIcon) compactIcon.className = 'fa-solid fa-compress';
    }

    this.clampPosition();
    if (window.fireSpeedo) {
      setTimeout(() => window.fireSpeedo.setupCanvasResolution(), 60);
    }
  }

  centerOnScreen() {
    if (!this.isMovable) {
      this.setMovable(true);
    }
    const cardWidth = this.card.offsetWidth || 540;
    const cardHeight = this.card.offsetHeight || 500;

    this.posX = Math.max(10, (window.innerWidth - cardWidth) / 2);
    this.posY = Math.max(80, (window.innerHeight - cardHeight) / 2);

    this.card.style.left = `${this.posX}px`;
    this.card.style.top = `${this.posY}px`;
  }

  clampPosition() {
    if (!this.isMovable) return;
    const cardWidth = this.card.offsetWidth || 540;
    const cardHeight = this.card.offsetHeight || 500;

    const maxX = window.innerWidth - cardWidth;
    const maxY = window.innerHeight - cardHeight;

    this.posX = Math.max(8, Math.min(maxX - 8, this.posX !== null ? this.posX : 20));
    this.posY = Math.max(75, Math.min(maxY - 8, this.posY !== null ? this.posY : 90));

    this.card.style.left = `${this.posX}px`;
    this.card.style.top = `${this.posY}px`;
  }

  setupDragging() {
    const onStart = (clientX, clientY, target) => {
      if (!this.isMovable) return false;

      // Ignore click on interactive buttons/inputs
      if (target.closest('button') || target.closest('select') || target.closest('a') || target.closest('input')) {
        return false;
      }

      this.isDragging = true;
      const rect = this.card.getBoundingClientRect();
      this.startX = clientX - rect.left;
      this.startY = clientY - rect.top;

      this.card.classList.add('is-dragging');
      return true;
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging || !this.isMovable) return;

      const newX = clientX - this.startX;
      const newY = clientY - this.startY;

      const cardWidth = this.card.offsetWidth;
      const cardHeight = this.card.offsetHeight;

      const maxX = window.innerWidth - cardWidth;
      const maxY = window.innerHeight - cardHeight;

      this.posX = Math.max(5, Math.min(maxX - 5, newX));
      this.posY = Math.max(5, Math.min(maxY - 5, newY));

      this.card.style.left = `${this.posX}px`;
      this.card.style.top = `${this.posY}px`;
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.card.classList.remove('is-dragging');
    };

    // Desktop Mouse Drag
    this.card.addEventListener('mousedown', (e) => {
      if (onStart(e.clientX, e.clientY, e.target)) {
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      onMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', onEnd);

    // Mobile / Tablet Touch Drag
    this.card.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        if (onStart(e.touches[0].clientX, e.touches[0].clientY, e.target)) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  }
}
