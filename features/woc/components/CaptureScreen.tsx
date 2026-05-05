import type { ChangeEvent } from 'react';
import type { ActionFeedback, UploadedFileInfo } from '../types/wocSessionTypes';

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
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUploadFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Capture Router</h1>
        <p>Upload a router/work order image or use manual entry. Extraction fills fields only; user confirmation is still required.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>Upload File / Photo</h2>
            <p>Select an image from your device library/files. Camera capture is not active yet.</p>
          </div>
          <span className="step-pill">Step 1</span>
        </div>
        <div className="action-row">
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
            {!uploadedFile.isImage && <span className="field-help">M9 extraction currently supports image files only. Manual entry remains available.</span>}
            {uploadedFile.isImage && uploadedFile.previewUrl && (
              <img alt="Uploaded router preview" className="upload-preview" src={uploadedFile.previewUrl} />
            )}
          </div>
        )}
      </article>

      <article className="card">
        <h2>Manual Entry Fallback</h2>
        <p>Manual fallback remains visible so the shop-floor user is never blocked by extraction failure.</p>
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
          <button className="button primary full-width" type="button" onClick={onCaptureRouter}>Capture Router</button>
        </div>
      </article>
    </section>
  );
}
