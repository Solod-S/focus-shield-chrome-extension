import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Slash,
  CheckCircle,
  Calendar,
  Clock,
  Palette,
  Lock,
  Database,
  Languages,
  Info,
  Shield,
} from 'lucide-react';
import { useI18n } from '../i18n/index.js';
import { SettingsRepository } from '../storage/settingsRepository.js';
import { PasswordService } from '../security/passwordService.js';
import { PasswordModal } from '../components/PasswordModal.jsx';

import { DashboardSection } from './sections/DashboardSection.jsx';
import { BlockedSitesSection } from './sections/BlockedSitesSection.jsx';
import { ExceptionsSection } from './sections/ExceptionsSection.jsx';
import { SchedulesSection } from './sections/SchedulesSection.jsx';
import { FocusSection } from './sections/FocusSection.jsx';
import { BlockedPageSection } from './sections/BlockedPageSection.jsx';
import { SecuritySection } from './sections/SecuritySection.jsx';
import { BackupRestoreSection } from './sections/BackupRestoreSection.jsx';
import { LanguageSection } from './sections/LanguageSection.jsx';
import { AboutSection } from './sections/AboutSection.jsx';

export function SettingsApp() {
  const { t, setLanguage } = useI18n();
  const [state, setState] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const loadState = async () => {
    const st = await SettingsRepository.getState();
    setState(st);
    if (st.settings?.language) {
      setLanguage(st.settings.language);
    }
  };

  useEffect(() => {
    loadState();

    // Check hash for direct navigation
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
    }

    const unsubscribe = SettingsRepository.subscribe((updated) => {
      setState(updated);
      if (updated.settings?.language) {
        setLanguage(updated.settings.language);
      }
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (sec) => {
    setActiveSection(sec);
    window.location.hash = sec;
  };

  const executeProtected = async (action) => {
    if (!state) return;
    const req = await PasswordService.requiresAuth(state.security);
    if (req) {
      setPendingAction(() => action);
      setShowPasswordModal(true);
    } else {
      await action();
    }
  };

  // Actions
  const handleToggleMaster = (checked) => {
    const action = async () => {
      await SettingsRepository.updateSettings({ enabled: checked });
      chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
    };

    if (!checked && state?.security?.passwordEnabled) {
      executeProtected(action);
    } else {
      action();
    }
  };

  const handleAddSite = async (newSite) => {
    await SettingsRepository.addBlockSite(newSite);
    chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
  };

  const handleRemoveSite = (id) => {
    const action = async () => {
      await SettingsRepository.removeBlockSite(id);
      chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
    };
    executeProtected(action);
  };

  const handleToggleSite = (id, enabled) => {
    const action = async () => {
      await SettingsRepository.toggleBlockSite(id, enabled);
      chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
    };
    executeProtected(action);
  };

  const handleAddAllow = async (item) => {
    await SettingsRepository.addAllowSite(item);
    chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
  };

  const handleRemoveAllow = async (id) => {
    await SettingsRepository.removeAllowSite(id);
    chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
  };

  const handleSaveSchedule = async (sched) => {
    await SettingsRepository.saveSchedule(sched);
    chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
  };

  const handleRemoveSchedule = (id) => {
    const action = async () => {
      await SettingsRepository.removeSchedule(id);
      chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
    };
    executeProtected(action);
  };

  const handleUpdateFocusSettings = async (fs) => {
    const updated = { ...state, focusSettings: fs };
    await SettingsRepository.saveState(updated);
  };

  const handleUpdateSettings = async (partial) => {
    await SettingsRepository.updateSettings(partial);
    chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
  };

  const handleUpdateSecurity = async (sec) => {
    await SettingsRepository.updateSecurity(sec);
  };

  const handleResetAll = () => {
    const action = async () => {
      await SettingsRepository.resetToDefaults();
      chrome.runtime?.sendMessage?.({ type: 'RECONCILE_NOW' });
      await loadState();
    };
    executeProtected(action);
  };

  if (!state) {
    return <div style={styles.loading}>Loading settings...</div>;
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'blockedSites', label: t('blockedSites'), icon: Slash },
    { id: 'exceptions', label: t('exceptions'), icon: CheckCircle },
    { id: 'schedules', label: t('schedules'), icon: Calendar },
    { id: 'focus', label: t('focus'), icon: Clock },
    { id: 'blockedPage', label: t('blockedPage'), icon: Palette },
    { id: 'security', label: t('security'), icon: Lock },
    { id: 'backupRestore', label: t('backupRestore'), icon: Database },
    { id: 'language', label: t('language'), icon: Languages },
    { id: 'about', label: t('about'), icon: Info },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.logoBadge}>
            <Shield size={22} color="#ffffff" fill="#4f46e5" />
          </div>
          <div>
            <h1 style={styles.brandTitle}>{t('appName')}</h1>
            <span style={styles.brandSub}>Settings</span>
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                style={{
                  ...styles.navBtn,
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#475569',
                  fontWeight: isActive ? '700' : '500',
                }}
                onClick={() => navigateTo(id)}
              >
                <Icon size={18} color={isActive ? '#4f46e5' : '#64748b'} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Panel */}
      <main style={styles.mainContent}>
        <div style={styles.contentInner}>
          {activeSection === 'dashboard' && (
            <DashboardSection
              state={state}
              onToggleMaster={handleToggleMaster}
              onNavigate={navigateTo}
            />
          )}
          {activeSection === 'blockedSites' && (
            <BlockedSitesSection
              state={state}
              onAddSite={handleAddSite}
              onRemoveSite={handleRemoveSite}
              onToggleSite={handleToggleSite}
            />
          )}
          {activeSection === 'exceptions' && (
            <ExceptionsSection
              state={state}
              onAddAllow={handleAddAllow}
              onRemoveAllow={handleRemoveAllow}
            />
          )}
          {activeSection === 'schedules' && (
            <SchedulesSection
              state={state}
              onSaveSchedule={handleSaveSchedule}
              onRemoveSchedule={handleRemoveSchedule}
            />
          )}
          {activeSection === 'focus' && (
            <FocusSection
              state={state}
              onUpdateFocusSettings={handleUpdateFocusSettings}
            />
          )}
          {activeSection === 'blockedPage' && (
            <BlockedPageSection
              state={state}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
          {activeSection === 'security' && (
            <SecuritySection
              state={state}
              onUpdateSecurity={handleUpdateSecurity}
              onResetAll={handleResetAll}
            />
          )}
          {activeSection === 'backupRestore' && (
            <BackupRestoreSection state={state} onReloadState={loadState} />
          )}
          {activeSection === 'language' && (
            <LanguageSection
              onUpdateLanguage={(lang) => handleUpdateSettings({ language: lang })}
            />
          )}
          {activeSection === 'about' && <AboutSection />}
        </div>
      </main>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setShowPasswordModal(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        verifyFn={(pwd) => PasswordService.authenticate(pwd, state.security)}
      />
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '16px',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0,
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 24px 8px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '16px',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  brandSub: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '36px 40px',
  },
  contentInner: {
    maxWidth: '820px',
    margin: '0 auto',
  },
};
