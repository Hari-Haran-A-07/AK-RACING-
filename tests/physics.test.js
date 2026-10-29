/**
 * Unit Test Suite: Vehicle Physics & Aerodynamic Calculations
 * Runs in Node.js test environment (zero external dependencies).
 */
const assert = require('assert');

function testAerodynamicDownforce() {
  const speedKmh = 300;
  const speedMs = speedKmh / 3.6;
  const airDensity = 1.225;
  const cl = 2.4;
  const area = 1.8;
  const downforceNewtons = 0.5 * airDensity * Math.pow(speedMs, 2) * cl * area;
  const downforceKg = downforceNewtons / 9.81;

  assert(downforceKg > 1500, `Downforce should exceed 1500kg at 300 km/h (got ${downforceKg})`);
  console.log(`[PASS] Aerodynamic Downforce at 300km/h: ${Math.round(downforceKg)} kg`);
}

function testGearRatioSpeed() {
  const ratios = [3.2, 2.3, 1.8, 1.4, 1.15, 0.95, 0.82];
  const finalDrive = 3.65;
  const tireRadiusMeters = 0.355;
  const rpm = 9500;

  ratios.forEach((ratio, idx) => {
    const wheelRpm = rpm / (ratio * finalDrive);
    const speedMs = wheelRpm * (2 * Math.PI * tireRadiusMeters) / 60;
    const speedKmh = speedMs * 3.6;
    assert(speedKmh > 0 && speedKmh < 450, `Speed out of expected bounds: ${speedKmh}`);
    console.log(`[PASS] Gear ${idx + 1} Redline Velocity: ${Math.round(speedKmh)} km/h`);
  });
}

function runAll() {
  console.log('--- RUNNING VEHICLE PHYSICS TESTS ---');
  testAerodynamicDownforce();
  testGearRatioSpeed();
  console.log('--- ALL PHYSICS TESTS PASSED SUCCESFULLY ---');
}

runAll();
