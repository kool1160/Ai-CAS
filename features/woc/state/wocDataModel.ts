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
  customerOrJob: string;
  quantity: string;
  correctionType: string;
  affectedArea: string;
  customAffectedArea: string;
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

export const otherAffectedAreaOption = 'Other / Manual Entry';
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
  'Other',
];

export const affectedAreaOptions = [
  'Welding',
  'Robotic / Cobot Welding',
  'Grinding / Finishing',
  'Quality Control / Inspection',
  'Machining',
  'Laser Cutting',
  'Forming',
  'Fixture / Setup',
  'Engineering / Routing',
  'Material / Inventory',
  'Paint / Powder Coat',
  'Assembly',
  'Shipping / Receiving',
  otherAffectedAreaOption,
];

export const defaultWocCorrectionData: WocCorrectionData = {
  workOrderNumber: '042631-001',
  partNumber: 'CYM-1750-LH-BU',
  revision: 'B',
  customerOrJob: 'ENWORK',
  quantity: '35 EA',
  correctionType: 'Incorrect Time / Rate',
  affectedArea: 'Welding',
  customAffectedArea: '',
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
  { key: 'revision', label: 'Revision', required: false },
  { key: 'customerOrJob', label: 'Customer / Job', required: false },
  { key: 'quantity', label: 'Quantity', required: false },
];

export function isFilled(value: string) {
  return Boolean(value.trim());
}

export function getEffectiveAffectedArea(data: WocCorrectionData) {
  if (data.affectedArea === otherAffectedAreaOption) {
    return data.customAffectedArea.trim();
  }

  return data.affectedArea.trim();
}

function optionalLine(label: string, value: string) {
  return isFilled(value) ? `${label}: ${value.trim()}\n` : '';
}

export function getPhotoEvidenceStatusLine() {
  return buildPhotoEvidenceStatusLine(loadPhotoEvidenceMetadataFromSession());
}

export function buildEmailSubject(data: WocCorrectionData) {
  return `[${data.correctionType.trim()}] Work Order Correction Needed — WO ${data.workOrderNumber.trim()} / Part ${data.partNumber.trim()}`;
}

export function buildEngineeringReport(data: WocCorrectionData, submittedBy = 'Shop-floor correction request submitted through REFAB Connect / AI-WOC.') {
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `ENGINEERING CORRECTION REPORT

1. Title / Correction Category
${data.correctionType.trim()} — Work Order Correction Request

2. Work Order Number
${data.workOrderNumber.trim()}

3. Part Number
${data.partNumber.trim()}

${optionalLine('4. Revision', data.revision)}${optionalLine('5. Customer / Job', data.customerOrJob)}${optionalLine('6. Quantity', data.quantity)}7. Correction Type
${data.correctionType.trim()}

8. Affected Area
${affectedArea}

9. Issue Summary
${data.issueDetails.trim()}

10. Requested Engineering Action
${data.requestedEngineeringAction.trim()}

11. Photo Evidence
${photoEvidenceStatus}

12. Submitted By / Source
${submittedBy}

13. Status
Draft / Pending Engineering Review`;
}

export function buildEmailDraft(data: WocCorrectionData, submittedBy = 'REFAB Connect / AI-WOC') {
  const subject = buildEmailSubject(data);
  const affectedArea = getEffectiveAffectedArea(data);
  const photoEvidenceStatus = getPhotoEvidenceStatusLine();

  return `Subject: ${subject}

Engineering Team,

Please review the work order correction request below.

Work Order Number:
${data.workOrderNumber.trim()}

Part Number:
${data.partNumber.trim()}

Correction Type:
${data.correctionType.trim()}

Affected Area:
${affectedArea}

Issue Summary:
${data.issueDetails.trim()}

Requested Engineering Action:
${data.requestedEngineeringAction.trim()}

Photo Evidence:
${photoEvidenceStatus}

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
  const issueDetailsReady = isFilled(data.issueDetails) && confirmations.issueDetailsEntered;
  const requestedActionReady = isFilled(data.requestedEngineeringAction) && confirmations.requestedActionEntered;
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

  if (key === 'issueDetails') {
    next.issueDetailsEntered = isFilled(value);
  }

  if (key === 'requestedEngineeringAction') {
    next.requestedActionEntered = isFilled(value);
  }

  return next;
}
