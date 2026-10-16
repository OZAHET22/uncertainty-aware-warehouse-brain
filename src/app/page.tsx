// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Scale,
  Gamepad2,
  BrainCircuit,
  Wrench,
  Activity,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [speed, setSpeed] = useState(1.4); // m/s
  const [vibration, setVibration] = useState(0.52);
  const [batteryVoltage, setBatteryVoltage] = useState(48.2);
  const [crackSeverity, setCrackSeverity] = useState(12);

  // Quick system assessment
  const isVibAbnormal = vibration > 0.8;
  const isCrackSuspect = crackSeverity > 15;
  const systemStatus = isVibAbnormal || isCrackSuspect ? 'CAUTION' : 'NOMINAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '36px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.85) 0%, rgba(10, 14, 23, 0.95) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span className="badge badge-cyan">AUTONOMOUS MISSION CONTROL</span>
          <span className="badge badge-emerald">ALL 5 MODULES ACTIVE</span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px', lineHeight: 1.2 }}>
          Uncertainty-Aware <span className="gradient-text-cyan">Warehouse Robot Brain</span>
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: 1.6, marginBottom: '28px' }}>
          Production-grade autonomous robotics intelligence studio built with Next.js & TypeScript.
          Integrates classic STRIPS planning with reactive disturbance recovery, six uncertainty reasoning formalisms,
          adversarial dock contention game tree search, associative memory networks with temporal anomaly detection, and forward-chaining maintenance diagnostics.
        </p>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>FLEET HEALTH INDEX</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>99.8%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>All core loops operational</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>UNCERTAINTY FORMALISMS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>6 Engines</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Bayes, CF, BN, DS, Fuzzy, NM</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>GAME SEARCH ALGORITHMS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>MiniMax + AB</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>With Iterative Deepening (IDS)</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RULE-BASE CAPACITY</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>18 Rules</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Forward-chaining diagnostic trace</div>
          </div>
        </div>
      </div>

      {/* 5 Core Modules Directory Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>AI Intelligence Modules</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select any subsystem below to run interactive simulations and benchmarks.</p>
          </div>
          <Link href="/simulation" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Activity size={16} />
            <span>Launch Central Control Loop</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Module A */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Boxes size={22} color="#38bdf8" />
              </div>
              <span className="badge badge-cyan">Module A</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Stack the Pallet (Planning)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
              Extended Goal Stack Planner that solves Sussman&apos;s Anomaly (TC-A2), Partial-Order Planner (POP) with parallel executable layers, Hierarchical Task Network (HTN) macro operators, and a Reactive Execution Layer that auto-repairs knocked-over blocks!
            </p>
            <Link href="/planning" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span>Open Planning Studio</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Module B */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={22} color="#fbbf24" />
              </div>
              <span className="badge badge-amber">Module B</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Reasoning Under Uncertainty</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
              Evaluates noisy box sensor telemetry (Weight Deviation, Crack Severity, Tilt Trigger) across 6 formalisms: Nonmonotonic logic, Naive Bayes, Certainty Factors, Bayesian Networks, Dempster-Shafer, and Fuzzy Logic with 10 test case benchmarks and documented disagreement edge cases.
            </p>
            <Link href="/uncertainty" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span>Open Uncertainty Studio</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Module C */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gamepad2 size={22} color="#f43f5e" />
              </div>
              <span className="badge badge-rose">Module C</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Dock Contention (Game AI)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
              Simulates competitive AGV charging dock dispute on a 4×4 warehouse grid using adversarial search. Compares plain MiniMax, Alpha-Beta pruning, and Iterative Deepening Search (IDS) with real-time branch pruning benchmarks and log-scale nodes explored.
            </p>
            <Link href="/game" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span>Open Game Arena</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Module D */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={22} color="#c084fc" />
              </div>
              <span className="badge badge-purple">Module D</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Connectionist Models</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
              Content-addressable associative memory with a 5×5 Hopfield Network featuring interactive cell flipping, Hebbian training, noise corruption, and Lyapunov energy descent convergence. Complemented by a Temporal RNN anomaly detector for sequential motor telemetry.
            </p>
            <Link href="/connectionist" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span>Open Connectionist Studio</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Module E */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={22} color="#34d399" />
              </div>
              <span className="badge badge-emerald">Module E</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Maintenance Expert System</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
              Pure forward-chaining diagnostic rule engine with 18 standard fault rules, multi-step rule firing explanation trace, working memory inspection, and dynamic Knowledge Acquisition allowing engineers to author new rules on the fly!
            </p>
            <Link href="/expert-system" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span>Open Expert Advisor</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Central Loop */}
          <div className="glass-panel-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={22} color="var(--cyan)" />
              </div>
              <span className="badge badge-cyan">Central Integration</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Full Shift Simulation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
              Simulates a live 75+ event warehouse work shift! Dispatches sensor telemetry to Module B &amp; escalates damage to Module E diagnostics, executes reactive planning for physical disturbances in Module A, and resolves dock disputes in Module C.
            </p>
            <Link href="/simulation" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span>Run Shift Simulator</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Live AGV Telemetry Testbench */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--cyan)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Interactive Robot Telemetry Testbench</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Adjust live telemetry sliders below to watch autonomous subsystem status recalculate in real-time.
            </p>
          </div>
          <div className={`badge ${systemStatus === 'NOMINAL' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {systemStatus === 'NOMINAL' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>STATUS: {systemStatus}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {/* Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Drive Speed</label>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{speed} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="3.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
          </div>

          {/* Vibration */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vibration Level</label>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: vibration > 0.8 ? '#f43f5e' : 'inherit' }}>
                {vibration} G {vibration > 0.8 ? '(High)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.05"
              value={vibration}
              onChange={(e) => setVibration(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: vibration > 0.8 ? '#f43f5e' : 'var(--cyan)' }}
            />
          </div>

          {/* Battery Voltage */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bus Voltage</label>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{batteryVoltage} V</span>
            </div>
            <input
              type="range"
              min="38"
              max="54"
              step="0.2"
              value={batteryVoltage}
              onChange={(e) => setBatteryVoltage(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
          </div>

          {/* Crack Severity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vision Crack Severity</label>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: crackSeverity > 15 ? '#fbbf24' : 'inherit' }}>
                {crackSeverity}% {crackSeverity > 15 ? '(Detected)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={crackSeverity}
              onChange={(e) => setCrackSeverity(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: crackSeverity > 15 ? '#fbbf24' : 'var(--cyan)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
