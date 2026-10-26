// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  BatteryCharging,
  Wifi,
  Cpu,
  Clock,
  Menu,
  GitBranch,
} from 'lucide-react';
import { useNavigation } from './NavigationContext';

export function Header() {
  const [time, setTime] = useState<string>('');
  const [battery] = useState(94);
  const { toggleMobileNav, isMobileOpen } = useNavigation();

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header">
      {/* Left: Mobile Toggle + Mission Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-nav-toggle-btn"
          onClick={toggleMobileNav}
          aria-label={isMobileOpen ? 'Close Navigation' : 'Open Navigation'}
        >
          <Menu size={20} />
        </button>

        {/* Unit Identifier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'none',
            }}
            className="header-unit-label"
          >
            UNIT:
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--cyan)',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              padding: '3px 8px',
              borderRadius: '5px',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              letterSpacing: '0.02em',
            }}
          >
            AGV-TITAN-09
          </span>
        </div>

        {/* Divider */}
        <div
          className="header-mission-title"
          style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)' }}
        />

        {/* Active Mission Description (Desktop) */}
        <div
          className="header-mission-title"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MISSION:</span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Stack Pallet & Sensor Diagnostics
          </span>
        </div>
      </div>

      {/* Right: Telemetry Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {/* Latency */}
        <div
          className="header-telemetry-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Network Ping Latency"
        >
          <Wifi size={14} color="#34d399" />
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            12ms
          </span>
        </div>

        {/* Core Temperature (Hidden on Mobile) */}
        <div
          className="header-telemetry-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Core Temperature"
        >
          <Cpu size={14} color="var(--cyan)" />
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            42.4°C
          </span>
        </div>

        {/* Battery */}
        <div
          className="header-telemetry-battery"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Battery Health & Charge"
        >
          <BatteryCharging size={15} color="#10b981" />
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#10b981',
            }}
          >
            {battery}%
          </span>
        </div>

        {/* Live Clock (Hidden on small phones) */}
        <div
          className="header-clock"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Clock size={13} color="var(--text-muted)" />
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            {time || '00:00:00'}
          </span>
        </div>

        {/* Deploy Badge */}
        <div
          className="badge badge-cyan"
          style={{
            fontSize: '0.68rem',
            padding: '3px 8px',
          }}
          title="Connected to Vercel Production Environment"
        >
          <GitBranch size={11} />
          <span>Vercel</span>
        </div>
      </div>
    </header>
  );
}
