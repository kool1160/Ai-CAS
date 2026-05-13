'use client';

import { useState } from 'react';

type CorrectiveActionData = {
  workOrder: string;
  partNumber: string;
  revision: string;
  customer: string;
  quantity: string;
  partDescription: string;
  material: string;
  affectedOperation: string;
  nextOperation: string;
  inspectionOperation: string;
  keyFeature: string;
  gaugeCheckMethod: string;
  acceptanceStandard: string;
  issueSummary: string;
  containmentActions: string;
  passCondition: string;
  failCondition: string;
};

type RequirementKey = 'cleanAfterLaser' | 'noGoGaugeHoleCheck' | 'stackInSetsOfEight';
type EvidenceSlotKey =
  | 'workOrderRouterControl'
  | 'drawingPrintRequirements'
  | 'batchConditionStackingControl'
  | 'correctCleanedCondition'
  | 'holeVerificationNoGoPin'
  | 'incorrectUncleanedCondition';

type RequirementRow = {
  name: string;
  requiredStandard: string;
  acceptanceCondition: string;
};

type ChecklistRow = {
  checkNumber: string;
  requirementText: string;
  verificationInitials: string;
  complete: boolean;
};

type ReleaseApproval = {
  laserOperator: string;
  laserOperatorDate: string;
  supervisor: string;
  supervisorDate: string;
  quality: string;
  qualityDate: string;
};

type RequirementRows = Record<RequirementKey, RequirementRow>;
type EvidenceNotes = Record<EvidenceSlotKey, string>;

const defaultCorrectiveActionData: CorrectiveActionData = {
  workOrder: '008604',
  partNumber: '1124191',
  revision: 'C',
  customer: 'JOST INTERNATIONAL',
  quantity: '500 EA',
  partDescription: 'Brace Ear Weldment',
  material: '3/8 in. HSLA GR50',
  affectedOperation: 'CT10 - 4K Mazak Laser',
  nextOperation: 'RW10 - Cobot Welder',
  inspectionOperation: 'QC10 - Inspection',
  keyFeature: 'Ø .672 hole / square check',
  gaugeCheckMethod: 'Approved no-go pin/gauge',
  acceptanceStandard: 'No-go pin must not enter',
  issueSummary: '',
  containmentActions: 'Separate clean/ready parts from parts requiring cleanup. Clean all dross, slag, burrs, and rough laser edges. Recheck Ø .672 hole with approved no-go gauge. Hold questionable parts. Restack acceptable parts in sets of 8. Notify Supervisor/Quality for repeat issues.',
  passCondition: 'Parts are cleaned/ground after laser, hole checked with no-go gauge, and stacked neatly in sets of 8.',
  failCondition: 'Parts contain visible dross, slag, rough laser edge, hole burrs, questionable hole size, missing cleaned/ground area, or uncontrolled stacking.',
};

const defaultRequirements: RequirementRows = {
  cleanAfterLaser: {
    name: 'Clean after laser',
    requiredStandard: 'Remove dross, slag, burrs, and rough laser edge buildup.',
    acceptanceCondition: 'Part edge and weld-prep area are clean, smooth, and ready for downstream welding.',
  },
  noGoGaugeHoleCheck: {
    name: 'No-go gauge hole check',
    requiredStandard: 'Use approved no-go pin/gauge for Ø .672 hole before release.',
    acceptanceCondition: 'No-go pin must not enter the checked hole.',
  },
  stackInSetsOfEight: {
    name: 'Stack in sets of 8',
    requiredStandard: 'Stack cleaned/verified parts neatly in controlled sets of 8 on skid.',
    acceptanceCondition: 'Batch is organized, countable, and staged consistently for the next operation.',
  },
};

const defaultChecklistRows: ChecklistRow[] = [
  { checkNumber: '01', requirementText: 'Bottom side cleaned — no heavy dross/slag', verificationInitials: '', complete: false },
  { checkNumber: '02', requirementText: 'Outside profile, tabs, slot, and corners deburred', verificationInitials: '', complete: false },
  { checkNumber: '03', requirementText: 'Hole area cleaned and burr-free', verificationInitials: '', complete: false },
  { checkNumber: '04', requirementText: 'Ø .672 hole checked with approved no-go pin/gauge', verificationInitials: '', complete: false },
  { checkNumber: '05', requirementText: 'Part square/print checks completed as required', verificationInitials: '', complete: false },
  { checkNumber: '06', requirementText: 'Parts stacked neatly in sets of 8 on skid', verificationInitials: '', complete: false },
  { checkNumber: '07', requirementText: 'Questionable parts held and Supervisor/Quality notified', verificationInitials: '', complete: false },
];

