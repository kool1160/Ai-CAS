export type EvidenceLabel =
  | 'Correct condition'
  | 'Incorrect condition'
  | 'Gauge / check evidence'
  | 'Staging evidence'
  | 'Other supporting evidence'
  | '';

export type AiCorrectiveActionDraftInput = {
  workOrderNumber?: string;
  partNumber?: string;
  partDescription?: string;
  customerOrJob?: string;
  operationNumber?: string;
  routerStepOperation?: string;
  quantityAffected?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  correctiveActionOwnerDepartment?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  evidenceLabel?: EvidenceLabel | string;
  photoEvidenceAttached?: boolean;
  photoEvidenceFileName?: string;
};

export type AiCorrectiveActionDraftOutput = {
  status: 'draft-only-unconfirmed';
  issueSummary: string;
  correctiveActionRequired: string;
  standardWorkRequirement: string;
  responsibilityByOperation: string;
  containmentAction: string;
  inspectionVerificationRequirement: string;
  photoEvidenceReference: string;
  closeoutRequirement: string;
};

export type AiCorrectiveActionDraftFoundation = {
  foundationName: string;
  version: 'V4-M8-foundation';
  purpose: string;
  releaseGate: string;
  input: AiCorrectiveActionDraftInput;
  requiredOutputSections: Array<keyof AiCorrectiveActionDraftOutput>;
  prompt: string;
};

const manualBlank = (label: string, value?: string) => {
  const normalized = value?.trim() ?? '';
  return normalized || `[Manual entry needed: ${label}]`;
};

export const aiCorrectiveActionDraftSections: Array<keyof AiCorrectiveActionDraftOutput> = [
  'status',
  'issueSummary',
  'correctiveActionRequired',
  'standardWorkRequirement',
  'responsibilityByOperation',
  'containmentAction',
  'inspectionVerificationRequirement',
  'photoEvidenceReference',
  'closeoutRequirement',
];

export function buildAiCorrectiveActionDraftPrompt(input: AiCorrectiveActionDraftInput) {
  const photoEvidenceStatus = input.photoEvidenceAttached
    ? `Photo evidence attached${input.photoEvidenceFileName ? `: ${input.photoEvidenceFileName}` : ''}.`
    : 'No photo evidence attached.';

  return `You are generating professional engineered corrective-action draft language for a manufacturing work-order/router issue.

Core rule:
Use only the provided confirmed/manual facts. Do not invent missing values. If information is missing, write a clear manual-review placeholder. Output must remain draft-only, editable, and unconfirmed until human approval.

Confirmed / Manual Input Facts:
Work Order: ${manualBlank('Work Order', input.workOrderNumber)}
Part Number: ${manualBlank('Part Number', input.partNumber)}
Part Description: ${manualBlank('Part Description', input.partDescription)}
Customer / Job Name: ${manualBlank('Customer / Job Name', input.customerOrJob)}
Operation Number: ${manualBlank('Operation Number', input.operationNumber)}
Router Step / Operation: ${manualBlank('Router Step / Operation', input.routerStepOperation)}
Quantity Affected: ${manualBlank('Quantity Affected', input.quantityAffected)}
Found At Department: ${manualBlank('Found At Department', input.foundAtDepartment)}
Suspected Failure Point: ${manualBlank('Suspected Failure Point', input.suspectedFailurePoint)}
Corrective Action Owner Department: ${manualBlank('Corrective Action Owner Department', input.correctiveActionOwnerDepartment)}
Short Issue Description: ${manualBlank('Short Issue Description', input.shortIssueDescription)}
Detailed Issue Notes: ${manualBlank('Detailed Issue Notes', input.detailedIssueNotes)}
Evidence Label: ${manualBlank('Evidence Label', input.evidenceLabel)}
Photo Evidence: ${photoEvidenceStatus}

Draft output sections required:
1. Issue Summary
2. Corrective Action Required
3. Standard Work Requirement
4. Responsibility by Operation
5. Containment Action
6. Inspection / Verification Requirement
7. Photo Evidence Reference
8. Closeout Requirement

Tone and style:
- Professional shop-floor corrective-action language
- Clear enough for Engineering, Quality, and Production
- No blame language
- No fake root cause
- No fake dates, names, approvals, or measurements
- Keep it practical, specific, and action-oriented
- Mark all output as draft/unconfirmed until human review.`;
}

export function buildAiCorrectiveActionDraftFoundation(
  input: AiCorrectiveActionDraftInput,
): AiCorrectiveActionDraftFoundation {
  return {
    foundationName: 'AI-CAS Corrective Action Drafting Foundation',
    version: 'V4-M8-foundation',
    purpose:
      'Prepare confirmed router/work-order data, plain shop-floor issue notes, and evidence label context for future AI-generated engineered corrective-action draft language.',
    releaseGate:
      'Foundation only. No automatic generation, release, PDF export, email sending, or approval bypass is enabled by this helper.',
    input,
    requiredOutputSections: aiCorrectiveActionDraftSections,
    prompt: buildAiCorrectiveActionDraftPrompt(input),
  };
}
