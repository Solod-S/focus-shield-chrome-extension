import React, { useState, useEffect, useRef } from 'react';
import {
  Slash,
  Clock,
  Edit3,
  ArrowRight,
  Square,
  Pause,
  Play,
  Minus,
  Plus,
  Globe,
  ShieldAlert,
  Power,
} from 'lucide-react';
import { Header } from '../components/Header.jsx';
import { CircularTimer } from '../components/CircularTimer.jsx';
import { PasswordModal } from '../components/PasswordModal.jsx';
import { Switch } from '../components/Switch.jsx';
import { useI18n } from '../i18n/index.js';
import { SettingsRepository } from '../storage/settingsRepository.js';
import { PasswordService } from '../security/passwordService.js';
import { PAUSE_DURATIONS } from '../shared/constants.js';

export function App() {
  const { t, setLanguage } = useI18n();
  const [state, setState] = useState(null);
  const [activeTab, setActiveTab] = useState('block'); // 'block' | 'focus'
  const [tabInfo, setTabInfo] = useState({ supported: false, hostname: '', isBlocked: false });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);

  // Focus configuration controls
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [cycles, setCycles] = useState(2);
  const [strictMode, setStrictMode] = useState(false);

  // Timer ticker
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    // 1. Initial State Load
    SettingsRepository.getState().then((st) => {
      setState(st);
      if (st.settings?.language) {
        setLanguage(st.settings.language);
      }
      if (st.focusSettings) {
        setFocusMinutes(st.focusSettings.defaultMinutes || 25);
        setBreakMinutes(st.focusSettings.defaultBreakMinutes || 5);
        setCycles(st.focusSettings.defaultCycles || 2);
        setStrictMode(Boolean(st.focusSettings.strictModeDefault));
      }
    });

    // 2. Query Active Tab
    if (globalThis?.chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_INFO' }, (response) => {
        if (response && response.supported) {
          setTabInfo(response);
        }
      });
    }

    // 3. Subscribe to storage updates
    const unsubscribe = SettingsRepository.subscribe((updated) => {
      setState(updated);
      if (updated.settings?.language) {
        setLanguage(updated.settings.language);
      }
    });

    // 4. Timer tick
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const openSettings = (section = 'dashboard') => {
    if (globalThis?.chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (globalThis?.chrome?.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL(`settings.html#${section}`) });
    }
  };

  const handleProtectedAction = async (action) => {
    if (!state) return;
    const requiresAuth = await PasswordService.requiresAuth(state.security);
    if (requiresAuth) {
      setPendingAction(() => action);
      setShowPasswordModal(true);
    } else {
      await action();
    }
  };

  // 1. Toggle Master Blocking
  const toggleMasterBlocking = (checked) => {
    const action = async () => {
      await SettingsRepository.updateSettings({ enabled: checked });
      chrome.runtime.sendMessage({ type: 'RECONCILE_NOW' });
    };

    if (!checked && state?.security?.passwordEnabled) {
      handleProtectedAction(action);
    } else {
      action();
    }
  };

  // 2. Block or Unblock current site
  const toggleCurrentSite = () => {
    if (!tabInfo.hostname || !tabInfo.blockable) return;

    if (tabInfo.isBlocked) {
      // Unblock
      const action = async () => {
        const itemToRemove = state.blockList.find(
          (s) => s.value === tabInfo.hostname || tabInfo.hostname.endsWith(`.${s.value}`)
        );
        if (itemToRemove) {
          await SettingsRepository.removeBlockSite(itemToRemove.id);
          chrome.runtime.sendMessage({ type: 'RECONCILE_NOW' });
          setTabInfo((prev) => ({ ...prev, isBlocked: false }));
        }
      };
      handleProtectedAction(action);
    } else {
      // Block
      const action = async () => {
        const newSite = {
          id: `site_${Date.now()}`,
          type: 'domain',
          value: tabInfo.hostname,
          enabled: true,
          includeSubdomains: true,
          matchMode: 'domain',
          createdAt: new Date().toISOString(),
          note: '',
        };
        await SettingsRepository.addBlockSite(newSite);
        chrome.runtime.sendMessage({ type: 'RECONCILE_NOW' });
        setTabInfo((prev) => ({ ...prev, isBlocked: true }));
      };
      action();
    }
  };

  // 3. Focus Session Controls
  const handleStartFocus = () => {
    chrome.runtime.sendMessage(
      {
        type: 'START_FOCUS',
        payload: {
          durationMinutes: focusMinutes,
          breakMinutes,
          totalCycles: cycles,
          strictMode,
          siteIds: state?.focusSettings?.siteIds || [],
        },
      },
      (res) => {
        if (res?.focusState) {
          setState((prev) => ({ ...prev, focusState: res.focusState }));
        }
      }
    );
  };

  const handleStopFocus = () => {
    chrome.runtime.sendMessage({ type: 'STOP_FOCUS' }, (res) => {
      if (res?.error) {
        alert(res.error);
      } else if (res?.focusState) {
        setState((prev) => ({ ...prev, focusState: res.focusState }));
      }
    });
  };

  const handlePauseFocus = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_FOCUS' });
  };

  const handleResumeFocus = () => {
    chrome.runtime.sendMessage({ type: 'RESUME_FOCUS' });
  };

  // 4. Pause Blocking Controls
  const handleStartPause = (minutes) => {
    chrome.runtime.sendMessage({ type: 'START_PAUSE', payload: { durationMinutes: minutes } });
    setPauseMenuOpen(false);
  };

  const handleResumeBlocking = () => {
    chrome.runtime.sendMessage({ type: 'RESUME_BLOCKING' });
  };

  if (!state) {
    return <div style={styles.loadingContainer}>Loading Focus Shield...</div>;
  }

  const isFocusActive = state.focusState?.active;
  const isPauseActive = state.pauseState?.active;

  // Remaining seconds calculation
  let remainingSeconds = 0;
  let totalPhaseSeconds = 1;
  if (isFocusActive) {
    if (state.focusState.isPaused) {
      remainingSeconds = Math.max(0, Math.floor(state.focusState.pausedRemainingMs / 1000));
    } else {
      remainingSeconds = Math.max(0, Math.floor(((state.focusState.endsAt || nowMs) - nowMs) / 1000));
    }
    const currentPhaseMinutes =
      state.focusState.phase === 'break' ? state.focusState.breakMinutes : state.focusState.durationMinutes;
    totalPhaseSeconds = Math.max(1, currentPhaseMinutes * 60);
  }

  return (
    <div style={styles.appWrapper}>
      <Header onOpenSettings={() => openSettings('dashboard')} />

      {/* Navigation Tabs */}
      <nav style={styles.tabNav}>
        <button
          style={{
            ...styles.tabBtn,
            color: activeTab === 'block' ? '#4f46e5' : '#64748b',
            borderBottomColor: activeTab === 'block' ? '#4f46e5' : 'transparent',
          }}
          onClick={() => setActiveTab('block')}
        >
          <Slash size={16} style={{ transform: 'rotate(45deg)' }} />
          <span>{t('blockSites')}</span>
        </button>
        <button
          style={{
            ...styles.tabBtn,
            color: activeTab === 'focus' ? '#4f46e5' : '#64748b',
            borderBottomColor: activeTab === 'focus' ? '#4f46e5' : 'transparent',
          }}
          onClick={() => setActiveTab('focus')}
        >
          <Clock size={16} />
          <span>{t('focusMode')}</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div style={styles.tabContent}>
        {/* TAB 1: BLOCK SITES */}
        {activeTab === 'block' && (
          <div style={styles.blockView}>
            {/* Master Toggle & Quick Pause Bar */}
            <div style={styles.statusBar}>
              <div style={styles.masterToggleRow}>
                <span style={styles.statusLabel}>
                  {state.settings.enabled ? t('blockingOn') : t('blockingOff')}
                </span>
                <Switch
                  checked={state.settings.enabled}
                  onChange={toggleMasterBlocking}
                  ariaLabel="Toggle blocking"
                />
              </div>

              {/* Pause info or trigger button */}
              {isPauseActive ? (
                <div style={styles.pauseActiveBanner}>
                  <span>{t('paused')}</span>
                  <button style={styles.resumeMiniBtn} onClick={handleResumeBlocking}>
                    {t('resumeBlocking')}
                  </button>
                </div>
              ) : (
                <div style={styles.pauseDropdownWrap}>
                  <button
                    style={styles.pauseTriggerBtn}
                    onClick={() => setPauseMenuOpen(!pauseMenuOpen)}
                  >
                    <Pause size={12} />
                    <span>{t('pauseBlocking')}</span>
                  </button>
                  {pauseMenuOpen && (
                    <div style={styles.pauseMenu}>
                      {PAUSE_DURATIONS.map((dur) => (
                        <button
                          key={dur.label}
                          style={styles.pauseMenuItem}
                          onClick={() => handleStartPause(dur.minutes)}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Current Site Card */}
            <div style={styles.currentSiteContainer}>
              {tabInfo.supported ? (
                tabInfo.blockable ? (
                  <div style={styles.siteInfoBox}>
                    <div style={styles.faviconBox}>
                      {tabInfo.faviconUrl ? (
                        <img src={tabInfo.faviconUrl} alt="" style={styles.favicon} />
                      ) : (
                        <Globe size={28} color="#4f46e5" />
                      )}
                    </div>
                    <h2 style={styles.siteDomain}>{tabInfo.hostname}</h2>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: tabInfo.isBlocked ? '#fee2e2' : '#f0fdf4',
                        color: tabInfo.isBlocked ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {tabInfo.isBlocked ? t('blocked') : t('active')}
                    </span>
                  </div>
                ) : (
                  <div style={styles.siteInfoBox}>
                    <ShieldAlert size={36} color="#94a3b8" />
                    <h3 style={styles.protectedTitle}>{t('protectedSite')}</h3>
                    <p style={styles.protectedSubtitle}>
                      Internal browser pages are safe and cannot be blocked.
                    </p>
                  </div>
                )
              ) : (
                <div style={styles.siteInfoBox}>
                  <Globe size={32} color="#94a3b8" />
                  <h3 style={styles.protectedTitle}>{t('appName')}</h3>
                  <p style={styles.protectedSubtitle}>{t('tagline')}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={styles.actionRow}>
              <button
                style={styles.secondaryBtn}
                onClick={() => openSettings('blockedSites')}
              >
                <Edit3 size={16} />
                <span>{t('changeBlockedSites')}</span>
              </button>

              {tabInfo.supported && tabInfo.blockable && (
                <button
                  style={{
                    ...styles.primaryBtn,
                    backgroundColor: tabInfo.isBlocked ? '#4f46e5' : '#4f46e5',
                  }}
                  onClick={toggleCurrentSite}
                >
                  {tabInfo.isBlocked ? t('unblockCurrentSite') : t('blockCurrentSite')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FOCUS MODE */}
        {activeTab === 'focus' && (
          <div style={styles.focusView}>
            {isFocusActive ? (
              // ACTIVE SESSION SCREEN
              <div style={styles.activeSessionContainer}>
                <h2 style={styles.sessionTitle}>
                  {state.focusState.phase === 'break' ? `${t('breakMode')}..` : `${t('focusMode')}..`}
                </h2>
                <div style={styles.cycleBadge}>
                  {t('cycle')} {state.focusState.currentCycle} {t('of')} {state.focusState.totalCycles}{' '}
                  {t('cycles')}
                </div>

                <CircularTimer
                  remainingSeconds={remainingSeconds}
                  totalSeconds={totalPhaseSeconds}
                  size={180}
                  strokeWidth={7}
                />

                <div style={styles.sessionControlButtons}>
                  <button style={styles.stopBtn} onClick={handleStopFocus}>
                    <Square size={16} />
                    <span>{t('stopSession')}</span>
                  </button>

                  {state.focusState.isPaused ? (
                    <button style={styles.primaryBtn} onClick={handleResumeFocus}>
                      <Play size={16} />
                      <span>{t('resumeSession')}</span>
                    </button>
                  ) : (
                    <button style={styles.primaryBtn} onClick={handlePauseFocus}>
                      <Pause size={16} />
                      <span>{t('pauseSession')}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // CONFIGURATION SCREEN (Focus Parameters)
              <div style={styles.focusConfigContainer}>
                <h2 style={styles.focusParamsHeading}>{t('focusParameters')}</h2>

                <div style={styles.paramsList}>
                  {/* Parameter 1: Focus Time */}
                  <div style={styles.paramItem}>
                    <span style={styles.paramLabel}>{t('focusTime')}</span>
                    <div style={styles.counterWrap}>
                      <button
                        style={styles.circleBtn}
                        onClick={() => setFocusMinutes(Math.max(5, focusMinutes - 5))}
                        aria-label="Decrease focus time"
                      >
                        <Minus size={15} color="#4f46e5" />
                      </button>
                      <div style={styles.paramValuePill}>
                        <span style={styles.paramNumber}>{focusMinutes}</span>
                        <span style={styles.paramUnit}>{t('minutes')}</span>
                      </div>
                      <button
                        style={styles.circleBtn}
                        onClick={() => setFocusMinutes(Math.min(180, focusMinutes + 5))}
                        aria-label="Increase focus time"
                      >
                        <Plus size={15} color="#4f46e5" />
                      </button>
                    </div>
                  </div>

                  {/* Parameter 2: Break Time */}
                  <div style={styles.paramItem}>
                    <span style={styles.paramLabel}>{t('breakTime')}</span>
                    <div style={styles.counterWrap}>
                      <button
                        style={styles.circleBtn}
                        onClick={() => setBreakMinutes(Math.max(0, breakMinutes - 1))}
                        aria-label="Decrease break time"
                      >
                        <Minus size={15} color="#4f46e5" />
                      </button>
                      <div style={styles.paramValuePill}>
                        <span style={styles.paramNumber}>{breakMinutes}</span>
                        <span style={styles.paramUnit}>{t('minutes')}</span>
                      </div>
                      <button
                        style={styles.circleBtn}
                        onClick={() => setBreakMinutes(Math.min(60, breakMinutes + 1))}
                        aria-label="Increase break time"
                      >
                        <Plus size={15} color="#4f46e5" />
                      </button>
                    </div>
                  </div>

                  {/* Parameter 3: Number of Cycles */}
                  <div style={styles.paramItem}>
                    <span style={styles.paramLabel}>{t('numberOfCycles')}</span>
                    <div style={styles.counterWrap}>
                      <button
                        style={styles.circleBtn}
                        onClick={() => setCycles(Math.max(1, cycles - 1))}
                        aria-label="Decrease cycles"
                      >
                        <Minus size={15} color="#4f46e5" />
                      </button>
                      <div style={styles.paramValuePillSingle}>
                        <span style={styles.paramNumber}>{cycles}</span>
                      </div>
                      <button
                        style={styles.circleBtn}
                        onClick={() => setCycles(Math.min(12, cycles + 1))}
                        aria-label="Increase cycles"
                      >
                        <Plus size={15} color="#4f46e5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={styles.actionRow}>
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => openSettings('focus')}
                  >
                    <Edit3 size={16} />
                    <span>{t('changeBlockedSites')}</span>
                  </button>

                  <button style={styles.startSessionBtn} onClick={handleStartFocus}>
                    <span>{t('startSession')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Authentication Modal */}
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
  appWrapper: {
    width: '360px',
    minHeight: '520px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    width: '360px',
    height: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  tabBtn: {
    flex: 1,
    padding: '12px 10px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    backgroundColor: '#ffffff',
  },
  blockView: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    marginBottom: '16px',
  },
  masterToggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  pauseDropdownWrap: {
    position: 'relative',
  },
  pauseTriggerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '5px 8px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
  },
  pauseActiveBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#d97706',
    fontWeight: '600',
  },
  resumeMiniBtn: {
    background: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#92400e',
    cursor: 'pointer',
  },
  pauseMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '130px',
    overflow: 'hidden',
  },
  pauseMenuItem: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: '12px',
    color: '#334155',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  currentSiteContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 12px',
  },
  siteInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  faviconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
  },
  favicon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
  },
  siteDomain: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    wordBreak: 'break-all',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.2px',
  },
  protectedTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#334155',
    margin: '10px 0 4px 0',
  },
  protectedSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    maxWidth: '240px',
    lineHeight: '1.4',
  },
  actionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: 'auto',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    transition: 'opacity 0.15s ease',
  },
  startSessionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
  },
  focusView: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
  },
  focusConfigContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  focusParamsHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    margin: '6px 0 16px 0',
  },
  paramsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '20px',
  },
  paramItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  paramLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
  },
  counterWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  circleBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    border: '1px solid #c7d2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
  },
  paramValuePill: {
    minWidth: '76px',
    padding: '6px 8px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paramValuePillSingle: {
    minWidth: '50px',
    padding: '6px 8px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paramNumber: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  paramUnit: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '-1px',
  },
  activeSessionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    flex: 1,
  },
  sessionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '4px 0 2px 0',
  },
  cycleBadge: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '8px',
  },
  sessionControlButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginTop: 'auto',
  },
  stopBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
