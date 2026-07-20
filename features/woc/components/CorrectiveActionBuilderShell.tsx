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
type EvidenceSlotKey = 'workOrderRouterControl' | 'drawingPrintRequirements' | 'batchConditionStackingControl' | 'correctCleanedCondition' | 'holeVerificationNoGoPin' | 'incorrectUncleanedCondition';
type RequirementRow = { name: string; requiredStandard: string; acceptanceCondition: string };
type ChecklistRow = { checkNumber: string; requirementText: string; verificationInitials: string; complete: boolean };
type ReleaseApproval = { laserOperator: string; laserOperatorDate: string; supervisor: string; supervisorDate: string; quality: string; qualityDate: string };
type RequirementRows = Record<RequirementKey, RequirementRow>;
type EvidenceNotes = Record<EvidenceSlotKey, string>;

const routerFieldLabels: Partial<Record<keyof CorrectiveActionData, string>> = {
  workOrder: 'Work Order',
  partNumber: 'Part Number',
  revision: 'Revision',
  customer: 'Customer',
  quantity: 'Quantity',
  partDescription: 'Part Description',
  material: 'Material',
  affectedOperation: 'Affected Operation',
  nextOperation: 'Next Operation',
  inspectionOperation: 'Inspection Operation',
  keyFeature: 'Key Feature',
  gaugeCheckMethod: 'Gauge / Check Method',
  acceptanceStandard: 'Acceptance Standard',
};

const mockExtractedRouterData: Pick<CorrectiveActionData, 'workOrder' | 'partNumber' | 'revision' | 'customer' | 'quantity' | 'partDescription' | 'material' | 'affectedOperation' | 'nextOperation' | 'inspectionOperation' | 'keyFeature' | 'gaugeCheckMethod' | 'acceptanceStandard'> = {
  workOrder: 'SYNTHETIC-WO-002',
  partNumber: 'SYNTHETIC-PART-002',
  revision: 'C',
  customer: 'SYNTHETIC-CUSTOMER',
  quantity: '500 EA',
  partDescription: 'Brace Ear Weldment',
  material: '3/8 in. HSLA GR50',
  affectedOperation: 'CT10 - 4K Mazak Laser',
  nextOperation: 'RW10 - Cobot Welder',
  inspectionOperation: 'QC10 - Inspection',
  keyFeature: 'Ø .672 hole / square check',
  gaugeCheckMethod: 'Approved no-go pin/gauge',
  acceptanceStandard: 'No-go pin must not enter',
};

const defaultCorrectiveActionData: CorrectiveActionData = {
  ...mockExtractedRouterData,
  issueSummary: '',
  containmentActions: 'Separate clean/ready parts from parts requiring cleanup. Clean all dross, slag, burrs, and rough laser edges. Recheck Ø .672 hole with approved no-go gauge. Hold questionable parts. Restack acceptable parts in sets of 8. Notify Supervisor/Quality for repeat issues.',
  passCondition: 'Parts are cleaned/ground after laser, hole checked with no-go gauge, and stacked neatly in sets of 8.',
  failCondition: 'Parts contain visible dross, slag, rough laser edge, hole burrs, questionable hole size, missing cleaned/ground area, or uncontrolled stacking.',
};

const defaultRequirements: RequirementRows = {
  cleanAfterLaser: { name: 'Clean after laser', requiredStandard: 'Remove dross, slag, burrs, and rough laser edge buildup.', acceptanceCondition: 'Part edge and weld-prep area are clean, smooth, and ready for downstream welding.' },
  noGoGaugeHoleCheck: { name: 'No-go gauge hole check', requiredStandard: 'Use approved no-go pin/gauge for Ø .672 hole before release.', acceptanceCondition: 'No-go pin must not enter the checked hole.' },
  stackInSetsOfEight: { name: 'Stack in sets of 8', requiredStandard: 'Stack cleaned/verified parts neatly in controlled sets of 8 on skid.', acceptanceCondition: 'Batch is organized, countable, and staged consistently for the next operation.' },
};

const defaultChecklistRows: ChecklistRow[] = [
  'Bottom side cleaned — no heavy dross/slag',
  'Outside profile, tabs, slot, and corners deburred',
  'Hole area cleaned and burr-free',
  'Ø .672 hole checked with approved no-go pin/gauge',
  'Part square/print checks completed as required',
  'Parts stacked neatly in sets of 8 on skid',
  'Questionable parts held and Supervisor/Quality notified',
].map((requirementText, index) => ({ checkNumber: String(index + 1).padStart(2, '0'), requirementText, verificationInitials: '', complete: false }));

