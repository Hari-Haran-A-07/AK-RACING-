/**
 * AK Racing - Tactile Haptic Vibration Engine
 * Powers immersive tactile force feedback on mobile and supported controller devices.
 */
export class HapticEngine {
  constructor() {
    this.canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  shiftClick() {
    if (!this.canVibrate) return;
    navigator.vibrate(28); // Short snappy paddle click
  }

  revLimiterPulse() {
    if (!this.canVibrate) return;
    navigator.vibrate([15, 10, 15]); // Stuttering limiter bounce
  }

  launchControlDrop() {
    if (!this.canVibrate) return;
    navigator.vibrate([40, 20, 80]); // Heavy torque dump
  }

  curbStrike() {
    if (!this.canVibrate) return;
    navigator.vibrate([18, 12, 18, 12, 18]); // Rumble strip vibration
  }

  backfirePop() {
    if (!this.canVibrate) return;
    navigator.vibrate(35); // Sharp crackle impact
  }
}
