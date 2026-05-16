import {
  buildAiCorrectiveActionDraftFoundation,
  type AiCorrectiveActionDraftFoundation,
} from '../logic/aiCorrectiveActionDraftFoundation';
import { buildAiCorrectiveActionDraftInputFromWocData } from '../logic/aiCorrectiveActionDraftInputWiring';
import {
  buildPhotoEvidenceStatusLine,
  loadPhotoEvidenceMetadataFromSession,
  type EvidenceAttachmentMetadata,
} from '../logic/evidenceAttachmentPreparation';
import { PHOTO_EVIDENCE_STORAGE_KEY } from '../logic/wocStorageKeys';

export type WocCorrectionData = {
  workOrderNumber: string;
  partNumber: string;
  revision: string;
  partDescription: string;
  customerOrJob: string;
  operationNumber: string;
  routerStepOperation: string;
  quantity: string;
  quantityAffected: string;
  dueDateShipDate: string;
  material: string;
  nextOperation: string;
  inspectionOperation: string;
  correctionType: string;
  affectedArea: string;
  customAffectedArea: string;
  shortIssueDescription: string;
  detailedIssueNotes: string;
  defectProblemType: string;
  productionImpact: string;
  foundAtDepartment: string;
  correctiveActionOwnerDepartment: string;
  suspectedFailurePoint: string;
  escapedThroughDepartments: string;
  immediateContainment: string;
  requiredCorrection: string;
  preventionStandardWorkUpdate: string;
  inspectionVerificationRequirement: string;
  releaseApprovalRequirement: string;
  routerWorkOrderPhotoPlaceholder: string;
  partDefectPhotoPlaceholder: string;
  aiExtractedDataConfirmation: string;
  humanReleaseConfirmation: string;
  issueDetails: string;
  requestedEngineeringAction: string;
};

export type WocConfirmationState = {
  workOrderDataConfirmed: boolean;
  partNumberConfirmed: boolean;
  correctionTypeSelected: boolean;
  issueDetailsEntered: boolean;
  requestedActionEntered: boolean;
  finalReviewConfirmed: boolean;
};

export type GeneratedCorrectionPackage = {
  subjectLine: string;
  reportPreview: string;
  emailPreview: string;
  generatedAt: string;
  aiDraftFoundation: AiCorrectiveActionDraftFoundation;
} | null;

export type ConfirmableFieldKey = 'workOrderNumber' | 'partNumber';

export type WocDataField = {
  key: keyof WocCorrectionData;
  label: string;
  required: boolean;
  confirmable?: boolean;
};

export const otherAffectedAreaOption = 'Other / Needs Review';
export const photoEvidenceStorageKey = PHOTO_EVIDENCE_STORAGE_KEY;

export type PhotoEvidenceMetadata = EvidenceAttachmentMetadata & {
  evidenceAttached: boolean;
  evidenceFileName: string;
  evidenceFileType: string;
  evidenceFileSize: number;
};

export const correctionTypeOptions = [
  'Incorrect Time / Rate',
  'Missing Grind / Finish Operation',
  'Missing Weld Operation',
  'Missing Fixture / Work Instruction',
  'Wrong / Missing Router Step',
  'Hole Size / No-Go Gauge Issue',
  'Cleaning / Staging Issue',
  'Other',
];

export const departmentOptions = [
  'Laser',
  'Forming',
  'Welding',
  'Machining',
  'Assembly',
  'PEM Cert',
  'Audit',
  'Shipping',
  'Powder Coat',
  otherAffectedAreaOption,
];

export const affectedAreaOptions = departmentOptions;

