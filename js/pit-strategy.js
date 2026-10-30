/**
 * Ajith Kumar Racing - Pit Stop Strategy & Undercut Optimizer
 */
class PitStrategyOptimizer {
    constructor(totalRaceLaps = 70, pitLossSec = 24.5) {
        this.totalRaceLaps = totalRaceLaps;
        this.pitLossSec = pitLossSec;
    }

    solveOptimalStints(lapTimePaceSec = 98.5, tireDegPerLapSec = 0.12) {
        let bestStops = 1;
        let lowestTotalTime = Infinity;
        let bestWindows = [];

        for (let stops = 1; stops <= 3; stops++) {
            const stintLength = Math.floor(this.totalRaceLaps / (stops + 1));
            let totalTime = stops * this.pitLossSec;
            let windows = [];

            for (let s = 0; s <= stops; s++) {
                const currentLaps = s === stops ? this.totalRaceLaps - (stintLength * stops) : stintLength;
                const stintDegTime = (currentLaps * (currentLaps - 1) / 2) * tireDegPerLapSec;
                totalTime += (currentLaps * lapTimePaceSec) + stintDegTime;
                if (s < stops) windows.push((s + 1) * stintLength);
            }

            if (totalTime < lowestTotalTime) {
                lowestTotalTime = totalTime;
                bestStops = stops;
                bestWindows = windows;
            }
        }

        return {
            recommendedStops: bestStops,
            pitWindows: bestWindows,
            estimatedTotalRaceTimeSec: parseFloat(lowestTotalTime.toFixed(1))
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PitStrategyOptimizer };
}
