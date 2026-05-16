# AI-CAS V6 — Claude Audit File Bundle

This text-only bundle contains the full contents of the requested V6 audit files. Each file is presented under its own heading and fenced code block so the audit can proceed without binary ZIP artifacts.

Runtime code, PDF/email logic, review gates, Send PIN gates, and mobile behavior are not changed by this documentation bundle.

## File Index

- `audit-packages/claude-v6-closeout/CLAUDE_AUDIT_HANDOFF.md`
- `features/woc/components/ReviewSendScreen.tsx`
- `features/woc/components/ControlledPdfPreviewRenderer.tsx`
- `features/woc/components/pdf/CorrectiveActionPdfDocument.tsx`
- `features/woc/logic/controlledPdfTemplateFoundation.ts`
- `features/woc/logic/setupConfigStorage.ts`
- `features/woc/state/wocDataModel.ts`
- `features/woc/types/wocSessionTypes.ts`
- `app/api/generate-pdf/route.ts`
- `app/api/send-correction/route.ts`
- `app/print-report/page.tsx`
- `app/globals.css`
- `package.json`
- `docs/v6/V6-M6_PDF_EMAIL_CLOSEOUT_SOURCE_OF_TRUTH.md`

## `audit-packages/claude-v6-closeout/CLAUDE_AUDIT_HANDOFF.md`

````````markdown
# AI-CAS V6 — CLAUDE AUDIT HANDOFF

Mode:
Audit only. Do not implement.

Project:
AI-CAS — Corrective Action System

Branch:
feature/v4-m13-structured-corrective-action

Version:
V6

Goal:
Independently audit the completed V6 PDF/email/mobile review flow before final closeout.

Core Product Rule:
AI Vision reads the router.
The operator states the exception.
AI-CAS writes the corrective action.

V6 Scope to Verify:
- AI-CAS branding only
- Controlled server-side PDF generation
- Controlled PDF download from Review
- Email with controlled PDF attachment
- Human final review gate preserved
- 4-digit Send PIN gate preserved
- Evidence photos remain text-only / not embedded or attached
- Mobile badge overlap fixed
- Simple Mode flow preserved

Merged V6 PRs:
- PR #4 — Branding Patch / Print + Email Layer
- PR #5 — Server-Side PDF Generation Foundation
- PR #6 — Controlled PDF Download from Review
- PR #7 — Email With PDF Attachment Foundation
- PR #8 — Post-Merge PDF / Email Smoke Gate Fix
- PR #9 — V6 PDF / Email Closeout Source of Truth
- PR #10 — Mobile Review Badge Overlap Fix
- PR #11 — Mobile Review Badge Wrapping Hardening
- PR #12 — Mobile Review Badge Stacking Hardening

Audit Questions:
1. Does PDF generation require final human review server-side?
2. Does Review PDF download require final human review?
3. Does email with PDF require generated package, final human review, and Send PIN?
4. Are photo images kept out of PDF/email attachment?
5. Is AI-CAS branding clean with no Refab / Refab Connect / AI-WOC visible?
6. Did badge wrapping fixes solve the mobile overlap without affecting logic?
7. Was Simple Mode preserved?
8. Are there any security, gate, attachment, or runtime risks before V6 closeout?

Return:
# CLAUDE AUDIT RESULT

Result:
PASS / PASS WITH NOTES / FAIL

Verified:

Issues:

Risks:

Required Fixes:

Closeout Recommendation:

Important:
- Audit only
- Do not implement
- Do not rewrite code
- Report issues clearly if found

Required:
- Commit the audit package folder and text-only file bundle to the branch
- Open a PR
- Return the GitHub folder path and bundle path
````````

## `features/woc/components/ReviewSendScreen.tsx`

````````tsx
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

function buildReviewEvidenceSummary(photoEvidenceItems: ReviewPhotoEvidence[]) {
  if (!photoEvidenceItems.length) {
    return [
      'Photo Evidence Attached: No Review-step photo evidence attached.',
      'Photo Evidence Note: Images are local/session-only when added. Email attachments, PDF export, and print are not active.',
    ].join('\n');
  }

  return [
    `Photo Evidence Attached: Yes — ${photoEvidenceItems.length} Review-step photo(s).`,
    'Photo Evidence Boundary: Images are local/session-only previews. Images are not attached to email, exported to PDF, printed, or released.',
    ...photoEvidenceItems.map((item, index) => [
      `Evidence ${index + 1}:`,
      `- File Name: ${item.fileName || '[No file name available]'}`,
      `- Evidence Label: ${item.label || '[Manual review needed: Evidence Label]'}`,
      `- Caption / Note: ${item.caption || '[Manual review needed: Caption / Note]'}`,
      `- File Type: ${item.fileType || 'Unknown type'}`,
      `- File Size: ${formatFileSize(item.fileSize)}`,
    ].join('\n')),
  ].join('\n');
}

