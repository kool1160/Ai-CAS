import type { DraftRecord, HistoryRecord } from '../types/wocSessionTypes';
import {
  CORRECTION_RECORD_SCHEMA_VERSION,
  CORRECTION_RECORD_SOURCE,
  type BackendReadyCorrectionRecord,
  type CorrectionRecordSubmittedBy,
} from './correctionRecordTypes';

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

function baseRecordFields(record: DraftRecord | HistoryRecord) {
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
