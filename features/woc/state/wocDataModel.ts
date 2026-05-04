export type WocCorrectionData = {
  workOrderNumber: string;
  partNumber: string;
  revision: string;
  customerOrJob: string;
  quantity: string;
  correctionType: string;
  affectedProcess: string;
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

export const correctionTypeOptions = [
  'Incorrect Time / Rate',
  'Missing Grind / Finish Operation',
  'Missing Weld Operation',
  'Missing Fixture / Work Instruction',
  'Wrong / Missing Router Step',
  'Other',
];

export const affectedProcessOptions = [
  'Welding',
  'Cobot Welding',
  'Grinding / Finish',
  'Laser / Forming',
  'Inspection / Quality',
  'Fixture / Setup',
  'Other',
];

export const defaultWocCorrectionData: WocCorrectionData = {
  workOrderNumber: '042631-001',
  partNumber: 'CYM-1750-LH-BU',
  revision: 'B',
  customerOrJob: 'ENWORK',
  quantity: '35 EA',
  correctionType: 'Incorrect Time / Rate',
  affectedProcess: 'Welding',
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

export function buildReportPreview(data: WocCorrectionData) {
  return `ENGINEERING REPORT PREVIEW

Work Order: ${data.workOrderNumber || '[WORK ORDER REQUIRED]'}
Part Number: ${data.partNumber || '[PART NUMBER REQUIRED]'}
Customer / Job: ${data.customerOrJob || '[OPTIONAL]'}
Revision: ${data.revision || '[OPTIONAL]'}
Quantity: ${data.quantity || '[OPTIONAL]'}
Correction Type: ${data.correctionType || '[CORRECTION TYPE REQUIRED]'}
Affected Process: ${data.affectedProcess || '[AFFECTED PROCESS REQUIRED]'}

Issue Details:
${data.issueDetails || '[ISSUE DETAILS REQUIRED]'}

Requested Engineering Action:
${data.requestedEngineeringAction || '[REQUESTED ACTION REQUIRED]'}`;
}

export function buildEmailPreview(data: WocCorrectionData) {
  return `To: Engineering
Subject: Work Order Correction Request | ${data.workOrderNumber || 'WO TBD'} | ${data.partNumber || 'PART TBD'}

Please review the correction request below.

Work Order: ${data.workOrderNumber || '[WORK ORDER REQUIRED]'}
Part Number: ${data.partNumber || '[PART NUMBER REQUIRED]'}
Correction Type: ${data.correctionType || '[CORRECTION TYPE REQUIRED]'}
Affected Process: ${data.affectedProcess || '[AFFECTED PROCESS REQUIRED]'}

Issue:
${data.issueDetails || '[ISSUE DETAILS REQUIRED]'}

Requested Action:
${data.requestedEngineeringAction || '[REQUESTED ACTION REQUIRED]'}`;
}

export function createGeneratedPackage(data: WocCorrectionData): GeneratedCorrectionPackage {
  return {
    reportPreview: buildReportPreview(data),
    emailPreview: buildEmailPreview(data),
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
  const issueDetailsReady = isFilled(data.issueDetails) && confirmations.issueDetailsEntered;
  const requestedActionReady = isFilled(data.requestedEngineeringAction) && confirmations.requestedActionEntered;
  const generateReady = confirmReady && correctionTypeReady && issueDetailsReady && requestedActionReady;

  const reviewReady = Boolean(generatedPackage) && confirmations.finalReviewConfirmed;
  const sendReady = generateReady && reviewReady;

  return {
    workOrderReady,
    partNumberReady,
    confirmReady,
    correctionTypeReady,
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
