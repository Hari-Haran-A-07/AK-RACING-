/**
 * Ajith Kumar Racing - Dynamic Locale Manager & Internationalization
 */
class LocaleManager {
    constructor() {
        this.currentLang = 'en';
        this.translations = new Map();
    }

    async setLanguage(lang) {
        if (!this.translations.has(lang)) {
            try {
                const res = await fetch(`locales/${lang}.json`);
                if (res.ok) {
                    const data = await res.json();
                    this.translations.set(lang, data);
                }
            } catch (e) {
                console.warn(`[i18n] Could not load ${lang}, fallback to en`);
            }
        }
        this.currentLang = lang;
        return this.currentLang;
    }

    t(keyPath, defaultText = '') {
        const dict = this.translations.get(this.currentLang);
        if (!dict) return defaultText;
        const parts = keyPath.split('.');
        let curr = dict;
        for (const p of parts) {
            if (curr && curr[p] !== undefined) {
                curr = curr[p];
            } else {
                return defaultText;
            }
        }
        return curr;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LocaleManager };
}
