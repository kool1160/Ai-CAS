import { useEffect, useState, type ChangeEvent } from 'react';
import type { ActionFeedback, UploadedFileInfo } from '../types/wocSessionTypes';

const PHOTO_EVIDENCE_STORAGE_KEY = 'refab-connect-photo-evidence';
const CAPTURE_CONTEXT_STORAGE_KEY = 'refab-connect-v4-capture-context';

const evidenceLabelOptions = [
  'Correct condition',
  'Incorrect condition',
  'Gauge / check evidence',
  'Staging evidence',
  'Other supporting evidence',
];

type PhotoEvidenceInfo = {
  evidenceAttached: boolean;
  evidenceFileName: string;
  evidenceFileType: string;
  evidenceFileSize: number;
  previewUrl: string | null;
};

type CaptureContext = {
  shortIssueDescription: string;
  evidenceLabel: string;
};

type CaptureScreenProps = {
  manualEntry: string;
  uploadedFile: UploadedFileInfo | null;
  uploadFeedback: string | null;
  extractionFeedback: ActionFeedback;
  isExtracting: boolean;
  onManualEntryChange: (value: string) => void;
  onUploadFile: (file: File | null) => void;
  onClearUpload: () => void;
  onExtractData: () => void;
  onCaptureRouter: () => void;
};

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getOpenAiVisionStatus(isExtracting: boolean, extractionFeedback: ActionFeedback) {
  if (isExtracting) return 'Extracting router/work-order data with AI Vision...';
  if (!extractionFeedback) return '';
  if (extractionFeedback.tone === 'error') return `AI Vision could not extract the image. Manual entry is still available. ${extractionFeedback.message}`;
  if (extractionFeedback.message.toLowerCase().includes('completed')) return 'AI Vision extraction complete. Review the key fields on Confirm.';
  return extractionFeedback.message;
}

function savePhotoEvidenceMetadata(evidence: PhotoEvidenceInfo | null, evidenceLabel = '') {
  if (typeof window === 'undefined') return;

  if (!evidence) {
    window.sessionStorage.removeItem(PHOTO_EVIDENCE_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(
    PHOTO_EVIDENCE_STORAGE_KEY,
    JSON.stringify({
      evidenceAttached: true,
      evidenceFileName: evidence.evidenceFileName,
      evidenceFileType: evidence.evidenceFileType,
      evidenceFileSize: evidence.evidenceFileSize,
      evidenceLabel,
    }),
  );
}

function loadPhotoEvidenceMetadata(): PhotoEvidenceInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PHOTO_EVIDENCE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PhotoEvidenceInfo>;
    if (!parsed.evidenceAttached || !parsed.evidenceFileName) return null;

    return {
      evidenceAttached: true,
      evidenceFileName: String(parsed.evidenceFileName),
      evidenceFileType: typeof parsed.evidenceFileType === 'string' ? parsed.evidenceFileType : '',
      evidenceFileSize: typeof parsed.evidenceFileSize === 'number' ? parsed.evidenceFileSize : 0,
      previewUrl: null,
    };
  } catch {
    window.sessionStorage.removeItem(PHOTO_EVIDENCE_STORAGE_KEY);
    return null;
  }
}

function loadCaptureContext(): CaptureContext {
  if (typeof window === 'undefined') return { shortIssueDescription: '', evidenceLabel: '' };

  try {
    const raw = window.sessionStorage.getItem(CAPTURE_CONTEXT_STORAGE_KEY);
    if (!raw) return { shortIssueDescription: '', evidenceLabel: '' };
    const parsed = JSON.parse(raw) as Partial<CaptureContext>;
    return {
      shortIssueDescription: typeof parsed.shortIssueDescription === 'string' ? parsed.shortIssueDescription : '',
      evidenceLabel: typeof parsed.evidenceLabel === 'string' ? parsed.evidenceLabel : '',
    };
  } catch {
    window.sessionStorage.removeItem(CAPTURE_CONTEXT_STORAGE_KEY);
    return { shortIssueDescription: '', evidenceLabel: '' };
  }
}

