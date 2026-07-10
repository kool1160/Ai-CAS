'use client';

import { useEffect, useState } from 'react';
import { clearAuthSession, restoreAuthSession, signInWithLocalAuth, signUpWithLocalAuth } from '../logic/authSessionStorage';
import type { ActionFeedback, AuthenticatedUser } from '../types/wocSessionTypes';
import { LoginScreen } from './LoginScreen';
import { WocApp } from './WocApp';

type AuthState = {
  user: AuthenticatedUser;
  expiresAt: string;
} | null;

export function AuthGate() {
  const [authState, setAuthState] = useState<AuthState>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<ActionFeedback>(null);

  useEffect(() => {
    setAuthState(restoreAuthSession());
    setAuthResolved(true);
  }, []);

  const resetForm = () => {
    setDisplayName('');
    setEmail('');
    setPassword('');
    setAuthFeedback(null);
  };

  const handleSignIn = () => {
    try {
      setAuthState(signInWithLocalAuth(email, password));
      resetForm();
    } catch (error) {
      setAuthFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to sign in.' });
      setPassword('');
    }
  };

  const handleSignUp = () => {
    try {
      setAuthState(signUpWithLocalAuth(displayName, email, password));
      resetForm();
    } catch (error) {
      setAuthFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to sign up.' });
      setPassword('');
    }
  };

  const handleSignOut = () => {
    clearAuthSession();
    setAuthState(null);
    setIsSignUpMode(false);
    resetForm();
  };

  if (!authResolved) {
    return (
      <main className="app-shell">
        <div className="app-frame">
          <section className="stack home-screen">
            <article className="card">
              <h1>Restoring your AI-CAS session...</h1>
              <p className="field-help">Checking whether your authenticated session is still valid.</p>
            </article>
          </section>
        </div>
      </main>
    );
  }

  if (!authState) {
    return (
      <LoginScreen
        isSignUpMode={isSignUpMode}
        displayName={displayName}
        email={email}
        password={password}
        loginFeedback={authFeedback}
        onDisplayNameChange={(value) => {
          setDisplayName(value);
          setAuthFeedback(null);
        }}
        onEmailChange={(value) => {
          setEmail(value);
          setAuthFeedback(null);
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          setAuthFeedback(null);
        }}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onToggleMode={() => {
          setIsSignUpMode((current) => !current);
          setAuthFeedback(null);
          setPassword('');
        }}
      />
    );
  }

  return <WocApp authenticatedUser={authState.user} onSignOut={handleSignOut} />;
}
