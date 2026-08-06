import { useState, type ChangeEvent } from 'react';
import { MAX_LOCAL_RECORD_BACKUP_BYTES, type LocalRecordBackupPreview } from '../logic/localRecordBackup';
import type { LocalEngineeringAnalyticsSummary } from '../persistence/correctionRecordAnalytics';
import type { ActionFeedback, CurrentUser, SetupConfig } from '../types/wocSessionTypes';

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
  onPreviewLocalBackup: (source: string) => LocalRecordBackupPreview;
  onExportLocalBackup: () => void;
  onImportLocalBackup: (source: string) => void;
  onLogout: () => void;
  onResetUser?: () => void;
};

export function MoreScreen({
  currentUser,
  draftCount = 0,
  historyCount = 0,
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
  onPreviewLocalBackup,
  onExportLocalBackup,
  onImportLocalBackup,
  onLogout,
  onResetUser,
}: MoreScreenProps) {
  const [backupSource, setBackupSource] = useState('');
  const [backupPreview, setBackupPreview] = useState<LocalRecordBackupPreview | null>(null);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<ActionFeedback>(null);

  const handleBackupFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const backupFile = event.target.files?.[0];
    setBackupConfirmed(false);
    setBackupPreview(null);
    setBackupSource('');

    if (!backupFile) return;

    if (backupFile.size > MAX_LOCAL_RECORD_BACKUP_BYTES) {
      setBackupFeedback({ tone: 'error', message: 'This backup exceeds the 1 MB browser-local import limit.' });
      return;
    }

    try {
      const source = await backupFile.text();
      const preview = onPreviewLocalBackup(source);
      setBackupSource(source);
      setBackupPreview(preview);
      setBackupFeedback(preview.canImport ? null : { tone: 'error', message: preview.message });
    } catch {
      setBackupFeedback({ tone: 'error', message: 'This backup could not be read in the browser.' });
    }
  };

  const confirmBackupImport = () => {
    if (!backupPreview?.canImport || !backupConfirmed || !backupSource) return;
    onImportLocalBackup(backupSource);
    setBackupConfirmed(false);
  };

  return (
    <section className="stack more-admin-screen">
      <div className="screen-title">
        <h1>More</h1>
        <p>Settings, help, setup/admin controls, and saved user access.</p>
      </div>

      <div className="more-left-column">
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

        <article className="card more-settings-panel">
          <h2>Settings / Help</h2>
          <p>Core settings and help information without disrupting the corrective action workflow.</p>
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            <div className="placeholder-item">
              <strong>System Purpose</strong>
              <span>Fix bad router data before it becomes waste.</span>
            </div>
            <div className="placeholder-item">
              <strong>Build Status</strong>
              <span>V4 corrective action workflow active.</span>
            </div>
          </div>
        </article>

        <article className="card more-local-record-panel">
          <h2>Browser-Local Records</h2>
          <p>Backups stay on this device unless you choose a local file to export. Import previews never overwrite duplicate record IDs.</p>
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            <div className="placeholder-item">
              <strong>{draftCount} Drafts · {historyCount} History</strong>
              <span>Schema version 1 · browser-local only</span>
            </div>
          </div>
          <div className="action-row">
            <button className="button secondary full-width" type="button" onClick={onExportLocalBackup}>Export Local Backup</button>
          </div>
          <label className="field-label" style={{ display: 'block', marginTop: 14 }}>
            Preview Local Backup Import
            <input accept="application/json,.json" type="file" onChange={handleBackupFile} />
          </label>
          {backupPreview?.canImport && (
            <div className="placeholder-list" style={{ marginTop: 14 }}>
              <div className="placeholder-item">
                <strong>Import preview</strong>
                <span>Exported: {backupPreview.exportedAt}</span>
                <span>Adds {backupPreview.draftImportCount} draft(s) and {backupPreview.historyImportCount} history record(s).</span>
                <span>Keeps {backupPreview.duplicateDraftCount + backupPreview.duplicateHistoryCount} duplicate ID(s) unchanged.</span>
              </div>
            </div>
          )}
          {backupPreview?.canImport && (
            <div className="form-grid" style={{ marginTop: 14 }}>
              <label>
                <input
                  checked={backupConfirmed}
                  type="checkbox"
                  onChange={(event) => setBackupConfirmed(event.target.checked)}
                />{' '}
                I reviewed this local import preview and want to add only the listed non-duplicate records.
              </label>
              <button className="button primary full-width" disabled={!backupConfirmed} type="button" onClick={confirmBackupImport}>Import Previewed Backup</button>
            </div>
          )}
          {(backupFeedback || localRecordsFeedback) && (
            <p className="field-help">
              {backupFeedback
                ? `${backupFeedback.tone === 'success' ? 'Backup: ' : 'Backup error: '}${backupFeedback.message}`
                : `${localRecordsFeedback?.tone === 'success' ? 'Local records: ' : 'Local records error: '}${localRecordsFeedback?.message}`}
            </p>
          )}
        </article>
      </div>

      <div className="more-right-column">
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
      </div>
    </section>
  );
}
