import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  importLocalRecordBackupToStorage,
  LOCAL_RECORD_BACKUP_FORMAT,
  previewLocalRecordBackup,
  serializeLocalRecordBackup,
} from '../features/woc/logic/localRecordBackup';
import {
  DRAFT_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  LOCAL_RECORD_SCHEMA_VERSION,
  clearLocalRecordsStorage,
  loadLocalRecordsFromStorage,
} from '../features/woc/logic/localRecordsStorage';
import type { DraftRecord, HistoryRecord } from '../features/woc/types/wocSessionTypes';

const syntheticDraft: DraftRecord = {
  schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
  draftId: 'DRAFT-SYNTHETIC-BACKUP-1',
  createdTimestamp: '2026-08-06T12:00:00.000Z',
  subjectLine: 'Synthetic backup draft',
  workOrderNumber: 'WO-SYNTHETIC-1',
  partNumber: 'PART-SYNTHETIC-1',
  affectedArea: 'Synthetic area',
  correctionType: 'Synthetic correction',
  reportText: 'Synthetic report text',
  emailDraftText: 'Synthetic email text',
  submittedBy: 'Synthetic submitter',
  submittedById: 'synthetic-id',
  reviewStatus: 'confirmed',
  reviewedTimestamp: '2026-08-06T12:00:00.000Z',
  reviewedBy: 'Synthetic reviewer',
  reviewedById: 'synthetic-reviewer-id',
  evidenceAttached: false,
  status: 'Draft',
};

const syntheticHistory: HistoryRecord = {
  schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
  historyId: 'HISTORY-SYNTHETIC-BACKUP-1',
  completedTimestamp: '2026-08-06T12:05:00.000Z',
  subjectLine: 'Synthetic backup history',
  workOrderNumber: 'WO-SYNTHETIC-2',
  partNumber: 'PART-SYNTHETIC-2',
  affectedArea: 'Synthetic area',
  correctionType: 'Synthetic correction',
  reportText: 'Synthetic history report',
  emailDraftText: 'Synthetic history email',
  submittedBy: 'Synthetic submitter',
  submittedById: 'synthetic-id',
  evidenceAttached: false,
  resendId: 'synthetic-resend-id',
  status: 'Sent',
};

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('browser-local record backups', () => {
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

  it('round-trips a versioned browser-local backup while preserving review and attribution fields', () => {
    const source = serializeLocalRecordBackup(
      [syntheticDraft],
      [syntheticHistory],
      '2026-08-06T13:00:00.000Z',
    );

    const parsed = JSON.parse(source);
    const preview = previewLocalRecordBackup(source, [], []);

    expect(parsed).toMatchObject({
      format: LOCAL_RECORD_BACKUP_FORMAT,
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      exportedAt: '2026-08-06T13:00:00.000Z',
    });
    expect(preview).toMatchObject({
      canImport: true,
      draftImportCount: 1,
      historyImportCount: 1,
      mergedDraftRecords: [syntheticDraft],
      mergedHistoryRecords: [syntheticHistory],
    });
  });

  it('merges duplicate IDs non-destructively and preserves the browser record already present', () => {
    const localDraft = { ...syntheticDraft, reportText: 'Browser record remains authoritative for this duplicate ID.' };
    const importedDraft = { ...syntheticDraft, reportText: 'Backup must not replace this browser record.' };
    const source = serializeLocalRecordBackup([importedDraft], [syntheticHistory], '2026-08-06T13:00:00.000Z');

    const preview = previewLocalRecordBackup(source, [localDraft], []);

    expect(preview).toMatchObject({
      canImport: true,
      draftImportCount: 0,
      historyImportCount: 1,
      duplicateDraftCount: 1,
      duplicateHistoryCount: 0,
    });
    expect(preview.mergedDraftRecords).toEqual([localDraft]);
    expect(preview.mergedHistoryRecords).toMatchObject([syntheticHistory]);
  });

  it('rejects an invalid backup without mutating the browser records selected for rollback', () => {
    const currentDrafts = [syntheticDraft];
    const currentHistory = [syntheticHistory];
    const malformedSource = JSON.stringify({
      format: LOCAL_RECORD_BACKUP_FORMAT,
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      exportedAt: '2026-08-06T13:00:00.000Z',
      records: { drafts: [{ draftId: 'DRAFT-SYNTHETIC-BROKEN' }], history: [] },
    });

    const preview = previewLocalRecordBackup(malformedSource, currentDrafts, currentHistory);

    expect(preview.canImport).toBe(false);
    expect(currentDrafts).toEqual([syntheticDraft]);
    expect(currentHistory).toEqual([syntheticHistory]);
  });

  it('rejects malformed schema-1 backup fields instead of coercing them', () => {
    const malformedRecordSets = [
      { drafts: [{ ...syntheticDraft, createdTimestamp: 123 }], history: [syntheticHistory] },
      { drafts: [{ ...syntheticDraft, workOrderNumber: {} }], history: [syntheticHistory] },
      {
        drafts: [{
          ...syntheticDraft,
          reviewedTimestamp: 'not-a-timestamp',
        }],
        history: [syntheticHistory],
      },
      { drafts: [{ ...syntheticDraft, evidenceFileSize: '2 KB' }], history: [syntheticHistory] },
      { drafts: [syntheticDraft], history: [{ ...syntheticHistory, status: 'Delivered' }] },
    ];

    for (const records of malformedRecordSets) {
      const source = JSON.stringify({
        format: LOCAL_RECORD_BACKUP_FORMAT,
        schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
        exportedAt: '2026-08-07T13:00:00.000Z',
        records,
      });

      expect(previewLocalRecordBackup(source, [], [])).toMatchObject({
        canImport: false,
        message: 'This backup contains malformed records and was not imported.',
      });
    }
  });

  it('preserves malformed raw storage during recovery and permits explicit clear then import', () => {
    const malformedDraftSource = '{ malformed draft JSON';
    storage.setItem(DRAFT_STORAGE_KEY, malformedDraftSource);
    const snapshot = loadLocalRecordsFromStorage();
    const source = serializeLocalRecordBackup(
      [syntheticDraft],
      [syntheticHistory],
      '2026-08-07T13:00:00.000Z',
    );

    const blockedResult = importLocalRecordBackupToStorage(
      source,
      snapshot.draftRecords,
      snapshot.historyRecords,
      snapshot.recoveries,
    );

    expect(blockedResult.imported).toBe(false);
    expect(blockedResult.preview.message).toContain('malformed source was left unchanged');
    expect(storage.getItem(DRAFT_STORAGE_KEY)).toBe(malformedDraftSource);
    expect(storage.getItem(HISTORY_STORAGE_KEY)).toBeNull();

    clearLocalRecordsStorage();
    const importedResult = importLocalRecordBackupToStorage(source, [], [], []);

    expect(importedResult.imported).toBe(true);
    expect(JSON.parse(storage.getItem(DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      recordType: 'drafts',
      records: [syntheticDraft],
    });
    expect(JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) ?? '{}')).toMatchObject({
      schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
      recordType: 'history',
      records: [syntheticHistory],
    });
  });
});
