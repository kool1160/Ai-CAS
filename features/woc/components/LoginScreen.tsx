import type { ActionFeedback } from '../types/wocSessionTypes';

type LoginScreenProps = {
  isSignUpMode: boolean;
  displayName: string;
  email: string;
  password: string;
  loginFeedback: ActionFeedback;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onToggleMode: () => void;
};

function resetViewportToTop() {
  if (typeof window === 'undefined') return;

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

export function LoginScreen({
  isSignUpMode,
  displayName,
  email,
  password,
  loginFeedback,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onToggleMode,
}: LoginScreenProps) {
  const handleAccessAction = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (isSignUpMode) {
      onSignUp();
    } else {
      onSignIn();
    }

    resetViewportToTop();
  };

  const primaryDisabled = !email.trim() || !password || (isSignUpMode && !displayName.trim());

  return (
    <main className="app-shell">
      <div className="app-frame">
        <section className="stack home-screen">
          <div className="hero">
            <span className="status-pill"><span className="status-dot" />AUTH REQUIRED</span>
            <div className="brand-mark">
              <h1 className="brand-title">AI-CAS</h1>
              <p className="brand-subtitle">Corrective Action System</p>
              <p className="brand-subtitle">Powered by Applied Intelligence Framework</p>
              <p className="brand-subtitle">Authenticated Access</p>
            </div>
            <p className="helper-text">
              {isSignUpMode
                ? 'Create an AI-CAS account so future cloud records can be owned by an authenticated user ID.'
                : 'Sign in to restore your AI-CAS session and continue corrective action work.'}
            </p>
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2>{isSignUpMode ? 'Sign Up for AI-CAS' : 'Sign In to AI-CAS'}</h2>
                <p>{isSignUpMode ? 'Your email and generated user ID become the app identity source.' : 'Authentication is required before the app loads.'}</p>
              </div>
              <span className="field-status">AI-CAS</span>
            </div>

            <div className="form-grid">
              {isSignUpMode && (
                <label>
                  User Name
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => onDisplayNameChange(event.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
              )}
              <label>
                Email
                <input
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                  type="password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="Enter password"
                />
              </label>
            </div>

            {loginFeedback && (
              <p className="field-help">{loginFeedback.tone === 'success' ? 'Access: ' : 'Access error: '}{loginFeedback.message}</p>
            )}

            <div className="action-row">
              <button className="button primary full-width" type="button" disabled={primaryDisabled} onClick={handleAccessAction}>
                {isSignUpMode ? 'Sign Up + Enter AI-CAS' : 'Sign In'}
              </button>
            </div>
            <div className="action-row">
              <button className="button secondary full-width" type="button" onClick={onToggleMode}>
                {isSignUpMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>

            <p className="field-help">Session state is owned by AuthGate. Local compatibility identity is rebuilt only from a valid authenticated session.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
