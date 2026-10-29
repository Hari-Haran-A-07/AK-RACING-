/**
 * AK Racing - FIA Electronic Control Unit (ECU) Diagnostics Simulator
 * Generates racing diagnostic codes (e.g., MGU-K Stator Temp, Turbo Boost Deviation).
 */
export const FIA_ERROR_CODES = [
  { code: 'ERR-MGU-401', desc: 'MGU-K Stator Core Temperature Approaching 145°C limit', severity: 'WARNING' },
  { code: 'ERR-BOOST-204', desc: 'Turbo Boost Pressure Spike +0.18 Bar Exceeded', severity: 'CRITICAL' },
  { code: 'ERR-DIFF-109', desc: 'Active Differential Slip Discrepancy > 8%', severity: 'INFO' },
  { code: 'ERR-BRAKE-312', desc: 'Front Left Brake Rotor Exceeded 820°C Glowing Threshold', severity: 'WARNING' },
  { code: 'ERR-TIRE-007', desc: 'Rear Right Tire Pressure Loss Detected (-0.3 PSI)', severity: 'INFO' }
];

export class ECUDiagnostics {
  constructor() {
    this.activeCodes = [];
  }

  evaluateTelemetry(rpm, speed, tireTemp, brakeTemp) {
    this.activeCodes = [];
    if (rpm > 9600) {
      this.activeCodes.push(FIA_ERROR_CODES[1]);
    }
    if (brakeTemp > 800) {
      this.activeCodes.push(FIA_ERROR_CODES[3]);
    }
    return this.activeCodes;
  }
}
