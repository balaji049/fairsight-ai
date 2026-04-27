// src/components/GeminiPanel.jsx
// Displays Gemini's plain-language bias explanation
import React from 'react';
import { Card, SectionLabel, Spinner } from './UI';

export default function GeminiPanel({ explanation, loading }) {
  // Split explanation into paragraphs for styled rendering
  const paragraphs = explanation
    ? explanation.split(/\n+/).filter(p => p.trim().length > 0)
    : [];

  const paragraphIcons = ['🔍', '👥', '⚖️'];
  const paragraphLabels = ['What was found', 'Why it matters in India', 'Legal risk & fix'];

  return (
    <Card style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #4285F4, #34A853)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>✨</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--grey-900)' }}>
            Gemini AI Explanation
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>
            Plain-language summary for policy makers
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 20,
          background: 'var(--blue-lt)', color: 'var(--blue)',
        }}>
          gemini-2.0-flash
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 12, padding: '32px 0', color: 'var(--grey-500)',
        }}>
          <Spinner size={28} />
          <div style={{ fontSize: 13 }}>Gemini is analyzing the bias findings…</div>
        </div>
      )}

      {/* No explanation yet */}
      {!loading && !explanation && (
        <div style={{
          padding: '24px', textAlign: 'center', color: 'var(--grey-500)',
          background: 'var(--grey-50)', borderRadius: 'var(--radius)',
          border: '1px dashed var(--grey-300)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
          <div style={{ fontSize: 13 }}>
            Gemini explanation will appear here after the audit completes.
          </div>
        </div>
      )}

      {/* Explanation — 3 styled paragraphs */}
      {!loading && explanation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {paragraphs.map((para, i) => (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 'var(--radius)',
              background: i === 0 ? 'var(--blue-lt)' : i === 1 ? 'var(--amber-lt)' : 'var(--red-lt)',
              borderLeft: `3px solid ${i === 0 ? 'var(--blue)' : i === 1 ? 'var(--amber)' : 'var(--red)'}`,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 6,
                color: i === 0 ? 'var(--blue)' : i === 1 ? 'var(--amber)' : 'var(--red)',
              }}>
                {paragraphIcons[i] || '•'} {paragraphLabels[i] || `Finding ${i + 1}`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--grey-900)', lineHeight: 1.7 }}>
                {para}
              </div>
            </div>
          ))}

          {/* Copy button */}
          <button
            onClick={() => navigator.clipboard.writeText(explanation)}
            style={{
              alignSelf: 'flex-start', marginTop: 4,
              padding: '6px 14px', borderRadius: 20,
              border: '1px solid var(--grey-300)', background: 'white',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--grey-700)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            📋 Copy explanation
          </button>
        </div>
      )}
    </Card>
  );
}
