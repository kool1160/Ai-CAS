import { buildControlledCorrectiveActionPdfTemplate } from '../logic/controlledPdfTemplateFoundation';
import type { GeneratedCorrectionPackage, WocConfirmationState } from '../state/wocDataModel';
import type { ActionFeedback } from '../types/wocSessionTypes';
import { ControlledPdfPreviewRenderer } from './ControlledPdfPreviewRenderer';

type ReviewSendScreenProps = {
  generatedPackage: GeneratedCorrectionPackage;
  submittedBy: string;
  sendReady: boolean;
  isSending: boolean;
  sendPin: string;
  copyFeedback: ActionFeedback;
  saveFeedback: ActionFeedback;
  sendFeedback: ActionFeedback;
  confirmations: WocConfirmationState;
  onCopyReport: () => void;
  onCopyEmailDraft: () => void;
  onSaveDraft: () => void;
  onFinalReviewChange: (confirmed: boolean) => void;
  onSendPinChange: (value: string) => void;
  onSendEmail: () => void;
};

export function ReviewSendScreen({
  generatedPackage,
  submittedBy,
  sendReady,
  isSending,
  sendPin,
  copyFeedback,
  saveFeedback,
  sendFeedback,
  confirmations,
  onCopyReport,
  onCopyEmailDraft,
  onSaveDraft,
  onFinalReviewChange,
  onSendPinChange,
  onSendEmail,
}: ReviewSendScreenProps) {
  const controlledPdfPreview = generatedPackage
    ? buildControlledCorrectiveActionPdfTemplate(
        {
          correctionType: generatedPackage.subjectLine,
          workOrderNumber: generatedPackage.workOrderNumber,
          partNumber: generatedPackage.partNumber,
          partDescription: generatedPackage.partDescription,
          customerOrJob: generatedPackage.customerOrJob,
          quantityAffected: generatedPackage.quantityAffected,
          foundAtDepartment: generatedPackage.foundAtDepartment,
          suspectedFailurePoint: generatedPackage.suspectedFailurePoint,
          shortIssueDescription: generatedPackage.shortIssueDescription,
          immediateContainment: generatedPackage.immediateContainment,
          requiredCorrection: generatedPackage.requiredCorrection,
          preventionStandardWorkUpdate: generatedPackage.preventionStandardWorkUpdate,
          inspectionVerificationRequirement: generatedPackage.inspectionVerificationRequirement,
          releaseApprovalRequirement: generatedPackage.releaseApprovalRequirement,
          aiExtractedDataConfirmation: 'Pending human confirmation review',
          humanReleaseConfirmation: confirmations.finalReviewConfirmed
            ? 'Human final review confirmed'
            : 'Human final review not confirmed',
          routerWorkOrderPhotoPlaceholder: 'Router/work-order evidence placeholder',
          partDefectPhotoPlaceholder: 'Part/defect evidence placeholder',
        },
        {
          finalReviewConfirmed: confirmations.finalReviewConfirmed,
        },
      )
    : null;

  return (
    <section className="stack review-panel-screen">
      <div className="screen-title">
        <h1>Review / Draft Control</h1>
        <p>Review the editable corrective action draft. Final PDF/export release remains locked until future V4 controlled release flow is built.</p>
      </div>

      {controlledPdfPreview && <ControlledPdfPreviewRenderer template={controlledPdfPreview} />}

      <article className="card review-report-panel">
        <div className="card-header">
          <div>
            <h2>{generatedPackage ? 'Corrective Action Draft Ready' : 'Draft Not Generated'}</h2>
            <p>Review the correction package and confirm it before any future controlled release flow unlocks.</p>
          </div>
          <span className={sendReady ? 'field-status confirmed' : 'field-status'}>{sendReady ? 'Confirmed' : 'Review Required'}</span>
        </div>
        <div className="preview-box">{generatedPackage?.reportPreview ?? 'Generate a correction package before final review.'}</div>
      </article>

      <article className="card review-action-panel">
        <h2>Engineering Email Draft</h2>
        <div className="preview-box">{generatedPackage?.emailPreview ?? 'Generate a correction package before final review.'}</div>

        <div className="action-row">
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onCopyReport}>Copy Report Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onCopyEmailDraft}>Copy Email Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onSaveDraft}>Save Draft</button>
        </div>

        <div className="action-row">
          <button className="button secondary full-width" type="button" disabled>
            Future Controlled PDF / Export Flow — Not Yet Enabled
          </button>
        </div>

        {copyFeedback && (
          <p className="field-help">{copyFeedback.tone === 'success' ? 'Copied: ' : 'Copy error: '}{copyFeedback.message}</p>
        )}

        {saveFeedback && (
          <p className="field-help">{saveFeedback.tone === 'success' ? 'Saved: ' : 'Save error: '}{saveFeedback.message}</p>
        )}

        {sendFeedback && (
          <p className="field-help">{sendFeedback.tone === 'success' ? 'Send placeholder: ' : 'Send placeholder error: '}{sendFeedback.message}</p>
        )}

        <label style={{ marginTop: 14 }}>
          <input
            checked={confirmations.finalReviewConfirmed}
            disabled={!generatedPackage || isSending}
            onChange={(event) => onFinalReviewChange(event.target.checked)}
            type="checkbox"
          />
          Human final review confirmed
        </label>

        <div className="form-grid" style={{ marginTop: 14 }}>
          <label>
            4-Digit Release PIN Placeholder
            <input
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              type="password"
              value={sendPin}
              disabled
              onChange={(event) => onSendPinChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Disabled until controlled release flow"
            />
          </label>
          <p className="field-help">Direct send/export remains intentionally disabled in V4-M3C.</p>
        </div>

        <div className="action-row">
          <button className="button danger full-width" type="button" disabled onClick={onSendEmail}>
            Future Controlled Release Flow — Disabled
          </button>
        </div>

        <p className="field-help">
          Submitted By: {submittedBy}
        </p>
      </article>
    </section>
  );
}
