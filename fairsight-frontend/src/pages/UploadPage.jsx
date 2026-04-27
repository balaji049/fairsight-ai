// src/pages/UploadPage.jsx
// Fixed: domain selection visual state + demo CSV + full connection to audit
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const DOMAINS = [
  { id: 'loan',      label: 'Loan Approval',      icon: '🏦', desc: 'Bank/NBFC credit decisions',        color: '#1A73E8' },
  { id: 'job',       label: 'Job Screening',       icon: '💼', desc: 'Resume filtering & shortlisting',   color: '#0F9D58' },
  { id: 'education', label: 'College Admission',   icon: '🎓', desc: 'Admission ranking systems',         color: '#F29900' },
  { id: 'welfare',   label: 'Welfare Eligibility', icon: '🏛️', desc: 'Govt scheme beneficiary selection', color: '#9C27B0' },
  { id: 'custom',    label: 'Custom Dataset',      icon: '📋', desc: 'Any binary outcome dataset',        color: '#607D8B' },
];

const DOMAIN_AXES = {
  loan:      'gender, state, income, caste',
  job:       'gender, state, caste, language',
  education: 'gender, state, income, caste',
  welfare:   'gender, state, income, caste, language',
  custom:    'all axes',
};

const EXPECTED_COLS = ['gender', 'state_type', 'income_bracket', 'caste_category', 'language', 'approved'];

