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

export type UploadedFileInfo = {
  name: string;
  type: string;
  size: number;
  previewUrl: string | null;
  isImage: boolean;
};

export type ExtractedWorkOrderData = {
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  customerOrJob?: string;
  quantity?: string;
  notes?: string;
};

export type DraftRecord = {
  draftId: string;
  createdTimestamp: string;
  subjectLine: string;
  workOrderNumber: string;
  partNumber: string;
  affectedArea: string;
  correctionType: string;
  reportText: string;
  emailDraftText: string;
  status: 'Draft';
};

export type HistoryRecord = {
  historyId: string;
  completedTimestamp: string;
  subjectLine: string;
  workOrderNumber: string;
  partNumber: string;
  affectedArea: string;
  correctionType: string;
  reportText: string;
  emailDraftText: string;
  resendId?: string | null;
  status: 'Completed / Sent Placeholder' | 'Sent';
};
