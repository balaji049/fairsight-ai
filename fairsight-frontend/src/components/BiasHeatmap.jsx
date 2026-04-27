// src/components/BiasHeatmap.jsx
// The WOW feature — color-coded DIR grid with drill-down
import React, { useState } from 'react';
import { Card, Badge, SectionLabel, StatCard, statusColor } from './UI';

const AXIS_LABELS = {
  gender:          'Gender',
  state_type:      'State / Region',
  income_bracket:  'Income Bracket',
  caste_category:  'Caste Category',
  language:        'Language',
};

const METRIC_LABELS = {
  disparate_impact_ratio: 'DIR Score',
  approval_rate_group:    'Group Approval %',
  approval_rate_reference:'Reference Approval %',
};

// Cell color based on DIR value
const cellStyle = (status) => ({
  critical: { background: '#FDE8E6', color: '#C5221F', borderColor: '#F5C6C3' },
  watch:    { background: '#FEF7E0', color: '#B06000', borderColor: '#FAE29C' },
  fair:     { background: '#E6F4EA', color: '#137333', borderColor: '#CEEAD6' },
}[status] || { background: 'var(--grey-100)', color: 'var(--grey-700)', borderColor: 'var(--grey-200)' });

// DIR progress bar fill color
const dirBarColor = (dir) => {
  if (dir >= 0.9) return 'var(--green)';
  if (dir >= 0.8) return 'var(--amber)';
  return 'var(--red)';
};

