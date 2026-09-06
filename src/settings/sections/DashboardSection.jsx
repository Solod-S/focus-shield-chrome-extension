import React from 'react';
import { Shield, Slash, CheckCircle, Calendar, Clock, Lock } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { Switch } from '../../components/Switch.jsx';

export function DashboardSection({ state, onToggleMaster, onNavigate }) {
  const { t } = useI18n();

  const isFocusActive = state.focusState?.active;
  const isPauseActive = state.pauseState?.active;

  return (
    <div style={styles.container}>
      <div style={styles.headerBanner}>
        <div style={styles.bannerInfo}>
          <h2 style={styles.bannerTitle}>{t('dashboard')}</h2>
          <p style={styles.bannerSubtitle}>{t('tagline')}</p>
        </div>
        <div style={styles.masterControl}>
          <span style={styles.masterLabel}>
            {state.settings.enabled ? t('blockingOn') : t('blockingOff')}
          </span>
          <Switch
            checked={state.settings.enabled}
            onChange={onToggleMaster}
            ariaLabel="Toggle master blocking"
          />
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard} onClick={() => onNavigate('blockedSites')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#eef2ff' }}>
            <Slash size={22} color="#4f46e5" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{state.blockList.length}</span>
            <span style={styles.statLabel}>{t('statsBlockedCount')}</span>
          </div>
        </div>

        <div style={styles.statCard} onClick={() => onNavigate('exceptions')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#f0fdf4' }}>
            <CheckCircle size={22} color="#16a34a" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{state.allowList.length}</span>
            <span style={styles.statLabel}>{t('statsExceptionsCount')}</span>
          </div>
        </div>

        <div style={styles.statCard} onClick={() => onNavigate('schedules')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#fef3c7' }}>
            <Calendar size={22} color="#d97706" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>
              {state.schedules.filter((s) => s.enabled).length} / {state.schedules.length}
            </span>
            <span style={styles.statLabel}>{t('statsSchedulesCount')}</span>
          </div>
        </div>

        <div style={styles.statCard} onClick={() => onNavigate('focus')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#faf5ff' }}>
            <Clock size={22} color="#9333ea" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>
              {isFocusActive ? t('running') : isPauseActive ? t('paused') : t('idle')}
            </span>
            <span style={styles.statLabel}>{t('statsFocusStatus')}</span>
          </div>
        </div>
      </div>

      <div style={styles.privacyBanner}>
        <Shield size={20} color="#4f46e5" />
        <span style={styles.privacyText}>{t('privacyGuarantee')}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headerBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  bannerInfo: {},
  bannerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  bannerSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  masterControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
  },
  masterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  privacyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    backgroundColor: '#eef2ff',
    borderRadius: '12px',
    border: '1px solid #e0e7ff',
  },
  privacyText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3730a3',
  },
};
