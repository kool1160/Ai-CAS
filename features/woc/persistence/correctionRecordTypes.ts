export const CORRECTION_RECORD_SOURCE = 'Refab Connect / AI-WOC';
export const CORRECTION_RECORD_SCHEMA_VERSION = 'M17-backend-ready-v1';

export type CorrectionRecordType = 'Draft' | 'Sent' | 'History';

export type CorrectionRecordStatus = 'Draft' | 'Sent' | 'Completed / Sent Placeholder';

export type CorrectionRecordSubmittedBy = {
  userId: string;
  displayName: string;
  emailOrEmployeeId: string;
};

export type BackendReadyCorrectionRecord = {
  recordId: string;
  recordType: CorrectionRecordType;
  status: CorrectionRecordStatus;
  createdTimestamp: string;
  updatedTimestamp: string;
  submittedBy: CorrectionRecordSubmittedBy;
  workOrderNumber: string;
  partNumber: string;
  revision: string;
  customerOrJob: string;
  quantity: string;
  affectedArea: string;
  correctionType: string;
  issueSummary: string;
  requestedEngineeringAction: string;
  subjectLine: string;
  reportText: string;
  emailDraftText: string;
  resendId: string | null;
  source: typeof CORRECTION_RECORD_SOURCE;
  schemaVersion: typeof CORRECTION_RECORD_SCHEMA_VERSION;
};

export type CorrectionRecordStoreSnapshot = {
  drafts: BackendReadyCorrectionRecord[];
  history: BackendReadyCorrectionRecord[];
};
