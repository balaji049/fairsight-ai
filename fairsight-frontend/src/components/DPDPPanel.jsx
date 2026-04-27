// src/components/DPDPPanel.jsx
// India-unique DPDP Act 2023 compliance checker
import React, { useState } from 'react';
import { Card, SectionLabel, Badge } from './UI';

export default function DPDPPanel({ rules, overallStatus, summary, nonCompliantCount }) {
  const [expanded, setExpanded] = useState(null);

  if (!rules || rules.length === 0) return null;

  const statusIcon = { compliant: '✅', non_compliant: '❌', at_risk: '⚠️' };

  return (
    <Card style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#FF6F00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🇮🇳</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--grey-900)' }}>
              DPDP Act 2023 Compliance
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>
              + RBI FREE-AI Framework 2025
            </div>
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 20,
          background: overallStatus === 'compliant' ? 'var(--green-lt)' : 'var(--red-lt)',
          color: overallStatus === 'compliant' ? 'var(--green)' : 'var(--red)',
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {overallStatus === 'compliant' ? '✅ Compliant' : `❌ ${nonCompliantCount} Violations`}
        </div>
      </div>

      {/* Summary banner */}
      <div style={{
        padding: '10px 14px', borderRadius: 'var(--radius)',
        background: overallStatus === 'compliant' ? 'var(--green-lt)' : 'var(--red-lt)',
        border: `1px solid ${overallStatus === 'compliant' ? 'var(--green)' : 'var(--red)'}`,
        fontSize: 13, color: 'var(--grey-900)', marginBottom: 16, lineHeight: 1.5,
      }}>
        {summary}
      </div>

      {/* Rules list */}
      <SectionLabel>Compliance Checklist</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rules.map((rule, i) => (
          <div key={rule.id}>
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius)',
                background: rule.status === 'non_compliant' ? 'var(--red-lt)' : 'var(--grey-50)',
                border: `1px solid ${rule.status === 'non_compliant' ? '#F5C6C3' : 'var(--grey-200)'}`,
                cursor: 'pointer', transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Status icon */}
              <div style={{ fontSize: 18, flexShrink: 0 }}>
                {statusIcon[rule.status] || '⬜'}
              </div>

              {/* Rule info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-900)' }}>
                  {rule.id}. {rule.title}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--grey-500)', marginTop: 2,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {rule.reference}
                </div>
              </div>

              {/* Status badge */}
              <Badge status={rule.status} />

              {/* Expand arrow */}
              <div style={{
                fontSize: 12, color: 'var(--grey-500)', flexShrink: 0,
                transform: expanded === i ? 'rotate(180deg)' : 'none',
                transition: 'var(--transition)',
              }}>▼</div>
            </div>

            {/* Expanded description */}
            {expanded === i && (
              <div style={{
                padding: '12px 14px',
                background: 'white',
                border: '1px solid var(--grey-200)',
                borderTop: 'none',
                borderRadius: '0 0 var(--radius) var(--radius)',
                fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.6,
              }}>
                {rule.description}
                {rule.affected_findings > 0 && (
                  <div style={{
                    marginTop: 8, fontSize: 12, fontWeight: 500, color: 'var(--red)',
                  }}>
                    ⚠️ {rule.affected_findings} critical bias finding{rule.affected_findings !== 1 ? 's' : ''} violate this rule.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: 16, padding: '10px 14px',
        background: 'var(--grey-50)', borderRadius: 'var(--radius)',
        fontSize: 11, color: 'var(--grey-500)', lineHeight: 1.5,
      }}>
        ℹ️ This compliance report is for informational purposes. Consult a legal expert for formal DPDP Act compliance certification.
        References: DPDP Act 2023, DPDP Rules 2025, RBI FREE-AI Framework 2025, Constitutional Articles 14/15/16.
      </div>
    </Card>
  );
}
