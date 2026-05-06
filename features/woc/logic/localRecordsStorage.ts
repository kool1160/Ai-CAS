import type { DraftRecord, HistoryRecord, PhotoEvidenceRecordMetadata } from '../types/wocSessionTypes';

export const DRAFT_STORAGE_KEY = 'refab-connect-drafts';
export const HISTORY_STORAGE_KEY = 'refab-connect-history';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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
    evidenceAttached: record.evidenceAttached ?? metadata.evidenceAttached,
    evidenceFileName: record.evidenceFileName ?? metadata.evidenceFileName,
    evidenceFileType: record.evidenceFileType ?? metadata.evidenceFileType,
    evidenceFileSize: record.evidenceFileSize ?? metadata.evidenceFileSize,
  };
}

function sanitizeDraftRecord(value: unknown): DraftRecord | null {
  if (!isObject(value)) return null;

  const draftId = stringValue(value.draftId);
  const subjectLine = stringValue(value.subjectLine);
  const reportText = stringValue(value.reportText);
  const emailDraftText = stringValue(value.emailDraftText);

  if (!draftId || !subjectLine || !reportText || !emailDraftText) return null;

  const evidenceMetadata = evidenceMetadataFromRecord(value, reportText);

  return {
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
    ...evidenceMetadata,
    status: 'Draft',
  };
}

function sanitizeHistoryRecord(value: unknown): HistoryRecord | null {
  if (!isObject(value)) return null;

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

function readJsonArray(key: string): unknown[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadDraftRecordsFromStorage() {
  return readJsonArray(DRAFT_STORAGE_KEY)
    .map(sanitizeDraftRecord)
    .filter((record): record is DraftRecord => Boolean(record));
}

export function loadHistoryRecordsFromStorage() {
  return readJsonArray(HISTORY_STORAGE_KEY)
    .map(sanitizeHistoryRecord)
    .filter((record): record is HistoryRecord => Boolean(record));
}

export function saveDraftRecordsToStorage(records: DraftRecord[]) {
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(records.map(addEvidenceMetadata)));
}

export function saveHistoryRecordsToStorage(records: HistoryRecord[]) {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records.map(addEvidenceMetadata)));
}

export function clearLocalRecordsStorage() {
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}
