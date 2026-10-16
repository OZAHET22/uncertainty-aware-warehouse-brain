// src/app/expert-system/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  PlusCircle,
  BookOpen,
  Filter,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  DEFAULT_RULES,
  runForwardChaining,
  Rule,
  DiagnosisResult,
} from '@/lib/expertSystem';

const SYMPTOM_CATEGORIES: { name: string; symptoms: string[] }[] = [
  {
    name: 'Wheels & Drivetrain',
    symptoms: [
      'symptom:wheel_rpm_mismatch',
      'symptom:wheel_vibration_high',
      'symptom:motor_stall_detected',
      'symptom:obstacle_detected_stationary',
    ],
  },
  {
    name: 'Battery & Power Subsystem',
    symptoms: [
      'symptom:battery_voltage_low',
      'symptom:battery_drain_fast',
      'symptom:battery_temp_high',
    ],
  },
  {
    name: 'Sensors & Calibration',
    symptoms: [
      'symptom:sensor_reading_erratic',
      'symptom:sensor_calibration_expired',
      'symptom:sensor_checksum_fail',
      'symptom:firmware_watchdog_reset',
    ],
  },
  {
    name: 'Thermal & Motors',
    symptoms: [
      'symptom:motor_current_high',
      'symptom:motor_temp_high',
    ],
  },
  {
    name: 'Navigation, Comms & Structural',
    symptoms: [
      'symptom:comm_packet_loss_high',
      'symptom:comm_timeout',
      'symptom:position_drift_detected',
      'symptom:damage_suspected',
    ],
  },
];

