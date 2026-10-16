// src/app/game/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trophy,
  Zap,
  BarChart2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  simulateDockGame,
  runBenchmark,
  SimulationResult,
  DOCK,
  START_STATE,
} from '@/lib/game';

export default function GamePage() {
  const [activeTab, setActiveTab] = useState<'sim' | 'benchmark'>('sim');

  // Simulation Controls
  const [depth, setDepth] = useState(4);
  const [opponent, setOpponent] = useState<'random' | 'self'>('random');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Playback Step
  const [currentPlyIndex, setCurrentPlyIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Benchmarks
  const [benchmarkData, setBenchmarkData] = useState<any>(null);

  const startNewSimulation = (d = depth, opp = opponent) => {
    const res = simulateDockGame(d, opp);
    setSimResult(res);
    setCurrentPlyIndex(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    startNewSimulation();
    const bench = runBenchmark();
    setBenchmarkData(bench);
  }, []);

  // Step Forward
  const stepForward = () => {
    if (simResult && currentPlyIndex < simResult.history.length - 1) {
      setCurrentPlyIndex((prev) => prev + 1);
    }
  };

  // Step Backward
  const stepBackward = () => {
    if (currentPlyIndex > 0) {
      setCurrentPlyIndex((prev) => prev - 1);
    }
  };

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && simResult) {
      if (currentPlyIndex < simResult.history.length - 1) {
        timer = setTimeout(() => {
          setCurrentPlyIndex((prev) => prev + 1);
        }, 800);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentPlyIndex, simResult]);

  const currentRecord = simResult?.history[currentPlyIndex];
  const currentState = currentRecord ? currentRecord.state : START_STATE;

  // Render 4x4 Grid
  const renderBoard = () => {
    const cells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const isDock = r === DOCK[0] && c === DOCK[1];
        const isR1 = r === currentState.r1_pos[0] && c === currentState.r1_pos[1];
        const isR2 = r === currentState.r2_pos[0] && c === currentState.r2_pos[1];

        let cellContent = null;
        let cellBg = 'rgba(255, 255, 255, 0.02)';
        let cellBorder = '1px solid var(--border-subtle)';

        if (isDock) {
          cellBg = 'rgba(245, 158, 11, 0.15)';
          cellBorder = '2px solid rgba(245, 158, 11, 0.4)';
          cellContent = (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Zap size={22} color="#fbbf24" />
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em' }}>DOCK</span>
            </div>
          );
        }

        if (isR1) {
          cellBg = 'rgba(6, 182, 212, 0.25)';
          cellBorder = '2px solid var(--cyan)';
          cellContent = (
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.5)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>R1</span>
              <span style={{ fontSize: '0.55rem', color: '#e0f2fe' }}>MAX</span>
            </div>
          );
        }

        if (isR2) {
          cellBg = 'rgba(244, 63, 94, 0.25)';
          cellBorder = '2px solid #f43f5e';
          cellContent = (
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(244, 63, 94, 0.5)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>R2</span>
              <span style={{ fontSize: '0.55rem', color: '#ffe4e6' }}>MIN</span>
            </div>
          );
        }

        cells.push(
          <div
            key={`${r}-${c}`}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '10px',
              backgroundColor: cellBg,
              border: cellBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({r},{c})
            </span>
            {cellContent}
          </div>
        );
      }
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 80px)',
        gridTemplateRows: 'repeat(4, 80px)',
        gap: '8px',
        padding: '16px',
        backgroundColor: '#0a0e17',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
      }}>
        {cells}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gamepad2 size={24} color="#f43f5e" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Module C: <span className="gradient-text-amber" style={{ backgroundImage: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)' }}>Dock Contention (Game AI Arena)</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Adversarial search on a 4×4 grid. Robot 1 (MAX) vs Robot 2 (MIN) competing for the single charging dock.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('sim')}
            className={activeTab === 'sim' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Playable Simulation
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={activeTab === 'benchmark' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem' }}
          >
            Pruning Benchmarks
          </button>
        </div>
      </div>

      {/* TAB 1: PLAYABLE SIMULATION */}
      {activeTab === 'sim' && simResult && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left: Interactive 4x4 Grid & Controls */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                WAREHOUSE DOCK GRID (4×4)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Ply {currentPlyIndex + 1} of {simResult.history.length}
              </div>
            </div>

            {renderBoard()}

            {/* Step Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setCurrentPlyIndex(0)}
                className="btn-secondary"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>
              <button onClick={stepBackward} disabled={currentPlyIndex === 0} className="btn-secondary">
                <SkipBack size={16} />
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="btn-primary">
                <Play size={16} />
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>
              <button onClick={stepForward} disabled={currentPlyIndex >= simResult.history.length - 1} className="btn-secondary">
                <SkipForward size={16} />
              </button>
            </div>
          </div>

          {/* Right: Simulation Parameters & Move Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Parameters card */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--cyan)" />
                <span>Search Configuration</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Search Depth (plies): <strong>{depth}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--cyan)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Opponent Strategy (R2)
                  </label>
                  <select
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="random">Random Mover</option>
                    <option value="self">Self (Alpha-Beta MIN)</option>
                  </select>
                </div>

                <button onClick={() => startNewSimulation(depth, opponent)} className="btn-primary">
                  <span>Re-Simulate</span>
                </button>
              </div>
            </div>

            {/* Result banner */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MATCH VERDICT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: simResult.winner === 'R1' ? 'var(--cyan)' : '#f43f5e' }}>
                  {simResult.winner === 'R1' ? 'Robot 1 (MAX) Captured Dock' : simResult.winner === 'R2' ? 'Robot 2 (MIN) Captured Dock' : 'Draw'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PLIES</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {simResult.plies} plies
                </div>
              </div>
            </div>

            {/* Move history trace */}
            <div className="glass-panel" style={{ padding: '20px', maxHeight: '280px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                PLY EXECUTION STREAM
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {simResult.history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentPlyIndex(i)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: i === currentPlyIndex ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: i === currentPlyIndex ? '1px solid var(--cyan)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{h.ply}</span>
                      <span className={`badge ${h.player === 'R1' ? 'badge-cyan' : 'badge-rose'}`} style={{ fontSize: '0.65rem' }}>
                        {h.player}
                      </span>
                      <span>Action: <strong>{h.moveName}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Dist R1:{h.r1Distance} | R2:{h.r2Distance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRUNING BENCHMARKS */}
      {activeTab === 'benchmark' && benchmarkData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Search Complexity Benchmarks: Nodes Visited vs. Search Depth
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Empirical verification that Alpha-Beta pruning achieves significant branch reduction over plain MiniMax.
            </p>

            {/* Benchmark Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>SEARCH DEPTH</th>
                  <th style={{ padding: '12px', color: '#f43f5e' }}>MINIMAX (NODES)</th>
                  <th style={{ padding: '12px', color: 'var(--cyan)' }}>ALPHA-BETA (NODES)</th>
                  <th style={{ padding: '12px', color: '#34d399' }}>IDS (CUMULATIVE NODES)</th>
                  <th style={{ padding: '12px', color: '#fbbf24' }}>PRUNING REDUCTION</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.depths.map((d: number, idx: number) => {
                  const mm = benchmarkData.minimax[idx];
                  const ab = benchmarkData.alphabeta[idx];
                  const ids = benchmarkData.ids[idx];
                  const reductionPct = Math.round(((mm - ab) / mm) * 100);

                  return (
                    <tr key={d} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Depth {d}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{mm.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
                        {ab.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{ids.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                        {reductionPct > 0 ? `${reductionPct}% fewer nodes` : 'Base (0%)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
