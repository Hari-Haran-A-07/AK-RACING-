# 🏛️ AK RACING — System Architecture & Technical Specifications

## 1. Overview
The **Ajith Kumar Racing GT3 / Le Mans Hypercar Digital Platform** is an ultra-high performance, client-side web application built with zero heavy framework bloat. It leverages WebGL (via Three.js), the Web Audio API for real-time procedural physical acoustics, and HTML5 Canvas 2D for high-frequency fire telemetry rendering.

## 2. Core Architectural Subsystems

### 2.1 3D Hypercar WebGL Scene (`js/car3d.js`)
- **Render Engine:** Three.js (r128) WebGLRenderer with `antialias: true`, `powerPreference: "high-performance"`, and ACESFilmicToneMapping.
- **Mesh Construction:** Procedural low/mid-poly aerodynamics model of the Le Mans 499P Hypercar featuring:
  - Longitudinal shark fin dorsal stabilizer
  - Dual-element swan-neck rear wing with carbon endplates
  - Wide front splitter and sculpted aerodynamic intercooler sidepods
  - Multi-tier BBS forged alloy rims with Brembo carbon-ceramic brake discs
- **Particle Flame Emitters:** Dual exhaust exhaust manifolds emitting 3D particle plumes dynamic to engine throttle, shift-cut backfire bursts, and burnout tire smoke.

### 2.2 Procedural Audio Dyno Engine (`js/audio.js`)
- **Acoustic Graph:** 100% procedurally synthesized audio using the browser's Web Audio API.
- **Sub-oscillators:**
  - `primaryV6`: Custom periodic wave simulating 120° V6 cylinder combustion firing frequencies ($f = \frac{\text{RPM} \times 6}{120}$).
  - `subHarmonic`: 0.5x sub-bass oscillator for low-end exhaust rumble.
  - `mguKMotor`: High-frequency triangle wave (2,500Hz - 8,000Hz) modulated by throttle for hybrid electric motor whine.
  - `turboWhistle`: Bandpass filtered white noise buffer modulated by boost pressure.
  - `backfirePops`: Transient impulse bursts simulating unburnt fuel combustion in exhaust manifolds on downshifts.

### 2.3 Canvas Fire Speedometer HUD (`js/speedometer.js`)
- **Tachometer Range:** 0 to 10,000 RPM (Redline at 9,500 RPM).
- **Speedometer Range:** 0 to 380 km/h with 7-speed sequential paddle shift transmission simulation.
- **Particle System:** 400+ dynamic fire embers and plasma particles with physics-based velocity, drag, turbulence jitter, and alpha dissipation.
- **Floating HUD:** Movable HUD supporting canvas drag-and-drop repositioning across viewports.

## 3. Data Flow & Event Bus
User keyboard events (`W`, `S`, `Q`, `E`, `Space`, `M`, `N`, `L`, `B`) propagate through the master controller (`js/main.js`), driving physics variables (throttle, brake, RPM, velocity, gear, heat) that synchronously feed the 3D car animation loop, the audio synthesizer nodes, and the telemetry dashboard.
