import type { ActionFeedback, DraftRecord } from '../types/wocSessionTypes';

type DraftsScreenProps = {
  draftRecords: DraftRecord[];
  selectedDraft: DraftRecord | null;
  draftFinalReviewConfirmed: boolean;
  isSendingDraft: boolean;
  draftActionFeedback: ActionFeedback;
  onSelectDraft: (draftId: string) => void;
  onCopyDraftReport: () => void;
  onCopyDraftEmail: () => void;
  onDraftFinalReviewChange: (confirmed: boolean) => void;
  onSendDraftEmail: () => void;
};

export function DraftsScreen({
  draftRecords,
  selectedDraft,
  draftFinalReviewConfirmed,
  isSendingDraft,
  draftActionFeedback,
  onSelectDraft,
  onCopyDraftReport,
  onCopyDraftEmail,
  onDraftFinalReviewChange,
  onSendDraftEmail,
}: DraftsScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Drafts</h1>
        <p>Saved correction packages for this browser.</p>
      </div>
      <div className="placeholder-list">
        {draftRecords.length === 0 ? (
          <div className="placeholder-item">
            <strong>No saved drafts</strong>
            <span>Generate a correction package, then use Save Draft on Review / Send.</span>
          </div>
        ) : (
          draftRecords.map((draft) => (
            <div className="placeholder-item" key={draft.draftId}>
              <strong>{draft.draftId} · {draft.subjectLine}</strong>
              <span>{draft.status} · WO {draft.workOrderNumber} · Part {draft.partNumber}</span>
              <span>{draft.affectedArea} · {draft.correctionType} · {draft.createdTimestamp}</span>
              <div className="action-row">
                <button className="button secondary" type="button" onClick={() => onSelectDraft(draft.draftId)}>Open Draft</button>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedDraft && (
        <article className="card">
          <div className="card-header">
            <div>
              <h2>{selectedDraft.draftId}</h2>
              <p>{selectedDraft.status} · {selectedDraft.createdTimestamp}</p>
            </div>
            <span className="field-status confirmed">Saved</span>
          </div>
          <h3>Saved Engineering Report</h3>
          <div className="preview-box">{selectedDraft.reportText}</div>
          <h3 style={{ marginTop: 14 }}>Saved Email Draft</h3>
          <div className="preview-box">{selectedDraft.emailDraftText}</div>

          <div className="action-row">
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={onCopyDraftReport}>Copy Report</button>
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={onCopyDraftEmail}>Copy Email Draft</button>
          </div>

          {draftActionFeedback && (
            <p className="field-help">{draftActionFeedback.tone === 'success' ? 'Draft: ' : 'Draft error: '}{draftActionFeedback.message}</p>
          )}

          <label style={{ marginTop: 14 }}>
            <input
              checked={draftFinalReviewConfirmed}
              disabled={isSendingDraft}
              onChange={(event) => onDraftFinalReviewChange(event.target.checked)}
              type="checkbox"
            />
            Final review confirmed
          </label>

          <div className="action-row">
            <button className="button danger full-width" type="button" disabled={!draftFinalReviewConfirmed || isSendingDraft} onClick={onSendDraftEmail}>
              {isSendingDraft ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
