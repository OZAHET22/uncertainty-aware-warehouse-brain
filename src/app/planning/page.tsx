// src/app/planning/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Play,
  RotateCcw,
  SkipForward,
  SkipBack,
  Wrench,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import {
  WorldState,
  ActionTuple,
  planGoalStack,
  planNonlinear,
  expandLoadPallet,
  executeWithReactiveLayer,
  inferTowers,
  applyAction,
  isGoalSatisfied,
  cloneState,
} from '@/lib/planning';

// Color map for blocks
const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '#fbbf24', text: '#ffffff' },
  B: { bg: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', border: '#38bdf8', text: '#ffffff' },
  C: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '#34d399', text: '#ffffff' },
  D: { bg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: '#c084fc', text: '#ffffff' },
  E: { bg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', border: '#fb7185', text: '#ffffff' },
};

interface Preset {
  name: string;
  start: WorldState;
  goal: { on: Record<string, string> };
  dist: { after_step: number; block: string }[];
}

const PRESETS: Preset[] = [
  {
    name: "Sussman's Anomaly (TC-A2)",
    start: { on: { C: 'A', A: 'PALLET', B: 'PALLET' }, holding: null },
    goal: { on: { A: 'B', B: 'C', C: 'PALLET' } },
    dist: [{ after_step: 0, block: 'A' }],
  },
  {
    name: 'Simple Stacking (TC-A1)',
    start: { on: { A: 'PALLET', B: 'PALLET', C: 'PALLET' }, holding: null },
    goal: { on: { A: 'B', B: 'C', C: 'PALLET' } },
    dist: [{ after_step: 1, block: 'B' }],
  },
  {
    name: 'Independent Subgoals (TC-A3)',
    start: { on: { A: 'PALLET', B: 'PALLET', C: 'PALLET', D: 'PALLET' }, holding: null },
    goal: { on: { A: 'B', C: 'D', B: 'PALLET', D: 'PALLET' } },
    dist: [{ after_step: 0, block: 'C' }],
  },
];

