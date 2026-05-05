import { confirmDataFields, type WocCorrectionData } from '../state/wocDataModel';

type ConfirmScreenProps = {
  wocData: WocCorrectionData;
  confirmReady: boolean;
  getFieldConfirmed: (key: keyof WocCorrectionData) => boolean;
  onUpdateField: (key: keyof WocCorrectionData, value: string) => void;
  onConfirmField: (key: keyof WocCorrectionData) => void;
  onConfirmRequired: () => void;
  onContinue: () => void;
};

export function ConfirmScreen({
  wocData,
  confirmReady,
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
