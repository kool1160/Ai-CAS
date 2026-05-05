import type { ActionFeedback } from '../types/wocSessionTypes';

type LoginScreenProps = {
  displayName: string;
  emailOrEmployeeId: string;
  loginFeedback: ActionFeedback;
  onDisplayNameChange: (value: string) => void;
  onEmailOrEmployeeIdChange: (value: string) => void;
  onLogin: () => void;
};

export function LoginScreen({
  displayName,
  emailOrEmployeeId,
  loginFeedback,
  onDisplayNameChange,
  onEmailOrEmployeeIdChange,
  onLogin,
}: LoginScreenProps) {
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
            <p className="helper-text">Enter your name before using the correction workflow.</p>
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2>User Login</h2>
                <p>This is a local access lock and identity capture step, not full enterprise authentication.</p>
              </div>
              <span className="field-status">M16</span>
            </div>
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
            {loginFeedback && (
              <p className="field-help">{loginFeedback.tone === 'success' ? 'Login: ' : 'Login error: '}{loginFeedback.message}</p>
            )}
            <div className="action-row">
              <button className="button primary full-width" type="button" onClick={onLogin}>Log In</button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
