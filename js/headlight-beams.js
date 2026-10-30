/**
 * Ajith Kumar Racing - Volumetric Headlight Illumination Cones
 */
class HeadlightBeams {
    constructor() {
        this.enabled = true;
        this.color = '#ffffdd'; // Endurance Le Mans warm white
        this.beamIntensity = 1.0;
    }

    render(ctx, carX, carY, carAngle) {
        if (!this.enabled || !ctx) return;
        ctx.save();
        ctx.translate(carX, carY);
        ctx.rotate(carAngle);
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 120, 140);
        grad.addColorStop(0, 'rgba(255, 255, 220, 0.45)');
        grad.addColorStop(1, 'rgba(255, 255, 220, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 160, -0.45, 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeadlightBeams };
}