export const defaultWocCorrectionData: WocCorrectionData = {
  workOrderNumber: '042631-001',
  partNumber: 'CYM-1750-LH-BU',
  revision: 'B',
  partDescription: '',
  customerOrJob: 'ENWORK',
  operationNumber: '',
  routerStepOperation: '',
  quantity: '35 EA',
  quantityAffected: '35 EA',
  dueDateShipDate: '',
  material: '',
  nextOperation: '',
  inspectionOperation: '',
  correctionType: 'Other',
  affectedArea: 'Welding',
  customAffectedArea: '',
  shortIssueDescription: '',
  detailedIssueNotes: '',
  defectProblemType: 'Operator Exception',
  productionImpact: '',
  foundAtDepartment: 'Welding',
  correctiveActionOwnerDepartment: 'Other / Needs Review',
  suspectedFailurePoint: 'Other / Needs Review',
  escapedThroughDepartments: 'Other / Needs Review',
  immediateContainment: '',
  requiredCorrection: '',
  preventionStandardWorkUpdate: '',
  inspectionVerificationRequirement: '',
  releaseApprovalRequirement: 'Human confirmation required before PDF/release.',
  routerWorkOrderPhotoPlaceholder: 'Router / work order photo evidence placeholder.',
  partDefectPhotoPlaceholder: 'Part / defect photo evidence placeholder.',
  aiExtractedDataConfirmation: 'AI extracted data must be reviewed and confirmed by the user.',
  humanReleaseConfirmation: 'Human confirmation required before release/PDF.',
  issueDetails: '',
  requestedEngineeringAction: '',
};

export const defaultWocConfirmations: WocConfirmationState = {
  workOrderDataConfirmed: false,
  partNumberConfirmed: false,
  correctionTypeSelected: true,
  issueDetailsEntered: false,
  requestedActionEntered: true,
  finalReviewConfirmed: false,
};

export const confirmDataFields: WocDataField[] = [
  { key: 'workOrderNumber', label: 'Work Order', required: true, confirmable: true },
  { key: 'partNumber', label: 'Part Number', required: true, confirmable: true },
  { key: 'partDescription', label: 'Part Description', required: false },
  { key: 'customerOrJob', label: 'Customer / Job Name', required: false },
  { key: 'operationNumber', label: 'Operation Number', required: false },
  { key: 'routerStepOperation', label: 'Router Step / Operation', required: false },
  { key: 'quantityAffected', label: 'Quantity Affected', required: false },
  { key: 'dueDateShipDate', label: 'Due Date / Ship Date', required: false },
];

export function isFilled(value: string) {
  return Boolean(value.trim());
}

export function getEffectiveAffectedArea(data: WocCorrectionData) {
  if (data.foundAtDepartment === otherAffectedAreaOption && data.customAffectedArea.trim()) {
    return data.customAffectedArea.trim();
  }

  return data.foundAtDepartment.trim() || data.affectedArea.trim();
}

function manualBlank(label: string, value: string) {
  return isFilled(value) ? value.trim() : `[Manual entry needed: ${label}]`;
}

function optionalLine(label: string, value: string) {
  return `${label}: ${manualBlank(label, value)}\n`;
}

function v4IssueSummary(data: WocCorrectionData) {
  return data.shortIssueDescription.trim() || data.issueDetails.trim();
}

function v4IssueDetails(data: WocCorrectionData) {
  return data.detailedIssueNotes.trim() || data.issueDetails.trim() || data.shortIssueDescription.trim();
}

function v4RequiredCorrection(data: WocCorrectionData) {
  return data.requiredCorrection.trim() || data.requestedEngineeringAction.trim() || 'AI-CAS should draft the required corrective action from confirmed router context and the operator exception note.';
}

export function getPhotoEvidenceStatusLine() {
  return buildPhotoEvidenceStatusLine(loadPhotoEvidenceMetadataFromSession());
}

export function buildEmailSubject(data: WocCorrectionData) {
  return `[${manualBlank('Correction Type', data.correctionType)}] Corrective Action Draft — WO ${manualBlank('Work Order', data.workOrderNumber)} / Part ${manualBlank('Part Number', data.partNumber)}`;
}

