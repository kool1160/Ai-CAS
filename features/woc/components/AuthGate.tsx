'use client';

import { useEffect, useState } from 'react';
import {
  AUTH_SIGN_OUT_EVENT,
  clearSupabaseSession,
  isSupabaseAuthConfigured,
  loadSupabaseSession,
  signInWithSupabase,
  signOutWithSupabase,
  signUpWithSupabase,
  validateSupabaseSession,
  type StoredSupabaseSession,
} from '../logic/supabaseAuth';
import { WocApp } from './WocApp';

type Feedback = { tone: 'success' | 'error'; message: string } | null;

const SUPABASE_NOT_CONFIGURED_MESSAGE = 'Supabase is not configured for this deployment. Check Vercel Preview environment variables.';
const PASSWORD_TOO_SHORT_MESSAGE = 'Password must be at least 6 characters.';

export function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<StoredSupabaseSession | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const savedSession = loadSupabaseSession();
      if (!savedSession) {
        if (!cancelled) setAuthResolved(true);
        return;
      }

      try {
        const validatedSession = await validateSupabaseSession(savedSession);
        if (!cancelled) setSession(validatedSession);
      } catch {
        clearSupabaseSession();
        if (!cancelled) {
          setSession(null);
          setFeedback({ tone: 'error', message: 'Your saved session expired. Sign in again.' });
        }
      } finally {
        if (!cancelled) setAuthResolved(true);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleSignOutRequest = () => {
      const activeSession = loadSupabaseSession();
      clearSupabaseSession();
      setSession(null);
      setEmail('');
      setPassword('');
      setFeedback({ tone: 'success', message: 'Signed out successfully.' });

      if (activeSession) {
        void signOutWithSupabase(activeSession.accessToken);
      }
    };

    window.addEventListener(AUTH_SIGN_OUT_EVENT, handleSignOutRequest);
    return () => window.removeEventListener(AUTH_SIGN_OUT_EVENT, handleSignOutRequest);
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
      const nextSession = mode === 'signup'
        ? await signUpWithSupabase(normalizedEmail, normalizedPassword)
        : await signInWithSupabase(normalizedEmail, normalizedPassword);

      setSession(nextSession);
      setEmail('');
      setPassword('');
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error && error.message ? error.message : 'Supabase authentication failed.',
      });
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authResolved) {
    return (
      <main className="app-shell">
        <div className="app-frame">
          <section className="stack home-screen">
            <article className="card">
              <h2>Restoring your AI-CAS session...</h2>
              <p className="field-help">Checking your secure Supabase session.</p>
            </article>
          </section>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app-shell">
        <div className="app-frame">
          <section className="stack home-screen">
            <article className="card">
              <h2>AI-CAS Sign In</h2>
              <label>
                Email
                <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label>
                Password
                <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
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
