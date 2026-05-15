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

function RouterContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="placeholder-item">
      <strong>{label}</strong>
      <span>{value.trim() || `[Manual entry needed: ${label}]`}</span>
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
        <h1>Build Correction</h1>
        <p>AI-CAS uses confirmed router data plus one operator exception note to draft the corrective action.</p>
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">SIMPLE MODE · OPERATOR EXCEPTION</span>
            <h2>What is wrong?</h2>
            <p>Type one rough shop-floor sentence. AI-CAS will turn it into structured corrective-action language.</p>
          </div>
          <span className={wocData.shortIssueDescription.trim() ? 'field-status confirmed' : 'field-status'}>
            {wocData.shortIssueDescription.trim() ? 'Ready' : 'Needed'}
          </span>
        </div>

        <div className="form-grid">
          <label>
            What is wrong?
            <textarea
              value={wocData.shortIssueDescription}
              onChange={(event) => {
                onUpdateField('shortIssueDescription', event.target.value);
                onUpdateField('issueDetails', event.target.value);
              }}
              placeholder="Example: Work order is missing welding operation."
              style={{ minHeight: 170 }}
            />
          </label>
          <p className="field-help">
            Examples: Work order is missing welding operation. Hole size failed no-go pin check. Parts were not cleaned after laser before welding.
          </p>
        </div>

        <div className="action-row">
          <button className="button danger full-width" type="button" onClick={onGenerateDraft} disabled={!generateReady}>
            Generate AI Corrective Action Draft
          </button>
        </div>

        {!generateReady && (
          <p className="field-help">
            Generate requires confirmed Work Order, confirmed Part Number, a department/failure-point selection, and one short answer to “What is wrong?”
          </p>
        )}
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <span className="step-pill">ROUTER CONTEXT · FROM AI VISION / CONFIRM</span>
            <h2>Confirmed Router / Job Context</h2>
            <p>These fields should come from the uploaded router/work order when available. Fill blanks only if needed.</p>
          </div>
        </div>

        <div className="placeholder-list">
          <RouterContextItem label="Work Order" value={wocData.workOrderNumber} />
          <RouterContextItem label="Part Number" value={wocData.partNumber} />
          <RouterContextItem label="Customer / Job" value={wocData.customerOrJob} />
          <RouterContextItem label="Quantity" value={wocData.quantityAffected || wocData.quantity} />
          <RouterContextItem label="Router Step / Operation" value={wocData.routerStepOperation} />
          <RouterContextItem label="Material" value={wocData.material} />
          <RouterContextItem label="Next Operation" value={wocData.nextOperation} />
          <RouterContextItem label="Inspection Operation" value={wocData.inspectionOperation} />
        </div>
      </article>

      <details className="card">
        <summary>
          <strong>Advanced Details</strong>
          <p className="field-help">Optional router, department, and issue fields. These stay available but are not required for simple mode unless your shop needs them.</p>
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

          <label>
            Material
            <input
              type="text"
              value={wocData.material}
              onChange={(event) => onUpdateField('material', event.target.value)}
            />
          </label>

          <label>
            Next Operation
            <input
              type="text"
              value={wocData.nextOperation}
              onChange={(event) => onUpdateField('nextOperation', event.target.value)}
            />
          </label>

          <label>
            Inspection Operation
            <input
              type="text"
              value={wocData.inspectionOperation}
              onChange={(event) => onUpdateField('inspectionOperation', event.target.value)}
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
      </details>

      <details className="card">
        <summary>
          <strong>Edit Generated Sections</strong>
          <p className="field-help">Optional manual overrides. AI-CAS can draft these from the router context and “What is wrong?” note.</p>
        </summary>

        <div className="form-grid" style={{ marginTop: 14 }}>
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
      </details>

      <details className="card">
        <summary>
          <strong>Evidence Details</strong>
          <p className="field-help">Optional evidence wording. Review-step photo evidence stays available later in Review.</p>
        </summary>

        <div className="form-grid" style={{ marginTop: 14 }}>
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
      </details>
    </section>
  );
}
