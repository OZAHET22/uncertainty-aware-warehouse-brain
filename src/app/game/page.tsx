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
              <Zap size={20} color="#fbbf24" />
              <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em' }}>DOCK</span>
            </div>
          );
        }

        if (isR1) {
          cellBg = 'rgba(6, 182, 212, 0.25)';
          cellBorder = '2px solid var(--cyan)';
          cellContent = (
            <div
              style={{
                width: 'clamp(34px, 8vw, 46px)',
                height: 'clamp(34px, 8vw, 46px)',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.5)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>R1</span>
              <span style={{ fontSize: '0.52rem', color: '#e0f2fe' }}>MAX</span>
            </div>
          );
        }

        if (isR2) {
          cellBg = 'rgba(244, 63, 94, 0.25)';
          cellBorder = '2px solid #f43f5e';
          cellContent = (
            <div
              style={{
                width: 'clamp(34px, 8vw, 46px)',
                height: 'clamp(34px, 8vw, 46px)',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(244, 63, 94, 0.5)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>R2</span>
              <span style={{ fontSize: '0.52rem', color: '#ffe4e6' }}>MIN</span>
            </div>
          );
        }

        cells.push(
          <div
            key={`${r}-${c}`}
            style={{
              width: 'clamp(46px, 12vw, 76px)',
              height: 'clamp(46px, 12vw, 76px)',
              borderRadius: '8px',
              backgroundColor: cellBg,
              border: cellBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: '5px',
                fontSize: '0.58rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ({r},{c})
            </span>
            {cellContent}
          </div>
        );
      }
    }
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, clamp(46px, 12vw, 76px))',
          gridTemplateRows: 'repeat(4, clamp(46px, 12vw, 76px))',
          gap: 'clamp(4px, 1.5vw, 8px)',
          padding: 'clamp(10px, 2.5vw, 16px)',
          backgroundColor: '#0a0e17',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          margin: '0 auto',
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Tabs */}
      <div className="page-header-row">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gamepad2 size={24} color="#f43f5e" />
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Module C: <span className="gradient-text-rose">Dock Contention (Game AI Arena)</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Adversarial search on a 4×4 grid. Robot 1 (MAX) vs Robot 2 (MIN) competing for the single charging dock.
          </p>
        </div>

        {/* Tab switch */}
        <div className="tabs-scroll-container">
          <button
            onClick={() => setActiveTab('sim')}
            className={activeTab === 'sim' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem' }}
          >
            Playable Simulation
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={activeTab === 'benchmark' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem' }}
          >
            Pruning Benchmarks
          </button>
        </div>
      </div>

      {/* TAB 1: PLAYABLE SIMULATION */}
      {activeTab === 'sim' && simResult && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left: Interactive 4x4 Grid & Controls */}
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                WAREHOUSE DOCK GRID (4×4)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Ply {currentPlyIndex + 1} of {simResult.history.length}
              </div>
            </div>

            {renderBoard()}

            {/* Playback Controls */}
            <div className="page-header-row" style={{ width: '100%', marginTop: '18px' }}>
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
                  disabled={currentPlyIndex === 0}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  title="Step Backward"
                >
                  <SkipBack size={15} />
                </button>
                <button
                  onClick={() => {
                    setCurrentPlyIndex(0);
                    setIsPlaying(false);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  title="Reset Simulation"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentPlyIndex >= simResult.history.length - 1}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  title="Step Forward"
                >
                  <SkipForward size={15} />
                </button>
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Speed: 800ms / ply
              </span>
            </div>
          </div>

          {/* Right: Game Parameters & Ply History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Parameters card */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
                Game Simulation Engine Settings
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Search Depth: {depth} Plies
                  </label>
                  <select
                    value={depth}
                    onChange={(e) => {
                      const d = parseInt(e.target.value);
                      setDepth(d);
                      startNewSimulation(d, opponent);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value={2}>Depth 2 (Fast)</option>
                    <option value={4}>Depth 4 (Standard)</option>
                    <option value={6}>Depth 6 (Deep Search)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Opponent Strategy
                  </label>
                  <select
                    value={opponent}
                    onChange={(e) => {
                      const opp = e.target.value as any;
                      setOpponent(opp);
                      startNewSimulation(depth, opp);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value="random">Random Walk (Baseline)</option>
                    <option value="self">Adversarial Alpha-Beta</option>
                  </select>
                </div>
              </div>

              {/* Outcome Banner */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: simResult.winner === 'R1' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                  border: `1px solid ${simResult.winner === 'R1' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Trophy size={20} color={simResult.winner === 'R1' ? 'var(--cyan)' : '#f43f5e'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: simResult.winner === 'R1' ? 'var(--cyan)' : '#f43f5e' }}>
                    Winner: {simResult.winner} ({simResult.winner === 'R1' ? 'Our Robot' : 'Competitor'})
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Total moves: {simResult.history.length} | Total plies: {simResult.plies}
                  </div>
                </div>
              </div>
            </div>

            {/* Move History Log */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px' }}>
                Turn-by-Turn Move History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                {simResult.history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentPlyIndex(i)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: i === currentPlyIndex ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: i === currentPlyIndex ? '1px solid var(--cyan)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{h.ply}</span>
                      <span className={`badge ${h.player === 'R1' ? 'badge-cyan' : 'badge-rose'}`} style={{ fontSize: '0.62rem' }}>
                        {h.player}
                      </span>
                      <span>Action: <strong>{h.moveName}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
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
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Search Complexity Benchmarks: Nodes Visited vs. Search Depth
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Empirical verification that Alpha-Beta pruning achieves significant branch reduction over plain MiniMax.
            </p>

            {/* Benchmark Table */}
            <div className="table-scroll-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <th style={{ padding: '12px', whiteSpace: 'nowrap' }}>SEARCH DEPTH</th>
                    <th style={{ padding: '12px', color: '#f43f5e', whiteSpace: 'nowrap' }}>MINIMAX (NODES)</th>
                    <th style={{ padding: '12px', color: 'var(--cyan)', whiteSpace: 'nowrap' }}>ALPHA-BETA (NODES)</th>
                    <th style={{ padding: '12px', color: '#34d399', whiteSpace: 'nowrap' }}>IDS (CUMULATIVE NODES)</th>
                    <th style={{ padding: '12px', color: '#fbbf24', whiteSpace: 'nowrap' }}>PRUNING REDUCTION</th>
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
        </div>
      )}
    </div>
  );
}
