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
  affectedOperationEquipment?: string;
  quantityAffected?: string;
  correctionType?: string;
  affectedArea?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  correctiveActionOwnerDepartment?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  evidenceLabel?: EvidenceLabel | string;
  photoEvidenceAttached?: boolean;
  photoEvidenceFileName?: string;
};

export type AiCorrectiveActionDraftSectionKey =
  | 'issueSummary'
  | 'correctiveActionRequired'
  | 'standardWorkRequirement'
  | 'responsibilityByOperation'
  | 'containmentAction'
  | 'inspectionVerificationRequirement'
  | 'photoEvidenceReference'
  | 'closeoutRequirement';

export type AiCorrectiveActionDraftSection = {
  key: AiCorrectiveActionDraftSectionKey;
  title: string;
  draftText: string;
  sourceContext: string;
  requiresHumanReview: true;
};

export type StructuredCorrectiveActionDraft = {
  status: 'draft-only-unconfirmed';
  draftSource: 'openai-corrective-action-draft';
  releaseGate: string;
  sections: Record<AiCorrectiveActionDraftSectionKey, AiCorrectiveActionDraftSection>;
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
  version: 'V4-M13A-structured-foundation';
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

export const structuredCorrectiveActionSectionKeys: AiCorrectiveActionDraftSectionKey[] = [
  'issueSummary',
  'correctiveActionRequired',
  'standardWorkRequirement',
  'responsibilityByOperation',
  'containmentAction',
  'inspectionVerificationRequirement',
  'photoEvidenceReference',
  'closeoutRequirement',
];

export const aiCorrectiveActionDraftSections: Array<keyof AiCorrectiveActionDraftOutput> = [
  'status',
  ...structuredCorrectiveActionSectionKeys,
];

export const aiCorrectiveActionDraftSectionTitles: Record<AiCorrectiveActionDraftSectionKey, string> = {
  issueSummary: 'Issue Summary',
  correctiveActionRequired: 'Corrective Action Required',
  standardWorkRequirement: 'Standard Work Requirement',
  responsibilityByOperation: 'Responsibility by Operation',
  containmentAction: 'Containment Action',
  inspectionVerificationRequirement: 'Inspection / Verification Requirement',
  photoEvidenceReference: 'Photo Evidence Reference',
  closeoutRequirement: 'Closeout Requirement',
};

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
Affected Operation / Equipment: ${manualBlank('Affected Operation / Equipment', input.affectedOperationEquipment)}
Quantity Affected: ${manualBlank('Quantity Affected', input.quantityAffected)}
Correction Type: ${manualBlank('Correction Type', input.correctionType)}
Affected Area: ${manualBlank('Affected Area', input.affectedArea)}
Found At Department: ${manualBlank('Found At Department', input.foundAtDepartment)}
Suspected Failure Point: ${manualBlank('Suspected Failure Point', input.suspectedFailurePoint)}
Corrective Action Owner Department: ${manualBlank('Corrective Action Owner Department', input.correctiveActionOwnerDepartment)}
Short Issue Description: ${manualBlank('Short Issue Description', input.shortIssueDescription)}
Detailed Issue Notes: ${manualBlank('Detailed Issue Notes', input.detailedIssueNotes)}
Evidence Label: ${manualBlank('Evidence Label', input.evidenceLabel)}
Photo Evidence: ${photoEvidenceStatus}

Return only valid JSON in this exact structure:
{
  "status": "draft-only-unconfirmed",
  "draftSource": "openai-corrective-action-draft",
  "releaseGate": "AI draft output is editable and unconfirmed. Human review remains required before release/PDF.",
  "sections": {
    "issueSummary": { "key": "issueSummary", "title": "Issue Summary", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "correctiveActionRequired": { "key": "correctiveActionRequired", "title": "Corrective Action Required", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "standardWorkRequirement": { "key": "standardWorkRequirement", "title": "Standard Work Requirement", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "responsibilityByOperation": { "key": "responsibilityByOperation", "title": "Responsibility by Operation", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "containmentAction": { "key": "containmentAction", "title": "Containment Action", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "inspectionVerificationRequirement": { "key": "inspectionVerificationRequirement", "title": "Inspection / Verification Requirement", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "photoEvidenceReference": { "key": "photoEvidenceReference", "title": "Photo Evidence Reference", "draftText": "", "sourceContext": "", "requiresHumanReview": true },
    "closeoutRequirement": { "key": "closeoutRequirement", "title": "Closeout Requirement", "draftText": "", "sourceContext": "", "requiresHumanReview": true }
  }
}

Structured section guidance:
- draftText contains the professional corrective-action language for that section.
- sourceContext briefly names the provided fact source used for the section, such as issue notes, router operation, evidence label, department, or photo evidence.
- requiresHumanReview must always be true.

Tone and style:
- Treat the rough operator issue description as the primary problem statement.
- Use the user-selected affected area/department and affected operation/equipment as report context. Treat uploaded router operation as supporting context only; do not assume the first router operation is the affected process.
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
    version: 'V4-M13A-structured-foundation',
    purpose:
      'Prepare confirmed router/work-order data, plain shop-floor issue notes, and evidence label context for future AI-generated engineered corrective-action draft language.',
    releaseGate:
      'Foundation only. No automatic generation, release, PDF export, email sending, or approval bypass is enabled by this helper.',
    input,
    requiredOutputSections: aiCorrectiveActionDraftSections,
    prompt: buildAiCorrectiveActionDraftPrompt(input),
  };
}
