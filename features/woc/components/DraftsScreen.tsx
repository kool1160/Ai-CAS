import { printCorrectionReport } from '../logic/printCorrectionReport';
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
  onDraftFinalReviewChange: (confirmed: boolean) => void;
  onDraftSendPinChange: (value: string) => void;
  onSendDraftEmail: () => void;
};

function formatEvidenceFileSize(size: number | undefined) {
  if (!size || size <= 0) return 'unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getEvidenceStatus(record: DraftRecord) {
  if (record.evidenceAttached) {
    const name = record.evidenceFileName || 'Photo evidence attached';
    const type = record.evidenceFileType || 'unknown image type';
    return `${name} · ${type} · ${formatEvidenceFileSize(record.evidenceFileSize)}`;
  }

  const attachedMatch = record.reportText.match(/Photo evidence attached:\s*(.+?)\s*\((.*?),\s*(.*?)\)\./i);
  if (attachedMatch) {
    return `${attachedMatch[1]?.trim() || 'Photo evidence attached'} · ${attachedMatch[2]?.trim() || 'unknown image type'} · ${attachedMatch[3]?.trim() || 'unknown size'}`;
  }

  return 'No photo evidence attached';
}

function hasEvidence(record: DraftRecord) {
  return Boolean(record.evidenceAttached || record.reportText.match(/Photo evidence attached:/i));
}

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
  onDraftFinalReviewChange,
  onDraftSendPinChange,
  onSendDraftEmail,
}: DraftsScreenProps) {
  const handlePrintDraftReport = () => {
    if (!selectedDraft) return;

    printCorrectionReport({
      subjectLine: selectedDraft.subjectLine,
      workOrderNumber: selectedDraft.workOrderNumber,
      partNumber: selectedDraft.partNumber,
      affectedArea: selectedDraft.affectedArea,
      correctionType: selectedDraft.correctionType,
      photoEvidenceStatus: getEvidenceStatus(selectedDraft),
      submittedBy: selectedDraft.submittedBy,
      status: selectedDraft.status,
      generatedTimestamp: selectedDraft.createdTimestamp,
      reportText: selectedDraft.reportText,
    });
  };

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
              <span>Photo Evidence: {hasEvidence(draft) ? 'Attached' : 'Not attached'}</span>
              {draft.submittedBy && <span>Submitted By: {draft.submittedBy}</span>}
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
          {selectedDraft.submittedBy && <p className="field-help">Submitted By: {selectedDraft.submittedBy}</p>}
          <p className="field-help">Photo Evidence: {getEvidenceStatus(selectedDraft)}</p>
          <h3>Saved Engineering Report</h3>
          <div className="preview-box">{selectedDraft.reportText}</div>
          <h3 style={{ marginTop: 14 }}>Saved Email Draft</h3>
          <div className="preview-box">{selectedDraft.emailDraftText}</div>

          <div className="action-row">
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={onCopyDraftReport}>Copy Report</button>
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={onCopyDraftEmail}>Copy Email Draft</button>
            <button className="button secondary" type="button" disabled={isSendingDraft} onClick={handlePrintDraftReport}>Export / Print Report</button>
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