export default function PlanningPage() {
  const [activeTab, setActiveTab] = useState<'gs' | 'pop' | 'htn' | 'reactive'>('gs');
  const [selectedPreset, setSelectedPreset] = useState(0);

  // States
  const [startState, setStartState] = useState<WorldState>(PRESETS[0].start);
  const [goalState, setGoalState] = useState<{ on: Record<string, string> }>(PRESETS[0].goal);
  const [disturbanceBlock, setDisturbanceBlock] = useState('A');
  const [disturbanceStep, setDisturbanceStep] = useState(0);

  // Interactive Playback State
  const [currentPlan, setCurrentPlan] = useState<ActionTuple[]>([]);
  const [planTrace, setPlanTrace] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simulatedState, setSimulatedState] = useState<WorldState>(PRESETS[0].start);
  const [isPlaying, setIsPlaying] = useState(false);

  // Nonlinear & HTN results
  const [popResult, setPopResult] = useState<any>(null);
  const [htnActions, setHtnActions] = useState<ActionTuple[]>([]);
  const [reactiveResult, setReactiveResult] = useState<any>(null);

  // Re-run planners when start or goal changes
  const runPlanners = (st: WorldState = startState, gl: { on: Record<string, string> } = goalState) => {
    try {
      const gs = planGoalStack(st, gl);
      setCurrentPlan(gs.plan);
      setPlanTrace(gs.trace);
      setCurrentStepIndex(0);
      setSimulatedState(cloneState(st));

      const pop = planNonlinear(st, gl);
      setPopResult(pop);

      const towers = inferTowers(gl);
      const order = towers.length > 0 ? towers[0] : Object.keys(gl.on);
      const htn = expandLoadPallet(st, 'PALLET', order);
      setHtnActions(htn);

      const react = executeWithReactiveLayer(gs.plan, st, [{ after_step: disturbanceStep, block: disturbanceBlock }]);
      setReactiveResult(react);
    } catch (e: any) {
      console.error('Planner error', e);
    }
  };

  useEffect(() => {
    runPlanners(startState, goalState);
  }, []);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setStartState(p.start);
    setGoalState(p.goal);
    setDisturbanceBlock(p.dist[0].block);
    setDisturbanceStep(p.dist[0].after_step);
    runPlanners(p.start, p.goal);
  };

  // Step Forward
  const stepForward = () => {
    if (currentStepIndex < currentPlan.length) {
      const action = currentPlan[currentStepIndex];
      const next = applyAction(simulatedState, action);
      setSimulatedState(next);
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Step Backward
  const stepBackward = () => {
    if (currentStepIndex > 0) {
      const targetIdx = currentStepIndex - 1;
      let st = cloneState(startState);
      for (let i = 0; i < targetIdx; i++) {
        st = applyAction(st, currentPlan[i]);
      }
      setSimulatedState(st);
      setCurrentStepIndex(targetIdx);
    }
  };

  // Reset
  const resetPlayback = () => {
    setSimulatedState(cloneState(startState));
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      if (currentStepIndex < currentPlan.length) {
        timer = setTimeout(() => {
          stepForward();
        }, 900);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, currentPlan, simulatedState]);

  // Construct visual stacks for the visual canvas
  const renderVisualStacks = () => {
    const onMap = simulatedState.on;
    const palletBlocks = Object.keys(onMap).filter((b) => onMap[b] === 'PALLET');

    const columns: string[][] = [];
    for (const base of palletBlocks) {
      const col = [base];
      let cur = base;
      while (true) {
        const above = Object.keys(onMap).find((b) => onMap[b] === cur);
        if (above) {
          col.push(above);
          cur = above;
        } else {
          break;
        }
      }
      columns.push(col);
    }

    return (
      <div
        style={{
          display: 'flex',
          gap: 'clamp(14px, 3.5vw, 32px)',
          alignItems: 'flex-end',
          minHeight: '160px',
          paddingBottom: '12px',
          overflowX: 'auto',
          maxWidth: '100%',
        }}
      >
        {columns.map((col, cIdx) => (
          <div key={cIdx} style={{ display: 'flex', flexDirection: 'column-reverse', gap: '6px', alignItems: 'center' }}>
            {col.map((block) => {
              const colStyle = BLOCK_COLORS[block] || { bg: '#475569', border: '#64748b', text: '#ffffff' };
              return (
                <div
                  key={block}
                  style={{
                    width: 'clamp(48px, 12vw, 64px)',
                    height: 'clamp(38px, 10vw, 48px)',
                    background: colStyle.bg,
                    border: `2px solid ${colStyle.border}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    color: colStyle.text,
                    boxShadow: '0 6px 14px rgba(0,0,0,0.4)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {block}
                </div>
              );
            })}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Slot {cIdx + 1}
            </span>
          </div>
        ))}
        {columns.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No blocks resting on pallet</div>
        )}
      </div>
    );
  };

  const isSatisfied = isGoalSatisfied(simulatedState, goalState);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Presets Header */}
      <div className="page-header-row">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={24} color="var(--cyan)" />
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Module A: <span className="gradient-text-cyan">Stack the Pallet (Planning Studio)</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Comprehensive STRIPS Blocks World Planner featuring Goal Stack, Nonlinear (POP), Hierarchical (HTN), and Reactive Execution.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="tabs-scroll-container">
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(idx)}
              className={selectedPreset === idx ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.78rem', padding: '7px 12px' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Blocks World Simulation Stage */}
      <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)', position: 'relative' }}>
        <div className="page-header-row" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-cyan">Visual Blocks World</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Step {currentStepIndex} of {currentPlan.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: simulatedState.holding ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: simulatedState.holding ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
              }}
            >
              <Wrench size={15} color={simulatedState.holding ? '#fbbf24' : '#94a3b8'} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: simulatedState.holding ? '#fbbf24' : 'var(--text-secondary)' }}>
                GRIPPER: {simulatedState.holding ? `[${simulatedState.holding}]` : 'EMPTY'}
              </span>
            </div>

            {isSatisfied && (
              <div className="badge badge-emerald" style={{ padding: '6px 12px' }}>
                <CheckCircle2 size={14} />
                <span>GOAL SATISFIED</span>
              </div>
            )}
          </div>
        </div>

        {/* The Pallet Stage Canvas */}
        <div
          style={{
            backgroundColor: '#0a0e17',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3vw, 36px) 12px clamp(16px, 3vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'auto',
          }}
        >
          {/* Animated Gripper Arm representation */}
          <div
            style={{
              width: '160px',
              height: '38px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '2px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {simulatedState.holding ? (
              <div
                style={{
                  width: '42px',
                  height: '30px',
                  background: BLOCK_COLORS[simulatedState.holding]?.bg || '#475569',
                  border: '2px solid #fff',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              >
                {simulatedState.holding}
              </div>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                [ GRIPPER READY ]
              </span>
            )}
          </div>

          {/* Stacks on Pallet */}
          {renderVisualStacks()}

          {/* Pallet Bed */}
          <div
            style={{
              width: '100%',
              minWidth: '240px',
              height: '14px',
              background: 'linear-gradient(90deg, #334155 0%, #475569 50%, #334155 100%)',
              borderRadius: '4px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
              marginTop: '4px',
            }}
          />
        </div>

        {/* Playback Controls Bar */}
        <div className="page-header-row" style={{ marginTop: '18px' }}>
          <div className="playback-controls-bar">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <Play size={15} />
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>
            <button
              onClick={stepBackward}
              disabled={currentStepIndex === 0}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              title="Step Backward"
            >
              <SkipBack size={15} />
            </button>
            <button
              onClick={resetPlayback}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              title="Reset to Initial State"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={stepForward}
              disabled={currentStepIndex >= currentPlan.length}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              title="Step Forward"
            >
              <SkipForward size={15} />
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Next: <strong style={{ color: 'var(--cyan)' }}>
              {currentStepIndex < currentPlan.length ? currentPlan[currentStepIndex].join(' ') : '(Plan Completed)'}
            </strong>
          </div>
        </div>
      </div>

      {/* 4 Planning Algorithm Tabs */}
      <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        <div className="tabs-scroll-container" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('gs')}
            className={activeTab === 'gs' ? 'btn-primary' : 'btn-secondary'}
          >
            Goal Stack Planner
          </button>
          <button
            onClick={() => setActiveTab('pop')}
            className={activeTab === 'pop' ? 'btn-primary' : 'btn-secondary'}
          >
            Nonlinear Planner (POP)
          </button>
          <button
            onClick={() => setActiveTab('htn')}
            className={activeTab === 'htn' ? 'btn-primary' : 'btn-secondary'}
          >
            Hierarchical (HTN)
          </button>
          <button
            onClick={() => setActiveTab('reactive')}
            className={activeTab === 'reactive' ? 'btn-primary' : 'btn-secondary'}
          >
            Reactive Layer &amp; Disturbances
          </button>
        </div>

        {/* TAB 1: GOAL STACK */}
        {activeTab === 'gs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="page-header-row">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Extended Goal Stack Planning Plan</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Constructs goal towers bottom-up and safely clears blocking obstacles to resolve the Sussman Anomaly.
                </p>
              </div>
              <span className="badge badge-cyan">{currentPlan.length} Steps Generated</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '10px' }}>
              {currentPlan.map((action, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: i === currentStepIndex ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: i === currentStepIndex ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {action.join(' ')}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                EXPLANATION TRACE
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                }}
              >
                {planTrace.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NONLINEAR POP */}
        {activeTab === 'pop' && popResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Partial-Order Planning (POP)</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Identifies independent subgoals and organizes executable actions into parallel layers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--cyan)' }}>
                Parallel Executable Layers ({popResult.parallelLayers.length} Layers)
              </h4>
              {popResult.parallelLayers.map((layer: ActionTuple[], lIdx: number) => (
                <div
                  key={lIdx}
                  className="page-header-row"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    LAYER {lIdx + 1}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {layer.map((act, aIdx) => (
                      <span key={aIdx} className="badge badge-cyan" style={{ fontSize: '0.76rem', padding: '4px 8px' }}>
                        {act.join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HIERARCHICAL HTN */}
        {activeTab === 'htn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Hierarchical Task Network (HTN) Decomposition</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Decomposes the high-level compound task <code className="code-font" style={{ color: 'var(--cyan)' }}>LoadPallet(Pallet_A, order)</code> into primitive STRIPS operations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {htnActions.map((act, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Step {i + 1}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {act.join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REACTIVE LAYER */}
        {activeTab === 'reactive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Reactive Disturbance Recovery</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Simulates real-world warehouse disturbances (e.g. knocked over blocks). The reactive layer detects precondition violations on the fly and inserts dynamic repairs.
              </p>
            </div>

            {/* Disturbance Configuration */}
            <div
              className="page-header-row"
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <AlertOctagon size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fb7185' }}>Simulated Disturbance Event</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Block <strong style={{ color: '#ffffff' }}>&apos;{disturbanceBlock}&apos;</strong> will be knocked to PALLET after original plan step <strong style={{ color: '#ffffff' }}>#{disturbanceStep + 1}</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const react = executeWithReactiveLayer(currentPlan, startState, [{ after_step: disturbanceStep, block: disturbanceBlock }]);
                  setReactiveResult(react);
                }}
                className="btn-primary"
                style={{ backgroundColor: '#e11d48', fontSize: '0.8rem' }}
              >
                Execute Reactive Plan
              </button>
            </div>

            {/* Reactive Log Results */}
            {reactiveResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--amber)' }}>
                  Dynamic Injected Repairs
                </h4>
                {reactiveResult.reactiveLog.length > 0 ? (
                  reactiveResult.reactiveLog.map((log: string, lIdx: number) => (
                    <div
                      key={lIdx}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        fontSize: '0.8rem',
                        color: '#fbbf24',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No precondition violations triggered by this disturbance configuration.
                  </div>
                )}

                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    EXECUTION TRACE WITH REPAIRS
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {reactiveResult.trace.map((t: string, i: number) => (
                      <div key={i} style={{ marginBottom: '4px' }}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
