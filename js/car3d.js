/**
 * ============================================================================
 * AJITH KUMAR RACING - OFFICIAL GT3 DEMO CAR 3D SIMULATION ENGINE
 * Real-time WebGL Renderer, Dynamic Exhaust Flame Throwers & Burnout Smoke
 * ============================================================================
 */

class AKRacingCar3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Dimensions
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // Car Objects
    this.carGroup = null;
    this.bodyMesh = null;
    this.wheels = [];
    this.brakeDiscs = [];
    this.headlights = [];
    this.underglowLight = null;
    this.exhaustTips = [];

    // Particle Systems
    this.flameParticles = [];
    this.smokeParticles = [];
    this.isBurnoutActive = false;

    // Visual Themes
    this.currentLivery = 'ak-stealth';
    this.headlightsOn = true;
    this.underglowOn = true;

    // Init Engine
    this.init();
    this.setupLighting();
    this.buildCarModel();
    this.setupExhaustParticles();
    this.setupEventListeners();

    // Render loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error("Three.js not loaded!");
      return;
    }

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08080c, 0.035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(4.5, 2.0, 5.5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below asphalt
      this.controls.minDistance = 3.0;
      this.controls.maxDistance = 14.0;
      this.controls.target.set(0, 0.6, 0);
    }

    // 5. Asphalt / Stage Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.75,
      metalness: 0.35
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Stage Grid lines
    const gridHelper = new THREE.GridHelper(40, 40, 0xf59e0b, 0x1f2937);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  setupLighting() {
    // Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Main Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(8, 12, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    this.scene.add(keyLight);

    // Cyan Rim Light (Left)
    const rimLightCyan = new THREE.DirectionalLight(0x06b6d4, 2.5);
    rimLightCyan.position.set(-10, 5, -8);
    this.scene.add(rimLightCyan);

    // Amber Rim Light (Right Rear)
    const rimLightAmber = new THREE.DirectionalLight(0xf59e0b, 2.8);
    rimLightAmber.position.set(8, 4, -8);
    this.scene.add(rimLightAmber);

    // Underglow Floor Light
    this.underglowLight = new THREE.PointLight(0x06b6d4, 3.5, 6.0);
    this.underglowLight.position.set(0, 0.15, 0);
    this.scene.add(this.underglowLight);
  }

  /**
   * Procedural High-Detail AK Racing GT3 Cup Car Geometry
   */
  buildCarModel() {
    this.carGroup = new THREE.Group();
    this.scene.add(this.carGroup);

    // 1. Car Body Chasis Materials
    const liveryMaterials = this.getLiveryMaterials(this.currentLivery);
    this.bodyMaterial = liveryMaterials.body;
    this.carbonMaterial = liveryMaterials.carbon;
    this.glassMaterial = liveryMaterials.glass;
    this.accentMaterial = liveryMaterials.accent;

    // 2. Main Aerodynamic Widebody Fuselage
    const bodyGeo = new THREE.BoxGeometry(1.9, 0.55, 4.4, 4, 2, 8);
    // Sculpt vertices slightly for sports car curvature
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let z = pos.getZ(i);
      let y = pos.getY(i);
      let x = pos.getX(i);

      // Taper nose & rear
      if (z > 1.2) {
        pos.setY(i, y * 0.7 - 0.05); // Lower front hood
        pos.setX(i, x * 0.92);
      }
      if (z < -1.4) {
        pos.setY(i, y * 0.85); // Rear aero ducktail
      }
    }
    bodyGeo.computeVertexNormals();

    this.bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMaterial);
    this.bodyMesh.position.y = 0.55;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.carGroup.add(this.bodyMesh);

    // 3. Cabin / Cockpit Roof & Windows
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.48, 1.9);
    const cabin = new THREE.Mesh(cabinGeo, this.glassMaterial);
    cabin.position.set(0, 0.92, -0.2);
    cabin.castShadow = true;
    this.carGroup.add(cabin);

    // Cockpit Roof Scoop
    const scoopGeo = new THREE.BoxGeometry(0.35, 0.1, 0.6);
    const scoop = new THREE.Mesh(scoopGeo, this.carbonMaterial);
    scoop.position.set(0, 1.2, -0.2);
    this.carGroup.add(scoop);

    // 4. Front Aerodynamic Splitter & Canards
    const splitterGeo = new THREE.BoxGeometry(2.0, 0.06, 0.7);
    const splitter = new THREE.Mesh(splitterGeo, this.carbonMaterial);
    splitter.position.set(0, 0.22, 2.1);
    splitter.castShadow = true;
    this.carGroup.add(splitter);

    // 5. Massive Swan-Neck GT3 Rear Wing
    const wingGeo = new THREE.BoxGeometry(2.1, 0.06, 0.45);
    const wing = new THREE.Mesh(wingGeo, this.carbonMaterial);
    wing.position.set(0, 1.18, -2.15);
    wing.rotation.x = -0.08;
    wing.castShadow = true;
    this.carGroup.add(wing);

    // Wing Endplates
    const endplateGeo = new THREE.BoxGeometry(0.04, 0.35, 0.55);
    const leftPlate = new THREE.Mesh(endplateGeo, this.accentMaterial);
    leftPlate.position.set(-1.05, 1.18, -2.15);
    this.carGroup.add(leftPlate);

    const rightPlate = new THREE.Mesh(endplateGeo, this.accentMaterial);
    rightPlate.position.set(1.05, 1.18, -2.15);
    this.carGroup.add(rightPlate);

    // Wing Mounts (Carbon struts)
    const strutGeo = new THREE.BoxGeometry(0.05, 0.45, 0.15);
    const leftStrut = new THREE.Mesh(strutGeo, this.carbonMaterial);
    leftStrut.position.set(-0.45, 0.9, -2.0);
    leftStrut.rotation.x = -0.25;
    this.carGroup.add(leftStrut);

    const rightStrut = new THREE.Mesh(strutGeo, this.carbonMaterial);
    rightStrut.position.set(0.45, 0.9, -2.0);
    rightStrut.rotation.x = -0.25;
    this.carGroup.add(rightStrut);

    // 6. Rear Aerodynamic Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.8, 0.2, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, this.carbonMaterial);
    diffuser.position.set(0, 0.25, -2.15);
    this.carGroup.add(diffuser);

    // 7. Dual Titanium Center-Exit Exhaust Pipes
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 16);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      metalness: 0.95,
      roughness: 0.2
    });

    const leftExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    leftExhaust.position.set(-0.22, 0.32, -2.25);
    this.carGroup.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    rightExhaust.position.set(0.22, 0.32, -2.25);
    this.carGroup.add(rightExhaust);

    this.exhaustTips = [leftExhaust, rightExhaust];

    // 8. Endurance Yellow Matrix Headlights
    const headlightGeo = new THREE.BoxGeometry(0.35, 0.12, 0.1);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.68, 0.55, 2.18);
    leftHeadlight.rotation.y = 0.2;
    this.carGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.68, 0.55, 2.18);
    rightHeadlight.rotation.y = -0.2;
    this.carGroup.add(rightHeadlight);

    this.headlights = [leftHeadlight, rightHeadlight];

    // 9. 4x Racing Wheels & Glowing Carbon-Ceramic Brakes
    const wheelPositions = [
      { x: -0.96, y: 0.36, z: 1.35 },  // Front Left
      { x: 0.96, y: 0.36, z: 1.35 },   // Front Right
      { x: -0.98, y: 0.38, z: -1.35 }, // Rear Left
      { x: 0.98, y: 0.38, z: -1.35 }  // Rear Right
    ];

    wheelPositions.forEach((p, idx) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(p.x, p.y, p.z);

      // Slick Tire (Rubber)
      const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x111113,
        roughness: 0.85,
        metalness: 0.1
      });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // BBS Racing Alloy Rim (Spokes)
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold / Bronze alloy
        metalness: 0.9,
        roughness: 0.25
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rim);

      // Brembo Glowing Brake Disc
      const discGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
      discGeo.rotateZ(Math.PI / 2);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: 0x000000,
        emissiveIntensity: 0,
        metalness: 0.8,
        roughness: 0.3
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.x = (p.x > 0) ? -0.05 : 0.05;
      wheelGroup.add(disc);
      this.brakeDiscs.push(discMat);

      this.carGroup.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });
  }

  getLiveryMaterials(theme) {
    let bodyColor = 0x121216;
    let accentColor = 0xf59e0b;

    if (theme === 'dubai-gold') {
      bodyColor = 0xb45309;
      accentColor = 0xfef08a;
    } else if (theme === 'spa-cyan') {
      bodyColor = 0x083344;
      accentColor = 0x06b6d4;
    } else if (theme === 'monza-red') {
      bodyColor = 0x991b1b;
      accentColor = 0xffffff;
    }

    return {
      body: new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.65,
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1
      }),
      carbon: new THREE.MeshStandardMaterial({
        color: 0x0d0d10,
        roughness: 0.5,
        metalness: 0.6
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0x030712,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.8,
        roughness: 0.2
      })
    };
  }

  setLivery(theme) {
    this.currentLivery = theme;
    const mats = this.getLiveryMaterials(theme);
    if (this.bodyMesh) {
      this.bodyMesh.material = mats.body;
    }
  }

  setupExhaustParticles() {
    // 3D Particles for Exhaust Fire Streams & Burnout Smoke
    this.flameParticles = [];
    this.smokeParticles = [];
  }

  spawnExhaustFlame(isBigBurst = false) {
    if (!this.exhaustTips || this.exhaustTips.length === 0) return;

    const count = isBigBurst ? 14 : 5;
    this.exhaustTips.forEach(tip => {
      const tipPos = new THREE.Vector3();
      tip.getWorldPosition(tipPos);

      for (let i = 0; i < count; i++) {
        const pGeo = new THREE.SphereGeometry(isBigBurst ? 0.14 : 0.08, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: isBigBurst ? 0xff3b30 : (Math.random() < 0.4 ? 0x38bdf8 : 0xf59e0b),
          transparent: true,
          opacity: 0.95
        });
        const mesh = new THREE.Mesh(pGeo, pMat);
        mesh.position.copy(tipPos);
        mesh.position.x += (Math.random() - 0.5) * 0.08;
        mesh.position.y += (Math.random() - 0.5) * 0.08;

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.2 + 0.1,
          -(1.2 + Math.random() * 2.5) // Shoot backwards from exhaust
        );

        this.scene.add(mesh);
        this.flameParticles.push({
          mesh,
          velocity,
          life: 1.0,
          decay: 0.06 + Math.random() * 0.08
        });
      }
    });

    // Flash exhaust alert badge
    const badge = document.getElementById('car-flame-badge');
    if (badge) {
      badge.style.opacity = '1';
      setTimeout(() => { badge.style.opacity = '0'; }, 600);
    }
  }

  spawnBurnoutSmoke() {
    if (!this.wheels || this.wheels.length < 4) return;
    
    // Rear wheels (index 2 and 3)
    [this.wheels[2], this.wheels[3]].forEach(w => {
      const wPos = new THREE.Vector3();
      w.getWorldPosition(wPos);

      for (let i = 0; i < 4; i++) {
        const sGeo = new THREE.SphereGeometry(0.25 + Math.random() * 0.3, 8, 8);
        const sMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          transparent: true,
          opacity: 0.45,
          roughness: 0.9
        });
        const sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.position.copy(wPos);
        sMesh.position.x += (Math.random() - 0.5) * 0.3;
        sMesh.position.y += Math.random() * 0.2;
        sMesh.position.z += (Math.random() - 0.5) * 0.3;

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          0.3 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.4
        );

        this.scene.add(sMesh);
        this.smokeParticles.push({
          mesh: sMesh,
          velocity,
          life: 1.0,
          decay: 0.02 + Math.random() * 0.02
        });
      }
    });
  }

  triggerBurnout() {
    this.isBurnoutActive = true;
    this.spawnExhaustFlame(true);
    if (window.gtAudio) {
      window.gtAudio.triggerRevLimiterPop();
      window.gtAudio.triggerBackfire(1.0);
    }
    setTimeout(() => {
      this.isBurnoutActive = false;
    }, 3500);
  }

  setCameraPreset(viewName) {
    if (!this.camera || !this.controls) return;

    if (viewName === 'front34') {
      this.camera.position.set(4.5, 2.0, 5.5);
      this.controls.target.set(0, 0.6, 0);
    } else if (viewName === 'rear') {
      this.camera.position.set(0, 1.2, -5.2);
      this.controls.target.set(0, 0.5, 0);
    } else if (viewName === 'cockpit') {
      this.camera.position.set(0, 1.3, 0.4);
      this.controls.target.set(0, 1.0, 8.0);
    } else if (viewName === 'side') {
      this.camera.position.set(6.5, 1.2, 0);
      this.controls.target.set(0, 0.6, 0);
    } else if (viewName === 'top') {
      this.camera.position.set(0, 8.0, 0.1);
      this.controls.target.set(0, 0, 0);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    // Camera preset buttons
    document.querySelectorAll('.cam-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cam-preset-btn').forEach(b => b.classList.remove('active', 'bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300'));
        btn.classList.add('active', 'bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
        const view = btn.getAttribute('data-camera-view');
        this.setCameraPreset(view);
      });
    });

    // Livery buttons
    document.querySelectorAll('.livery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.livery-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.getAttribute('data-livery');
        this.setLivery(theme);
      });
    });

    // Toggle Matrix LEDs
    const ledBtn = document.getElementById('toggle-headlights-btn');
    if (ledBtn) {
      ledBtn.addEventListener('click', () => {
        this.headlightsOn = !this.headlightsOn;
        this.headlights.forEach(hl => {
          hl.visible = this.headlightsOn;
        });
        ledBtn.classList.toggle('text-amber-300', this.headlightsOn);
      });
    }

    // Toggle Underglow
    const ugBtn = document.getElementById('toggle-underglow-btn');
    if (ugBtn) {
      ugBtn.addEventListener('click', () => {
        this.underglowOn = !this.underglowOn;
        if (this.underglowLight) this.underglowLight.visible = this.underglowOn;
        ugBtn.classList.toggle('text-cyan-300', this.underglowOn);
      });
    }

    // Car Burnout Button
    const boBtn = document.getElementById('car-burnout-btn');
    if (boBtn) {
      boBtn.addEventListener('click', () => this.triggerBurnout());
    }

    // Car Rev Trigger
    const carRevBtn = document.getElementById('car-rev-trigger-btn');
    if (carRevBtn) {
      carRevBtn.addEventListener('mousedown', () => {
        if (window.fireSpeedo) window.fireSpeedo.setThrottle(1.0);
        this.spawnExhaustFlame(true);
      });
      window.addEventListener('mouseup', () => {
        if (window.fireSpeedo && window.fireSpeedo.autoMode === 'manual') {
          window.fireSpeedo.setThrottle(0.0);
        }
      });
    }
  }

  animate(currentTime) {
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 1. Controls update
    if (this.controls) this.controls.update();

    // 2. Rotate Wheels with Speed
    const currentSpeed = window.fireSpeedo ? window.fireSpeedo.speed : 0;
    const currentRpm = window.fireSpeedo ? window.fireSpeedo.rpm : 850;
    const currentThrottle = window.fireSpeedo ? window.fireSpeedo.throttle : 0;

    const wheelSpinSpeed = (currentSpeed * 0.08) + (this.isBurnoutActive ? 1.5 : 0);
    this.wheels.forEach(w => {
      w.rotation.x += wheelSpinSpeed;
    });

    // 3. Glowing Carbon Brakes on braking
    const isBraking = window.fireSpeedo && window.fireSpeedo.brake > 0.1;
    this.brakeDiscs.forEach(discMat => {
      if (isBraking) {
        discMat.emissive.setHex(0xff3300);
        discMat.emissiveIntensity = 2.5;
      } else {
        discMat.emissiveIntensity = Math.max(0, discMat.emissiveIntensity - dt * 2.0);
      }
    });

    // 4. Exhaust Flames when revving high
    if (currentRpm > 6500 && currentThrottle > 0.5) {
      if (Math.random() < 0.5) {
        this.spawnExhaustFlame(currentRpm > 8800);
      }
    }

    // 5. Burnout Smoke
    if (this.isBurnoutActive) {
      this.spawnBurnoutSmoke();
    }

    // 6. Update 3D Flame Particles
    for (let i = this.flameParticles.length - 1; i >= 0; i--) {
      const p = this.flameParticles[i];
      p.mesh.position.addScaledVector(p.velocity, dt * 15);
      p.life -= p.decay;
      p.mesh.scale.multiplyScalar(0.94);
      p.mesh.material.opacity = p.life;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.flameParticles.splice(i, 1);
      }
    }

    // 7. Update Smoke Particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const s = this.smokeParticles[i];
      s.mesh.position.addScaledVector(s.velocity, dt * 8);
      s.life -= s.decay;
      s.mesh.scale.multiplyScalar(1.03); // Smoke expands
      s.mesh.material.opacity = s.life * 0.45;

      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }

    // 8. Dynamic Chassis Pitch (Squats under acceleration, dives under braking)
    if (this.carGroup) {
      const targetPitch = isBraking ? -0.04 : (currentThrottle * 0.035);
      this.carGroup.rotation.x += (targetPitch - this.carGroup.rotation.x) * 0.1;
    }

    // 9. Render Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.animate);
  }
}

// Global Car Instance
window.akCar3D = null;
