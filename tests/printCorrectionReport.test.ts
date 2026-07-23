import { beforeEach, describe, expect, it } from 'vitest';
import {
  PRINT_REPORT_STORAGE_KEY,
  printCorrectionReport,
  resolvePhotoEvidenceStatus,
  validatePrintCorrectionReportPayload,
} from '../features/woc/logic/printCorrectionReport';

function createSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('confirmed print handoff', () => {
  let sessionStorage: ReturnType<typeof createSessionStorage>;
  let location: { href: string };

  beforeEach(() => {
    sessionStorage = createSessionStorage();
    location = { href: '' };
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { sessionStorage, location },
    });
  });

  it('stores a confirmed handoff and navigates only after validation', () => {
    const result = printCorrectionReport(
      { reportText: 'Synthetic report', subjectLine: 'Synthetic subject' },
      {
        reviewStatus: 'confirmed',
        reviewedTimestamp: '2026-07-22T12:00:00.000Z',
        reviewedBy: 'Synthetic Reviewer',
      },
      true,
    );

    expect(result).toBe(true);
    expect(JSON.parse(sessionStorage.getItem(PRINT_REPORT_STORAGE_KEY) ?? '{}')).toMatchObject({
      reportText: 'Synthetic report',
      finalReviewConfirmed: true,
      reviewStatus: 'confirmed',
      reviewedTimestamp: '2026-07-22T12:00:00.000Z',
      reviewedBy: 'Synthetic Reviewer',
    });
    expect(location.href).toBe('/print-report');
  });

  it('refuses false, string, numeric, and legacy confirmation before browser navigation', () => {
    for (const confirmation of [false, 'true', 1, undefined]) {
      sessionStorage = createSessionStorage();
      location.href = '';
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: { sessionStorage, location },
      });

      const result = printCorrectionReport(
        { reportText: 'Synthetic report' },
        { reviewStatus: 'legacy-unconfirmed' },
        confirmation,
      );

      expect(result).toBe(false);
      expect(sessionStorage.getItem(PRINT_REPORT_STORAGE_KEY)).toBeNull();
      expect(location.href).toBe('');
    }
  });

  it('uses structured evidence first and legacy report text only as fallback', () => {
    expect(resolvePhotoEvidenceStatus({
      evidenceAttached: true,
      evidenceFileName: 'SYNTHETIC-structured.png',
      evidenceFileType: 'image/png',
      evidenceFileSize: 2048,
      reportText: 'Photo evidence attached: SYNTHETIC-legacy.jpg (image/jpeg, 8 KB).',
    })).toBe('SYNTHETIC-structured.png · image/png · 2 KB');

    expect(resolvePhotoEvidenceStatus({
      reportText: 'Photo evidence attached: SYNTHETIC-legacy.jpg (image/jpeg, 8 KB).',
    })).toBe('SYNTHETIC-legacy.jpg · image/jpeg · 8 KB');
  });

  it('preserves evidence details in the confirmed print payload', () => {
    const result = printCorrectionReport(
      {
        evidenceAttached: true,
        evidenceFileName: 'SYNTHETIC-photo.png',
        evidenceFileType: 'image/png',
        evidenceFileSize: 2048,
        reportText: 'Synthetic report',
      },
      {
        reviewStatus: 'confirmed',
        reviewedTimestamp: '2026-07-22T12:00:00.000Z',
        reviewedBy: 'Synthetic Reviewer',
      },
      true,
    );

    const payload = JSON.parse(sessionStorage.getItem(PRINT_REPORT_STORAGE_KEY) ?? '{}');
    expect(result).toBe(true);
    expect(payload.photoEvidenceStatus).toContain('SYNTHETIC-photo.png (image/png, 2 KB)');
    expect(payload.photoEvidenceStatus).toContain('not embedded, emailed, or permanently stored');
    expect(payload.evidenceFileName).toBe('SYNTHETIC-photo.png');
    expect(payload.evidenceFileType).toBe('image/png');
    expect(payload.evidenceFileSize).toBe(2048);
  });

  it('does not inherit unrelated session evidence for an explicit no-evidence draft', () => {
    sessionStorage.setItem('refab-connect-photo-evidence', JSON.stringify({
      evidenceAttached: true,
      evidenceFileName: 'SYNTHETIC-unrelated.png',
      evidenceFileType: 'image/png',
      evidenceFileSize: 4096,
    }));

    const result = printCorrectionReport(
      {
        evidenceAttached: false,
        photoEvidenceStatus: 'Attached',
        reportText: 'Synthetic report.\nPhoto evidence attached: SYNTHETIC-stale.png (image/png, 1 KB).',
      },
      {
        reviewStatus: 'confirmed',
        reviewedTimestamp: '2026-07-22T12:00:00.000Z',
        reviewedBy: 'Synthetic Reviewer',
      },
      true,
    );

    const payload = JSON.parse(sessionStorage.getItem(PRINT_REPORT_STORAGE_KEY) ?? '{}');
    expect(result).toBe(true);
    expect(payload.photoEvidenceStatus).toBe('Not attached');
    expect(JSON.stringify(payload)).not.toContain('SYNTHETIC-unrelated.png');
    expect(payload.reportText).toContain('No photo evidence attached.');
    expect(payload.reportText).not.toContain('SYNTHETIC-stale.png');
  });

  it('validates the complete print contract and rejects malformed optional fields', () => {
    const valid = {
      finalReviewConfirmed: true,
      reviewStatus: 'confirmed',
      reviewedTimestamp: '2026-07-22T12:00:00.000Z',
      reviewedBy: 'Synthetic Reviewer',
      reviewedById: 'USER-SYNTHETIC-1',
      reportText: 'Synthetic report',
      subjectLine: 'Synthetic subject',
      evidenceAttached: true,
      evidenceFileSize: 2048,
    };

    expect(validatePrintCorrectionReportPayload(valid)).toBe(true);
    expect(validatePrintCorrectionReportPayload({ ...valid, subjectLine: 7 })).toBe(false);
    expect(validatePrintCorrectionReportPayload({ ...valid, evidenceAttached: 'true' })).toBe(false);
    expect(validatePrintCorrectionReportPayload({ ...valid, evidenceFileSize: -1 })).toBe(false);
    expect(validatePrintCorrectionReportPayload({ ...valid, reportText: '   ' })).toBe(false);
  });
});
