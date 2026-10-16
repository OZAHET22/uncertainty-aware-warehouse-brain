// src/app/uncertainty/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Scale,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Table,
  Zap,
  Info,
} from 'lucide-react';
import {
  evaluateAllMethods,
  TEST_CASES,
  DISAGREEMENTS,
  SensorReading,
  UncertaintyEvaluation,
} from '@/lib/uncertainty';

export default function UncertaintyPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'matrix' | 'disagreements'>('live');

  // Interactive inputs
  const [weightDev, setWeightDev] = useState(70);
  const [crackSev, setCrackSev] = useState(5);
  const [tiltTriggered, setTiltTriggered] = useState(false);

  const currentReading: SensorReading = {
    weight_deviation_pct: weightDev,
    crack_severity_pct: crackSev,
    tilt_triggered: tiltTriggered,
  };

  const results: UncertaintyEvaluation = evaluateAllMethods(currentReading);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={24} color="#fbbf24" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Module B: <span className="gradient-text-amber">Reasoning Under Uncertainty</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Determine box damage telemetry using six mathematical uncertainty formalisms in real-time.
          </p>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('live')}
            className={activeTab === 'live' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Live Inference
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={activeTab === 'matrix' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            10 Test Cases Matrix
          </button>
          <button
            onClick={() => setActiveTab('disagreements')}
            className={activeTab === 'disagreements' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Documented Disagreements
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE INFERENCE */}
      {activeTab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sensor Telemetry Sliders */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#fbbf24" />
              <span>Multi-Sensor Telemetry Input Desk</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
              {/* Weight Deviation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Weight Deviation</label>
                  <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: weightDev > 40 ? '#fbbf24' : 'inherit' }}>
                    {weightDev}% {weightDev > 40 ? '(High > 40%)' : '(Normal)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weightDev}
                  onChange={(e) => setWeightDev(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#fbbf24' }}
                />
              </div>

              {/* Crack Severity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Optical Crack Severity</label>
                  <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: crackSev > 15 ? '#f43f5e' : 'inherit' }}>
                    {crackSev}% {crackSev > 15 ? '(Visible > 15%)' : '(None)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crackSev}
                  onChange={(e) => setCrackSev(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#f43f5e' }}
                />
              </div>

              {/* Tilt Sensor Trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Inertial Tilt Sensor</label>
                <button
                  type="button"
                  onClick={() => setTiltTriggered(!tiltTriggered)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: tiltTriggered ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: tiltTriggered ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                    color: tiltTriggered ? '#fb7185' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: tiltTriggered ? '#f43f5e' : '#64748b' }}></span>
                  <span>{tiltTriggered ? 'TILT EXCEEDED (True)' : 'TILT LEVEL (False)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6 Uncertainty Formalisms Real-Time Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* 1. Nonmonotonic Logic */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>1. DEFAULT LOGIC</span>
                <span className={`badge ${results.nonmonotonic === 'Damaged' ? 'badge-rose' : 'badge-emerald'}`}>
                  {results.nonmonotonic}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Nonmonotonic Reasoning</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Assumes box undamaged by default unless <code className="code-font" style={{ color: 'var(--cyan)' }}>tilt_triggered</code> or <code className="code-font" style={{ color: 'var(--cyan)' }}>crack_visible</code> is derivable. Retractable upon new telemetry.
              </p>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Active abnormality facts: {results.nonmonotonic === 'Damaged' ? 'Triggered' : 'None'}
              </div>
            </div>

            {/* 2. Naive Bayes */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>2. PROBABILISTIC</span>
                <span className={`badge ${results.bayes > 0.5 ? 'badge-rose' : 'badge-emerald'}`}>
                  {results.bayes > 0.5 ? 'Damaged' : 'NotDamaged'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Naive Bayes Posterior</h4>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', marginBottom: '6px' }}>
                {results.bayes.toFixed(4)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                P(Damaged | evidence) using prior P(D)=0.10 and conditional likelihood products.
              </p>
            </div>

            {/* 3. Certainty Factors */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>3. RULE-BASED CF</span>
                <span className={`badge ${results.cf > 0 ? 'badge-rose' : 'badge-emerald'}`}>
                  {results.cf > 0 ? 'Damaged' : 'NotDamaged'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Certainty Factor (MYCIN)</h4>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: results.cf >= 0 ? '#fbbf24' : '#34d399', marginBottom: '6px' }}>
                {results.cf > 0 ? `+${results.cf.toFixed(4)}` : results.cf.toFixed(4)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Combines serial attenuation (0.9 rule confidence) with pairwise parallel combination [-1.0, +1.0].
              </p>
            </div>

            {/* 4. Bayesian Network */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>4. GRAPHICAL MODEL</span>
                <span className={`badge ${results.bn > 0.5 ? 'badge-rose' : 'badge-emerald'}`}>
                  {results.bn > 0.5 ? 'Damaged' : 'NotDamaged'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Bayesian Network (CPD)</h4>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#a855f7', marginBottom: '6px' }}>
                {results.bn.toFixed(4)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Exact inference via Variable Elimination on DAG: CrackVisible &amp; Tilt → Damaged.
              </p>
            </div>

            {/* 5. Dempster-Shafer */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>5. EVIDENCE THEORY</span>
                <span className={`badge ${results.ds[0] > 0.5 ? 'badge-rose' : 'badge-emerald'}`}>
                  Bel &gt; 0.5: {results.ds[0] > 0.5 ? 'Damaged' : 'NotDamaged'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Dempster-Shafer Interval</h4>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8', marginBottom: '6px' }}>
                [{results.ds[0].toFixed(3)}, {results.ds[1].toFixed(3)}]
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Belief Bel(D) and Plausibility Pl(D) interval after orthogonal sum and conflict mass K removal.
              </p>
            </div>

            {/* 6. Fuzzy Logic */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>6. FUZZY SYSTEM</span>
                <span className={`badge ${results.fuzzy > 50 ? 'badge-rose' : 'badge-emerald'}`}>
                  {results.fuzzy > 50 ? 'Damaged' : 'NotDamaged'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Fuzzy Logic Score</h4>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: results.fuzzy > 50 ? '#f43f5e' : '#34d399', marginBottom: '6px' }}>
                {results.fuzzy.toFixed(2)} / 100
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Mamdani inference over 5 linguistic rules defuzzified via continuous centroid integration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10 TEST CASES BENCHMARK MATRIX */}
      {activeTab === 'matrix' && (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>10 Standard Benchmark Test Cases (TC-B1 to TC-B10)</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Side-by-side evaluation across all 6 reasoning algorithms with decision thresholds: Bayes &gt; 0.5, CF &gt; 0, BN &gt; 0.5, DS Bel &gt; 0.5, Fuzzy &gt; 50.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>CASE ID</th>
                <th style={{ padding: '10px' }}>WEIGHT %</th>
                <th style={{ padding: '10px' }}>CRACK %</th>
                <th style={{ padding: '10px' }}>TILT</th>
                <th style={{ padding: '10px' }}>NONMONOTONIC</th>
                <th style={{ padding: '10px' }}>BAYES</th>
                <th style={{ padding: '10px' }}>CF</th>
                <th style={{ padding: '10px' }}>BN</th>
                <th style={{ padding: '10px' }}>DS [BEL, PL]</th>
                <th style={{ padding: '10px' }}>FUZZY</th>
              </tr>
            </thead>
            <tbody>
              {TEST_CASES.map((tc) => {
                const res = evaluateAllMethods(tc);
                const isDisagreementCase = tc.id === 'TC-B3' || tc.id === 'TC-B5';

                return (
                  <tr
                    key={tc.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      backgroundColor: isDisagreementCase ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
                      {tc.id}
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{tc.weight_deviation_pct}%</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{tc.crack_severity_pct}%</td>
                    <td style={{ padding: '12px 10px' }}>
                      {tc.tilt_triggered ? (
                        <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>True</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>False</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${res.nonmonotonic === 'Damaged' ? 'badge-rose' : 'badge-emerald'}`}>
                        {res.nonmonotonic}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{res.bayes.toFixed(4)}</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>
                      {res.cf >= 0 ? `+${res.cf.toFixed(4)}` : res.cf.toFixed(4)}
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{res.bn.toFixed(4)}</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>
                      [{res.ds[0].toFixed(2)}, {res.ds[1].toFixed(2)}]
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {res.fuzzy.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: DOCUMENTED DISAGREEMENTS */}
      {activeTab === 'disagreements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Documented Edge Cases &amp; Inter-Formalism Disagreements</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Highlights key boundary scenarios where individual formalisms diverge due to mathematical structural differences.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {DISAGREEMENTS.map((item) => (
              <div
                key={item.caseId}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderLeft: '4px solid #fbbf24',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span className="badge badge-amber">{item.caseId}</span>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                    Reading: {item.reading}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {item.analysis}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
