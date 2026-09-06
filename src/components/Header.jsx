import React from 'react';
import { Shield, Settings } from 'lucide-react';
import { useI18n } from '../i18n/index.js';

export function Header({ onOpenSettings }) {
  const { t } = useI18n();

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <div style={styles.logoBadge}>
          <Shield size={18} color="#ffffff" fill="#4f46e5" />
        </div>
        <span style={styles.title}>{t('appName')}</span>
      </div>
      {onOpenSettings && (
        <button
          style={styles.settingsBtn}
          onClick={onOpenSettings}
          title={t('settings')}
          aria-label={t('settings')}
        >
          <Settings size={19} color="#64748b" />
        </button>
      )}
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.2px',
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },
};
