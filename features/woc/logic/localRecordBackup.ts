import {
  LOCAL_RECORD_SCHEMA_VERSION,
  normalizeDraftRecord,
  normalizeHistoryRecord,
} from './localRecordsStorage';
import type { DraftRecord, HistoryRecord } from '../types/wocSessionTypes';

export const LOCAL_RECORD_BACKUP_FORMAT = 'ai-cas-browser-record-backup';
export const MAX_LOCAL_RECORD_BACKUP_BYTES = 1024 * 1024;

export type LocalRecordBackup = {
  format: typeof LOCAL_RECORD_BACKUP_FORMAT;
  schemaVersion: typeof LOCAL_RECORD_SCHEMA_VERSION;
  exportedAt: string;
  records: {
    drafts: DraftRecord[];
    history: HistoryRecord[];
  };
};

export type LocalRecordBackupPreview = {
  canImport: boolean;
  message: string;
  exportedAt: string | null;
  draftImportCount: number;
  historyImportCount: number;
  duplicateDraftCount: number;
  duplicateHistoryCount: number;
  mergedDraftRecords: DraftRecord[];
  mergedHistoryRecords: HistoryRecord[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidPreview(message: string): LocalRecordBackupPreview {
  return {
    canImport: false,
    message,
    exportedAt: null,
    draftImportCount: 0,
    historyImportCount: 0,
    duplicateDraftCount: 0,
    duplicateHistoryCount: 0,
    mergedDraftRecords: [],
    mergedHistoryRecords: [],
  };
}

function mergeNonDestructively<T>(
  incoming: T[],
  existing: T[],
  recordId: (record: T) => string,
) {
  const knownIds = new Set(existing.map(recordId));
  const accepted: T[] = [];
  let duplicateCount = 0;

  incoming.forEach((record) => {
    const id = recordId(record);
    if (knownIds.has(id)) {
      duplicateCount += 1;
      return;
    }

    knownIds.add(id);
    accepted.push(record);
  });

  return {
    records: [...accepted, ...existing],
    importedCount: accepted.length,
    duplicateCount,
  };
}

export function createLocalRecordBackup(
  draftRecords: DraftRecord[],
  historyRecords: HistoryRecord[],
  exportedAt = new Date().toISOString(),
): LocalRecordBackup {
  return {
    format: LOCAL_RECORD_BACKUP_FORMAT,
    schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
    exportedAt,
    records: {
      drafts: draftRecords,
      history: historyRecords,
    },
  };
}

export function serializeLocalRecordBackup(
  draftRecords: DraftRecord[],
  historyRecords: HistoryRecord[],
  exportedAt?: string,
) {
  return JSON.stringify(createLocalRecordBackup(draftRecords, historyRecords, exportedAt));
}

export function previewLocalRecordBackup(
  source: string,
  currentDraftRecords: DraftRecord[],
  currentHistoryRecords: HistoryRecord[],
): LocalRecordBackupPreview {
  if (source.length > MAX_LOCAL_RECORD_BACKUP_BYTES) {
    return invalidPreview('This backup exceeds the 1 MB browser-local import limit.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return invalidPreview('This file is not valid JSON and was not imported.');
  }

  if (!isObject(parsed) || !isObject(parsed.records)) {
    return invalidPreview('This file is not an AI-CAS browser-local backup.');
  }

  if (
    parsed.format !== LOCAL_RECORD_BACKUP_FORMAT
    || parsed.schemaVersion !== LOCAL_RECORD_SCHEMA_VERSION
    || typeof parsed.exportedAt !== 'string'
    || Number.isNaN(Date.parse(parsed.exportedAt))
    || !Array.isArray(parsed.records.drafts)
    || !Array.isArray(parsed.records.history)
  ) {
    return invalidPreview('This backup does not match the supported local record schema.');
  }

  const normalizedDraftRecords = parsed.records.drafts.map(normalizeDraftRecord);
  const normalizedHistoryRecords = parsed.records.history.map(normalizeHistoryRecord);
  if (normalizedDraftRecords.some((record) => !record) || normalizedHistoryRecords.some((record) => !record)) {
    return invalidPreview('This backup contains malformed records and was not imported.');
  }

  const draftRecords = normalizedDraftRecords.filter((record): record is DraftRecord => Boolean(record));
  const historyRecords = normalizedHistoryRecords.filter((record): record is HistoryRecord => Boolean(record));

  const mergedDrafts = mergeNonDestructively(
    draftRecords,
    currentDraftRecords,
    (record) => record.draftId,
  );
  const mergedHistory = mergeNonDestructively(
    historyRecords,
    currentHistoryRecords,
    (record) => record.historyId,
  );

  return {
    canImport: true,
    message: 'Preview ready. Confirm import to add only records that are not already in this browser.',
    exportedAt: parsed.exportedAt,
    draftImportCount: mergedDrafts.importedCount,
    historyImportCount: mergedHistory.importedCount,
    duplicateDraftCount: mergedDrafts.duplicateCount,
    duplicateHistoryCount: mergedHistory.duplicateCount,
    mergedDraftRecords: mergedDrafts.records,
    mergedHistoryRecords: mergedHistory.records,
  };
}
