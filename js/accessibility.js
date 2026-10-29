/**
 * AK Racing - Web Accessibility (a11y) & Screen Reader Live Regions
 * Ensures inclusive telemetry updates, focus management, and keyboard accessibility.
 */
export class AccessibilityManager {
  constructor() {
    this.liveRegion = null;
    this.initLiveRegion();
  }

  initLiveRegion() {
    let el = document.getElementById('a11y-telemetry-live');
    if (!el) {
      el = document.createElement('div');
      el.id = 'a11y-telemetry-live';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only';
      el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
      document.body.appendChild(el);
    }
    this.liveRegion = el;
  }

  announceGear(gear) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = `Gear ${gear}`;
  }

  announceSpeedMilestone(speed) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = `Speed reached ${speed} kilometers per hour`;
  }

  announceAlert(message) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = `Alert: ${message}`;
  }
}
