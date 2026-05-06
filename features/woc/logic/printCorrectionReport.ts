export type PrintCorrectionReportInput = {
  subjectLine?: string;
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  customerOrJob?: string;
  quantity?: string;
  affectedArea?: string;
  correctionType?: string;
  photoEvidenceStatus?: string;
  submittedBy?: string;
  status?: string;
  generatedTimestamp?: string;
  reportText: string;
};

export const PRINT_REPORT_STORAGE_KEY = 'refab-connect-print-report';

export function printCorrectionReport(report: PrintCorrectionReportInput) {
  window.sessionStorage.setItem(PRINT_REPORT_STORAGE_KEY, JSON.stringify(report));
  window.location.href = '/print-report';
}
