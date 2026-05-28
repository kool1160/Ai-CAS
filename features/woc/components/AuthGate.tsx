'use client';

import { useEffect, useState } from 'react';
import { WocApp } from './WocApp';
import { createCurrentUser, saveCurrentUserToStorage } from '../logic/currentUserStorage';
import { isSupabaseAuthConfigured, supabaseAuthRequest } from '../../../lib/supabase/client';

type Feedback = { tone: 'success' | 'error'; message: string } | null;

const SUPABASE_NOT_CONFIGURED_MESSAGE = 'Supabase is not configured for this deployment. Check Vercel Preview environment variables.';
const PASSWORD_TOO_SHORT_MESSAGE = 'Password must be at least 6 characters.';

function getAuthErrorMessage(payload: Record<string, unknown> | null, fallback: string) {
  const message = payload?.msg ?? payload?.message ?? payload?.error_description ?? payload?.error;
  return typeof message === 'string' && message.trim() ? message : fallback;
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
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!isSupabaseAuthConfigured()) {
      setFeedback({ tone: 'error', message: SUPABASE_NOT_CONFIGURED_MESSAGE });
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setFeedback({ tone: 'error', message: 'Enter a valid email address.' });
      return;
    }

    if (normalizedPassword.length < 6) {
      setFeedback({ tone: 'error', message: PASSWORD_TOO_SHORT_MESSAGE });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const path = mode === 'signup' ? '/signup' : '/token?grant_type=password';
      const response = await supabaseAuthRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
      });
      const payload = await response.json().catch(() => null) as Record<string, unknown> | null;

      if (!response.ok) {
        setFeedback({
          tone: 'error',
          message: getAuthErrorMessage(payload, `Auth failed with status ${response.status}.`),
        });
        return;
      }

      const payloadUser = payload?.user;
      const nextEmail = typeof payloadUser === 'object' && payloadUser !== null && 'email' in payloadUser && typeof payloadUser.email === 'string'
        ? payloadUser.email
        : normalizedEmail;

      setUserEmail(nextEmail);
      window.localStorage.setItem('aicas-supabase-email', nextEmail);
      saveCurrentUserToStorage(createCurrentUser(nextEmail, nextEmail, '0000'));
      setFeedback({ tone: 'success', message: mode === 'signup' ? 'Account created and signed in.' : 'Signed in successfully.' });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error && error.message ? error.message : SUPABASE_NOT_CONFIGURED_MESSAGE,
      });
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
              {feedback && (
                <div
                  className="card"
                  style={{
                    borderColor: feedback.tone === 'error' ? 'rgba(248, 113, 113, 0.85)' : 'rgba(74, 222, 128, 0.85)',
                    background: feedback.tone === 'error' ? 'rgba(127, 29, 29, 0.34)' : 'rgba(20, 83, 45, 0.3)',
                    color: '#fff',
                    fontWeight: 800,
                    marginTop: 12,
                    padding: 14,
                  }}
                >
                  {feedback.message}
                </div>
              )}
              <div className="action-row">
                <button className="button primary full-width" disabled={isLoading} onClick={() => void runAuth('signin')}>
                  {isLoading ? 'Signing In…' : 'Sign In'}
                </button>
                <button className="button secondary full-width" disabled={isLoading} onClick={() => void runAuth('signup')}>
                  {isLoading ? 'Signing Up…' : 'Sign Up'}
                </button>
              </div>
              <p className="field-help">Use a password with at least 6 characters. New users should tap Sign Up first.</p>
            </article>
          </section>
        </div>
      </main>
    );
  }

  return <WocApp />;
}
