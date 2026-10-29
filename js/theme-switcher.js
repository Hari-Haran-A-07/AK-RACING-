/**
 * AK Racing - Environmental Theme Switcher
 */
export class ThemeSwitcher {
  constructor() {
    this.themes = ['midnight', 'spa-dusk', 'monza-noon'];
    this.currentThemeIndex = 0;
  }

  cycleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const theme = this.themes[this.currentThemeIndex];
    document.body.setAttribute('data-env-theme', theme);
    console.log(`[Theme] Switched environment to: ${theme}`);
    return theme;
  }
}
