import type { GeneratedCorrectionPackage, WocConfirmationState } from '../state/wocDataModel';
import type { ActionFeedback } from '../types/wocSessionTypes';

type ReviewSendScreenProps = {
  generatedPackage: GeneratedCorrectionPackage;
  sendReady: boolean;
  copyFeedback: ActionFeedback;
  saveFeedback: ActionFeedback;
  sendFeedback: ActionFeedback;
  confirmations: WocConfirmationState;
  onCopyReport: () => void;
  onCopyEmailDraft: () => void;
  onSaveDraft: () => void;
  onFinalReviewChange: (confirmed: boolean) => void;
  onSendPlaceholder: () => void;
};

export function ReviewSendScreen({
  generatedPackage,
  sendReady,
  copyFeedback,
  saveFeedback,
  sendFeedback,
  confirmations,
  onCopyReport,
  onCopyEmailDraft,
  onSaveDraft,
  onFinalReviewChange,
  onSendPlaceholder,
}: ReviewSendScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Review / Send</h1>
        <p>Review the generated Engineering report and email draft. Copy/send controls remain placeholders until send logic is wired.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>{generatedPackage ? 'Engineering Report Ready' : 'Draft Not Generated'}</h2>
            <p>Final review gate controls whether the placeholder send button is enabled.</p>
          </div>
          <span className={sendReady ? 'field-status confirmed' : 'field-status'}>{sendReady ? 'Ready to Send' : 'Review'}</span>
        </div>
        <div className="preview-box">{generatedPackage?.reportPreview ?? 'Generate a correction package before final review.'}</div>
      </article>

      <article className="card">
        <h2>Engineering Email Draft</h2>
        <div className="preview-box">{generatedPackage?.emailPreview ?? 'Generate a correction package before final review.'}</div>
        <div className="action-row">
          <button className="button secondary" type="button" disabled={!generatedPackage} onClick={onCopyReport}>Copy Report</button>
          <button className="button secondary" type="button" disabled={!generatedPackage} onClick={onCopyEmailDraft}>Copy Email Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage} onClick={onSaveDraft}>Save Draft</button>
        </div>
        {copyFeedback && (
          <p className="field-help">{copyFeedback.tone === 'success' ? 'Copied: ' : 'Copy error: '}{copyFeedback.message}</p>
        )}
        {saveFeedback && (
          <p className="field-help">{saveFeedback.tone === 'success' ? 'Saved: ' : 'Save error: '}{saveFeedback.message}</p>
        )}
        {sendFeedback && (
          <p className="field-help">{sendFeedback.tone === 'success' ? 'History: ' : 'History error: '}{sendFeedback.message}</p>
        )}
        <label style={{ marginTop: 14 }}>
          <input
            checked={confirmations.finalReviewConfirmed}
            disabled={!generatedPackage}
            onChange={(event) => onFinalReviewChange(event.target.checked)}
            type="checkbox"
          />
          Final review confirmed
        </label>
        <div className="action-row">
          <button className="button danger full-width" type="button" disabled={!sendReady} onClick={onSendPlaceholder}>Send / Confirm Send</button>
        </div>
      </article>
    </section>
  );
}
