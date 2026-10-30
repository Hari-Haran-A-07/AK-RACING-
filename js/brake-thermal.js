/**
 * Ajith Kumar Racing - Carbon-Ceramic Brake Thermal Dissipation Model
 */
class BrakeThermalModel {
    constructor() {
        this.ambientTempC = 28.0;
        this.discTemps = { fl: 180, fr: 180, rl: 150, rr: 150 }; // Celsius
        this.coolingEfficiency = 0.045; // W/K cooling duct factor
    }

    update(brakePressurePct, currentSpeedKmh, dtSeconds) {
        const speedFactor = currentSpeedKmh / 100.0;
        for (const wheel of ['fl', 'fr', 'rl', 'rr']) {
            const bias = wheel.startsWith('f') ? 0.58 : 0.42;
            const heatInput = (brakePressurePct / 100.0) * speedFactor * 450 * bias * dtSeconds;
            const cooling = (this.discTemps[wheel] - this.ambientTempC) * (this.coolingEfficiency + speedFactor * 0.08) * dtSeconds;
            this.discTemps[wheel] = Math.max(this.ambientTempC, this.discTemps[wheel] + heatInput - cooling);
        }

        const avgFront = (this.discTemps.fl + this.discTemps.fr) / 2;
        const brakeFade = avgFront > 850 ? Math.max(0.35, 1.0 - ((avgFront - 850) / 400)) : 1.0;

        return {
            temperatures: { ...this.discTemps },
            fadeFactor: parseFloat(brakeFade.toFixed(3)),
            optimalWindow: avgFront >= 400 && avgFront <= 800
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BrakeThermalModel };
}
