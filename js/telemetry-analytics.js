/**
 * Ajith Kumar Racing - Telemetry Analytics Engine
 * Calculates dynamic slip angles, lateral tire scrub, fuel burn rates, and stint tire degradation.
 */
class TelemetryAnalytics {
    constructor(config = {}) {
        this.wheelbase = config.wheelbase || 2.65; // meters (GT3 spec)
        this.trackWidth = config.trackWidth || 1.68;
        this.fuelDensity = config.fuelDensity || 0.745; // kg/L
        this.baseFuelBurnRate = config.baseFuelBurnRate || 3.12; // L per lap
        this.history = [];
    }

    /**
     * Calculate tire slip angle alpha in degrees
     * @param {number} vx Longitudinal velocity (m/s)
     * @param {number} vy Lateral velocity (m/s)
     * @param {number} steerAngle Steer angle in radians
     * @returns {number} Slip angle in degrees
     */
    calculateSlipAngle(vx, vy, steerAngle) {
        if (Math.abs(vx) < 0.1) return 0;
        const bodySlip = Math.atan2(vy, Math.abs(vx));
        const alpha = bodySlip - steerAngle;
        return (alpha * 180) / Math.PI;
    }

    /**
     * Calculate fuel consumption per kilometer based on throttle duty cycle
     */
    calculateFuelRate(throttlePct, rpm, currentSpeedKmh) {
        const speedKmh = Math.max(1, currentSpeedKmh);
        const rpmFactor = rpm / 8500;
        const throttleFactor = Math.pow(throttlePct / 100, 1.35);
        const lPerHour = 18.0 + (rpmFactor * 78.0 * throttleFactor);
        const lPer100km = (lPerHour / speedKmh) * 100;
        return {
            instantaneousLPerHour: parseFloat(lPerHour.toFixed(2)),
            lPer100km: parseFloat(lPer100km.toFixed(2))
        };
    }

    /**
     * Record a telemetry frame snapshot
     */
    recordSnapshot(snapshot) {
        this.history.push({
            timestamp: Date.now(),
            ...snapshot
        });
        if (this.history.length > 3600) {
            this.history.shift(); // retain 60 seconds at 60Hz
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TelemetryAnalytics };
}
