// src/components/UI.jsx
// Shared, reusable UI primitives

import React from 'react';

// ── Status helpers ────────────────────────────────────────────────────────────
export const statusColor = (status) => ({
  critical:     { bg: 'var(--red-lt)',   text: 'var(--red)',   label: 'Critical' },
  watch:        { bg: 'var(--amber-lt)', text: 'var(--amber)', label: 'Watch'    },
  fair:         { bg: 'var(--green-lt)', text: 'var(--green)', label: 'Fair'     },
  compliant:    { bg: 'var(--green-lt)', text: 'var(--green)', label: 'Compliant'},
  non_compliant:{ bg: 'var(--red-lt)',   text: 'var(--red)',   label: 'Violation'},
  at_risk:      { bg: 'var(--amber-lt)', text: 'var(--amber)', label: 'At Risk'  },
}[status] || { bg: 'var(--grey-100)', text: 'var(--grey-700)', label: status });

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ status, children, style }) => {
  const s = statusColor(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 20, whiteSpace: 'nowrap', ...style,
    }}>
      {children || s.label}
    </span>
  );
};

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', onClick, disabled, style, icon }) => {
  const styles = {
    primary: {
      background: disabled ? 'var(--grey-300)' : 'var(--blue)',
      color: disabled ? 'var(--grey-500)' : 'white',
      border: 'none',
    },
    secondary: {
      background: 'white',
      color: 'var(--blue)',
      border: '1px solid var(--grey-300)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--grey-700)',
      border: 'none',
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 20,
        fontSize: 14, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font)', transition: 'var(--transition)',
        boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-1)' : 'none',
        ...styles[variant], ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && variant === 'primary') e.target.style.background = 'var(--blue-dk)';
      }}
      onMouseLeave={e => {
        if (!disabled && variant === 'primary') e.target.style.background = 'var(--blue)';
      }}
    >
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      {children}
    </button>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, className }) => (
  <div className={className} style={{
    background: 'white', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--grey-200)',
    boxShadow: 'var(--shadow-1)', ...style,
  }}>
    {children}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24, color = 'var(--blue)' }) => (
  <div style={{
    width: size, height: size, border: `2px solid var(--grey-200)`,
    borderTop: `2px solid ${color}`, borderRadius: '50%',
    animation: 'spin 700ms linear infinite',
    flexShrink: 0,
  }} />
);

// ── Section heading ───────────────────────────────────────────────────────────
export const SectionLabel = ({ children, style }) => (
  <div style={{
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--grey-500)',
    marginBottom: 12, ...style,
  }}>
    {children}
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ value, label, color = 'var(--blue)', icon }) => (
  <Card style={{ padding: '16px 20px', textAlign: 'center' }}>
    {icon && <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>}
    <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--grey-700)', marginTop: 4, lineHeight: 1.4 }}>{label}</div>
  </Card>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📊', title, description }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 24px', gap: 12,
    color: 'var(--grey-500)', textAlign: 'center',
  }}>
    <div style={{ fontSize: 40 }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--grey-700)' }}>{title}</div>
    {description && <div style={{ fontSize: 13, maxWidth: 320 }}>{description}</div>}
  </div>
);
