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
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [aiDraftFeedback, setAiDraftFeedback] = useState<ActionFeedback>(null);
  const [aiCorrectiveActionDraft, setAiCorrectiveActionDraft] = useState<AiCorrectiveActionDraftResult | null>(null);
  const [structuredDraft, setStructuredDraft] = useState<StructuredCorrectiveActionDraft | null>(null);
  const [photoEvidenceItems, setPhotoEvidenceItems] = useState<ReviewPhotoEvidence[]>([]);
  const [photoEvidenceFeedback, setPhotoEvidenceFeedback] = useState<ActionFeedback>(null);
  const [reviewOutputFeedback, setReviewOutputFeedback] = useState<ActionFeedback>(null);
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

  return (
    <section className="stack review-panel-screen">
      <div className="screen-title">
        <h1>Review / Draft Control</h1>
        <p>Review the editable corrective action draft. Final PDF/export release remains locked until future V4 controlled release flow is built.</p>
      </div>

      {controlledPdfPreview && <ControlledPdfPreviewRenderer template={controlledPdfPreview} />}

      <article className="card review-photo-evidence-panel">
        <div className="card-header">
          <div>
            <span className="step-pill">REVIEW EVIDENCE · LOCAL SESSION ONLY</span>
            <h2>Review-Step Photo Evidence</h2>
            <p>Add up to 3 labeled photos for controlled preview context. No export or PDF image embedding is enabled.</p>
          </div>
          <span className="field-status">{photoEvidenceItems.length}/3</span>
        </div>
        <div className="action-row">
          <label className="button secondary" htmlFor="review-evidence-upload-input">Add Evidence Photo</label>
          <input accept="image/*" hidden id="review-evidence-upload-input" onChange={addPhotoEvidence} type="file" />
        </div>
        {photoEvidenceFeedback && (
          <p className="field-help">{photoEvidenceFeedback.tone === 'success' ? 'Evidence: ' : 'Evidence error: '}{photoEvidenceFeedback.message}</p>
        )}
        {photoEvidenceItems.length > 0 && (
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {photoEvidenceItems.map((item, index) => (
              <div className="placeholder-item" key={item.id}>
                <strong>Evidence Photo {index + 1}</strong>
                <span>{item.fileName} · {formatFileSize(item.fileSize)}</span>
                <img alt={`Review evidence ${index + 1}`} className="upload-preview" src={item.previewUrl} style={{ marginTop: 10 }} />
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
      </article>

      {aiDraftFoundation && (
        <article className="card review-ai-draft-foundation-panel">
          <div className="card-header">
            <div>
              <span className="step-pill">AI DRAFT FOUNDATION · CONTROLLED MANUAL REQUEST</span>
              <h2>AI Corrective Action Drafting Input Preview</h2>
              <p>Review the structured facts that will feed AI-generated corrective-action language. Output remains draft-only, editable, and unconfirmed.</p>
            </div>
            <span className="field-status">Human Review Required</span>
          </div>

          <div className="placeholder-list" style={{ marginTop: 14 }}>
            <div className="placeholder-item">
              <strong>Short Issue Description</strong>
              <span>{aiDraftFoundation.input.shortIssueDescription || '[Manual entry needed: Short Issue Description]'}</span>
            </div>
            <div className="placeholder-item">
              <strong>Evidence Label</strong>
              <span>{photoEvidenceItems.map((item) => item.label || '[Unlabeled Review evidence]').join(', ') || aiDraftFoundation.input.evidenceLabel || '[Manual entry needed: Evidence Label]'}</span>
            </div>
            <div className="placeholder-item">
              <strong>Photo Evidence Attached</strong>
              <span>{photoEvidenceItems.length > 0 ? `Yes — ${photoEvidenceItems.length} Review-step photo(s)` : aiDraftFoundation.input.photoEvidenceAttached ? 'Yes — Capture evidence present' : 'No'}</span>
            </div>
            <div className="placeholder-item">
              <strong>Photo Evidence File Name</strong>
              <span>{photoEvidenceItems.map((item) => item.fileName).join(', ') || aiDraftFoundation.input.photoEvidenceFileName || '[No photo evidence file name available]'}</span>
            </div>
          </div>

          <h3 style={{ marginTop: 16 }}>Future AI Draft Sections</h3>
          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {aiDraftFoundation.requiredOutputSections
              .filter((section) => section !== 'status')
              .map((section) => (
                <div className="placeholder-item" key={section}>
                  <strong>{formatSectionLabel(section)}</strong>
                  <span>Draft foundation ready — AI language generates only when manually requested.</span>
                </div>
              ))}
          </div>

          <div className="action-row" style={{ marginTop: 14 }}>
            <button className="button primary full-width" type="button" disabled={isGeneratingAiDraft || !generatedPackage} onClick={generateAiCorrectiveActionDraft}>
              {isGeneratingAiDraft ? 'Generating AI Corrective Action Draft...' : structuredDraft ? 'Regenerate AI Corrective Action Draft' : 'Generate AI Corrective Action Draft'}
            </button>
          </div>

          {aiDraftFeedback && (
            <p className="field-help">{aiDraftFeedback.tone === 'success' ? 'AI Draft: ' : 'AI Draft error: '}{aiDraftFeedback.message}</p>
          )}

          <p className="field-help">
            This controlled action does not export a PDF, send email, or bypass human confirmation. AI draft text must be reviewed and edited before future release.
          </p>
        </article>
      )}

      {structuredDraft && (
        <article className="card review-ai-draft-result-panel">
          <div className="card-header">
            <div>
              <span className="step-pill">STRUCTURED AI DRAFT · EDITABLE · UNCONFIRMED</span>
              <h2>Structured Corrective Action Draft</h2>
              <p>Edit each AI-generated section before any future photo/PDF/release work depends on it.</p>
            </div>
            <span className="field-status">Human Review Required</span>
          </div>

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

          <p className="field-help">Status: {structuredDraft.status}. {structuredDraft.releaseGate}</p>
        </article>
      )}

      {!structuredDraft && aiCorrectiveActionDraft && (
        <article className="card review-ai-draft-result-panel">
          <div className="card-header">
            <div>
              <span className="step-pill">AI GENERATED · DRAFT ONLY</span>
              <h2>AI Corrective Action Draft</h2>
              <p>Draft-only engineered language. Human review, editing, and confirmation remain required.</p>
            </div>
            <span className="field-status">Unconfirmed</span>
          </div>

          <div className="placeholder-list" style={{ marginTop: 14 }}>
            {aiDraftDisplaySections.map((section) => (
              <div className="placeholder-item" key={section.key}>
                <strong>{section.label}</strong>
                <span>{aiCorrectiveActionDraft[section.key] || `[Manual review needed: ${section.label}]`}</span>
              </div>
            ))}
          </div>

          <p className="field-help">Status: {aiCorrectiveActionDraft.status}. This draft is not released and does not change the controlled PDF/export gate.</p>
        </article>
      )}

      <article className="card review-report-panel">
        <div className="card-header">
          <div>
            <h2>{generatedPackage ? 'Corrective Action Draft Ready' : 'Draft Not Generated'}</h2>
            <p>Review the correction package and confirm it before any future controlled release flow unlocks.</p>
          </div>
          <span className={sendReady ? 'field-status confirmed' : 'field-status'}>{sendReady ? 'Confirmed' : 'Review Required'}</span>
        </div>
        <div className="preview-box">{enhancedReportPreview}</div>
      </article>

      <article className="card review-action-panel">
        <h2>Engineering Email Draft</h2>
        <div className="preview-box">{enhancedEmailPreview}</div>

        <div className="action-row">
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={() => copyEnhancedOutput(enhancedReportPreview, 'Engineering report draft')}>Copy Report Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={() => copyEnhancedOutput(enhancedEmailPreview, 'Email draft')}>Copy Email Draft</button>
          <button className="button secondary" type="button" disabled={!generatedPackage || isSending} onClick={onSaveDraft}>Save Draft</button>
        </div>

        <div className="action-row">
          <button className="button secondary full-width" type="button" disabled>
            Future Controlled PDF / Export Flow — Not Yet Enabled
          </button>
        </div>

        {reviewOutputFeedback && (
          <p className="field-help">{reviewOutputFeedback.tone === 'success' ? 'Review output: ' : 'Review output error: '}{reviewOutputFeedback.message}</p>
        )}

        {copyFeedback && (
          <p className="field-help">{copyFeedback.tone === 'success' ? 'Copied: ' : 'Copy error: '}{copyFeedback.message}</p>
        )}

        {saveFeedback && (
          <p className="field-help">{saveFeedback.tone === 'success' ? 'Saved: ' : 'Save error: '}{saveFeedback.message}</p>
        )}

        {sendFeedback && (
          <p className="field-help">{sendFeedback.tone === 'success' ? 'Send placeholder: ' : 'Send placeholder error: '}{sendFeedback.message}</p>
        )}

        {photoEvidenceItems.length > 0 && (
          <p className="field-help">Save note: Review-step photo evidence is local/session-only. Current draft save keeps existing generated record text unless future record-model support is added.</p>
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
