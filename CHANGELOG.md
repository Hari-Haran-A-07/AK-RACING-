# 📜 Changelog - Ajith Kumar Racing Platform

All notable changes to this project are documented in this file.

## [2.6.0-enterprise] - 2026-10-30

### 🚀 Telemetry & Analytics Suite
- **Telemetry Analytics Engine (`js/telemetry-analytics.js`)**: Real-time slip angle calculations, tire scrub, and fuel burn rate models.
- **Circuit Telemetry Profiles (`data/circuits/`)**: Official benchmarks for Dubai Autodrome 24H, Autodromo Nazionale Monza, Spa-Francorchamps, and Nürburgring Nordschleife.
- **Interactive SVG Circuit Loader (`js/circuit-loader.js`)**: Dynamic circuit loading and SVG track map generation.
- **MoTeC i2 Pro & CSV Streaming Exporters (`js/motec-exporter.js`, `js/csv-telemetry.js`)**: Professional telemetry export formats.
- **Race Stint Report Generator (`js/race-report.js`)**: Post-session performance digest.

### 🏎️ Vehicle Dynamics & Aerodynamics
- **Ground-Effect Aerodynamics (`js/aero-dynamics.js`)**: Cl/Cd dynamic downforce and drag polar ground effect model.
- **Brake Thermal Simulation (`js/brake-thermal.js`)**: Carbon-ceramic disc heat generation and brake fade degradation.
- **Sequential Gearbox Model (`js/gearbox-model.js`)**: 6-speed ratios with 42ms shift-cuts and rev-match auto-blip calculations.
- **Fuel Cell Dynamics (`js/fuel-dynamics.js`)**: 120-liter fuel burn and center-of-gravity migration.
- **Suspension Kinematics (`js/suspension-kinematics.js`)**: Dynamic camber gain and anti-roll bar stiffness simulation.

### 🧠 Race Strategy & Incidents
- **AI Pit Strategy Optimizer (`js/pit-strategy.js`)**: Optimal pit stop window and undercut/overcut solver.
- **Live Competitor Radar (`js/rival-tracker.js`)**: Real-time rival delta gap and DRS zone detection.
- **Safety Car Monitor (`js/race-incidents.js`)**: Full course yellow (FCY) and VSC delta compliance tracking.
- **Doppler Weather Radar (`js/weather-radar.js`)**: Precipitation canvas radar sweep.
- **Driver Biometrics (`js/biometrics.js`)**: Cockpit temperature, heart rate, and cardiovascular strain index.

### 🔊 Acoustic Synthesizers & Visuals
- **Turbocharger & Wastegate Synth (`js/turbo-synth.js`)**: Procedural high-frequency spool whine and blow-off chirp.
- **Exhaust Backfire Synth (`js/exhaust-backfire.js`)**: Overrun combustion pops and crackles.
- **Transmission Whine (`js/gear-whine.js`)**: Straight-cut dog-ring racing gearbox acoustic simulation.
- **Chassis Impact Audio (`js/chassis-impact.js`)**: Resonant curb rumble strip audio thumps.
- **Skidmark Particle System (`js/skidmark-particles.js`)**: Lock-up tire smoke and dynamic tarmac rubber tracks.
- **Multi-Angle Camera Director (`js/camera-director.js`)**: Cockpit, chase, bumper, and helicopter angles.
- **Volumetric Headlight Beams (`js/headlight-beams.js`)**: Le Mans night illumination cones.
- **Cosworth Steering Wheel Dash (`js/steering-wheel-dash.js`)**: Multifunction digital steering wheel display.
- **Motorsport Theme HUD (`css/motorsport-hud.css`)**: Shift lights and futuristic telemetry styling.

### 🌐 Internationalization (i18n)
- **Multi-Language Packs (`locales/`)**: Japanese Super GT (`ja.json`), German ADAC GT (`de.json`), Italian Monza (`it.json`), and native Tamil championship pack (`ta.json`).
- **Dynamic Locale Manager (`js/locale-manager.js`)**: Asynchronous locale switcher.

### 🧪 Automated Testing & CI/CD
- **Automated Test Suites (`tests/`)**: Analytics, dynamics, race strategy, audio synthesis, and 10,000-tick 60Hz microbenchmarks (<0.5ms SLA).
- **GitHub Actions Workflows (`.github/workflows/`)**: Automated release packaging and circuit JSON schema linting.
- **Specifications (`docs/`)**: `CIRCUIT_SCHEMA.md` and FIA-homologated `TELEMETRY_SPEC.md`.

---

## [2.5.0-pro] - 2026-10-29

### 🏎️ Added & Enhanced
- PWA Integration, Telemetry Recorder, Pit Radio Chatter, Tire Thermal Model, Gamepad API.
- Dynamic HUD Presets, Weather System, Ghost Replay, G-Force Meter, Dynamic Resolution Scaling.
