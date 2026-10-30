/**
 * Ajith Kumar Racing - Tire Smoke & Dynamic Skid Mark Particle System
 */
class SkidmarkParticles {
    constructor(canvasId) {
        this.particles = [];
        this.skidPaths = [];
    }

    emitSmoke(x, y, slipFactor) {
        if (slipFactor < 0.3) return;
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3,
                opacity: 0.6 * slipFactor,
                radius: 4 + Math.random() * 6
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.radius += 0.4;
            p.opacity -= 0.02;
        });
        this.particles = this.particles.filter(p => p.opacity > 0);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkidmarkParticles };
}
