import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { Switch } from '../../components/Switch.jsx';
import { parseRuleInput } from '../../blocking/domainParser.js';

export function ExceptionsSection({ state, onAddAllow, onRemoveAllow }) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAdd = (e) => {
    e?.preventDefault();
    setInputError('');

    const parsed = parseRuleInput(inputValue, 'path');
    if (!parsed.valid) {
      setInputError(parsed.error || t('errorInvalidDomain'));
      return;
    }

    const exists = state.allowList.some(
      (a) => a.value.toLowerCase() === parsed.normalized.toLowerCase()
    );
    if (exists) {
      setInputError(t('errorDuplicate'));
      return;
    }

    const newAllow = {
      id: `allow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'allow',
      value: parsed.normalized,
      enabled: true,
      matchMode: 'path',
      createdAt: new Date().toISOString(),
    };

    onAddAllow(newAllow);
    setInputValue('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t('exceptions')}</h2>
        <p style={styles.sectionDesc}>
          Specific pages or URLs that will remain accessible even when their domain is blocked.
        </p>
      </div>

      <div style={styles.addCard}>
        <form onSubmit={handleAdd} style={styles.addForm}>
          <div style={styles.inputWrap}>
            <input
              type="text"
              placeholder={t('allowPlaceholder')}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (inputError) setInputError('');
              }}
              style={styles.addInput}
            />
            {inputError && <span style={styles.errorText}>{inputError}</span>}
          </div>
          <button type="submit" style={styles.addBtn}>
            <Plus size={16} />
            <span>{t('add')}</span>
          </button>
        </form>
      </div>

      <div style={styles.listCard}>
        {state.allowList.length === 0 ? (
          <div style={styles.emptyState}>
            <CheckCircle size={32} color="#cbd5e1" />
            <p style={styles.emptyText}>{t('noItems')}</p>
          </div>
        ) : (
          <div style={styles.itemsList}>
            {state.allowList.map((item) => (
              <div key={item.id} style={styles.itemRow}>
                <span style={styles.itemValue}>{item.value}</span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => onRemoveAllow(item.id)}
                  title={t('delete')}
                  aria-label={t('delete')}
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            ))}
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
  addCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  addForm: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  inputWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  addInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 20px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: '#94a3b8',
  },
  emptyText: {
    fontSize: '14px',
    marginTop: '8px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 4px',
    borderBottom: '1px solid #f1f5f9',
  },
  itemValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