const defaultReleaseApproval: ReleaseApproval = {
  laserOperator: '',
  laserOperatorDate: '',
  supervisor: '',
  supervisorDate: '',
  quality: '',
  qualityDate: '',
};

const evidenceSlots: Array<{ key: EvidenceSlotKey; title: string; helper: string }> = [
  { key: 'workOrderRouterControl', title: 'Work Order / Router Control', helper: 'Shows the work order, router, operation sequence, WO number, part number, revision, quantity, and routing context.' },
  { key: 'drawingPrintRequirements', title: 'Drawing / Print Requirements', helper: 'Shows the drawing, print note, hole requirement, square check, gauge requirement, or inspection callout.' },
  { key: 'batchConditionStackingControl', title: 'Batch Condition / Stacking Control', helper: 'Shows how parts are grouped, stacked, staged, or bundled before welding or inspection.' },
  { key: 'correctCleanedCondition', title: 'Correct Cleaned Condition', helper: 'Shows the acceptable cleaned/ground condition before welding so operators can compare good vs bad condition.' },
  { key: 'holeVerificationNoGoPin', title: 'Hole Verification / No-Go Pin', helper: 'Shows approved no-go pin or gauge verification evidence for the hole-size check.' },
  { key: 'incorrectUncleanedCondition', title: 'Incorrect Uncleaned Condition', helper: 'Shows the unacceptable uncleaned condition, slag, burrs, laser scale, or weld-readiness issue for comparison.' },
];

const defaultEvidenceNotes = evidenceSlots.reduce((notes, slot) => {
  notes[slot.key] = '';
  return notes;
}, {} as EvidenceNotes);

