type CaptureScreenProps = {
  manualEntry: string;
  onManualEntryChange: (value: string) => void;
  onCaptureRouter: () => void;
};

export function CaptureScreen({ manualEntry, onManualEntryChange, onCaptureRouter }: CaptureScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Capture Router</h1>
        <p>Capture the work order/header data. OCR and AI Vision are intentionally not wired in this milestone.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <h2>Photo / Upload</h2>
            <p>Placeholder capture controls for the clean screen flow.</p>
          </div>
          <span className="step-pill">Step 1</span>
        </div>
        <div className="action-row">
          <button className="button secondary" type="button">Take Photo</button>
          <button className="button secondary" type="button">Upload File</button>
        </div>
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
