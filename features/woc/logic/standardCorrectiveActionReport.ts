import type { StructuredCorrectiveActionDraft } from './aiCorrectiveActionDraftFoundation';

export type StandardEvidenceItem = {
  id?: string;
  label?: string;
  caption?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
};

export type StandardCorrectiveActionReportInput = {
  workOrderNumber?: string;
  partNumber?: string;
  customerOrJob?: string;
  quantity?: string;
  quantityAffected?: string;
  routerStepOperation?: string;
  operationNumber?: string;
  affectedOperationEquipment?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  issueDetails?: string;
  requestedEngineeringAction?: string;
  requiredCorrection?: string;
  correctionType?: string;
  foundAtDepartment?: string;
  affectedArea?: string;
  correctiveActionOwnerDepartment?: string;
  productionImpact?: string;
  immediateContainment?: string;
  inspectionVerificationRequirement?: string;
  preventionStandardWorkUpdate?: string;
  releaseApprovalRequirement?: string;
  photoEvidenceStatus?: string;
  evidenceItems?: StandardEvidenceItem[];
  structuredDraft?: StructuredCorrectiveActionDraft | null;
  submittedBy?: string;
  dateCaptured?: string;
  priority?: string;
  finalReviewConfirmed?: boolean;
};

export type StandardEvidenceRow = {
  slot: string;
  typeLabel: string;
  status: string;
  notes: string;
};

const DEFAULT_SUBMITTED_BY = 'AI-CAS — Corrective Action System';
const DEFAULT_DATE_CAPTURED = 'Pending final review date';
const DEFAULT_PRIORITY = 'Standard review';
const OTHER_VALUES = new Set(['other', 'other / needs review']);

function normalize(value?: string) {
  return value?.trim() ?? '';
}

function firstFilled(...values: Array<string | undefined>) {
  return values.map(normalize).find(Boolean) ?? '';
}

function isOtherOrBlank(value?: string) {
  const normalized = normalize(value).toLowerCase();
  return !normalized || OTHER_VALUES.has(normalized);
}

function standardValue(value?: string) {
  return normalize(value) || 'Not confirmed';
}

function optionalReportLine(label: string, value?: string) {
  const normalized = normalize(value);
  return normalized ? `${label}: ${normalized}\n` : '';
}

export function getOperatorStatement(input: Pick<StandardCorrectiveActionReportInput, 'shortIssueDescription'>) {
  // V8-M2C boundary: only the user-entered Simple Mode issue text can become the operator statement.
  return firstFilled(input.shortIssueDescription, 'Operator issue statement not entered.');
}

function getOwnerDepartment(input: StandardCorrectiveActionReportInput) {
  return isOtherOrBlank(input.correctiveActionOwnerDepartment)
    ? 'Manufacturing Engineering / Production'
    : normalize(input.correctiveActionOwnerDepartment);
}

function getAffectedArea(input: StandardCorrectiveActionReportInput) {
  return firstFilled(input.foundAtDepartment, input.affectedArea, 'affected department');
}

function getAffectedOperationEquipment(input: StandardCorrectiveActionReportInput) {
  const selectedOperation = normalize(input.affectedOperationEquipment);
  if (selectedOperation && !isOtherOrBlank(selectedOperation)) return selectedOperation;

  const affectedArea = getAffectedArea(input);
  if (affectedArea.toLowerCase() === 'welding') return 'Welding';

  return 'Operation needs confirmation';
}

function getAffectedProcess(input: StandardCorrectiveActionReportInput) {
  const affectedArea = getAffectedArea(input);
  const operationEquipment = getAffectedOperationEquipment(input);

  if (!operationEquipment || operationEquipment === 'Operation needs confirmation') {
    return affectedArea ? `${affectedArea} — Operation needs confirmation` : 'Affected operation not confirmed';
  }

  if (!affectedArea || affectedArea === operationEquipment) return operationEquipment;

  return `${affectedArea} — ${operationEquipment}`;
}

