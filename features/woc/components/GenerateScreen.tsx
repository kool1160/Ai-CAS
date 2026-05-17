import {
  correctionTypeOptions,
  departmentOptions,
  operationEquipmentOptions,
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

function DepartmentDropdown({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {departmentOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function OperationEquipmentDropdown({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Operation needs confirmation</option>
        {operationEquipmentOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function RouterContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="placeholder-item">
      <strong>{label}</strong>
      <span>{value.trim() || 'Not captured'}</span>
    </div>
  );
}

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
        <h1>Build Corrective Action</h1>
        <p>Confirm the job context, describe the issue in plain language, and let AI-CAS draft the corrective action.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">JOB CONTEXT · READ ONLY</span>
            <h2>Captured Job Context</h2>
            <p>AI Vision and confirmation provide the job/router context. The operator only needs to state the exception.</p>
          </div>
        </div>

        <div className="placeholder-list">
          <RouterContextItem label="Work Order" value={wocData.workOrderNumber} />
          <RouterContextItem label="Part Number" value={wocData.partNumber} />
          <RouterContextItem label="Customer / Job" value={wocData.customerOrJob} />
          <RouterContextItem label="Quantity" value={wocData.quantityAffected || wocData.quantity} />
          <RouterContextItem label="Uploaded Router Step / Operation" value={wocData.routerStepOperation} />
          <RouterContextItem label="Due Date / Ship Date" value={wocData.dueDateShipDate} />
          {wocData.material.trim() && <RouterContextItem label="Material" value={wocData.material} />}
        </div>
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">SIMPLE MODE</span>
            <h2>Describe the issue</h2>
            <p>Type or use your phone’s voice dictation. Rough shop-floor wording is fine — AI-CAS will clean it up for review.</p>
          </div>
          <span className={wocData.shortIssueDescription.trim() ? 'field-status confirmed' : 'field-status'}>
            {wocData.shortIssueDescription.trim() ? 'Ready' : 'Needed'}
          </span>
        </div>

        <div className="form-grid">
          <label>
            Describe the issue
            <textarea
              value={wocData.shortIssueDescription}
              onChange={(event) => {
                onUpdateField('shortIssueDescription', event.target.value);
                onUpdateField('issueDetails', event.target.value);
              }}
              placeholder="Example: Welding router says 4 per hour, but we can only get 2 per hour. This affects scheduling and labor planning. Router time needs reviewed and corrected."
              style={{ minHeight: 190 }}
            />
          </label>
          <p className="field-help">
            Type or use your phone’s voice dictation. Include what is wrong, what department or process it affects, and what needs to be corrected. Rough shop-floor wording is fine — AI-CAS will clean it up for review.
          </p>

          <details className="placeholder-item" style={{ marginTop: 4 }}>
            <summary>
              <strong>Optional context</strong>
              <p className="field-help">
                Select the affected department and operation/equipment if it helps AI-CAS draft the correction. You can also include this in the issue description.
              </p>
            </summary>

            <div className="form-grid" style={{ marginTop: 12 }}>
              <label>
                Correction Type (optional)
                <select value={wocData.correctionType} onChange={(event) => onUpdateField('correctionType', event.target.value)}>
                  {correctionTypeOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <DepartmentDropdown
                label="Department / Affected Area"
                value={wocData.foundAtDepartment}
                onChange={(value) => {
                  onUpdateField('foundAtDepartment', value);
                  onUpdateAffectedArea(value);
                  onUpdateField('affectedOperationEquipment', value === 'Welding' ? 'Welding' : '');
                }}
              />

              <OperationEquipmentDropdown
                label="Operation / Equipment (optional)"
                value={wocData.affectedOperationEquipment}
                onChange={(value) => onUpdateField('affectedOperationEquipment', value)}
              />

              {wocData.foundAtDepartment === otherAffectedAreaOption && (
                <label>
                  Other / Needs Review Detail (optional)
                  <input
                    type="text"
                    value={wocData.customAffectedArea}
                    onChange={(event) => onUpdateField('customAffectedArea', event.target.value)}
                    placeholder="Enter department or process affected"
                  />
                </label>
              )}
            </div>
          </details>
        </div>

        <div className="action-row">
          <button className="button primary full-width" type="button" onClick={onGenerateDraft} disabled={!generateReady}>
            Draft Corrective Action with AI
          </button>
        </div>

        {!generateReady && (
          <p className="field-help">Confirm the Work Order and Part Number, then describe the issue in Simple Mode.</p>
        )}
      </article>

      <details className="card">
        <summary>
          <strong>Advanced / Manual Controls</strong>
          <p className="field-help">Optional controls remain available for review, but they are collapsed for Simple Mode.</p>
        </summary>

        <div className="form-grid" style={{ marginTop: 14 }}>
          <label>
            Correction Type
            <select value={wocData.correctionType} onChange={(event) => onUpdateField('correctionType', event.target.value)}>
              {correctionTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Part Description
            <input type="text" value={wocData.partDescription} onChange={(event) => onUpdateField('partDescription', event.target.value)} />
          </label>

          <label>
            Operation Number
            <input type="text" value={wocData.operationNumber} onChange={(event) => onUpdateField('operationNumber', event.target.value)} />
          </label>

          <label>
            Uploaded Router Step / Operation
            <input type="text" value={wocData.routerStepOperation} onChange={(event) => onUpdateField('routerStepOperation', event.target.value)} />
          </label>

          <label>
            Quantity Affected
            <input type="text" value={wocData.quantityAffected} onChange={(event) => onUpdateField('quantityAffected', event.target.value)} />
          </label>

          <label>
            Due Date / Ship Date
            <input type="text" value={wocData.dueDateShipDate} onChange={(event) => onUpdateField('dueDateShipDate', event.target.value)} />
          </label>

          <label>
            Material
            <input type="text" value={wocData.material} onChange={(event) => onUpdateField('material', event.target.value)} />
          </label>

          <DepartmentDropdown
            label="Found At Department"
            value={wocData.foundAtDepartment}
            onChange={(value) => {
              onUpdateField('foundAtDepartment', value);
              onUpdateAffectedArea(value);
              onUpdateField('affectedOperationEquipment', value === 'Welding' ? 'Welding' : '');
            }}
          />

          <OperationEquipmentDropdown
            label="Operation / Equipment"
            value={wocData.affectedOperationEquipment}
            onChange={(value) => onUpdateField('affectedOperationEquipment', value)}
          />

          <DepartmentDropdown
            label="Corrective Action Owner Department"
            value={wocData.correctiveActionOwnerDepartment}
            onChange={(value) => onUpdateField('correctiveActionOwnerDepartment', value)}
          />

          <DepartmentDropdown
            label="Suspected Failure Point"
            value={wocData.suspectedFailurePoint}
            onChange={(value) => onUpdateField('suspectedFailurePoint', value)}
          />

          {wocData.foundAtDepartment === otherAffectedAreaOption && (
            <label>
              Other / Needs Review Detail
              <input
                type="text"
                value={wocData.customAffectedArea}
                onChange={(event) => onUpdateField('customAffectedArea', event.target.value)}
                placeholder="Enter department or review note"
              />
            </label>
          )}

          <label>
            Detailed Issue Notes
            <textarea value={wocData.detailedIssueNotes} onChange={(event) => onUpdateField('detailedIssueNotes', event.target.value)} />
          </label>

          <label>
            Immediate Containment
            <textarea value={wocData.immediateContainment} onChange={(event) => onUpdateField('immediateContainment', event.target.value)} />
          </label>

          <label>
            Required Correction
            <textarea
              value={wocData.requiredCorrection}
              onChange={(event) => {
                onUpdateField('requiredCorrection', event.target.value);
                onUpdateField('requestedEngineeringAction', event.target.value);
              }}
            />
          </label>

          <label>
            Prevention / Standard Work Update
            <textarea value={wocData.preventionStandardWorkUpdate} onChange={(event) => onUpdateField('preventionStandardWorkUpdate', event.target.value)} />
          </label>

          <label>
            Inspection / Verification Requirement
            <textarea value={wocData.inspectionVerificationRequirement} onChange={(event) => onUpdateField('inspectionVerificationRequirement', event.target.value)} />
          </label>

          <label>
            Evidence Details
            <textarea value={wocData.partDefectPhotoPlaceholder} onChange={(event) => onUpdateField('partDefectPhotoPlaceholder', event.target.value)} />
          </label>
        </div>
      </details>
    </section>
  );
}
