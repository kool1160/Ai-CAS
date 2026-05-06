'use client';

import { useEffect, useState, type ReactNode } from 'react';

type LaunchSplashProps = {
  children: ReactNode;
};

const splashDurationMs = 1050;

export function LaunchSplash({ children }: LaunchSplashProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, splashDurationMs);

    return () => window.clearTimeout(timer);
  }, []);

  if (!showSplash) return <>{children}</>;

  return (
    <main className="launch-splash" aria-label="Refab Connect launch screen">
      <section className="launch-splash-card">
        <span className="launch-splash-kicker">REFAB CONNECT</span>
        <h1>Work Order Correction System</h1>
        <p>Powered by Applied Intelligence Framework</p>
        <div className="launch-splash-status" aria-live="polite">
          <span className="status-dot" />
          Initializing secure workflow...
        </div>
      </section>
    </main>
  );
}