function getProductionImpact(input: StandardCorrectiveActionReportInput) {
  const operatorStatement = getOperatorStatement(input).toLowerCase();
  if (normalize(input.productionImpact)) return normalize(input.productionImpact);
  if (/runtime|rate|per hour|time study|sustainable/.test(operatorStatement)) {
    return 'flow risk, schedule risk, and repeat issue risk until the standard and actual run rate are reconciled';
  }
  return 'quality risk, flow risk, and repeat issue risk until the correction is reviewed and confirmed';
}

function getStructuredDraftText(input: StandardCorrectiveActionReportInput, section: keyof StructuredCorrectiveActionDraft['sections']) {
  return input.structuredDraft?.sections[section]?.draftText.trim() ?? '';
}

export function buildAiCasProfessionalSummary(input: StandardCorrectiveActionReportInput) {
  const structuredSummary = getStructuredDraftText(input, 'issueSummary');
  if (structuredSummary) return structuredSummary;

  const operatorStatement = getOperatorStatement(input);
  const workOrder = normalize(input.workOrderNumber);
  const partNumber = normalize(input.partNumber);
  const affectedArea = getAffectedProcess(input);
  const jobContext = [workOrder ? `WO ${workOrder}` : '', partNumber ? `Part ${partNumber}` : '']
    .filter(Boolean)
    .join(' / ');

  if (/runtime|rate|per hour|time study|sustainable/i.test(operatorStatement)) {
    return `Operator reported a run-rate/runtime mismatch in ${affectedArea}${jobContext ? ` for ${jobContext}` : ''}. The current expected output and observed capacity must be verified because the discrepancy may affect production flow, scheduling, and repeat performance if the router or process standard remains uncorrected.`;
  }

  return `Operator reported a shop-floor issue in ${affectedArea}${jobContext ? ` for ${jobContext}` : ''}. AI-CAS converted the operator statement into a draft corrective-action summary for Engineering, Quality, and Production review before release.`;
}

export function buildAiCasRequiredAction(input: StandardCorrectiveActionReportInput) {
  const structuredAction = firstFilled(
    getStructuredDraftText(input, 'correctiveActionRequired'),
    getStructuredDraftText(input, 'responsibilityByOperation'),
  );
  if (structuredAction) return structuredAction;

  const operatorStatement = getOperatorStatement(input);
  const requestedAction = firstFilled(input.requiredCorrection, input.requestedEngineeringAction);
  if (requestedAction) return requestedAction;

  const owner = getOwnerDepartment(input);
  const affectedArea = getAffectedProcess(input);
  const impact = getProductionImpact(input);

  if (/runtime|rate|per hour|time study|sustainable/i.test(operatorStatement)) {
    return `${owner} must perform and document a time study or equivalent router/runtime review for the ${affectedArea} operation, compare the confirmed actual rate against the current planned standard, and update the router, work instructions, staffing/process plan, or quoted production expectation as required. Production should not treat the current mismatch as acceptable without review because it creates ${impact}.`;
  }

  return `${owner} must review the confirmed issue, determine the required correction for the ${affectedArea} operation, update or clarify the router/work instructions as needed, and verify the correction before the job proceeds. Production impact to monitor: ${impact}.`;
}

export function buildStandardEmailSubject(input: StandardCorrectiveActionReportInput) {
  const workOrder = standardValue(input.workOrderNumber);
  const partNumber = standardValue(input.partNumber);

  if (isOtherOrBlank(input.correctionType)) {
    return `[AI-CAS] Corrective Action Draft — WO ${workOrder} / Part ${partNumber}`;
  }

  return `[${normalize(input.correctionType)}] Corrective Action Draft — WO ${workOrder} / Part ${partNumber}`;
}

export function buildStandardEvidenceRows(input: StandardCorrectiveActionReportInput): StandardEvidenceRow[] {
  const evidenceItems = input.evidenceItems ?? [];
  if (evidenceItems.length) {
    return evidenceItems.map((item, index) => ({
      slot: `Evidence Slot ${index + 1}`,
      typeLabel: normalize(item.label) || 'Review evidence',
      status: normalize(item.fileName) ? 'Metadata captured; image not embedded' : 'Metadata captured',
      notes: firstFilled(item.caption, item.fileName, 'Review-step evidence metadata captured.'),
    }));
  }

  return [
    {
      slot: 'Evidence Slot 1',
      typeLabel: 'Evidence metadata',
      status: normalize(input.photoEvidenceStatus) || 'No evidence attached',
      notes: 'No photo images are embedded in the main report, email, or PDF.',
    },
  ];
}