export function CorrectiveActionBuilderShell() {
  const [correctiveActionData, setCorrectiveActionData] = useState<CorrectiveActionData>(defaultCorrectiveActionData);
  const [requirements, setRequirements] = useState<RequirementRows>(defaultRequirements);
  const [checklistRows, setChecklistRows] = useState<ChecklistRow[]>(defaultChecklistRows);
  const [releaseApproval, setReleaseApproval] = useState<ReleaseApproval>(defaultReleaseApproval);
  const [evidenceNotes, setEvidenceNotes] = useState<EvidenceNotes>(defaultEvidenceNotes);

  const updateField = (key: keyof CorrectiveActionData, value: string) => {
    setCorrectiveActionData((current) => ({ ...current, [key]: value }));
  };

  const updateRequirement = (key: RequirementKey, field: keyof RequirementRow, value: string) => {
    setRequirements((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  };

  const updateChecklistRow = (index: number, field: keyof ChecklistRow, value: string | boolean) => {
    setChecklistRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const updateReleaseApproval = (key: keyof ReleaseApproval, value: string) => {
    setReleaseApproval((current) => ({ ...current, [key]: value }));
  };

  const updateEvidenceNotes = (key: EvidenceSlotKey, value: string) => {
    setEvidenceNotes((current) => ({ ...current, [key]: value }));
  };

  return (
    <article className="card corrective-action-builder-shell">
      <div className="card-header">
        <div>
          <span className="step-pill">V3 DATA MODEL</span>
          <h2>Corrective Action Builder</h2>
          <p>Create controlled shop-floor corrective action sheets from work order, print, part, gauge, and staging evidence.</p>
        </div>
        <span className="field-status confirmed">Fields</span>
      </div>

      <p className="field-help">Frontend data-entry only. PDF generation, backend storage, AI extraction, GitHub automation, and runtime agent execution are not enabled in V3-M23.</p>

      <section className="agent-workflow-grid" aria-label="Corrective Action Builder data fields" style={{ marginTop: 16 }}>
        <article className="card agent-workflow-card">
          <div className="card-header"><div><span className="step-pill">01</span><h3>Job / Part Information</h3><p>Editable work order, part, customer, quantity, description, and material fields.</p></div></div>
          <div className="form-grid">
            <label>Work Order<input type="text" value={correctiveActionData.workOrder} onChange={(event) => updateField('workOrder', event.target.value)} placeholder="008604" /></label>
            <label>Part Number<input type="text" value={correctiveActionData.partNumber} onChange={(event) => updateField('partNumber', event.target.value)} placeholder="1124191" /></label>
            <label>Revision<input type="text" value={correctiveActionData.revision} onChange={(event) => updateField('revision', event.target.value)} placeholder="C" /></label>
            <label>Customer<input type="text" value={correctiveActionData.customer} onChange={(event) => updateField('customer', event.target.value)} placeholder="JOST INTERNATIONAL" /></label>
            <label>Quantity<input type="text" value={correctiveActionData.quantity} onChange={(event) => updateField('quantity', event.target.value)} placeholder="500 EA" /></label>
            <label>Part Description<input type="text" value={correctiveActionData.partDescription} onChange={(event) => updateField('partDescription', event.target.value)} placeholder="Brace Ear Weldment" /></label>
            <label>Material<input type="text" value={correctiveActionData.material} onChange={(event) => updateField('material', event.target.value)} placeholder="3/8 in. HSLA GR50" /></label>
          </div>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header"><div><span className="step-pill">02</span><h3>Routing / Operations</h3><p>Editable routing context for the operation where the condition starts and where it affects downstream work.</p></div></div>
          <div className="form-grid">
            <label>Affected Operation<input type="text" value={correctiveActionData.affectedOperation} onChange={(event) => updateField('affectedOperation', event.target.value)} placeholder="CT10 - 4K Mazak Laser" /></label>
            <label>Next Operation<input type="text" value={correctiveActionData.nextOperation} onChange={(event) => updateField('nextOperation', event.target.value)} placeholder="RW10 - Cobot Welder" /></label>
            <label>Inspection Operation<input type="text" value={correctiveActionData.inspectionOperation} onChange={(event) => updateField('inspectionOperation', event.target.value)} placeholder="QC10 - Inspection" /></label>
          </div>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header"><div><span className="step-pill">03</span><h3>Key Feature / Inspection</h3><p>Editable critical feature, gauge method, and acceptance standard for the corrective action sheet.</p></div></div>
          <div className="form-grid">
            <label>Key Feature<input type="text" value={correctiveActionData.keyFeature} onChange={(event) => updateField('keyFeature', event.target.value)} placeholder="Ø .672 hole / square check" /></label>
            <label>Gauge / Check Method<input type="text" value={correctiveActionData.gaugeCheckMethod} onChange={(event) => updateField('gaugeCheckMethod', event.target.value)} placeholder="Approved no-go pin/gauge" /></label>
            <label>Acceptance Standard<input type="text" value={correctiveActionData.acceptanceStandard} onChange={(event) => updateField('acceptanceStandard', event.target.value)} placeholder="No-go pin must not enter" /></label>
          </div>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header"><div><span className="step-pill">04</span><h3>Issue Summary</h3><p>Editable description of the observed problem and why the corrective action is needed.</p></div></div>
          <label>Issue Summary<textarea value={correctiveActionData.issueSummary} onChange={(event) => updateField('issueSummary', event.target.value)} placeholder="Describe the hole-size issue, cleaning/staging problem, routing impact, or welding readiness concern." /></label>
        </article>
      </section>

      <section className="card" aria-label="Corrective Action requirements" style={{ marginTop: 16 }}>
        <div className="card-header"><div><span className="step-pill">05</span><h3>Corrective Action Requirements</h3><p>Editable requirements for cleaning, no-go gauge verification, and controlled stacking.</p></div><span className="field-status confirmed">3 Checks</span></div>
        <section className="agent-workflow-grid" aria-label="Corrective Action requirement rows" style={{ marginTop: 16 }}>
          {(Object.entries(requirements) as Array<[RequirementKey, RequirementRow]>).map(([key, requirement], index) => (
            <article className="card agent-workflow-card" key={key}>
              <div className="card-header"><div><span className="step-pill">{String(index + 1).padStart(2, '0')}</span><h3>{requirement.name}</h3><p>Editable requirement, standard, and acceptance condition.</p></div></div>
              <div className="form-grid">
                <label>Requirement Name<input type="text" value={requirement.name} onChange={(event) => updateRequirement(key, 'name', event.target.value)} /></label>
                <label>Required Standard<textarea value={requirement.requiredStandard} onChange={(event) => updateRequirement(key, 'requiredStandard', event.target.value)} /></label>
                <label>Acceptance Condition<textarea value={requirement.acceptanceCondition} onChange={(event) => updateRequirement(key, 'acceptanceCondition', event.target.value)} /></label>
              </div>
            </article>
          ))}
        </section>
      </section>

      <section className="agent-workflow-grid" aria-label="Corrective Action containment and pass fail" style={{ marginTop: 16 }}>
        <article className="card agent-workflow-card"><div className="card-header"><div><span className="step-pill">06</span><h3>Containment Action</h3><p>Editable containment steps before release to the next operation.</p></div></div><label>Containment Actions<textarea value={correctiveActionData.containmentActions} onChange={(event) => updateField('containmentActions', event.target.value)} /></label></article>
        <article className="card agent-workflow-card"><div className="card-header"><div><span className="step-pill">07</span><h3>Pass / Fail Condition</h3><p>Editable release criteria for accepted and rejected conditions.</p></div></div><div className="form-grid"><label>PASS Condition<textarea value={correctiveActionData.passCondition} onChange={(event) => updateField('passCondition', event.target.value)} /></label><label>FAIL Condition<textarea value={correctiveActionData.failCondition} onChange={(event) => updateField('failCondition', event.target.value)} /></label></div></article>
      </section>

      <section className="card" aria-label="Corrective Action operator checklist" style={{ marginTop: 16 }}>
        <div className="card-header"><div><span className="step-pill">08</span><h3>Operator Checklist</h3><p>Editable checklist for operator verification before release.</p></div><span className="field-status confirmed">7 Rows</span></div>
        <section className="agent-workflow-grid" aria-label="Operator checklist rows" style={{ marginTop: 16 }}>
          {checklistRows.map((row, index) => (
            <article className="card agent-workflow-card" key={`check-${row.checkNumber}`}>
              <div className="card-header"><div><span className="step-pill">{row.checkNumber}</span><h3>Checklist Item {row.checkNumber}</h3><p>Editable verification item with initials and completion control.</p></div></div>
              <div className="form-grid">
                <label>Check Number<input type="text" value={row.checkNumber} onChange={(event) => updateChecklistRow(index, 'checkNumber', event.target.value)} /></label>
                <label>Requirement Text<textarea value={row.requirementText} onChange={(event) => updateChecklistRow(index, 'requirementText', event.target.value)} /></label>
                <label>Initial / Verification<input type="text" value={row.verificationInitials} onChange={(event) => updateChecklistRow(index, 'verificationInitials', event.target.value)} placeholder="Initials / verifier" /></label>
                <label><input type="checkbox" checked={row.complete} onChange={(event) => updateChecklistRow(index, 'complete', event.target.checked)} /> Complete</label>
              </div>
            </article>
          ))}
        </section>
      </section>

      <section className="card" aria-label="Corrective Action release approval" style={{ marginTop: 16 }}>
        <div className="card-header"><div><span className="step-pill">09</span><h3>Release Approval</h3><p>Editable approval fields for operator, supervisor, and quality release.</p></div><span className="field-status confirmed">Approval</span></div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <label>Laser Operator<input type="text" value={releaseApproval.laserOperator} onChange={(event) => updateReleaseApproval('laserOperator', event.target.value)} placeholder="Laser Operator" /></label>
          <label>Laser Operator Date<input type="date" value={releaseApproval.laserOperatorDate} onChange={(event) => updateReleaseApproval('laserOperatorDate', event.target.value)} /></label>
          <label>Supervisor<input type="text" value={releaseApproval.supervisor} onChange={(event) => updateReleaseApproval('supervisor', event.target.value)} placeholder="Supervisor" /></label>
          <label>Supervisor Date<input type="date" value={releaseApproval.supervisorDate} onChange={(event) => updateReleaseApproval('supervisorDate', event.target.value)} /></label>
          <label>Quality<input type="text" value={releaseApproval.quality} onChange={(event) => updateReleaseApproval('quality', event.target.value)} placeholder="Quality" /></label>
          <label>Quality Date<input type="date" value={releaseApproval.qualityDate} onChange={(event) => updateReleaseApproval('qualityDate', event.target.value)} /></label>
        </div>
      </section>

      <section className="card" aria-label="Corrective Action Builder photo evidence" style={{ marginTop: 16 }}>
        <div className="card-header"><div><span className="step-pill">10</span><h3>Photo Evidence</h3><p>Structured WO 008604 evidence slots for router, print, staging, cleaned condition, gauge check, and incorrect condition proof.</p></div><span className="field-status confirmed">6 Slots</span></div>
        <section className="agent-workflow-grid" aria-label="Corrective Action Builder photo evidence slots" style={{ marginTop: 16 }}>
          {evidenceSlots.map((slot, index) => (
            <article className="card agent-workflow-card" key={slot.key}>
              <div className="card-header"><div><span className="step-pill">{String(index + 1).padStart(2, '0')}</span><h3>{slot.title}</h3><p>{slot.helper}</p></div></div>
              <div className="preview-box" aria-label={`${slot.title} placeholder`}>Evidence placeholder only. Image preview/upload processing will be added in a future approved milestone.</div>
              <label style={{ marginTop: 12 }}>Optional Evidence Notes<textarea value={evidenceNotes[slot.key]} onChange={(event) => updateEvidenceNotes(slot.key, event.target.value)} placeholder={`Notes for ${slot.title.toLowerCase()}.`} /></label>
            </article>
          ))}
        </section>
      </section>

      <section className="card agent-workflow-card" style={{ marginTop: 16 }}>
        <div className="card-header"><div><span className="step-pill">11</span><h3>Future Sections</h3><p>PDF layout, preview, and local history remain planned for future milestones.</p></div></div>
        <div className="placeholder-list"><div className="placeholder-item"><strong>Next Build Areas</strong><span>PDF layout, preview, and local history.</span></div></div>
      </section>
    </article>
  );
}
