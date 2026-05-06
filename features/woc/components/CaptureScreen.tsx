import { useEffect, useState, type ChangeEvent } from 'react';
import type { ActionFeedback, UploadedFileInfo } from '../types/wocSessionTypes';

const PHOTO_EVIDENCE_STORAGE_KEY = 'refab-connect-photo-evidence';

type PhotoEvidenceInfo = {
  evidenceAttached: boolean;
  evidenceFileName: string;
  evidenceFileType: string;
  evidenceFileSize: number;
  previewUrl: string | null;
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

function savePhotoEvidenceMetadata(evidence: PhotoEvidenceInfo | null) {
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

  useEffect(() => {
    setPhotoEvidence(loadPhotoEvidenceMetadata());

    return () => {
      setPhotoEvidence((current) => {
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
        return current;
      });
    };
  }, []);

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

      const isImage = file.type.startsWith('image/');
      if (!isImage) {
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

      savePhotoEvidenceMetadata(nextEvidence);
      setPhotoEvidenceFeedback(`${file.name} added as optional photo evidence. This image stays local/session-only for now.`);
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
        <p>Take a photo or upload a router/work order image, extract the header data, or enter details manually when needed.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>Capture + Extract</h2>
            <p>Snap a router photo or select a file from your device, then extract the key fields for review.</p>
          </div>
          <span className="step-pill">01</span>
        </div>
        <div className="action-row">
          <label className="button primary" htmlFor="router-camera-input">
            Take Photo
          </label>
          <input
            accept="image/*"
            capture="environment"
            hidden
            id="router-camera-input"
            onChange={handleFileChange}
            type="file"
          />
          <label className="button secondary" htmlFor="router-upload-input">
            Upload File / Photo
          </label>
          <input
            accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
            id="router-upload-input"
            onChange={handleFileChange}
            type="file"
          />
          <button className="button secondary" type="button" disabled={!uploadedFile || isExtracting} onClick={onClearUpload}>Clear Upload</button>
          <button className="button primary" type="button" disabled={!uploadedFile || !uploadedFile.isImage || isExtracting} onClick={onExtractData}>
            {isExtracting ? 'Extracting...' : 'Extract Text / Data'}
          </button>
        </div>
        {uploadFeedback && <p className="field-help">{uploadFeedback}</p>}
        {extractionFeedback && (
          <p className="field-help">{extractionFeedback.tone === 'success' ? 'Extraction: ' : 'Extraction error: '}{extractionFeedback.message}</p>
        )}
        {uploadedFile && (
          <div className="field-row" style={{ marginTop: 14 }}>
            <strong>
              Selected File
              <span className="field-status confirmed">Ready</span>
            </strong>
            <span className="field-value">{uploadedFile.name}</span>
            <span className="field-help">{uploadedFile.type || 'Unknown file type'} · {formatFileSize(uploadedFile.size)}</span>
            {!uploadedFile.isImage && <span className="field-help">Extraction is optimized for uploaded images. Manual entry remains available for other file types.</span>}
            {uploadedFile.isImage && uploadedFile.previewUrl && (
              <img alt="Uploaded router preview" className="upload-preview" src={uploadedFile.previewUrl} />
            )}
          </div>
        )}
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>Photo Evidence</h2>
            <p>Add one optional supporting image for Engineering context. This is separate from the router image used for extraction.</p>
          </div>
          <span className={photoEvidence ? 'field-status confirmed' : 'field-status'}>{photoEvidence ? 'Attached' : 'Optional'}</span>
        </div>
        <div className="action-row">
          <label className="button secondary" htmlFor="evidence-camera-input">
            Take Evidence Photo
          </label>
          <input
            accept="image/*"
            capture="environment"
            hidden
            id="evidence-camera-input"
            onChange={handlePhotoEvidenceChange}
            type="file"
          />
          <label className="button secondary" htmlFor="evidence-upload-input">
            Upload Evidence Photo
          </label>
          <input
            accept="image/*"
            hidden
            id="evidence-upload-input"
            onChange={handlePhotoEvidenceChange}
            type="file"
          />
          <button className="button secondary" type="button" disabled={!photoEvidence} onClick={clearPhotoEvidence}>Clear Evidence</button>
        </div>
        {photoEvidenceFeedback && <p className="field-help">{photoEvidenceFeedback}</p>}
        {photoEvidence && (
          <div className="field-row" style={{ marginTop: 14 }}>
            <strong>
              Evidence Image
              <span className="field-status confirmed">Ready</span>
            </strong>
            <span className="field-value">{photoEvidence.evidenceFileName}</span>
            <span className="field-help">{photoEvidence.evidenceFileType || 'Unknown image type'} · {formatFileSize(photoEvidence.evidenceFileSize)}</span>
            <span className="field-help">M27 stores evidence metadata/status only. The image itself is local/session-only and is not emailed or permanently saved yet.</span>
            {photoEvidence.previewUrl && (
              <img alt="Photo evidence preview" className="upload-preview" src={photoEvidence.previewUrl} />
            )}
          </div>
        )}
      </article>

      <article className="card">
        <h2>Manual Entry</h2>
        <p>Use this path when the uploaded image is unclear or the router details need to be entered directly.</p>
        <div className="form-grid" style={{ marginTop: 14 }}>
          <label>
            Router/Header Notes
            <textarea
              value={manualEntry}
              onChange={(event) => onManualEntryChange(event.target.value)}
              placeholder="Paste or type work order/router information here."
            />
          </label>
        </div>
        <div className="action-row">
          <button className="button primary full-width" type="button" onClick={onCaptureRouter}>Continue to Confirm</button>
        </div>
      </article>
    </section>
  );
}
