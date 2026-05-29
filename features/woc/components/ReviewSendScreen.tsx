import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  buildControlledCorrectiveActionPdfTemplate,
  type ControlledPdfEvidenceItem,
} from '../logic/controlledPdfTemplateFoundation';
import type {
  AiCorrectiveActionDraftSectionKey,
  StructuredCorrectiveActionDraft,
} from '../logic/aiCorrectiveActionDraftFoundation';
import type { GeneratedCorrectionPackage, WocConfirmationState } from '../state/wocDataModel';
import { loadSetupConfigFromStorage } from '../logic/setupConfigStorage';
import type { ActionFeedback } from '../types/wocSessionTypes';
import { removeUploadedRouterContextFromFinalText } from '../logic/finalOutputSanitizer';
import { ControlledPdfPreviewRenderer } from './ControlledPdfPreviewRenderer';
import {
  buildStandardCorrectiveActionEmailText,
  buildStandardCorrectiveActionReportText,
} from '../logic/standardCorrectiveActionReport';

type ReviewSendScreenProps = {
  generatedPackage: GeneratedCorrectionPackage;
  submittedBy: string;
  sendReady: boolean;
  isSending: boolean;
  saveFeedback: ActionFeedback;
  sendFeedback: ActionFeedback;
  confirmations: WocConfirmationState;
  simpleModeAiDraftRequested: boolean;
  onSimpleModeAiDraftRequestHandled: () => void;
  onSaveDraft: () => void;
  onFinalReviewChange: (confirmed: boolean) => void;
  onSendEmail: () => void;
};

type AiCorrectiveActionDraftResult = {
  status: 'draft-only-unconfirmed';
  issueSummary: string;
  correctiveActionRequired: string;
  standardWorkRequirement: string;
  responsibilityByOperation: string;
  containmentAction: string;
  inspectionVerificationRequirement: string;
  photoEvidenceReference: string;
  closeoutRequirement: string;
};

type ReviewPhotoEvidence = ControlledPdfEvidenceItem & {
  previewUrl: string;
};

const evidenceLabelOptions = [
  'Correct condition',
  'Incorrect condition',
  'Gauge / check evidence',
  'Staging evidence',
  'Other supporting evidence',
];

const aiDraftDisplaySections: Array<{ key: AiCorrectiveActionDraftSectionKey; label: string }> = [
  { key: 'issueSummary', label: 'Issue Summary' },
  { key: 'correctiveActionRequired', label: 'Corrective Action Required' },
  { key: 'standardWorkRequirement', label: 'Standard Work Requirement' },
  { key: 'responsibilityByOperation', label: 'Responsibility by Operation' },
  { key: 'containmentAction', label: 'Containment Action' },
  { key: 'inspectionVerificationRequirement', label: 'Inspection / Verification Requirement' },
  { key: 'photoEvidenceReference', label: 'Photo Evidence Reference' },
  { key: 'closeoutRequirement', label: 'Closeout Requirement' },
];

function formatSectionLabel(section: string) {
  return section
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase())
    .trim();
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function extractPreviewLine(text: string | undefined, label: string) {
  const lines = text?.split('\n') ?? [];
  const line = lines.find((entry) => entry.trim().startsWith(`${label}:`));
  return line?.replace(`${label}:`, '').trim() || 'Not captured';
}

function formatDraftPreviewForReadability(value: string) {
  return value
    .replace(/\n(?=(Issue Summary|Corrective Action Required|Standard Work Requirement|Responsibility by Operation|Containment Action|Inspection \/ Verification Requirement|Photo Evidence Reference|Closeout Requirement):)/g, '\n\n')
    .replace(/:\n(?!\n)/g, ':\n\n');
}

function appendLine(value: string, line: string) {
  const normalized = value.trimEnd();
  return normalized ? `${normalized}\n${line}` : line;
}

function removeLastLine(value: string) {
  const lines = value.split('\n');
  if (lines.length <= 1) return '';
  return lines.slice(0, -1).join('\n');
}

function getStructuredDraftFromPayload(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return null;
  const structuredDraft = (payload as { structuredDraft?: unknown }).structuredDraft;
  if (typeof structuredDraft !== 'object' || structuredDraft === null) return null;
  return structuredDraft as StructuredCorrectiveActionDraft;
}

