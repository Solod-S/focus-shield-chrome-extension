import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n/index.js';

export function PasswordModal({ isOpen, onClose, onSuccess, verifyFn, title, description }) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('atLeast8Characters'));
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyFn(password);
      if (isValid) {
        setPassword('');
        onSuccess();
      } else {
        setError(t('errorInvalidPassword'));
      }
    } catch (err) {
      setError(err.message || t('errorInvalidPassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <button
          style={styles.closeBtn}
          onClick={onClose}
          aria-label={t('cancel')}
        >
          <X size={18} color="#94a3b8" />
        </button>

        {/* Lock with Key graphic */}
        <div style={styles.iconWrapper}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="24" width="36" height="30" rx="6" fill="#94A3B8" />
            <rect x="16" y="26" width="32" height="26" rx="4" fill="#CBD5E1" />
            <path d="M22 24V17C22 11.4772 26.4772 7 32 7C37.5228 7 42 11.4772 42 17V24" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
            <circle cx="32" cy="37" r="4" fill="#475569" />
            <path d="M32 41V46" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            {/* Golden Key */}
            <circle cx="44" cy="22" r="7" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <circle cx="44" cy="22" r="3" fill="#FEF3C7" />
            <path d="M42 27L36 38L39 40L42 34L45 35L47 31" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#F59E0B" />
          </svg>
        </div>

        <h3 style={styles.title}>{title || t('enterPassword')}</h3>
        {description && <p style={styles.description}>{description}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              style={styles.input}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
            </button>
          </div>

          <div style={styles.hintRow}>
            <AlertTriangle size={14} color={error ? '#ef4444' : '#f59e0b'} />
            <span style={{ ...styles.hintText, color: error ? '#ef4444' : '#64748b' }}>
              {error || t('atLeast8Characters')}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.continueBtn}
          >
            <span>{loading ? '...' : t('continue')}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalCard: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px 20px',
    width: '100%',
    maxWidth: '310px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#f8fafc',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  iconWrapper: {
    marginBottom: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  description: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 14px 0',
    lineHeight: '1.4',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '11px 40px 11px 14px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
    fontSize: '12px',
  },
  hintText: {
    fontSize: '12px',
    fontWeight: '500',
  },
  continueBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    marginTop: '4px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
    transition: 'opacity 0.15s ease',
  },
};