const defaultReleaseApproval: ReleaseApproval = { laserOperator: '', laserOperatorDate: '', supervisor: '', supervisorDate: '', quality: '', qualityDate: '' };

const evidenceSlots: Array<{ key: EvidenceSlotKey; title: string; helper: string }> = [
  { key: 'workOrderRouterControl', title: 'Work Order / Router Control', helper: 'Shows the work order, router, operation sequence, WO number, part number, revision, quantity, and routing context.' },
  { key: 'drawingPrintRequirements', title: 'Drawing / Print Requirements', helper: 'Shows the drawing, print note, hole requirement, square check, gauge requirement, or inspection callout.' },
  { key: 'batchConditionStackingControl', title: 'Batch Condition / Stacking Control', helper: 'Shows how parts are grouped, stacked, staged, or bundled before welding or inspection.' },
  { key: 'correctCleanedCondition', title: 'Correct Cleaned Condition', helper: 'Shows the acceptable cleaned/ground condition before welding so operators can compare good vs bad condition.' },
  { key: 'holeVerificationNoGoPin', title: 'Hole Verification / No-Go Pin', helper: 'Shows approved no-go pin or gauge verification evidence for the hole-size check.' },
  { key: 'incorrectUncleanedCondition', title: 'Incorrect Uncleaned Condition', helper: 'Shows the unacceptable uncleaned condition, slag, burrs, laser scale, or weld-readiness issue for comparison.' },
];

const futureExtractionFields = Object.keys(mockExtractedRouterData).map((key) => routerFieldLabels[key as keyof CorrectiveActionData] || key);
const structuredOutputFields = [...Object.keys(mockExtractedRouterData), 'confidenceNotes', 'sourceEvidence'];
const futureAiVisionWorkflow = ['Upload or photograph router/work-order evidence', 'Send image/PDF to backend extraction service', 'AI Vision extracts router/work-order fields', 'Extracted fields appear in Router Data Extraction Preview', 'User reviews/corrects extracted data', 'User confirms extracted data', 'Confirmed data feeds Draft Preview and future PDF export'];
const backendBoundaryRules = ['API key must never be stored in frontend code', 'AI Vision calls must run through secure backend/server route', 'Frontend only sends selected file/evidence and receives structured extracted data', 'User confirmation is required before extracted data is used', 'Failed/uncertain extraction must not overwrite confirmed data', 'Extraction result must preserve source evidence reference'];
const pdfPlanSections = [
  { title: 'Cover / Main Corrective Action Sheet', items: ['Title', 'Work Order', 'Part Number', 'Revision', 'Customer', 'Quantity', 'Part Description', 'Material', 'Affected Operation', 'Next Operation', 'Inspection Operation', 'Key Feature', 'Issue Summary'] },
  { title: 'Corrective Action Requirements Page', items: ['Requirements table', 'Containment Action', 'Responsibility Matrix placeholder', 'Pass / Fail Condition', 'Corrective Action Closeout placeholder'] },
  { title: 'Photo Evidence Pages', items: evidenceSlots.map((slot) => slot.title) },
  { title: 'Operator Checklist / Release Approval Page', items: ['Operator Checklist', 'Laser Operator approval', 'Supervisor approval', 'Quality approval'] },
];
const defaultEvidenceNotes = evidenceSlots.reduce((notes, slot) => ({ ...notes, [slot.key]: '' }), {} as EvidenceNotes);

function InfoList({ items, label }: { items: string[]; label: string }) {
  return <div className="placeholder-list">{items.map((item) => <div className="placeholder-item" key={item}><strong>{item}</strong><span>{label}</span></div>)}</div>;
}

