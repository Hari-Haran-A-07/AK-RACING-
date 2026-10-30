/**
 * Ajith Kumar Racing - Rival Competitor Delta Tracker
 */
class RivalTracker {
    constructor() {
        this.rivals = [
            { name: "Ferrari 296 GT3 #51", gapSec: -1.24, car: "AF Corse", deltaTrend: -0.05 },
            { name: "Porsche 911 GT3 R #92", gapSec: 0.85, car: "Manthey Racing", deltaTrend: 0.12 },
            { name: "AMG GT3 Evo #77", gapSec: 3.40, car: "Mercedes-AMG", deltaTrend: 0.28 },
            { name: "BMW M4 GT3 #46", gapSec: 5.10, car: "Team WRT", deltaTrend: -0.10 }
        ];
    }

    updateGaps(lapDeltaChange) {
        return this.rivals.map(rival => {
            const newGap = rival.gapSec + (rival.deltaTrend + lapDeltaChange);
            const drsAvailable = newGap > 0 && newGap <= 1.000;
            return {
                ...rival,
                gapSec: parseFloat(newGap.toFixed(3)),
                drsAvailable
            };
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RivalTracker };
}
