/**
 * Ajith Kumar Racing - Race Incident & Delta Timer Monitor
 */
class RaceIncidentMonitor {
    constructor() {
        this.status = 'GREEN'; // GREEN, YELLOW, FCY, VSC, RED
        this.vscTargetDeltaSec = 0.0;
        this.currentDeltaSec = 0.0;
    }

    setIncidentStatus(newStatus) {
        this.status = newStatus;
        if (newStatus === 'VSC') {
            this.vscTargetDeltaSec = 0.0;
            this.currentDeltaSec = 0.45; // Must stay positive
        }
        return { status: this.status, alert: `RACE CONTROL: ${this.status} DEPLOYED` };
    }

    checkDeltaCompliance(currentDelta) {
        this.currentDeltaSec = currentDelta;
        return {
            compliant: this.currentDeltaSec >= 0.0,
            deltaFormatted: (this.currentDeltaSec >= 0 ? `+${this.currentDeltaSec.toFixed(3)}s` : `${this.currentDeltaSec.toFixed(3)}s`),
            penaltyRisk: this.currentDeltaSec < 0.0 ? 'WARNING: DELTA NEGATIVE' : 'NOMINAL'
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RaceIncidentMonitor };
}
