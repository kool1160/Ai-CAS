import type { AiCorrectiveActionDraftSectionKey, StructuredCorrectiveActionDraft } from './aiCorrectiveActionDraftFoundation';
import {
  buildMildTimeRateContainmentText,
  buildMildTimeRateCorrectiveActionText,
  buildTimeRateMismatchSummaryText,
  getGeneratedSectionText,
  isIncorrectTimeRateIssue,
} from './containmentLanguageGuard';
import { removeUploadedRouterContextFromFinalText } from './finalOutputSanitizer';
import {
  alignActionSubjectWithResolvedOwner,
  isUnresolvedCorrectiveActionOwner,
  resolveCorrectiveActionOwnerDepartment,
} from './correctiveActionOwnerResolver';

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
  partDescription?: string;
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

const VISUAL_ISSUE_KEYWORDS = [
  'scratch',
  'dent',
  'wrong part condition',
  'missing feature',
  'bad weld',
  'surface defect',
  'wrong material condition',
  'damage',
  'fit-up issue',
];

const DEFAULT_SUBMITTED_BY = 'AI-CAS — Corrective Action System';
const DEFAULT_DATE_CAPTURED = 'Pending final review date';
const DEFAULT_PRIORITY = 'Standard review';

function normalize(value?: string) {
  return value?.trim() ?? '';
}

function firstFilled(...values: Array<string | undefined>) {
  return values.map(normalize).find(Boolean) ?? '';
}

function isOtherOrBlank(value?: string) {
  return isUnresolvedCorrectiveActionOwner(value);
}

function standardValue(value?: string) {
  return normalize(value) || 'Not confirmed';
}

function optionalReportLine(label: string, value?: string) {
  const normalized = normalize(value);
  return normalized ? `${label}: ${normalized}\n` : '';
}

function getRequiredStandard(input: StandardCorrectiveActionReportInput) {
  return firstFilled(
    getStructuredDraftText(input, 'standardWorkRequirement'),
    input.preventionStandardWorkUpdate,
    'Update router/work instruction clarity and verify operator understanding before release.',
  );
}

export function getOperatorStatement(input: Pick<StandardCorrectiveActionReportInput, 'shortIssueDescription'>) {
  // V8-M2C boundary: only the user-entered Simple Mode issue text can become the operator statement.
  return firstFilled(input.shortIssueDescription, 'Operator issue statement not entered.');
}

export function getOriginalOperatorNote(input: Pick<StandardCorrectiveActionReportInput, 'shortIssueDescription'>) {
  return normalize(input.shortIssueDescription);
}

function getOwnerDepartment(input: StandardCorrectiveActionReportInput) {
  return resolveCorrectiveActionOwnerDepartment(input);
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
  if (normalize(input.productionImpact)) return normalize(input.productionImpact);
  if (isIncorrectTimeRateIssue(input)) {
    return 'flow risk, schedule risk, and repeat issue risk until the standard and actual run rate are reconciled';
  }
  return 'quality risk, flow risk, and repeat issue risk until the correction is reviewed and confirmed';
}

function sanitizeFinalOutputText(input: StandardCorrectiveActionReportInput, text: string) {
  return removeUploadedRouterContextFromFinalText(text, {
    operationNumber: input.operationNumber,
    routerStepOperation: input.routerStepOperation,
    affectedOperationEquipment: getAffectedOperationEquipment(input),
  });
}


