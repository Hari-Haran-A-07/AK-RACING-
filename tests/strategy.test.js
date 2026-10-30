const assert = require('assert');
const { PitStrategyOptimizer } = require('../js/pit-strategy.js');
const { RivalTracker } = require('../js/rival-tracker.js');

const solver = new PitStrategyOptimizer(60, 24.0);
const strategy = solver.solveOptimalStints(95.0, 0.15);

assert(strategy.recommendedStops >= 1, "Must recommend at least 1 pit stop");
assert(strategy.pitWindows.length === strategy.recommendedStops, "Pit window count must match stop count");

const tracker = new RivalTracker();
const rivals = tracker.updateGaps(-0.1);
assert(Array.isArray(rivals), "Rivals should be an array");
assert(rivals.length > 0, "Rivals array should not be empty");

console.log("✔ Race Strategy Unit Tests Passed Successfully!");
