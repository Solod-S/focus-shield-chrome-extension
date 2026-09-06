import React, { useState } from 'react';
import { Sparkles, Eye, Shield } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { MAX_BLOCKED_MESSAGE_LENGTH } from '../../shared/constants.js';

export function BlockedPageSection({ state, onUpdateSettings }) {
  const { t } = useI18n();
  const [message, setMessage] = useState(state.settings.blockedPageMessage || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e?.preventDefault();
    onUpdateSettings({ blockedPageMessage: message.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('blockedPage')}</h2>
        <p style={styles.sectionDesc}>Customize the look and message shown when a site is blocked.</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t('customMessage')}</h3>
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.inputWrap}>
            <input
              type="text"
              maxLength={MAX_BLOCKED_MESSAGE_LENGTH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Deep work creates high value!"
              style={styles.textInput}
            />
            <span style={styles.charCount}>
              {message.length} / {MAX_BLOCKED_MESSAGE_LENGTH}
            </span>
          </div>
          <button type="submit" style={styles.saveBtn}>
            {saved ? 'Saved!' : t('save')}
          </button>
        </form>
      </div>

      {/* Live Preview Card */}
      <div style={styles.previewContainer}>
        <div style={styles.previewHeader}>
          <Eye size={16} color="#64748b" />
          <span style={styles.previewTitle}>Live Preview</span>
        </div>

        <div style={styles.mockBrowser}>
          <div style={styles.mockCard}>
            <div style={styles.mockBadge}>
              <Shield size={24} color="#ffffff" fill="#4f46e5" />
            </div>
            <span style={styles.mockAppName}>{t('appName')}</span>
            <h4 style={styles.mockHeading}>{t('blockedPageTitle')}</h4>
            <div style={styles.mockPill}>youtube.com</div>

            {message && (
              <div style={styles.mockQuote}>
                <Sparkles size={14} color="#f59e0b" />
                <span>{message}</span>
              </div>
            )}
          </div>
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
    margin: '0 0 12px 0',
  },
  form: {
    display: 'flex',
    gap: '12px',
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    width: '100%',
    padding: '12px 60px 12px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
  },
  charCount: {
    position: 'absolute',
    right: '12px',
    top: '14px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  saveBtn: {
    padding: '12px 22px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  previewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
  },
  mockBrowser: {
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    border: '1px dashed #cbd5e1',
    padding: '30px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  mockCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '24px',
    width: '100%',
    maxWidth: '320px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  mockBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  mockAppName: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: '0.5px',
  },
  mockHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '4px 0 10px 0',
  },
  mockPill: {
    padding: '4px 12px',
    borderRadius: '12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  mockQuote: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#fffbeb',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#92400e',
    fontStyle: 'italic',
  },
};
