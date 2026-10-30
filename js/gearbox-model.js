/**
 * Ajith Kumar Racing - Sequential 6-Speed Gearbox & Rev-Match Calculator
 */
class GearboxModel {
    constructor() {
        this.ratios = [3.15, 2.21, 1.72, 1.38, 1.15, 0.98]; // 1st to 6th
        this.finalDrive = 3.65;
        this.tireRadiusM = 0.34;
        this.shiftCutMs = 42; // Ignition cut duration for pneumatic upshift
        this.revMatchBlipMs = 85; // Auto-blip duration for downshift
    }

    calculateSpeedAtRpm(gear, rpm) {
        if (gear < 1 || gear > 6) return 0;
        const ratio = this.ratios[gear - 1] * this.finalDrive;
        const wheelRpm = rpm / ratio;
        const speedMs = (wheelRpm * 2 * Math.PI * this.tireRadiusM) / 60;
        return parseFloat((speedMs * 3.6).toFixed(1));
    }

    calculateDownshiftTargetRpm(currentGear, currentSpeedKmh) {
        if (currentGear <= 1) return 0;
        const targetGear = currentGear - 1;
        const targetRatio = this.ratios[targetGear - 1] * this.finalDrive;
        const wheelSpeedMs = currentSpeedKmh / 3.6;
        const wheelRpm = (wheelSpeedMs * 60) / (2 * Math.PI * this.tireRadiusM);
        return Math.min(9000, Math.round(wheelRpm * targetRatio));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GearboxModel };
}
