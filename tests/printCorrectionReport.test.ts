import { beforeEach, describe, expect, it } from 'vitest';
import { PRINT_REPORT_STORAGE_KEY, printCorrectionReport } from '../features/woc/logic/printCorrectionReport';

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
});