// Drill-down modal for a single bias result
function DetailModal({ result, onClose }) {
  if (!result) return null;
  const s = statusColor(result.status);
  const impact = ((1 - result.disparate_impact_ratio) * 100).toFixed(0);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(32,33,36,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 520, padding: 28,
        boxShadow: 'var(--shadow-3)', animation: 'fadeUp 200ms both',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--grey-500)', marginBottom: 4 }}>
              {AXIS_LABELS[result.axis] || result.axis}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              "{result.group}" vs "{result.reference_group}"
            </div>
          </div>
          <Badge status={result.status} />
        </div>

        {/* DIR meter */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--grey-700)' }}>Disparate Impact Ratio</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: dirBarColor(result.disparate_impact_ratio) }}>
              {result.disparate_impact_ratio.toFixed(3)}
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--grey-100)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.min(result.disparate_impact_ratio * 100, 100)}%`,
              background: dirBarColor(result.disparate_impact_ratio),
              borderRadius: 4, transition: 'width 600ms ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--grey-500)', marginTop: 4 }}>
            <span>0.0 (fully biased)</span>
            <span style={{ color: 'var(--amber)' }}>0.80 (threshold)</span>
            <span>1.0 (perfectly fair)</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius)',
            background: s.bg, border: `1px solid ${s.borderColor || s.bg}`,
          }}>
            <div style={{ fontSize: 11, color: 'var(--grey-700)', marginBottom: 4 }}>
              {result.group} approval rate
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.text }}>
              {result.approval_rate_group}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-500)' }}>
              from {result.affected_count} records
            </div>
          </div>
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius)',
            background: 'var(--green-lt)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--grey-700)', marginBottom: 4 }}>
              {result.reference_group} approval rate
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
              {result.approval_rate_reference}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-500)' }}>
              from {result.reference_count} records
            </div>
          </div>
        </div>

        {/* Plain language summary */}
        {result.status !== 'fair' && (
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius)',
            background: 'var(--grey-50)', border: '1px solid var(--grey-200)',
            fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.6, marginBottom: 16,
          }}>
            <strong style={{ color: 'var(--grey-900)' }}>What this means:</strong>{' '}
            The "{result.group}" group is approved <strong style={{ color: s.text }}>{impact}% less often</strong> than
            the "{result.reference_group}" group, even when other factors are held constant.
            {result.status === 'critical' && ' This exceeds the RBI FREE-AI 4/5ths rule threshold and may violate DPDP Act Section 4(1)(b).'}
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', padding: '8px', borderRadius: 20,
          border: '1px solid var(--grey-300)', background: 'white',
          fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--grey-700)',
        }}>Close</button>
      </div>
    </div>
  );
}

// Main heatmap component
export default function BiasHeatmap({ biasResults, summary }) {
  const [selected, setSelected] = useState(null);

  // Group results by axis
  const byAxis = biasResults.reduce((acc, r) => {
    if (!acc[r.axis]) acc[r.axis] = [];
    acc[r.axis].push(r);
    return acc;
  }, {});

  return (
    <div>
      {/* Summary stats */}
      <div className="grid3" style={{ marginBottom: 24 }}>
        <StatCard
          value={summary.critical_count}
          label="Critical Violations"
          color="var(--red)"
          icon="🔴"
        />
        <StatCard
          value={summary.watch_count}
          label="Watch Findings"
          color="var(--amber)"
          icon="🟡"
        />
        <StatCard
          value={summary.fair_count}
          label="Fair Results"
          color="var(--green)"
          icon="🟢"
        />
        <StatCard
          value={summary.worst_case?.toFixed(2) || '—'}
          label="Worst DIR Score"
          color={summary.worst_case < 0.8 ? 'var(--red)' : 'var(--amber)'}
          icon="📉"
        />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--grey-500)', fontWeight: 600 }}>LEGEND:</span>
        {[
          { status: 'critical', label: 'Critical (DIR < 0.80)' },
          { status: 'watch',    label: 'Watch (DIR 0.80–0.90)' },
          { status: 'fair',     label: 'Fair (DIR ≥ 0.90)' },
        ].map(({ status, label }) => {
          const cs = cellStyle(status);
          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: cs.background, border: `1px solid ${cs.borderColor}` }} />
              <span style={{ fontSize: 11, color: 'var(--grey-700)' }}>{label}</span>
            </div>
          );
        })}
        <span style={{ fontSize: 11, color: 'var(--grey-500)', marginLeft: 'auto' }}>
          Click any cell for details
        </span>
      </div>

      {/* Heatmap grid — one section per axis */}
      {Object.entries(byAxis).map(([axis, results]) => (
        <Card key={axis} style={{ padding: 20, marginBottom: 16 }}>
          <SectionLabel>{AXIS_LABELS[axis] || axis} Bias</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((r, i) => {
              const cs = cellStyle(r.status);
              const dirPct = Math.min(r.disparate_impact_ratio * 100, 100);
              return (
                <div
                  key={i}
                  onClick={() => setSelected(r)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 80px 90px',
                    gap: 12, alignItems: 'center',
                    padding: '10px 14px', borderRadius: 'var(--radius)',
                    background: cs.background, border: `1px solid ${cs.borderColor}`,
                    cursor: 'pointer', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  {/* Group label */}
                  <div style={{ fontSize: 13, fontWeight: 500, color: cs.color }}>
                    {r.group}
                    <div style={{ fontSize: 10, color: 'var(--grey-500)', fontWeight: 400, marginTop: 1 }}>
                      vs {r.reference_group}
                    </div>
                  </div>

                  {/* DIR bar */}
                  <div>
                    <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${dirPct}%`,
                        background: cs.color, borderRadius: 3,
                        transition: 'width 600ms ease',
                      }} />
                    </div>
                    {/* 80% threshold marker */}
                    <div style={{ position: 'relative', height: 0 }}>
                      <div style={{
                        position: 'absolute', left: '80%', top: -7,
                        width: 1, height: 10, background: 'rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>

                  {/* DIR value */}
                  <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: cs.color }}>
                    {r.disparate_impact_ratio.toFixed(3)}
                  </div>

                  {/* Status badge */}
                  <div style={{ textAlign: 'right' }}>
                    <Badge status={r.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Detail modal */}
      <DetailModal result={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