export function buildStandardCorrectiveActionReportText(input: StandardCorrectiveActionReportInput) {
  const operatorStatement = getOperatorStatement(input);
  const summary = buildAiCasProfessionalSummary(input);
  const requiredAction = buildAiCasRequiredAction(input);
  const owner = getOwnerDepartment(input);
  const productionImpact = getProductionImpact(input);
  const evidenceRows = buildStandardEvidenceRows(input);
  const dateCaptured = standardValue(input.dateCaptured ?? DEFAULT_DATE_CAPTURED);
  const submittedBy = standardValue(input.submittedBy ?? DEFAULT_SUBMITTED_BY);
  const priority = normalize(input.priority) || DEFAULT_PRIORITY;
  const dataConfirmed = input.finalReviewConfirmed ? 'Confirmed by final human review.' : 'Draft data pending final human review.';
  const outputApproved = input.finalReviewConfirmed ? 'Approved for controlled PDF/email action.' : 'Pending final human review.';
  const approvedBy = input.finalReviewConfirmed ? submittedBy : 'Pending human approval';

  return `# AI-CAS CORRECTIVE ACTION REPORT
Corrective Action System | Capture. Confirm. Correct.
Applied Intelligence
Standardize to Optimize

Purpose:
Convert shop-floor issue capture into clear, professional corrective-action language for review, routing, and controlled documentation.

## 1. JOB / WORK ORDER INFORMATION
Work Order: ${standardValue(input.workOrderNumber)}
Part Number: ${standardValue(input.partNumber)}
${optionalReportLine('Customer / Job', input.customerOrJob)}${optionalReportLine('Quantity', firstFilled(input.quantityAffected, input.quantity))}Affected Department / Area: ${standardValue(getAffectedArea(input))}
Affected Operation / Equipment: ${standardValue(getAffectedOperationEquipment(input))}
Date Captured: ${dateCaptured}
Submitted By: ${submittedBy}
Priority: ${priority}

## 2. CONFIRMED ISSUE SUMMARY
Operator / Shop-Floor Issue Statement:
${operatorStatement}

AI-CAS Corrective Action Summary:
${summary}

## 3. EVIDENCE AND VERIFICATION
${evidenceRows.map((row) => `${row.slot}\nType / Label: ${row.typeLabel}\nStatus: ${row.status}\nNotes: ${row.notes}`).join('\n\n')}

## 4. REQUIRED CORRECTION / ACTION
${requiredAction}

Owner / Responsible Department: ${owner}
Production Impact: ${productionImpact}
${optionalReportLine('Containment / Immediate Check', firstFilled(getStructuredDraftText(input, 'containmentAction'), input.immediateContainment))}${optionalReportLine('Inspection / Verification', firstFilled(getStructuredDraftText(input, 'inspectionVerificationRequirement'), input.inspectionVerificationRequirement))}${optionalReportLine('Standard Work / Prevention Update', firstFilled(getStructuredDraftText(input, 'standardWorkRequirement'), input.preventionStandardWorkUpdate))}
## 5. REVIEW GATE
Data Confirmed: ${dataConfirmed}
Output Approved: ${outputApproved}
Approved By: ${approvedBy}
Date: ${dateCaptured}
Rule: Draft first. Confirm accuracy. Then send/export/print.`;
}

export function buildStandardCorrectiveActionEmailText(input: StandardCorrectiveActionReportInput) {
  return `Subject: ${buildStandardEmailSubject(input)}

Engineering Team,

Please review the AI-CAS corrective action draft below. The operator statement is preserved separately from the AI-CAS professional corrective-action language, and final human review remains required before send/export/print.

${buildStandardCorrectiveActionReportText(input)}

Thank you,
AI-CAS`;
}
