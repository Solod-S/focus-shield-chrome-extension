import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n/index.js';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDestructive = true }) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.iconBox}>
          <AlertCircle size={28} color={isDestructive ? '#ef4444' : '#4f46e5'} />
        </div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            {t('cancel')}
          </button>
          <button
            style={{
              ...styles.confirmBtn,
              backgroundColor: isDestructive ? '#ef4444' : '#4f46e5',
            }}
            onClick={onConfirm}
          >
            {t('confirm')}
          </button>
        </div>
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
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    width: '100%',
    maxWidth: '320px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  iconBox: {
    marginBottom: '10px',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  message: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
