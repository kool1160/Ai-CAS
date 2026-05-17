import { type WocCorrectionData } from '../state/wocDataModel';
type ConfirmScreenProps = {
  wocData: WocCorrectionData;
  confirmReady: boolean;
  getFieldConfirmed: (key: keyof WocCorrectionData) => boolean;
  onUpdateField: (key: keyof WocCorrectionData, value: string) => void;
  onConfirmField: (key: keyof WocCorrectionData) => void;
  onConfirmRequired: () => void;
  onContinue: () => void;
};

const primaryConfirmFields: Array<{ key: keyof WocCorrectionData; label: string; required?: boolean; confirmable?: boolean }> = [
  { key: 'workOrderNumber', label: 'Work Order', required: true, confirmable: true },
  { key: 'partNumber', label: 'Part Number', required: true, confirmable: true },
  { key: 'customerOrJob', label: 'Customer / Job' },
  { key: 'quantityAffected', label: 'Quantity' },
  { key: 'dueDateShipDate', label: 'Due Date / Ship Date' },
];

const secondaryConfirmFields: Array<{ key: keyof WocCorrectionData; label: string }> = [
  { key: 'revision', label: 'Revision' },
  { key: 'partDescription', label: 'Part Description' },
  { key: 'operationNumber', label: 'Operation Number' },
  { key: 'routerStepOperation', label: 'Uploaded Router Step / Operation (supporting document context)' },
  { key: 'quantity', label: 'Original Quantity' },
  { key: 'material', label: 'Material' },
  { key: 'nextOperation', label: 'Next Operation' },
  { key: 'inspectionOperation', label: 'Inspection Operation' },
];

function ConfirmField({
  field,
  wocData,
  confirmed,
  onUpdateField,
  onConfirmField,
}: {
  field: { key: keyof WocCorrectionData; label: string; required?: boolean; confirmable?: boolean };
  wocData: WocCorrectionData;
  confirmed: boolean;
  onUpdateField: (key: keyof WocCorrectionData, value: string) => void;
  onConfirmField: (key: keyof WocCorrectionData) => void;
}) {
  return (
    <div className="field-row">
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
}

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
        <h1>Confirm Job Context</h1>
        <p>Review the key fields AI-CAS extracted from the router/work order, confirm the job, then continue.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">AI EXTRACTED · CONFIRM KEY FIELDS</span>
            <h2>Key Job Fields</h2>
            <p>Confirm the Work Order and Part Number. Edit any visible field that AI Vision missed or read incorrectly.</p>
            <p className="field-help">This confirms what was extracted from the uploaded router. Select the affected department/operation on the next screen if the issue belongs somewhere else.</p>
          </div>
          <span className={confirmReady ? 'field-status confirmed' : 'field-status'}>{confirmReady ? 'Ready' : 'Needs Confirm'}</span>
        </div>

        <div className="field-list" style={{ marginTop: 14 }}>
          {primaryConfirmFields.map((field) => (
            <ConfirmField
              key={field.key}
              field={field}
              wocData={wocData}
              confirmed={getFieldConfirmed(field.key)}
              onUpdateField={onUpdateField}
              onConfirmField={onConfirmField}
            />
          ))}
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

      <details className="card">
        <summary>
          <strong>Secondary Extracted Fields</strong>
          <p className="field-help">Optional extracted values remain editable without making Confirm feel like a full re-entry form.</p>
        </summary>
        <div className="field-list" style={{ marginTop: 14 }}>
          {secondaryConfirmFields.map((field) => (
            <ConfirmField
              key={field.key}
              field={field}
              wocData={wocData}
              confirmed={Boolean(wocData[field.key].trim())}
              onUpdateField={onUpdateField}
              onConfirmField={onConfirmField}
            />
          ))}
        </div>
      </details>

    </section>
  );
}
