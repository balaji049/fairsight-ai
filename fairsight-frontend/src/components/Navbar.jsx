// src/components/Navbar.jsx
import React from 'react';

export default function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'white', borderBottom: '1px solid var(--grey-200)',
      boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>⚖️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--grey-900)', lineHeight: 1 }}>
              FairSight<span style={{ color: 'var(--blue)' }}> AI</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--grey-500)', lineHeight: 1, marginTop: 2 }}>
              Bias Auditor for India's Public Sector
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            background: 'var(--blue-lt)', color: 'var(--blue)',
            borderRadius: 20,
          }}>
            DPDP Act 2023 Aligned
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            background: 'var(--green-lt)', color: 'var(--green)',
            borderRadius: 20,
          }}>
            RBI FREE-AI Ready
          </span>
        </div>
      </div>
    </nav>
  );
}
