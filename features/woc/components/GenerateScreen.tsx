import {
  affectedAreaOptions,
  correctionTypeOptions,
  otherAffectedAreaOption,
  type WocCorrectionData,
} from '../state/wocDataModel';

type GenerateScreenProps = {
  wocData: WocCorrectionData;
  generateReady: boolean;
  onUpdateField: (key: keyof WocCorrectionData, value: string) => void;
  onUpdateAffectedArea: (value: string) => void;
  onGenerateDraft: () => void;
};

export function GenerateScreen({
  wocData,
  generateReady,
  onUpdateField,
  onUpdateAffectedArea,
  onGenerateDraft,
}: GenerateScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>Build Correction</h1>
        <p>Select the affected area and enter the correction request.</p>
      </div>

      <article className="card">
        <div className="form-grid">
          <label>
            Correction Type
            <select value={wocData.correctionType} onChange={(event) => onUpdateField('correctionType', event.target.value)}>
              {correctionTypeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Affected Area
            <select value={wocData.affectedArea} onChange={(event) => onUpdateAffectedArea(event.target.value)}>
              {affectedAreaOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          {wocData.affectedArea === otherAffectedAreaOption && (
            <label>
              Custom Affected Area
              <input
                type="text"
                value={wocData.customAffectedArea}
                onChange={(event) => onUpdateField('customAffectedArea', event.target.value)}
                placeholder="Type the affected area"
              />
            </label>
          )}
          <label>
            Issue Details
            <textarea value={wocData.issueDetails} onChange={(event) => onUpdateField('issueDetails', event.target.value)} />
          </label>
          <label>
            Requested Engineering Action
            <textarea value={wocData.requestedEngineeringAction} onChange={(event) => onUpdateField('requestedEngineeringAction', event.target.value)} />
          </label>
        </div>
        <div className="action-row">
          <button className="button danger full-width" type="button" onClick={onGenerateDraft} disabled={!generateReady}>
            Generate Draft
          </button>
        </div>
        {!generateReady && (
          <p className="field-help">Generate requires confirmed Work Order, confirmed Part Number, correction type, affected area, issue details, and requested Engineering action.</p>
        )}
      </article>
    </section>
  );
}
