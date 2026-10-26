// src/app/connectionist/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingDown,
} from 'lucide-react';
import {
  CANONICAL_PATTERNS,
  trainHopfield,
  corruptPattern,
  recallHopfield,
  Pattern,
  HopfieldRecallResult,
  generateSyntheticTelemetry,
  predictAnomalyRNN,
  TelemetryPoint,
  AnomalyPrediction,
} from '@/lib/connectionist';

// Pre-trained Hopfield Network Matrix (trained once at module level)
const ALL_PATTERNS = CANONICAL_PATTERNS.map((p) => p.generator());
const W = trainHopfield(ALL_PATTERNS);

export default function ConnectionistPage() {
  const [activeTab, setActiveTab] = useState<'hopfield' | 'rnn' | 'comparison'>('hopfield');

  // HOPFIELD STATE
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(0);
  const [noiseFraction, setNoiseFraction] = useState(0.20);
  const [currentPattern, setCurrentPattern] = useState<Pattern>(CANONICAL_PATTERNS[0].generator());
  const [corruptedPattern, setCorruptedPattern] = useState<Pattern>(CANONICAL_PATTERNS[0].generator());
  const [recallResult, setRecallResult] = useState<HopfieldRecallResult | null>(null);

  const handleSelectPattern = (idx: number) => {
    setSelectedPatternIdx(idx);
    const p = CANONICAL_PATTERNS[idx].generator();
    setCurrentPattern(p);
    const corr = corruptPattern(p, noiseFraction);
    setCorruptedPattern(corr);
    const res = recallHopfield(W, corr);
    setRecallResult(res);
  };

  const handleCorruptOnly = () => {
    const corr = corruptPattern(currentPattern, noiseFraction);
    setCorruptedPattern(corr);
    const res = recallHopfield(W, corr);
    setRecallResult(res);
  };

  const toggleCell = (index: number) => {
    const next = [...currentPattern];
    next[index] *= -1;
    setCurrentPattern(next);
    const res = recallHopfield(W, next);
    setRecallResult(res);
  };

  useEffect(() => {
    handleSelectPattern(0);
  }, []);

  // RNN ANOMALY STATE
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(generateSyntheticTelemetry(false));
  const [rnnPrediction, setRnnPrediction] = useState<AnomalyPrediction>(predictAnomalyRNN(telemetry));

  const handleGenerateNormal = () => {
    const pts = generateSyntheticTelemetry(false);
    setTelemetry(pts);
    setRnnPrediction(predictAnomalyRNN(pts));
  };

  const handleInjectAnomaly = () => {
    const pts = generateSyntheticTelemetry(true);
    setTelemetry(pts);
    setRnnPrediction(predictAnomalyRNN(pts));
  };

  // Render 5x5 Grid
  const renderGrid = (pattern: Pattern, interactive = false) => {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, clamp(32px, 7vw, 42px))',
          gridTemplateRows: 'repeat(5, clamp(32px, 7vw, 42px))',
          gap: '5px',
          padding: '10px',
          backgroundColor: '#0a0e17',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {pattern.map((val, idx) => (
          <div
            key={idx}
            onClick={() => interactive && toggleCell(idx)}
            style={{
              backgroundColor: val === 1 ? 'var(--cyan)' : 'rgba(255,255,255,0.06)',
              borderRadius: '4px',
              border: val === 1 ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              cursor: interactive ? 'pointer' : 'default',
              boxShadow: val === 1 ? '0 0 8px rgba(6, 182, 212, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Tabs */}
      <div className="page-header-row">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={24} color="#c084fc" />
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Module D: <span className="gradient-text-purple">Connectionist Models</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Content-addressable associative memory (Hopfield) and temporal sequence anomaly classification (RNN).
          </p>
        </div>

        {/* Tab switch */}
        <div className="tabs-scroll-container">
          <button
            onClick={() => setActiveTab('hopfield')}
            className={activeTab === 'hopfield' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem' }}
          >
            Hopfield Associative Memory
          </button>
          <button
            onClick={() => setActiveTab('rnn')}
            className={activeTab === 'rnn' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem' }}
          >
            RNN Anomaly Detection
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={activeTab === 'comparison' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem' }}
          >
            Hopfield vs RNN Comparison
          </button>
        </div>
      </div>

      {/* TAB 1: HOPFIELD NETWORK */}
      {activeTab === 'hopfield' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Preset Buttons & Controls */}
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
            <div className="page-header-row" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Select Canonical Target Pattern</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Click any pattern or directly click grid cells below to flip bits.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Noise: {Math.round(noiseFraction * 100)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.05"
                  value={noiseFraction}
                  onChange={(e) => setNoiseFraction(parseFloat(e.target.value))}
                  style={{ width: '100px', accentColor: 'var(--cyan)' }}
                />
                <button
                  onClick={handleCorruptOnly}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  Inject Noise &amp; Recall
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CANONICAL_PATTERNS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => handleSelectPattern(idx)}
                  className={selectedPatternIdx === idx ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Grid Stages: Original -> Corrupted -> Recovered */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '18px' }}>
            {/* Original Pattern */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
                1. ORIGINAL TARGET PATTERN
              </div>
              {renderGrid(currentPattern, true)}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                (Interactive: tap cells to flip bits)
              </span>
            </div>

            {/* Corrupted Pattern */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fb7185', marginBottom: '12px' }}>
                2. NOISY INPUT ({Math.round(noiseFraction * 100)}% NOISE)
              </div>
              {renderGrid(corruptedPattern, false)}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Initial Energy: {recallResult?.steps[0]?.energy.toFixed(2)}
              </span>
            </div>

            {/* Recovered Pattern */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', marginBottom: '12px' }}>
                3. RECOVERED ATTRACTION BASIN
              </div>
              {recallResult && renderGrid(recallResult.recovered, false)}
              <span style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '8px', fontWeight: 600 }}>
                Converged in {recallResult?.totalIterations} asynchronous iteration(s)
              </span>
            </div>
          </div>

          {/* Lyapunov Energy Descent Trace */}
          {recallResult && (
            <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
              <div className="page-header-row" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingDown size={18} color="var(--cyan)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    Lyapunov Energy Descent: E = -0.5 · Σ W_ij · S_i · S_j
                  </h3>
                </div>
                <span className="badge badge-emerald">Attractor State Reached</span>
              </div>

              <div className="tabs-scroll-container">
                {recallResult.steps.map((step) => (
                  <div
                    key={step.iteration}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Iter {step.iteration}</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                      {step.energy.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RNN ANOMALY DETECTION */}
      {activeTab === 'rnn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Action header */}
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
            <div className="page-header-row">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Sequential Telemetry Generator (10-Step Window)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Evaluates multi-variate telemetry streams [vibration, current, temperature] over time.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleGenerateNormal} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                  Generate Normal Window
                </button>
                <button onClick={handleInjectAnomaly} className="btn-primary" style={{ backgroundColor: '#e11d48', fontSize: '0.8rem', padding: '8px 12px' }}>
                  Inject Anomaly Spike
                </button>
              </div>
            </div>
          </div>

          {/* Prediction Result Banner */}
          <div
            className="glass-panel"
            style={{
              padding: 'clamp(16px, 3vw, 24px)',
              borderLeft: rnnPrediction.isAnomaly ? '4px solid #f43f5e' : '4px solid #10b981',
            }}
          >
            <div className="page-header-row" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className={`badge ${rnnPrediction.isAnomaly ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '0.82rem' }}>
                  {rnnPrediction.isAnomaly ? 'ANOMALY DETECTED' : 'NOMINAL OPERATION'}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Confidence: <strong style={{ color: '#ffffff' }}>{Math.round(rnnPrediction.confidence * 100)}%</strong>
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '16px' }}>
              {rnnPrediction.narrative}
            </p>

            {/* Feature contributions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VIBRATION DEVIATION</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {(rnnPrediction.featureContributions.vibrationAnomaly * 100).toFixed(0)}%
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT SURGE</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {(rnnPrediction.featureContributions.currentAnomaly * 100).toFixed(0)}%
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TEMPERATURE DRIFT</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {(rnnPrediction.featureContributions.temperatureAnomaly * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Window Table */}
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
              RAW 10-STEP TELEMETRY SAMPLES
            </div>
            <div className="table-scroll-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '10px' }}>TIMESTEP</th>
                    <th style={{ padding: '10px' }}>VIBRATION (G)</th>
                    <th style={{ padding: '10px' }}>CURRENT (A)</th>
                    <th style={{ padding: '10px' }}>TEMPERATURE (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetry.map((pt) => (
                    <tr key={pt.timeStep} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>t={pt.timeStep}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: pt.vibration > 1.0 ? '#f43f5e' : 'inherit' }}>
                        {pt.vibration.toFixed(3)}
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: pt.current > 1.8 ? '#f43f5e' : 'inherit' }}>
                        {pt.current.toFixed(3)}
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: pt.temperature > 38 ? '#f43f5e' : 'inherit' }}>
                        {pt.temperature.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Hopfield Network vs. Recurrent Neural Network (RNN)
          </h3>

          <div className="table-scroll-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '12px', minWidth: '140px' }}>FEATURE</th>
                  <th style={{ padding: '12px', color: 'var(--cyan)', minWidth: '220px' }}>HOPFIELD NETWORK</th>
                  <th style={{ padding: '12px', color: '#c084fc', minWidth: '220px' }}>RECURRENT NEURAL NETWORK (RNN)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Primary Function</td>
                  <td style={{ padding: '12px' }}>Content-addressable associative memory. Reconstructs corrupted static visual patterns (e.g., damaged QR labels).</td>
                  <td style={{ padding: '12px' }}>Sequence classification and temporal drift detection across multi-channel telemetry streams over time.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Temporal Awareness</td>
                  <td style={{ padding: '12px', color: '#f43f5e' }}>None. Operates strictly on static 2D binary spatial patterns.</td>
                  <td style={{ padding: '12px', color: '#34d399' }}>High. Maintains hidden state memory across successive time steps t-k...t.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Theoretical Limitation</td>
                  <td style={{ padding: '12px' }}>Spurious local minima and finite capacity (~0.138 · N patterns before crosstalk interference).</td>
                  <td style={{ padding: '12px' }}>Vanishing/exploding gradients over extremely long sequence horizons without LSTM gating.</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Role in Warehouse Brain</td>
                  <td style={{ padding: '12px' }}>Optical barcode &amp; pallet symbol restoration under lens dust or occlusion.</td>
                  <td style={{ padding: '12px' }}>Early predictive maintenance by flagging progressive bearing vibration or overheating.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
