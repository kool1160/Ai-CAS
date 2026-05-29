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
import {
  buildStandardCorrectiveActionEmailText,
  buildStandardCorrectiveActionReportText,
  buildStandardEmailSubject,
} from '../logic/standardCorrectiveActionReport';
import { DEFAULT_BETA_COMPANY_SETUP_PROFILE } from '../logic/betaCompanySetupProfile';

export type WocCorrectionData = {
  workOrderNumber: string;
  partNumber: string;
  revision: string;
  partDescription: string;
  customerOrJob: string;
  operationNumber: string;
  routerStepOperation: string;
  affectedOperationEquipment: string;
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

// V8-M9: department options come from the preconfigured beta company setup profile.
// For beta this is code-configured per company; future Beta 1/post-beta can make this admin editable.
export const departmentOptions = [
  ...DEFAULT_BETA_COMPANY_SETUP_PROFILE.departmentOptions,
  otherAffectedAreaOption,
];

export const affectedAreaOptions = departmentOptions;

// V8-M9: operation/equipment options also come from the preconfigured beta setup profile.
export const operationEquipmentOptions = DEFAULT_BETA_COMPANY_SETUP_PROFILE.operationEquipmentOptions;

export const defaultWocCorrectionData: WocCorrectionData = {
  workOrderNumber: '',
  partNumber: '',
  revision: '',
  partDescription: '',
  customerOrJob: '',
  operationNumber: '',
  routerStepOperation: '',
  affectedOperationEquipment: '',
  quantity: '',
  quantityAffected: '',
  dueDateShipDate: '',
  material: '',
  nextOperation: '',
  inspectionOperation: '',
  correctionType: 'Incorrect Time / Rate',
  affectedArea: otherAffectedAreaOption,
  customAffectedArea: '',
  shortIssueDescription: '',
  detailedIssueNotes: '',
  defectProblemType: '',
  productionImpact: '',
  foundAtDepartment: otherAffectedAreaOption,
  correctiveActionOwnerDepartment: 'Other / Needs Review',
  suspectedFailurePoint: 'Other / Needs Review',
  escapedThroughDepartments: 'Other / Needs Review',
  immediateContainment: '',
  requiredCorrection: '',
  preventionStandardWorkUpdate: '',
  inspectionVerificationRequirement: '',
  releaseApprovalRequirement: '',
  routerWorkOrderPhotoPlaceholder: '',
  partDefectPhotoPlaceholder: '',
  aiExtractedDataConfirmation: '',
  humanReleaseConfirmation: '',
  issueDetails: '',
  requestedEngineeringAction: '',
};

export const defaultWocConfirmations: WocConfirmationState = {
  workOrderDataConfirmed: false,
  partNumberConfirmed: false,
  correctionTypeSelected: false,
  issueDetailsEntered: false,
  requestedActionEntered: false,
  finalReviewConfirmed: false,
};

export const confirmDataFields: WocDataField[] = [
  { key: 'workOrderNumber', label: 'Work Order', required: true, confirmable: true },
  { key: 'partNumber', label: 'Part Number', required: true, confirmable: true },
  { key: 'partDescription', label: 'Part Description', required: false },
  { key: 'customerOrJob', label: 'Customer / Job Name', required: false },
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

export function getEffectiveAffectedOperationEquipment(data: WocCorrectionData) {
  const selectedOperation = data.affectedOperationEquipment.trim();

  if (selectedOperation && selectedOperation !== otherAffectedAreaOption) {
    return selectedOperation;
  }

  if (data.foundAtDepartment === 'Welding' || data.affectedArea === 'Welding') {
    return 'Welding';
  }

  return 'Operation needs confirmation';
}

export function getEffectiveAffectedProcess(data: WocCorrectionData) {
  const department = getEffectiveAffectedArea(data);
  const operationEquipment = getEffectiveAffectedOperationEquipment(data);

  if (!operationEquipment || operationEquipment === 'Operation needs confirmation') {
    return department ? `${department} — Operation needs confirmation` : 'Affected operation not confirmed';
  }

  if (!department || department === operationEquipment) return operationEquipment;

  return `${department} — ${operationEquipment}`;
}

function v4IssueSummary(data: WocCorrectionData) {
  return data.shortIssueDescription.trim() || data.issueDetails.trim();
}

export function getPhotoEvidenceStatusLine() {
  return buildPhotoEvidenceStatusLine(loadPhotoEvidenceMetadataFromSession());
}

export function buildEmailSubject(data: WocCorrectionData) {
  return buildStandardEmailSubject(data);
}

export function buildEngineeringReport(
  data: WocCorrectionData,
  submittedBy = 'Shop-floor correction request submitted through AI-CAS — Corrective Action System.',
) {
  return buildStandardCorrectiveActionReportText({
    ...data,
    submittedBy,
    photoEvidenceStatus: getPhotoEvidenceStatusLine(),
  });
}

export function buildEmailDraft(data: WocCorrectionData, submittedBy = 'AI-CAS — Corrective Action System') {
  return buildStandardCorrectiveActionEmailText({
    ...data,
    submittedBy,
    photoEvidenceStatus: getPhotoEvidenceStatusLine(),
  });
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

  const correctionTypeReady = isFilled(data.correctionType);
  const affectedAreaReady = isFilled(getEffectiveAffectedArea(data));
  const affectedOperationEquipmentReady = isFilled(data.affectedOperationEquipment);
  const issueDetailsReady = isFilled(v4IssueSummary(data)) || isFilled(data.detailedIssueNotes);
  const generateReady = confirmReady && correctionTypeReady && affectedAreaReady && affectedOperationEquipmentReady && issueDetailsReady;

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
