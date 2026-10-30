const { AeroDynamicsModel } = require('../js/aero-dynamics.js');
const { BrakeThermalModel } = require('../js/brake-thermal.js');

const aero = new AeroDynamicsModel();
const brakes = new BrakeThermalModel();

const ITERATIONS = 10000;
const start = performance.now();

for (let i = 0; i < ITERATIONS; i++) {
    const speed = 100 + (i % 220);
    aero.calculateAeroForces(speed);
    brakes.update(i % 100, speed, 0.016);
}

const elapsedMs = performance.now() - start;
const avgPerTickMs = elapsedMs / ITERATIONS;

console.log(`Executed ${ITERATIONS} ticks in ${elapsedMs.toFixed(2)}ms (avg: ${avgPerTickMs.toFixed(4)}ms/tick)`);
if (avgPerTickMs > 0.5) {
    console.error("Benchmark failed: Tick time exceeded 0.5ms");
    process.exit(1);
}
console.log("✔ Telemetry Performance Benchmark Passed Under 0.5ms SLA!");
