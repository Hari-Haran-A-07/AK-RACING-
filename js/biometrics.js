/**
 * Ajith Kumar Racing - Driver Biometric & Strain Index Monitor
 */
class DriverBiometrics {
    constructor() {
        this.driverName = "Ajith Kumar";
        this.restingHeartRate = 58;
        this.currentHeartRate = 142; // BPM under qualifying G-forces
        this.cockpitTempC = 46.5;
        this.hydrationPct = 94.0;
    }

    update(lateralG, cabinTempDelta = 0) {
        const strain = Math.abs(lateralG) * 12.0;
        this.currentHeartRate = Math.min(185, Math.round(135 + strain));
        this.hydrationPct = Math.max(75, this.hydrationPct - 0.005);
        this.cockpitTempC += cabinTempDelta;

        return {
            heartRate: this.currentHeartRate,
            cockpitTempC: parseFloat(this.cockpitTempC.toFixed(1)),
            hydrationPct: parseFloat(this.hydrationPct.toFixed(1)),
            driverStatus: this.currentHeartRate > 175 ? 'HIGH STRAIN' : 'OPTIMAL FOCUS'
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DriverBiometrics };
}
