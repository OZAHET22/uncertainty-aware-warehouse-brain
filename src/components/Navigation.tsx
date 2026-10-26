// src/components/Navigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Scale,
  Gamepad2,
  BrainCircuit,
  Wrench,
  Activity,
  Bot,
  X,
  Zap,
} from 'lucide-react';
import { useNavigation } from './NavigationContext';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Overview & Telemetry',
    icon: LayoutDashboard,
    badge: 'Hub',
    color: 'var(--cyan)',
  },
  {
    href: '/planning',
    label: 'Module A: Planning',
    icon: Boxes,
    badge: 'STRIPS',
    color: '#38bdf8',
  },
  {
    href: '/uncertainty',
    label: 'Module B: Uncertainty',
    icon: Scale,
    badge: '6 Formalisms',
    color: '#fbbf24',
  },
  {
    href: '/game',
    label: 'Module C: Dock Game',
    icon: Gamepad2,
    badge: 'MiniMax/AB',
    color: '#f43f5e',
  },
  {
    href: '/connectionist',
    label: 'Module D: Connectionist',
    icon: BrainCircuit,
    badge: 'Hopfield/RNN',
    color: '#c084fc',
  },
  {
    href: '/expert-system',
    label: 'Module E: Expert System',
    icon: Wrench,
    badge: '18 Rules',
    color: '#34d399',
  },
  {
    href: '/simulation',
    label: 'Integrated Simulation',
    icon: Activity,
    badge: 'Central Loop',
    color: '#06b6d4',
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileNav } = useNavigation();

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={closeMobileNav}
        aria-hidden="true"
      />

      <aside
        className={`sidebar-container ${isMobileOpen ? 'open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
                flexShrink: 0,
              }}
            >
              <Bot size={24} color="#ffffff" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                WAREHOUSE<span style={{ color: 'var(--cyan)' }}>.BRAIN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span className="pulse-dot"></span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  AUTONOMOUS v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeMobileNav}
            aria-label="Close navigation"
            style={{
              display: isMobileOpen ? 'flex' : 'none',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav List */}
        <nav
          style={{
            flex: 1,
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              padding: '0 8px 4px 8px',
              letterSpacing: '0.08em',
            }}
          >
            AI Intelligence Subsystems
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? 'var(--cyan)' : item.color} />
                  <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }}>
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: isActive
                      ? 'rgba(6, 182, 212, 0.25)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#38bdf8' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer System Status */}
        <div
          style={{
            marginTop: 'auto',
            padding: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="#10b981" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
                Vercel Ready
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Next.js 14
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Autonomous multi-agent intelligence loop running in cloud & edge.
          </div>
        </div>
      </aside>
    </>
  );
}