export function CorrectiveActionBuilderShell() {
  const [correctiveActionData, setCorrectiveActionData] = useState<CorrectiveActionData>(defaultCorrectiveActionData);
  const [requirements, setRequirements] = useState<RequirementRows>(defaultRequirements);
  const [checklistRows, setChecklistRows] = useState<ChecklistRow[]>(defaultChecklistRows);
  const [releaseApproval, setReleaseApproval] = useState<ReleaseApproval>(defaultReleaseApproval);
  const [evidenceNotes, setEvidenceNotes] = useState<EvidenceNotes>(defaultEvidenceNotes);
  const [extractionReviewStatus, setExtractionReviewStatus] = useState('Mock extraction only — needs user verification — not confirmed.');
  const [routerDataConfirmed, setRouterDataConfirmed] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('Extracted router data requires review.');

  const updateField = (key: keyof CorrectiveActionData, value: string) => setCorrectiveActionData((current) => ({ ...current, [key]: value }));
  const updateRequirement = (key: RequirementKey, field: keyof RequirementRow, value: string) => setRequirements((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  const updateChecklistRow = (index: number, field: keyof ChecklistRow, value: string | boolean) => setChecklistRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  const updateReleaseApproval = (key: keyof ReleaseApproval, value: string) => setReleaseApproval((current) => ({ ...current, [key]: value }));
  const updateEvidenceNotes = (key: EvidenceSlotKey, value: string) => setEvidenceNotes((current) => ({ ...current, [key]: value }));
  const applyMockExtractedData = () => {
    setCorrectiveActionData((current) => ({ ...current, ...mockExtractedRouterData }));
    setRouterDataConfirmed(false);
    setExtractionReviewStatus('Mock data applied — user verification still required — not confirmed.');
    setVerificationMessage('Extracted router data requires review.');
  };
  const confirmExtractedData = () => {
    setRouterDataConfirmed(true);
    setExtractionReviewStatus('Extracted router data confirmed by user.');
    setVerificationMessage('Extracted router data confirmed by user.');
  };
  const resetConfirmation = () => {
    setRouterDataConfirmed(false);
    setExtractionReviewStatus('Extracted router data requires review.');
    setVerificationMessage('Extracted router data requires review.');
  };

  const fieldCards: Array<{ title: string; helper: string; fields: Array<[keyof CorrectiveActionData, string, 'input' | 'textarea']> }> = [
    { title: 'Job / Part Information', helper: 'Editable work order, part, customer, quantity, description, and material fields.', fields: [['workOrder', 'Work Order', 'input'], ['partNumber', 'Part Number', 'input'], ['revision', 'Revision', 'input'], ['customer', 'Customer', 'input'], ['quantity', 'Quantity', 'input'], ['partDescription', 'Part Description', 'input'], ['material', 'Material', 'input']] },
    { title: 'Routing / Operations', helper: 'Editable routing context for operation flow.', fields: [['affectedOperation', 'Affected Operation', 'input'], ['nextOperation', 'Next Operation', 'input'], ['inspectionOperation', 'Inspection Operation', 'input']] },
    { title: 'Key Feature / Inspection', helper: 'Editable critical feature, gauge method, and acceptance standard.', fields: [['keyFeature', 'Key Feature', 'input'], ['gaugeCheckMethod', 'Gauge / Check Method', 'input'], ['acceptanceStandard', 'Acceptance Standard', 'input']] },
    { title: 'Issue Summary', helper: 'Editable description of the observed problem.', fields: [['issueSummary', 'Issue Summary', 'textarea']] },
  ];

  return (
    <article className="card corrective-action-builder-shell">
      <div className="card-header"><div><span className="step-pill">V3 DATA MODEL</span><h2>Corrective Action Builder</h2><p>Create controlled shop-floor corrective action sheets from work order, print, part, gauge, and staging evidence.</p></div><span className="field-status confirmed">Fields</span></div>
      <p className="field-help">Frontend planning only. AI Vision, backend storage, PDF generation, GitHub automation, and runtime agent execution are not enabled in V3-M30.</p>

      <section className="card" aria-label="Router Capture and Auto-Populate Planning" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">01</span><h3>Router / Work Order Capture</h3><p>Upload or photograph router/work-order evidence for future AI-assisted field extraction.</p></div><span className="field-status pending">Planning</span></div><p className="field-help">AI extraction is not active yet. Future flow: router/photo/PDF capture → AI Vision extracts data → user verifies/corrects → confirmed data moves to preview/PDF.</p><div className="preview-box" style={{ marginTop: 16 }}>Router/work-order upload and photo capture placeholder. No parsing, upload processing, AI Vision, or PDF export is active.</div><div className="form-grid" style={{ marginTop: 16 }}><label>Optional Router Upload Placeholder<input type="file" disabled /></label></div><section className="agent-workflow-grid" aria-label="Future extraction fields" style={{ marginTop: 16 }}><article className="card agent-workflow-card"><div className="card-header"><div><h3>Future Auto-Populate Fields</h3><p>Future AI Vision extraction targets.</p></div></div><InfoList items={futureExtractionFields} label="Future AI-assisted extraction target" /></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Human Verification Gate</h3><p>AI can populate fields. Human must confirm before release.</p></div></div><InfoList items={['Extracted data must be reviewed and confirmed by the user before being used in the corrective action preview or future PDF.']} label="Verification rule" /></article></section><div className="form-grid" style={{ marginTop: 16 }}><button className="button secondary" type="button" disabled>Capture Router Coming Soon</button><button className="button secondary" type="button" disabled>Auto-Populate Coming Soon</button><button className="button secondary" type="button" disabled>Confirm Extracted Data Coming Soon</button></div></section>

      <section className="card" aria-label="AI Vision Integration Planning" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">02</span><h3>AI Vision Integration Planning / Backend Boundary</h3><p>Planning-only boundary for future secure router/work-order extraction.</p></div><span className="field-status pending">Not Active</span></div><p className="field-help">AI Vision integration is planned only and not active yet. No backend, API, OpenAI call, file parsing, or PDF export is enabled.</p><section className="agent-workflow-grid" aria-label="AI Vision backend boundary details" style={{ marginTop: 16 }}><article className="card agent-workflow-card"><div className="card-header"><div><h3>Future AI Vision Workflow</h3><p>Intended future flow once backend extraction is approved.</p></div></div><InfoList items={futureAiVisionWorkflow} label="Planned workflow step" /></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Backend Boundary Rules</h3><p>Rules that protect API keys, confirmed data, and source evidence.</p></div></div><InfoList items={backendBoundaryRules} label="Boundary rule" /></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Future Structured Extraction Output</h3><p>Expected JSON-like fields returned by the backend extraction service.</p></div></div><InfoList items={structuredOutputFields} label="Planned output field" /></article></section><div className="form-grid" style={{ marginTop: 16 }}><button className="button secondary" type="button" disabled>Run AI Vision Extraction Coming Soon</button><button className="button secondary" type="button" disabled>Review Extracted Data Coming Soon</button><button className="button secondary" type="button" disabled>Confirm After Review Coming Soon</button></div></section>

      <section className="card" aria-label="Router Data Extraction Preview" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">03</span><h3>Router Data Extraction Preview</h3><p>Mock AI output preview for future router/work-order extraction review.</p></div><span className="field-status pending">Mock Only</span></div><p className="field-help">AI-extracted data must be reviewed and confirmed before being used in preview/PDF. Applying mock data does not confirm it.</p><div className="action-row" style={{ marginTop: 12 }}><span className="field-status pending">Mock extraction only</span><span className="field-status pending">Needs user verification</span><span className={routerDataConfirmed ? 'field-status confirmed' : 'field-status pending'}>{routerDataConfirmed ? 'Confirmed by User' : 'Not Confirmed'}</span></div><div className="placeholder-list" style={{ marginTop: 16 }}><div className="placeholder-item"><strong>Verification Status</strong><span>{routerDataConfirmed ? 'Confirmed by User' : 'Not Confirmed'}</span></div><div className="placeholder-item"><strong>Ready for Preview/PDF</strong><span>{routerDataConfirmed ? 'Yes' : 'No'}</span></div><div className="placeholder-item"><strong>Review Message</strong><span>{verificationMessage}</span></div><div className="placeholder-item"><strong>Review Status</strong><span>{extractionReviewStatus}</span></div></div><section className="agent-workflow-grid" aria-label="Mock extracted router data" style={{ marginTop: 16 }}>{Object.entries(mockExtractedRouterData).map(([key, value]) => <article className="card agent-workflow-card" key={key}><div className="card-header"><div><h3>{routerFieldLabels[key as keyof CorrectiveActionData] || key}</h3><p>{value}</p></div></div></article>)}</section><div className="form-grid" style={{ marginTop: 16 }}><button className="button secondary" type="button" onClick={applyMockExtractedData}>Apply Mock Extracted Data</button><button className="button success" type="button" onClick={confirmExtractedData}>Confirm Extracted Data</button><button className="button danger" type="button" onClick={resetConfirmation}>Reset Confirmation</button></div></section>

      <section className="agent-workflow-grid" aria-label="Corrective Action Builder data fields" style={{ marginTop: 16 }}>{fieldCards.map((card, index) => <article className="card agent-workflow-card" key={card.title}><div className="card-header"><div><span className="step-pill">{String(index + 4).padStart(2, '0')}</span><h3>{card.title}</h3><p>{card.helper}</p></div></div><div className="form-grid">{card.fields.map(([key, label, controlType]) => <label key={key}>{label}{controlType === 'textarea' ? <textarea value={correctiveActionData[key]} onChange={(event) => updateField(key, event.target.value)} /> : <input type="text" value={correctiveActionData[key]} onChange={(event) => updateField(key, event.target.value)} />}</label>)}</div></article>)}</section>

      <section className="card" aria-label="Corrective Action requirements" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">08</span><h3>Corrective Action Requirements</h3><p>Editable requirements for cleaning, no-go gauge verification, and controlled stacking.</p></div><span className="field-status confirmed">3 Checks</span></div><section className="agent-workflow-grid" aria-label="Corrective Action requirement rows" style={{ marginTop: 16 }}>{(Object.entries(requirements) as Array<[RequirementKey, RequirementRow]>).map(([key, requirement], index) => <article className="card agent-workflow-card" key={key}><div className="card-header"><div><span className="step-pill">{String(index + 1).padStart(2, '0')}</span><h3>{requirement.name}</h3><p>Editable requirement, standard, and acceptance condition.</p></div></div><div className="form-grid"><label>Requirement Name<input type="text" value={requirement.name} onChange={(event) => updateRequirement(key, 'name', event.target.value)} /></label><label>Required Standard<textarea value={requirement.requiredStandard} onChange={(event) => updateRequirement(key, 'requiredStandard', event.target.value)} /></label><label>Acceptance Condition<textarea value={requirement.acceptanceCondition} onChange={(event) => updateRequirement(key, 'acceptanceCondition', event.target.value)} /></label></div></article>)}</section></section>

      <section className="agent-workflow-grid" aria-label="Corrective Action containment and pass fail" style={{ marginTop: 16 }}><article className="card agent-workflow-card"><div className="card-header"><div><span className="step-pill">09</span><h3>Containment Action</h3><p>Editable containment steps before release to the next operation.</p></div></div><label>Containment Actions<textarea value={correctiveActionData.containmentActions} onChange={(event) => updateField('containmentActions', event.target.value)} /></label></article><article className="card agent-workflow-card"><div className="card-header"><div><span className="step-pill">10</span><h3>Pass / Fail Condition</h3><p>Editable release criteria for accepted and rejected conditions.</p></div></div><div className="form-grid"><label>PASS Condition<textarea value={correctiveActionData.passCondition} onChange={(event) => updateField('passCondition', event.target.value)} /></label><label>FAIL Condition<textarea value={correctiveActionData.failCondition} onChange={(event) => updateField('failCondition', event.target.value)} /></label></div></article></section>

      <section className="card" aria-label="Corrective Action operator checklist" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">11</span><h3>Operator Checklist</h3><p>Editable checklist for operator verification before release.</p></div><span className="field-status confirmed">7 Rows</span></div><section className="agent-workflow-grid" aria-label="Operator checklist rows" style={{ marginTop: 16 }}>{checklistRows.map((row, index) => <article className="card agent-workflow-card" key={`check-${row.checkNumber}`}><div className="card-header"><div><span className="step-pill">{row.checkNumber}</span><h3>Checklist Item {row.checkNumber}</h3><p>Editable verification item with initials and completion control.</p></div></div><div className="form-grid"><label>Check Number<input type="text" value={row.checkNumber} onChange={(event) => updateChecklistRow(index, 'checkNumber', event.target.value)} /></label><label>Requirement Text<textarea value={row.requirementText} onChange={(event) => updateChecklistRow(index, 'requirementText', event.target.value)} /></label><label>Initial / Verification<input type="text" value={row.verificationInitials} onChange={(event) => updateChecklistRow(index, 'verificationInitials', event.target.value)} placeholder="Initials / verifier" /></label><label><input type="checkbox" checked={row.complete} onChange={(event) => updateChecklistRow(index, 'complete', event.target.checked)} /> Complete</label></div></article>)}</section></section>

      <section className="card" aria-label="Corrective Action release approval" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">12</span><h3>Release Approval</h3><p>Editable approval fields for operator, supervisor, and quality release.</p></div><span className="field-status confirmed">Approval</span></div><div className="form-grid" style={{ marginTop: 16 }}><label>Laser Operator<input type="text" value={releaseApproval.laserOperator} onChange={(event) => updateReleaseApproval('laserOperator', event.target.value)} placeholder="Laser Operator" /></label><label>Laser Operator Date<input type="date" value={releaseApproval.laserOperatorDate} onChange={(event) => updateReleaseApproval('laserOperatorDate', event.target.value)} /></label><label>Supervisor<input type="text" value={releaseApproval.supervisor} onChange={(event) => updateReleaseApproval('supervisor', event.target.value)} placeholder="Supervisor" /></label><label>Supervisor Date<input type="date" value={releaseApproval.supervisorDate} onChange={(event) => updateReleaseApproval('supervisorDate', event.target.value)} /></label><label>Quality<input type="text" value={releaseApproval.quality} onChange={(event) => updateReleaseApproval('quality', event.target.value)} placeholder="Quality" /></label><label>Quality Date<input type="date" value={releaseApproval.qualityDate} onChange={(event) => updateReleaseApproval('qualityDate', event.target.value)} /></label></div></section>

      <section className="card" aria-label="Corrective Action Builder photo evidence" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">13</span><h3>Photo Evidence</h3><p>Structured synthetic work-order evidence slots for router, print, staging, cleaned condition, gauge check, and incorrect condition proof.</p></div><span className="field-status confirmed">6 Slots</span></div><section className="agent-workflow-grid" aria-label="Corrective Action Builder photo evidence slots" style={{ marginTop: 16 }}>{evidenceSlots.map((slot, index) => <article className="card agent-workflow-card" key={slot.key}><div className="card-header"><div><span className="step-pill">{String(index + 1).padStart(2, '0')}</span><h3>{slot.title}</h3><p>{slot.helper}</p></div></div><div className="preview-box" aria-label={`${slot.title} placeholder`}>Evidence placeholder only. Image preview/upload processing will be added in a future approved milestone.</div><label style={{ marginTop: 12 }}>Optional Evidence Notes<textarea value={evidenceNotes[slot.key]} onChange={(event) => updateEvidenceNotes(slot.key, event.target.value)} placeholder={`Notes for ${slot.title.toLowerCase()}.`} /></label></article>)}</section></section>

      <section className="card" aria-label="Corrective Action PDF export planning" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">14</span><h3>PDF Export Plan</h3><p>Planning-only layout foundation for a future corrective action PDF export based on synthetic fixture data.</p></div><span className="field-status pending">Coming Soon</span></div><p className="field-help">PDF generation is not active yet. Ready for Preview/PDF: {routerDataConfirmed ? 'Yes' : 'No'}.</p><section className="agent-workflow-grid" aria-label="Future PDF export structure" style={{ marginTop: 16 }}>{pdfPlanSections.map((section, index) => <article className="card agent-workflow-card" key={section.title}><div className="card-header"><div><span className="step-pill">{String(index + 1).padStart(2, '0')}</span><h3>{section.title}</h3><p>Future PDF page / section layout.</p></div></div><InfoList items={section.items} label="Planned PDF content block" /></article>)}</section><button className="button secondary full-width" type="button" disabled style={{ marginTop: 16 }}>Export PDF Coming Soon</button></section>

      <section className="card" aria-label="Corrective Action draft preview" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">15</span><h3>Draft Preview</h3><p>Preview-only review of the current corrective action sheet before future PDF export.</p></div><span className={routerDataConfirmed ? 'field-status confirmed' : 'field-status pending'}>{routerDataConfirmed ? 'Confirmed' : 'Not Confirmed'}</span></div>{!routerDataConfirmed && <p className="field-help">Router data has not been confirmed. Review before release.</p>}<p className="field-help">This is a live draft preview only. PDF export is not active yet. Ready for Preview/PDF: {routerDataConfirmed ? 'Yes' : 'No'}.</p><section className="agent-workflow-grid" aria-label="Corrective Action draft preview sections" style={{ marginTop: 16 }}><article className="card agent-workflow-card"><div className="card-header"><div><h3>Corrective Action Sheet</h3><p>WO {correctiveActionData.workOrder || '—'} / PN {correctiveActionData.partNumber || '—'} / {correctiveActionData.customer || 'Customer pending'}</p></div></div><div className="placeholder-list"><div className="placeholder-item"><strong>Work Order</strong><span>{correctiveActionData.workOrder || 'Not entered'}</span></div><div className="placeholder-item"><strong>Part Number</strong><span>{correctiveActionData.partNumber || 'Not entered'}</span></div><div className="placeholder-item"><strong>Customer</strong><span>{correctiveActionData.customer || 'Not entered'}</span></div></div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Job / Part Summary</h3><p>Revision, quantity, description, and material.</p></div></div><div className="placeholder-list"><div className="placeholder-item"><strong>Revision</strong><span>{correctiveActionData.revision || 'Not entered'}</span></div><div className="placeholder-item"><strong>Quantity</strong><span>{correctiveActionData.quantity || 'Not entered'}</span></div><div className="placeholder-item"><strong>Part Description</strong><span>{correctiveActionData.partDescription || 'Not entered'}</span></div><div className="placeholder-item"><strong>Material</strong><span>{correctiveActionData.material || 'Not entered'}</span></div></div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Routing Summary</h3><p>Affected, next, inspection, and key feature context.</p></div></div><div className="placeholder-list"><div className="placeholder-item"><strong>Affected Operation</strong><span>{correctiveActionData.affectedOperation || 'Not entered'}</span></div><div className="placeholder-item"><strong>Next Operation</strong><span>{correctiveActionData.nextOperation || 'Not entered'}</span></div><div className="placeholder-item"><strong>Inspection Operation</strong><span>{correctiveActionData.inspectionOperation || 'Not entered'}</span></div><div className="placeholder-item"><strong>Key Feature</strong><span>{correctiveActionData.keyFeature || 'Not entered'}</span></div></div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Issue Summary Preview</h3><p>{correctiveActionData.issueSummary || 'No issue summary entered yet.'}</p></div></div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Corrective Action Requirements Preview</h3><p>Clean, gauge, and stack requirements.</p></div></div><div className="placeholder-list">{Object.values(requirements).map((requirement) => <div className="placeholder-item" key={requirement.name}><strong>{requirement.name}</strong><span>{requirement.requiredStandard} Acceptance: {requirement.acceptanceCondition}</span></div>)}</div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Containment + Pass/Fail Preview</h3><p>Release criteria and containment summary.</p></div></div><div className="placeholder-list"><div className="placeholder-item"><strong>Containment</strong><span>{correctiveActionData.containmentActions || 'Not entered'}</span></div><div className="placeholder-item"><strong>PASS</strong><span>{correctiveActionData.passCondition || 'Not entered'}</span></div><div className="placeholder-item"><strong>FAIL</strong><span>{correctiveActionData.failCondition || 'Not entered'}</span></div></div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Photo Evidence Summary</h3><p>Evidence slot titles and note status.</p></div></div><div className="placeholder-list">{evidenceSlots.map((slot) => <div className="placeholder-item" key={slot.key}><strong>{slot.title}</strong><span>{evidenceNotes[slot.key] ? evidenceNotes[slot.key] : 'No notes added yet.'}</span></div>)}</div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Operator Checklist Summary</h3><p>Completion and initials status.</p></div></div><div className="placeholder-list">{checklistRows.map((row) => <div className="placeholder-item" key={`preview-${row.checkNumber}`}><strong>{row.checkNumber}. {row.requirementText}</strong><span>{row.complete ? 'Complete' : 'Open'} / Initials: {row.verificationInitials || 'Pending'}</span></div>)}</div></article><article className="card agent-workflow-card"><div className="card-header"><div><h3>Release Approval Summary</h3><p>Laser Operator, Supervisor, and Quality approval status.</p></div></div><div className="placeholder-list"><div className="placeholder-item"><strong>Laser Operator</strong><span>{releaseApproval.laserOperator || 'Pending'} / {releaseApproval.laserOperatorDate || 'Date pending'}</span></div><div className="placeholder-item"><strong>Supervisor</strong><span>{releaseApproval.supervisor || 'Pending'} / {releaseApproval.supervisorDate || 'Date pending'}</span></div><div className="placeholder-item"><strong>Quality</strong><span>{releaseApproval.quality || 'Pending'} / {releaseApproval.qualityDate || 'Date pending'}</span></div></div></article></section><button className="button secondary full-width" type="button" disabled style={{ marginTop: 16 }}>Export PDF Coming Soon</button></section>

      <section className="card agent-workflow-card" style={{ marginTop: 16 }}><div className="card-header"><div><span className="step-pill">16</span><h3>Future Sections</h3><p>Local history remains planned for a future milestone.</p></div></div><InfoList items={['Local history']} label="Future build area" /></section>
    </article>
  );
}
