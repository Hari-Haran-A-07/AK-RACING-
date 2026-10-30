/**
 * Ajith Kumar Racing - Doppler Weather Radar Canvas Sweep
 */
class WeatherRadarCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.angle = 0;
    }

    renderSweep() {
        if (!this.ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        this.ctx.fillStyle = 'rgba(10, 15, 22, 0.15)';
        this.ctx.fillRect(0, 0, w, h);

        // Circular sweep line
        this.angle += 0.03;
        const endX = cx + Math.cos(this.angle) * (w / 2);
        const endY = cy + Math.sin(this.angle) * (h / 2);

        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherRadarCanvas };
}
