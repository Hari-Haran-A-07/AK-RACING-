# 📜 Changelog - Ajith Kumar Racing Platform

All notable changes to this project are documented in this file.

## [2.5.0-pro] - 2026-10-29

### 🏎️ Added & Enhanced
- **docs/ARCHITECTURE.md**: Comprehensive systems engineering and 3D rendering pipeline specification.
- **PWA Integration**: Offline Web App Manifest and Service Worker caching strategy (`manifest.json`, `sw.js`).
- **Telemetry Recorder & Exporter**: 60Hz CSV and JSON session export for sim racing analytics (`js/telemetry-recorder.js`).
- **Pit Radio Communications**: Procedural military bandpass voice filter and pit-crew audio chatter simulator (`js/radio-chatter.js`).
- **Tire Thermal Physics Model**: Individual FL/FR/RL/RR tire wear, core temperatures, and grip degradation (`js/tire-physics.js`).
- **Gamepad API Integration**: Direct support for Logitech G29, Thrustmaster wheels, and standard controllers (`js/gamepad.js`).
- **Dynamic HUD Presets**: Broadcast, Cockpit, Minimalist, and Dyno layouts (`js/hud-manager.js`).
- **Dynamic Weather System**: Rain canvas overlays and dynamic road friction coefficients (`js/weather-system.js`).
- **Precision Lap Timer**: Sector 1/2/3 splits and persistent leaderboard storage (`js/lap-timer.js`).
- **Modular Audio Synthesis**: Dedicated sub-synthesizers for V6 combustion, MGU-K whine, and anti-lag (`js/engine-synth.js`).
- **Tactile Haptic Feedback**: Mobile vibration patterns for paddle shifting and launch control (`js/haptics.js`).
- **Full Accessibility (a11y)**: Screen reader live regions and ARIA telemetry announcements (`js/accessibility.js`).
- **Ghost Lap Replay**: 60-second telemetry comparison playback engine (`js/replay-engine.js`).
- **2D G-Force Friction Circle**: Real-time canvas acceleration ball visualizer (`js/gforce-meter.js`).
- **Dynamic Resolution Scaling**: Automatic DPR and particle throttling for rock-solid 60 FPS (`js/perf-optimizer.js`).
- **Interactive Aerodynamics Setup**: Adjustable wing downforce, brake bias %, and differential tuning (`js/car-setup.js`).
- **SEO & Social Metadata**: Complete OpenGraph, Twitter Cards, and schema.org SportsTeam JSON-LD (`index.html`).
- **JSDoc Documentation**: Comprehensive annotations across 3D WebGL meshes and lighting (`js/car3d.js`).
- **Automated Unit Tests**: Physics and Web Audio API test suites (`tests/physics.test.js`, `tests/audio.test.js`).
- **Keyboard Shortcuts Cheat Sheet**: Interactive Cyberpunk HUD modal (`js/shortcuts-modal.js`).
- **Paddock Ambient Sounds**: Pneumatic wheel guns and pit lane atmosphere (`js/paddock-audio.js`).
- **Environmental Circuit Themes**: Midnight, Spa Dusk, and Monza Noon lighting presets (`css/themes.css`, `js/theme-switcher.js`).
- **FIA ECU Diagnostic Simulator**: Simulated motorsport DTC error codes (`js/ecu-diagnostics.js`).
- **4K Screenshot Utility**: High-resolution PNG livery capture and wallpaper download (`js/screenshot-utility.js`).
- **GitHub Actions CI**: Automated continuous integration test runner (`.github/workflows/ci.yml`).
- **Synthwave Paddock Radio**: Procedural Web Audio 80s arpeggio player (`js/synthwave-radio.js`).
- **Community Standards**: `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
- **Speedometer Particle Optimization**: Pre-allocated particle buffer pools eliminating GC stutter (`js/speedometer.js`).
- **Multi-Language Telemetry (i18n)**: English, Tamil, Italian, French, and German translation dictionary (`js/i18n.js`).
