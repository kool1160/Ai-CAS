import { describe, expect, it } from 'vitest';
import {
  canPerformFreshDraftAction,
  canSaveGeneratedPackage,
  createConfirmedPrintPayload,
  createConfirmedReviewMetadata,
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
    expect(createConfirmedReviewMetadata({ reviewedTimestamp, reviewedBy: 'Reviewer\nInjected' })).toBeNull();
    expect(createConfirmedReviewMetadata({ reviewedTimestamp, reviewedBy: 'Reviewer', reviewedById: 7 })).toBeNull();
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
  });
});
