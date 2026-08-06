import type { DraftRecord, HistoryRecord, PhotoEvidenceRecordMetadata } from '../types/wocSessionTypes';
import { sanitizeReviewMetadata } from '../state/reviewGate';

export const DRAFT_STORAGE_KEY = 'refab-connect-drafts';
export const HISTORY_STORAGE_KEY = 'refab-connect-history';
export const LOCAL_RECORD_SCHEMA_VERSION = 1;

type LocalRecordCollection = 'drafts' | 'history';

type LocalRecordsEnvelope = {
  schemaVersion: typeof LOCAL_RECORD_SCHEMA_VERSION;
  recordType: LocalRecordCollection;
  records: unknown[];
};

export type LocalRecordsRecovery = {
  collection: LocalRecordCollection;
  reason: 'malformed-json' | 'unsupported-schema' | 'malformed-records';
  rejectedRecordCount: number;
};

export type LocalRecordsLoadSnapshot = {
  draftRecords: DraftRecord[];
  historyRecords: HistoryRecord[];
  recoveries: LocalRecordsRecovery[];
};

type CollectionLoadResult<T> = {
  records: T[];
  recovery: LocalRecordsRecovery | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseEvidenceSize(value: string) {
  const trimmed = value.trim().toUpperCase();
  const amount = Number.parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount)) return 0;
  if (trimmed.includes('MB')) return Math.round(amount * 1024 * 1024);
  if (trimmed.includes('KB')) return Math.round(amount * 1024);
  return Math.round(amount);
}

export function extractEvidenceMetadataFromReportText(reportText: string): PhotoEvidenceRecordMetadata {
  const attachedMatch = reportText.match(/Photo evidence attached:\s*(.+?)\s*\((.*?),\s*(.*?)\)\./i);

  if (!attachedMatch) {
    return { evidenceAttached: false };
  }

  return {
    evidenceAttached: true,
    evidenceFileName: attachedMatch[1]?.trim() || '',
    evidenceFileType: attachedMatch[2]?.trim() || '',
    evidenceFileSize: parseEvidenceSize(attachedMatch[3] ?? ''),
  };
}

function evidenceMetadataFromRecord(value: Record<string, unknown>, reportText: string): PhotoEvidenceRecordMetadata {
  if (typeof value.evidenceAttached === 'boolean') {
    return {
      evidenceAttached: value.evidenceAttached,
      evidenceFileName: stringValue(value.evidenceFileName),
      evidenceFileType: stringValue(value.evidenceFileType),
      evidenceFileSize: numberValue(value.evidenceFileSize),
    };
  }

  return extractEvidenceMetadataFromReportText(reportText);
}

function addEvidenceMetadata<T extends DraftRecord | HistoryRecord>(record: T): T {
  const metadata = extractEvidenceMetadataFromReportText(record.reportText);

  return {
    ...record,
    schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
    evidenceAttached: record.evidenceAttached ?? metadata.evidenceAttached,
    evidenceFileName: record.evidenceFileName ?? metadata.evidenceFileName,
    evidenceFileType: record.evidenceFileType ?? metadata.evidenceFileType,
    evidenceFileSize: record.evidenceFileSize ?? metadata.evidenceFileSize,
  };
}

export function normalizeDraftRecord(value: unknown): DraftRecord | null {
  if (!isObject(value)) return null;
  if (value.schemaVersion !== undefined && value.schemaVersion !== LOCAL_RECORD_SCHEMA_VERSION) return null;

  const draftId = stringValue(value.draftId);
  const subjectLine = stringValue(value.subjectLine);
  const reportText = stringValue(value.reportText);
  const emailDraftText = stringValue(value.emailDraftText);

  if (!draftId || !subjectLine || !reportText || !emailDraftText) return null;

  const evidenceMetadata = evidenceMetadataFromRecord(value, reportText);
  const reviewMetadata = sanitizeReviewMetadata(value);

  return {
    schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
    draftId,
    createdTimestamp: stringValue(value.createdTimestamp),
    subjectLine,
    workOrderNumber: stringValue(value.workOrderNumber),
    partNumber: stringValue(value.partNumber),
    affectedArea: stringValue(value.affectedArea),
    correctionType: stringValue(value.correctionType),
    reportText,
    emailDraftText,
    submittedBy: stringValue(value.submittedBy),
    submittedById: stringValue(value.submittedById),
    ...reviewMetadata,
    ...evidenceMetadata,
    status: 'Draft',
  };
}

