import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Moon, Check } from 'lucide-react';
import { useI18n } from '../../i18n/index.js';
import { Switch } from '../../components/Switch.jsx';
import { timeToMinutes } from '../../schedules/scheduleEvaluator.js';

const DAYS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export function SchedulesSection({ state, onSaveSchedule, onRemoveSchedule }) {
  const { t } = useI18n();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [error, setError] = useState('');

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const toggleSite = (siteId) => {
    if (selectedSiteIds.includes(siteId)) {
      setSelectedSiteIds(selectedSiteIds.filter((id) => id !== siteId));
    } else {
      setSelectedSiteIds([...selectedSiteIds, siteId]);
    }
  };

  const isOvernight = timeToMinutes(startTime) > timeToMinutes(endTime);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a schedule name');
      return;
    }

    if (selectedDays.length === 0) {
      setError(t('errorInvalidSchedule'));
      return;
    }

    const newSchedule = {
      id: `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      enabled: true,
      days: selectedDays,
      startTime,
      endTime,
      siteIds: selectedSiteIds.length > 0 ? selectedSiteIds : state.blockList.map((s) => s.id),
    };

    onSaveSchedule(newSchedule);
    setName('');
    setShowAddForm(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.sectionTitle}>{t('schedules')}</h2>
          <p style={styles.sectionDesc}>
            Automatically block distracting websites on certain days and times.
          </p>
        </div>
        {!showAddForm && (
          <button style={styles.createBtn} onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            <span>Create Schedule</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={styles.addCard}>
          <h3 style={styles.formTitle}>New Schedule</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>{t('scheduleName')}</label>
              <input
                type="text"
                placeholder="e.g. Work hours or Late night"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.textInput}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t('daysOfWeek')}</label>
              <div style={styles.daysRow}>
                {DAYS.map(({ day, label }) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        ...styles.dayBtn,
                        backgroundColor: isSelected ? '#4f46e5' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.timeRow}>
              <div style={styles.field}>
                <label style={styles.label}>{t('startTime')}</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={styles.timeInput}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>{t('endTime')}</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={styles.timeInput}
                  required
                />
              </div>
            </div>

            {isOvernight && (
              <div style={styles.overnightBadge}>
                <Moon size={15} color="#6366f1" />
                <span>{t('overnightNotice')}</span>
              </div>
            )}

            {/* Sites to block */}
            <div style={styles.field}>
              <label style={styles.label}>Websites to block during this schedule</label>
              <div style={styles.sitesSelectionGrid}>
                {state.blockList.map((site) => {
                  const isChecked =
                    selectedSiteIds.length === 0 || selectedSiteIds.includes(site.id);
                  return (
                    <label key={site.id} style={styles.siteCheckLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSite(site.id)}
                      />
                      <span>{site.value}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && <span style={styles.errorText}>{error}</span>}

            <div style={styles.formButtons}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowAddForm(false)}
              >
                {t('cancel')}
              </button>
              <button type="submit" style={styles.saveBtn}>
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedules List */}
      <div style={styles.listCard}>
        {state.schedules.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={32} color="#cbd5e1" />
            <p style={styles.emptyText}>No schedules configured yet.</p>
          </div>
        ) : (
          <div style={styles.itemsList}>
            {state.schedules.map((schedule) => {
              const overnight = timeToMinutes(schedule.startTime) > timeToMinutes(schedule.endTime);
              return (
                <div key={schedule.id} style={styles.scheduleRow}>
                  <div style={styles.scheduleInfo}>
                    <div style={styles.scheduleNameRow}>
                      <h4 style={styles.scheduleName}>{schedule.name}</h4>
                      {overnight && (
                        <span style={styles.miniOvernightBadge} title="Crosses midnight">
                          <Moon size={11} />
                          <span>Overnight</span>
                        </span>
                      )}
                    </div>
                    <div style={styles.timeInfo}>
                      <span>
                        {schedule.startTime} – {schedule.endTime}
                      </span>
                      <span style={styles.dot}>•</span>
                      <span>
                        {schedule.days
                          .map((d) => DAYS.find((item) => item.day === d)?.label)
                          .join(', ')}
                      </span>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <Switch
                      checked={schedule.enabled}
                      onChange={(checked) =>
                        onSaveSchedule({ ...schedule, enabled: checked })
                      }
                      ariaLabel={`Toggle ${schedule.name}`}
                    />
                    <button
                      style={styles.deleteBtn}
                      onClick={() => onRemoveSchedule(schedule.id)}
                      title={t('delete')}
                      aria-label={t('delete')}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}
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
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  addCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  formTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 16px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  textInput: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
  },
  daysRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  dayBtn: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  timeRow: {
    display: 'flex',
    gap: '16px',
  },
  timeInput: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
  },
  overnightBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#eef2ff',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#4338ca',
    fontWeight: '500',
  },
  sitesSelectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '8px',
    maxHeight: '140px',
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  siteCheckLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#334155',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '13px',
    color: '#ef4444',
  },
  formButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px',
  },
  cancelBtn: {
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
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
  scheduleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 4px',
    borderBottom: '1px solid #f1f5f9',
  },
  scheduleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  scheduleNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scheduleName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  miniOvernightBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    fontWeight: '600',
  },
  timeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b',
  },
  dot: {
    color: '#cbd5e1',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
};
