import {
  affectedAreaOptions,
  correctionTypeOptions,
  departmentOptions,
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

function DepartmentDropdown({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
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
        <p>Complete the V4 corrective action field model before release/PDF unlocks.</p>
      </div>

      <article className="card">
        <div className="screen-title">
          <h2>1. Job / Router Data</h2>
        </div>

        <div className="form-grid">
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
            <input
              type="text"
              value={wocData.partDescription}
              onChange={(event) => onUpdateField('partDescription', event.target.value)}
            />
          </label>

          <label>
            Operation Number
            <input
              type="text"
              value={wocData.operationNumber}
              onChange={(event) => onUpdateField('operationNumber', event.target.value)}
            />
          </label>

          <label>
            Router Step / Operation
            <input
              type="text"
              value={wocData.routerStepOperation}
              onChange={(event) => onUpdateField('routerStepOperation', event.target.value)}
            />
          </label>

          <label>
            Quantity Affected
            <input
              type="text"
              value={wocData.quantityAffected}
              onChange={(event) => onUpdateField('quantityAffected', event.target.value)}
            />
          </label>

          <label>
            Due Date / Ship Date
            <input
              type="text"
              value={wocData.dueDateShipDate}
              onChange={(event) => onUpdateField('dueDateShipDate', event.target.value)}
            />
          </label>
        </div>
      </article>

      <article className="card">
        <div className="screen-title">
          <h2>2. Issue Description</h2>
        </div>

        <div className="form-grid">
          <label>
            Short Issue Description
            <textarea
              value={wocData.shortIssueDescription}
              onChange={(event) => onUpdateField('shortIssueDescription', event.target.value)}
            />
          </label>

          <label>
            Detailed Issue Notes
            <textarea
              value={wocData.detailedIssueNotes}
              onChange={(event) => onUpdateField('detailedIssueNotes', event.target.value)}
            />
          </label>

          <label>
            Defect / Problem Type
            <input
              type="text"
              value={wocData.defectProblemType}
              onChange={(event) => onUpdateField('defectProblemType', event.target.value)}
            />
          </label>

          <label>
            Production Impact
            <textarea
              value={wocData.productionImpact}
              onChange={(event) => onUpdateField('productionImpact', event.target.value)}
            />
          </label>
        </div>
      </article>

      <article className="card">
        <div className="screen-title">
          <h2>3. Department / Flow Control</h2>
        </div>

        <div className="form-grid">
          <DepartmentDropdown
            label="Found At Department"
            value={wocData.foundAtDepartment}
            onChange={(value) => {
              onUpdateField('foundAtDepartment', value);
              onUpdateAffectedArea(value);
            }}
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

          <DepartmentDropdown
            label="Escaped Through Departments"
            value={wocData.escapedThroughDepartments}
            onChange={(value) => onUpdateField('escapedThroughDepartments', value)}
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
        </div>
      </article>

      <article className="card">
        <div className="screen-title">
          <h2>4. Corrective Action Requirements</h2>
        </div>

        <div className="form-grid">
          <label>
            Immediate Containment
            <textarea
              value={wocData.immediateContainment}
              onChange={(event) => onUpdateField('immediateContainment', event.target.value)}
            />
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
            <textarea
              value={wocData.preventionStandardWorkUpdate}
              onChange={(event) => onUpdateField('preventionStandardWorkUpdate', event.target.value)}
            />
          </label>

          <label>
            Inspection / Verification Requirement
            <textarea
              value={wocData.inspectionVerificationRequirement}
              onChange={(event) => onUpdateField('inspectionVerificationRequirement', event.target.value)}
            />
          </label>

          <label>
            Release Approval Requirement
            <textarea
              value={wocData.releaseApprovalRequirement}
              onChange={(event) => onUpdateField('releaseApprovalRequirement', event.target.value)}
            />
          </label>
        </div>
      </article>

      <article className="card">
        <div className="screen-title">
          <h2>5. Evidence / Confirmation</h2>
        </div>

        <div className="form-grid">
          <label>
            Router / Work Order Photo Placeholder
            <textarea
              value={wocData.routerWorkOrderPhotoPlaceholder}
              onChange={(event) => onUpdateField('routerWorkOrderPhotoPlaceholder', event.target.value)}
            />
          </label>

          <label>
            Part / Defect Photo Placeholder
            <textarea
              value={wocData.partDefectPhotoPlaceholder}
              onChange={(event) => onUpdateField('partDefectPhotoPlaceholder', event.target.value)}
            />
          </label>

          <label>
            AI Extracted Data Confirmation
            <textarea
              value={wocData.aiExtractedDataConfirmation}
              onChange={(event) => onUpdateField('aiExtractedDataConfirmation', event.target.value)}
            />
          </label>

          <label>
            Human Release Confirmation
            <textarea
              value={wocData.humanReleaseConfirmation}
              onChange={(event) => onUpdateField('humanReleaseConfirmation', event.target.value)}
            />
          </label>
        </div>

        <div className="action-row">
          <button className="button danger full-width" type="button" onClick={onGenerateDraft} disabled={!generateReady}>
            Generate Draft
          </button>
        </div>

        {!generateReady && (
          <p className="field-help">
            Generate requires confirmed Work Order, confirmed Part Number, department flow selections,
            issue details, and corrective action requirements.
          </p>
        )}
      </article>
    </section>
  );
}