function appendReviewEvidenceToOutput(baseText: string | undefined, photoEvidenceItems: ReviewPhotoEvidence[], outputType: 'report' | 'email') {
  const base = baseText?.trim() || 'Generate a correction package before final review.';
  const heading = outputType === 'email' ? 'Review Photo Evidence Context' : 'Review Photo Evidence Metadata';

  return `${base}\n\n${heading}\n${buildReviewEvidenceSummary(photoEvidenceItems)}`;
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
  sendPin,
  copyFeedback,
  saveFeedback,
  sendFeedback,
  confirmations,
  onSaveDraft,
  onFinalReviewChange,
  onSendPinChange,
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
  const enhancedReportPreview = useMemo(
    () => appendReviewEvidenceToOutput(generatedPackage?.reportPreview, photoEvidenceItems, 'report'),
    [generatedPackage?.reportPreview, photoEvidenceItems],
  );
  const enhancedEmailPreview = useMemo(
    () => appendReviewEvidenceToOutput(generatedPackage?.emailPreview, photoEvidenceItems, 'email'),
    [generatedPackage?.emailPreview, photoEvidenceItems],
  );
  const controlledPdfPreview = generatedPackage
    ? buildControlledCorrectiveActionPdfTemplate(
        {
          ...generatedPackage.aiDraftFoundation.input,
          correctionType: generatedPackage.subjectLine,
          shortIssueDescription: enhancedReportPreview,
          requiredCorrection: enhancedEmailPreview,
          aiExtractedDataConfirmation: 'Pending human confirmation review',
          humanReleaseConfirmation: confirmations.finalReviewConfirmed
            ? 'Human final review confirmed'
            : 'Human final review not confirmed',
          routerWorkOrderPhotoPlaceholder: 'Router/work-order evidence placeholder',
          partDefectPhotoPlaceholder: 'Part/defect evidence placeholder',
          structuredDraft,
          evidenceItems: getPdfEvidenceItems(photoEvidenceItems),
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

      setReviewOutputFeedback({ tone: 'success', message: 'Controlled PDF downloaded. Email with PDF remains gated by final review and Send PIN.' });
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

    if (sendPin.length !== 4) {
      setReviewOutputFeedback({ tone: 'error', message: 'Enter the 4-digit Send PIN before sending email with PDF.' });
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
          affectedArea: input.foundAtDepartment,
          correctionType: generatedPackage.subjectLine,
          sendPin,
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
      onSendPinChange('');
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
      setAiDraftFeedback({ tone: 'error', message: 'Generate a correction package before requesting an AI draft.' });
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
        const message = typeof payload?.error === 'string' ? payload.error : 'AI draft failed. Manual drafting remains available.';
        setAiDraftFeedback({ tone: 'error', message });
        return;
      }

      setStructuredDraft(getStructuredDraftFromPayload(payload));
      setAiCorrectiveActionDraft(payload.draft as AiCorrectiveActionDraftResult);
      setAiDraftFeedback({ tone: 'success', message: 'AI corrective-action draft generated. Review and edit before any future release/PDF.' });
    } catch {
      setAiDraftFeedback({ tone: 'error', message: 'AI draft request could not be completed. Manual drafting remains available.' });
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

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

  const jobContextPreview = generatedPackage?.reportPreview;
  const displayedStructuredDraft = structuredDraft;

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
          <DraftSectionCard label="Customer / Job" value={extractPreviewLine(jobContextPreview, 'Customer / Job Name')} />
          <DraftSectionCard label="Router Step / Operation" value={extractPreviewLine(jobContextPreview, 'Router Step / Operation')} />
          <DraftSectionCard label="Quantity" value={extractPreviewLine(jobContextPreview, 'Quantity Affected')} />
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
            <p>Generated draft language for review. Advanced editing tools are available below if needed.</p>
          </div>
        </div>

        {displayedStructuredDraft ? (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {aiDraftDisplaySections.map((section) => {
              const structuredSection = displayedStructuredDraft.sections[section.key];
              return (
                <DraftSectionCard
                  key={section.key}
                  label={structuredSection?.title || section.label}
                  value={structuredSection?.draftText || ''}
                />
              );
            })}
          </div>
        ) : aiCorrectiveActionDraft ? (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {aiDraftDisplaySections.map((section) => (
              <DraftSectionCard key={section.key} label={section.label} value={aiCorrectiveActionDraft[section.key] || ''} />
            ))}
          </div>
        ) : (
          <div className="preview-box">{enhancedReportPreview}</div>
        )}
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

        <div className="form-grid" style={{ marginTop: 14 }}>
          <label>
            4-Digit Send PIN
            <input
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              type="password"
              value={sendPin}
              disabled={!generatedPackage || !confirmations.finalReviewConfirmed || isSending || isSendingEmailWithPdf}
              onChange={(event) => onSendPinChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter Send PIN"
            />
          </label>
          <p className="field-help">PDF email send remains gated by generated package, final human review, and the configured Send PIN. Photo images are not attached.</p>
        </div>

        <div className="action-row">
          <button
            className="button danger full-width"
            type="button"
            disabled={!generatedPackage || !sendReady || sendPin.length !== 4 || isSending || isDownloadingPdf || isSendingEmailWithPdf}
            onClick={sendControlledEmailWithPdf}
          >
            {isSendingEmailWithPdf ? 'Sending Reviewed Email With PDF...' : 'Send Reviewed Email With PDF'}
          </button>
        </div>

        {reviewOutputFeedback && (
          <p className="field-help">{reviewOutputFeedback.tone === 'success' ? 'Review output: ' : 'Review output error: '}{reviewOutputFeedback.message}</p>
        )}
        {copyFeedback && <p className="field-help">{copyFeedback.tone === 'success' ? 'Copied: ' : 'Copy error: '}{copyFeedback.message}</p>}
        {saveFeedback && <p className="field-help">{saveFeedback.tone === 'success' ? 'Saved: ' : 'Save error: '}{saveFeedback.message}</p>}
        {sendFeedback && <p className="field-help">{sendFeedback.tone === 'success' ? 'Send placeholder: ' : 'Send placeholder error: '}{sendFeedback.message}</p>}

        <p className="field-help">Submitted By: {submittedBy}</p>
      </article>

      <details className="card">
        <summary>
          <strong>Advanced Editing / Evidence Tools</strong>
          <p className="field-help">AI drafting inputs, photo labeling, row/bullet controls, raw preview, and release placeholders stay available but collapsed.</p>
        </summary>

        <div className="action-row" style={{ marginTop: 14 }}>
          <label className="button secondary" htmlFor="review-evidence-upload-input">Add Evidence Photo</label>
          <input accept="image/*" hidden id="review-evidence-upload-input" onChange={addPhotoEvidence} type="file" />
          <button className="button primary" type="button" disabled={isGeneratingAiDraft || !generatedPackage || !aiDraftFoundation} onClick={generateAiCorrectiveActionDraft}>
            {isGeneratingAiDraft ? 'Generating AI Corrective Action Draft...' : structuredDraft ? 'Regenerate AI Corrective Action Draft' : 'Generate AI Corrective Action Draft'}
          </button>
        </div>

        {photoEvidenceFeedback && (
          <p className="field-help">{photoEvidenceFeedback.tone === 'success' ? 'Evidence: ' : 'Evidence error: '}{photoEvidenceFeedback.message}</p>
        )}
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
              placeholder="Use active Send PIN field above"
            />
          </label>
          <p className="field-help">Advanced placeholder retained for compatibility. Use the active gated Send PIN field above.</p>
        </div>

        <div className="action-row">
          <button className="button danger full-width" type="button" disabled onClick={onSendEmail}>
            Legacy Text-Only Send Control — Disabled
          </button>
        </div>
      </details>
    </section>
  );
}
````````

## `features/woc/components/ControlledPdfPreviewRenderer.tsx`

````````tsx
import type { ControlledCorrectiveActionPdfTemplate } from '../logic/controlledPdfTemplateFoundation';

type ControlledPdfPreviewRendererProps = {
  template: ControlledCorrectiveActionPdfTemplate;
};

function getSectionClass(layoutHint: string) {
  if (layoutHint === 'header') return 'controlled-pdf-preview-section controlled-pdf-preview-header';
  if (layoutHint === 'photo-evidence-grid') return 'controlled-pdf-preview-section controlled-pdf-preview-evidence';
  if (layoutHint === 'approval-status') return 'controlled-pdf-preview-section controlled-pdf-preview-approval';
  return 'controlled-pdf-preview-section';
}

export function ControlledPdfPreviewRenderer({ template }: ControlledPdfPreviewRendererProps) {
  return (
    <article className="card controlled-pdf-preview">
      <div className="card-header review-badge-header">
        <div>
          <div className="review-badge-row" aria-label="Controlled PDF preview status">
            <span className="step-pill">PDF PREVIEW · DRAFT ONLY</span>
            <span className="field-status">Unreleased</span>
          </div>
          <h2>{template.templateName}</h2>
          <p>{template.modelSource} · {template.templateVersion}</p>
        </div>
      </div>

      <div className="preview-box">
        <strong>Controlled Preview Status</strong>
        <p>{template.releaseGate}</p>
        <p>No download, print, send, or release behavior is enabled from this preview.</p>
      </div>

      <div className="stack" style={{ marginTop: 16 }}>
        {template.sections.map((section) => (
          <section className={getSectionClass(section.layoutHint)} key={section.sectionId}>
            <div className="card-header">
              <div>
                <h3>{section.title}</h3>
                <p>{section.layoutHint}</p>
              </div>
            </div>
            <div className="placeholder-list">
              {section.fields.map((field) => (
                <div className="placeholder-item" key={`${section.sectionId}-${field.label}`}>
                  <strong>{field.label}{field.required ? ' *' : ''}</strong>
                  <span>{field.value}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="field-help">
        Controlled PDF preview only. Future export must remain gated by human confirmation and an approved release milestone.
      </p>
    </article>
  );
}
````````

## `features/woc/components/pdf/CorrectiveActionPdfDocument.tsx`

````````tsx
import type {
  ControlledCorrectiveActionPdfTemplate,
  ControlledPdfTemplateField,
  ControlledPdfTemplateSection,
} from '../../logic/controlledPdfTemplateFoundation';

type CorrectiveActionPdfDocumentProps = {
  template: ControlledCorrectiveActionPdfTemplate;
};

export type CorrectiveActionPdfLine = {
  text: string;
  variant: 'title' | 'subtitle' | 'section' | 'label' | 'body' | 'gate' | 'footer';
};

const MAX_TEXT_LINE_LENGTH = 92;

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function wrapText(value: string, maxLineLength = MAX_TEXT_LINE_LENGTH) {
  const normalized = normalizeText(value);
  if (!normalized) return [''];

  return normalized.split('\n').flatMap((paragraph) => {
    const words = paragraph.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      if (candidate.length <= maxLineLength) {
        currentLine = candidate;
        return;
      }

      if (currentLine) lines.push(currentLine);
      currentLine = word;
    });

    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [''];
  });
}

function fieldLines(field: ControlledPdfTemplateField): CorrectiveActionPdfLine[] {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  const bodyLines = wrapText(field.value);

  return [
    { text: label, variant: 'label' },
    ...bodyLines.map((text) => ({ text, variant: 'body' }) satisfies CorrectiveActionPdfLine),
  ];
}

function sectionLines(section: ControlledPdfTemplateSection): CorrectiveActionPdfLine[] {
  return [
    { text: section.title, variant: 'section' },
    { text: `Layout: ${section.layoutHint}`, variant: 'subtitle' },
    ...section.fields.flatMap(fieldLines),
  ];
}

export function CorrectiveActionPdfDocument({ template }: CorrectiveActionPdfDocumentProps): CorrectiveActionPdfLine[] {
  return [
    { text: 'Controlled corrective action PDF - foundation', variant: 'subtitle' },
    { text: template.templateName, variant: 'title' },
    { text: `${template.modelSource} - ${template.templateVersion} - ${template.status}`, variant: 'subtitle' },
    { text: `Release gate: ${template.releaseGate}`, variant: 'gate' },
    ...template.sections.flatMap(sectionLines),
    {
      text: 'Text-only evidence references. No photo images are embedded. Review export/send/print UI remains unwired.',
      variant: 'footer',
    },
    ...(template.layoutNotes.length
      ? [{ text: `Foundation notes: ${template.layoutNotes.join(' ')}`, variant: 'footer' } satisfies CorrectiveActionPdfLine]
      : []),
  ];
}
````````

## `features/woc/logic/controlledPdfTemplateFoundation.ts`

````````ts
import type { StructuredCorrectiveActionDraft } from './aiCorrectiveActionDraftFoundation';

export type ControlledPdfTemplateStatus = 'foundation-only' | 'locked-until-controlled-release';

export type ControlledPdfEvidenceItem = {
  id: string;
  label: string;
  caption: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type ControlledPdfTemplateInput = {
  workOrderNumber?: string;
  partNumber?: string;
  partDescription?: string;
  customerOrJob?: string;
  quantity?: string;
  quantityAffected?: string;
  correctionType?: string;
  affectedArea?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  shortIssueDescription?: string;
  issueDetails?: string;
  immediateContainment?: string;
  requiredCorrection?: string;
  requestedEngineeringAction?: string;
  preventionStandardWorkUpdate?: string;
  inspectionVerificationRequirement?: string;
  releaseApprovalRequirement?: string;
  routerWorkOrderPhotoPlaceholder?: string;
  partDefectPhotoPlaceholder?: string;
  aiExtractedDataConfirmation?: string;
  humanReleaseConfirmation?: string;
  structuredDraft?: StructuredCorrectiveActionDraft | null;
  evidenceItems?: ControlledPdfEvidenceItem[];
};

export type ControlledPdfTemplateConfirmationInput = {
  finalReviewConfirmed?: boolean;
};

export type ControlledPdfTemplateField = {
  label: string;
  value: string;
  required: boolean;
};

export type ControlledPdfTemplateSection = {
  sectionId: string;
  title: string;
  layoutHint: 'header' | 'two-column-table' | 'full-width-text' | 'photo-evidence-grid' | 'approval-status';
  fields: ControlledPdfTemplateField[];
};

export type ControlledCorrectiveActionPdfTemplate = {
  templateName: string;
  templateVersion: string;
  modelSource: string;
  status: ControlledPdfTemplateStatus;
  releaseGate: string;
  layoutNotes: string[];
  sections: ControlledPdfTemplateSection[];
};

const manualBlank = (label: string, value?: string) => {
  const normalized = value?.trim() ?? '';
  return normalized || `[Manual entry needed: ${label}]`;
};

const issueSummary = (data: ControlledPdfTemplateInput) => data.shortIssueDescription || data.issueDetails;
const requiredCorrection = (data: ControlledPdfTemplateInput) => data.requiredCorrection || data.requestedEngineeringAction;

function formatEvidenceFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function buildStructuredDraftSection(data: ControlledPdfTemplateInput): ControlledPdfTemplateSection | null {
  if (!data.structuredDraft) return null;

  const fields = Object.values(data.structuredDraft.sections).map((section) => ({
    label: section.title,
    value: section.draftText.trim() || `[Manual review needed: ${section.title}]`,
    required: true,
  }));

  return {
    sectionId: 'structured-corrective-action-draft',
    title: 'Structured Corrective Action Draft Sections',
    layoutHint: 'full-width-text',
    fields,
  };
}

function buildPhotoEvidenceFields(data: ControlledPdfTemplateInput) {
  const evidenceItems = data.evidenceItems ?? [];

  if (!evidenceItems.length) {
    return [
      { label: 'Router / Work Order Photo', value: manualBlank('Router / Work Order Photo', data.routerWorkOrderPhotoPlaceholder), required: false },
      { label: 'Part / Defect Photo', value: manualBlank('Part / Defect Photo', data.partDefectPhotoPlaceholder), required: false },
      { label: 'Evidence Note', value: 'No Review-step photo evidence attached yet. Export remains disabled.', required: false },
    ];
  }

  return evidenceItems.map((item, index) => ({
    label: `Evidence Photo ${index + 1}`,
    value: [
      `Label: ${manualBlank('Evidence Label', item.label)}`,
      `Caption / Note: ${manualBlank('Caption / Note', item.caption)}`,
      `File: ${manualBlank('File Name', item.fileName)}`,
      `Type: ${item.fileType || 'Unknown type'}`,
      `Size: ${formatEvidenceFileSize(item.fileSize)}`,
    ].join('\n'),
    required: false,
  }));
}

export function buildControlledCorrectiveActionPdfTemplate(
  data: ControlledPdfTemplateInput,
  confirmations: ControlledPdfTemplateConfirmationInput = {},
): ControlledCorrectiveActionPdfTemplate {
  const humanConfirmed = Boolean(confirmations.finalReviewConfirmed);
  const structuredDraftSection = buildStructuredDraftSection(data);

  return {
    templateName: 'AI-CAS Controlled Corrective Action PDF',
    templateVersion: 'V4-M13C-preview-foundation',
    modelSource: 'WO 008604 corrective action style model',
    status: humanConfirmed ? 'locked-until-controlled-release' : 'foundation-only',
    releaseGate: 'PDF/export is disabled until future controlled release milestone. Human confirmation remains required.',
    layoutNotes: [
      'Use a clean shop-floor corrective action sheet structure modeled after WO 008604.',
      'Prioritize readable header fields, boxed problem/correction sections, evidence placeholders, and approval status.',
      'This file defines template data only; it does not generate, download, print, email, or release a PDF.',
      'Future PDF generation must consume this template only after the controlled release gate is implemented.',
      'V4-M13C preview includes structured draft sections and Review-step evidence metadata only.',
    ],
    sections: [
      {
        sectionId: 'header-title',
        title: 'Header / Corrective Action Title',
        layoutHint: 'header',
        fields: [
          { label: 'Corrective Action Title', value: manualBlank('Corrective Action Title', data.correctionType), required: true },
          { label: 'Template Status', value: 'Controlled PDF preview only — export disabled', required: true },
          { label: 'Human Confirmation Status', value: humanConfirmed ? 'Human final review confirmed' : 'Human final review not confirmed', required: true },
        ],
      },
      {
        sectionId: 'job-router-data',
        title: 'Job / Router Data',
        layoutHint: 'two-column-table',
        fields: [
          { label: 'Work Order', value: manualBlank('Work Order', data.workOrderNumber), required: true },
          { label: 'Part Number', value: manualBlank('Part Number', data.partNumber), required: true },
          { label: 'Part Description', value: manualBlank('Part Description', data.partDescription), required: false },
          { label: 'Customer / Job Name', value: manualBlank('Customer / Job Name', data.customerOrJob), required: false },
          { label: 'Quantity Affected', value: manualBlank('Quantity Affected', data.quantityAffected || data.quantity), required: false },
          { label: 'Found At Department', value: manualBlank('Found At Department', data.foundAtDepartment || data.affectedArea), required: true },
          { label: 'Suspected Failure Point', value: manualBlank('Suspected Failure Point', data.suspectedFailurePoint), required: true },
        ],
      },
      structuredDraftSection ?? {
        sectionId: 'problem-summary',
        title: 'Problem Summary',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'Problem Summary', value: manualBlank('Problem Summary', issueSummary(data)), required: true },
        ],
      },
      {
        sectionId: 'corrective-action-requirements',
        title: 'Corrective Action Requirements',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'Immediate Containment', value: manualBlank('Immediate Containment', data.immediateContainment), required: true },
          { label: 'Required Correction', value: manualBlank('Required Correction', requiredCorrection(data)), required: true },
          { label: 'Prevention / Standard Work Update', value: manualBlank('Prevention / Standard Work Update', data.preventionStandardWorkUpdate), required: true },
          { label: 'Inspection / Verification Requirement', value: manualBlank('Inspection / Verification Requirement', data.inspectionVerificationRequirement), required: true },
          { label: 'Release Approval Requirement', value: manualBlank('Release Approval Requirement', data.releaseApprovalRequirement), required: true },
        ],
      },
      {
        sectionId: 'photo-evidence',
        title: 'Photo Evidence Placeholder Area',
        layoutHint: 'photo-evidence-grid',
        fields: buildPhotoEvidenceFields(data),
      },
      {
        sectionId: 'human-confirmation-approval',
        title: 'Human Confirmation / Approval Status',
        layoutHint: 'approval-status',
        fields: [
          { label: 'AI Extracted Data Confirmation', value: manualBlank('AI Extracted Data Confirmation', data.aiExtractedDataConfirmation), required: true },
          { label: 'Human Release Confirmation', value: manualBlank('Human Release Confirmation', data.humanReleaseConfirmation), required: true },
          { label: 'Final Review Gate', value: humanConfirmed ? 'Confirmed in app state — export still disabled' : 'Not confirmed — release/export locked', required: true },
        ],
      },
    ],
  };
}
````````

## `features/woc/logic/setupConfigStorage.ts`

````````ts
import type { SetupConfig } from '../types/wocSessionTypes';

export const SETUP_CONFIG_STORAGE_KEY = 'refab-connect-setup-config';

export const defaultSetupConfig: SetupConfig = {
  companyName: '',
  engineeringRecipientEmail: '',
  senderDisplayName: 'REFAB Connect',
  defaultSubmittedByName: '',
  defaultSubmittedByEmail: '',
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function sanitizeSetupConfig(value: unknown): SetupConfig {
  if (!isObject(value)) return defaultSetupConfig;

  return {
    companyName: stringValue(value.companyName),
    engineeringRecipientEmail: stringValue(value.engineeringRecipientEmail),
    senderDisplayName: stringValue(value.senderDisplayName) || defaultSetupConfig.senderDisplayName,
    defaultSubmittedByName: stringValue(value.defaultSubmittedByName),
    defaultSubmittedByEmail: stringValue(value.defaultSubmittedByEmail),
  };
}

export function loadSetupConfigFromStorage(): SetupConfig {
  try {
    const raw = window.localStorage.getItem(SETUP_CONFIG_STORAGE_KEY);
    if (!raw) return defaultSetupConfig;
    return sanitizeSetupConfig(JSON.parse(raw));
  } catch {
    return defaultSetupConfig;
  }
}

export function saveSetupConfigToStorage(config: SetupConfig) {
  window.localStorage.setItem(SETUP_CONFIG_STORAGE_KEY, JSON.stringify(sanitizeSetupConfig(config)));
}
````````

## `features/woc/state/wocDataModel.ts`

````````ts
import {
  buildAiCorrectiveActionDraftFoundation,
  type AiCorrectiveActionDraftFoundation,
} from '../logic/aiCorrectiveActionDraftFoundation';
import { buildAiCorrectiveActionDraftInputFromWocData } from '../logic/aiCorrectiveActionDraftInputWiring';
import {
  buildPhotoEvidenceStatusLine,
  loadPhotoEvidenceMetadataFromSession,
  PHOTO_EVIDENCE_STORAGE_KEY,
  type EvidenceAttachmentMetadata,
} from '../logic/evidenceAttachmentPreparation';

export type WocCorrectionData = {
  workOrderNumber: string;
  partNumber: string;
  revision: string;
  partDescription: string;
  customerOrJob: string;
  operationNumber: string;
  routerStepOperation: string;
  quantity: string;
  quantityAffected: string;
  dueDateShipDate: string;
  material: string;
  nextOperation: string;
  inspectionOperation: string;
  correctionType: string;
  affectedArea: string;
  customAffectedArea: string;
  shortIssueDescription: string;
  detailedIssueNotes: string;
  defectProblemType: string;
  productionImpact: string;
  foundAtDepartment: string;
  correctiveActionOwnerDepartment: string;
  suspectedFailurePoint: string;
  escapedThroughDepartments: string;
  immediateContainment: string;
  requiredCorrection: string;
  preventionStandardWorkUpdate: string;
  inspectionVerificationRequirement: string;
  releaseApprovalRequirement: string;
  routerWorkOrderPhotoPlaceholder: string;
  partDefectPhotoPlaceholder: string;
  aiExtractedDataConfirmation: string;
  humanReleaseConfirmation: string;
  issueDetails: string;
  requestedEngineeringAction: string;
};

export type WocConfirmationState = {
  workOrderDataConfirmed: boolean;
  partNumberConfirmed: boolean;
  correctionTypeSelected: boolean;
  issueDetailsEntered: boolean;
  requestedActionEntered: boolean;
  finalReviewConfirmed: boolean;
};

export type GeneratedCorrectionPackage = {
  subjectLine: string;
  reportPreview: string;
  emailPreview: string;
  generatedAt: string;
  aiDraftFoundation: AiCorrectiveActionDraftFoundation;
} | null;

export type ConfirmableFieldKey = 'workOrderNumber' | 'partNumber';

export type WocDataField = {
  key: keyof WocCorrectionData;
  label: string;
  required: boolean;
  confirmable?: boolean;
};

export const otherAffectedAreaOption = 'Other / Needs Review';
export const photoEvidenceStorageKey = PHOTO_EVIDENCE_STORAGE_KEY;

export type PhotoEvidenceMetadata = EvidenceAttachmentMetadata & {
  evidenceAttached: boolean;
  evidenceFileName: string;
  evidenceFileType: string;
  evidenceFileSize: number;
};

export const correctionTypeOptions = [
  'Incorrect Time / Rate',
  'Missing Grind / Finish Operation',
  'Missing Weld Operation',
  'Missing Fixture / Work Instruction',
  'Wrong / Missing Router Step',
  'Hole Size / No-Go Gauge Issue',
  'Cleaning / Staging Issue',
  'Other',
];

export const departmentOptions = [
  'Laser',
  'Forming',
  'Welding',
  'Machining',
  'Assembly',
  'PEM Cert',
  'Audit',
  'Shipping',
  'Powder Coat',
  otherAffectedAreaOption,
];

export const affectedAreaOptions = departmentOptions;

export const defaultWocCorrectionData: WocCorrectionData = {
  workOrderNumber: '042631-001',
  partNumber: 'CYM-1750-LH-BU',
  revision: 'B',
  partDescription: '',
  customerOrJob: 'ENWORK',
  operationNumber: '',
  routerStepOperation: '',
  quantity: '35 EA',
  quantityAffected: '35 EA',
  dueDateShipDate: '',
  material: '',
  nextOperation: '',
  inspectionOperation: '',
  correctionType: 'Other',
  affectedArea: 'Welding',
  customAffectedArea: '',
  shortIssueDescription: '',
  detailedIssueNotes: '',
  defectProblemType: 'Operator Exception',
  productionImpact: '',
  foundAtDepartment: 'Welding',
  correctiveActionOwnerDepartment: 'Other / Needs Review',
  suspectedFailurePoint: 'Other / Needs Review',
  escapedThroughDepartments: 'Other / Needs Review',
  immediateContainment: '',
  requiredCorrection: '',
  preventionStandardWorkUpdate: '',
  inspectionVerificationRequirement: '',
  releaseApprovalRequirement: 'Human confirmation required before PDF/release.',
  routerWorkOrderPhotoPlaceholder: 'Router / work order photo evidence placeholder.',
  partDefectPhotoPlaceholder: 'Part / defect photo evidence placeholder.',
  aiExtractedDataConfirmation: 'AI extracted data must be reviewed and confirmed by the user.',
  humanReleaseConfirmation: 'Human confirmation required before release/PDF.',
  issueDetails: '',
  requestedEngineeringAction: '',
};

export const defaultWocConfirmations: WocConfirmationState = {
  workOrderDataConfirmed: false,
  partNumberConfirmed: false,
  correctionTypeSelected: true,
  issueDetailsEntered: false,
  requestedActionEntered: true,
  finalReviewConfirmed: false,
};

export const confirmDataFields: WocDataField[] = [
  { key: 'workOrderNumber', label: 'Work Order', required: true, confirmable: true },
  { key: 'partNumber', label: 'Part Number', required: true, confirmable: true },
  { key: 'partDescription', label: 'Part Description', required: false },
  { key: 'customerOrJob', label: 'Customer / Job Name', required: false },
  { key: 'operationNumber', label: 'Operation Number', required: false },
  { key: 'routerStepOperation', label: 'Router Step / Operation', required: false },
  { key: 'quantityAffected', label: 'Quantity Affected', required: false },
  { key: 'dueDateShipDate', label: 'Due Date / Ship Date', required: false },
];

export function isFilled(value: string) {
  return Boolean(value.trim());
}

export function getEffectiveAffectedArea(data: WocCorrectionData) {
  if (data.foundAtDepartment === otherAffectedAreaOption && data.customAffectedArea.trim()) {
    return data.customAffectedArea.trim();
  }

  return data.foundAtDepartment.trim() || data.affectedArea.trim();
}

function manualBlank(label: string, value: string) {
  return isFilled(value) ? value.trim() : `[Manual entry needed: ${label}]`;
}

function optionalLine(label: string, value: string) {
  return `${label}: ${manualBlank(label, value)}\n`;
}

function v4IssueSummary(data: WocCorrectionData) {
  return data.shortIssueDescription.trim() || data.issueDetails.trim();
}

function v4IssueDetails(data: WocCorrectionData) {
  return data.detailedIssueNotes.trim() || data.issueDetails.trim() || data.shortIssueDescription.trim();
}

function v4RequiredCorrection(data: WocCorrectionData) {
  return data.requiredCorrection.trim() || data.requestedEngineeringAction.trim() || 'AI-CAS should draft the required corrective action from confirmed router context and the operator exception note.';
}

export function getPhotoEvidenceStatusLine() {
  return buildPhotoEvidenceStatusLine(loadPhotoEvidenceMetadataFromSession());
}

export function buildEmailSubject(data: WocCorrectionData) {
  return `[${manualBlank('Correction Type', data.correctionType)}] Corrective Action Draft — WO ${manualBlank('Work Order', data.workOrderNumber)} / Part ${manualBlank('Part Number', data.partNumber)}`;
}

export function buildEngineeringReport(
  data: WocCorrectionData,
  submittedBy = 'Shop-floor correction request submitted through AI-CAS — Corrective Action System.\nPowered by Applied Intelligence Framework.',
) {
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `CORRECTIVE ACTION DRAFT
Status: Draft / Editable / Unconfirmed
Release Gate: Human confirmation required before release/PDF.

1. Confirmed Router / Job Context
Work Order: ${manualBlank('Work Order', data.workOrderNumber)}
Part Number: ${manualBlank('Part Number', data.partNumber)}
${optionalLine('Part Description', data.partDescription)}${optionalLine('Customer / Job Name', data.customerOrJob)}${optionalLine('Operation Number', data.operationNumber)}${optionalLine('Router Step / Operation', data.routerStepOperation)}${optionalLine('Quantity Affected', data.quantityAffected || data.quantity)}${optionalLine('Due Date / Ship Date', data.dueDateShipDate)}${optionalLine('Material', data.material)}${optionalLine('Next Operation', data.nextOperation)}${optionalLine('Inspection Operation', data.inspectionOperation)}
2. Operator Exception Note
What is wrong: ${manualBlank('What is wrong', v4IssueSummary(data))}
Detailed Issue Notes: ${manualBlank('Detailed Issue Notes', v4IssueDetails(data))}
Defect / Problem Type: ${manualBlank('Defect / Problem Type', data.defectProblemType)}
Production Impact: ${manualBlank('Production Impact', data.productionImpact)}

3. Department / Flow Control
Found At Department: ${manualBlank('Found At Department', affectedArea)}
Corrective Action Owner Department: ${manualBlank('Corrective Action Owner Department', data.correctiveActionOwnerDepartment)}
Suspected Failure Point: ${manualBlank('Suspected Failure Point', data.suspectedFailurePoint)}
Escaped Through Departments: ${manualBlank('Escaped Through Departments', data.escapedThroughDepartments)}

4. Corrective Action Draft
Problem Summary:
${manualBlank('Problem Summary', v4IssueSummary(data))}

Immediate Containment:
${manualBlank('Immediate Containment', data.immediateContainment)}

Required Correction:
${manualBlank('Required Correction', v4RequiredCorrection(data))}

Prevention / Standard Work Update:
${manualBlank('Prevention / Standard Work Update', data.preventionStandardWorkUpdate)}

Inspection / Verification Requirement:
${manualBlank('Inspection / Verification Requirement', data.inspectionVerificationRequirement)}

Release Approval Requirement:
${manualBlank('Release Approval Requirement', data.releaseApprovalRequirement)}

5. Evidence / Confirmation
Router / Work Order Photo: ${manualBlank('Router / Work Order Photo Placeholder', data.routerWorkOrderPhotoPlaceholder)}
Part / Defect Photo: ${manualBlank('Part / Defect Photo Placeholder', data.partDefectPhotoPlaceholder)}
Photo Evidence Status: ${photoEvidenceStatus}
AI Extracted Data Confirmation: ${manualBlank('AI Extracted Data Confirmation', data.aiExtractedDataConfirmation)}
Human Release Confirmation: ${manualBlank('Human Release Confirmation', data.humanReleaseConfirmation)}

6. Submitted By / Source
${submittedBy}

7. Gate Status
Draft is editable and unconfirmed. Human confirmation is required before release/PDF.`;
}

export function buildEmailDraft(data: WocCorrectionData, submittedBy = 'AI-CAS — Corrective Action System') {
  const subject = buildEmailSubject(data);
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `Subject: ${subject}

Engineering Team,

Please review the corrective action draft below. This draft is editable and remains unconfirmed until human release confirmation is completed.

Work Order:
${manualBlank('Work Order', data.workOrderNumber)}

Part Number:
${manualBlank('Part Number', data.partNumber)}

Customer / Job:
${manualBlank('Customer / Job Name', data.customerOrJob)}

Quantity Affected:
${manualBlank('Quantity Affected', data.quantityAffected || data.quantity)}

Router / Operation Context:
${manualBlank('Router Step / Operation', data.routerStepOperation)}

Material:
${manualBlank('Material', data.material)}

Next Operation:
${manualBlank('Next Operation', data.nextOperation)}

Inspection Operation:
${manualBlank('Inspection Operation', data.inspectionOperation)}

Operator Exception Note:
${manualBlank('What is wrong', v4IssueSummary(data))}

Found At Department:
${manualBlank('Found At Department', affectedArea)}

Corrective Action Owner Department:
${manualBlank('Corrective Action Owner Department', data.correctiveActionOwnerDepartment)}

Suspected Failure Point:
${manualBlank('Suspected Failure Point', data.suspectedFailurePoint)}

Immediate Containment:
${manualBlank('Immediate Containment', data.immediateContainment)}

Required Correction:
${manualBlank('Required Correction', v4RequiredCorrection(data))}

Prevention / Standard Work Update:
${manualBlank('Prevention / Standard Work Update', data.preventionStandardWorkUpdate)}

Inspection / Verification Requirement:
${manualBlank('Inspection / Verification Requirement', data.inspectionVerificationRequirement)}

Release Approval Requirement:
${manualBlank('Release Approval Requirement', data.releaseApprovalRequirement)}

Photo Evidence:
${photoEvidenceStatus}

Release Note:
Human confirmation is required before final release/PDF.

Submitted By:
${submittedBy}

Thank you,
AI-CAS`;
}

export function createGeneratedPackage(data: WocCorrectionData, submittedBy?: string): GeneratedCorrectionPackage {
  const aiDraftInput = buildAiCorrectiveActionDraftInputFromWocData(data);
  const aiDraftFoundation = buildAiCorrectiveActionDraftFoundation(aiDraftInput);

  return {
    subjectLine: buildEmailSubject(data),
    reportPreview: buildEngineeringReport(data, submittedBy),
    emailPreview: buildEmailDraft(data, submittedBy),
    generatedAt: new Date().toLocaleString(),
    aiDraftFoundation,
  };
}

export function getGateStatus(
  data: WocCorrectionData,
  confirmations: WocConfirmationState,
  generatedPackage: GeneratedCorrectionPackage,
) {
  const workOrderReady = isFilled(data.workOrderNumber) && confirmations.workOrderDataConfirmed;
  const partNumberReady = isFilled(data.partNumber) && confirmations.partNumberConfirmed;
  const confirmReady = workOrderReady && partNumberReady;

  const correctionTypeReady = isFilled(data.correctionType) && confirmations.correctionTypeSelected;
  const affectedAreaReady = isFilled(getEffectiveAffectedArea(data));
  const issueDetailsReady = isFilled(v4IssueSummary(data)) || isFilled(data.detailedIssueNotes);
  const generateReady = confirmReady && issueDetailsReady;

  const reviewReady = Boolean(generatedPackage) && confirmations.finalReviewConfirmed;
  const sendReady = generateReady && reviewReady;

  return {
    workOrderReady,
    partNumberReady,
    confirmReady,
    correctionTypeReady,
    affectedAreaReady,
    issueDetailsReady,
    requestedActionReady: true,
    generateReady,
    reviewReady,
    sendReady,
  };
}

export function resetDependentConfirmations(
  confirmations: WocConfirmationState,
  key: keyof WocCorrectionData,
  value: string,
): WocConfirmationState {
  const next = { ...confirmations, finalReviewConfirmed: false };

  if (key === 'workOrderNumber') {
    next.workOrderDataConfirmed = false;
  }

  if (key === 'partNumber') {
    next.partNumberConfirmed = false;
  }

  if (key === 'correctionType') {
    next.correctionTypeSelected = isFilled(value);
  }

  if (key === 'issueDetails' || key === 'shortIssueDescription' || key === 'detailedIssueNotes') {
    next.issueDetailsEntered = isFilled(value);
  }

  if (key === 'requestedEngineeringAction' || key === 'requiredCorrection') {
    next.requestedActionEntered = true;
  }

  return next;
}
````````

## `features/woc/types/wocSessionTypes.ts`

````````ts
export type Screen = 'home' | 'capture' | 'confirm' | 'generate' | 'review' | 'drafts' | 'history' | 'more';

export type NavItem = {
  label: string;
  screen: Screen;
};

export type WorkflowStep = [string, string, string];

export type ActionFeedback = {
  tone: 'success' | 'error';
  message: string;
} | null;

export type CurrentUser = {
  userId: string;
  displayName: string;
  emailOrEmployeeId: string;
  appUnlockPin: string;
  loginTimestamp: string;
};

export type UploadedFileInfo = {
  name: string;
  type: string;
  size: number;
  previewUrl: string | null;
  isImage: boolean;
};

export type PhotoEvidenceRecordMetadata = {
  evidenceAttached: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
};

export type ExtractedWorkOrderData = {
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  partDescription?: string;
  customerOrJob?: string;
  operationNumber?: string;
  routerStepOperation?: string;
  quantity?: string;
  quantityAffected?: string;
  dueDateShipDate?: string;
  nextOperation?: string;
  inspectionOperation?: string;
  material?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  notes?: string;
  fieldSourceNotes?: Record<string, string>;
};

export type ExtractionDebugMetadata = {
  extractionSource: string;
  extractedKeys: string[];
  missingExpectedFields: string[];
  fieldSourceNotes: Record<string, string>;
} | null;

export type SetupConfig = {
  companyName: string;
  engineeringRecipientEmail: string;
  senderDisplayName: string;
  defaultSubmittedByName: string;
  defaultSubmittedByEmail: string;
};

export type DraftRecord = {
  draftId: string;
  createdTimestamp: string;
  subjectLine: string;
  workOrderNumber: string;
  partNumber: string;
  affectedArea: string;
  correctionType: string;
  reportText: string;
  emailDraftText: string;
  submittedBy?: string;
  submittedById?: string;
  evidenceAttached?: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
  status: 'Draft';
};

export type HistoryRecord = {
  historyId: string;
  completedTimestamp: string;
  subjectLine: string;
  workOrderNumber: string;
  partNumber: string;
  affectedArea: string;
  correctionType: string;
  reportText: string;
  emailDraftText: string;
  submittedBy?: string;
  submittedById?: string;
  evidenceAttached?: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
  resendId?: string | null;
  status: 'Completed / Sent Placeholder' | 'Sent';
};
````````

## `app/api/generate-pdf/route.ts`

````````ts
import { NextResponse } from 'next/server';
import { CorrectiveActionPdfDocument, type CorrectiveActionPdfLine } from '../../../features/woc/components/pdf/CorrectiveActionPdfDocument';
import type { ControlledCorrectiveActionPdfTemplate } from '../../../features/woc/logic/controlledPdfTemplateFoundation';

export const runtime = 'nodejs';

type GeneratePdfRequestBody = {
  template?: ControlledCorrectiveActionPdfTemplate;
  finalReviewConfirmed?: boolean;
  confirmations?: {
    finalReviewConfirmed?: boolean;
  };
};

type PdfPage = CorrectiveActionPdfLine[];

const PAGE_HEIGHT = 792;
const PAGE_WIDTH = 612;
const PAGE_MARGIN_X = 48;
const PAGE_START_Y = 744;
const PAGE_BOTTOM_Y = 48;
const LINE_HEIGHT = 14;
const TITLE_LINE_HEIGHT = 22;
const SECTION_LINE_HEIGHT = 18;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isControlledPdfTemplate(value: unknown): value is ControlledCorrectiveActionPdfTemplate {
  if (!isRecord(value)) return false;

  return (
    isString(value.templateName) &&
    isString(value.templateVersion) &&
    isString(value.modelSource) &&
    isString(value.status) &&
    isString(value.releaseGate) &&
    Array.isArray(value.layoutNotes) &&
    value.layoutNotes.every(isString) &&
    Array.isArray(value.sections) &&
    value.sections.every((section) => {
      if (!isRecord(section)) return false;

      return (
        isString(section.sectionId) &&
        isString(section.title) &&
        isString(section.layoutHint) &&
        Array.isArray(section.fields) &&
        section.fields.every((field) => (
          isRecord(field) &&
          isString(field.label) &&
          isString(field.value) &&
          typeof field.required === 'boolean'
        ))
      );
    })
  );
}

function getTemplateFromBody(body: unknown) {
  if (isControlledPdfTemplate(body)) return body;
  if (isRecord(body) && isControlledPdfTemplate(body.template)) return body.template;
  return null;
}

function getHumanConfirmation(body: GeneratePdfRequestBody) {
  return body.finalReviewConfirmed === true || body.confirmations?.finalReviewConfirmed === true;
}

function lineHeight(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title') return TITLE_LINE_HEIGHT;
  if (line.variant === 'section') return SECTION_LINE_HEIGHT;
  return LINE_HEIGHT;
}

function paginateLines(lines: CorrectiveActionPdfLine[]) {
  const pages: PdfPage[] = [[]];
  let remainingHeight = PAGE_START_Y - PAGE_BOTTOM_Y;

  lines.forEach((line) => {
    const requiredHeight = lineHeight(line);

    if (pages[pages.length - 1].length > 0 && requiredHeight > remainingHeight) {
      pages.push([]);
      remainingHeight = PAGE_START_Y - PAGE_BOTTOM_Y;
    }

    pages[pages.length - 1].push(line);
    remainingHeight -= requiredHeight;
  });

  return pages;
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, ' ');
}

function fontSize(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title') return 18;
  if (line.variant === 'section') return 13;
  if (line.variant === 'label') return 10;
  if (line.variant === 'footer' || line.variant === 'subtitle') return 8;
  return 9;
}

function fontName(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title' || line.variant === 'section' || line.variant === 'label' || line.variant === 'gate') {
    return 'F2';
  }

  return 'F1';
}

function renderPageContent(page: PdfPage, pageIndex: number, pageCount: number) {
  let cursorY = PAGE_START_Y;
  const operations = [
    'BT',
    `/F1 8 Tf`,
    `${PAGE_MARGIN_X} 28 Td`,
    `(AI-CAS controlled PDF foundation - Page ${pageIndex + 1} of ${pageCount}) Tj`,
    'ET',
  ];

  page.forEach((line) => {
    const size = fontSize(line);
    operations.push('BT');
    operations.push(`/${fontName(line)} ${size} Tf`);
    operations.push(`${PAGE_MARGIN_X} ${cursorY} Td`);
    operations.push(`(${escapePdfText(line.text)}) Tj`);
    operations.push('ET');
    cursorY -= lineHeight(line);
  });

  return operations.join('\n');
}

function createPdfObject(id: number, body: string) {
  return `${id} 0 obj\n${body}\nendobj\n`;
}

function buildPdfBinary(lines: CorrectiveActionPdfLine[]) {
  const pages = paginateLines(lines);
  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontRegularId = 3;
  const fontBoldId = 4;
  const firstPageId = 5;
  const firstContentId = firstPageId + pages.length;
  const pageObjectIds = pages.map((_, index) => firstPageId + index);
  const contentObjectIds = pages.map((_, index) => firstContentId + index);

  objects[catalogId] = createPdfObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  objects[pagesId] = createPdfObject(pagesId, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objects[fontRegularId] = createPdfObject(fontRegularId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects[fontBoldId] = createPdfObject(fontBoldId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  pages.forEach((page, index) => {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    const content = renderPageContent(page, index, pages.length);

    objects[pageId] = createPdfObject(
      pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects[contentId] = createPdfObject(contentId, `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.slice(1).forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += object;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

export async function POST(request: Request) {
  let body: GeneratePdfRequestBody;

  try {
    body = (await request.json()) as GeneratePdfRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const template = getTemplateFromBody(body);

  if (!template) {
    return NextResponse.json(
      { error: 'Missing or invalid controlled corrective-action PDF template JSON.' },
      { status: 400 },
    );
  }

  if (!getHumanConfirmation(body)) {
    return NextResponse.json(
      { error: 'Human final review confirmation is required before server-side PDF generation.' },
      { status: 403 },
    );
  }

  const pdfBuffer = buildPdfBinary(CorrectiveActionPdfDocument({ template }));

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="corrective-action-foundation.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
````````

## `app/api/send-correction/route.ts`

````````ts
import { NextResponse } from 'next/server';

const DEFAULT_RESEND_FROM = 'AI-CAS <onboarding@resend.dev>';

type SendCorrectionRequest = {
  subjectLine?: string;
  reportText?: string;
  emailDraftText?: string;
  workOrderNumber?: string;
  partNumber?: string;
  correctionType?: string;
  affectedArea?: string;
  recipientEmail?: string;
  senderDisplayName?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  companyName?: string;
  sendPin?: string;
  pdfBase64?: string;
  pdfFileName?: string;
};

type ResendAttachment = {
  filename: string;
  content: string;
};

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveRecipient(payload: SendCorrectionRequest) {
  return cleanValue(payload.recipientEmail) || cleanValue(process.env.REFAB_CONNECT_EMAIL_TO);
}

function resolveSender() {
  return cleanValue(process.env.REFAB_CONNECT_EMAIL_FROM) || DEFAULT_RESEND_FROM;
}

function normalizePdfFileName(value: string) {
  const fallback = 'ai-cas-corrective-action.pdf';
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

  if (!normalized) return fallback;
  return normalized.toLowerCase().endsWith('.pdf') ? normalized : `${normalized}.pdf`;
}

function buildPdfAttachment(payload: SendCorrectionRequest): ResendAttachment | null {
  const pdfBase64 = cleanValue(payload.pdfBase64);
  const pdfFileName = normalizePdfFileName(cleanValue(payload.pdfFileName));

  if (!pdfBase64 && !cleanValue(payload.pdfFileName)) return null;

  if (!pdfBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64)) {
    throw new Error('Invalid PDF attachment payload. Generate the controlled PDF again before sending.');
  }

  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  if (pdfBuffer.length === 0 || pdfBuffer.subarray(0, 4).toString('latin1') !== '%PDF') {
    throw new Error('Invalid PDF attachment payload. Only controlled PDF attachments are supported.');
  }

  return {
    filename: pdfFileName,
    content: pdfBase64,
  };
}

function buildEmailBody(payload: SendCorrectionRequest) {
  const workOrderNumber = cleanValue(payload.workOrderNumber) || 'Not provided';
  const partNumber = cleanValue(payload.partNumber) || 'Not provided';
  const correctionType = cleanValue(payload.correctionType) || 'Not provided';
  const affectedArea = cleanValue(payload.affectedArea) || 'Not provided';
  const companyName = cleanValue(payload.companyName);
  const submittedByName = cleanValue(payload.submittedByName);
  const submittedByEmail = cleanValue(payload.submittedByEmail);

  const submittedBy = [submittedByName, submittedByEmail].filter(Boolean).join(' / ');

  return `Engineering Team,

A work order correction has been submitted through AI-CAS.

Work Order: ${workOrderNumber}
Part Number: ${partNumber}
Correction Type: ${correctionType}
Affected Area: ${affectedArea}${companyName ? `\nCompany: ${companyName}` : ''}${submittedBy ? `\nSubmitted By: ${submittedBy}` : ''}

Please review the Engineering Correction Report for the full issue summary and requested Engineering action.

Thank you,
AI-CAS`;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredSendPin = cleanValue(process.env.REFAB_CONNECT_SEND_PIN);

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured. Email was not sent.' },
      { status: 503 },
    );
  }

  if (!configuredSendPin) {
    return NextResponse.json(
      { error: 'REFAB_CONNECT_SEND_PIN is not configured. Email was not sent.' },
      { status: 503 },
    );
  }

  let payload: SendCorrectionRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid send request.' }, { status: 400 });
  }

  const submittedSendPin = cleanValue(payload.sendPin);

  if (!/^\d{4}$/.test(submittedSendPin) || submittedSendPin !== configuredSendPin) {
    return NextResponse.json({ error: 'Incorrect Send PIN. Email was not sent.' }, { status: 401 });
  }

  const subjectLine = cleanValue(payload.subjectLine);
  const reportText = cleanValue(payload.reportText);
  const emailDraftText = cleanValue(payload.emailDraftText);
  const recipient = resolveRecipient(payload);
  const from = resolveSender();

  let pdfAttachment: ResendAttachment | null = null;

  try {
    pdfAttachment = buildPdfAttachment(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid PDF attachment payload.' },
      { status: 400 },
    );
  }

  if (!recipient) {
    return NextResponse.json(
      { error: 'No Engineering recipient email is configured. Add one in Setup/Admin or set REFAB_CONNECT_EMAIL_TO.' },
      { status: 400 },
    );
  }

  if (!subjectLine || !reportText || !emailDraftText) {
    return NextResponse.json(
      { error: 'Missing generated report, email draft, or subject line.' },
      { status: 400 },
    );
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: subjectLine,
      text: buildEmailBody(payload),
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
    }),
  });

  const responseBody = await resendResponse.json();

  if (!resendResponse.ok) {
    const errorMessage =
      typeof responseBody?.message === 'string'
        ? responseBody.message
        : typeof responseBody?.error === 'string'
          ? responseBody.error
          : 'Resend email send failed.';

    return NextResponse.json({ error: errorMessage }, { status: resendResponse.status });
  }

  return NextResponse.json({
    sent: true,
    recipient,
    resendId: typeof responseBody?.id === 'string' ? responseBody.id : null,
  });
}
````````

## `app/print-report/page.tsx`

````````tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PRINT_REPORT_STORAGE_KEY,
  type PrintCorrectionReportInput,
} from '../../features/woc/logic/printCorrectionReport';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getReportValue(reportText: string, label: string) {
  const colonPattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'im');
  const colonMatch = reportText.match(colonPattern);
  if (colonMatch?.[1]?.trim()) return colonMatch[1].trim();

  const numberedSectionPattern = new RegExp(`^\\d+\\.\\s*${escapeRegExp(label)}\\s*\\n(.+?)(?=\\n\\n\\d+\\.|$)`, 'ims');
  const numberedSectionMatch = reportText.match(numberedSectionPattern);
  return numberedSectionMatch?.[1]?.trim() ?? '';
}

function resolveField(explicitValue: string | undefined, reportText: string, label: string) {
  return explicitValue?.trim() || getReportValue(reportText, label);
}

function isPrintPayload(value: unknown): value is PrintCorrectionReportInput {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'reportText' in value &&
    typeof (value as { reportText?: unknown }).reportText === 'string' &&
    (value as { reportText: string }).reportText.trim(),
  );
}

export default function PrintReportPage() {
  const [report, setReport] = useState<PrintCorrectionReportInput | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PRINT_REPORT_STORAGE_KEY);
      if (!raw) {
        setLoadError('No report data was found. Return to AI-CAS and choose Export / Print Report again.');
        return;
      }

      const parsed = JSON.parse(raw);
      if (!isPrintPayload(parsed)) {
        setLoadError('Saved print report data is invalid. Return to AI-CAS and export the report again.');
        return;
      }

      setReport(parsed);
    } catch {
      setLoadError('Unable to load the print report. Return to AI-CAS and export the report again.');
    }
  }, []);

  const fields = useMemo(() => {
    if (!report) return [];

    return [
      ['Work Order Number', resolveField(report.workOrderNumber, report.reportText, 'Work Order Number')],
      ['Part Number', resolveField(report.partNumber, report.reportText, 'Part Number')],
      ['Revision', resolveField(report.revision, report.reportText, 'Revision')],
      ['Customer / Job', resolveField(report.customerOrJob, report.reportText, 'Customer / Job')],
      ['Quantity', resolveField(report.quantity, report.reportText, 'Quantity')],
      ['Affected Area', resolveField(report.affectedArea, report.reportText, 'Affected Area')],
      ['Correction Type', resolveField(report.correctionType, report.reportText, 'Correction Type')],
      ['Photo Evidence', resolveField(report.photoEvidenceStatus, report.reportText, 'Photo Evidence')],
      ['Submitted By / Source', resolveField(report.submittedBy, report.reportText, 'Submitted By / Source')],
      ['Status', resolveField(report.status, report.reportText, 'Status')],
      ['Generated', report.generatedTimestamp || new Date().toLocaleString()],
    ].filter(([, value]) => value?.trim());
  }, [report]);

  const issueSummary = report ? getReportValue(report.reportText, 'Issue Summary') : '';
  const requestedAction = report ? getReportValue(report.reportText, 'Requested Engineering Action') : '';

  return (
    <main className="print-report-page">
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: Arial, Helvetica, sans-serif;
        }

        .print-report-page {
          min-height: 0;
          background: #ffffff;
          color: #000000;
          padding: calc(18px + env(safe-area-inset-top)) 12px 12px;
        }

        .print-controls {
          display: flex;
          gap: 8px;
          max-width: 8.5in;
          margin: 0 auto 12px;
          padding-top: 2px;
        }

        .print-controls button {
          min-height: 44px;
          border: 1px solid #111827;
          border-radius: 10px;
          background: #ffffff;
          color: #111827;
          padding: 0 16px;
          font: 700 16px Arial, Helvetica, sans-serif;
          touch-action: manipulation;
        }

        .print-controls button.primary {
          background: #111827;
          color: #ffffff;
        }

        .report-page {
          width: min(100%, 8.5in);
          margin: 0 auto;
          background: #ffffff;
          color: #111827;
          font-size: 11px;
          line-height: 1.24;
        }

        .brand-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #111827;
          background: #ffffff;
          color: #000000;
          padding: 5px 8px;
          margin-bottom: 6px;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid #111827;
          border-left: 6px solid #111827;
          padding: 6px 9px;
          margin-bottom: 7px;
          background: #ffffff;
        }

        .header-title-block {
          min-width: 0;
        }

        .ai-print-logo {
          flex: 0 0 auto;
          width: 124px;
          max-width: 33%;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .kicker {
          color: #374151;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        h1 {
          margin: 2px 0;
          color: #111827;
          font-size: 18px;
          line-height: 1.02;
        }

        .subtitle {
          margin: 0;
          color: #4b5563;
          font-size: 9.5px;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 7px;
          background: #ffffff;
        }

        th,
        td {
          border: 1px solid #d1d5db;
          padding: 4px 6px;
          vertical-align: top;
          text-align: left;
        }

        th {
          width: 32%;
          background: #f3f4f6;
          color: #111827;
          font-size: 8.5px;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        td {
          background: #ffffff;
          color: #111827;
          font-weight: 600;
        }

        .callout {
          border: 1px solid #111827;
          border-left: 5px solid #111827;
          padding: 6px 8px;
          margin: 0 0 6px;
          background: #ffffff;
        }

        .callout h2 {
          margin: 0 0 3px;
          color: #111827;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        .callout p {
          margin: 0;
          color: #111827;
          font-weight: 600;
        }

        .section-title {
          margin: 7px 0 4px;
          border-bottom: 1px solid #111827;
          padding-bottom: 3px;
          color: #111827;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        .report-box {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          padding: 6px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .error-box {
          max-width: 8.5in;
          margin: 24px auto;
          border: 1px solid #d1d5db;
          padding: 16px;
          color: #111827;
          background: #ffffff;
        }

        @page {
          size: letter;
          margin: 0.18in;
        }

        @media (max-width: 520px) {
          .header {
            align-items: flex-start;
          }

          .ai-print-logo {
            width: 104px;
            max-width: 38%;
          }
        }

        @media print {
          html,
          body {
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #__next,
          .print-report-page {
            display: block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .print-controls {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .report-page {
            display: block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
            line-height: 1.22 !important;
            background: #ffffff !important;
            color: #000000 !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .brand-bar,
          .header,
          table,
          .callout,
          .section-title,
          .report-box {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .header {
            padding: 5px 8px !important;
          }

          .ai-print-logo {
            width: 112px !important;
            max-width: 31% !important;
          }

          .report-box {
            margin-bottom: 0 !important;
          }
        }
      `}</style>

      <div className="print-controls">
        <button type="button" onClick={() => window.history.back()}>Back</button>
        <button className="primary" type="button" onClick={() => window.print()}>Print / Save PDF</button>
      </div>

      {report ? (
        <article className="report-page">
          <div className="brand-bar"><span>AI-CAS</span><span>Corrective Action System</span></div>
          <header className="header">
            <div className="header-title-block">
              <div className="kicker">Corrective Action System</div>
              <h1>Engineering Correction Report</h1>
              <p className="subtitle">Powered by Applied Intelligence Framework · Print-Ready Correction Document</p>
            </div>
            <img
              className="ai-print-logo"
              src="/assets/applied-intelligence-logo.png"
              alt="Applied Intelligence"
            />
          </header>

          <table>
            <tbody>
              {fields.map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {issueSummary && (
            <section className="callout">
              <h2>Issue Summary</h2>
              <p>{issueSummary}</p>
            </section>
          )}

          {requestedAction && (
            <section className="callout">
              <h2>Requested Engineering Action</h2>
              <p>{requestedAction}</p>
            </section>
          )}

          <h2 className="section-title">Full Engineering Correction Report</h2>
          <section className="report-box">{report.reportText}</section>
        </article>
      ) : (
        <section className="error-box">
          <h1>Print Report Not Available</h1>
          <p>{loadError || 'Loading report data...'}</p>
        </section>
      )}
    </main>
  );
}
````````

## `app/globals.css`

````````css
:root {
  --bg: #02050a;
  --bg-deep: #000206;
  --panel: #08111d;
  --panel-strong: #0d1b2b;
  --panel-raised: #122033;
  --border: rgba(255, 255, 255, 0.12);
  --border-strong: rgba(255, 255, 255, 0.22);
  --text: #f8fbff;
  --muted: #98a8ba;
  --muted-strong: #c7d1de;
  --blue: #1f8cff;
  --blue-strong: #58aaff;
  --blue-soft: rgba(31, 140, 255, 0.16);
  --red: #e53935;
  --red-strong: #ff5c58;
  --red-soft: rgba(229, 57, 53, 0.15);
  --green: #35d07f;
  --green-soft: rgba(53, 208, 127, 0.15);
  --shadow-soft: 0 24px 80px rgba(0, 0, 0, 0.38);
  --shadow-glow: 0 0 54px rgba(31, 140, 255, 0.16);
  --nav-clearance: 40px;
}

* {
  box-sizing: border-box;
  min-width: 0;
}

html,
body {
  width: 100%;
  max-width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

html {
  background: var(--bg);
}

body {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% -15rem, rgba(31, 140, 255, 0.28), transparent 36rem),
    radial-gradient(circle at 8% 18rem, rgba(229, 57, 53, 0.1), transparent 25rem),
    linear-gradient(180deg, #050b13 0%, var(--bg) 46%, var(--bg-deep) 100%);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(2, 5, 10, 1) 0%, rgba(2, 5, 10, 0.94) 9%, rgba(2, 5, 10, 0) 30%),
    radial-gradient(circle at 50% 0, rgba(31, 140, 255, 0.22), transparent 28rem);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  border: 0;
  -webkit-tap-highlight-color: transparent;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.launch-splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  padding: calc(24px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at 18% 38%, rgba(31, 140, 255, 0.24), transparent 16rem),
    radial-gradient(circle at 88% 62%, rgba(229, 57, 53, 0.17), transparent 15rem),
    linear-gradient(180deg, #050b13 0%, #02050a 54%, #000206 100%);
  animation: splash-fade-in 180ms ease-out both;
}

.launch-splash-card {
  display: grid;
  width: min(100%, 390px);
  gap: 12px;
  justify-items: center;
  text-align: center;
  border: 1px solid rgba(31, 140, 255, 0.22);
  border-radius: 34px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.022)),
    radial-gradient(circle at 50% 0, rgba(31, 140, 255, 0.22), transparent 15rem),
    rgba(5, 12, 22, 0.88);
  box-shadow: 0 26px 90px rgba(0, 0, 0, 0.58), 0 0 62px rgba(31, 140, 255, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  padding: 34px 20px 28px;
  backdrop-filter: blur(20px);
}

.launch-splash-kicker {
  color: var(--blue-strong);
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.2em;
  text-shadow: 0 0 24px rgba(31, 140, 255, 0.3);
}

.launch-splash h1 {
  max-width: 12ch;
  margin: 0;
  color: var(--text);
  font-size: clamp(34px, 10vw, 48px);
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.launch-splash p {
  max-width: 28ch;
  margin: 0;
  color: var(--muted-strong);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.4;
}

.launch-splash-status {
  display: inline-flex;
  flex-shrink: 1;
  align-items: center;
  gap: 9px;
  margin-top: 10px;
  border: 1px solid rgba(53, 208, 127, 0.3);
  border-radius: 999px;
  padding: 10px 13px;
  background: rgba(53, 208, 127, 0.08);
  color: var(--green);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.15;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
}

@keyframes splash-fade-in {
  from {
    opacity: 0;
    transform: scale(1.012);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.app-shell {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  padding: calc(18px + env(safe-area-inset-top)) 16px calc(var(--nav-clearance) + env(safe-area-inset-bottom));
  background: transparent;
}

.app-frame {
  position: relative;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  overflow-x: hidden;
  padding-bottom: calc(var(--nav-clearance) + env(safe-area-inset-bottom));
}

.app-frame::before {
  content: "";
  position: absolute;
  top: 76px;
  left: 12%;
  right: 12%;
  height: 220px;
  z-index: -1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(31, 140, 255, 0.2), transparent 68%);
  filter: blur(4px);
}

.status-pill,
.step-pill,
.field-status {
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.08em;
  line-height: 1.15;
  text-align: center;
  text-transform: uppercase;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
}

.step-pill {
  background: rgba(255, 255, 255, 0.035);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.status-pill {
  background: linear-gradient(180deg, rgba(53, 208, 127, 0.18), rgba(53, 208, 127, 0.08));
  color: var(--green);
  border-color: rgba(53, 208, 127, 0.38);
  box-shadow: 0 0 28px rgba(53, 208, 127, 0.12);
}

.status-dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 18px rgba(53, 208, 127, 0.8);
}

.hero {
  display: grid;
  max-width: 100%;
  gap: 18px;
  justify-items: center;
  text-align: center;
  border: 1px solid rgba(31, 140, 255, 0.25);
  border-radius: 32px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.022)),
    radial-gradient(circle at 50% -15%, rgba(31, 140, 255, 0.32), transparent 17rem),
    radial-gradient(circle at 95% 0, rgba(53, 208, 127, 0.1), transparent 14rem),
    var(--panel);
  box-shadow: var(--shadow-soft), var(--shadow-glow), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  padding: 28px 18px 21px;
}

.brand-mark {
  display: grid;
  max-width: 100%;
  gap: 6px;
  justify-items: center;
  margin-top: 4px;
}

.brand-kicker {
  color: var(--blue-strong);
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.2em;
  text-shadow: 0 0 24px rgba(31, 140, 255, 0.25);
}

.brand-title {
  margin: 0;
  max-width: 10ch;
  font-size: clamp(35px, 11.5vw, 50px);
  line-height: 0.92;
  letter-spacing: -0.065em;
  overflow-wrap: anywhere;
}

.brand-subtitle,
.helper-text,
.card p,
.field-help {
  color: var(--muted);
}

.brand-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.36;
  overflow-wrap: anywhere;
}

.helper-text {
  margin: 0;
  color: var(--muted-strong);
  font-weight: 800;
  overflow-wrap: anywhere;
}

.screen-title {
  display: grid;
  max-width: 100%;
  gap: 8px;
  margin: 8px 0 18px;
}

.screen-title > .step-pill {
  justify-self: start;
  max-inline-size: 100%;
}

.screen-title h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.047em;
  overflow-wrap: anywhere;
}

.screen-title p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.card-grid,
.stack {
  display: grid;
  max-width: 100%;
  gap: 14px;
}

.stack {
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}

body:has(.home-screen) .app-frame > .screen-title:first-child {
  display: none;
}

.home-screen {
  padding-top: 8px;
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
}

.workflow-preview {
  max-width: 100%;
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
}

.card {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.063), rgba(255, 255, 255, 0.018)),
    var(--panel);
  box-shadow: var(--shadow-soft), inset 0 1px 0 rgba(255, 255, 255, 0.045);
  padding: 18px;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.card-grid .card,
.workflow-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02)),
    linear-gradient(135deg, rgba(31, 140, 255, 0.09), rgba(255, 255, 255, 0.01)),
    var(--panel);
}

.card-header {
  display: flex;
  max-width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 13px;
}

.card-header > div {
  min-width: 0;
  max-width: 100%;
}


.review-badge-header {
  align-items: flex-start;
}

.review-badge-header > div {
  flex: 1 1 min(100%, 240px);
  width: 100%;
}

.review-badge-row {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.review-badge-row .status-pill,
.review-badge-row .step-pill,
.review-badge-row .field-status {
  max-width: 100%;
  max-inline-size: 100%;
  min-width: 0;
  flex: 0 1 auto;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.card h2,
.card h3 {
  margin: 0;
  color: var(--text);
  letter-spacing: -0.035em;
  overflow-wrap: anywhere;
}

.card h2 {
  font-size: 20px;
  line-height: 1.08;
}

.card h3 {
  font-size: 16px;
  line-height: 1.15;
}

.card p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.workflow-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 13px;
  align-items: start;
  border-color: rgba(31, 140, 255, 0.16);
}

.workflow-card h3 {
  margin-bottom: 2px;
}

.step-number {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(31, 140, 255, 0.28);
  border-radius: 15px;
  background: linear-gradient(180deg, rgba(31, 140, 255, 0.22), rgba(31, 140, 255, 0.08));
  color: var(--blue-strong);
  font-weight: 950;
  line-height: 1;
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: normal;
  box-shadow: 0 0 22px rgba(31, 140, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.form-grid {
  display: grid;
  max-width: 100%;
  gap: 13px;
}

label {
  display: grid;
  max-width: 100%;
  gap: 7px;
  color: var(--muted-strong);
  font-size: 13px;
  font-weight: 850;
}

label:has(input[type="checkbox"]),
label:has(input[type="radio"]) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

#router-upload-input {
  display: none;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="search"],
input[type="tel"],
input[type="url"],
input[type="password"],
select,
textarea {
  width: 100%;
  max-width: 100%;
  border: 1px solid var(--border);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-size: 16px;
  line-height: 1.25;
  padding: 13px 14px;
  outline: none;
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="number"]:focus,
input[type="search"]:focus,
input[type="tel"]:focus,
input[type="url"]:focus,
input[type="password"]:focus,
select:focus,
textarea:focus {
  border-color: rgba(31, 140, 255, 0.66);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(31, 140, 255, 0.1);
}

input[type="checkbox"],
input[type="radio"] {
  width: auto;
  min-width: 17px;
  height: 17px;
  margin: 0;
  accent-color: var(--green);
}

textarea {
  min-height: 116px;
  resize: vertical;
}

select option {
  color: #111827;
}

.action-row {
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.button {
  display: inline-flex;
  min-width: 0;
  min-height: 49px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0 16px;
  color: white;
  font-weight: 950;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  line-height: 1.1;
  overflow-wrap: anywhere;
  transition: transform 120ms ease, box-shadow 150ms ease, background 150ms ease, opacity 150ms ease;
}

.button:active:not(:disabled) {
  transform: scale(0.985);
}

.button.primary {
  background: linear-gradient(135deg, #2a96ff, #0b5bc5);
  box-shadow: 0 16px 36px rgba(31, 140, 255, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.button.danger {
  background: linear-gradient(135deg, var(--red-strong), #b91f1b);
  box-shadow: 0 16px 36px rgba(229, 57, 53, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.button.success {
  background: linear-gradient(135deg, #3ee38e, #168a50);
  color: #02130a;
  box-shadow: 0 16px 34px rgba(53, 208, 127, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.button.secondary {
  border: 1px solid var(--border-strong);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055);
}

.full-width {
  width: 100%;
}

.field-list {
  display: grid;
  max-width: 100%;
  gap: 10px;
}

.field-row {
  display: grid;
  max-width: 100%;
  gap: 9px;
  border: 1px solid var(--border);
  border-radius: 19px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.field-row strong {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--text);
  font-size: 13px;
}

.field-value {
  color: var(--text);
  font-size: 16px;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.field-help {
  margin: 9px 0 0;
  font-size: 13px;
  line-height: 1.43;
}

.field-status.confirmed {
  background: linear-gradient(180deg, rgba(53, 208, 127, 0.18), rgba(53, 208, 127, 0.08));
  border-color: rgba(53, 208, 127, 0.36);
  color: var(--green);
}

.upload-preview {
  width: 100%;
  max-width: 100%;
  max-height: 278px;
  border: 1px solid var(--border);
  border-radius: 18px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 18px 36px rgba(0, 0, 0, 0.22);
}

.preview-box {
  min-height: 132px;
  max-width: 100%;
  border: 1px dashed rgba(255, 255, 255, 0.22);
  border-radius: 19px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted-strong);
  font-size: 13px;
  line-height: 1.56;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.nav-dock {
  position: sticky;
  z-index: 20;
  left: auto;
  right: auto;
  bottom: calc(8px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  width: min(100%, 460px);
  max-width: 460px;
  margin: 16px auto calc(8px + env(safe-area-inset-bottom));
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025)),
    rgba(3, 9, 16, 0.94);
  box-shadow: 0 22px 76px rgba(0, 0, 0, 0.6), 0 0 42px rgba(31, 140, 255, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px);
  padding: 8px;
}

.nav-button {
  min-width: 0;
  border-radius: 17px;
  background: transparent;
  color: var(--muted);
  padding: 10px 4px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.1;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.nav-button.active {
  background: linear-gradient(180deg, rgba(31, 140, 255, 0.24), rgba(31, 140, 255, 0.1));
  color: var(--blue-strong);
  box-shadow: inset 0 0 0 1px rgba(31, 140, 255, 0.2), 0 0 18px rgba(31, 140, 255, 0.08);
}

.placeholder-list {
  display: grid;
  max-width: 100%;
  gap: 10px;
}

.placeholder-item {
  max-width: 100%;
  border: 1px solid var(--border);
  border-radius: 19px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.placeholder-item strong,
.placeholder-item span {
  display: block;
}

.placeholder-item strong {
  color: var(--text);
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.placeholder-item span {
  margin-top: 5px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

@media (min-width: 484px) {
  .nav-dock {
    left: auto;
    right: auto;
    width: min(460px, calc(100% - 24px));
    transform: none;
  }
}

@media (min-width: 768px) {
  :root {
    --nav-clearance: 40px;
  }

  .app-shell {
    padding-top: calc(24px + env(safe-area-inset-top));
    padding-inline: clamp(20px, 5vw, 56px);
  }

  .app-frame {
    max-width: min(100%, 760px);
  }

  .app-frame::before {
    left: 18%;
    right: 18%;
    height: 260px;
  }

  .nav-dock {
    width: min(560px, calc(100vw - 48px));
    max-width: 560px;
    gap: 6px;
  }
}

@media (min-width: 1024px) {
  :root {
    --nav-clearance: 40px;
  }

  .app-shell {
    padding-inline: clamp(32px, 6vw, 80px);
  }

  .app-frame {
    max-width: min(100%, 1120px);
  }

  .stack {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 0.82fr);
    align-items: start;
    gap: 18px;
  }

  .stack > .screen-title {
    grid-column: 1 / -1;
  }

  .stack > .screen-title + .card:last-child {
    grid-column: 1 / -1;
  }

  .review-panel-screen,
  .record-review-screen {
    grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  }

  .review-panel-screen > .screen-title,
  .record-review-screen > .screen-title {
    grid-column: 1 / -1;
  }

  .review-report-panel,
  .review-action-panel,
  .record-list-panel,
  .record-detail-panel {
    align-self: start;
  }

  .record-review-screen > .record-list-panel:only-child {
    grid-column: 1 / -1;
  }

  .record-list-panel {
    max-height: min(68vh, 680px);
    overflow: auto;
    padding-right: 2px;
  }

  .review-panel-screen .preview-box,
  .record-detail-panel .preview-box {
    max-height: min(62vh, 620px);
    overflow: auto;
  }

  .review-action-panel,
  .record-detail-panel {
    position: sticky;
    top: calc(24px + env(safe-area-inset-top));
  }

  .review-action-panel .preview-box,
  .record-detail-panel .preview-box + h3 + .preview-box {
    max-height: min(42vh, 420px);
  }

  .home-screen {
    grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1fr);
    align-items: start;
  }

  .home-screen,
  .workflow-preview {
    padding-bottom: 0;
  }

  .placeholder-list,
  .workflow-preview {
    align-content: start;
  }

  .nav-dock {
    width: min(620px, calc(100vw - 64px));
    max-width: 620px;
  }
}

@media (max-width: 480px) {
  .card-header {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .status-pill,
  .step-pill,
  .field-status {
    width: auto;
    max-width: 100%;
    justify-content: flex-start;
    text-align: left;
  }
  .review-badge-row {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .review-badge-row .status-pill,
  .review-badge-row .step-pill,
  .review-badge-row .field-status {
    width: 100%;
    max-width: 100%;
    max-inline-size: 100%;
  }

}

@media (max-width: 380px) {
  .app-shell {
    padding-inline: 12px;
  }

  .card,
  .hero {
    border-radius: 22px;
    padding: 15px;
  }

  .nav-button {
    font-size: 11px;
    padding-inline: 3px;
  }
}
````````

## `package.json`

````````json
{
  "name": "refab-connect-core-reskin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.3.8",
    "react": "19.1.2",
    "react-dom": "19.1.2",
    "resend": "^4.1.2"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "typescript": "^5.8.3"
  }
}
````````

## `docs/v6/V6-M6_PDF_EMAIL_CLOSEOUT_SOURCE_OF_TRUTH.md`

````````markdown
# V6-M6 — V6 PDF / Email Closeout Source of Truth

## Purpose

V6 exists to lock the controlled closeout path for AI-CAS corrective action packages:

- Controlled PDF generation
- Email delivery with the generated PDF attached

## Passed / Merged Milestones

- V6-M1 Branding Patch / Print + Email Layer
- V6-M2 Server-Side PDF Generation Foundation
- V6-M3 Controlled PDF Download from Review
- V6-M4 Email With PDF Attachment Foundation
- V6-M5 Post-Merge PDF / Email Smoke Check

## Merged PRs

- PR #4
- PR #5
- PR #6
- PR #7
- PR #8

## Locked Behavior

- AI-CAS branding only
- PDF generation requires final human review
- Review download appears only after final human review
- Email with PDF requires generated package, final human review, and 4-digit Send PIN
- Evidence photos remain text-only / not attached
- Simple Mode flow preserved

## Closeout Statement

V6-M6 records the V6 PDF / Email closeout source of truth only.

No runtime UI, application logic, or feature behavior is changed by this document.
````````
