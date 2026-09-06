import React, { useState } from 'react';
import { Lock, Unlock, AlertTriangle, KeyRound, RefreshCw } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { Switch } from '../../components/Switch.jsx';
import { PasswordService } from '../../security/passwordService.js';
import { ConfirmModal } from '../../components/ConfirmModal.jsx';

export function SecuritySection({ state, onUpdateSecurity, onResetAll }) {
  const { t } = useI18n();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const passwordEnabled = Boolean(state.security?.passwordEnabled);

  const handleSetPassword = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError(t('atLeast8Characters'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const credential = await PasswordService.setPassword(newPassword);
      await onUpdateSecurity({
        passwordEnabled: true,
        passwordCredential: credential,
      });
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password protection enabled successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemovePassword = async () => {
    await onUpdateSecurity({
      passwordEnabled: false,
      passwordCredential: null,
    });
    await PasswordService.lockNow();
    setSuccess('Password protection removed');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('security')}</h2>
        <p style={styles.sectionDesc}>
          Protect your focus rules, schedules and settings with a local master password.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.toggleHeader}>
          <div style={styles.toggleInfo}>
            <div style={styles.iconBadge}>
              {passwordEnabled ? <Lock size={20} color="#4f46e5" /> : <Unlock size={20} color="#64748b" />}
            </div>
            <div>
              <h3 style={styles.cardTitle}>{t('passwordProtection')}</h3>
              <p style={styles.cardDesc}>
                Requires password when disabling blocking, unblocking sites, or changing rules.
              </p>
            </div>
          </div>
          {passwordEnabled && (
            <button style={styles.removeBtn} onClick={handleRemovePassword}>
              {t('removePassword')}
            </button>
          )}
        </div>

        {!passwordEnabled && (
          <form onSubmit={handleSetPassword} style={styles.passwordForm}>
            <div style={styles.field}>
              <label style={styles.label}>{t('password')}</label>
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertTriangle size={15} color="#ef4444" />
                <span>{error}</span>
              </div>
            )}

            {success && <div style={styles.successBox}>{success}</div>}

            <button type="submit" style={styles.submitBtn}>
              <KeyRound size={16} />
              <span>Enable Password Protection</span>
            </button>
          </form>
        )}
      </div>

      {/* Danger Zone */}
      <div style={styles.dangerCard}>
        <h3 style={styles.dangerTitle}>Danger Zone</h3>
        <p style={styles.dangerDesc}>
          Resetting the extension will delete all blocked sites, schedules, and custom settings permanently.
        </p>
        <button style={styles.resetBtn} onClick={() => setShowResetModal(true)}>
          <RefreshCw size={16} />
          <span>{t('resetExtension')}</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        title={t('resetExtension')}
        message={t('resetConfirm')}
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          setShowResetModal(false);
          onResetAll();
        }}
        isDestructive={true}
      />
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
  toggleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  toggleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  iconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  removeBtn: {
    padding: '8px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  passwordForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#ef4444',
  },
  successBox: {
    padding: '10px 14px',
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#16a34a',
    fontWeight: '500',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
  },
  dangerCard: {
    backgroundColor: '#fff1f2',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #ffe4e6',
  },
  dangerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#9f1239',
    margin: '0 0 6px 0',
  },
  dangerDesc: {
    fontSize: '13px',
    color: '#be123c',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#e11d48',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
