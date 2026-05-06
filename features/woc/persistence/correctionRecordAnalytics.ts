import type { DraftRecord, HistoryRecord } from '../types/wocSessionTypes';
import {
  draftsToBackendReadyCorrectionRecords,
  historyToBackendReadyCorrectionRecords,
} from './correctionRecordAdapter';
import type { BackendReadyCorrectionRecord } from './correctionRecordTypes';

export type AnalyticsCountItem = {
  label: string;
  count: number;
};

export type LocalEngineeringAnalyticsSummary = {
  totalRecords: number;
  draftCount: number;
  historyCount: number;
  evidenceAttachedCount: number;
  evidenceMissingCount: number;
  byCorrectionType: AnalyticsCountItem[];
  byAffectedArea: AnalyticsCountItem[];
  repeatedPartNumbers: AnalyticsCountItem[];
  repeatedWorkOrderNumbers: AnalyticsCountItem[];
  submittedBySummary: AnalyticsCountItem[];
  recentRecords: BackendReadyCorrectionRecord[];
};

function countBy(records: BackendReadyCorrectionRecord[], getValue: (record: BackendReadyCorrectionRecord) => string) {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    const value = getValue(record).trim() || 'Not provided';
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function mostRepeated(records: BackendReadyCorrectionRecord[], getValue: (record: BackendReadyCorrectionRecord) => string) {
  return countBy(records, getValue)
    .filter((item) => item.label !== 'Not provided' && item.count > 1)
    .slice(0, 5);
}

function timestampValue(record: BackendReadyCorrectionRecord) {
  const parsed = Date.parse(record.updatedTimestamp || record.createdTimestamp);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildLocalEngineeringAnalyticsSummary(
  draftRecords: DraftRecord[],
  historyRecords: HistoryRecord[],
): LocalEngineeringAnalyticsSummary {
  const draftBackendRecords = draftsToBackendReadyCorrectionRecords(draftRecords);
  const historyBackendRecords = historyToBackendReadyCorrectionRecords(historyRecords);
  const records = [...draftBackendRecords, ...historyBackendRecords];
  const evidenceAttachedCount = records.filter((record) => record.evidence.evidenceAttached).length;

  return {
    totalRecords: records.length,
    draftCount: draftRecords.length,
    historyCount: historyRecords.length,
    evidenceAttachedCount,
    evidenceMissingCount: records.length - evidenceAttachedCount,
    byCorrectionType: countBy(records, (record) => record.correctionType),
    byAffectedArea: countBy(records, (record) => record.affectedArea),
    repeatedPartNumbers: mostRepeated(records, (record) => record.partNumber),
    repeatedWorkOrderNumbers: mostRepeated(records, (record) => record.workOrderNumber),
    submittedBySummary: countBy(records, (record) => record.submittedBy.displayName || record.submittedBy.emailOrEmployeeId),
    recentRecords: [...records].sort((a, b) => timestampValue(b) - timestampValue(a)).slice(0, 5),
  };
}
