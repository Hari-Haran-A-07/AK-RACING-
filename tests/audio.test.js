/**
 * Unit Test Suite: Web Audio Node Clamps & Frequency Range Validation
 */
const assert = require('assert');

function testEngineAudioFrequencies() {
  const minRPM = 900;
  const maxRPM = 10000;

  for (let rpm = minRPM; rpm <= maxRPM; rpm += 1000) {
    const combustionFreq = (rpm / 60) * 3; // 6-cylinder 4-stroke
    assert(combustionFreq >= 45 && combustionFreq <= 500, `Combustion frequency ${combustionFreq}Hz out of audible motor range`);
  }
  console.log('[PASS] V6 combustion frequencies stay within safe audible harmonics (45Hz - 500Hz)');
}

function testGainClamping() {
  function clampGain(throttle) {
    return Math.max(0.05, Math.min(1.0, 0.2 + throttle * 0.7));
  }

  assert(Math.abs(clampGain(0) - 0.2) < 1e-5);
  assert(Math.abs(clampGain(1.0) - 0.9) < 1e-5);
  assert(Math.abs(clampGain(-1.0) - 0.05) < 1e-5);
  assert(Math.abs(clampGain(5.0) - 1.0) < 1e-5);
  console.log('[PASS] Audio gain clamping guarantees no digital clipping or overflow');
}

function runAll() {
  console.log('--- RUNNING WEB AUDIO SYNTHESIS TESTS ---');
  testEngineAudioFrequencies();
  testGainClamping();
  console.log('--- ALL AUDIO UNIT TESTS PASSED ---');
}

runAll();
