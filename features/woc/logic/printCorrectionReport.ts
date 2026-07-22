import {
  createConfirmedPrintPayload,
  type ReviewMetadata,
} from '../state/reviewGate';

export type PrintCorrectionReportInput = {
  subjectLine?: string;
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  customerOrJob?: string;
  quantity?: string;
  affectedArea?: string;
  correctionType?: string;
  photoEvidenceStatus?: string;
  submittedBy?: string;
  status?: string;
  generatedTimestamp?: string;
  reportText: string;
};

export const PRINT_REPORT_STORAGE_KEY = 'refab-connect-print-report';
const PHOTO_EVIDENCE_STORAGE_KEY = 'refab-connect-photo-evidence';

function formatEvidenceFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getSessionPhotoEvidenceStatus() {
  try {
    const raw = window.sessionStorage.getItem(PHOTO_EVIDENCE_STORAGE_KEY);
    if (!raw) return '';

    const parsed = JSON.parse(raw) as {
      evidenceAttached?: unknown;
      evidenceFileName?: unknown;
      evidenceFileType?: unknown;
      evidenceFileSize?: unknown;
    };

    if (parsed.evidenceAttached !== true) return '';

    const name = typeof parsed.evidenceFileName === 'string' && parsed.evidenceFileName.trim()
      ? parsed.evidenceFileName.trim()
      : 'Photo evidence attached';
    const type = typeof parsed.evidenceFileType === 'string' && parsed.evidenceFileType.trim()
      ? parsed.evidenceFileType.trim()
      : 'unknown image type';
    const size = typeof parsed.evidenceFileSize === 'number' ? parsed.evidenceFileSize : 0;

    return `Attached locally / metadata only: ${name} (${type}, ${formatEvidenceFileSize(size)}). Image is not embedded, emailed, or permanently stored yet.`;
  } catch {
    return '';
  }
}

function normalizePrintReportEvidence(report: PrintCorrectionReportInput): PrintCorrectionReportInput {
  const sessionEvidenceStatus = getSessionPhotoEvidenceStatus();
  const currentStatus = report.photoEvidenceStatus?.trim() || '';
  const shouldUseSessionEvidence = Boolean(sessionEvidenceStatus) && (!currentStatus || /no photo evidence|not attached/i.test(currentStatus));
  const photoEvidenceStatus = shouldUseSessionEvidence ? sessionEvidenceStatus : currentStatus || 'Not attached';
  const reportText = shouldUseSessionEvidence
    ? report.reportText.replace(/No photo evidence attached\./gi, sessionEvidenceStatus)
    : report.reportText;

  return {
    ...report,
    photoEvidenceStatus,
    reportText,
  };
}

export function printCorrectionReport(
  report: PrintCorrectionReportInput,
  reviewMetadata: ReviewMetadata,
  finalReviewConfirmed: unknown,
) {
  const payload = createConfirmedPrintPayload(report, reviewMetadata, finalReviewConfirmed);
  if (!payload) return false;

  window.sessionStorage.setItem(PRINT_REPORT_STORAGE_KEY, JSON.stringify(normalizePrintReportEvidence(payload)));
  window.location.href = '/print-report';
  return true;
}
