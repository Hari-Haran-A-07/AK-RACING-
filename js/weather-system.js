/**
 * AK Racing - Dynamic Track Weather & Friction Engine
 * Simulates weather states (Dry, Damp, Wet, Monsoon) with dynamic road friction coefficients.
 */
export const WEATHER_CONDITIONS = {
  DRY: { name: 'Dry Track', friction: 1.00, rainIntensity: 0, spray: 0 },
  DAMP: { name: 'Damp / Greasy', friction: 0.88, rainIntensity: 0.15, spray: 0.2 },
  WET: { name: 'Wet Track', friction: 0.72, rainIntensity: 0.60, spray: 0.7 },
  MONSOON: { name: 'Monsoon Torrential', friction: 0.55, rainIntensity: 1.0, spray: 1.0 }
};

export class WeatherSystem {
  constructor() {
    this.currentCondition = WEATHER_CONDITIONS.DRY;
  }

  setCondition(conditionKey) {
    if (!WEATHER_CONDITIONS[conditionKey]) return;
    this.currentCondition = WEATHER_CONDITIONS[conditionKey];
    console.log(`[Weather] Condition set to: ${this.currentCondition.name}`);
  }

  getFrictionMultiplier() {
    return this.currentCondition.friction;
  }

  renderRainOverlay(ctx, width, height) {
    if (this.currentCondition.rainIntensity <= 0 || !ctx) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 210, 255, 0.4)';
    ctx.lineWidth = 1.2;
    const dropCount = Math.floor(this.currentCondition.rainIntensity * 120);
    ctx.beginPath();
    for (let i = 0; i < dropCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 5, y + 18);
    }
    ctx.stroke();
    ctx.restore();
  }
}
