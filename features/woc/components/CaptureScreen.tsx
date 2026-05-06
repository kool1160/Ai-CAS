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
        <p>Upload a router or work order image, extract the header data, or enter details manually when needed.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>Upload + Extract</h2>
            <p>Select a work order image from your device, then extract the key router fields for review.</p>
          </div>
          <span className="step-pill">01</span>
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
            {!uploadedFile.isImage && <span className="field-help">Extraction is optimized for uploaded images. Manual entry remains available for other file types.</span>}
            {uploadedFile.isImage && uploadedFile.previewUrl && (
              <img alt="Uploaded router preview" className="upload-preview" src={uploadedFile.previewUrl} />
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
