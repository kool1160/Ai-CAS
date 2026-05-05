import type { GeneratedCorrectionPackage, WocConfirmationState } from '../state/wocDataModel';
import type { ActionFeedback } from '../types/wocSessionTypes';

type ReviewSendScreenProps = {
  generatedPackage: GeneratedCorrectionPackage;
  sendReady: boolean;
  isSending: boolean;
  copyFeedback: ActionFeedback;
  saveFeedback: ActionFeedback;
  sendFeedback: ActionFeedback;
  confirmations: WocConfirmationState;
  onCopyReport: () => void;
  onCopyEmailDraft: () => void;
  onSaveDraft: () => void;
  onFinalReviewChange: (confirmed: boolean) => void;
  onSendEmail: () => void;
};

export function ReviewSendScreen({
  generatedPackage,
  sendReady,
  isSending,
  copyFeedback,
  saveFeedback,
  sendFeedback,
  confirmations,
  onCopyReport,
  onCopyEmailDraft,
  onSaveDraft,
  onFinalReviewChange,
  onSendEmail,
}: ReviewSendScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Review / Send</h1>
        <p>Final check the Engineering report and email draft before sending the correction request.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>{generatedPackage ? 'Engineering Report Ready' : 'Draft Not Generated'}</h2>
            <p>Review the correction package and confirm it before email send unlocks.</p>
          </div>
          <span className={sendReady ? 'field-status confirmed' : 'field-status'}>{sendReady ? 'Ready to Send' : 'Review'}</span>
        </div>
        <div className="preview-box">{generatedPackage?.reportPreview ?? 'Generate a correction package before final review.'}</div>
      </article>

      <article className="card">
        <h2>Engineering Email Draft</h2>
        <div className="preview-box">{generatedPackage?.emailPreview ?? 'Generate a correction package before final review.'}</div>
        <div className="action-row">
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onCopyReport}>Copy Report</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onCopyEmailDraft}>Copy Email Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onSaveDraft}>Save Draft</button>
        </div>
        {copyFeedback && (
          <p className="field-help">{copyFeedback.tone === 'success' ? 'Copied: ' : 'Copy error: '}{copyFeedback.message}</p>
        )}
        {saveFeedback && (
          <p className="field-help">{saveFeedback.tone === 'success' ? 'Saved: ' : 'Save error: '}{saveFeedback.message}</p>
        )}
        {sendFeedback && (
          <p className="field-help">{sendFeedback.tone === 'success' ? 'Email: ' : 'Email error: '}{sendFeedback.message}</p>
        )}
        <label style={{ marginTop: 14 }}>
          <input
            checked={confirmations.finalReviewConfirmed}
            disabled={!generatedPackage || isSending}
            onChange={(event) => onFinalReviewChange(event.target.checked)}
            type="checkbox"
          />
          Final review confirmed
        </label>
        <div className="action-row">
          <button className="button danger full-width" type="button" disabled={!sendReady || isSending} onClick={onSendEmail}>
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </article>
    </section>
  );
}
