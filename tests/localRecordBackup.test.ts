import { describe, expect, it } from 'vitest';
import {
  LOCAL_RECORD_BACKUP_FORMAT,
  previewLocalRecordBackup,
  serializeLocalRecordBackup,
} from '../features/woc/logic/localRecordBackup';
import { LOCAL_RECORD_SCHEMA_VERSION } from '../features/woc/logic/localRecordsStorage';
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

describe('browser-local record backups', () => {
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
});
