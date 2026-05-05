import type { ActionFeedback } from '../types/wocSessionTypes';

type MoreScreenProps = {
  draftCount: number;
  historyCount: number;
  localRecordsFeedback: ActionFeedback;
  onClearLocalRecords: () => void;
};

export function MoreScreen({ draftCount, historyCount, localRecordsFeedback, onClearLocalRecords }: MoreScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>More</h1>
        <p>Settings, help, and system information placeholders.</p>
      </div>
      <article className="card">
        <h2>Settings / Help</h2>
        <p>Future settings can live here without disrupting the main correction workflow.</p>
        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item">
            <strong>System Purpose</strong>
            <span>Fix bad router data before it becomes waste.</span>
          </div>
          <div className="placeholder-item">
            <strong>Build Status</strong>
            <span>Milestone 11: Local Drafts and History persistence.</span>
          </div>
        </div>
      </article>

      <article className="card">
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
