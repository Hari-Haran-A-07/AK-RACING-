/**
 * Ajith Kumar Racing - Fuel Cell Dynamics & Center-of-Gravity Migration
 */
class FuelDynamicsModel {
    constructor(capacityLiters = 120.0) {
        this.capacityLiters = capacityLiters;
        this.currentFuelLiters = capacityLiters;
        this.fuelDensityKgPerLiter = 0.745;
        this.fuelCellPositionM = { x: 0.0, y: 0.28, z: -0.45 }; // Behind driver
    }

    consume(liters) {
        this.currentFuelLiters = Math.max(0, this.currentFuelLiters - liters);
        const fuelMassKg = this.currentFuelLiters * this.fuelDensityKgPerLiter;
        const frontWeightBiasDeltaPct = -((this.capacityLiters - this.currentFuelLiters) / this.capacityLiters) * 1.8;

        return {
            remainingLiters: parseFloat(this.currentFuelLiters.toFixed(2)),
            remainingMassKg: parseFloat(fuelMassKg.toFixed(2)),
            pctRemaining: parseFloat(((this.currentFuelLiters / this.capacityLiters) * 100).toFixed(1)),
            frontBiasDelta: parseFloat(frontWeightBiasDeltaPct.toFixed(2))
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FuelDynamicsModel };
}