export default function UploadPage({ onAuditStart }) {
  const [domain, setDomain] = useState('loan');
  const [file,   setFile]   = useState(null);
  const [error,  setError]  = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length) { setError('Only .csv files are accepted (max 10 MB).'); return; }
    setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = () => {
    if (!file) { setError('Please upload a CSV file first.'); return; }
    onAuditStart(file, domain);
  };

  const sel = DOMAINS.find(d => d.id === domain);

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: 'linear-gradient(160deg,#f8f9ff 0%,#eef2ff 50%,#f8f9ff 100%)',
      padding: '40px 24px 60px',
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#E8F0FE', color: '#1A73E8',
            fontSize: 12, fontWeight: 600, padding: '5px 14px',
            borderRadius: 20, marginBottom: 16,
          }}>
            🇮🇳 India's First AI Bias Compliance Platform
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.25, color: '#202124', marginBottom: 10 }}>
            Detect Algorithmic Bias in<br />
            <span style={{ color: '#1A73E8' }}>Public Sector AI Systems</span>
          </h1>
          <p style={{ fontSize: 14, color: '#5F6368', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Upload your model's prediction dataset. FairSight computes Disparate Impact Ratios
            across gender, caste, state, income and language — then maps violations to DPDP Act 2023.
          </p>
        </div>

        {/* ── STEP 1: Domain ─────────────────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #E8EAED',
          boxShadow: '0 1px 3px rgba(60,64,67,.12)',
          padding: '24px', marginBottom: 18,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: '#9AA0A6', marginBottom: 16,
          }}>
            Step 1 — Select Domain
          </div>

          {/* 5 domain buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}>
            {DOMAINS.map(d => {
              const active = domain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => { setDomain(d.id); setError(''); }}
                  style={{
                    padding: '14px 6px 12px',
                    borderRadius: 12,
                    border: active ? `2px solid ${d.color}` : '1.5px solid #E8EAED',
                    background: active
                      ? `linear-gradient(145deg,${d.color}18,${d.color}28)`
                      : '#FAFAFA',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 180ms cubic-bezier(.2,0,0,1)',
                    transform: active ? 'translateY(-3px)' : 'translateY(0)',
                    boxShadow: active
                      ? `0 6px 16px ${d.color}35`
                      : '0 1px 2px rgba(60,64,67,.08)',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 7, lineHeight: 1 }}>{d.icon}</div>
                  <div style={{
                    fontSize: 11, fontWeight: active ? 700 : 500,
                    color: active ? d.color : '#3C4043',
                    lineHeight: 1.3, marginBottom: 3,
                  }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#9AA0A6', lineHeight: 1.35 }}>
                    {d.desc}
                  </div>
                  {/* Selection indicator dot */}
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: active ? d.color : 'transparent',
                    margin: '7px auto 0',
                    transition: 'background 180ms ease',
                  }} />
                </button>
              );
            })}
          </div>

          {/* Dynamic axes info */}
          <div style={{
            marginTop: 14,
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${sel.color}14`,
              border: `1px solid ${sel.color}40`,
              color: sel.color,
              fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 20,
              transition: 'all 220ms ease',
            }}>
              {sel.icon} {sel.label} selected
            </div>
            <span style={{ fontSize: 12, color: '#9AA0A6' }}>
              Auditing bias axes: <strong style={{ color: '#3C4043' }}>{DOMAIN_AXES[domain]}</strong>
            </span>
          </div>
        </div>

        {/* ── STEP 2: Upload ──────────────────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #E8EAED',
          boxShadow: '0 1px 3px rgba(60,64,67,.12)',
          padding: '24px', marginBottom: 18,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: '#9AA0A6', marginBottom: 16,
          }}>
            Step 2 — Upload Prediction Dataset (CSV)
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#1A73E8' : file ? '#0F9D58' : '#DADCE0'}`,
              borderRadius: 12, padding: '36px 24px',
              textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? '#E8F0FE' : file ? '#E6F4EA' : '#FAFAFA',
              transition: 'all 180ms ease',
            }}
          >
            <input {...getInputProps()} />
            {file ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F9D58' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: '#9AA0A6', marginTop: 4 }}>
                  {(file.size / 1024).toFixed(1)} KB · Click or drag to replace
                </div>
              </>
            ) : isDragActive ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📥</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A73E8' }}>Drop it here!</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#3C4043' }}>
                  Drag & drop your CSV, or{' '}
                  <span style={{ color: '#1A73E8', textDecoration: 'underline' }}>browse</span>
                </div>
                <div style={{ fontSize: 12, color: '#9AA0A6', marginTop: 6 }}>Max 10 MB · Must be .csv</div>
              </>
            )}
          </div>

          {/* Column hints */}
          <div style={{
            marginTop: 12, padding: '12px 14px',
            background: '#F8F9FA', borderRadius: 8,
            border: '1px solid #E8EAED',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#3C4043', marginBottom: 8 }}>
              Expected columns (your CSV should include these):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {EXPECTED_COLS.map(col => (
                <code key={col} style={{
                  fontSize: 11, background: 'white', color: '#1A73E8',
                  border: '1px solid #DADCE0', padding: '2px 8px',
                  borderRadius: 4, fontFamily: 'monospace',
                }}>
                  {col}
                </code>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#9AA0A6' }}>
              💡 No dataset?{' '}
              <span style={{ color: '#1A73E8', fontWeight: 600 }}>
                Run <code style={{
                  fontFamily: 'monospace', fontSize: 11,
                  background: '#E8F0FE', padding: '1px 6px', borderRadius: 3,
                }}>python generate_demo_data.py</code>
              </span>
              {' '}in the <code style={{ fontFamily: 'monospace', fontSize: 11 }}>fairsight-backend/</code> folder to generate a 500-row demo CSV instantly.
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: '#FCE8E6', borderRadius: 8,
              fontSize: 13, color: '#D93025', fontWeight: 500,
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={!file}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 40px', borderRadius: 24, border: 'none',
              cursor: file ? 'pointer' : 'not-allowed',
              fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
              background: file ? sel.color : '#DADCE0',
              color: file ? 'white' : '#9AA0A6',
              boxShadow: file ? `0 4px 16px ${sel.color}50` : 'none',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { if (file) e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
          >
            🔍 Run Bias Audit
          </button>
          {file && (
            <div style={{ fontSize: 12, color: '#9AA0A6' }}>
              Auditing <strong style={{ color: '#3C4043' }}>{file.name}</strong> as{' '}
              <strong style={{ color: sel.color }}>{sel.label}</strong>
            </div>
          )}
        </div>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 48,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}>
          {[
            { icon: '📊', title: 'Disparate Impact Ratio', desc: "Measures approval rate gap between demographic groups using the 4/5ths rule" },
            { icon: '✨', title: 'Gemini Explanation',     desc: "Converts technical stats into plain language any policy maker can act on" },
            { icon: '⚖️', title: 'DPDP Compliance',       desc: "Maps violations to India's DPDP Act 2023 and RBI FREE-AI Framework 2025" },
          ].map(item => (
            <div key={item.title} style={{
              padding: '16px', background: 'white',
              borderRadius: 12, border: '1px solid #E8EAED',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(60,64,67,.08)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#202124', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#5F6368', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
