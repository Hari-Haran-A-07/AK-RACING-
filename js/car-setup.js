/**
 * AK Racing - Aerodynamics & Mechanical Tuning Engine
 * Computes aerodynamic downforce (Cl * v^2), front/rear balance, and differential preload.
 */
export class CarSetupTuning {
  constructor() {
    this.setup = {
      frontWingAngleDeg: 14.5,
      rearWingAngleDeg: 28.0,
      brakeBiasFrontPercent: 57,
      diffPreloadNm: 140,
      rideHeightMm: 52
    };
  }

  updateParam(key, value) {
    if (key in this.setup) {
      this.setup[key] = parseFloat(value);
      console.log(`[Tuning] Updated ${key} = ${value}`);
    }
  }

  calculateDownforceKg(speedKmh) {
    const speedMs = speedKmh / 3.6;
    // Downforce = 0.5 * air_density * v^2 * Cl_A
    const frontCl = 0.8 + (this.setup.frontWingAngleDeg / 30) * 0.9;
    const rearCl = 1.2 + (this.setup.rearWingAngleDeg / 40) * 1.4;
    const airDensity = 1.225; // kg/m^3

    const frontDownforce = 0.5 * airDensity * Math.pow(speedMs, 2) * frontCl;
    const rearDownforce = 0.5 * airDensity * Math.pow(speedMs, 2) * rearCl;

    return {
      totalKg: Math.round((frontDownforce + rearDownforce) / 9.81),
      frontKg: Math.round(frontDownforce / 9.81),
      rearKg: Math.round(rearDownforce / 9.81),
      frontBalancePercent: Math.round((frontDownforce / (frontDownforce + rearDownforce || 1)) * 100)
    };
  }
}
