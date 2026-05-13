import {
  buildPhotoEvidenceStatusLine,
  loadPhotoEvidenceMetadataFromSession,
  PHOTO_EVIDENCE_STORAGE_KEY,
  type EvidenceAttachmentMetadata,
} from '../logic/evidenceAttachmentPreparation';

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
  correctionType: 'Incorrect Time / Rate',
  affectedArea: 'Welding',
  customAffectedArea: '',
  shortIssueDescription: 'Router time does not match the sustainable shop-floor baseline.',
  detailedIssueNotes: 'Router time does not match the sustainable shop-floor baseline.',
  defectProblemType: 'Work Order / Router Correction',
  productionImpact: 'Potential delay, rework, or repeat issue if not corrected before the next run.',
  foundAtDepartment: 'Welding',
  correctiveActionOwnerDepartment: 'Welding',
  suspectedFailurePoint: 'Welding',
  escapedThroughDepartments: 'Other / Needs Review',
  immediateContainment: 'Hold affected parts and verify the current work order/router before continuing production.',
  requiredCorrection: 'Review and update the router time/rate to the correct Engineering-approved baseline.',
  preventionStandardWorkUpdate: 'Update the controlled router/work instruction so future runs use the corrected requirement.',
  inspectionVerificationRequirement: 'Verify corrected router data and affected parts before release.',
  releaseApprovalRequirement: 'Human release confirmation required before PDF/release.',
  routerWorkOrderPhotoPlaceholder: 'Router / work order photo evidence placeholder.',
  partDefectPhotoPlaceholder: 'Part / defect photo evidence placeholder.',
  aiExtractedDataConfirmation: 'AI extracted data must be reviewed and confirmed by the user.',
  humanReleaseConfirmation: 'Human confirmation required before release/PDF.',
  issueDetails: 'Router time does not match the sustainable shop-floor baseline.',
  requestedEngineeringAction: 'Review and update the router time/rate to the correct Engineering-approved baseline.',
};

export const defaultWocConfirmations: WocConfirmationState = {
  workOrderDataConfirmed: false,
  partNumberConfirmed: false,
  correctionTypeSelected: true,
  issueDetailsEntered: true,
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

function optionalLine(label: string, value: string) {
  return isFilled(value) ? `${label}: ${value.trim()}\n` : '';
}

function v4IssueSummary(data: WocCorrectionData) {
  return data.shortIssueDescription.trim() || data.issueDetails.trim();
}

function v4IssueDetails(data: WocCorrectionData) {
  return data.detailedIssueNotes.trim() || data.issueDetails.trim();
}

function v4RequiredCorrection(data: WocCorrectionData) {
  return data.requiredCorrection.trim() || data.requestedEngineeringAction.trim();
}

export function getPhotoEvidenceStatusLine() {
  return buildPhotoEvidenceStatusLine(loadPhotoEvidenceMetadataFromSession());
}

export function buildEmailSubject(data: WocCorrectionData) {
  return `[${data.correctionType.trim()}] Corrective Action Needed — WO ${data.workOrderNumber.trim()} / Part ${data.partNumber.trim()}`;
}

export function buildEngineeringReport(data: WocCorrectionData, submittedBy = 'Shop-floor correction request submitted through REFAB Connect / AI-WOC.') {
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `CORRECTIVE ACTION REPORT

1. Job / Router Data
Work Order: ${data.workOrderNumber.trim()}
Part Number: ${data.partNumber.trim()}
${optionalLine('Part Description', data.partDescription)}${optionalLine('Customer / Job Name', data.customerOrJob)}${optionalLine('Operation Number', data.operationNumber)}${optionalLine('Router Step / Operation', data.routerStepOperation)}${optionalLine('Quantity Affected', data.quantityAffected || data.quantity)}${optionalLine('Due Date / Ship Date', data.dueDateShipDate)}
2. Issue Description
Short Issue Description: ${v4IssueSummary(data)}
Detailed Issue Notes: ${v4IssueDetails(data)}
Defect / Problem Type: ${data.defectProblemType.trim()}
Production Impact: ${data.productionImpact.trim()}

3. Department / Flow Control
Found At Department: ${affectedArea}
Corrective Action Owner Department: ${data.correctiveActionOwnerDepartment.trim()}
Suspected Failure Point: ${data.suspectedFailurePoint.trim()}
Escaped Through Departments: ${data.escapedThroughDepartments.trim()}

4. Corrective Action Requirements
Immediate Containment: ${data.immediateContainment.trim()}
Required Correction: ${v4RequiredCorrection(data)}
Prevention / Standard Work Update: ${data.preventionStandardWorkUpdate.trim()}
Inspection / Verification Requirement: ${data.inspectionVerificationRequirement.trim()}
Release Approval Requirement: ${data.releaseApprovalRequirement.trim()}

5. Evidence / Confirmation
Router / Work Order Photo: ${data.routerWorkOrderPhotoPlaceholder.trim()}
Part / Defect Photo: ${data.partDefectPhotoPlaceholder.trim()}
Photo Evidence Status: ${photoEvidenceStatus}
AI Extracted Data Confirmation: ${data.aiExtractedDataConfirmation.trim()}
Human Release Confirmation: ${data.humanReleaseConfirmation.trim()}

6. Submitted By / Source
${submittedBy}

7. Status
Draft / Pending Human Confirmation Before Release`;
}

export function buildEmailDraft(data: WocCorrectionData, submittedBy = 'REFAB Connect / AI-WOC') {
  const subject = buildEmailSubject(data);
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `Subject: ${subject}

Engineering Team,

Please review the corrective action request below.

Work Order:
${data.workOrderNumber.trim()}

Part Number:
${data.partNumber.trim()}

Issue:
${v4IssueSummary(data)}

Found At Department:
${affectedArea}

Corrective Action Owner Department:
${data.correctiveActionOwnerDepartment.trim()}

Suspected Failure Point:
${data.suspectedFailurePoint.trim()}

Required Correction:
${v4RequiredCorrection(data)}

Inspection / Verification Requirement:
${data.inspectionVerificationRequirement.trim()}

Photo Evidence:
${photoEvidenceStatus}

Release Note:
Human confirmation is required before final release/PDF.

Submitted By:
${submittedBy}

Thank you,
REFAB Connect / AI-WOC`;
}

export function createGeneratedPackage(data: WocCorrectionData, submittedBy?: string): GeneratedCorrectionPackage {
  return {
    subjectLine: buildEmailSubject(data),
    reportPreview: buildEngineeringReport(data, submittedBy),
    emailPreview: buildEmailDraft(data, submittedBy),
    generatedAt: new Date().toLocaleString(),
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
  const issueDetailsReady = isFilled(v4IssueSummary(data)) && confirmations.issueDetailsEntered;
  const requestedActionReady = isFilled(v4RequiredCorrection(data)) && confirmations.requestedActionEntered;
  const generateReady = confirmReady && correctionTypeReady && affectedAreaReady && issueDetailsReady && requestedActionReady;

  const reviewReady = Boolean(generatedPackage) && confirmations.finalReviewConfirmed;
  const sendReady = generateReady && reviewReady;

  return {
    workOrderReady,
    partNumberReady,
    confirmReady,
    correctionTypeReady,
    affectedAreaReady,
    issueDetailsReady,
    requestedActionReady,
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
    next.requestedActionEntered = isFilled(value);
  }

  return next;
}
