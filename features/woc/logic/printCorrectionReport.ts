import {
  createConfirmedPrintPayload,
  validateConfirmedPrintPayload,
  type ConfirmedPrintMetadata,
  type ReviewMetadata,
} from '../state/reviewGate';
import type { PhotoEvidenceRecordMetadata } from '../types/wocSessionTypes';
import { extractEvidenceMetadataFromReportText } from './localRecordsStorage';

export type PrintCorrectionReportInput = Partial<PhotoEvidenceRecordMetadata> & {
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

export type ConfirmedPrintCorrectionReportPayload = PrintCorrectionReportInput & ConfirmedPrintMetadata;

export const PRINT_REPORT_STORAGE_KEY = 'refab-connect-print-report';
const PHOTO_EVIDENCE_STORAGE_KEY = 'refab-connect-photo-evidence';

function formatEvidenceFileSize(size: number | undefined) {
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) return 'unknown size';
  const finiteSize = size;
  if (finiteSize < 1024) return `${finiteSize} B`;
  if (finiteSize < 1024 * 1024) return `${Math.round(finiteSize / 1024)} KB`;
  return `${(finiteSize / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveEvidenceMetadata(
  source: Pick<PrintCorrectionReportInput, 'evidenceAttached' | 'evidenceFileName' | 'evidenceFileType' | 'evidenceFileSize' | 'reportText'>,
): PhotoEvidenceRecordMetadata {
  if (source.evidenceAttached === false) return { evidenceAttached: false };

  const legacyMetadata = extractEvidenceMetadataFromReportText(source.reportText);
  if (source.evidenceAttached !== true && !legacyMetadata.evidenceAttached) {
    return { evidenceAttached: false };
  }

  return {
    evidenceAttached: true,
    evidenceFileName: source.evidenceFileName?.trim() || legacyMetadata.evidenceFileName,
    evidenceFileType: source.evidenceFileType?.trim() || legacyMetadata.evidenceFileType,
    evidenceFileSize: Number.isFinite(source.evidenceFileSize) && Number(source.evidenceFileSize) > 0
      ? source.evidenceFileSize
      : legacyMetadata.evidenceFileSize,
  };
}

export function resolvePhotoEvidenceStatus(
  source: Pick<PrintCorrectionReportInput, 'evidenceAttached' | 'evidenceFileName' | 'evidenceFileType' | 'evidenceFileSize' | 'reportText'>,
  format: 'compact' | 'print' = 'compact',
) {
  const metadata = resolveEvidenceMetadata(source);
  if (!metadata.evidenceAttached) return format === 'print' ? 'Not attached' : 'No photo evidence attached';

  const name = metadata.evidenceFileName?.trim() || 'Photo evidence attached';
  const type = metadata.evidenceFileType?.trim() || 'unknown image type';
  const size = formatEvidenceFileSize(metadata.evidenceFileSize);

  if (format === 'compact') return `${name} · ${type} · ${size}`;

  return `Attached locally / metadata only: ${name} (${type}, ${size}). Image is not embedded, emailed, or permanently stored yet.`;
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

    return resolvePhotoEvidenceStatus({
      evidenceAttached: true,
      evidenceFileName: typeof parsed.evidenceFileName === 'string' ? parsed.evidenceFileName : undefined,
      evidenceFileType: typeof parsed.evidenceFileType === 'string' ? parsed.evidenceFileType : undefined,
      evidenceFileSize: typeof parsed.evidenceFileSize === 'number' ? parsed.evidenceFileSize : undefined,
      reportText: '',
    }, 'print');
  } catch {
    return '';
  }
}

function normalizePrintReportEvidence(report: PrintCorrectionReportInput): PrintCorrectionReportInput {
  const currentStatus = report.photoEvidenceStatus?.trim() || '';
  const hasExplicitEvidenceState = typeof report.evidenceAttached === 'boolean';
  const hasLegacyEvidenceState = /Photo evidence attached:|No photo evidence attached/i.test(report.reportText);
  const resolvedStatus = hasExplicitEvidenceState
    ? resolvePhotoEvidenceStatus(report, 'print')
    : currentStatus || (
      hasLegacyEvidenceState
      ? resolvePhotoEvidenceStatus(report, 'print')
      : getSessionPhotoEvidenceStatus() || 'Not attached'
    );
  const shouldReplaceNoEvidence = resolvedStatus !== 'Not attached'
    && !/^No photo evidence attached$/i.test(resolvedStatus);
  const reportText = report.evidenceAttached === false
    ? report.reportText.replace(/Photo evidence attached:[^\r\n]*/gi, 'No photo evidence attached.')
    : shouldReplaceNoEvidence
      ? report.reportText.replace(/No photo evidence attached\./gi, resolvedStatus)
      : report.reportText;

  return {
    ...report,
    photoEvidenceStatus: resolvedStatus,
    reportText,
  };
}

const OPTIONAL_STRING_FIELDS: Array<keyof PrintCorrectionReportInput> = [
  'subjectLine',
  'workOrderNumber',
  'partNumber',
  'revision',
  'customerOrJob',
  'quantity',
  'affectedArea',
  'correctionType',
  'photoEvidenceStatus',
  'submittedBy',
  'status',
  'generatedTimestamp',
  'evidenceFileName',
  'evidenceFileType',
];

export function validatePrintCorrectionReportPayload(value: unknown): value is ConfirmedPrintCorrectionReportPayload {
  if (!validateConfirmedPrintPayload(value)) return false;

  const candidate = value as Record<string, unknown>;
  if (OPTIONAL_STRING_FIELDS.some((field) => candidate[field] !== undefined && typeof candidate[field] !== 'string')) {
    return false;
  }
  if (candidate.evidenceAttached !== undefined && typeof candidate.evidenceAttached !== 'boolean') return false;
  if (
    candidate.evidenceFileSize !== undefined
    && (
      typeof candidate.evidenceFileSize !== 'number'
      || !Number.isFinite(candidate.evidenceFileSize)
      || candidate.evidenceFileSize < 0
    )
  ) {
    return false;
  }

  return true;
}

export function printCorrectionReport(
  report: PrintCorrectionReportInput,
  reviewMetadata: ReviewMetadata,
  finalReviewConfirmed: unknown,
) {
  const normalizedReport = normalizePrintReportEvidence(report);
  const payload = createConfirmedPrintPayload(normalizedReport, reviewMetadata, finalReviewConfirmed);
  if (!payload || !validatePrintCorrectionReportPayload(payload)) return false;

  window.sessionStorage.setItem(PRINT_REPORT_STORAGE_KEY, JSON.stringify(payload));
  window.location.href = '/print-report';
  return true;
}
