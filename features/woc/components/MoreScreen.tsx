import { EngineeringAnalyticsPreview } from './EngineeringAnalyticsPreview';
import type { LocalEngineeringAnalyticsSummary } from '../persistence/correctionRecordAnalytics';
import type { ActionFeedback, CurrentUser, SetupConfig } from '../types/wocSessionTypes';

type MoreScreenProps = {
  currentUser: CurrentUser;
  draftCount: number;
  historyCount: number;
  analyticsSummary: LocalEngineeringAnalyticsSummary;
  localRecordsFeedback: ActionFeedback;
  setupConfig: SetupConfig;
  setupCodeInput: string;
  setupUnlocked: boolean;
  setupFeedback: ActionFeedback;
  onSetupCodeChange: (value: string) => void;
  onUnlockSetup: () => void;
  onLockSetup: () => void;
  onUpdateSetupConfig: (key: keyof SetupConfig, value: string) => void;
  onSaveSetupConfig: () => void;
  onClearLocalRecords: () => void;
  onLogout: () => void;
  onResetUser?: () => void;
};

export function MoreScreen({
  currentUser,
  draftCount,
  historyCount,
  analyticsSummary,
  localRecordsFeedback,
  setupConfig,
  setupCodeInput,
  setupUnlocked,
  setupFeedback,
  onSetupCodeChange,
  onUnlockSetup,
  onLockSetup,
  onUpdateSetupConfig,
  onSaveSetupConfig,
  onClearLocalRecords,
  onLogout,
  onResetUser,
}: MoreScreenProps) {
  return (
    <section className="stack more-admin-screen">
      <div className="screen-title">
        <h1>More</h1>
        <p>Settings, help, setup, local records, and current user access.</p>
      </div>
      <article className="card more-user-panel">
        <h2>Current User</h2>
        <p>This saved identity is used as Submitted By on correction reports.</p>
        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item">
            <strong>{currentUser.displayName}</strong>
            <span>{currentUser.emailOrEmployeeId}</span>
            <span>Set up: {currentUser.loginTimestamp}</span>
          </div>
        </div>
        <div className="action-row">
          <button className="button secondary full-width" type="button" onClick={onLogout}>Lock App</button>
          {onResetUser && (
            <button className="button danger full-width" type="button" onClick={onResetUser}>Reset Saved User</button>
          )}
        </div>
        <p className="field-help">Lock App keeps the saved identity and returns to the 4-digit App Access PIN screen. Reset Saved User clears the local profile and returns to first-time setup.</p>
      </article>

      <div className="more-analytics-panel">
        <EngineeringAnalyticsPreview summary={analyticsSummary} />
      </div>

      <article className="card more-settings-panel">
        <h2>Settings / Help</h2>
        <p>Core settings and help information without disrupting the correction workflow.</p>
        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item">
            <strong>System Purpose</strong>
            <span>Fix bad router data before it becomes waste.</span>
          </div>
          <div className="placeholder-item">
            <strong>Build Status</strong>
            <span>Milestone 19: Local Engineering Analytics preview.</span>
          </div>
        </div>
      </article>

      <article className="card more-setup-panel">
        <h2>Setup / Admin</h2>
        <p>Local demo setup. This remains separate from App Access PIN and still requires the master code.</p>
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
            <p className="field-help">Setup unlock lasts only while you are editing. The code is not saved in localStorage.</p>
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
                placeholder="REFAB Connect"
              />
            </label>
            <label>
              Default Submitted By Name
              <input
                type="text"
                value={setupConfig.defaultSubmittedByName}
                onChange={(event) => onUpdateSetupConfig('defaultSubmittedByName', event.target.value)}
                placeholder="Submitted by name"
              />
            </label>
            <label>
              Default Submitted By Email
              <input
                type="email"
                value={setupConfig.defaultSubmittedByEmail}
                onChange={(event) => onUpdateSetupConfig('defaultSubmittedByEmail', event.target.value)}
                placeholder="submittedby@example.com"
              />
            </label>
            <button className="button success full-width" type="button" onClick={onSaveSetupConfig}>Save Setup Config</button>
            <button className="button secondary full-width" type="button" onClick={onLockSetup}>Lock Setup</button>
            <p className="field-help">Engineering Recipient Email controls email routing. If blank, the server fallback REFAB_CONNECT_EMAIL_TO is used. Saving relocks Setup/Admin.</p>
          </div>
        )}
        {setupFeedback && (
          <p className="field-help">{setupFeedback.tone === 'success' ? 'Setup: ' : 'Setup error: '}{setupFeedback.message}</p>
        )}
      </article>

      <article className="card more-records-panel">
        <h2>Local Records</h2>
        <p>Drafts and History are saved locally on this device/browser only.</p>
        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item">
            <strong>Saved Drafts</strong>
            <span>{draftCount} local record{draftCount === 1 ? '' : 's'}</span>
          </div>
          <div className="placeholder-item">
            <strong>Saved History</strong>
            <span>{historyCount} local record{historyCount === 1 ? '' : 's'}</span>
          </div>
        </div>
        <p className="field-help">Warning: Clear Local Records removes saved Drafts and History from this browser. This cannot be undone.</p>
        <div className="action-row">
          <button className="button danger full-width" type="button" onClick={onClearLocalRecords}>Clear Local Records</button>
        </div>
        {localRecordsFeedback && (
          <p className="field-help">{localRecordsFeedback.tone === 'success' ? 'Local records: ' : 'Local records error: '}{localRecordsFeedback.message}</p>
        )}
      </article>
    </section>
  );
}
