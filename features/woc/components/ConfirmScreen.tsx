import { confirmDataFields, type WocCorrectionData } from '../state/wocDataModel';
import type { ExtractionDebugMetadata } from '../types/wocSessionTypes';

type ConfirmScreenProps = {
  wocData: WocCorrectionData;
  confirmReady: boolean;
  extractionDebug?: ExtractionDebugMetadata;
  getFieldConfirmed: (key: keyof WocCorrectionData) => boolean;
  onUpdateField: (key: keyof WocCorrectionData, value: string) => void;
  onConfirmField: (key: keyof WocCorrectionData) => void;
  onConfirmRequired: () => void;
  onContinue: () => void;
};

export function ConfirmScreen({
  wocData,
  confirmReady,
  extractionDebug = null,
  getFieldConfirmed,
  onUpdateField,
  onConfirmField,
  onConfirmRequired,
  onContinue,
}: ConfirmScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Extract + Confirm</h1>
        <p>Review and edit WOC data before it can move into the correction package.</p>
      </div>

      {extractionDebug && (
        <article className="card">
          <div className="card-header">
            <div>
              <h2>Extraction Debug</h2>
              <p>OpenAI Vision extraction metadata — draft only, for verification.</p>
            </div>
            <span className="field-status">Debug</span>
          </div>
          <div className="field-list" style={{ marginTop: 14 }}>
            <div className="field-row">
              <strong>Extraction Source</strong>
              <span className="field-value">{extractionDebug.extractionSource}</span>
            </div>
            <div className="field-row">
              <strong>Extracted Keys</strong>
              <span className="field-value">
                {extractionDebug.extractedKeys.length > 0
                  ? extractionDebug.extractedKeys.join(', ')
                  : 'None returned'}
              </span>
            </div>
            <div className="field-row">
              <strong>Missing Expected Fields</strong>
              <span className="field-value">
                {extractionDebug.missingExpectedFields.length > 0
                  ? extractionDebug.missingExpectedFields.join(', ')
                  : 'None — all expected fields returned'}
              </span>
            </div>
            {Object.keys(extractionDebug.fieldSourceNotes).length > 0 && (
              <div className="field-row">
                <strong>Field Source Notes</strong>
                <span className="field-value" style={{ whiteSpace: 'pre-wrap' }}>
                  {Object.entries(extractionDebug.fieldSourceNotes)
                    .map(([key, note]) => `${key}: ${note}`)
                    .join('\n')}
                </span>
              </div>
            )}
          </div>
          <p className="field-help" style={{ marginTop: 10 }}>
            AI EXTRACTED · DRAFT ONLY — Unconfirmed. Human review required. Missing fields remain blank for manual entry.
          </p>
        </article>
      )}

      <article className="card">
        <div className="field-list">
          {confirmDataFields.map((field) => {
            const confirmed = getFieldConfirmed(field.key);
            return (
              <div className="field-row" key={field.key}>
                <strong>
                  {field.label}{field.required ? ' *' : ''}
                  <span className={confirmed ? 'field-status confirmed' : 'field-status'}>
                    {confirmed ? 'Confirmed' : 'Review'}
                  </span>
                </strong>
                <input
                  type="text"
                  value={wocData[field.key]}
                  onChange={(event) => onUpdateField(field.key, event.target.value)}
                  placeholder={field.required ? `${field.label} required` : `${field.label} optional`}
                />
                {field.confirmable && (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => onConfirmField(field.key)}
                    disabled={!wocData[field.key].trim() || confirmed}
                  >
                    Confirm {field.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="action-row">
          <button className="button success" type="button" onClick={onConfirmRequired}>Confirm Required Fields</button>
          <button className="button primary" type="button" onClick={onContinue} disabled={!confirmReady}>
            Continue to Build Correction
          </button>
        </div>
        {!confirmReady && (
          <p className="field-help">Work Order and Part Number must be filled in and confirmed before Generate unlocks.</p>
        )}
      </article>
    </section>
  );
}
