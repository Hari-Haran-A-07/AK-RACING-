/**
 * AK Racing - Tire Physics & Thermal Degradation Engine
 * Calculates individual wheel tire temperatures, compound wear, and dynamic grip friction coefficients.
 */
export class TirePhysicsEngine {
  constructor() {
    this.tires = {
      FL: { temp: 85, wear: 0, pressurePsi: 27.5 },
      FR: { temp: 85, wear: 0, pressurePsi: 27.5 },
      RL: { temp: 90, wear: 0, pressurePsi: 28.0 },
      RR: { temp: 90, wear: 0, pressurePsi: 28.0 }
    };
    this.ambientTemp = 24; // Celsius
    this.optimalTemp = 95; // Optimum grip zone (90°C - 105°C)
  }

  update(dt, speedKmh, throttle, brake, lateralG, isBurnout) {
    const speedRatio = speedKmh / 350;
    const accelFriction = throttle * 12 * (1 - speedRatio);
    const brakeFriction = brake * 25 * speedRatio;
    const lateralFriction = Math.abs(lateralG) * 18;
    const burnoutHeat = isBurnout ? 80 : 0;

    for (const pos in this.tires) {
      const tire = this.tires[pos];
      const isRear = pos.startsWith('R');
      const isOuter = (lateralG > 0 && pos.endsWith('L')) || (lateralG < 0 && pos.endsWith('R'));

      // Heat generation
      let heatGen = (isRear ? accelFriction * 1.5 : 0) + (brakeFriction * (isRear ? 0.7 : 1.3)) + (isOuter ? lateralFriction * 1.4 : lateralFriction * 0.6) + (isRear ? burnoutHeat : 0);
      
      // Cooling via airflow
      const cooling = (tire.temp - this.ambientTemp) * (0.05 + speedRatio * 0.15);

      tire.temp = Math.max(this.ambientTemp, tire.temp + (heatGen - cooling) * dt);

      // Tire wear accumulation
      const wearRate = (heatGen * 0.00008 + (tire.temp > 115 ? 0.0003 : 0.00002)) * dt;
      tire.wear = Math.min(100, tire.wear + wearRate * 100);

      // Pressure fluctuation with heat (Ideal gas law approximation: ~0.1 PSI per 5°C)
      tire.pressurePsi = +(27.5 + ((tire.temp - 85) / 5) * 0.12).toFixed(1);
    }
  }

  getOverallGrip() {
    let avgGrip = 0;
    for (const pos in this.tires) {
      const t = this.tires[pos];
      const tempDelta = Math.abs(t.temp - this.optimalTemp);
      const tempFactor = Math.max(0.65, 1 - (tempDelta / 60) * 0.35);
      const wearFactor = Math.max(0.40, 1 - (t.wear / 100) * 0.6);
      avgGrip += tempFactor * wearFactor;
    }
    return parseFloat((avgGrip / 4).toFixed(3));
  }
}
