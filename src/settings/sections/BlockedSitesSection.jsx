import React, { useState } from 'react';
import { Search, Plus, Trash2, Globe, FileText, KeyRound } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { Switch } from '../../components/Switch.jsx';
import { parseRuleInput } from '../../blocking/domainParser.js';

export function BlockedSitesSection({ state, onAddSite, onRemoveSite, onToggleSite }) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [matchMode, setMatchMode] = useState('domain'); // 'domain' | 'path' | 'keyword'
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAdd = (e) => {
    e?.preventDefault();
    setInputError('');

    const parsed = parseRuleInput(inputValue, matchMode);
    if (!parsed.valid) {
      setInputError(parsed.error || t('errorInvalidDomain'));
      return;
    }

    // Check duplicate
    const exists = state.blockList.some(
      (s) => s.value.toLowerCase() === parsed.normalized.toLowerCase() && s.matchMode === matchMode
    );
    if (exists) {
      setInputError(t('errorDuplicate'));
      return;
    }

    const newRule = {
      id: `site_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: matchMode === 'keyword' ? 'keyword' : 'domain',
      value: parsed.normalized,
      enabled: true,
      includeSubdomains: true,
      matchMode,
      createdAt: new Date().toISOString(),
      note: '',
    };

    onAddSite(newRule);
    setInputValue('');
  };

  const filteredSites = state.blockList.filter((s) =>
    s.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.sectionTitle}>{t('blockedSites')}</h2>
          <p style={styles.sectionDesc}>Websites and URLs permanently blocked when blocking is active.</p>
        </div>
      </div>

      {/* Add Site Card */}
      <div style={styles.addCard}>
        <div style={styles.modeTabs}>
          <button
            type="button"
            style={{
              ...styles.modeTab,
              backgroundColor: matchMode === 'domain' ? '#4f46e5' : '#f1f5f9',
              color: matchMode === 'domain' ? '#ffffff' : '#475569',
            }}
            onClick={() => setMatchMode('domain')}
          >
            <Globe size={14} />
            <span>{t('domain')}</span>
          </button>
          <button
            type="button"
            style={{
              ...styles.modeTab,
              backgroundColor: matchMode === 'path' ? '#4f46e5' : '#f1f5f9',
              color: matchMode === 'path' ? '#ffffff' : '#475569',
            }}
            onClick={() => setMatchMode('path')}
          >
            <FileText size={14} />
            <span>{t('path')}</span>
          </button>
          <button
            type="button"
            style={{
              ...styles.modeTab,
              backgroundColor: matchMode === 'keyword' ? '#4f46e5' : '#f1f5f9',
              color: matchMode === 'keyword' ? '#ffffff' : '#475569',
            }}
            onClick={() => setMatchMode('keyword')}
          >
            <KeyRound size={14} />
            <span>{t('keyword')}</span>
          </button>
        </div>

        <form onSubmit={handleAdd} style={styles.addForm}>
          <div style={styles.inputWrap}>
            <input
              type="text"
              placeholder={
                matchMode === 'keyword'
                  ? t('keywordPlaceholder')
                  : t('sitePlaceholder')
              }
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

      {/* Search & Site List */}
      <div style={styles.listCard}>
        <div style={styles.searchBar}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {filteredSites.length === 0 ? (
          <div style={styles.emptyState}>
            <Globe size={32} color="#cbd5e1" />
            <p style={styles.emptyText}>{t('noItems')}</p>
          </div>
        ) : (
          <div style={styles.itemsList}>
            {filteredSites.map((site) => (
              <div key={site.id} style={styles.siteRow}>
                <div style={styles.siteDetails}>
                  <span style={styles.siteValue}>{site.value}</span>
                  <span style={styles.modeBadge}>{site.matchMode || 'domain'}</span>
                </div>
                <div style={styles.rowActions}>
                  <Switch
                    checked={site.enabled}
                    onChange={(checked) => onToggleSite(site.id, checked)}
                    ariaLabel={`Toggle ${site.value}`}
                  />
                  <button
                    style={styles.deleteBtn}
                    onClick={() => onRemoveSite(site.id)}
                    title={t('delete')}
                    aria-label={t('delete')}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
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
  modeTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
  },
  modeTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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
    backgroundColor: '#4f46e5',
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
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
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
    divideY: '1px solid #f1f5f9',
  },
  siteRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 4px',
    borderBottom: '1px solid #f1f5f9',
  },
  siteDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  siteValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  modeBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  rowActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
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
