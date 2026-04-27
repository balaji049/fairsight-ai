// src/pages/ResultsPage.jsx
// Full audit results dashboard: heatmap + Gemini + DPDP
import React, { useState } from 'react';
import { Button, Card } from '../components/UI';
import BiasHeatmap from '../components/BiasHeatmap';
import GeminiPanel from '../components/GeminiPanel';
import DPDPPanel from '../components/DPDPPanel';

const TABS = [
  { id: 'heatmap',    label: '🌡️ Bias Heatmap',       desc: 'DIR scores by demographic' },
  { id: 'gemini',     label: '✨ AI Explanation',       desc: 'Gemini plain-language report' },
  { id: 'compliance', label: '⚖️ DPDP Compliance',     desc: 'Legal obligations check' },
];

export default function ResultsPage({ results, fileName, domain, onReset }) {
  const [tab, setTab] = useState('heatmap');

  const { analyze, explain, compliance } = results;
  const biasResults   = analyze?.bias_results  || [];
  const summary       = analyze?.summary       || {};
  const explanation   = explain?.explanation   || '';
  const complianceData = compliance            || {};

  const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1);

  // Overall severity
  const hasCritical = summary.critical_count > 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 48px' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--grey-500)', marginBottom: 4 }}>
            📄 {fileName} · {analyze?.total_rows} rows · Domain: {domainLabel}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--grey-900)' }}>
            Bias Audit Complete
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            padding: '6px 14px', borderRadius: 20,
            background: hasCritical ? 'var(--red-lt)' : 'var(--green-lt)',
            color: hasCritical ? 'var(--red)' : 'var(--green)',
            fontSize: 12, fontWeight: 700,
          }}>
            {hasCritical
              ? `⚠️ ${summary.critical_count} Critical Issue${summary.critical_count !== 1 ? 's' : ''}`
              : '✅ No Critical Bias'}
          </div>
          <Button variant="secondary" onClick={onReset} icon="←" style={{ borderRadius: 20 }}>
            New Audit
          </Button>
        </div>
      </div>

      {/* Quick summary strip */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
      }}>
        {[
          { label: 'Total rows audited', val: analyze?.total_rows || 0 },
          { label: 'Bias comparisons', val: summary.total_comparisons || 0 },
          { label: 'Critical findings', val: summary.critical_count || 0, danger: true },
          { label: 'DPDP violations', val: complianceData.non_compliant_count || 0, danger: true },
        ].map(({ label, val, danger }) => (
          <div key={label} style={{
            flex: '1 1 140px', padding: '12px 16px',
            background: 'white', borderRadius: 'var(--radius)',
            border: `1px solid ${danger && val > 0 ? '#F5C6C3' : 'var(--grey-200)'}`,
            boxShadow: 'var(--shadow-1)',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700,
              color: danger && val > 0 ? 'var(--red)' : 'var(--grey-900)',
            }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--grey-500)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 20,
        background: 'white', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--grey-200)', padding: 4,
        boxShadow: 'var(--shadow-1)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 8px', borderRadius: 'var(--radius)',
            border: 'none', cursor: 'pointer', transition: 'var(--transition)',
            background: tab === t.id ? 'var(--blue)' : 'transparent',
            color: tab === t.id ? 'white' : 'var(--grey-700)',
            fontFamily: 'var(--font)', fontWeight: tab === t.id ? 600 : 400,
            fontSize: 13, textAlign: 'center',
          }}>
            <div>{t.label}</div>
            <div style={{
              fontSize: 10, opacity: 0.7, marginTop: 1,
              display: window.innerWidth > 500 ? 'block' : 'none',
            }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade">
        {tab === 'heatmap' && (
          <BiasHeatmap biasResults={biasResults} summary={summary} />
        )}
        {tab === 'gemini' && (
          <GeminiPanel explanation={explanation} loading={false} />
        )}
        {tab === 'compliance' && (
          <DPDPPanel
            rules={complianceData.rules || []}
            overallStatus={complianceData.overall_status}
            summary={complianceData.summary}
            nonCompliantCount={complianceData.non_compliant_count || 0}
          />
        )}
      </div>

      {/* Bottom CTA */}
      <Card style={{ marginTop: 24, padding: '16px 20px', background: 'var(--blue-lt)', border: '1px solid var(--blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 2 }}>
              Share this report
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey-700)' }}>
              Screenshot this dashboard or record your demo video from here.
              All 3 tabs should be shown: Heatmap → AI Explanation → DPDP Compliance.
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => window.print()}
            icon="🖨️"
          >
            Print Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