export function normalizeHistoryRecord(value: unknown): HistoryRecord | null {
  if (!isObject(value)) return null;
  if (value.schemaVersion !== undefined && value.schemaVersion !== LOCAL_RECORD_SCHEMA_VERSION) return null;

  const historyId = stringValue(value.historyId);
  const subjectLine = stringValue(value.subjectLine);
  const reportText = stringValue(value.reportText);
  const emailDraftText = stringValue(value.emailDraftText);

  if (!historyId || !subjectLine || !reportText || !emailDraftText) return null;

  const rawStatus = stringValue(value.status);
  const status: HistoryRecord['status'] = rawStatus === 'Sent' ? 'Sent' : 'Completed / Sent Placeholder';
  const resendId = typeof value.resendId === 'string' ? value.resendId : null;
  const evidenceMetadata = evidenceMetadataFromRecord(value, reportText);

  return {
    schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
    historyId,
    completedTimestamp: stringValue(value.completedTimestamp),
    subjectLine,
    workOrderNumber: stringValue(value.workOrderNumber),
    partNumber: stringValue(value.partNumber),
    affectedArea: stringValue(value.affectedArea),
    correctionType: stringValue(value.correctionType),
    reportText,
    emailDraftText,
    submittedBy: stringValue(value.submittedBy),
    submittedById: stringValue(value.submittedById),
    ...evidenceMetadata,
    resendId,
    status,
  };
}

function getStoredRecords(value: unknown, collection: LocalRecordCollection): unknown[] | null {
  if (Array.isArray(value)) return value;

  if (!isObject(value)) return null;

  const envelope = value as Partial<LocalRecordsEnvelope>;
  if (
    envelope.schemaVersion !== LOCAL_RECORD_SCHEMA_VERSION
    || envelope.recordType !== collection
    || !Array.isArray(envelope.records)
  ) {
    return null;
  }

  return envelope.records;
}

function readCollection<T>(
  key: string,
  collection: LocalRecordCollection,
  normalizeRecord: (value: unknown) => T | null,
): CollectionLoadResult<T> {
  const raw = window.localStorage.getItem(key);
  if (!raw) return { records: [], recovery: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      records: [],
      recovery: { collection, reason: 'malformed-json', rejectedRecordCount: 0 },
    };
  }

  const storedRecords = getStoredRecords(parsed, collection);
  if (!storedRecords) {
    return {
      records: [],
      recovery: { collection, reason: 'unsupported-schema', rejectedRecordCount: 0 },
    };
  }

  const records = storedRecords
    .map(normalizeRecord)
    .filter((record): record is T => Boolean(record));
  const rejectedRecordCount = storedRecords.length - records.length;

  return {
    records,
    recovery: rejectedRecordCount > 0
      ? { collection, reason: 'malformed-records', rejectedRecordCount }
      : null,
  };
}

function saveCollection<T extends DraftRecord | HistoryRecord>(
  key: string,
  collection: LocalRecordCollection,
  records: T[],
) {
  const envelope: LocalRecordsEnvelope = {
    schemaVersion: LOCAL_RECORD_SCHEMA_VERSION,
    recordType: collection,
    records: records.map(addEvidenceMetadata),
  };
  window.localStorage.setItem(key, JSON.stringify(envelope));
}

export function loadLocalRecordsFromStorage(): LocalRecordsLoadSnapshot {
  const drafts = readCollection(DRAFT_STORAGE_KEY, 'drafts', normalizeDraftRecord);
  const history = readCollection(HISTORY_STORAGE_KEY, 'history', normalizeHistoryRecord);

  return {
    draftRecords: drafts.records,
    historyRecords: history.records,
    recoveries: [drafts.recovery, history.recovery].filter((recovery): recovery is LocalRecordsRecovery => Boolean(recovery)),
  };
}

export function loadDraftRecordsFromStorage() {
  return readCollection(DRAFT_STORAGE_KEY, 'drafts', normalizeDraftRecord).records;
}

export function loadHistoryRecordsFromStorage() {
  return readCollection(HISTORY_STORAGE_KEY, 'history', normalizeHistoryRecord).records;
}

export function saveDraftRecordsToStorage(records: DraftRecord[]) {
  saveCollection(DRAFT_STORAGE_KEY, 'drafts', records);
}

export function saveHistoryRecordsToStorage(records: HistoryRecord[]) {
  saveCollection(HISTORY_STORAGE_KEY, 'history', records);
}

export function createLocalRecordId(prefix: 'DRAFT' | 'HISTORY') {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  const randomPart = Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
}

export function clearLocalRecordsStorage() {
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}