function getPdfEvidenceItems(photoEvidenceItems: ReviewPhotoEvidence[]): ControlledPdfEvidenceItem[] {
  return photoEvidenceItems.map(({ previewUrl, ...item }) => item);
}

function sanitizeFilenameSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('PDF attachment could not be prepared.'));
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}


function getReviewAffectedProcess(input: { affectedArea?: string; foundAtDepartment?: string; affectedOperationEquipment?: string }) {
  const department = input.foundAtDepartment?.trim() || input.affectedArea?.trim() || '';
  const operationEquipment = input.affectedOperationEquipment?.trim() || (department === 'Welding' ? 'Welding' : 'Operation needs confirmation');

  if (!department) return operationEquipment === 'Operation needs confirmation' ? 'Affected operation not confirmed' : operationEquipment;
  if (!operationEquipment || operationEquipment === 'Operation needs confirmation') return `${department} — Operation needs confirmation`;
  if (department === operationEquipment) return operationEquipment;

  return `${department} — ${operationEquipment}`;
}


function sanitizeReviewText(
  input: { operationNumber?: string; routerStepOperation?: string; affectedOperationEquipment?: string },
  value: string,
) {
  return removeUploadedRouterContextFromFinalText(value, {
    operationNumber: input.operationNumber,
    routerStepOperation: input.routerStepOperation,
    affectedOperationEquipment: input.affectedOperationEquipment,
  });
}

function sanitizeStructuredDraftForFinalOutput(
  input: { operationNumber?: string; routerStepOperation?: string; affectedOperationEquipment?: string },
  draft: StructuredCorrectiveActionDraft | null,
) {
  if (!draft) return null;

  return {
    ...draft,
    sections: Object.fromEntries(
      Object.entries(draft.sections).map(([key, section]) => [
        key,
        {
          ...section,
          draftText: sanitizeReviewText(input, section.draftText),
          sourceContext: sanitizeReviewText(input, section.sourceContext),
          requiresHumanReview: true,
        },
      ]),
    ) as StructuredCorrectiveActionDraft['sections'],
  };
}

function buildSafePdfFilename(generatedPackage: GeneratedCorrectionPackage) {
  const workOrder = sanitizeFilenameSegment(
    generatedPackage?.aiDraftFoundation.input.workOrderNumber || extractPreviewLine(generatedPackage?.reportPreview, 'Work Order'),
  );
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const suffix = workOrder && workOrder !== 'not-captured' ? workOrder : fallbackDate;

  return `ai-cas-corrective-action-${suffix}.pdf`;
}

function DraftSectionCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="placeholder-item">
      <strong>{label}</strong>
      <span>{value || `[Manual review needed: ${label}]`}</span>
    </div>
  );
}

