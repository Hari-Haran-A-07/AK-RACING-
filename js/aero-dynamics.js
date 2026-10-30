/**
 * Ajith Kumar Racing - Aerodynamics & Ground Effect Dynamics
 * Calculates aerodynamic downforce (Cl), drag resistance (Cd), and pitch sensitivity.
 */
class AeroDynamicsModel {
    constructor(config = {}) {
        this.airDensity = 1.225; // kg/m3 (standard sea level)
        this.frontalArea = config.frontalArea || 2.15; // m^2
        this.baseCl = config.baseCl || 2.85; // Downforce coefficient
        this.baseCd = config.baseCd || 0.68; // Drag coefficient
        this.rearWingAngleDeg = config.rearWingAngleDeg || 12.0;
        this.diffuserEfficiency = 0.92;
    }

    calculateAeroForces(speedKmh, frontRideHeightMm = 45, rearRideHeightMm = 65) {
        const speedMs = speedKmh / 3.6;
        const dynamicPressure = 0.5 * this.airDensity * Math.pow(speedMs, 2);

        // Ground effect venturi multiplier based on ride height
        const groundEffectFactor = Math.max(0.7, 1.4 - (frontRideHeightMm / 100));
        const effectiveCl = (this.baseCl + (this.rearWingAngleDeg * 0.08)) * groundEffectFactor;
        const effectiveCd = this.baseCd + (this.rearWingAngleDeg * 0.022);

        const downforceN = dynamicPressure * this.frontalArea * effectiveCl;
        const dragN = dynamicPressure * this.frontalArea * effectiveCd;

        return {
            speedKmh,
            downforceNewtons: parseFloat(downforceN.toFixed(1)),
            dragNewtons: parseFloat(dragN.toFixed(1)),
            downforceKg: parseFloat((downforceN / 9.81).toFixed(1)),
            liftToDragRatio: parseFloat((effectiveCl / effectiveCd).toFixed(2))
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AeroDynamicsModel };
}
