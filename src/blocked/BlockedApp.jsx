import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, XCircle, Sparkles, Clock } from 'lucide-react';
import { useI18n } from '../i18n/index.js';
import { SettingsRepository } from '../storage/settingsRepository.js';

export function BlockedApp() {
  const { t, setLanguage } = useI18n();
  const [state, setState] = useState(null);
  const [blockedUrl, setBlockedUrl] = useState('');
  const [reason, setReason] = useState('block_list');
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get('url') || 'Distracting Website';
    const rawReason = params.get('reason') || 'block_list';

    setBlockedUrl(decodeURIComponent(rawUrl));
    setReason(rawReason);

    SettingsRepository.getState().then((st) => {
      setState(st);
      if (st.settings?.language) {
        setLanguage(st.settings.language);
      }
    });

    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  const getReasonText = () => {
    if (reason === 'focus') return t('blockedByFocus');
    if (reason === 'schedule') return t('blockedBySchedule');
    return t('blockedByRule');
  };

  // Focus remaining time if in focus session
  let focusRemainingStr = '';
  if (reason === 'focus' && state?.focusState?.active) {
    const diff = Math.max(0, Math.floor(((state.focusState.endsAt || nowMs) - nowMs) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    focusRemainingStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return (
    <div style={styles.card}>
      <div style={styles.badgeWrapper}>
        <div style={styles.shieldBadge}>
          <Shield size={36} color="#ffffff" fill="#4f46e5" />
        </div>
      </div>

      <span style={styles.appName}>{t('appName')}</span>
      <h1 style={styles.title}>{t('blockedPageTitle')}</h1>

      <div style={styles.urlPill}>
        <XCircle size={16} color="#ef4444" />
        <span style={styles.urlText}>{blockedUrl}</span>
      </div>

      <div style={styles.reasonCard}>
        <div style={styles.reasonHeader}>
          <span style={styles.reasonLabel}>Reason</span>
          <span style={styles.reasonValue}>{getReasonText()}</span>
        </div>

        {focusRemainingStr && (
          <div style={styles.focusTimerBox}>
            <Clock size={16} color="#4f46e5" />
            <span style={styles.timerLabel}>Session ends in:</span>
            <span style={styles.timerValue}>{focusRemainingStr}</span>
          </div>
        )}
      </div>

      {state?.settings?.blockedPageMessage && (
        <div style={styles.quoteBox}>
          <Sparkles size={16} color="#f59e0b" style={styles.sparkleIcon} />
          <p style={styles.quoteText}>{state.settings.blockedPageMessage}</p>
        </div>
      )}

      <button style={styles.backButton} onClick={handleGoBack}>
        <ArrowLeft size={18} />
        <span>{t('goBack')}</span>
      </button>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.08), 0 10px 15px -3px rgba(0, 0, 0, 0.04)',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    margin: '20px',
  },
  badgeWrapper: {
    marginBottom: '12px',
  },
  shieldBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
  },
  appName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 16px 0',
    letterSpacing: '-0.5px',
  },
  urlPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '30px',
    marginBottom: '20px',
    maxWidth: '100%',
  },
  urlText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#991b1b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  reasonCard: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
    marginBottom: '18px',
    textAlign: 'left',
  },
  reasonHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  reasonLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  reasonValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  focusTimerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px dashed #e2e8f0',
  },
  timerLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  timerValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#4f46e5',
    fontVariantNumeric: 'tabular-nums',
  },
  quoteBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#fffbeb',
    borderRadius: '14px',
    border: '1px solid #fef3c7',
    marginBottom: '22px',
    width: '100%',
    textAlign: 'left',
  },
  sparkleIcon: {
    flexShrink: 0,
  },
  quoteText: {
    fontSize: '13px',
    color: '#92400e',
    margin: 0,
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
    transition: 'opacity 0.15s ease',
  },
};
