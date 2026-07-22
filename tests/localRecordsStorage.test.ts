import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DRAFT_STORAGE_KEY, loadDraftRecordsFromStorage } from '../features/woc/logic/localRecordsStorage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('browser-local draft review migration', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: storage },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  it('loads legacy drafts without upgrading their review state', () => {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify([{
      draftId: 'DRAFT-SYNTHETIC-1',
      createdTimestamp: '2026-07-22T12:00:00.000Z',
      subjectLine: 'Synthetic subject',
      reportText: 'Photo evidence attached: SYNTHETIC-photo.png (image/png, 2 KB).',
      emailDraftText: 'Synthetic email draft',
    }]));

    const [draft] = loadDraftRecordsFromStorage();
    expect(draft.reviewStatus).toBe('legacy-unconfirmed');
    expect(draft.evidenceAttached).toBe(true);
    expect(draft.reportText).toContain('SYNTHETIC-photo.png');
  });

  it('preserves valid review metadata and content while demoting malformed metadata', () => {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify([
      {
        draftId: 'DRAFT-SYNTHETIC-2',
        subjectLine: 'Confirmed synthetic draft',
        reportText: 'Synthetic report',
        emailDraftText: 'Synthetic email',
        reviewStatus: 'confirmed',
        reviewedTimestamp: '2026-07-22T12:00:00.000Z',
        reviewedBy: 'Synthetic Reviewer',
      },
      {
        draftId: 'DRAFT-SYNTHETIC-3',
        subjectLine: 'Malformed synthetic draft',
        reportText: 'Synthetic report remains',
        emailDraftText: 'Synthetic email remains',
        reviewStatus: 'confirmed',
        reviewedTimestamp: 'not-a-date',
        reviewedBy: 'Synthetic Reviewer',
      },
    ]));

    const drafts = loadDraftRecordsFromStorage();
    expect(drafts[0]).toMatchObject({ reviewStatus: 'confirmed', reviewedBy: 'Synthetic Reviewer' });
    expect(drafts[1]).toMatchObject({ reviewStatus: 'legacy-unconfirmed', reportText: 'Synthetic report remains' });
  });
});
