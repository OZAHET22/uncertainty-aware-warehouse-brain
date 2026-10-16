// src/app/simulation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  SkipForward,
  ShieldAlert,
  Boxes,
  Scale,
  Gamepad2,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  generateShiftLog,
  processShiftEvent,
  ShiftEvent,
  EventDispatchResult,
} from '@/lib/integration';

export default function SimulationPage() {
  const [eventCount, setEventCount] = useState(30);
  const [seed, setSeed] = useState(42);

  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [dispatchedResults, setDispatchedResults] = useState<EventDispatchResult[]>([]);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const startNewShift = (cnt = eventCount, s = seed) => {
    const evts = generateShiftLog(cnt, s);
    const results = evts.map((e) => processShiftEvent(e));
    setEvents(evts);
    setDispatchedResults(results);
    setCurrentEventIdx(0);
    setIsPlaying(false);
    setExpandedIdx(0);
  };

  useEffect(() => {
    startNewShift();
  }, []);

  // Step Forward
  const stepForward = () => {
    if (currentEventIdx < events.length - 1) {
      setCurrentEventIdx((prev) => prev + 1);
      setExpandedIdx(currentEventIdx + 1);
    }
  };

  // Step Backward
  const stepBackward = () => {
    if (currentEventIdx > 0) {
      setCurrentEventIdx((prev) => prev - 1);
      setExpandedIdx(currentEventIdx - 1);
    }
  };

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      if (currentEventIdx < events.length - 1) {
        timer = setTimeout(() => {
          setCurrentEventIdx((prev) => prev + 1);
          setExpandedIdx(currentEventIdx + 1);
        }, playbackSpeed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentEventIdx, events, playbackSpeed]);

  // Aggregate Metrics up to currentEventIdx
  const activeResults = dispatchedResults.slice(0, currentEventIdx + 1);
  const expertInterventions = activeResults.filter((r) => r.details.expertDiagnosis).length;
  const reactiveRepairs = activeResults.filter((r) => r.details.reactivePlanning?.repairFired).length;
  const dockGames = activeResults.filter((r) => r.details.dockContention).length;
  const dockWins = activeResults.filter((r) => r.details.dockContention?.winner === 'R1').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} color="var(--cyan)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Integrated Simulation: <span className="gradient-text-cyan">Central Control Loop</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-module autonomous shift coordinator connecting telemetry to uncertainty, reactive planning, adversarial dock contention, and expert diagnostics.
          </p>
        </div>

        {/* Action button */}
        <button onClick={() => startNewShift(eventCount, seed)} className="btn-primary">
          <RotateCcw size={16} />
          <span>Regenerate Shift Log</span>
        </button>
      </div>

      {/* Control Strip & Metrics Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Progress */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SHIFT PROGRESS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
              {currentEventIdx + 1} / {events.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Events executed</div>
          </div>

          {/* Expert Interventions */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>EXPERT INTERVENTIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
              {expertInterventions}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Module B → Module E alerts</div>
          </div>

          {/* Reactive Repairs */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>REACTIVE REPAIRS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
              {reactiveRepairs}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pallet stack recoveries</div>
          </div>

          {/* Dock Contention */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DOCK DISPUTES RESOLVED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {dockWins} / {dockGames} Won
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Adversarial search victories</div>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setCurrentEventIdx(0)} className="btn-secondary" title="Reset to start">
              <RotateCcw size={16} />
            </button>
            <button onClick={stepBackward} disabled={currentEventIdx === 0} className="btn-secondary">
              Prev Event
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="btn-primary">
              <Play size={16} />
              <span>{isPlaying ? 'Pause Playback' : 'Stream Shift Playback'}</span>
            </button>
            <button onClick={stepForward} disabled={currentEventIdx >= events.length - 1} className="btn-secondary">
              Next Event
              <SkipForward size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stream Speed:</span>
            {[
              { label: '1x (1.0s)', val: 1000 },
              { label: '2x (0.5s)', val: 500 },
              { label: '5x (0.2s)', val: 200 },
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => setPlaybackSpeed(spd.val)}
                className={playbackSpeed === spd.val ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Event Feed Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Central Event Dispatch Stream ({currentEventIdx + 1} of {events.length} Live Events)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dispatchedResults.slice(0, currentEventIdx + 1).map((res, i) => {
            const isCurrent = i === currentEventIdx;
            const isExpanded = expandedIdx === i;

            return (
              <div
                key={res.event.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  borderLeft:
                    res.severity === 'critical'
                      ? '4px solid #f43f5e'
                      : res.severity === 'warning'
                      ? '4px solid #fbbf24'
                      : '4px solid var(--cyan)',
                  backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)',
                }}
              >
                <div
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan)' }}>
                      {res.event.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {res.event.timestamp}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {res.module}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                      {res.summary}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${
                      res.severity === 'critical'
                        ? 'badge-rose'
                        : res.severity === 'warning'
                        ? 'badge-amber'
                        : 'badge-emerald'
                    }`}>
                      {res.severity.toUpperCase()}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* If Module B & E */}
                    {res.details.uncertainty && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nonmonotonic: </span>
                          <strong style={{ color: res.details.uncertainty.nonmonotonic === 'Damaged' ? '#fb7185' : '#34d399' }}>
                            {res.details.uncertainty.nonmonotonic}
                          </strong>
                        </div>
                        <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bayes Posterior: </span>
                          <strong>{res.details.uncertainty.bayes.toFixed(4)}</strong>
                        </div>
                        <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Certainty Factor: </span>
                          <strong>{res.details.uncertainty.cf.toFixed(4)}</strong>
                        </div>
                        <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fuzzy Score: </span>
                          <strong>{res.details.uncertainty.fuzzy.toFixed(1)} / 100</strong>
                        </div>
                      </div>
                    )}

                    {/* If Expert Diagnosis */}
                    {res.details.expertDiagnosis && (
                      <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fb7185', marginBottom: '6px' }}>
                          EXPERT SYSTEM FAULT DIAGNOSIS
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {res.details.expertDiagnosis.diagnoses.map((d) => (
                            <span key={d} className="badge badge-rose">
                              {d.replace('diagnosis:', '').replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Explanation: {res.details.expertDiagnosis.trace.map((t) => t.explanation).join(' ')}
                        </div>
                      </div>
                    )}

                    {/* If Reactive Planning */}
                    {res.details.reactivePlanning && (
                      <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>
                          REACTIVE PLANNING LAYER
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {res.details.reactivePlanning.repairFired
                            ? res.details.reactivePlanning.reactiveLog.join('; ')
                            : 'Executed cleanly without precondition violation.'}
                        </div>
                      </div>
                    )}

                    {/* If Dock Contention */}
                    {res.details.dockContention && (
                      <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '4px' }}>
                          ADVERSARIAL SEARCH RESULT
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Winner: <strong>{res.details.dockContention.winner}</strong> in {res.details.dockContention.plies} plies.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
