/**
 * AK Racing - Dynamic HUD Layout Presets Manager
 * Toggles UI layouts: Broadcast, Sim Cockpit, Minimalist Streamer, and Telemetry Dyno.
 */
export const HUD_LAYOUTS = {
  BROADCAST: 'broadcast',
  COCKPIT: 'cockpit',
  STREAMER: 'streamer',
  FULL_DYNO: 'full_dyno'
};

export class HUDManager {
  constructor() {
    this.currentLayout = HUD_LAYOUTS.FULL_DYNO;
  }

  setLayout(layoutKey) {
    if (!Object.values(HUD_LAYOUTS).includes(layoutKey)) return;
    this.currentLayout = layoutKey;
    document.body.setAttribute('data-hud-layout', layoutKey);
    console.log(`[HUDManager] Layout switched to: ${layoutKey}`);
    this.applyLayoutStyles(layoutKey);
  }

  applyLayoutStyles(layout) {
    const speedometerContainer = document.getElementById('speedometer-wrapper');
    const telemetryCards = document.querySelectorAll('.telemetry-card');
    
    if (layout === HUD_LAYOUTS.STREAMER) {
      if (speedometerContainer) {
        speedometerContainer.style.transform = 'scale(0.75)';
        speedometerContainer.style.transformOrigin = 'bottom right';
      }
    } else if (layout === HUD_LAYOUTS.COCKPIT) {
      if (speedometerContainer) {
        speedometerContainer.style.transform = 'scale(1.05)';
        speedometerContainer.style.transformOrigin = 'center bottom';
      }
    } else {
      if (speedometerContainer) {
        speedometerContainer.style.transform = 'scale(1)';
      }
    }
  }
}
