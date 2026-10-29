/**
 * AK Racing - Ghost Replay & Telemetry Comparison Engine
 * Records lap frames and visualizes a virtual ghost curve to assist telemetry lap optimization.
 */
export class ReplayEngine {
  constructor() {
    this.ghostTrack = [];
    this.isPlaying = false;
    this.playbackIndex = 0;
  }

  loadGhost(frames) {
    if (Array.isArray(frames) && frames.length > 0) {
      this.ghostTrack = [...frames];
      console.log(`[ReplayEngine] Ghost lap loaded with ${this.ghostTrack.length} samples.`);
    }
  }

  startPlayback() {
    this.isPlaying = true;
    this.playbackIndex = 0;
  }

  getCurrentGhostFrame() {
    if (!this.isPlaying || !this.ghostTrack.length) return null;
    const frame = this.ghostTrack[this.playbackIndex];
    this.playbackIndex = (this.playbackIndex + 1) % this.ghostTrack.length;
    return frame;
  }

  getDelta(currentSpeed, currentRpm) {
    const ghost = this.getCurrentGhostFrame();
    if (!ghost) return null;
    return {
      speedDelta: currentSpeed - ghost.speedKmh,
      rpmDelta: currentRpm - ghost.rpm
    };
  }
}