export function buildEngineeringReport(
  data: WocCorrectionData,
  submittedBy = 'Shop-floor correction request submitted through AI-CAS — Corrective Action System.\nPowered by Applied Intelligence Framework.',
) {
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `CORRECTIVE ACTION DRAFT
Status: Draft / Editable / Unconfirmed
Release Gate: Human confirmation required before release/PDF.

1. Confirmed Router / Job Context
Work Order: ${manualBlank('Work Order', data.workOrderNumber)}
Part Number: ${manualBlank('Part Number', data.partNumber)}
${optionalLine('Part Description', data.partDescription)}${optionalLine('Customer / Job Name', data.customerOrJob)}${optionalLine('Operation Number', data.operationNumber)}${optionalLine('Router Step / Operation', data.routerStepOperation)}${optionalLine('Quantity Affected', data.quantityAffected || data.quantity)}${optionalLine('Due Date / Ship Date', data.dueDateShipDate)}${optionalLine('Material', data.material)}${optionalLine('Next Operation', data.nextOperation)}${optionalLine('Inspection Operation', data.inspectionOperation)}
2. Operator Exception Note
What is wrong: ${manualBlank('What is wrong', v4IssueSummary(data))}
Detailed Issue Notes: ${manualBlank('Detailed Issue Notes', v4IssueDetails(data))}
Defect / Problem Type: ${manualBlank('Defect / Problem Type', data.defectProblemType)}
Production Impact: ${manualBlank('Production Impact', data.productionImpact)}

3. Department / Flow Control
Found At Department: ${manualBlank('Found At Department', affectedArea)}
Corrective Action Owner Department: ${manualBlank('Corrective Action Owner Department', data.correctiveActionOwnerDepartment)}
Suspected Failure Point: ${manualBlank('Suspected Failure Point', data.suspectedFailurePoint)}
Escaped Through Departments: ${manualBlank('Escaped Through Departments', data.escapedThroughDepartments)}

4. Corrective Action Draft
Problem Summary:
${manualBlank('Problem Summary', v4IssueSummary(data))}

Immediate Containment:
${manualBlank('Immediate Containment', data.immediateContainment)}

Required Correction:
${manualBlank('Required Correction', v4RequiredCorrection(data))}

Prevention / Standard Work Update:
${manualBlank('Prevention / Standard Work Update', data.preventionStandardWorkUpdate)}

Inspection / Verification Requirement:
${manualBlank('Inspection / Verification Requirement', data.inspectionVerificationRequirement)}

Release Approval Requirement:
${manualBlank('Release Approval Requirement', data.releaseApprovalRequirement)}

5. Evidence / Confirmation
Router / Work Order Photo: ${manualBlank('Router / Work Order Photo Placeholder', data.routerWorkOrderPhotoPlaceholder)}
Part / Defect Photo: ${manualBlank('Part / Defect Photo Placeholder', data.partDefectPhotoPlaceholder)}
Photo Evidence Status: ${photoEvidenceStatus}
AI Extracted Data Confirmation: ${manualBlank('AI Extracted Data Confirmation', data.aiExtractedDataConfirmation)}
Human Release Confirmation: ${manualBlank('Human Release Confirmation', data.humanReleaseConfirmation)}

6. Submitted By / Source
${submittedBy}

7. Gate Status
Draft is editable and unconfirmed. Human confirmation is required before release/PDF.`;
}

