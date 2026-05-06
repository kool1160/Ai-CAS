import { prepareEvidenceAttachment } from '../logic/evidenceAttachmentPreparation';
import type { DraftRecord, HistoryRecord } from '../types/wocSessionTypes';
import {
  CORRECTION_RECORD_SCHEMA_VERSION,
  CORRECTION_RECORD_SOURCE,
  type BackendReadyCorrectionRecord,
  type CorrectionRecordEvidence,
  type CorrectionRecordSubmittedBy,
} from './correctionRecordTypes';

type BackendReadyBaseFields = Pick<
  BackendReadyCorrectionRecord,
  | 'workOrderNumber'
  | 'partNumber'
  | 'revision'
  | 'customerOrJob'
  | 'quantity'
  | 'affectedArea'
  | 'correctionType'
  | 'issueSummary'
  | 'requestedEngineeringAction'
  | 'subjectLine'
  | 'reportText'
  | 'emailDraftText'
  | 'evidence'
  | 'source'
  | 'schemaVersion'
>;

function getReportValue(reportText: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escapedLabel}:\\s*(.+)$`, 'im');
  const match = reportText.match(pattern);
  return match?.[1]?.trim() ?? '';
}

function parseSubmittedBy(submittedBy?: string, submittedById?: string): CorrectionRecordSubmittedBy {
  const fallbackName = submittedBy?.trim() || 'Unknown local user';
  const match = fallbackName.match(/^(.*?)\s*\((.*?)\)$/);

  return {
    userId: submittedById?.trim() || '',
    displayName: match?.[1]?.trim() || fallbackName,
    emailOrEmployeeId: match?.[2]?.trim() || '',
  };
}

function parseEvidenceSize(value: string) {
  const trimmed = value.trim().toUpperCase();
  const amount = Number.parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount)) return 0;
  if (trimmed.includes('MB')) return Math.round(amount * 1024 * 1024);
  if (trimmed.includes('KB')) return Math.round(amount * 1024);
  return Math.round(amount);
}

function evidenceFields(record: DraftRecord | HistoryRecord): CorrectionRecordEvidence {
  if (typeof record.evidenceAttached === 'boolean') {
    const prepared = prepareEvidenceAttachment({
      evidenceAttached: record.evidenceAttached,
      evidenceFileName: record.evidenceFileName?.trim() || '',
      evidenceFileType: record.evidenceFileType?.trim() || '',
      evidenceFileSize: typeof record.evidenceFileSize === 'number' ? record.evidenceFileSize : 0,
    });

    return prepared;
  }

  const attachedMatch = record.reportText.match(/Photo evidence attached:\s*(.+?)\s*\((.*?),\s*(.*?)\)\./i);
  if (!attachedMatch) {
    return prepareEvidenceAttachment({ evidenceAttached: false });
  }

  return prepareEvidenceAttachment({
    evidenceAttached: true,
    evidenceFileName: attachedMatch[1]?.trim() || '',
    evidenceFileType: attachedMatch[2]?.trim() || '',
    evidenceFileSize: parseEvidenceSize(attachedMatch[3] ?? ''),
  });
}

function baseRecordFields(record: DraftRecord | HistoryRecord): BackendReadyBaseFields {
  return {
    workOrderNumber: record.workOrderNumber,
    partNumber: record.partNumber,
    revision: getReportValue(record.reportText, 'Revision'),
    customerOrJob: getReportValue(record.reportText, 'Customer / Job'),
    quantity: getReportValue(record.reportText, 'Quantity'),
    affectedArea: record.affectedArea,
    correctionType: record.correctionType,
    issueSummary: getReportValue(record.reportText, 'Issue Summary'),
    requestedEngineeringAction: getReportValue(record.reportText, 'Requested Engineering Action'),
    subjectLine: record.subjectLine,
    reportText: record.reportText,
    emailDraftText: record.emailDraftText,
    evidence: evidenceFields(record),
    source: CORRECTION_RECORD_SOURCE,
    schemaVersion: CORRECTION_RECORD_SCHEMA_VERSION,
  };
}

export function draftToBackendReadyCorrectionRecord(record: DraftRecord): BackendReadyCorrectionRecord {
  return {
    recordId: record.draftId,
    recordType: 'Draft',
    status: 'Draft',
    createdTimestamp: record.createdTimestamp,
    updatedTimestamp: record.createdTimestamp,
    submittedBy: parseSubmittedBy(record.submittedBy, record.submittedById),
    resendId: null,
    ...baseRecordFields(record),
  };
}

export function historyToBackendReadyCorrectionRecord(record: HistoryRecord): BackendReadyCorrectionRecord {
  return {
    recordId: record.historyId,
    recordType: record.status === 'Sent' ? 'Sent' : 'History',
    status: record.status,
    createdTimestamp: record.completedTimestamp,
    updatedTimestamp: record.completedTimestamp,
    submittedBy: parseSubmittedBy(record.submittedBy, record.submittedById),
    resendId: record.resendId ?? null,
    ...baseRecordFields(record),
  };
}

export function draftsToBackendReadyCorrectionRecords(records: DraftRecord[]) {
  return records.map(draftToBackendReadyCorrectionRecord);
}

export function historyToBackendReadyCorrectionRecords(records: HistoryRecord[]) {
  return records.map(historyToBackendReadyCorrectionRecord);
}