export function ReviewSendScreen({
  generatedPackage,
  submittedBy,
  sendReady,
  isSending,
  saveFeedback,
  sendFeedback,
  confirmations,
  simpleModeAiDraftRequested,
  onSimpleModeAiDraftRequestHandled,
  onSaveDraft,
  onFinalReviewChange,
  onSendEmail,
}: ReviewSendScreenProps) {
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [aiDraftFeedback, setAiDraftFeedback] = useState<ActionFeedback>(null);
  const [aiCorrectiveActionDraft, setAiCorrectiveActionDraft] = useState<AiCorrectiveActionDraftResult | null>(null);
  const [structuredDraft, setStructuredDraft] = useState<StructuredCorrectiveActionDraft | null>(null);
  const [photoEvidenceItems, setPhotoEvidenceItems] = useState<ReviewPhotoEvidence[]>([]);
  const [photoEvidenceFeedback, setPhotoEvidenceFeedback] = useState<ActionFeedback>(null);
  const [reviewOutputFeedback, setReviewOutputFeedback] = useState<ActionFeedback>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingEmailWithPdf, setIsSendingEmailWithPdf] = useState(false);
  const aiDraftFoundation = generatedPackage?.aiDraftFoundation ?? null;
  const standardReportInput = useMemo(() => {
    if (!generatedPackage) return null;

    return {
      ...generatedPackage.aiDraftFoundation.input,
      correctionType: generatedPackage.aiDraftFoundation.input.correctionType,
      submittedBy,
      dateCaptured: generatedPackage.generatedAt,
      structuredDraft,
      evidenceItems: getPdfEvidenceItems(photoEvidenceItems),
      finalReviewConfirmed: confirmations.finalReviewConfirmed,
    };
  }, [confirmations.finalReviewConfirmed, generatedPackage, photoEvidenceItems, structuredDraft, submittedBy]);

  const enhancedReportPreview = useMemo(
    () => (standardReportInput ? buildStandardCorrectiveActionReportText(standardReportInput) : 'Generate a correction package before final review.'),
    [standardReportInput],
  );
  const enhancedEmailPreview = useMemo(
    () => (standardReportInput ? buildStandardCorrectiveActionEmailText(standardReportInput) : 'Generate a correction package before final review.'),
    [standardReportInput],
  );
  const readableDraftPreview = useMemo(
    () => formatDraftPreviewForReadability(enhancedReportPreview),
    [enhancedReportPreview],
  );
  const controlledPdfPreview = standardReportInput
    ? buildControlledCorrectiveActionPdfTemplate(
        {
          ...standardReportInput,
          aiExtractedDataConfirmation: 'Pending human confirmation review',
          humanReleaseConfirmation: confirmations.finalReviewConfirmed
            ? 'Human final review confirmed'
            : 'Human final review not confirmed',
        },
        {
          finalReviewConfirmed: confirmations.finalReviewConfirmed,
        },
      )
    : null;

  useEffect(() => {
    return () => {
      photoEvidenceItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [photoEvidenceItems]);

  const generateControlledPdfBlob = async () => {
    if (!controlledPdfPreview) {
      throw new Error('Generate a correction package before creating the controlled PDF.');
    }

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: controlledPdfPreview,
        confirmations: {
          finalReviewConfirmed: confirmations.finalReviewConfirmed,
        },
      }),
    });

    if (!response.ok) {
      let message = 'Controlled PDF generation failed. Confirm review and try again.';

      try {
        const payload = await response.json();
        if (typeof payload?.error === 'string') message = payload.error;
      } catch {
        // Binary response parsing is unavailable for failed non-JSON responses.
      }

      throw new Error(message);
    }

    return response.blob();
  };

  const downloadControlledPdf = async () => {
    if (!generatedPackage || !controlledPdfPreview) {
      setReviewOutputFeedback({ tone: 'error', message: 'Generate a correction package before downloading the controlled PDF.' });
      return;
    }

    if (!confirmations.finalReviewConfirmed) {
      setReviewOutputFeedback({ tone: 'error', message: 'Human final review must be confirmed before downloading the controlled PDF.' });
      return;
    }

    setIsDownloadingPdf(true);
    setReviewOutputFeedback({ tone: 'success', message: 'Generating controlled PDF download...' });

    let downloadUrl: string | null = null;

    try {
      const pdfBlob = await generateControlledPdfBlob();
      downloadUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = buildSafePdfFilename(generatedPackage);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      setReviewOutputFeedback({ tone: 'success', message: 'Controlled PDF downloaded. Email send remains gated by generated package and final human review confirmation.' });
    } catch (error) {
      setReviewOutputFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Controlled PDF request could not be completed. Try again from Review.',
      });
    } finally {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setIsDownloadingPdf(false);
    }
  };

  const sendControlledEmailWithPdf = async () => {
    if (!generatedPackage || !controlledPdfPreview) {
      setReviewOutputFeedback({ tone: 'error', message: 'Generate a correction package before sending email with PDF.' });
      return;
    }

    if (!confirmations.finalReviewConfirmed || !sendReady) {
      setReviewOutputFeedback({ tone: 'error', message: 'Human final review must be confirmed before sending email with PDF.' });
      return;
    }

    setIsSendingEmailWithPdf(true);
    setReviewOutputFeedback({ tone: 'success', message: 'Generating controlled PDF attachment for email...' });

    try {
      const pdfBlob = await generateControlledPdfBlob();
      const pdfBase64 = await blobToBase64(pdfBlob);
      const pdfFileName = buildSafePdfFilename(generatedPackage);
      const input = generatedPackage.aiDraftFoundation.input;
      const setupConfig = loadSetupConfigFromStorage();

      setReviewOutputFeedback({ tone: 'success', message: 'Sending reviewed email with controlled PDF attachment...' });

      const response = await fetch('/api/send-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectLine: generatedPackage.subjectLine,
          reportText: enhancedReportPreview,
          emailDraftText: enhancedEmailPreview,
          workOrderNumber: input.workOrderNumber,
          partNumber: input.partNumber,
          affectedArea: getReviewAffectedProcess(input),
          affectedOperationEquipment: input.affectedOperationEquipment,
          correctionType: input.correctionType,
          recipientEmail: setupConfig.engineeringRecipientEmail,
          senderDisplayName: setupConfig.senderDisplayName,
          submittedByName: submittedBy,
          companyName: setupConfig.companyName,
          pdfBase64,
          pdfFileName,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Email send with PDF failed. Copy and save controls remain available.';
        setReviewOutputFeedback({ tone: 'error', message });
        return;
      }

      const recipient = typeof payload?.recipient === 'string' ? payload.recipient : 'configured recipient';
      const resendId = typeof payload?.resendId === 'string' ? payload.resendId : null;
      setReviewOutputFeedback({
        tone: 'success',
        message: `Reviewed email with controlled PDF sent to ${recipient}.${resendId ? ` Resend ID: ${resendId}` : ''}`,
      });
    } catch (error) {
      setReviewOutputFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Email with PDF could not be completed. Copy and save controls remain available.',
      });
    } finally {
      setIsSendingEmailWithPdf(false);
    }
  };

  const copyEnhancedOutput = async (text: string, label: string) => {
    if (!generatedPackage) {
      setReviewOutputFeedback({ tone: 'error', message: `Generate a correction package before copying the ${label}.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setReviewOutputFeedback({ tone: 'success', message: `${label} copied with active Review evidence metadata.` });
    } catch {
      setReviewOutputFeedback({ tone: 'error', message: `${label} could not be copied. Use manual selection as fallback.` });
    }
  };

  const generateAiCorrectiveActionDraft = async () => {
    if (!aiDraftFoundation) {
      setAiDraftFeedback({
        tone: 'error',
        message: 'AI draft could not start because the correction package is missing. Manual review and editing remain available.',
      });
      return;
    }

    setIsGeneratingAiDraft(true);
    setAiDraftFeedback({ tone: 'success', message: 'Requesting AI corrective-action draft...' });
    setAiCorrectiveActionDraft(null);
    setStructuredDraft(null);

    try {
      const response = await fetch('/api/draft-corrective-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiDraftFoundation }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'AI draft failed. Manual drafting and editing remain available.';
        setAiDraftFeedback({ tone: 'error', message });
        return;
      }

      setStructuredDraft(sanitizeStructuredDraftForFinalOutput(aiDraftFoundation.input, getStructuredDraftFromPayload(payload)));
      setAiCorrectiveActionDraft(payload.draft as AiCorrectiveActionDraftResult);
      setAiDraftFeedback({ tone: 'success', message: 'AI corrective-action draft generated. Review and edit before any future release/PDF.' });
    } catch {
      setAiDraftFeedback({
        tone: 'error',
        message: 'AI draft request could not be completed. Manual drafting and editing remain available.',
      });
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  useEffect(() => {
    if (!simpleModeAiDraftRequested || !generatedPackage || !aiDraftFoundation) return;

    onSimpleModeAiDraftRequestHandled();
    void generateAiCorrectiveActionDraft();
  }, [simpleModeAiDraftRequested, generatedPackage, aiDraftFoundation, onSimpleModeAiDraftRequestHandled]);

  const updateStructuredSectionText = (sectionKey: AiCorrectiveActionDraftSectionKey, draftText: string) => {
    setStructuredDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        sections: {
          ...current.sections,
          [sectionKey]: {
            ...current.sections[sectionKey],
            draftText,
            requiresHumanReview: true,
          },
        },
      };
    });
  };

  const addRowToSection = (sectionKey: AiCorrectiveActionDraftSectionKey) => {
    setStructuredDraft((current) => {
      if (!current) return current;
      const section = current.sections[sectionKey];

      return {
        ...current,
        sections: {
          ...current.sections,
          [sectionKey]: {
            ...section,
            draftText: appendLine(section.draftText, 'New row: '),
            requiresHumanReview: true,
          },
        },
      };
    });
  };

  const addBulletToSection = (sectionKey: AiCorrectiveActionDraftSectionKey) => {
    setStructuredDraft((current) => {
      if (!current) return current;
      const section = current.sections[sectionKey];

      return {
        ...current,
        sections: {
          ...current.sections,
          [sectionKey]: {
            ...section,
            draftText: appendLine(section.draftText, '• '),
            requiresHumanReview: true,
          },
        },
      };
    });
  };

  const removeLastEntryFromSection = (sectionKey: AiCorrectiveActionDraftSectionKey) => {
    setStructuredDraft((current) => {
      if (!current) return current;
      const section = current.sections[sectionKey];

      return {
        ...current,
        sections: {
          ...current.sections,
          [sectionKey]: {
            ...section,
            draftText: removeLastLine(section.draftText),
            requiresHumanReview: true,
          },
        },
      };
    });
  };

  const addPhotoEvidence = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file) {
      setPhotoEvidenceFeedback({ tone: 'error', message: 'No photo evidence selected.' });
      return;
    }

    if (photoEvidenceItems.length >= 3) {
      setPhotoEvidenceFeedback({ tone: 'error', message: 'Limit reached. Review evidence supports up to 3 photos for now.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoEvidenceFeedback({ tone: 'error', message: 'Evidence upload must be an image file.' });
      return;
    }

    const nextItem: ReviewPhotoEvidence = {
      id: `review-evidence-${Date.now()}-${photoEvidenceItems.length + 1}`,
      label: '',
      caption: '',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      previewUrl: URL.createObjectURL(file),
    };

    setPhotoEvidenceItems((current) => [...current, nextItem].slice(0, 3));
    setPhotoEvidenceFeedback({ tone: 'success', message: `${file.name} added as Review-step evidence. Stored locally in this session only.` });
    setReviewOutputFeedback(null);
  };

  const updatePhotoEvidence = (id: string, update: Partial<Pick<ReviewPhotoEvidence, 'label' | 'caption'>>) => {
    setPhotoEvidenceItems((current) => current.map((item) => (item.id === id ? { ...item, ...update } : item)));
    setReviewOutputFeedback(null);
  };

  const removePhotoEvidence = (id: string) => {
    setPhotoEvidenceItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
    setPhotoEvidenceFeedback({ tone: 'success', message: 'Review-step evidence photo removed.' });
    setReviewOutputFeedback(null);
  };

  const jobContextPreview = enhancedReportPreview;
  return (
    <section className="stack review-panel-screen">
      <div className="screen-title">
        <h1>Review Corrective Action</h1>
        <p>Review the AI-generated corrective action draft before release.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">JOB CONTEXT</span>
            <h2>Confirmed Job Context</h2>
            <p>Captured router/job details used to draft this corrective action.</p>
          </div>
        </div>
        <div className="placeholder-list">
          <DraftSectionCard label="Work Order" value={extractPreviewLine(jobContextPreview, 'Work Order')} />
          <DraftSectionCard label="Part Number" value={extractPreviewLine(jobContextPreview, 'Part Number')} />
          <DraftSectionCard label="Customer / Job" value={extractPreviewLine(jobContextPreview, 'Customer / Job')} />
          <DraftSectionCard label="Affected Department / Area" value={extractPreviewLine(jobContextPreview, 'Affected Department / Area')} />
          <DraftSectionCard
            label="Affected Operation / Process"
            value={extractPreviewLine(jobContextPreview, 'Affected Operation / Process') !== 'Not captured'
              ? extractPreviewLine(jobContextPreview, 'Affected Operation / Process')
              : extractPreviewLine(jobContextPreview, 'Affected Operation / Equipment')}
          />
          <DraftSectionCard label="Quantity" value={extractPreviewLine(jobContextPreview, 'Quantity')} />
        </div>
      </article>

      <article className="card review-report-panel">
        <div className="card-header review-badge-header">
          <div>
            <div className="review-badge-row" aria-label="Corrective action draft review status">
              <span className="step-pill">AI-GENERATED DRAFT</span>
              <span className={confirmations.finalReviewConfirmed ? 'field-status confirmed' : 'field-status'}>
                {confirmations.finalReviewConfirmed ? 'Reviewed' : 'Review Required'}
              </span>
            </div>
            <h2>{generatedPackage ? 'Corrective Action Draft' : 'Draft Not Generated'}</h2>
            <p>Simple Mode AI draft language is shown here for human review. Advanced editing tools remain collapsed and optional.</p>
          </div>
        </div>

        {aiDraftFeedback && (
          <p className="field-help">
            {aiDraftFeedback.tone === 'success' ? 'AI Draft: ' : 'AI Draft error: '}{aiDraftFeedback.message}
          </p>
        )}

        {isGeneratingAiDraft && <p className="field-help">AI-CAS is drafting corrective-action language from the Simple Mode issue description and confirmed job context...</p>}

        <div className="preview-box">{readableDraftPreview}</div>
      </article>

      <article className="card review-photo-evidence-panel">
        <div className="card-header review-badge-header">
          <div>
            <div className="review-badge-row" aria-label="Review evidence status">
              <span className="step-pill">EVIDENCE SUMMARY</span>
              <span className="field-status">{photoEvidenceItems.length}/3</span>
            </div>
            <h2>Evidence</h2>
            <p>Attached evidence remains local/session-only. Export, print, email, and PDF image release are not enabled.</p>
          </div>
        </div>

        <div className="action-row" style={{ marginTop: 14 }}>
          <label className="button secondary" htmlFor="review-evidence-upload-input">Add Evidence Photo</label>
          <input accept="image/*" hidden id="review-evidence-upload-input" onChange={addPhotoEvidence} type="file" />
        </div>

        {photoEvidenceFeedback && (
          <p className="field-help">{photoEvidenceFeedback.tone === 'success' ? 'Evidence: ' : 'Evidence error: '}{photoEvidenceFeedback.message}</p>
        )}

        {photoEvidenceItems.length > 0 ? (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {photoEvidenceItems.map((item, index) => (
              <div className="placeholder-item" key={item.id}>
                <strong>Evidence {index + 1}: {item.label || 'Label needed'}</strong>
                <span>{item.fileName} · {formatFileSize(item.fileSize)} · {item.caption || 'No caption entered'}</span>
                <img alt={`Review evidence ${index + 1}`} className="upload-preview" src={item.previewUrl} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
        ) : (
          <p className="field-help">No Review-step evidence photos attached.</p>
        )}
      </article>

      <article className="card review-action-panel">
        <div className="card-header review-badge-header">
          <div>
            <div className="review-badge-row" aria-label="Human confirmation status">
              <span className={sendReady ? 'field-status confirmed' : 'field-status'}>{sendReady ? 'Confirmed' : 'Review Required'}</span>
            </div>
            <h2>Human Confirmation</h2>
            <p>Confirm review, then copy, save, download PDF, or send a reviewed email with a controlled PDF attachment.</p>
          </div>
        </div>

        <label>
          <input
            checked={confirmations.finalReviewConfirmed}
            disabled={!generatedPackage || isSending}
            onChange={(event) => onFinalReviewChange(event.target.checked)}
            type="checkbox"
          />
          Human final review confirmed
        </label>

        <div className="action-row" style={{ marginTop: 14 }}>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={() => copyEnhancedOutput(enhancedReportPreview, 'Engineering report draft')}>Copy Report Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={() => copyEnhancedOutput(enhancedEmailPreview, 'Email draft')}>Copy Email Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onSaveDraft}>Save Draft</button>
          {confirmations.finalReviewConfirmed && (
            <button
              className="button primary"
              type="button"
              disabled={!generatedPackage || isSending || isDownloadingPdf || isSendingEmailWithPdf}
              onClick={downloadControlledPdf}
            >
              {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button>
          )}
        </div>

        <p className="field-help">Email send remains gated by generated package and final human review confirmation. Photo images are not attached.</p>

        <div className="action-row">
          <button
            className="button danger full-width"
            type="button"
            disabled={!generatedPackage || !sendReady || isSending || isDownloadingPdf || isSendingEmailWithPdf}
            onClick={sendControlledEmailWithPdf}
          >
            {isSendingEmailWithPdf ? 'Sending Reviewed Email with PDF...' : 'Send Reviewed Email with PDF'}
          </button>
        </div>

        {reviewOutputFeedback && (
          <p className="field-help">{reviewOutputFeedback.tone === 'success' ? 'Review output: ' : 'Review output error: '}{reviewOutputFeedback.message}</p>
        )}
        {saveFeedback && <p className="field-help">{saveFeedback.tone === 'success' ? 'Saved: ' : 'Save error: '}{saveFeedback.message}</p>}
        {sendFeedback && <p className="field-help">{sendFeedback.tone === 'success' ? 'Send status: ' : 'Send error: '}{sendFeedback.message}</p>}

        <p className="field-help">Submitted By: {submittedBy}</p>
      </article>

      <details className="card">
        <summary>
          <strong>Advanced Editing / Evidence Tools</strong>
          <p className="field-help">AI drafting inputs, photo labeling, row/bullet controls, and raw preview stay available but collapsed.</p>
        </summary>

        <div className="action-row" style={{ marginTop: 14 }}>
          <button className="button primary" type="button" disabled={isGeneratingAiDraft || !generatedPackage || !aiDraftFoundation} onClick={generateAiCorrectiveActionDraft}>
            {isGeneratingAiDraft ? 'Generating AI Corrective Action Draft...' : structuredDraft ? 'Regenerate AI Corrective Action Draft' : 'Generate AI Corrective Action Draft'}
          </button>
        </div>

        {aiDraftFeedback && <p className="field-help">{aiDraftFeedback.tone === 'success' ? 'AI Draft: ' : 'AI Draft error: '}{aiDraftFeedback.message}</p>}

        {photoEvidenceItems.length > 0 && (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {photoEvidenceItems.map((item, index) => (
              <div className="placeholder-item" key={item.id}>
                <strong>Evidence Photo {index + 1}</strong>
                <span>{item.fileName} · {formatFileSize(item.fileSize)}</span>
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <label>
                    Evidence Label
                    <select value={item.label} onChange={(event) => updatePhotoEvidence(item.id, { label: event.target.value })}>
                      <option value="">Select evidence context</option>
                      {evidenceLabelOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Caption / Note
                    <textarea
                      value={item.caption}
                      onChange={(event) => updatePhotoEvidence(item.id, { caption: event.target.value })}
                      placeholder="Describe what this photo proves or supports."
                    />
                  </label>
                </div>
                <div className="action-row">
                  <button className="button secondary" type="button" onClick={() => removePhotoEvidence(item.id)}>Remove Photo</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {aiDraftFoundation && (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            <DraftSectionCard label="Short Issue Description" value={aiDraftFoundation.input.shortIssueDescription || ''} />
            <DraftSectionCard label="Evidence Label" value={photoEvidenceItems.map((item) => item.label || '[Unlabeled Review evidence]').join(', ') || aiDraftFoundation.input.evidenceLabel || ''} />
            <DraftSectionCard label="Photo Evidence Attached" value={photoEvidenceItems.length > 0 ? `Yes — ${photoEvidenceItems.length} Review-step photo(s)` : aiDraftFoundation.input.photoEvidenceAttached ? 'Yes — Capture evidence present' : 'No'} />
          </div>
        )}

        {structuredDraft && (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {aiDraftDisplaySections.map((section) => {
              const structuredSection = structuredDraft.sections[section.key];
              return (
                <div className="placeholder-item" key={section.key}>
                  <strong>{structuredSection?.title || section.label}</strong>
                  <span>{structuredSection?.sourceContext || 'Source context pending human review.'}</span>
                  <textarea
                    value={structuredSection?.draftText ?? ''}
                    onChange={(event) => updateStructuredSectionText(section.key, event.target.value)}
                    placeholder={`Enter ${section.label.toLowerCase()} draft text`}
                    style={{ marginTop: 10 }}
                  />
                  <div className="action-row">
                    <button className="button secondary" type="button" onClick={() => addRowToSection(section.key)}>Add Row</button>
                    <button className="button secondary" type="button" onClick={() => addBulletToSection(section.key)}>Add Bullet</button>
                    <button className="button secondary" type="button" onClick={() => removeLastEntryFromSection(section.key)}>Remove Last</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <details style={{ marginTop: 14 }}>
          <summary><strong>Raw Email Draft Preview</strong></summary>
          <div className="preview-box" style={{ marginTop: 10 }}>{enhancedEmailPreview}</div>
        </details>

        <details style={{ marginTop: 14 }}>
          <summary><strong>Controlled PDF Preview Foundation</strong></summary>
          {controlledPdfPreview && <ControlledPdfPreviewRenderer template={controlledPdfPreview} />}
        </details>

        <div className="action-row">
          <button className="button danger full-width" type="button" disabled onClick={onSendEmail}>
            Legacy Text-Only Send Control — Disabled
          </button>
        </div>
      </details>
    </section>
  );
}
