import React from 'react';

export function Switch({ checked, onChange, disabled = false, ariaLabel = 'Toggle' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        ...styles.switch,
        backgroundColor: checked ? '#4f46e5' : '#cbd5e1',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        style={{
          ...styles.knob,
          transform: checked ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </button>
  );
}

const styles = {
  switch: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '42px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    padding: 0,
    outline: 'none',
    transition: 'background-color 0.2s ease',
  },
  knob: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease',
  },
};
