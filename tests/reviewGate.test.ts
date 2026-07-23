import { describe, expect, it } from 'vitest';
import {
  canPerformFreshDraftAction,
  canSaveGeneratedPackage,
  createConfirmedPrintPayload,
  createConfirmedReviewMetadata,
  formatPersistedReviewStatus,
  LEGACY_REVIEW_STATUS_TEXT,
  normalizeReviewAttribution,
  sanitizeReviewMetadata,
  validateConfirmedPrintPayload,
} from '../features/woc/state/reviewGate';

const reviewedTimestamp = '2026-07-22T12:00:00.000Z';

describe('review gate helpers', () => {
  it('requires literal true for initial save and saved-draft actions', () => {
    expect(canSaveGeneratedPackage({ reportText: 'draft' }, true)).toBe(true);
    expect(canSaveGeneratedPackage({ reportText: 'draft' }, 'true')).toBe(false);
    expect(canSaveGeneratedPackage({ reportText: 'draft' }, 1)).toBe(false);
    expect(canSaveGeneratedPackage({ reportText: 'draft' }, {})).toBe(false);
    expect(canSaveGeneratedPackage(null, true)).toBe(false);

    expect(canPerformFreshDraftAction({ draftId: 'DRAFT-0001' }, true)).toBe(true);
    expect(canPerformFreshDraftAction({ draftId: 'DRAFT-0001' }, 'true')).toBe(false);
    expect(canPerformFreshDraftAction({ draftId: 'DRAFT-0001' }, 1)).toBe(false);
    expect(canPerformFreshDraftAction(null, true)).toBe(false);
  });

  it('creates and validates bounded confirmed review metadata', () => {
    const metadata = createConfirmedReviewMetadata({
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer (EMP-1047)',
      reviewedById: 'USER-SYNTHETIC-1',
    });

    expect(metadata).toEqual({
      reviewStatus: 'confirmed',
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer (EMP-1047)',
      reviewedById: 'USER-SYNTHETIC-1',
    });
    expect(createConfirmedReviewMetadata({ reviewedTimestamp: 'not-a-date', reviewedBy: 'Reviewer' })).toBeNull();
    expect(createConfirmedReviewMetadata({ reviewedTimestamp: '2026-02-30T12:00:00.000Z', reviewedBy: 'Reviewer' })).toBeNull();
    expect(createConfirmedReviewMetadata({ reviewedTimestamp, reviewedBy: 'Reviewer\nInjected' })).toMatchObject({
      reviewedBy: 'Reviewer Injected',
    });
    expect(createConfirmedReviewMetadata({ reviewedTimestamp, reviewedBy: 'Reviewer', reviewedById: 7 })).toBeNull();
  });

  it('normalizes accepted browser-local identity before applying review limits', () => {
    const longLabel = `  Synthetic\u0000   Reviewer ${' Name'.repeat(80)}  `;
    const longId = `  USER\u0007-${'SYNTHETIC'.repeat(30)}  `;
    const normalized = normalizeReviewAttribution({ reviewedBy: longLabel, reviewedById: longId });

    expect(normalized).not.toBeNull();
    expect(normalized?.reviewedBy.length).toBeLessThanOrEqual(160);
    expect(normalized?.reviewedById?.length).toBeLessThanOrEqual(120);
    expect(normalized?.reviewedBy).not.toMatch(/[\u0000-\u001f\u007f]|\s{2,}/);
    expect(normalized?.reviewedById).not.toMatch(/[\u0000-\u001f\u007f]|\s{2,}/);
    expect(normalizeReviewAttribution(normalized ?? { reviewedBy: '' })).toEqual(normalized);
    expect(normalizeReviewAttribution({ reviewedBy: '\u0000\u0007' })).toEqual({
      reviewedBy: 'Unknown local user',
    });
  });

  it('keeps missing and malformed stored metadata legacy-unconfirmed', () => {
    expect(sanitizeReviewMetadata({})).toEqual({ reviewStatus: 'legacy-unconfirmed' });
    expect(sanitizeReviewMetadata({ reviewStatus: 'confirmed', reviewedTimestamp, reviewedBy: 'Reviewer' })).toEqual({
      reviewStatus: 'confirmed',
      reviewedTimestamp,
      reviewedBy: 'Reviewer',
    });
    expect(sanitizeReviewMetadata({ reviewStatus: 'confirmed', reviewedTimestamp: 'bad', reviewedBy: 'Reviewer' })).toEqual({
      reviewStatus: 'legacy-unconfirmed',
    });
    expect(sanitizeReviewMetadata({ reviewStatus: 'confirmed', reviewedTimestamp, reviewedBy: 1 })).toEqual({
      reviewStatus: 'legacy-unconfirmed',
    });
    expect(sanitizeReviewMetadata({ reviewStatus: 'confirmed', reviewedTimestamp, reviewedBy: 'Reviewer\nInjected' })).toEqual({
      reviewStatus: 'legacy-unconfirmed',
    });
  });

  it('formats persisted review status without upgrading legacy or malformed data', () => {
    expect(formatPersistedReviewStatus({
      reviewStatus: 'confirmed',
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer',
    })).toBe(`Review confirmed: ${reviewedTimestamp} · Synthetic Reviewer`);
    expect(formatPersistedReviewStatus({ reviewStatus: 'legacy-unconfirmed' })).toBe(LEGACY_REVIEW_STATUS_TEXT);
    expect(formatPersistedReviewStatus({
      reviewStatus: 'confirmed',
      reviewedTimestamp: 'malformed',
      reviewedBy: 'Synthetic Reviewer',
    })).toBe('Legacy draft — final review must be confirmed again.');
  });

  it('creates print payloads only from fresh literal confirmation and valid metadata', () => {
    const report = { reportText: 'Synthetic report', subjectLine: 'Synthetic subject' };
    const metadata = {
      reviewStatus: 'confirmed' as const,
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer',
    };

    expect(createConfirmedPrintPayload(report, metadata, true)).toMatchObject({
      ...report,
      finalReviewConfirmed: true,
      ...metadata,
    });
    expect(createConfirmedPrintPayload(report, metadata, 'true')).toBeNull();
    expect(createConfirmedPrintPayload(report, metadata, 1)).toBeNull();
    expect(createConfirmedPrintPayload(report, { reviewStatus: 'legacy-unconfirmed' }, true)).toBeNull();
  });

  it('relocks a saved action without changing its recorded confirmed history', () => {
    const metadata = {
      reviewStatus: 'confirmed' as const,
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer',
    };

    expect(createConfirmedPrintPayload({ reportText: 'Synthetic report' }, metadata, false)).toBeNull();
    expect(metadata).toEqual({
      reviewStatus: 'confirmed',
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer',
    });
  });

  it('rejects every non-literal or malformed print confirmation shape', () => {
    const valid = {
      finalReviewConfirmed: true,
      reviewStatus: 'confirmed',
      reviewedTimestamp,
      reviewedBy: 'Synthetic Reviewer',
      reportText: 'Synthetic report',
    };

    expect(validateConfirmedPrintPayload(valid)).toBe(true);
    for (const confirmation of [undefined, false, 'true', 1, {}, []]) {
      expect(validateConfirmedPrintPayload({ ...valid, finalReviewConfirmed: confirmation })).toBe(false);
    }
    expect(validateConfirmedPrintPayload({ ...valid, reviewedTimestamp: 'bad' })).toBe(false);
    expect(validateConfirmedPrintPayload({ ...valid, reviewedBy: 'Reviewer\u0000' })).toBe(false);
    expect(validateConfirmedPrintPayload({ ...valid, reportText: '' })).toBe(false);
    expect(validateConfirmedPrintPayload({ ...valid, reportText: 7 })).toBe(false);
    expect(validateConfirmedPrintPayload(({ ...valid, reportText: undefined }))).toBe(false);
  });
});
