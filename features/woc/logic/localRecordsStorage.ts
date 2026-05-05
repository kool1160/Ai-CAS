import type { DraftRecord, HistoryRecord } from '../types/wocSessionTypes';

export const DRAFT_STORAGE_KEY = 'refab-connect-drafts';
export const HISTORY_STORAGE_KEY = 'refab-connect-history';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function sanitizeDraftRecord(value: unknown): DraftRecord | null {
  if (!isObject(value)) return null;

  const draftId = stringValue(value.draftId);
  const subjectLine = stringValue(value.subjectLine);
  const reportText = stringValue(value.reportText);
  const emailDraftText = stringValue(value.emailDraftText);

  if (!draftId || !subjectLine || !reportText || !emailDraftText) return null;

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
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(records));
}

export function saveHistoryRecordsToStorage(records: HistoryRecord[]) {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
}

export function clearLocalRecordsStorage() {
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}
