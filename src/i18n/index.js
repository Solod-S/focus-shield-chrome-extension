import React, { createContext, useContext, useState } from 'react';
import en from './en.json';
import ru from './ru.json';
import uk from './uk.json';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../shared/constants.js';

const dictionaries = { en, ru, uk };

/**
 * Resolves the best default language based on browser environment.
 * @returns {'en'|'ru'|'uk'}
 */
export function resolveInitialLanguage() {
  let browserLang = '';
  if (globalThis?.chrome?.i18n?.getUILanguage) {
    browserLang = chrome.i18n.getUILanguage().toLowerCase();
  } else if (typeof navigator !== 'undefined' && navigator.language) {
    browserLang = navigator.language.toLowerCase();
  }

  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('uk')) return 'uk';
  return DEFAULT_LANGUAGE;
}

const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

export function I18nProvider({ children, initialLanguage }) {
  const [language, setLanguageState] = useState(
    SUPPORTED_LANGUAGES.includes(initialLanguage) ? initialLanguage : resolveInitialLanguage()
  );

  const t = (key, params = {}) => {
    const dict = dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
    let text = dict[key] || dictionaries[DEFAULT_LANGUAGE][key] || key;

    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
    }
    return text;
  };

  const setLanguage = (newLang) => {
    if (SUPPORTED_LANGUAGES.includes(newLang)) {
      setLanguageState(newLang);
    }
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export { dictionaries };
