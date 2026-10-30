const assert = require('assert');
const { GearboxModel } = require('../js/gearbox-model.js');

const gearbox = new GearboxModel();
const speed6thAt7000 = gearbox.calculateSpeedAtRpm(6, 7000);
assert(speed6thAt7000 > 240, "6th gear top speed should exceed 240 km/h");

const downshiftRpm = gearbox.calculateDownshiftTargetRpm(4, 180);
assert(downshiftRpm > 0 && downshiftRpm <= 9000, "Downshift blip target must stay within rev limiter");

console.log("✔ Gearbox & Audio Unit Tests Passed Successfully!");
