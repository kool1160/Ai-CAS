import type { LocalEngineeringAnalyticsSummary } from '../persistence/correctionRecordAnalytics';
import type { ActionFeedback, CurrentUser, SetupConfig } from '../types/wocSessionTypes';

const betaIssueEmailBody = `Hi Chris,

I found something during AI-CAS beta testing.

Company:
Name:
Device:
Browser:
Screen / area:
What happened:
What I expected:
Steps to repeat:
Screenshot attached:
Urgency:
Additional notes:

Thank you.`;

const betaIssueMailtoHref = `mailto:Chris@appliedintelco.com?subject=${encodeURIComponent('AI-CAS Beta Feedback')}&body=${encodeURIComponent(betaIssueEmailBody)}`;

type MoreScreenProps = {
  currentUser: CurrentUser;
  draftCount?: number;
  historyCount?: number;
  analyticsSummary?: LocalEngineeringAnalyticsSummary;
  localRecordsFeedback?: ActionFeedback;
  setupConfig: SetupConfig;
  setupCodeInput: string;
  setupUnlocked: boolean;
  setupFeedback: ActionFeedback;
  onSetupCodeChange: (value: string) => void;
  onUnlockSetup: () => void;
  onLockSetup: () => void;
  onUpdateSetupConfig: (key: keyof SetupConfig, value: string) => void;
  onSaveSetupConfig: () => void;
  onClearLocalRecords?: () => void;
  onLogout: () => void;
};

export function MoreScreen({
  currentUser,
  setupConfig,
  setupCodeInput,
  setupUnlocked,
  setupFeedback,
  onSetupCodeChange,
  onUnlockSetup,
  onLockSetup,
  onUpdateSetupConfig,
  onSaveSetupConfig,
  onLogout,
}: MoreScreenProps) {
  return (
    <section className="stack more-admin-screen">
      <div className="screen-title">
        <h1>More</h1>
        <p>Setup, help, and saved operator access.</p>
      </div>

      <div className="more-left-column">
        <article className="card more-user-panel">
          <h2>Current Operator</h2>
          <p>This operator name is used as Submitted By on correction reports.</p>
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            <div className="placeholder-item">
              <strong>{currentUser.displayName}</strong>
              <span>{currentUser.emailOrEmployeeId}</span>
              <span>Set up: {currentUser.loginTimestamp}</span>
            </div>
          </div>
          <div className="action-row">
            <button className="button secondary full-width" type="button" onClick={onLogout}>Sign Out</button>
                      </div>
          <p className="field-help">Signing out returns this device to the AI-CAS account sign-in screen.</p>
        </article>

        <article className="card more-settings-panel">
          <h2>Settings / Help</h2>
          <p>Quick reference for the active corrective action workflow.</p>
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            <div className="placeholder-item">
              <strong>System Purpose</strong>
              <span>Fix bad router data before it becomes waste.</span>
            </div>
            <div className="placeholder-item">
              <strong>Build Status</strong>
              <span>AI-CAS corrective action workflow active.</span>
            </div>
          </div>
        </article>

        <article className="card more-beta-feedback-panel">
          <h2>Beta Feedback / Report Issue</h2>
          <p>Use this during beta testing to report bugs, confusing screens, extraction problems, or AI-CAS output issues.</p>
          <a className="button primary full-width" href={betaIssueMailtoHref}>Report Beta Issue</a>
        </article>
      </div>

      <div className="more-right-column">
        <article className="card more-setup-panel">
          <h2>Setup / Admin</h2>
          <p>Setup controls for this device. Unlocking Setup is separate from the App Access PIN and requires the master code.</p>
          {!setupUnlocked ? (
            <div className="form-grid" style={{ marginTop: 14 }}>
              <label>
                Master Code
                <input
                  autoComplete="off"
                  type="password"
                  value={setupCodeInput}
                  onChange={(event) => onSetupCodeChange(event.target.value)}
                  placeholder="Enter setup master code"
                />
              </label>
              <button className="button primary full-width" type="button" onClick={onUnlockSetup}>Unlock Setup</button>
              <p className="field-help">Setup stays unlocked only while you edit this screen. The master code is not saved on this device.</p>
            </div>
          ) : (
            <div className="form-grid" style={{ marginTop: 14 }}>
              <label>
                Company Name
                <input
                  type="text"
                  value={setupConfig.companyName}
                  onChange={(event) => onUpdateSetupConfig('companyName', event.target.value)}
                  placeholder="Company name"
                />
              </label>
              <label>
                Engineering Recipient Email
                <input
                  type="email"
                  value={setupConfig.engineeringRecipientEmail}
                  onChange={(event) => onUpdateSetupConfig('engineeringRecipientEmail', event.target.value)}
                  placeholder="engineering@example.com"
                />
              </label>
              <label>
                Sender Display Name
                <input
                  type="text"
                  value={setupConfig.senderDisplayName}
                  onChange={(event) => onUpdateSetupConfig('senderDisplayName', event.target.value)}
                  placeholder="AI-CAS"
                />
              </label>
              <label>
                Default Operator Name
                <input
                  type="text"
                  value={setupConfig.defaultSubmittedByName}
                  onChange={(event) => onUpdateSetupConfig('defaultSubmittedByName', event.target.value)}
                  placeholder="Operator name"
                />
              </label>
              <label>
                Default Operator Email
                <input
                  type="email"
                  value={setupConfig.defaultSubmittedByEmail}
                  onChange={(event) => onUpdateSetupConfig('defaultSubmittedByEmail', event.target.value)}
                  placeholder="operator@example.com"
                />
              </label>
              <button className="button success full-width" type="button" onClick={onSaveSetupConfig}>Save Setup</button>
              <button className="button secondary full-width" type="button" onClick={onLockSetup}>Lock Setup</button>
              <p className="field-help">Engineering Recipient Email controls where correction reports are sent. If blank, the server email fallback is used. Saving locks Setup again.</p>
            </div>
          )}
          {setupFeedback && (
            <p className="field-help">{setupFeedback.tone === 'success' ? 'Setup: ' : 'Setup error: '}{setupFeedback.message}</p>
          )}
        </article>
      </div>
    </section>
  );
}
