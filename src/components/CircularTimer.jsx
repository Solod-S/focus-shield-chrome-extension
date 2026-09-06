import React from 'react';
import { useI18n } from '../i18n/index.js';

/**
 * Circular progress timer matching the FocusGuard reference screenshot.
 * @param {Object} props
 * @param {number} props.remainingSeconds
 * @param {number} props.totalSeconds
 * @param {number} [props.size=170]
 * @param {number} [props.strokeWidth=6]
 */
export function CircularTimer({ remainingSeconds, totalSeconds, size = 170, strokeWidth = 6 }) {
  const { t } = useI18n();

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Fraction left
  const fraction = totalSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds)) : 0;
  // Progress stroke offset
  const strokeDashoffset = circumference - fraction * circumference;

  // Format HH:MM:SS or MM:SS
  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div style={{ ...styles.container, width: size, height: size }}>
      <svg width={size} height={size} style={styles.svg}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Animated active progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={styles.progressCircle}
        />
      </svg>
      {/* Centered time readout */}
      <div style={styles.centerText}>
        <span style={styles.timeDigits}>{formatTime(remainingSeconds)}</span>
        <span style={styles.leftLabel}>{t('left')}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px auto',
  },
  svg: {
    transform: 'rotate(-90deg)',
  },
  progressCircle: {
    transition: 'stroke-dashoffset 0.8s ease-in-out',
  },
  centerText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigits: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    fontVariantNumeric: 'tabular-nums',
  },
  leftLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
};
