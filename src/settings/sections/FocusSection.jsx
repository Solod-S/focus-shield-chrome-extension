import React from 'react';
import { useI18n } from '../../i18n/index.js';
import { Switch } from '../../components/Switch.jsx';
import { FOCUS_PRESETS } from '../../shared/constants.js';

export function FocusSection({ state, onUpdateFocusSettings }) {
  const { t } = useI18n();
  const fs = state.focusSettings || {};

  const handleUpdate = (partial) => {
    onUpdateFocusSettings({ ...fs, ...partial });
  };

  const toggleSiteInFocus = (siteId) => {
    const current = fs.siteIds || [];
    let updated;
    if (current.includes(siteId)) {
      updated = current.filter((id) => id !== siteId);
    } else {
      updated = [...current, siteId];
    }
    handleUpdate({ siteIds: updated });
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('focus')}</h2>
        <p style={styles.sectionDesc}>Customize your Pomodoro and focus session preferences.</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Default Duration</h3>
        <div style={styles.presetsRow}>
          {FOCUS_PRESETS.map((preset) => {
            const isSelected = fs.defaultMinutes === preset.minutes;
            return (
              <button
                key={preset.minutes}
                style={{
                  ...styles.presetBtn,
                  backgroundColor: isSelected ? '#4f46e5' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#334155',
                  borderColor: isSelected ? '#4f46e5' : '#e2e8f0',
                }}
                onClick={() => handleUpdate({ defaultMinutes: preset.minutes })}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.switchRow}>
          <div>
            <h3 style={styles.cardTitle}>{t('strictFocusMode')}</h3>
            <p style={styles.switchDesc}>{t('strictFocusWarning')}</p>
          </div>
          <Switch
            checked={Boolean(fs.strictModeDefault)}
            onChange={(val) => handleUpdate({ strictModeDefault: val })}
            ariaLabel="Toggle strict mode default"
          />
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Focus Block List</h3>
        <p style={styles.cardDesc}>
          Select websites to block during Focus Sessions. If none are selected, all blocked websites will be active.
        </p>

        <div style={styles.sitesGrid}>
          {state.blockList.map((site) => {
            const isChecked = (fs.siteIds || []).includes(site.id);
            return (
              <label key={site.id} style={styles.siteLabel}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSiteInFocus(site.id)}
                />
                <span>{site.value}</span>
              </label>
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
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px 0',
  },
  presetsRow: {
    display: 'flex',
    gap: '12px',
  },
  presetBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  switchDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0 0',
    maxWidth: '480px',
    lineHeight: '1.4',
  },
  sitesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  siteLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#334155',
    cursor: 'pointer',
  },
};
