/**
 * AK Racing - G-Force Vector Ball & Friction Circle Visualizer
 * Real-time 2D canvas displaying lateral and longitudinal acceleration vectors up to 3.5G.
 */
export class GForceMeter {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.maxG = 3.5;
  }

  draw(longitudinalG, lateralG) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.42;

    ctx.clearRect(0, 0, w, h);

    // Friction circle rings (1G, 2G, 3G)
    for (let g = 1; g <= 3; g++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (g / this.maxG) * radius, 0, Math.PI * 2);
      ctx.strokeStyle = g === 3 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
    ctx.stroke();

    // G-Ball position
    const ballX = cx + (lateralG / this.maxG) * radius;
    const ballY = cy - (longitudinalG / this.maxG) * radius;

    // Glowing G-Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
