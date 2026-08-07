import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DRAFT_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  LOCAL_RECORD_SCHEMA_VERSION,
  createLocalRecordId,
  loadDraftRecordsFromStorage,
  loadLocalRecordsFromStorage,
  persistNewDraftRecord,
  persistNewHistoryRecord,
  saveDraftRecordsToStorage,
} from '../features/woc/logic/localRecordsStorage';
import type { DraftRecord, HistoryRecord } from '../features/woc/types/wocSessionTypes';

const currentDraft: DraftRecord = {
  schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
  draftId: 'DRAFT-SYNTHETIC-CURRENT-1',
  createdTimestamp: '2026-08-07T12:00:00.000Z',
  subjectLine: 'Synthetic current draft',
  workOrderNumber: 'WO-SYNTHETIC-CURRENT-1',
  partNumber: 'PART-SYNTHETIC-CURRENT-1',
  affectedArea: 'Synthetic area',
  correctionType: 'Synthetic correction',
  reportText: 'Synthetic current report',
  emailDraftText: 'Synthetic current email',
  reviewStatus: 'legacy-unconfirmed',
  evidenceAttached: false,
  status: 'Draft',
};

const currentHistory: HistoryRecord = {
  schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
  historyId: 'HISTORY-SYNTHETIC-CURRENT-1',
  completedTimestamp: '2026-08-07T12:05:00.000Z',
  subjectLine: 'Synthetic current history',
  workOrderNumber: 'WO-SYNTHETIC-CURRENT-2',
  partNumber: 'PART-SYNTHETIC-CURRENT-2',
  affectedArea: 'Synthetic area',
  correctionType: 'Synthetic correction',
  reportText: 'Synthetic current history report',
  emailDraftText: 'Synthetic current history email',
  evidenceAttached: false,
  resendId: null,
  status: 'Completed / Sent Placeholder',
};

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
        createdTimestamp: '2026-07-22T12:00:00.000Z',
        subjectLine: 'Confirmed synthetic draft',
        reportText: 'Synthetic report',
        emailDraftText: 'Synthetic email',
        reviewStatus: 'confirmed',
        reviewedTimestamp: '2026-07-22T12:00:00.000Z',
        reviewedBy: 'Synthetic Reviewer',
      },
      {
        draftId: 'DRAFT-SYNTHETIC-3',
        createdTimestamp: '2026-07-22T12:05:00.000Z',
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
      createdTimestamp: '2026-08-07T11:00:00.000Z',
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

  it('strictly quarantines malformed schema-1 drafts instead of coercing their fields', () => {
    const malformedDrafts = [
      { ...currentDraft, draftId: 'DRAFT-SYNTHETIC-BAD-TYPE', workOrderNumber: {} },
      { ...currentDraft, draftId: 'DRAFT-SYNTHETIC-BAD-STATUS', status: 'Saved' },
      {
        ...currentDraft,
        draftId: 'DRAFT-SYNTHETIC-BAD-REVIEW',
        reviewStatus: 'confirmed',
        reviewedTimestamp: 'not-a-timestamp',
        reviewedBy: 'Synthetic reviewer',
      },
      { ...currentDraft, draftId: 'DRAFT-SYNTHETIC-BAD-EVIDENCE', evidenceFileSize: '2 KB' },
      { ...currentDraft, draftId: 'DRAFT-SYNTHETIC-BAD-TIMESTAMP', createdTimestamp: 'not-a-timestamp' },
    ];
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      recordType: 'drafts',
      records: [currentDraft, ...malformedDrafts],
    }));

    const snapshot = loadLocalRecordsFromStorage();

    expect(snapshot.draftRecords).toEqual([currentDraft]);
    expect(snapshot.recoveries).toContainEqual({
      collection: 'drafts',
      reason: 'malformed-records',
      rejectedRecordCount: malformedDrafts.length,
    });
  });

  it('strictly rejects invalid schema-1 history status and metadata', () => {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      recordType: 'history',
      records: [
        currentHistory,
        { ...currentHistory, historyId: 'HISTORY-SYNTHETIC-BAD-STATUS', status: 'Delivered' },
        { ...currentHistory, historyId: 'HISTORY-SYNTHETIC-BAD-RESEND', resendId: 7 },
      ],
    }));

    const snapshot = loadLocalRecordsFromStorage();

    expect(snapshot.historyRecords).toEqual([currentHistory]);
    expect(snapshot.recoveries).toContainEqual({
      collection: 'history',
      reason: 'malformed-records',
      rejectedRecordCount: 2,
    });
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
      createdTimestamp: '2026-08-07T11:05:00.000Z',
      subjectLine: 'Valid synthetic draft',
      reportText: 'Synthetic report',
      emailDraftText: 'Synthetic email',
    }, {
      draftId: 'DRAFT-SYNTHETIC-6',
      createdTimestamp: '2026-08-07T11:10:00.000Z',
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

  it('does not accept or persist new draft or history records while that collection is in recovery', () => {
    const malformedDraftSource = '{ malformed draft JSON';
    const malformedHistorySource = '{ malformed history JSON';
    storage.setItem(DRAFT_STORAGE_KEY, malformedDraftSource);
    storage.setItem(HISTORY_STORAGE_KEY, malformedHistorySource);
    const snapshot = loadLocalRecordsFromStorage();
    const draftsBefore = snapshot.draftRecords;
    const historyBefore = snapshot.historyRecords;

    const draftResult = persistNewDraftRecord(draftsBefore, currentDraft, snapshot.recoveries);
    const historyResult = persistNewHistoryRecord(historyBefore, currentHistory, snapshot.recoveries);

    expect(draftResult).toEqual({ persisted: false, records: draftsBefore });
    expect(historyResult).toEqual({ persisted: false, records: historyBefore });
    expect(storage.getItem(DRAFT_STORAGE_KEY)).toBe(malformedDraftSource);
    expect(storage.getItem(HISTORY_STORAGE_KEY)).toBe(malformedHistorySource);
  });

  it('creates collision-resistant record identifiers instead of using the collection length', () => {
    const firstId = createLocalRecordId('DRAFT');
    const secondId = createLocalRecordId('DRAFT');

    expect(firstId).toMatch(/^DRAFT-/);
    expect(secondId).toMatch(/^DRAFT-/);
    expect(secondId).not.toBe(firstId);
  });
});
