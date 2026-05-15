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
        <div className="card-header">
          <div>
            <span className="step-pill">AI-GENERATED DRAFT</span>
            <h2>{generatedPackage ? 'Corrective Action Draft' : 'Draft Not Generated'}</h2>
            <p>Generated draft language for review. Advanced editing tools are available below if needed.</p>
          </div>
          <span className={confirmations.finalReviewConfirmed ? 'field-status confirmed' : 'field-status'}>
            {confirmations.finalReviewConfirmed ? 'Reviewed' : 'Review Required'}
          </span>
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
        <div className="card-header">
          <div>
            <span className="step-pill">EVIDENCE SUMMARY</span>
            <h2>Evidence</h2>
            <p>Attached evidence remains local/session-only. Export, print, email, and PDF image release are not enabled.</p>
          </div>
          <span className="field-status">{photoEvidenceItems.length}/3</span>
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
        <div className="card-header">
          <div>
            <h2>Human Confirmation</h2>
            <p>Confirm review, then copy or save the draft. Release actions remain disabled.</p>
          </div>
          <span className={sendReady ? 'field-status confirmed' : 'field-status'}>{sendReady ? 'Confirmed' : 'Review Required'}</span>
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
        </div>

        <div className="action-row">
          <button className="button secondary full-width" type="button" disabled>
            Future Controlled PDF / Export Flow — Not Yet Enabled
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
              placeholder="Disabled until controlled release flow"
            />
          </label>
          <p className="field-help">Direct send/export remains intentionally disabled.</p>
        </div>

        <div className="action-row">
          <button className="button danger full-width" type="button" disabled onClick={onSendEmail}>
            Future Controlled Release Flow — Disabled
          </button>
        </div>
      </details>
    </section>
  );
}
