const assert = require('assert');
const { AeroDynamicsModel } = require('../js/aero-dynamics.js');
const { BrakeThermalModel } = require('../js/brake-thermal.js');

// Test Aero
const aero = new AeroDynamicsModel();
const forcesAt200 = aero.calculateAeroForces(200);
const forcesAt300 = aero.calculateAeroForces(300);

assert(forcesAt300.downforceNewtons > forcesAt200.downforceNewtons, "Downforce must increase with speed squared");
assert(forcesAt300.liftToDragRatio > 1.0, "GT3 aero should maintain positive L/D");

// Test Brakes
const brakes = new BrakeThermalModel();
const res = brakes.update(100, 250, 2.0); // 2 seconds hard braking
assert(res.temperatures.fl > 180, "Brake disc should heat up under braking");
assert(res.fadeFactor <= 1.0, "Fade factor should be clamped to 1.0 max");

console.log("✔ Dynamics & Aero Unit Tests Passed Successfully!");
