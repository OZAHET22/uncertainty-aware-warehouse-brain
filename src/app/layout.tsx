// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Warehouse Robot Brain — Autonomous Intelligence Studio',
  description:
    'Integrated warehouse robot intelligence system featuring STRIPS Planning (Goal Stack, POP, HTN, Reactive), 6 Uncertainty formalisms, Adversarial Dock Contention, Hopfield associative memory & RNN, and Forward-Chaining Expert Diagnostics.',
  keywords: [
    'Autonomous Robotics',
    'Warehouse Robot',
    'Goal Stack Planner',
    'Partial Order Planning',
    'Bayesian Networks',
    'Dempster-Shafer',
    'Fuzzy Logic',
    'Hopfield Network',
    'Expert System',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Header />
            <main style={{ flex: 1, padding: '32px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
