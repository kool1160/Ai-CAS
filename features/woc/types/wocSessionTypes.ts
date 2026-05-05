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
  status: 'Completed / Sent Placeholder';
};
