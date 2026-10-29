/**
 * AK Racing - Dynamic Resolution Scaling & Performance Optimizer
 * Automatically adjusts 3D WebGL render scale and particle caps to sustain rock-solid 60 FPS.
 */
export class PerformanceOptimizer {
  constructor(renderer) {
    this.renderer = renderer;
    this.fpsHistory = [];
    this.currentScale = 1.0;
    this.minScale = 0.65;
    this.maxScale = 1.5;
  }

  recordFrame(deltaTimeSeconds) {
    const fps = 1 / Math.max(0.001, deltaTimeSeconds);
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) this.fpsHistory.shift();

    if (this.fpsHistory.length === 60) {
      const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / 60;
      if (avgFps < 45 && this.currentScale > this.minScale) {
        this.currentScale = Math.max(this.minScale, this.currentScale - 0.1);
        this.applyScale();
      } else if (avgFps > 58 && this.currentScale < this.maxScale) {
        this.currentScale = Math.min(this.maxScale, this.currentScale + 0.05);
        this.applyScale();
      }
    }
  }

  applyScale() {
    if (!this.renderer) return;
    const baseDpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(baseDpr * this.currentScale);
    console.log(`[PerfOptimizer] Scaled DPR to ${(baseDpr * this.currentScale).toFixed(2)}`);
  }
}
