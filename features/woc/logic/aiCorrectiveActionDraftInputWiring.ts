import { loadPhotoEvidenceMetadataFromSession } from './evidenceAttachmentPreparation';
import { CAPTURE_CONTEXT_STORAGE_KEY } from './wocStorageKeys';
import type { AiCorrectiveActionDraftInput } from './aiCorrectiveActionDraftFoundation';
import type { WocCorrectionData } from '../state/wocDataModel';


type CaptureContext = {
  shortIssueDescription?: string;
  evidenceLabel?: string;
};

function loadCaptureContextFromSession(): CaptureContext {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.sessionStorage.getItem(CAPTURE_CONTEXT_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Partial<CaptureContext>;

    return {
      shortIssueDescription: typeof parsed.shortIssueDescription === 'string' ? parsed.shortIssueDescription : '',
      evidenceLabel: typeof parsed.evidenceLabel === 'string' ? parsed.evidenceLabel : '',
    };
  } catch {
    return {};
  }
}

function firstFilled(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim() ?? '';
}

export function buildAiCorrectiveActionDraftInputFromWocData(data: WocCorrectionData): AiCorrectiveActionDraftInput {
  const captureContext = loadCaptureContextFromSession();
  const photoEvidence = loadPhotoEvidenceMetadataFromSession();

  return {
    workOrderNumber: data.workOrderNumber,
    partNumber: data.partNumber,
    partDescription: data.partDescription,
    customerOrJob: data.customerOrJob,
    operationNumber: data.operationNumber,
    routerStepOperation: data.routerStepOperation,
    quantityAffected: firstFilled(data.quantityAffected, data.quantity),
    foundAtDepartment: firstFilled(data.foundAtDepartment, data.affectedArea),
    suspectedFailurePoint: data.suspectedFailurePoint,
    correctiveActionOwnerDepartment: data.correctiveActionOwnerDepartment,
    shortIssueDescription: firstFilled(captureContext.shortIssueDescription, data.shortIssueDescription, data.issueDetails),
    detailedIssueNotes: firstFilled(data.detailedIssueNotes, data.issueDetails),
    evidenceLabel: captureContext.evidenceLabel ?? '',
    photoEvidenceAttached: Boolean(photoEvidence?.evidenceAttached),
    photoEvidenceFileName: photoEvidence?.evidenceFileName ?? '',
  };
}
