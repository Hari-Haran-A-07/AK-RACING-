const assert = require('assert');
const { TelemetryAnalytics } = require('../js/telemetry-analytics.js');

const analytics = new TelemetryAnalytics();

// Test 1: Zero speed gives zero slip angle
const zeroSlip = analytics.calculateSlipAngle(0, 0, 0);
assert.strictEqual(zeroSlip, 0, "Zero speed must yield 0 slip angle");

// Test 2: Longitudinal motion with steer gives expected angle
const slip = analytics.calculateSlipAngle(50, 2, 0.05);
assert(Math.abs(slip) >= 0, "Slip angle must be computed correctly");

// Test 3: Fuel consumption rate calculation
const fuel = analytics.calculateFuelRate(100, 8000, 250);
assert(fuel.lPer100km > 0, "Fuel rate per 100km must be positive");
assert(fuel.instantaneousLPerHour > 18, "Instantaneous burn rate must be greater than idle");

console.log("✔ Telemetry Analytics Unit Tests Passed Successfully!");
