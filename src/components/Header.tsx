// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  BatteryCharging,
  Wifi,
  Cpu,
  Clock,
  Sparkles,
  GitBranch,
} from 'lucide-react';

export function Header() {
  const [time, setTime] = useState<string>('');
  const [battery, setBattery] = useState(94);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(7, 9, 14, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Left Mission Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UNIT:</span>
          <span style={{
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--cyan)',
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}>
            AGV-TITAN-09
          </span>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIVE MISSION:</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Stack Pallet & Sensor Diagnostic Check
          </span>
        </div>
      </div>

      {/* Right Telemetry Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Latency */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={14} color="#34d399" />
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
            12ms
          </span>
        </div>

        {/* Core Temp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="var(--cyan)" />
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            42.4°C
          </span>
        </div>

        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BatteryCharging size={16} color="#10b981" />
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>
            {battery}%
          </span>
        </div>

        {/* Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {time || '00:00:00'}
          </span>
        </div>

        {/* Deploy Badge */}
        <div className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          <GitBranch size={12} />
          <span>Vercel Production</span>
        </div>
      </div>
    </header>
  );
}
