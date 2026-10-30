/**
 * Ajith Kumar Racing - Suspension Kinematics & Dynamic Camber Simulator
 */
class SuspensionKinematics {
    constructor() {
        this.staticCamberDeg = { front: -3.8, rear: -2.6 };
        this.camberGainPerMmBump = { front: 0.038, rear: 0.024 }; // deg/mm
        this.antiRollBarStiffnessNm = { front: 240, rear: 180 };
    }

    calculateDynamicCamber(wheelPositionMm, chassisRollDeg) {
        const dynamicFront = this.staticCamberDeg.front + (wheelPositionMm * this.camberGainPerMmBump.front) - (chassisRollDeg * 0.82);
        const dynamicRear = this.staticCamberDeg.rear + (wheelPositionMm * this.camberGainPerMmBump.rear) - (chassisRollDeg * 0.75);

        return {
            effectiveFrontCamber: parseFloat(dynamicFront.toFixed(2)),
            effectiveRearCamber: parseFloat(dynamicRear.toFixed(2)),
            inTireContactOptimalPatch: Math.abs(dynamicFront) >= 1.5 && Math.abs(dynamicFront) <= 4.2
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SuspensionKinematics };
}
