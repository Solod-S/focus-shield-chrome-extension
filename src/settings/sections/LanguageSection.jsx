import React from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
];

export function LanguageSection({ onUpdateLanguage }) {
  const { language, setLanguage, t } = useI18n();

  const handleSelect = (code) => {
    setLanguage(code);
    onUpdateLanguage(code);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('language')}</h2>
        <p style={styles.sectionDesc}>Select the display language for the extension interface.</p>
      </div>

      <div style={styles.card}>
        <div style={styles.languagesList}>
          {LANGUAGES.map(({ code, name, native }) => {
            const isSelected = language === code;
            return (
              <div
                key={code}
                style={{
                  ...styles.langItem,
                  borderColor: isSelected ? '#4f46e5' : '#e2e8f0',
                  backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                }}
                onClick={() => handleSelect(code)}
              >
                <div style={styles.langTexts}>
                  <span style={styles.nativeName}>{native}</span>
                  <span style={styles.englishName}>{name}</span>
                </div>
                {isSelected && <Check size={20} color="#4f46e5" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  headerRow: {},
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  sectionDesc: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  languagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  langItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  langTexts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  nativeName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  englishName: {
    fontSize: '12px',
    color: '#64748b',
  },
};