export default function ExpertSystemPage() {
  const [activeTab, setActiveTab] = useState<'diagnose' | 'acquire' | 'rules'>('diagnose');
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);

  // Selected Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(
    new Set(['symptom:wheel_rpm_mismatch', 'symptom:wheel_vibration_high'])
  );

  // Diagnosis Result
  const [result, setResult] = useState<DiagnosisResult | null>(() =>
    runForwardChaining(new Set(['symptom:wheel_rpm_mismatch', 'symptom:wheel_vibration_high']), DEFAULT_RULES)
  );

  // Knowledge Acquisition Form State
  const [newRuleId, setNewRuleId] = useState('R99');
  const [newRuleIf, setNewRuleIf] = useState('symptom:motor_stall_detected, symptom:battery_voltage_low');
  const [newRuleNot, setNewRuleNot] = useState('');
  const [newRuleThen, setNewRuleThen] = useState('diagnosis:power_inverter_brownout');
  const [newRuleExp, setNewRuleExp] = useState('Stall during low battery voltage triggers inverter brownout protection.');
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSymptom = (sym: string) => {
    const next = new Set(selectedSymptoms);
    if (next.has(sym)) {
      next.delete(sym);
    } else {
      next.add(sym);
    }
    setSelectedSymptoms(next);
  };

  const handleRunDiagnosis = () => {
    const res = runForwardChaining(selectedSymptoms, rules);
    setResult(res);
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleId || !newRuleIf || !newRuleThen) return;

    const ifParts = newRuleIf.split(',').map((s) => s.trim()).filter(Boolean);
    const notParts = newRuleNot.split(',').map((s) => s.trim()).filter(Boolean);

    const customRule: Rule = {
      id: newRuleId.trim(),
      if: ifParts,
      not: notParts,
      then: newRuleThen.trim(),
      explanation: newRuleExp.trim(),
    };

    const nextRules = [...rules, customRule];
    setRules(nextRules);
    setSuccessMessage(`Rule ${customRule.id} successfully compiled into working knowledge base!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={24} color="#34d399" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Module E: <span className="gradient-text-emerald">Maintenance Expert System</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Forward-chaining diagnostic rule engine with explicit rule firing trace and Knowledge Acquisition.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('diagnose')}
            className={activeTab === 'diagnose' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Interactive Diagnosis
          </button>
          <button
            onClick={() => setActiveTab('acquire')}
            className={activeTab === 'acquire' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Knowledge Acquisition
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={activeTab === 'rules' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Rule Base Explorer ({rules.length})
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE DIAGNOSIS */}
      {activeTab === 'diagnose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left: Symptom Selector by Categories */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Robot Telemetry Symptoms</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Select observed conditions to fire the forward-chaining diagnostic engine.
                </p>
              </div>
              <button onClick={() => setSelectedSymptoms(new Set())} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                Clear All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {SYMPTOM_CATEGORIES.map((cat) => (
                <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cat.symptoms.map((sym) => {
                      const isSelected = selectedSymptoms.has(sym);
                      const cleanName = sym.replace('symptom:', '').replace(/_/g, ' ');

                      return (
                        <button
                          key={sym}
                          onClick={() => toggleSymptom(sym)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
                          }} />
                          <span style={{ textTransform: 'capitalize' }}>{cleanName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRunDiagnosis}
              className="btn-primary"
              style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
            >
              <Play size={16} />
              <span>Run Forward-Chaining Diagnostics ({selectedSymptoms.size} Active Symptoms)</span>
            </button>
          </div>

          {/* Right: Diagnosis Results & Explanation Trace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Diagnosis Banner */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                borderLeft: result && result.diagnoses.length > 0 ? '4px solid #f43f5e' : '4px solid #10b981',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                PRIMARY DIAGNOSTIC VERDICT
              </div>

              {result && result.diagnoses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.diagnoses.map((diag) => (
                    <div
                      key={diag}
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#fb7185',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <ShieldAlert size={22} color="#f43f5e" />
                      <span>{diag.replace('diagnosis:', '').replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '1.2rem', fontWeight: 700 }}>
                  <CheckCircle2 size={22} />
                  <span>NO FAULT DETECTED (NOMINAL)</span>
                </div>
              )}
            </div>

            {/* Fired Rule Explanation Trace */}
            <div className="glass-panel" style={{ padding: '20px', maxHeight: '340px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  FORWARD-CHAINING EXPLANATION TRACE
                </div>
                <span className="badge badge-cyan">{result?.trace.length || 0} Rules Fired</span>
              </div>

              {result && result.trace.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.trace.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                          Rule {step.ruleId} Fired
                        </span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                          Asserted: {step.addedFact}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {step.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No rules matched the current symptom facts.
                </div>
              )}
            </div>

            {/* Working Memory State */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                ACTIVE WORKING MEMORY FACTS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result?.workingMemory.map((fact) => (
                  <span
                    key={fact}
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: fact.startsWith('diagnosis:')
                        ? 'rgba(244, 63, 94, 0.2)'
                        : fact.startsWith('derived:')
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(255,255,255,0.05)',
                      color: fact.startsWith('diagnosis:')
                        ? '#fb7185'
                        : fact.startsWith('derived:')
                        ? '#fbbf24'
                        : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE ACQUISITION */}
      {activeTab === 'acquire' && (
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dynamic Knowledge Acquisition</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Add new diagnostic rules to the expert system on the fly without modifying any code.
            </p>
          </div>

          {successMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAddCustomRule} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Rule Identifier
              </label>
              <input
                type="text"
                value={newRuleId}
                onChange={(e) => setNewRuleId(e.target.value)}
                placeholder="e.g. R99"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                IF Conditions (comma-separated facts)
              </label>
              <input
                type="text"
                value={newRuleIf}
                onChange={(e) => setNewRuleIf(e.target.value)}
                placeholder="symptom:motor_current_high, symptom:battery_voltage_low"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                NOT Conditions (optional negative conditions)
              </label>
              <input
                type="text"
                value={newRuleNot}
                onChange={(e) => setNewRuleNot(e.target.value)}
                placeholder="symptom:sensor_calibration_expired"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                THEN Fact (Asserted diagnosis or derived fact)
              </label>
              <input
                type="text"
                value={newRuleThen}
                onChange={(e) => setNewRuleThen(e.target.value)}
                placeholder="diagnosis:inverter_fault"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Engineer&apos;s Domain Explanation
              </label>
              <textarea
                value={newRuleExp}
                onChange={(e) => setNewRuleExp(e.target.value)}
                rows={3}
                placeholder="Detailed rationale explaining why this diagnosis was triggered."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
              <PlusCircle size={16} />
              <span>Compile Rule into Knowledge Base</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: RULE BASE EXPLORER */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Rule Base ({rules.length} Rules Loaded)</h3>
            <span className="badge badge-emerald">In-Memory Engine Ready</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="glass-panel"
                style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-cyan">{rule.id}</span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: rule.then.startsWith('diagnosis:') ? '#fb7185' : '#fbbf24' }}>
                    {rule.then}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>IF:</strong> {rule.if.join(' ∧ ')}
                  {rule.not && rule.not.length > 0 ? ` ∧ NOT(${rule.not.join(', ')})` : ''}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '4px' }}>
                  {rule.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
