import React from 'react';
import { Shield, CheckCircle, ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';

export function AboutSection() {
  const { t } = useI18n();

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('about')}</h2>
        <p style={styles.sectionDesc}>Product details and privacy commitments.</p>
      </div>

      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logoBadge}>
            <Shield size={28} color="#ffffff" fill="#4f46e5" />
          </div>
          <div>
            <h3 style={styles.brandName}>{t('appName')}</h3>
            <span style={styles.versionBadge}>Version 1.0.0 • Manifest V3</span>
          </div>
        </div>

        <p style={styles.aboutDesc}>{t('tagline')}</p>

        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <CheckCircle size={16} color="#16a34a" />
            <span>100% Local: no backend servers, no cloud sync, no tracking.</span>
          </div>
          <div style={styles.featureItem}>
            <CheckCircle size={16} color="#16a34a" />
            <span>Chrome Declarative Net Request (DNR) dynamic and session rules.</span>
          </div>
          <div style={styles.featureItem}>
            <CheckCircle size={16} color="#16a34a" />
            <span>Encrypted password protection with Web Crypto PBKDF2 SHA-256.</span>
          </div>
          <div style={styles.featureItem}>
            <CheckCircle size={16} color="#16a34a" />
            <span>Safe JSON backup export and import with deduplication and rollback.</span>
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
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  logoBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  versionBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  aboutDesc: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#334155',
  },
};
