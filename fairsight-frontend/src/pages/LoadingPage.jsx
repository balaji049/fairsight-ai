// src/pages/LoadingPage.jsx
import React, { useEffect, useState } from 'react';
import { Spinner } from '../components/UI';

const STEPS = [
  { icon: '📤', label: 'Uploading dataset to Cloud Storage…',  delay: 0    },
  { icon: '🧮', label: 'Computing Disparate Impact Ratios…',   delay: 1200 },
  { icon: '✨', label: 'Calling Gemini API for explanation…',  delay: 2800 },
  { icon: '⚖️', label: 'Checking DPDP Act 2023 compliance…',  delay: 4400 },
  { icon: '📊', label: 'Building your audit report…',          delay: 5600 },
];

export default function LoadingPage({ fileName }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStep(i), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 32,
    }}>
      {/* Spinner + title */}
      <div style={{ textAlign: 'center' }}>
        <Spinner size={48} />
        <h2 style={{ marginTop: 20, fontSize: 20, fontWeight: 600, color: 'var(--grey-900)' }}>
          Auditing {fileName}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 6 }}>
          Running bias analysis across all demographic axes…
        </p>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 400 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', borderRadius: 'var(--radius)',
            background: i === step ? 'var(--blue-lt)' : i < step ? 'var(--green-lt)' : 'var(--grey-50)',
            border: `1px solid ${i === step ? 'var(--blue)' : i < step ? 'var(--green)' : 'var(--grey-200)'}`,
            transition: 'all 400ms ease',
            opacity: i > step ? 0.4 : 1,
          }}>
            <span style={{ fontSize: 18 }}>
              {i < step ? '✅' : s.icon}
            </span>
            <span style={{
              fontSize: 13,
              color: i === step ? 'var(--blue)' : i < step ? 'var(--green)' : 'var(--grey-700)',
              fontWeight: i === step ? 500 : 400,
            }}>
              {s.label}
            </span>
            {i === step && <Spinner size={14} style={{ marginLeft: 'auto' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
