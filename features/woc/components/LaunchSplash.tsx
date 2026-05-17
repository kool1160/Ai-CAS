'use client';

import { useEffect, useState, type ReactNode } from 'react';

type LaunchSplashProps = {
  children: ReactNode;
};

const splashDurationMs = 2000;

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
    <main className="launch-splash" aria-label="Vectis launch screen">
      <section className="launch-splash-card">
        <span className="launch-splash-kicker">Vectis</span>
        <h1>Corrective Action System</h1>
        <p>Let’s weld.</p>
        <div className="launch-splash-status" aria-live="polite">
          <span className="status-dot" />
          Initializing secure workflow...
        </div>
      </section>
    </main>
  );
}
