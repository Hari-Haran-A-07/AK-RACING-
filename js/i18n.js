/**
 * AK Racing - Multi-Language Telemetry Dictionary (i18n)
 * Internationalization support for English, Tamil, Italian, French, and German.
 */
export const TRANSLATIONS = {
  en: {
    throttle: 'Throttle',
    brake: 'Brake',
    gear: 'Gear',
    speed: 'Velocity',
    boost: 'Hybrid Overboost',
    lap: 'Lap Time',
    best: 'Best Lap',
    burnout: 'Burnout Active'
  },
  ta: {
    throttle: 'முடுக்கம் (Throttle)',
    brake: 'நிறுத்தி (Brake)',
    gear: 'கியர் (Gear)',
    speed: 'வேகம் (Speed)',
    boost: 'ஹைப்ரிட் பூஸ்ட்',
    lap: 'சுற்று நேரம் (Lap Time)',
    best: 'சிறந்த சுற்று',
    burnout: 'பர்ன்அவுட்'
  },
  it: {
    throttle: 'Acceleratore',
    brake: 'Freno',
    gear: 'Marcia',
    speed: 'Velocità',
    boost: 'Sovralimentazione Ibrida',
    lap: 'Tempo sul Giro',
    best: 'Miglior Giro',
    burnout: 'Pattinamento'
  },
  fr: {
    throttle: 'Accélérateur',
    brake: 'Frein',
    gear: 'Rapport',
    speed: 'Vitesse',
    boost: 'Surpuissance Hybride',
    lap: 'Temps au Tour',
    best: 'Meilleur Tour',
    burnout: 'Patinage'
  },
  de: {
    throttle: 'Gaspedal',
    brake: 'Bremse',
    gear: 'Gang',
    speed: 'Geschwindigkeit',
    boost: 'Hybrid-Boost',
    lap: 'Rundenzeit',
    best: 'Beste Runde',
    burnout: 'Burnout'
  }
};

export class I18nManager {
  constructor(lang = 'en') {
    this.currentLang = lang;
  }

  t(key) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    return dict[key] || key;
  }

  setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
      console.log(`[i18n] Language switched to: ${lang}`);
    }
  }
}
