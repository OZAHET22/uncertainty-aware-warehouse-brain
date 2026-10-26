// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { NavigationProvider } from '@/components/NavigationContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#07090e',
};

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
  authors: [{ name: 'Robotics Intelligence Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavigationProvider>
          <div className="app-layout-container">
            <Navigation />
            <div className="app-main-wrapper">
              <Header />
              <main className="app-content-area">
                {children}
              </main>
            </div>
          </div>
        </NavigationProvider>
      </body>
    </html>
  );
}
