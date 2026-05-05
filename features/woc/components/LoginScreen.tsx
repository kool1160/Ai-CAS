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

  return (
    <main className="app-shell">
      <div className="app-frame">
        <section className="stack home-screen">
          <div className="hero">
            <span className="status-pill"><span className="status-dot" />ACCESS REQUIRED</span>
            <div className="brand-mark">
              <h1 className="brand-title">Refab Connect</h1>
              <p className="brand-subtitle">Work Order Correction System</p>
              <p className="brand-subtitle">Local device access lock</p>
            </div>
            <p className="helper-text">
              {isReturningUser ? 'Enter your 4-digit App PIN to unlock.' : 'Set up your identity once, then unlock with a 4-digit App PIN.'}
            </p>
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2>{isReturningUser ? 'Unlock App' : 'First-Time User Setup'}</h2>
                <p>
                  {isReturningUser
                    ? `Saved user: ${savedUser?.displayName} (${savedUser?.emailOrEmployeeId})`
                    : 'User identity is saved so reports know who submitted the correction.'}
                </p>
              </div>
              <span className="field-status">M16</span>
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
                4-Digit App PIN
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
              <button className="button primary full-width" type="button" disabled={appUnlockPin.length !== 4} onClick={isReturningUser ? onUnlockApp : onSetupUser}>
                {isReturningUser ? 'Unlock App' : 'Save User + Unlock'}
              </button>
            </div>

            {isReturningUser && (
              <div className="action-row">
                <button className="button secondary full-width" type="button" onClick={onResetUser}>Reset Saved User</button>
              </div>
            )}

            <p className="field-help">This is a local device access lock, not full enterprise authentication. Send Email still requires the separate 4-digit Send PIN.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
