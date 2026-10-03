/**
 * ============================================================================
 * AJITH KUMAR RACING - OFFICIAL LE MANS 499P HYPERCAR 3D SIMULATION ENGINE
 * Authentic LMH Aerodynamic Sculpt, Shark Fin, Dynamic Exhaust Flames & Livery Studio
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

    // Car Object Groups & Meshes
    this.carGroup = null;
    this.bodyMeshes = [];
    this.liveryAccentMeshes = [];
    this.carbonMeshes = [];
    this.wheels = [];
    this.rimMeshes = [];
    this.caliperMeshes = [];
    this.brakeDiscs = [];
    this.headlights = [];
    this.rearLightBar = null;
    this.underglowLight = null;
    this.exhaustTips = [];
    this.numberDecals = [];

    // Particle Systems
    this.flameParticles = [];
    this.smokeParticles = [];
    this.isBurnoutActive = false;

    // Livery & Customization State
    this.currentLivery = 'official-50'; // Default: Official Le Mans #50 Rosso & Giallo
    this.customColors = {
      body: '#d40000',
      accent: '#facc15',
      rims: '#18181b',
      caliper: '#facc15',
      underglow: '#facc15',
      finish: 'gloss' // 'gloss', 'metallic', 'matte', 'carbon'
    };

    this.headlightsOn = true;
    this.underglowOn = true;
    this.raceNumber = '50';

    // Materials Dictionary for Live Updates
    this.materials = {
      body: null,
      accent: null,
      carbon: null,
      glass: null,
      rim: null,
      caliper: null,
      tire: null,
      disc: null,
      headlight: null,
      taillight: null,
      exhaust: null
    };

    // Initialize
    this.init();
    this.setupLighting();
    this.createMaterials();
    this.buildHypercarModel();
    this.setupExhaustParticles();
    this.setupEventListeners();
    this.applyLivery(this.currentLivery);

    // Animation Loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error("Three.js not loaded!");
      return;
    }

    // 1. Scene with dramatic endurance track atmosphere
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060609, 0.032);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
    this.camera.position.set(4.8, 1.8, 5.2);

    // 3. WebGL Renderer with ACES Tone Mapping & Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Never dip below floor
      this.controls.minDistance = 2.8;
      this.controls.maxDistance = 14.0;
      this.controls.target.set(0, 0.55, 0);
    }

    // 5. High-End Studio & Wet Paddock Floor (Reflective Wet Asphalt like official photo)
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.35, // Glossy wet tarmac reflections
      metalness: 0.7
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Radial Track Grid Overlay
    const gridHelper = new THREE.GridHelper(45, 45, 0xf59e0b, 0x1e1e26);
    gridHelper.position.y = 0.005;
    this.scene.add(gridHelper);

    // Le Mans Pitlane Neon Marker lines
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3 });
    const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 20), markerMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-2.2, 0.01, 0);
    this.scene.add(leftLine);

    const rightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 20), markerMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(2.2, 0.01, 0);
    this.scene.add(rightLine);
  }

  setupLighting() {
    // Ambient light with subtle cool undertone
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Main Studio Overhead Spot / Key Light
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    this.scene.add(keyLight);

    // High-Contrast Yellow/Gold Studio Rim Light (Matches official photo background glow)
    this.rimLightGold = new THREE.DirectionalLight(0xfacc15, 3.2);
    this.rimLightGold.position.set(10, 4, -10);
    this.scene.add(this.rimLightGold);

    // Left Cyan Contrast Fill Light
    this.rimLightCyan = new THREE.DirectionalLight(0x06b6d4, 1.8);
    this.rimLightCyan.position.set(-10, 5, -6);
    this.scene.add(this.rimLightCyan);

    // Front Nose Accent Light
    const noseLight = new THREE.PointLight(0xffffff, 1.5, 8.0);
    noseLight.position.set(0, 1.2, 4.5);
    this.scene.add(noseLight);

    // Chassis Underglow Light
    this.underglowLight = new THREE.PointLight(0xfacc15, 3.8, 6.5);
    this.underglowLight.position.set(0, 0.12, 0);
    this.scene.add(this.underglowLight);
  }

  createMaterials() {
    // 1. Primary Car Body Material
    this.materials.body = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd40000),
      metalness: 0.5,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95
    });

    // 2. Secondary Livery Accent Material (Giallo Modena Racing Swooshes)
    this.materials.accent = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xfacc15),
      metalness: 0.6,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    // 3. Exposed Carbon Fiber Aerodynamic Composite
    this.materials.carbon = new THREE.MeshStandardMaterial({
      color: 0x111114,
      roughness: 0.38,
      metalness: 0.75
    });

    // 4. Cockpit Canopy Tinted Glass
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x050811,
      metalness: 0.9,
      roughness: 0.05,
      transmission: 0.6,
      thickness: 0.5,
      transparent: true,
      opacity: 0.88,
      clearcoat: 1.0
    });

    // 5. Racing Alloy Rims
    this.materials.rim = new THREE.MeshStandardMaterial({
      color: 0x141418, // Satin Nero / Carbon
      metalness: 0.92,
      roughness: 0.22
    });

    // 6. Brembo Brake Calipers
    this.materials.caliper = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Giallo Modena Calipers
      metalness: 0.7,
      roughness: 0.3
    });

    // 7. Michelin Slick Tires
    this.materials.tire = new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.9,
      metalness: 0.08
    });

    // 8. Carbon Ceramic Brake Discs
    this.materials.disc = new THREE.MeshStandardMaterial({
      color: 0x222226,
      emissive: 0x000000,
      emissiveIntensity: 0,
      metalness: 0.85,
      roughness: 0.28
    });

    // 9. LED Endurance Matrix Headlights
    this.materials.headlight = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    // 10. Rear Red LED Light Bar
    this.materials.taillight = new THREE.MeshBasicMaterial({
      color: 0xff1e1e
    });

    // 11. Titanium Exhaust Tips
    this.materials.exhaust = new THREE.MeshStandardMaterial({
      color: 0x2a2a30,
      metalness: 0.95,
      roughness: 0.15
    });
  }

  /**
   * ==========================================================================
   * BUILD 3D LE MANS HYPERCAR GEOMETRY (Ferrari 499P Inspired LMH Aero Package)
   * ==========================================================================
   */
  buildHypercarModel() {
    this.carGroup = new THREE.Group();
    this.scene.add(this.carGroup);

    this.bodyMeshes = [];
    this.liveryAccentMeshes = [];
    this.carbonMeshes = [];
    this.wheels = [];
    this.rimMeshes = [];
    this.caliperMeshes = [];
    this.brakeDiscs = [];
    this.headlights = [];
    this.exhaustTips = [];

    // ------------------------------------------------------------------------
    // 1. CENTRAL MONOCOQUE & MAIN FUSELAGE
    // ------------------------------------------------------------------------
    const fuselageGeo = new THREE.BoxGeometry(1.85, 0.42, 4.6, 6, 2, 10);
    const pos = fuselageGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Low slung Hypercar nose taper
      if (z > 1.1) {
        pos.setY(i, y * 0.55 - 0.06);
        pos.setX(i, x * (0.85 + (2.3 - z) * 0.08));
      }
      // Waist undercut (side aero channel)
      if (z > -1.0 && z < 1.0) {
        if (Math.abs(x) > 0.5) {
          pos.setX(i, x * 0.94);
        }
      }
      // Rear engine deck drop
      if (z < -1.2) {
        pos.setY(i, y * 0.72 - 0.02);
      }
    }
    fuselageGeo.computeVertexNormals();

    const fuselageMesh = new THREE.Mesh(fuselageGeo, this.materials.body);
    fuselageMesh.position.y = 0.46;
    fuselageMesh.castShadow = true;
    fuselageMesh.receiveShadow = true;
    this.carGroup.add(fuselageMesh);
    this.bodyMeshes.push(fuselageMesh);

    // ------------------------------------------------------------------------
    // 2. FRONT AERO FENDERS & WHEEL ARCH BLISTERS (Distinctive 499P LMH Curves)
    // ------------------------------------------------------------------------
    [-0.82, 0.82].forEach((xPos, idx) => {
      const fenderGeo = new THREE.BoxGeometry(0.38, 0.36, 1.4);
      const fenderMesh = new THREE.Mesh(fenderGeo, this.materials.body);
      fenderMesh.position.set(xPos, 0.54, 1.3);
      fenderMesh.castShadow = true;
      this.carGroup.add(fenderMesh);
      this.bodyMeshes.push(fenderMesh);

      // Front Wheel Arch Carbon Louvers / Aero Vents
      const louverGeo = new THREE.BoxGeometry(0.24, 0.04, 0.5);
      const louverMesh = new THREE.Mesh(louverGeo, this.materials.carbon);
      louverMesh.position.set(xPos, 0.73, 1.35);
      louverMesh.castShadow = true;
      this.carGroup.add(louverMesh);
      this.carbonMeshes.push(louverMesh);
    });

    // ------------------------------------------------------------------------
    // 3. REAR HAUNCHES & ENGINE AIR SCOOP SIDEPODS
    // ------------------------------------------------------------------------
    [-0.86, 0.86].forEach((xPos, idx) => {
      const haunchGeo = new THREE.BoxGeometry(0.42, 0.44, 1.7);
      const haunchMesh = new THREE.Mesh(haunchGeo, this.materials.body);
      haunchMesh.position.set(xPos, 0.56, -1.2);
      haunchMesh.castShadow = true;
      this.carGroup.add(haunchMesh);
      this.bodyMeshes.push(haunchMesh);

      // Radiator Intercooler Inlets (Dark Carbon Mesh)
      const inletGeo = new THREE.BoxGeometry(0.36, 0.28, 0.08);
      const inletMesh = new THREE.Mesh(inletGeo, this.materials.carbon);
      inletMesh.position.set(xPos, 0.52, -0.32);
      this.carGroup.add(inletMesh);
      this.carbonMeshes.push(inletMesh);
    });

    // ------------------------------------------------------------------------
    // 4. SIGNATURE OFFICIAL LE MANS YELLOW RACING LIVERY SWOOSHES (From Photo!)
    // ------------------------------------------------------------------------
    // Front Nose Livery Accent Stripe
    const noseStripeGeo = new THREE.BoxGeometry(0.55, 0.04, 1.1);
    const noseStripe = new THREE.Mesh(noseStripeGeo, this.materials.accent);
    noseStripe.position.set(0, 0.48, 1.7);
    noseStripe.rotation.x = -0.12;
    this.carGroup.add(noseStripe);
    this.liveryAccentMeshes.push(noseStripe);

    // Left Side Flank Livery Swoosh
    const leftSwooshGeo = new THREE.BoxGeometry(0.06, 0.22, 1.9);
    const leftSwoosh = new THREE.Mesh(leftSwooshGeo, this.materials.accent);
    leftSwoosh.position.set(-0.95, 0.52, 0.1);
    leftSwoosh.rotation.z = -0.15;
    this.carGroup.add(leftSwoosh);
    this.liveryAccentMeshes.push(leftSwoosh);

    // Right Side Flank Livery Swoosh
    const rightSwooshGeo = new THREE.BoxGeometry(0.06, 0.22, 1.9);
    const rightSwoosh = new THREE.Mesh(rightSwooshGeo, this.materials.accent);
    rightSwoosh.position.set(0.95, 0.52, 0.1);
    rightSwoosh.rotation.z = 0.15;
    this.carGroup.add(rightSwoosh);
    this.liveryAccentMeshes.push(rightSwoosh);

    // Cockpit Roof Livery Visor Arc
    const visorGeo = new THREE.BoxGeometry(1.02, 0.06, 0.35);
    const visorMesh = new THREE.Mesh(visorGeo, this.materials.accent);
    visorMesh.position.set(0, 0.98, 0.45);
    visorMesh.rotation.x = -0.35;
    this.carGroup.add(visorMesh);
    this.liveryAccentMeshes.push(visorMesh);

    // ------------------------------------------------------------------------
    // 5. COCKPIT BUBBLE CANOPY & ROOF INTAKE
    // ------------------------------------------------------------------------
    const canopyGeo = new THREE.BoxGeometry(1.0, 0.42, 1.5, 4, 2, 4);
    const cPos = canopyGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      let y = cPos.getY(i);
      let z = cPos.getZ(i);
      if (y > 0) {
        cPos.setX(i, cPos.getX(i) * 0.78); // Taper roof inward
      }
      if (z > 0.4) {
        cPos.setY(i, y * 0.6); // Sloping front windshield
      }
    }
    canopyGeo.computeVertexNormals();

    const canopyMesh = new THREE.Mesh(canopyGeo, this.materials.glass);
    canopyMesh.position.set(0, 0.82, 0.1);
    canopyMesh.castShadow = true;
    this.carGroup.add(canopyMesh);

    // Overhead Engine Periscope Roof Scoop (Carbon)
    const scoopGeo = new THREE.BoxGeometry(0.32, 0.14, 0.75);
    const scoopMesh = new THREE.Mesh(scoopGeo, this.materials.carbon);
    scoopMesh.position.set(0, 1.05, -0.05);
    scoopMesh.castShadow = true;
    this.carGroup.add(scoopMesh);
    this.carbonMeshes.push(scoopMesh);

    // Roof Antenna / Telemetry Camera Pod
    const camPodGeo = new THREE.BoxGeometry(0.12, 0.1, 0.22);
    const camPod = new THREE.Mesh(camPodGeo, this.materials.accent);
    camPod.position.set(0, 1.15, 0.2);
    this.carGroup.add(camPod);
    this.liveryAccentMeshes.push(camPod);

    // ------------------------------------------------------------------------
    // 6. ICONIC LE MANS SHARK DORSAL FIN (Central Aerodynamic Spine)
    // ------------------------------------------------------------------------
    const sharkFinGeo = new THREE.BoxGeometry(0.04, 0.48, 1.95);
    const sfPos = sharkFinGeo.attributes.position;
    for (let i = 0; i < sfPos.count; i++) {
      let z = sfPos.getZ(i);
      let y = sfPos.getY(i);
      if (z > 0.6) {
        sfPos.setY(i, y * 0.7); // Taper towards cockpit
      }
    }
    sharkFinGeo.computeVertexNormals();

    const sharkFinMesh = new THREE.Mesh(sharkFinGeo, this.materials.carbon);
    sharkFinMesh.position.set(0, 0.96, -1.05);
    sharkFinMesh.castShadow = true;
    this.carGroup.add(sharkFinMesh);
    this.carbonMeshes.push(sharkFinMesh);

    // Shark Fin Top Livery Strip
    const sfStripGeo = new THREE.BoxGeometry(0.05, 0.05, 1.85);
    const sfStrip = new THREE.Mesh(sfStripGeo, this.materials.accent);
    sfStrip.position.set(0, 1.21, -1.05);
    this.carGroup.add(sfStrip);
    this.liveryAccentMeshes.push(sfStrip);

    // ------------------------------------------------------------------------
    // 7. FRONT AERODYNAMIC CARBON SPLITTER & DIVE PLANES
    // ------------------------------------------------------------------------
    const splitterGeo = new THREE.BoxGeometry(2.1, 0.05, 0.85);
    const splitterMesh = new THREE.Mesh(splitterGeo, this.materials.carbon);
    splitterMesh.position.set(0, 0.2, 2.2);
    splitterMesh.castShadow = true;
    this.carGroup.add(splitterMesh);
    this.carbonMeshes.push(splitterMesh);

    // Front Canards / Dive Planes (Left & Right)
    [-1.02, 1.02].forEach((xPos) => {
      const canardGeo = new THREE.BoxGeometry(0.18, 0.03, 0.35);
      const canard = new THREE.Mesh(canardGeo, this.materials.carbon);
      canard.position.set(xPos, 0.38, 2.05);
      canard.rotation.z = (xPos > 0) ? -0.3 : 0.3;
      this.carGroup.add(canard);
      this.carbonMeshes.push(canard);
    });

    // ------------------------------------------------------------------------
    // 8. MASSIVE LE MANS REAR DUAL-ELEMENT WING & ENDPLATES
    // ------------------------------------------------------------------------
    // Main Wing Upper Element
    const mainWingGeo = new THREE.BoxGeometry(2.2, 0.05, 0.42);
    const mainWing = new THREE.Mesh(mainWingGeo, this.materials.carbon);
    mainWing.position.set(0, 1.15, -2.18);
    mainWing.rotation.x = -0.09;
    mainWing.castShadow = true;
    this.carGroup.add(mainWing);
    this.carbonMeshes.push(mainWing);

    // Secondary Lower Aero Flap
    const subWingGeo = new THREE.BoxGeometry(2.15, 0.03, 0.25);
    const subWing = new THREE.Mesh(subWingGeo, this.materials.carbon);
    subWing.position.set(0, 1.02, -2.1);
    subWing.rotation.x = -0.15;
    this.carGroup.add(subWing);
    this.carbonMeshes.push(subWing);

    // Wing Swan-Neck Struts (Connecting to chassis and shark fin)
    [-0.55, 0.55].forEach(xPos => {
      const strutGeo = new THREE.BoxGeometry(0.04, 0.55, 0.12);
      const strut = new THREE.Mesh(strutGeo, this.materials.carbon);
      strut.position.set(xPos, 0.85, -2.0);
      strut.rotation.x = -0.28;
      this.carGroup.add(strut);
      this.carbonMeshes.push(strut);
    });

    // Aerodynamic Wing Endplates (Yellow Livery Accent Tips!)
    [-1.12, 1.12].forEach(xPos => {
      const endplateGeo = new THREE.BoxGeometry(0.04, 0.42, 0.62);
      const endplate = new THREE.Mesh(endplateGeo, this.materials.accent);
      endplate.position.set(xPos, 1.12, -2.18);
      endplate.castShadow = true;
      this.carGroup.add(endplate);
      this.liveryAccentMeshes.push(endplate);
    });

    // ------------------------------------------------------------------------
    // 9. REAR CARBON DIFFUSER & TRAILING LIGHT BAR
    // ------------------------------------------------------------------------
    const diffuserGeo = new THREE.BoxGeometry(1.9, 0.22, 0.7);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, this.materials.carbon);
    diffuserMesh.position.set(0, 0.24, -2.25);
    this.carGroup.add(diffuserMesh);
    this.carbonMeshes.push(diffuserMesh);

    // Diffuser Vertical Strakes
    [-0.6, -0.2, 0.2, 0.6].forEach(xPos => {
      const strakeGeo = new THREE.BoxGeometry(0.03, 0.2, 0.65);
      const strake = new THREE.Mesh(strakeGeo, this.materials.carbon);
      strake.position.set(xPos, 0.22, -2.25);
      this.carGroup.add(strake);
      this.carbonMeshes.push(strake);
    });

    // Full-Width Rear LED Light Bar (Signature Le Mans Red Streak)
    const taillightGeo = new THREE.BoxGeometry(1.82, 0.04, 0.05);
    this.rearLightBar = new THREE.Mesh(taillightGeo, this.materials.taillight);
    this.rearLightBar.position.set(0, 0.58, -2.32);
    this.carGroup.add(this.rearLightBar);

    // ------------------------------------------------------------------------
    // 10. DUAL TITANIUM HYPERCAR EXHAUST OUTLETS
    // ------------------------------------------------------------------------
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 16);
    exhaustGeo.rotateX(Math.PI / 2);

    [-0.24, 0.24].forEach(xPos => {
      const exhaustMesh = new THREE.Mesh(exhaustGeo, this.materials.exhaust);
      exhaustMesh.position.set(xPos, 0.52, -2.36);
      this.carGroup.add(exhaustMesh);
      this.exhaustTips.push(exhaustMesh);
    });

    // ------------------------------------------------------------------------
    // 11. SLIM HORIZONTAL LE MANS LED HEADLIGHT BARS
    // ------------------------------------------------------------------------
    const headlightGeo = new THREE.BoxGeometry(0.44, 0.07, 0.1);
    
    // Left Headlight Bar
    const leftHeadlight = new THREE.Mesh(headlightGeo, this.materials.headlight);
    leftHeadlight.position.set(-0.72, 0.46, 2.24);
    leftHeadlight.rotation.y = 0.16;
    this.carGroup.add(leftHeadlight);
    this.headlights.push(leftHeadlight);

    // Right Headlight Bar
    const rightHeadlight = new THREE.Mesh(headlightGeo, this.materials.headlight);
    rightHeadlight.position.set(0.72, 0.46, 2.24);
    rightHeadlight.rotation.y = -0.16;
    this.carGroup.add(rightHeadlight);
    this.headlights.push(rightHeadlight);

    // ------------------------------------------------------------------------
    // 12. RACING WHEELS, MICHELIN SLICKS, ALLOY RIMS & BREMBO BRAKES
    // ------------------------------------------------------------------------
    const wheelPositions = [
      { x: -1.02, y: 0.35, z: 1.42 },  // Front Left
      { x: 1.02, y: 0.35, z: 1.42 },   // Front Right
      { x: -1.04, y: 0.37, z: -1.45 }, // Rear Left
      { x: 1.04, y: 0.37, z: -1.45 }   // Rear Right
    ];

    wheelPositions.forEach((p, idx) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(p.x, p.y, p.z);

      // Michelin Slick Tire
      const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.32, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMesh = new THREE.Mesh(tireGeo, this.materials.tire);
      tireMesh.castShadow = true;
      wheelGroup.add(tireMesh);

      // BBS Multi-Spoke Racing Rim
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.33, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, this.materials.rim);
      wheelGroup.add(rimMesh);
      this.rimMeshes.push(rimMesh);

      // Center-Lock Wheel Nut (Yellow / Anodized Red)
      const nutGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
      nutGeo.rotateZ(Math.PI / 2);
      const nutMesh = new THREE.Mesh(nutGeo, this.materials.accent);
      wheelGroup.add(nutMesh);

      // Brembo Carbon Ceramic Brake Disc
      const discGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.04, 16);
      discGeo.rotateZ(Math.PI / 2);
      const discMesh = new THREE.Mesh(discGeo, this.materials.disc);
      discMesh.position.x = (p.x > 0) ? -0.06 : 0.06;
      wheelGroup.add(discMesh);
      this.brakeDiscs.push(this.materials.disc);

      // Brembo 6-Piston Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.14, 0.12);
      const caliperMesh = new THREE.Mesh(caliperGeo, this.materials.caliper);
      caliperMesh.position.set((p.x > 0) ? -0.06 : 0.06, 0.1, 0);
      wheelGroup.add(caliperMesh);
      this.caliperMeshes.push(caliperMesh);

      this.carGroup.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });

    // ------------------------------------------------------------------------
    // 13. SIDE MIRRORS & AERODYNAMIC CAPS
    // ------------------------------------------------------------------------
    [-0.68, 0.68].forEach(xPos => {
      const mirrorArmGeo = new THREE.BoxGeometry(0.16, 0.03, 0.04);
      const mirrorArm = new THREE.Mesh(mirrorArmGeo, this.materials.carbon);
      mirrorArm.position.set(xPos, 0.76, 0.65);
      this.carGroup.add(mirrorArm);

      const mirrorCapGeo = new THREE.BoxGeometry(0.12, 0.08, 0.18);
      const mirrorCap = new THREE.Mesh(mirrorCapGeo, this.materials.accent);
      mirrorCap.position.set((xPos > 0) ? xPos + 0.1 : xPos - 0.1, 0.78, 0.65);
      this.carGroup.add(mirrorCap);
      this.liveryAccentMeshes.push(mirrorCap);
    });
  }

  /**
   * ==========================================================================
   * LIVERY & COLOR CUSTOMIZATION SYSTEM
   * ==========================================================================
   */
  getLiveryPresets() {
    return {
      'official-50': {
        name: 'Official LMH #50 (Rosso & Giallo)',
        body: '#c70000',
        accent: '#facc15',
        rims: '#141418',
        caliper: '#facc15',
        underglow: '#facc15',
        finish: 'gloss',
        number: '50'
      },
      'ak-stealth': {
        name: 'AK Stealth Carbon (#62 Pro)',
        body: '#121217',
        accent: '#f59e0b',
        rims: '#d97706',
        caliper: '#f59e0b',
        underglow: '#f59e0b',
        finish: 'carbon',
        number: '62'
      },
      'giallo-canary': {
        name: 'Giallo Modena Canary',
        body: '#eab308',
        accent: '#dc2626',
        rims: '#09090b',
        caliper: '#dc2626',
        underglow: '#eab308',
        finish: 'metallic',
        number: '50'
      },
      'azzurro-corsa': {
        name: 'Azzurro Le Mans Corsa',
        body: '#0284c7',
        accent: '#06b6d4',
        rims: '#e2e8f0',
        caliper: '#06b6d4',
        underglow: '#06b6d4',
        finish: 'gloss',
        number: '62'
      },
      'bianco-avus': {
        name: 'Bianco Avus Pearl',
        body: '#f8fafc',
        accent: '#ef4444',
        rims: '#18181b',
        caliper: '#ef4444',
        underglow: '#ef4444',
        finish: 'pearl',
        number: '50'
      },
      'verde-scuderia': {
        name: 'Verde Scuderia Racing',
        body: '#047857',
        accent: '#84cc16',
        rims: '#d4af37',
        caliper: '#84cc16',
        underglow: '#84cc16',
        finish: 'metallic',
        number: '62'
      },
      'hyper-violet': {
        name: 'Hyper Violet Midnight',
        body: '#581c87',
        accent: '#ec4899',
        rims: '#0f172a',
        caliper: '#ec4899',
        underglow: '#ec4899',
        finish: 'metallic',
        number: '50'
      },
      'papaya-gulf': {
        name: 'Papaya Gulf Endurance',
        body: '#ea580c',
        accent: '#38bdf8',
        rims: '#18181b',
        caliper: '#38bdf8',
        underglow: '#ea580c',
        finish: 'gloss',
        number: '62'
      }
    };
  }

  applyLivery(presetKey) {
    const presets = this.getLiveryPresets();
    const config = presets[presetKey] || presets['official-50'];
    this.currentLivery = presetKey;
    this.customColors = { ...config };

    this.updateCarColors(this.customColors);
    this.syncUIWithConfig(config);
  }

  setCustomColor(type, hexColor) {
    if (this.customColors[type] !== undefined) {
      this.customColors[type] = hexColor;
      this.updateCarColors(this.customColors);
    }
  }

  setFinish(finishType) {
    this.customColors.finish = finishType;
    this.updateCarColors(this.customColors);
  }

  updateCarColors(cfg) {
    if (!this.materials.body) return;

    // 1. Update Body Material & Finish
    const bodyColor = new THREE.Color(cfg.body);
    this.materials.body.color.copy(bodyColor);

    if (cfg.finish === 'gloss') {
      this.materials.body.metalness = 0.5;
      this.materials.body.roughness = 0.15;
      this.materials.body.clearcoat = 1.0;
      this.materials.body.clearcoatRoughness = 0.08;
    } else if (cfg.finish === 'metallic' || cfg.finish === 'pearl') {
      this.materials.body.metalness = 0.88;
      this.materials.body.roughness = 0.22;
      this.materials.body.clearcoat = 0.95;
      this.materials.body.clearcoatRoughness = 0.12;
    } else if (cfg.finish === 'matte') {
      this.materials.body.metalness = 0.25;
      this.materials.body.roughness = 0.72;
      this.materials.body.clearcoat = 0.0;
    } else if (cfg.finish === 'carbon') {
      this.materials.body.metalness = 0.7;
      this.materials.body.roughness = 0.38;
      this.materials.body.clearcoat = 0.85;
    }

    // 2. Update Livery Accent Material (Swooshes, Endplates, Decals)
    const accentColor = new THREE.Color(cfg.accent);
    this.materials.accent.color.copy(accentColor);

    // 3. Update Rims Material
    const rimColor = new THREE.Color(cfg.rims);
    this.materials.rim.color.copy(rimColor);

    // 4. Update Brembo Caliper Material
    const caliperColor = new THREE.Color(cfg.caliper);
    this.materials.caliper.color.copy(caliperColor);

    // 5. Update Underglow & Studio Rim Lighting
    if (this.underglowLight) {
      this.underglowLight.color.copy(new THREE.Color(cfg.underglow || cfg.accent));
    }
    if (this.rimLightGold) {
      this.rimLightGold.color.copy(new THREE.Color(cfg.accent));
    }

    // 6. Update badge displays if any
    const specCarName = document.getElementById('showcase-car-name');
    if (specCarName) {
      specCarName.textContent = `LE MANS HYPERCAR • ${cfg.name || 'CUSTOM SPEC'}`;
    }
  }

  syncUIWithConfig(cfg) {
    const bodyPicker = document.getElementById('car-color-body-input');
    const accentPicker = document.getElementById('car-color-accent-input');
    const rimPicker = document.getElementById('car-color-rim-input');
    const underglowPicker = document.getElementById('car-color-underglow-input');

    if (bodyPicker) bodyPicker.value = cfg.body;
    if (accentPicker) accentPicker.value = cfg.accent;
    if (rimPicker) rimPicker.value = cfg.rims;
    if (underglowPicker) underglowPicker.value = cfg.underglow || cfg.accent;

    // Update active livery button
    document.querySelectorAll('.livery-preset-card').forEach(card => {
      card.classList.toggle('active-livery', card.getAttribute('data-livery') === this.currentLivery);
    });
  }

  /**
   * ==========================================================================
   * EXHAUST FLAME PARTICLES & BURNOUT SMOKE
   * ==========================================================================
   */
  setupExhaustParticles() {
    this.flameParticles = [];
    this.smokeParticles = [];
  }

  spawnExhaustFlame(isBigBurst = false) {
    if (!this.exhaustTips || this.exhaustTips.length === 0) return;

    const count = isBigBurst ? 18 : 6;
    this.exhaustTips.forEach(tip => {
      const tipPos = new THREE.Vector3();
      tip.getWorldPosition(tipPos);

      for (let i = 0; i < count; i++) {
        const pGeo = new THREE.SphereGeometry(isBigBurst ? 0.16 : 0.09, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: isBigBurst ? 0xff2200 : (Math.random() < 0.35 ? 0x38bdf8 : 0xf59e0b),
          transparent: true,
          opacity: 0.95
        });
        const mesh = new THREE.Mesh(pGeo, pMat);
        mesh.position.copy(tipPos);
        mesh.position.x += (Math.random() - 0.5) * 0.08;
        mesh.position.y += (Math.random() - 0.5) * 0.08;

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.2 + 0.15,
          -(1.8 + Math.random() * 3.2) // High velocity exhaust flame plume
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
      setTimeout(() => { badge.style.opacity = '0'; }, 650);
    }
  }

  spawnBurnoutSmoke() {
    if (!this.wheels || this.wheels.length < 4) return;
    
    // Rear wheels (index 2 & 3)
    [this.wheels[2], this.wheels[3]].forEach(w => {
      const wPos = new THREE.Vector3();
      w.getWorldPosition(wPos);

      for (let i = 0; i < 4; i++) {
        const sGeo = new THREE.SphereGeometry(0.28 + Math.random() * 0.32, 8, 8);
        const sMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          transparent: true,
          opacity: 0.45,
          roughness: 0.95
        });
        const sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.position.copy(wPos);
        sMesh.position.x += (Math.random() - 0.5) * 0.35;
        sMesh.position.y += Math.random() * 0.2;
        sMesh.position.z += (Math.random() - 0.5) * 0.35;

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.45,
          0.35 + Math.random() * 0.45,
          (Math.random() - 0.5) * 0.45
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
    }, 3800);
  }

  /**
   * ==========================================================================
   * CAMERA PRESETS
   * ==========================================================================
   */
  setCameraPreset(viewName) {
    if (!this.camera || !this.controls) return;

    if (viewName === 'front34') {
      this.camera.position.set(4.8, 1.8, 5.2);
      this.controls.target.set(0, 0.55, 0);
    } else if (viewName === 'side') {
      this.camera.position.set(6.8, 1.3, 0);
      this.controls.target.set(0, 0.55, 0);
    } else if (viewName === 'rear') {
      this.camera.position.set(0, 1.25, -5.4);
      this.controls.target.set(0, 0.5, 0);
    } else if (viewName === 'cockpit') {
      this.camera.position.set(0, 1.35, 0.35);
      this.controls.target.set(0, 0.9, 8.0);
    } else if (viewName === 'sharkfin') {
      this.camera.position.set(-2.2, 2.4, -2.8);
      this.controls.target.set(0, 0.9, -1.0);
    } else if (viewName === 'top') {
      this.camera.position.set(0, 8.5, 0.1);
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
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-preset-btn').forEach(b => {
          b.classList.remove('active', 'bg-amber-500/20', 'border-amber-400', 'text-amber-300', 'bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
        });
        btn.classList.add('active', 'bg-amber-500/20', 'border-amber-400', 'text-amber-300');
        const view = btn.getAttribute('data-camera-view');
        this.setCameraPreset(view);
      });
    });

    // Livery Preset Cards
    document.querySelectorAll('.livery-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const liveryKey = card.getAttribute('data-livery');
        this.applyLivery(liveryKey);
      });
    });

    // Interactive Real-Time Color Inputs
    const bodyInput = document.getElementById('car-color-body-input');
    if (bodyInput) {
      bodyInput.addEventListener('input', (e) => {
        this.setCustomColor('body', e.target.value);
        const hexLabel = document.getElementById('car-color-body-hex');
        if (hexLabel) hexLabel.textContent = e.target.value.toUpperCase();
      });
    }

    const accentInput = document.getElementById('car-color-accent-input');
    if (accentInput) {
      accentInput.addEventListener('input', (e) => {
        this.setCustomColor('accent', e.target.value);
        const hexLabel = document.getElementById('car-color-accent-hex');
        if (hexLabel) hexLabel.textContent = e.target.value.toUpperCase();
      });
    }

    const rimInput = document.getElementById('car-color-rim-input');
    if (rimInput) {
      rimInput.addEventListener('input', (e) => {
        this.setCustomColor('rims', e.target.value);
        const hexLabel = document.getElementById('car-color-rim-hex');
        if (hexLabel) hexLabel.textContent = e.target.value.toUpperCase();
      });
    }

    const underglowInput = document.getElementById('car-color-underglow-input');
    if (underglowInput) {
      underglowInput.addEventListener('input', (e) => {
        this.setCustomColor('underglow', e.target.value);
      });
    }

    // Finish Finish Type Buttons (Gloss, Metallic, Matte, Carbon)
    document.querySelectorAll('.finish-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.finish-type-btn').forEach(b => b.classList.remove('active-finish'));
        btn.classList.add('active-finish');
        const finish = btn.getAttribute('data-finish');
        this.setFinish(finish);
      });
    });

    // Toggle Matrix LEDs
    const ledBtn = document.getElementById('toggle-headlights-btn');
    if (ledBtn) {
      ledBtn.addEventListener('click', () => {
        this.headlightsOn = !this.headlightsOn;
        this.headlights.forEach(hl => { hl.visible = this.headlightsOn; });
        if (this.rearLightBar) this.rearLightBar.visible = this.headlightsOn;
        ledBtn.classList.toggle('text-amber-300', this.headlightsOn);
      });
    }

    // Toggle Underglow
    const ugBtn = document.getElementById('toggle-underglow-btn');
    if (ugBtn) {
      ugBtn.addEventListener('click', () => {
        this.underglowOn = !this.underglowOn;
        if (this.underglowLight) this.underglowLight.visible = this.underglowOn;
        ugBtn.classList.toggle('text-amber-300', this.underglowOn);
      });
    }

    // Burnout Button
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

    const wheelSpinSpeed = (currentSpeed * 0.08) + (this.isBurnoutActive ? 1.6 : 0);
    this.wheels.forEach(w => {
      w.rotation.x += wheelSpinSpeed;
    });

    // 3. Glowing Brembo Carbon Brakes on braking
    const isBraking = window.fireSpeedo && window.fireSpeedo.brake > 0.1;
    this.brakeDiscs.forEach(discMat => {
      if (isBraking) {
        discMat.emissive.setHex(0xff3300);
        discMat.emissiveIntensity = 2.8;
      } else {
        discMat.emissiveIntensity = Math.max(0, discMat.emissiveIntensity - dt * 2.2);
      }
    });

    // 4. Exhaust Flames when revving high
    if (currentRpm > 6500 && currentThrottle > 0.5) {
      if (Math.random() < 0.52) {
        this.spawnExhaustFlame(currentRpm > 8600);
      }
    }

    // 5. Burnout Smoke
    if (this.isBurnoutActive) {
      this.spawnBurnoutSmoke();
    }

    // 6. Update 3D Flame Particles
    for (let i = this.flameParticles.length - 1; i >= 0; i--) {
      const p = this.flameParticles[i];
      p.mesh.position.addScaledVector(p.velocity, dt * 16);
      p.life -= p.decay;
      p.mesh.scale.multiplyScalar(0.93);
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
      s.mesh.scale.multiplyScalar(1.04);
      s.mesh.material.opacity = s.life * 0.45;

      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }

    // 8. Dynamic Chassis Pitch & Roll (Squats on launch, dives on braking)
    if (this.carGroup) {
      const targetPitch = isBraking ? -0.045 : (currentThrottle * 0.04);
      this.carGroup.rotation.x += (targetPitch - this.carGroup.rotation.x) * 0.1;
    }

    // 9. Render
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.animate);
  }
}

// Global Car Instance
window.akCar3D = null;
