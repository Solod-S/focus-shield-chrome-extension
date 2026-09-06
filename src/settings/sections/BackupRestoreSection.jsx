import React, { useState, useRef } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { buildExportJson, downloadBackupFile } from '../../backup/exportSettings.js';
import { validateBackup } from '../../backup/validateBackup.js';
import { applyImport } from '../../backup/importSettings.js';

export function BackupRestoreSection({ state, onReloadState }) {
  const { t } = useI18n();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [rawFileContent, setRawFileContent] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const handleExport = () => {
    const jsonStr = buildExportJson(state);
    downloadBackupFile(jsonStr);
    setStatusMessage({ type: 'success', text: t('exportSuccess') });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setRawFileContent(content);
        const validation = validateBackup(content);
        if (validation.valid) {
          setPreview(validation.summary);
        } else {
          setStatusMessage({ type: 'error', text: validation.error });
          setPreview(null);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleImportApply = async () => {
    if (!rawFileContent) return;

    setStatusMessage(null);
    const result = await applyImport(rawFileContent, importMode);

    if (result.success) {
      setStatusMessage({ type: 'success', text: t('importSuccess') });
      setPreview(null);
      setRawFileContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onReloadState) onReloadState();
    } else {
      setStatusMessage({ type: 'error', text: result.error });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('backupRestore')}</h2>
        <p style={styles.sectionDesc}>
          Export your settings to a local JSON file or restore from a previous backup.
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            ...styles.alertBox,
            backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            borderColor: statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca',
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Export Section */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t('exportBackup')}</h3>
        <p style={styles.cardDesc}>
          Saves all your blocked websites, schedules, and preferences. Password credentials are never exported.
        </p>
        <button style={styles.actionBtn} onClick={handleExport}>
          <Download size={16} />
          <span>{t('exportBackup')}</span>
        </button>
      </div>

      {/* Import Section */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t('importBackup')}</h3>
        <p style={styles.cardDesc}>Select a previously exported JSON backup file.</p>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={styles.fileInput}
        />

        {preview && (
          <div style={styles.previewBox}>
            <div style={styles.previewHeader}>
              <FileText size={16} color="#4f46e5" />
              <span style={styles.previewHeading}>{t('previewImport')}</span>
            </div>

            <div style={styles.previewStats}>
              <span>Blocked Sites: <strong>{preview.blockedCount}</strong></span>
              <span>Exceptions: <strong>{preview.exceptionsCount}</strong></span>
              <span>Schedules: <strong>{preview.schedulesCount}</strong></span>
            </div>

            <div style={styles.modeChoice}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                />
                <span>{t('mergeMode')}</span>
              </label>

              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                />
                <span>{t('replaceMode')}</span>
              </label>
            </div>

            <button style={styles.confirmImportBtn} onClick={handleImportApply}>
              <Upload size={16} />
              <span>Apply Import</span>
            </button>
          </div>
        )}
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
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '500',
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
    margin: '0 0 6px 0',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 18px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  fileInput: {
    fontSize: '14px',
    color: '#475569',
  },
  previewBox: {
    marginTop: '20px',
    padding: '18px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  previewHeading: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  previewStats: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#475569',
    marginBottom: '16px',
  },
  modeChoice: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b',
    cursor: 'pointer',
  },
  confirmImportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