function toSentenceCase(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function normalizeOperatorWording(text: string) {
  return text
    .replace(/\bpph\b/gi, 'PPH')
    .replace(/\bpcs\/?hr\b/gi, 'PPH')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildProfessionalIssueStatement(input: StandardCorrectiveActionReportInput) {
  const operatorStatement = normalizeOperatorWording(getOperatorStatement(input));
  if (!operatorStatement || operatorStatement === 'Operator issue statement not entered.') {
    return 'The current issue requires confirmation from the operator statement before final review.';
  }

  const lowered = operatorStatement.toLowerCase();
  const hasRateLanguage = /runtime|run rate|cycle\s*-?time|rate|pph|per hour/.test(lowered);
  const targetRate = operatorStatement.match(/(\d+(?:\.\d+)?)\s*PPH/i);
  const rateValues = [...operatorStatement.matchAll(/\b(\d+(?:\.\d+)?)\s*PPH\b/gi)].map((m) => m[1]);

  if (hasRateLanguage && rateValues.length >= 2) {
    const requested = rateValues[0];
    const current = rateValues[1];
    return `The current runtime expectation appears to be too high. The operator is requesting review of the standard from ${current} PPH to ${requested} PPH based on observed production conditions.`;
  }

  if (hasRateLanguage && targetRate) {
    return `A runtime/rate mismatch has been reported. The operator is requesting verification of the production standard against observed output conditions${targetRate ? `, including review of the ${targetRate[1]} PPH reference` : ''}.`;
  }

  return `The operator reported a production issue that requires review and confirmation: ${toSentenceCase(operatorStatement)}.`;
}

function getStructuredDraftText(input: StandardCorrectiveActionReportInput, section: AiCorrectiveActionDraftSectionKey) {
  const draftText = getGeneratedSectionText(input, section, input.structuredDraft);
  return draftText ? sanitizeFinalOutputText(input, draftText) : '';
}

function hasEvidenceAttachment(input: StandardCorrectiveActionReportInput) {
  return Boolean((input.evidenceItems ?? []).some((item) => normalize(item.fileName) || normalize(item.caption)))
    || /attached/i.test(normalize(input.photoEvidenceStatus));
}

function shouldIncludePhotoEvidenceSection(input: StandardCorrectiveActionReportInput) {
  const issueContext = [
    normalize(input.correctionType),
    normalize(input.shortIssueDescription),
    normalize(input.detailedIssueNotes),
    normalize(input.issueDetails),
  ].join(' ').toLowerCase();

  const isVisualIssue = VISUAL_ISSUE_KEYWORDS.some((keyword) => issueContext.includes(keyword));
  const includesRoutingDataIssue = /router|routing|work order|documentation|data/i.test(issueContext);

  if (isVisualIssue) return hasEvidenceAttachment(input);
  if (includesRoutingDataIssue) return hasEvidenceAttachment(input);
  return false;
}

export function buildAiCasProfessionalSummary(input: StandardCorrectiveActionReportInput) {
  if (isIncorrectTimeRateIssue(input)) {
    return sanitizeFinalOutputText(input, buildTimeRateMismatchSummaryText(input));
  }

  const structuredSummary = getStructuredDraftText(input, 'issueSummary');
  if (structuredSummary && structuredSummary.toLowerCase() !== getOperatorStatement(input).toLowerCase()) {
    return sanitizeFinalOutputText(input, structuredSummary);
  }

  const professionalizedFromOperator = buildProfessionalIssueStatement(input);
  if (professionalizedFromOperator) return sanitizeFinalOutputText(input, professionalizedFromOperator);

  const affectedArea = getAffectedProcess(input);
  const workOrder = normalize(input.workOrderNumber);
  const partNumber = normalize(input.partNumber);
  const jobContext = [workOrder ? `WO ${workOrder}` : '', partNumber ? `Part ${partNumber}` : '']
    .filter(Boolean)
    .join(' / ');

  return sanitizeFinalOutputText(input, `Operator reported a shop-floor issue in ${affectedArea}${jobContext ? ` for ${jobContext}` : ''}. AI-CAS converted the operator statement into a draft corrective-action summary for Engineering, Quality, and Production review before release.`);
}

export function buildAiCasRequiredAction(input: StandardCorrectiveActionReportInput) {
  const owner = getOwnerDepartment(input);
  const structuredAction = firstFilled(
    getStructuredDraftText(input, 'correctiveActionRequired'),
    getStructuredDraftText(input, 'responsibilityByOperation'),
  );
  if (structuredAction) return sanitizeFinalOutputText(input, alignActionSubjectWithResolvedOwner(structuredAction, owner));

  const requestedAction = firstFilled(input.requiredCorrection, input.requestedEngineeringAction);
  if (requestedAction) return sanitizeFinalOutputText(input, alignActionSubjectWithResolvedOwner(requestedAction, owner));

  const affectedArea = getAffectedProcess(input);
  const impact = getProductionImpact(input);

  if (isIncorrectTimeRateIssue(input)) {
    return sanitizeFinalOutputText(input, `${buildMildTimeRateCorrectiveActionText(input)} Production impact to monitor: ${impact}.`);
  }

  return sanitizeFinalOutputText(input, `${owner} must review the confirmed issue, determine the required correction for the ${affectedArea} operation, update or clarify the router/work instructions as needed, and verify the correction before the correction is closed. Production impact to monitor: ${impact}.`);
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
  const operatorStatement = getOriginalOperatorNote(input);
  const summary = buildAiCasProfessionalSummary(input);
  const requiredAction = buildAiCasRequiredAction(input);
  const owner = getOwnerDepartment(input);
  const productionImpact = getProductionImpact(input);
  const evidenceRows = buildStandardEvidenceRows(input);
  const includeEvidenceSection = shouldIncludePhotoEvidenceSection(input);
  const closeoutSectionNumber = includeEvidenceSection ? 8 : 7;
  const releaseApprovalSectionNumber = includeEvidenceSection ? 9 : 8;
  const dateCaptured = standardValue(input.dateCaptured ?? DEFAULT_DATE_CAPTURED);
  const submittedBy = standardValue(input.submittedBy ?? DEFAULT_SUBMITTED_BY);
  const priority = normalize(input.priority) || DEFAULT_PRIORITY;
  const dataConfirmed = input.finalReviewConfirmed ? 'Confirmed by final human review.' : 'Draft data pending final human review.';
  const outputApproved = input.finalReviewConfirmed ? 'Approved for controlled PDF/email action.' : 'Pending final human review.';
  const approvedBy = input.finalReviewConfirmed ? submittedBy : 'Pending human approval';
  const containmentCheck = firstFilled(
    getStructuredDraftText(input, 'containmentAction'),
    input.immediateContainment,
    isIncorrectTimeRateIssue(input) ? buildMildTimeRateContainmentText(input) : '',
  );
  const unresolvedOwner = isUnresolvedCorrectiveActionOwner(input.correctiveActionOwnerDepartment);
  const roleOwner = isIncorrectTimeRateIssue(input) && unresolvedOwner ? 'Engineering' : owner;
  const roleOperation = isIncorrectTimeRateIssue(input) && unresolvedOwner
    ? 'Welding'
    : standardValue(getAffectedOperationEquipment(input));
  const partDescriptionLine = optionalReportLine('Part Description', input.partDescription);

  const reportText = `AI-CAS | Corrective Action Sheet
Corrective Action System | Capture. Confirm. Correct.

Header: ${standardValue(input.partNumber)} | WO ${standardValue(input.workOrderNumber)} | ${standardValue(input.correctionType)}

## 1. METADATA BLOCK
Work Order: ${standardValue(input.workOrderNumber)}
Part Number: ${standardValue(input.partNumber)}
Customer: ${standardValue(input.customerOrJob)}
Quantity: ${standardValue(firstFilled(input.quantityAffected, input.quantity))}
${partDescriptionLine}Affected Operation / Process: ${standardValue(getAffectedOperationEquipment(input))}
Previous Operation: ${standardValue(input.operationNumber)}
Inspection / Quality Operation: ${standardValue(input.inspectionVerificationRequirement)}
Reported By: ${submittedBy}
Date: ${dateCaptured}
Priority: ${priority}

## 2. ISSUE SUMMARY
Professional Issue Summary:
${summary}

${operatorStatement ? `Original Operator Note (source reference):\n${operatorStatement}\n\n` : ''}
## 3. CORRECTIVE ACTION REQUIREMENTS
Requirement: ${requiredAction}
Required Standard: ${getRequiredStandard(input)}
Acceptance / Verification: ${firstFilled(getStructuredDraftText(input, 'inspectionVerificationRequirement'), input.inspectionVerificationRequirement, 'Owner and Quality verify correction outcome before release.')}

## 4. CONTAINMENT ACTION
${firstFilled(containmentCheck, 'Place affected work on hold, review impacted quantity, verify operation status, and notify responsible owner before release.')}

## 5. RESPONSIBILITY MATRIX
Role / Operation: ${roleOwner} | ${roleOperation}
Responsibility: Review issue, apply correction, verify outcome, and document closeout.

## 6. PASS / FAIL CONDITION
PASS: Correction is implemented, verification is complete, and required approvals are recorded.
FAIL: Any required correction, verification, or approval remains incomplete.

${includeEvidenceSection ? `## 7. OPTIONAL PHOTO EVIDENCE
${evidenceRows.map((row) => `${row.slot}\nType / Label: ${row.typeLabel}\nStatus: ${row.status}\nCaption / Notes: ${row.notes}`).join('\n\n')}

` : ''}## ${closeoutSectionNumber}. CORRECTIVE ACTION CLOSEOUT
- Confirm root issue is addressed at source.
- Confirm affected quantity disposition is complete.
- Confirm standard work/router updates are complete when required.
- Confirm recurrence prevention owner and follow-up date are assigned.

## ${releaseApprovalSectionNumber}. RELEASE APPROVAL
Welding / Production: ____________________
Supervisor: ____________________
Quality: ____________________
Engineering / Purchasing (if applicable): ____________________

Review Gate:
Data Confirmed: ${dataConfirmed}
Output Approved: ${outputApproved}
Approved By: ${approvedBy}
Date: ${dateCaptured}
Rule: Draft first. Confirm accuracy. Then send/export/print.
Production Impact: ${productionImpact}`;

  return sanitizeFinalOutputText(input, reportText);
}

export function buildStandardCorrectiveActionEmailText(input: StandardCorrectiveActionReportInput) {
  const emailText = `Subject: ${buildStandardEmailSubject(input)}

Engineering Team,

Please review the AI-CAS corrective action draft below. The operator statement is preserved separately from the AI-CAS professional corrective-action language, and final human review remains required before send/export/print.

${buildStandardCorrectiveActionReportText(input)}

Thank you,
AI-CAS`;

  return sanitizeFinalOutputText(input, emailText);
}