export function buildEmailDraft(data: WocCorrectionData, submittedBy = 'AI-CAS — Corrective Action System') {
  const subject = buildEmailSubject(data);
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `Subject: ${subject}

Engineering Team,

Please review the corrective action draft below. This draft is editable and remains unconfirmed until human release confirmation is completed.

Work Order:
${manualBlank('Work Order', data.workOrderNumber)}

Part Number:
${manualBlank('Part Number', data.partNumber)}

Customer / Job:
${manualBlank('Customer / Job Name', data.customerOrJob)}

Quantity Affected:
${manualBlank('Quantity Affected', data.quantityAffected || data.quantity)}

Router / Operation Context:
${manualBlank('Router Step / Operation', data.routerStepOperation)}

Material:
${manualBlank('Material', data.material)}

Next Operation:
${manualBlank('Next Operation', data.nextOperation)}

Inspection Operation:
${manualBlank('Inspection Operation', data.inspectionOperation)}

Operator Exception Note:
${manualBlank('What is wrong', v4IssueSummary(data))}

Found At Department:
${manualBlank('Found At Department', affectedArea)}

Corrective Action Owner Department:
${manualBlank('Corrective Action Owner Department', data.correctiveActionOwnerDepartment)}

Suspected Failure Point:
${manualBlank('Suspected Failure Point', data.suspectedFailurePoint)}

Immediate Containment:
${manualBlank('Immediate Containment', data.immediateContainment)}

Required Correction:
${manualBlank('Required Correction', v4RequiredCorrection(data))}

Prevention / Standard Work Update:
${manualBlank('Prevention / Standard Work Update', data.preventionStandardWorkUpdate)}

Inspection / Verification Requirement:
${manualBlank('Inspection / Verification Requirement', data.inspectionVerificationRequirement)}

Release Approval Requirement:
${manualBlank('Release Approval Requirement', data.releaseApprovalRequirement)}

Photo Evidence:
${photoEvidenceStatus}

Release Note:
Human confirmation is required before final release/PDF.

Submitted By:
${submittedBy}

Thank you,
AI-CAS`;
}

export function createGeneratedPackage(data: WocCorrectionData, submittedBy?: string): GeneratedCorrectionPackage {
  const aiDraftInput = buildAiCorrectiveActionDraftInputFromWocData(data);
  const aiDraftFoundation = buildAiCorrectiveActionDraftFoundation(aiDraftInput);

  return {
    subjectLine: buildEmailSubject(data),
    reportPreview: buildEngineeringReport(data, submittedBy),
    emailPreview: buildEmailDraft(data, submittedBy),
    generatedAt: new Date().toLocaleString(),
    aiDraftFoundation,
  };
}

export function getGateStatus(
  data: WocCorrectionData,
  confirmations: WocConfirmationState,
  generatedPackage: GeneratedCorrectionPackage,
) {
  const workOrderReady = isFilled(data.workOrderNumber) && confirmations.workOrderDataConfirmed;
  const partNumberReady = isFilled(data.partNumber) && confirmations.partNumberConfirmed;
  const confirmReady = workOrderReady && partNumberReady;

  const correctionTypeReady = isFilled(data.correctionType) && confirmations.correctionTypeSelected;
  const affectedAreaReady = isFilled(getEffectiveAffectedArea(data));
  const issueDetailsReady = isFilled(v4IssueSummary(data)) || isFilled(data.detailedIssueNotes);
  const generateReady = confirmReady && issueDetailsReady;

  const reviewReady = Boolean(generatedPackage) && confirmations.finalReviewConfirmed;
  const sendReady = generateReady && reviewReady;

  return {
    workOrderReady,
    partNumberReady,
    confirmReady,
    correctionTypeReady,
    affectedAreaReady,
    issueDetailsReady,
    requestedActionReady: true,
    generateReady,
    reviewReady,
    sendReady,
  };
}

export function resetDependentConfirmations(
  confirmations: WocConfirmationState,
  key: keyof WocCorrectionData,
  value: string,
): WocConfirmationState {
  const next = { ...confirmations, finalReviewConfirmed: false };

  if (key === 'workOrderNumber') {
    next.workOrderDataConfirmed = false;
  }

  if (key === 'partNumber') {
    next.partNumberConfirmed = false;
  }

  if (key === 'correctionType') {
    next.correctionTypeSelected = isFilled(value);
  }

  if (key === 'issueDetails' || key === 'shortIssueDescription' || key === 'detailedIssueNotes') {
    next.issueDetailsEntered = isFilled(value);
  }

  if (key === 'requestedEngineeringAction' || key === 'requiredCorrection') {
    next.requestedActionEntered = true;
  }

  return next;
}
