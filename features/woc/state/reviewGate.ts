export const REVIEW_CONFIRMATION_ERROR = 'Complete and confirm final review before saving this correction package.';

export type ReviewStatus = 'confirmed' | 'legacy-unconfirmed';

export type ReviewMetadata = {
  reviewStatus: ReviewStatus;
  reviewedTimestamp?: string;
  reviewedBy?: string;
  reviewedById?: string;
};

export type ConfirmedReviewMetadata = {
  reviewStatus: 'confirmed';
  reviewedTimestamp: string;
  reviewedBy: string;
  reviewedById?: string;
};

export type ConfirmedPrintMetadata = ConfirmedReviewMetadata & {
  finalReviewConfirmed: true;
};

export type ConfirmedPrintPayload = ConfirmedPrintMetadata & {
  reportText: string;
};

export const LEGACY_REVIEW_STATUS_TEXT = 'Legacy draft — final review must be confirmed again.';

const UNKNOWN_LOCAL_REVIEWER = 'Unknown local user';
const MAX_REVIEWER_LABEL_LENGTH = 160;
const MAX_REVIEWER_ID_LENGTH = 120;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function isLiteralTrue(value: unknown): value is true {
  return value === true;
}

export function isValidReviewTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) return false;

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

export function isValidReviewerAttribution(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.length <= MAX_REVIEWER_LABEL_LENGTH
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function isValidReviewerId(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.length <= MAX_REVIEWER_ID_LENGTH
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function optionalReviewerId(value: unknown): value is string | undefined {
  return value === undefined || isValidReviewerId(value);
}

function normalizeBoundedAttribution(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();
}

export function normalizeReviewAttribution(input: {
  reviewedBy: unknown;
  reviewedById?: unknown;
}): Pick<ConfirmedReviewMetadata, 'reviewedBy' | 'reviewedById'> | null {
  if (typeof input.reviewedBy !== 'string') return null;
  if (input.reviewedById !== undefined && typeof input.reviewedById !== 'string') return null;

  const reviewedBy = normalizeBoundedAttribution(input.reviewedBy, MAX_REVIEWER_LABEL_LENGTH)
    || UNKNOWN_LOCAL_REVIEWER;
  const reviewedById = input.reviewedById === undefined
    ? ''
    : normalizeBoundedAttribution(input.reviewedById, MAX_REVIEWER_ID_LENGTH);

  return {
    reviewedBy,
    ...(reviewedById ? { reviewedById } : {}),
  };
}

export function createConfirmedReviewMetadata(input: {
  reviewedTimestamp?: unknown;
  reviewedBy?: unknown;
  reviewedById?: unknown;
}): ConfirmedReviewMetadata | null {
  const reviewedTimestamp = input.reviewedTimestamp === undefined
    ? new Date().toISOString()
    : input.reviewedTimestamp;
  const reviewer = normalizeReviewAttribution({
    reviewedBy: input.reviewedBy,
    reviewedById: input.reviewedById,
  });

  if (!isValidReviewTimestamp(reviewedTimestamp) || !reviewer) {
    return null;
  }

  return {
    reviewStatus: 'confirmed',
    reviewedTimestamp,
    ...reviewer,
  };
}

export function sanitizeReviewMetadata(value: Record<string, unknown>): ReviewMetadata {
  if (value.reviewStatus !== 'confirmed') return { reviewStatus: 'legacy-unconfirmed' };

  if (
    !isValidReviewTimestamp(value.reviewedTimestamp)
    || !isValidReviewerAttribution(value.reviewedBy)
    || !optionalReviewerId(value.reviewedById)
  ) {
    return { reviewStatus: 'legacy-unconfirmed' };
  }

  return {
    reviewStatus: 'confirmed',
    reviewedTimestamp: value.reviewedTimestamp,
    reviewedBy: value.reviewedBy.trim(),
    ...(value.reviewedById === undefined ? {} : { reviewedById: value.reviewedById.trim() }),
  };
}

export function formatPersistedReviewStatus(value: ReviewMetadata) {
  const metadata = sanitizeReviewMetadata(value as Record<string, unknown>);
  if (metadata.reviewStatus !== 'confirmed') return LEGACY_REVIEW_STATUS_TEXT;

  return `Review confirmed: ${metadata.reviewedTimestamp} · ${metadata.reviewedBy}`;
}

export function canSaveGeneratedPackage(generatedPackage: unknown, finalReviewConfirmed: unknown) {
  return Boolean(generatedPackage) && isLiteralTrue(finalReviewConfirmed);
}

export function canPerformFreshDraftAction(draft: unknown, finalReviewConfirmed: unknown) {
  return Boolean(draft) && isLiteralTrue(finalReviewConfirmed);
}

export function validateConfirmedPrintPayload(value: unknown): value is ConfirmedPrintPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  return isLiteralTrue(candidate.finalReviewConfirmed)
    && candidate.reviewStatus === 'confirmed'
    && isValidReviewTimestamp(candidate.reviewedTimestamp)
    && isValidReviewerAttribution(candidate.reviewedBy)
    && optionalReviewerId(candidate.reviewedById)
    && typeof candidate.reportText === 'string'
    && Boolean(candidate.reportText.trim());
}

export function createConfirmedPrintPayload<T extends { reportText: string }>(
  report: T,
  reviewMetadata: ReviewMetadata,
  finalReviewConfirmed: unknown,
): (T & ConfirmedPrintMetadata) | null {
  if (!canPerformFreshDraftAction(report, finalReviewConfirmed) || reviewMetadata.reviewStatus !== 'confirmed') return null;

  const payload = {
    ...report,
    finalReviewConfirmed: true as const,
    reviewStatus: reviewMetadata.reviewStatus,
    reviewedTimestamp: reviewMetadata.reviewedTimestamp,
    reviewedBy: reviewMetadata.reviewedBy,
    ...(reviewMetadata.reviewedById === undefined ? {} : { reviewedById: reviewMetadata.reviewedById }),
  };

  return validateConfirmedPrintPayload(payload) ? payload : null;
}
