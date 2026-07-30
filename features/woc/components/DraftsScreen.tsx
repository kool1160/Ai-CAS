import { resolvePhotoEvidenceStatus } from '../logic/printCorrectionReport';
import { formatPersistedReviewStatus } from '../state/reviewGate';
import type { ActionFeedback, DraftRecord } from '../types/wocSessionTypes';

type DraftsScreenProps = {
  draftRecords: DraftRecord[];
  selectedDraft: DraftRecord | null;
  draftFinalReviewConfirmed: boolean;
  isSendingDraft: boolean;
  draftSendPin: string;
  draftActionFeedback: ActionFeedback;
  onSelectDraft: (draftId: string) => void;
  onCopyDraftReport: () => void;
  onCopyDraftEmail: () => void;
  onPrintDraftReport: () => void;
  onDraftFinalReviewChange: (confirmed: boolean) => void;
  onDraftSendPinChange: (value: string) => void;
  onSendDraftEmail: () => void;
};

export function DraftsScreen({
  draftRecords,
  selectedDraft,
  draftFinalReviewConfirmed,
  isSendingDraft,
  draftSendPin,
  draftActionFeedback,
  onSelectDraft,
  onCopyDraftReport,
  onCopyDraftEmail,
  onPrintDraftReport,
  onDraftFinalReviewChange,
  onDraftSendPinChange,
  onSendDraftEmail,
}: DraftsScreenProps) {
  return (
    <section className="stack record-review-screen drafts-review-screen">
      <div className="screen-title">
        <h1>Drafts</h1>
        <p>Saved correction packages for this browser.</p>
      </div>
      <div className="placeholder-list record-list-panel">
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
              <span>{formatPersistedReviewStatus(draft)}</span>
              <span>Photo Evidence: {resolvePhotoEvidenceStatus(draft)}</span>
              {draft.submittedBy && <span>Submitted By: {draft.submittedBy}</span>}
              <div className="action-row">
                <button className="button secondary" type="button" onClick={() => onSelectDraft(draft.draftId)}>Open Draft</button>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedDraft && (
        <article className="card record-detail-panel draft-detail-panel">
          <div className="card-header">
            <div>
              <h2>{selectedDraft.draftId}</h2>
              <p>{selectedDraft.status} · {selectedDraft.createdTimestamp}</p>
            </div>
            <span className="field-status confirmed">Saved</span>
          </div>
          {selectedDraft.submittedBy && <p className="field-help">Submitted By: {selectedDraft.submittedBy}</p>}
          <p className="field-help">{formatPersistedReviewStatus(selectedDraft)}</p>
          <p className="field-help">Photo Evidence: {resolvePhotoEvidenceStatus(selectedDraft)}</p>
          <h3>Saved Engineering Report</h3>
          <div className="preview-box">{selectedDraft.reportText}</div>
          <h3 style={{ marginTop: 14 }}>Saved Email Draft</h3>
          <div className="preview-box">{selectedDraft.emailDraftText}</div>

          <div className="action-row">
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={onCopyDraftReport}>Copy Report Draft</button>
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={onCopyDraftEmail}>Copy Email Draft</button>
            <button
              className="button secondary"
              type="button"
              disabled={!draftFinalReviewConfirmed || isSendingDraft}
              onClick={onPrintDraftReport}
            >
              Export / Print Report
            </button>
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
            Fresh final review confirmed for this action
          </label>

          <div className="form-grid" style={{ marginTop: 14 }}>
            <label>
              4-Digit Send PIN
              <input
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]*"
                type="password"
                value={draftSendPin}
                disabled={!draftFinalReviewConfirmed || isSendingDraft}
                onChange={(event) => onDraftSendPinChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter PIN"
              />
            </label>
            <p className="field-help">PIN is required only for real email sending.</p>
          </div>

          <div className="action-row">
            <button className="button danger full-width" type="button" disabled={!draftFinalReviewConfirmed || draftSendPin.length !== 4 || isSendingDraft} onClick={onSendDraftEmail}>
              {isSendingDraft ? 'Sending...' : 'Confirm Send'}
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