function saveCaptureContext(context: CaptureContext) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(CAPTURE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
}

export function CaptureScreen({
  manualEntry,
  uploadedFile,
  uploadFeedback,
  extractionFeedback,
  isExtracting,
  onManualEntryChange,
  onUploadFile,
  onClearUpload,
  onExtractData,
  onCaptureRouter,
}: CaptureScreenProps) {
  const [photoEvidence, setPhotoEvidence] = useState<PhotoEvidenceInfo | null>(null);
  const [photoEvidenceFeedback, setPhotoEvidenceFeedback] = useState<string | null>(null);
  const [shortIssueDescription, setShortIssueDescription] = useState('');
  const [evidenceLabel, setEvidenceLabel] = useState('');
  const openAiVisionStatus = getOpenAiVisionStatus(isExtracting, extractionFeedback);

  useEffect(() => {
    const captureContext = loadCaptureContext();
    setPhotoEvidence(loadPhotoEvidenceMetadata());
    setShortIssueDescription(captureContext.shortIssueDescription);
    setEvidenceLabel(captureContext.evidenceLabel);

    return () => {
      setPhotoEvidence((current) => {
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
        return current;
      });
    };
  }, []);

  const updateCaptureContext = (nextContext: Partial<CaptureContext>) => {
    const mergedContext = {
      shortIssueDescription,
      evidenceLabel,
      ...nextContext,
    };

    setShortIssueDescription(mergedContext.shortIssueDescription);
    setEvidenceLabel(mergedContext.evidenceLabel);
    saveCaptureContext(mergedContext);

    const contextLines = [
      mergedContext.shortIssueDescription ? `Issue: ${mergedContext.shortIssueDescription}` : '',
      mergedContext.evidenceLabel ? `Evidence label: ${mergedContext.evidenceLabel}` : '',
    ].filter(Boolean);

    onManualEntryChange(contextLines.join('\n'));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUploadFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const handlePhotoEvidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    setPhotoEvidence((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);

      if (!file) {
        setPhotoEvidenceFeedback('No photo evidence selected.');
        savePhotoEvidenceMetadata(null);
        return null;
      }

      if (!file.type.startsWith('image/')) {
        setPhotoEvidenceFeedback('Photo evidence must be an image file.');
        savePhotoEvidenceMetadata(null);
        return null;
      }

      const nextEvidence: PhotoEvidenceInfo = {
        evidenceAttached: true,
        evidenceFileName: file.name,
        evidenceFileType: file.type,
        evidenceFileSize: file.size,
        previewUrl: URL.createObjectURL(file),
      };

      savePhotoEvidenceMetadata(nextEvidence, evidenceLabel);
      setPhotoEvidenceFeedback(`${file.name} added as optional evidence. Stored locally for this session.`);
      return nextEvidence;
    });
  };

  const clearPhotoEvidence = () => {
    setPhotoEvidence((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    savePhotoEvidenceMetadata(null);
    setPhotoEvidenceFeedback('Photo evidence cleared.');
  };

  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Capture Router</h1>
        <p>Upload or photograph the router/work order. AI-CAS extracts the job context before you confirm it.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">AI VISION FIRST</span>
            <h2>Upload Router / Work Order</h2>
            <p>Take a photo or upload an image, then extract the job fields.</p>
          </div>
          <span className={uploadedFile ? 'field-status confirmed' : 'field-status'}>{uploadedFile ? 'Ready' : 'Needed'}</span>
        </div>

        <div className="action-row">
          <label className="button primary" htmlFor="router-camera-input">Take Photo</label>
          <input accept="image/*" capture="environment" hidden id="router-camera-input" onChange={handleFileChange} type="file" />
          <label className="button primary" htmlFor="router-upload-input">Upload Image</label>
          <input accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx" hidden id="router-upload-input" onChange={handleFileChange} type="file" />
          <button className="button primary full-width" type="button" disabled={!uploadedFile || !uploadedFile.isImage || isExtracting} onClick={onExtractData}>
            {isExtracting ? 'Extracting...' : 'Extract with AI Vision'}
          </button>
        </div>

        {uploadedFile && (
          <div className="field-row" style={{ marginTop: 14 }}>
            <strong>Selected File<span className="field-status confirmed">Ready</span></strong>
            <span className="field-value">{uploadedFile.name}</span>
            <span className="field-help">{uploadedFile.type || 'Unknown file type'} · {formatFileSize(uploadedFile.size)}</span>
            {!uploadedFile.isImage && <span className="field-help">AI Vision extraction needs an image. Manual entry is still available below.</span>}
            {uploadedFile.isImage && uploadedFile.previewUrl && <img alt="Uploaded router preview" className="upload-preview" src={uploadedFile.previewUrl} />}
          </div>
        )}

        {uploadFeedback && <p className="field-help">{uploadFeedback}</p>}
        {openAiVisionStatus && <p className="field-help">{openAiVisionStatus}</p>}

        <div className="action-row">
          <button className="button secondary" type="button" disabled={!uploadedFile || isExtracting} onClick={onClearUpload}>Clear Upload</button>
          <button className="button secondary" type="button" onClick={onCaptureRouter}>Skip to Confirm</button>
        </div>
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">OPTIONAL</span>
            <h2>Issue Note</h2>
            <p>Add one short note now, or leave it for Generate.</p>
          </div>
        </div>
        <label>
          What is wrong?
          <textarea
            value={shortIssueDescription}
            onChange={(event) => updateCaptureContext({ shortIssueDescription: event.target.value })}
            placeholder="Example: Hole size failed no-go pin check."
            style={{ minHeight: 120 }}
          />
        </label>
      </article>

      <details className="card">
        <summary>
          <strong>Evidence Photo</strong>
          <p className="field-help">Optional supporting image. Kept collapsed so Capture stays quick.</p>
        </summary>
        <div className="form-grid" style={{ marginTop: 14 }}>
          <label>
            Evidence Label
            <select value={evidenceLabel} onChange={(event) => updateCaptureContext({ evidenceLabel: event.target.value })}>
              <option value="">Select evidence context</option>
              {evidenceLabelOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="action-row">
          <label className="button secondary" htmlFor="evidence-camera-input">Take Evidence Photo</label>
          <input accept="image/*" capture="environment" hidden id="evidence-camera-input" onChange={handlePhotoEvidenceChange} type="file" />
          <label className="button secondary" htmlFor="evidence-upload-input">Upload Evidence Photo</label>
          <input accept="image/*" hidden id="evidence-upload-input" onChange={handlePhotoEvidenceChange} type="file" />
          <button className="button secondary" type="button" disabled={!photoEvidence} onClick={clearPhotoEvidence}>Clear Evidence</button>
        </div>
        {photoEvidenceFeedback && <p className="field-help">{photoEvidenceFeedback}</p>}
        {photoEvidence && (
          <div className="field-row" style={{ marginTop: 14 }}>
            <strong>Evidence Image<span className="field-status confirmed">Ready</span></strong>
            <span className="field-value">{photoEvidence.evidenceFileName}</span>
            <span className="field-help">{photoEvidence.evidenceFileType || 'Unknown image type'} · {formatFileSize(photoEvidence.evidenceFileSize)}</span>
            <span className="field-help">Evidence label: {evidenceLabel || 'Not selected yet'}</span>
            {photoEvidence.previewUrl && <img alt="Photo evidence preview" className="upload-preview" src={photoEvidence.previewUrl} />}
          </div>
        )}
      </details>

      <details className="card">
        <summary>
          <strong>Manual Fallback</strong>
          <p className="field-help">Use only when the image is unclear or AI Vision cannot read the router.</p>
        </summary>
        <div className="form-grid" style={{ marginTop: 14 }}>
          <label>
            Router/Header Notes
            <textarea value={manualEntry} onChange={(event) => onManualEntryChange(event.target.value)} placeholder="Paste or type work order/router information here." />
          </label>
        </div>
        <div className="action-row">
          <button className="button primary full-width" type="button" onClick={onCaptureRouter}>Continue to Confirm</button>
        </div>
      </details>
    </section>
  );
}
