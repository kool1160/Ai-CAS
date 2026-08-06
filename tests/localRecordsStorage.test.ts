import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DRAFT_STORAGE_KEY,
  LOCAL_RECORD_SCHEMA_VERSION,
  createLocalRecordId,
  loadDraftRecordsFromStorage,
  loadLocalRecordsFromStorage,
  saveDraftRecordsToStorage,
} from '../features/woc/logic/localRecordsStorage';

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

  it('migrates a compatible legacy array to the documented versioned envelope without changing the record', () => {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify([{
      draftId: 'DRAFT-SYNTHETIC-4',
      subjectLine: 'Legacy synthetic draft',
      reportText: 'Synthetic report',
      emailDraftText: 'Synthetic email',
    }]));

    const [legacyDraft] = loadDraftRecordsFromStorage();
    saveDraftRecordsToStorage([legacyDraft]);

    const stored = JSON.parse(storage.getItem(DRAFT_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      recordType: 'drafts',
      records: [{ draftId: 'DRAFT-SYNTHETIC-4', subjectLine: 'Legacy synthetic draft' }],
    });
    expect(loadDraftRecordsFromStorage()).toMatchObject([legacyDraft]);
  });

  it('reports malformed browser JSON while leaving the original browser value unchanged', () => {
    const malformedSource = '{ not valid JSON';
    storage.setItem(DRAFT_STORAGE_KEY, malformedSource);

    const snapshot = loadLocalRecordsFromStorage();

    expect(snapshot.draftRecords).toEqual([]);
    expect(snapshot.recoveries).toContainEqual({
      collection: 'drafts',
      reason: 'malformed-json',
      rejectedRecordCount: 0,
    });
    expect(storage.getItem(DRAFT_STORAGE_KEY)).toBe(malformedSource);
  });

  it('reports malformed records without dropping valid records from the recovery view', () => {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify([{
      draftId: 'DRAFT-SYNTHETIC-5',
      subjectLine: 'Valid synthetic draft',
      reportText: 'Synthetic report',
      emailDraftText: 'Synthetic email',
    }, {
      draftId: 'DRAFT-SYNTHETIC-6',
      subjectLine: 'Incomplete synthetic draft',
      reportText: 'Synthetic report',
      emailDraftText: 'Synthetic email',
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION + 1,
    }]));

    const snapshot = loadLocalRecordsFromStorage();

    expect(snapshot.draftRecords.map((record) => record.draftId)).toEqual(['DRAFT-SYNTHETIC-5']);
    expect(snapshot.recoveries).toContainEqual({
      collection: 'drafts',
      reason: 'malformed-records',
      rejectedRecordCount: 1,
    });
  });

  it('creates collision-resistant record identifiers instead of using the collection length', () => {
    const firstId = createLocalRecordId('DRAFT');
    const secondId = createLocalRecordId('DRAFT');

    expect(firstId).toMatch(/^DRAFT-/);
    expect(secondId).toMatch(/^DRAFT-/);
    expect(secondId).not.toBe(firstId);
  });
});
