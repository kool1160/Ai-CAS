import type { ActionFeedback, CurrentUser } from '../types/wocSessionTypes';

type LoginScreenProps = {
  savedUser: CurrentUser | null;
  displayName: string;
  emailOrEmployeeId: string;
  appUnlockPin: string;
  loginFeedback: ActionFeedback;
  onDisplayNameChange: (value: string) => void;
  onEmailOrEmployeeIdChange: (value: string) => void;
  onAppUnlockPinChange: (value: string) => void;
  onSetupUser: () => void;
  onUnlockApp: () => void;
  onResetUser: () => void;
};

function resetViewportToTop() {
  if (typeof window === 'undefined') return;

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

export function LoginScreen({
  savedUser,
  displayName,
  emailOrEmployeeId,
  appUnlockPin,
  loginFeedback,
  onDisplayNameChange,
  onEmailOrEmployeeIdChange,
  onAppUnlockPinChange,
  onSetupUser,
  onUnlockApp,
  onResetUser,
}: LoginScreenProps) {
  const isReturningUser = Boolean(savedUser);

  const handleAccessAction = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (isReturningUser) {
      onUnlockApp();
    } else {
      onSetupUser();
    }

    resetViewportToTop();
  };

  return (
    <main className="app-shell">
      <div className="app-frame">
        <section className="stack home-screen">
          <div className="hero">
            <span className="status-pill"><span className="status-dot" />APP LOCKED</span>
            <div className="brand-mark">
              <h1 className="brand-title">Vectis</h1>
              <p className="brand-subtitle">Corrective Action System</p>
              <p className="brand-subtitle">Let’s weld.</p>
              <p className="brand-subtitle">App Access PIN</p>
            </div>
            <p className="helper-text">
              {isReturningUser
                ? 'Enter the 4-digit App Access PIN to prevent casual or accidental use.'
                : 'Set up the submitting user once, then protect app access with a 4-digit PIN.'}
            </p>
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2>{isReturningUser ? 'Unlock Vectis' : 'First-Time Setup'}</h2>
                <p>
                  {isReturningUser
                    ? `Submitted By: ${savedUser?.displayName} (${savedUser?.emailOrEmployeeId})`
                    : 'This saved identity appears on reports as Submitted By.'}
                </p>
              </div>
              <span className="field-status">Vectis</span>
            </div>

            {!isReturningUser && (
              <div className="form-grid">
                <label>
                  User Name
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => onDisplayNameChange(event.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
                <label>
                  Email or Employee ID
                  <input
                    type="text"
                    value={emailOrEmployeeId}
                    onChange={(event) => onEmailOrEmployeeIdChange(event.target.value)}
                    placeholder="Email or employee ID"
                  />
                </label>
              </div>
            )}

            <div className="form-grid" style={{ marginTop: isReturningUser ? 0 : 14 }}>
              <label>
                4-Digit App Access PIN
                <input
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]*"
                  type="password"
                  value={appUnlockPin}
                  onChange={(event) => onAppUnlockPinChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter PIN"
                />
              </label>
            </div>

            {loginFeedback && (
              <p className="field-help">{loginFeedback.tone === 'success' ? 'Access: ' : 'Access error: '}{loginFeedback.message}</p>
            )}

            <div className="action-row">
              <button className="button primary full-width" type="button" disabled={appUnlockPin.length !== 4} onClick={handleAccessAction}>
                {isReturningUser ? 'Unlock Vectis' : 'Save User + Unlock'}
              </button>
            </div>

            {isReturningUser && (
              <div className="action-row">
                <button className="button secondary full-width" type="button" onClick={onResetUser}>Reset Saved User</button>
              </div>
            )}

            <p className="field-help">This is a lightweight childproof / accidental-use lock. Controlled release actions remain gated separately.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
