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
};

type EvidenceSlotKey =
  | 'workOrderRouterControl'
  | 'drawingPrintRequirements'
  | 'batchConditionStackingControl'
  | 'correctCleanedCondition'
  | 'holeVerificationNoGoPin'
  | 'incorrectUncleanedCondition';

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
  const [evidenceNotes, setEvidenceNotes] = useState<EvidenceNotes>(defaultEvidenceNotes);

  const updateField = (key: keyof CorrectiveActionData, value: string) => {
    setCorrectiveActionData((current) => ({ ...current, [key]: value }));
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

      <p className="field-help">
        Frontend data-entry only. PDF generation, backend storage, AI extraction, GitHub automation, and runtime agent execution are not enabled in V3-M21.
      </p>

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

      <section className="card" aria-label="Corrective Action Builder photo evidence" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div>
            <span className="step-pill">05</span>
            <h3>Photo Evidence</h3>
            <p>Structured WO 008604 evidence slots for router, print, staging, cleaned condition, gauge check, and incorrect condition proof.</p>
          </div>
          <span className="field-status confirmed">6 Slots</span>
        </div>

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
        <div className="card-header"><div><span className="step-pill">06</span><h3>Future Sections</h3><p>Corrective action requirements, operator checklist, release approval, PDF layout, preview, and local history remain planned for future milestones.</p></div></div>
        <div className="placeholder-list"><div className="placeholder-item"><strong>Next Build Areas</strong><span>Requirements, pass/fail sections, operator checklist, PDF layout, preview, and local history.</span></div></div>
      </section>
    </article>
  );
}
