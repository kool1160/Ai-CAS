export type Screen = 'home' | 'capture' | 'confirm' | 'generate' | 'review' | 'drafts' | 'history' | 'more';

export type NavItem = {
  label: string;
  screen: Screen;
};

export type WorkflowStep = [string, string, string];

export type ActionFeedback = {
  tone: 'success' | 'error';
  message: string;
} | null;

export type CurrentUser = {
  userId: string;
  displayName: string;
  emailOrEmployeeId: string;
  appUnlockPin: string;
  loginTimestamp: string;
};

export type UploadedFileInfo = {
  name: string;
  type: string;
  size: number;
  previewUrl: string | null;
  isImage: boolean;
};

export type PhotoEvidenceRecordMetadata = {
  evidenceAttached: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
};

export type ExtractedWorkOrderData = {
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  partDescription?: string;
  customerOrJob?: string;
  operationNumber?: string;
  routerStepOperation?: string;
  quantity?: string;
  quantityAffected?: string;
  dueDateShipDate?: string;
  nextOperation?: string;
  inspectionOperation?: string;
  material?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  notes?: string;
  fieldSourceNotes?: Record<string, string>;
};

export type ExtractionDebugMetadata = {
  extractionSource: string;
  extractedKeys: string[];
  missingExpectedFields: string[];
  fieldSourceNotes: Record<string, string>;
} | null;

export type SetupConfig = {
  companyName: string;
  engineeringRecipientEmail: string;
  senderDisplayName: string;
  defaultSubmittedByName: string;
  defaultSubmittedByEmail: string;
};

export type DraftRecord = {
  schemaVersion: number;
  draftId: string;
  createdTimestamp: string;
  subjectLine: string;
  workOrderNumber: string;
  partNumber: string;
  affectedArea: string;
  correctionType: string;
  reportText: string;
  emailDraftText: string;
  submittedBy?: string;
  submittedById?: string;
  reviewStatus: 'confirmed' | 'legacy-unconfirmed';
  reviewedTimestamp?: string;
  reviewedBy?: string;
  reviewedById?: string;
  evidenceAttached?: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
  status: 'Draft';
};

export type HistoryRecord = {
  schemaVersion: number;
  historyId: string;
  completedTimestamp: string;
  subjectLine: string;
  workOrderNumber: string;
  partNumber: string;
  affectedArea: string;
  correctionType: string;
  reportText: string;
  emailDraftText: string;
  submittedBy?: string;
  submittedById?: string;
  evidenceAttached?: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
  resendId?: string | null;
  status: 'Completed / Sent Placeholder' | 'Sent';
};
