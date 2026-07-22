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

const MAX_REVIEWER_LENGTH = 160;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function isLiteralTrue(value: unknown): value is true {
  return value === true;
}

export function isValidReviewTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && ISO_TIMESTAMP_PATTERN.test(value)
    && Number.isFinite(Date.parse(value));
}

export function isValidReviewerAttribution(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.length <= MAX_REVIEWER_LENGTH
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function optionalReviewerId(value: unknown) {
  return value === undefined || isValidReviewerAttribution(value);
}

export function createConfirmedReviewMetadata(input: {
  reviewedTimestamp?: unknown;
  reviewedBy?: unknown;
  reviewedById?: unknown;
}): ConfirmedReviewMetadata | null {
  const reviewedTimestamp = input.reviewedTimestamp === undefined
    ? new Date().toISOString()
    : input.reviewedTimestamp;

  if (!isValidReviewTimestamp(reviewedTimestamp) || !isValidReviewerAttribution(input.reviewedBy) || !optionalReviewerId(input.reviewedById)) {
    return null;
  }

  return {
    reviewStatus: 'confirmed',
    reviewedTimestamp,
    reviewedBy: input.reviewedBy.trim(),
    ...(input.reviewedById === undefined ? {} : { reviewedById: input.reviewedById.trim() }),
  };
}

export function sanitizeReviewMetadata(value: Record<string, unknown>): ReviewMetadata {
  if (value.reviewStatus !== 'confirmed') return { reviewStatus: 'legacy-unconfirmed' };

  const confirmed = createConfirmedReviewMetadata({
    reviewedTimestamp: value.reviewedTimestamp,
    reviewedBy: value.reviewedBy,
    reviewedById: value.reviewedById,
  });

  return confirmed ?? { reviewStatus: 'legacy-unconfirmed' };
}

export function canSaveGeneratedPackage(generatedPackage: unknown, finalReviewConfirmed: unknown) {
  return Boolean(generatedPackage) && isLiteralTrue(finalReviewConfirmed);
}

export function canPerformFreshDraftAction(draft: unknown, finalReviewConfirmed: unknown) {
  return Boolean(draft) && isLiteralTrue(finalReviewConfirmed);
}

export function validateConfirmedPrintPayload(value: unknown): value is ConfirmedPrintMetadata {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  return isLiteralTrue(candidate.finalReviewConfirmed)
    && candidate.reviewStatus === 'confirmed'
    && isValidReviewTimestamp(candidate.reviewedTimestamp)
    && isValidReviewerAttribution(candidate.reviewedBy)
    && optionalReviewerId(candidate.reviewedById);
}

export function createConfirmedPrintPayload<T extends object>(
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
