/**
 * ============================================================================
 * AJITH KUMAR RACING - MASTER CONTROLLER & TELEMETRY COORDINATOR
 * Ties together Speedometer Automation, 3D GT3 Machine, Audio Engine & Controls
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Fire Speedometer Canvas
  window.fireSpeedo = new FireSpeedometer('fire-speedometer-canvas');

  // 2. Initialize Movable / Floating Speedometer Controller
  window.speedoMovableCtrl = new SpeedometerMovableController({
    cardId: 'speedometer-card',
    placeholderId: 'speedometer-placeholder',
    dragBarId: 'speedo-drag-bar'
  });

  // 3. Initialize 3D GT3 Demo Car
  window.akCar3D = new AKRacingCar3D('three-car-container');

  // 4. Bind UI & Engine Controls
  setupMasterControls();
  setupThrottleControls();
  setupAutomationControls();
  setupKeyboardControls();
  setupSoundboard();
});

function setupMasterControls() {
  const ignitionBtn = document.getElementById('master-ignition-btn');
  const ignitionText = document.getElementById('ignition-btn-text');
  const muteBtn = document.getElementById('master-mute-btn');
  const muteIcon = document.getElementById('master-mute-icon');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const heroRevBtn = document.getElementById('hero-quick-rev-btn');

  // Master Engine Ignition Toggle
  if (ignitionBtn) {
    ignitionBtn.addEventListener('click', () => {
      const isRunning = window.gtAudio.toggleIgnition();
      if (isRunning) {
        ignitionBtn.classList.add('running');
        ignitionText.textContent = 'ENGINE RUNNING';
      } else {
        ignitionBtn.classList.remove('running');
        ignitionText.textContent = 'START ENGINE';
      }
    });
  }

  // Master Mute / Un-mute
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const isMuted = window.gtAudio.toggleMute();
      if (isMuted) {
        muteIcon.className = 'fa-solid fa-volume-xmark text-red-400';
      } else {
        muteIcon.className = 'fa-solid fa-volume-high text-white';
      }
    });
  }

  // Fullscreen
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    });
  }

  // Hero Quick Rev
  if (heroRevBtn) {
    heroRevBtn.addEventListener('click', () => {
      if (window.gtAudio) {
        if (!window.gtAudio.isRunning) window.gtAudio.startEngine();
        setTimeout(() => {
          if (window.fireSpeedo) {
            window.fireSpeedo.setThrottle(1.0);
            window.fireSpeedo.spawnFireExplosion(40);
            setTimeout(() => {
              window.fireSpeedo.setThrottle(0);
            }, 1400);
          }
        }, 500);
      }
    });
  }

  // Engine Profile Selector
  const profileSelect = document.getElementById('engine-profile-select');
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => {
      if (window.gtAudio) {
        window.gtAudio.setProfile(e.target.value);
      }
    });
  }
}

function setupThrottleControls() {
  const pedal = document.getElementById('manual-throttle-pedal');
  const throttleLabel = document.getElementById('throttle-btn-label');
  const nitrousBtn = document.getElementById('manual-nitrous-btn');
  const launchBtn = document.getElementById('manual-launch-btn');
  const paddleUp = document.getElementById('paddle-up-btn');
  const paddleDown = document.getElementById('paddle-down-btn');

  let isDepressed = false;

  const pressPedal = (e) => {
    e.preventDefault();
    if (isDepressed) return;
    isDepressed = true;

    if (pedal) pedal.classList.add('depressed');
    if (throttleLabel) throttleLabel.textContent = 'ACCELERATING (FLAMES ACTIVE)';

    if (window.gtAudio && !window.gtAudio.isRunning) {
      window.gtAudio.startEngine();
    }

    if (window.fireSpeedo) {
      // In gear 0? Automatically engage 1st gear on gas pedal press for smooth driving
      if (window.fireSpeedo.gear === 0) {
        window.fireSpeedo.gear = 1;
      }
      window.fireSpeedo.setThrottle(1.0);
    }

    if (window.akCar3D) {
      window.akCar3D.spawnExhaustFlame(true);
    }
  };

  const releasePedal = (e) => {
    if (!isDepressed) return;
    isDepressed = false;

    if (pedal) pedal.classList.remove('depressed');
    if (throttleLabel) throttleLabel.textContent = 'HOLD TO REV THROTTLE';

    if (window.fireSpeedo) {
      window.fireSpeedo.setThrottle(0.0);
    }
  };

  if (pedal) {
    pedal.addEventListener('mousedown', pressPedal);
    pedal.addEventListener('touchstart', pressPedal, { passive: false });
    window.addEventListener('mouseup', releasePedal);
    window.addEventListener('touchend', releasePedal);
  }

  // Nitrous Button
  if (nitrousBtn) {
    nitrousBtn.addEventListener('click', () => {
      if (window.fireSpeedo) window.fireSpeedo.triggerNitrous();
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(true);
    });
  }

  // Launch Control
  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      if (window.fireSpeedo) window.fireSpeedo.triggerLaunchControl();
      if (window.akCar3D) window.akCar3D.triggerBurnout();
    });
  }

  // Paddle Shifters
  if (paddleUp) {
    paddleUp.addEventListener('click', () => {
      if (window.fireSpeedo) window.fireSpeedo.shiftUp();
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(false);
    });
  }

  if (paddleDown) {
    paddleDown.addEventListener('click', () => {
      if (window.fireSpeedo) window.fireSpeedo.shiftDown();
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(false);
    });
  }
}

function setupAutomationControls() {
  const autoBtn = document.getElementById('speedo-auto-mode-btn');
  const autoLabel = document.getElementById('speedo-auto-label');
  const hotlapBtn = document.getElementById('speedo-hotlap-mode-btn');
  const resetBtn = document.getElementById('speedo-reset-btn');
  const modeDisplay = document.getElementById('current-mode-display');

  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      if (window.fireSpeedo) {
        window.fireSpeedo.startAutoDynoRun();
        if (modeDisplay) modeDisplay.textContent = 'AUTOPILOT • DYNO RUN';
      }
    });
  }

  if (hotlapBtn) {
    hotlapBtn.addEventListener('click', () => {
      if (window.fireSpeedo) {
        window.fireSpeedo.startHotLapSim();
        if (modeDisplay) modeDisplay.textContent = 'AUTO HOT LAP • DUBAI 24H';
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.fireSpeedo) {
        window.fireSpeedo.resetTelemetry();
        if (modeDisplay) modeDisplay.textContent = 'TRACK • BEAST MODE';
      }
    });
  }
}

function setupKeyboardControls() {
  window.addEventListener('keydown', (e) => {
    // Prevent default scroll on Space/Arrow keys
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
      if (window.gtAudio && !window.gtAudio.isRunning) window.gtAudio.startEngine();
      if (window.fireSpeedo) {
        if (window.fireSpeedo.gear === 0) window.fireSpeedo.gear = 1;
        window.fireSpeedo.setThrottle(1.0);
      }
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(false);
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      if (window.fireSpeedo) window.fireSpeedo.setBrake(1.0);
    } else if (e.code === 'KeyE') {
      if (window.fireSpeedo) window.fireSpeedo.shiftUp();
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(false);
    } else if (e.code === 'KeyQ') {
      if (window.fireSpeedo) window.fireSpeedo.shiftDown();
    } else if (e.code === 'KeyN') {
      if (window.fireSpeedo) window.fireSpeedo.triggerNitrous();
    } else if (e.code === 'KeyL') {
      if (window.fireSpeedo) window.fireSpeedo.triggerLaunchControl();
    } else if (e.code === 'KeyB') {
      if (window.akCar3D) window.akCar3D.triggerBurnout();
    } else if (e.code === 'KeyM') {
      if (window.speedoMovableCtrl) window.speedoMovableCtrl.toggle();
    } else if (e.code === 'KeyI') {
      const ignitionBtn = document.getElementById('master-ignition-btn');
      if (ignitionBtn) ignitionBtn.click();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
      if (window.fireSpeedo && window.fireSpeedo.autoMode === 'manual') {
        window.fireSpeedo.setThrottle(0.0);
      }
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      if (window.fireSpeedo) {
        window.fireSpeedo.setBrake(0.0);
      }
    }
  });
}

function setupSoundboard() {
  const backfireBtn = document.getElementById('sound-backfire-test-btn');
  const bovBtn = document.getElementById('sound-bov-test-btn');
  const limiterBtn = document.getElementById('sound-limiter-test-btn');

  if (backfireBtn) {
    backfireBtn.addEventListener('click', () => {
      if (window.gtAudio) {
        if (!window.gtAudio.isRunning) window.gtAudio.startEngine();
        window.gtAudio.triggerBackfire(1.0);
      }
      if (window.fireSpeedo) window.fireSpeedo.spawnFireExplosion(30);
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(true);
    });
  }

  if (bovBtn) {
    bovBtn.addEventListener('click', () => {
      if (window.gtAudio) {
        if (!window.gtAudio.isRunning) window.gtAudio.startEngine();
        window.gtAudio.triggerBOVFlutter();
      }
    });
  }

  if (limiterBtn) {
    limiterBtn.addEventListener('click', () => {
      if (window.gtAudio) {
        if (!window.gtAudio.isRunning) window.gtAudio.startEngine();
        window.gtAudio.triggerRevLimiterPop();
      }
      if (window.fireSpeedo) window.fireSpeedo.spawnFireExplosion(35);
      if (window.akCar3D) window.akCar3D.spawnExhaustFlame(true);
    });
  }
}
