'use client';

import { useEffect, useState } from 'react';
import { WocApp } from './WocApp';
import { clearCurrentUserFromStorage, createCurrentUser, saveCurrentUserToStorage } from '../logic/currentUserStorage';
import { supabaseAuthRequest } from '../../../lib/supabase/client';

type Feedback = { tone: 'success' | 'error'; message: string } | null;

const SUPABASE_NOT_CONFIGURED_MESSAGE = 'Supabase is not configured for this deployment. Check Vercel Preview environment variables.';
const PASSWORD_TOO_SHORT_MESSAGE = 'Password must be at least 6 characters.';

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('aicas-supabase-email');
    if (saved) setUserEmail(saved);
  }, []);

  const runAuth = async (mode: 'signin' | 'signup') => {
    if (!isSupabaseConfigured()) {
      setFeedback({ tone: 'error', message: SUPABASE_NOT_CONFIGURED_MESSAGE });
      return;
    }

    if (password.length < 6) {
      setFeedback({ tone: 'error', message: PASSWORD_TOO_SHORT_MESSAGE });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const path = mode === 'signup' ? '/signup' : '/token?grant_type=password';
      const response = await supabaseAuthRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setFeedback({ tone: 'error', message: payload?.msg || payload?.error_description || payload?.error || 'Auth failed.' });
        return;
      }

      const nextEmail = payload?.user?.email || email;
      setUserEmail(nextEmail);
      window.localStorage.setItem('aicas-supabase-email', nextEmail);
      saveCurrentUserToStorage(createCurrentUser(nextEmail, nextEmail, '0000'));
      setFeedback({ tone: 'success', message: mode === 'signup' ? 'Account created and signed in.' : 'Signed in successfully.' });
    } catch {
      setFeedback({ tone: 'error', message: SUPABASE_NOT_CONFIGURED_MESSAGE });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userEmail) {
    return (
      <main className="app-shell">
        <div className="app-frame">
          <section className="stack home-screen">
            <article className="card">
              <h2>AI-CAS Sign In</h2>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              {feedback && <p className="field-help">{feedback.message}</p>}
              <div className="action-row">
                <button className="button primary full-width" disabled={isLoading} onClick={() => void runAuth('signin')}>
                  {isLoading ? 'Signing In…' : 'Sign In'}
                </button>
                <button className="button secondary full-width" disabled={isLoading} onClick={() => void runAuth('signup')}>
                  {isLoading ? 'Signing Up…' : 'Sign Up'}
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="screen-title" style={{ padding: '8px 16px' }}>
        <span className="step-pill">Signed in: {userEmail}</span>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setUserEmail(null);
            window.localStorage.removeItem('aicas-supabase-email');
            clearCurrentUserFromStorage();
          }}
        >
          Sign Out
        </button>
      </div>
      <WocApp />
    </>
  );
}
