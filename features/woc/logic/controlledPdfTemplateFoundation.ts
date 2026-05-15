import type { StructuredCorrectiveActionDraft } from './aiCorrectiveActionDraftFoundation';

export type ControlledPdfTemplateStatus = 'foundation-only' | 'locked-until-controlled-release';

export type ControlledPdfEvidenceItem = {
  id: string;
  label: string;
  caption: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type ControlledPdfTemplateInput = {
  workOrderNumber?: string;
  partNumber?: string;
  partDescription?: string;
  customerOrJob?: string;
  quantity?: string;
  quantityAffected?: string;
  correctionType?: string;
  affectedArea?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  shortIssueDescription?: string;
  issueDetails?: string;
  immediateContainment?: string;
  requiredCorrection?: string;
  requestedEngineeringAction?: string;
  preventionStandardWorkUpdate?: string;
  inspectionVerificationRequirement?: string;
  releaseApprovalRequirement?: string;
  routerWorkOrderPhotoPlaceholder?: string;
  partDefectPhotoPlaceholder?: string;
  aiExtractedDataConfirmation?: string;
  humanReleaseConfirmation?: string;
  structuredDraft?: StructuredCorrectiveActionDraft | null;
  evidenceItems?: ControlledPdfEvidenceItem[];
};

export type ControlledPdfTemplateConfirmationInput = {
  finalReviewConfirmed?: boolean;
};

export type ControlledPdfTemplateField = {
  label: string;
  value: string;
  required: boolean;
};

export type ControlledPdfTemplateSection = {
  sectionId: string;
  title: string;
  layoutHint: 'header' | 'two-column-table' | 'full-width-text' | 'photo-evidence-grid' | 'approval-status';
  fields: ControlledPdfTemplateField[];
};

export type ControlledCorrectiveActionPdfTemplate = {
  templateName: string;
  templateVersion: string;
  modelSource: string;
  status: ControlledPdfTemplateStatus;
  releaseGate: string;
  layoutNotes: string[];
  sections: ControlledPdfTemplateSection[];
};

const manualBlank = (label: string, value?: string) => {
  const normalized = value?.trim() ?? '';
  return normalized || `[Manual entry needed: ${label}]`;
};

const issueSummary = (data: ControlledPdfTemplateInput) => data.shortIssueDescription || data.issueDetails;
const requiredCorrection = (data: ControlledPdfTemplateInput) => data.requiredCorrection || data.requestedEngineeringAction;

function formatEvidenceFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function buildStructuredDraftSection(data: ControlledPdfTemplateInput): ControlledPdfTemplateSection | null {
  if (!data.structuredDraft) return null;

  const fields = Object.values(data.structuredDraft.sections).map((section) => ({
    label: section.title,
    value: section.draftText.trim() || `[Manual review needed: ${section.title}]`,
    required: true,
  }));

  return {
    sectionId: 'structured-corrective-action-draft',
    title: 'Structured Corrective Action Draft Sections',
    layoutHint: 'full-width-text',
    fields,
  };
}

function buildPhotoEvidenceFields(data: ControlledPdfTemplateInput) {
  const evidenceItems = data.evidenceItems ?? [];

  if (!evidenceItems.length) {
    return [
      { label: 'Router / Work Order Photo', value: manualBlank('Router / Work Order Photo', data.routerWorkOrderPhotoPlaceholder), required: false },
      { label: 'Part / Defect Photo', value: manualBlank('Part / Defect Photo', data.partDefectPhotoPlaceholder), required: false },
      { label: 'Evidence Note', value: 'No Review-step photo evidence attached yet. Export remains disabled.', required: false },
    ];
  }

  return evidenceItems.map((item, index) => ({
    label: `Evidence Photo ${index + 1}`,
    value: [
      `Label: ${manualBlank('Evidence Label', item.label)}`,
      `Caption / Note: ${manualBlank('Caption / Note', item.caption)}`,
      `File: ${manualBlank('File Name', item.fileName)}`,
      `Type: ${item.fileType || 'Unknown type'}`,
      `Size: ${formatEvidenceFileSize(item.fileSize)}`,
    ].join('\n'),
    required: false,
  }));
}

export function buildControlledCorrectiveActionPdfTemplate(
  data: ControlledPdfTemplateInput,
  confirmations: ControlledPdfTemplateConfirmationInput = {},
): ControlledCorrectiveActionPdfTemplate {
  const humanConfirmed = Boolean(confirmations.finalReviewConfirmed);
  const structuredDraftSection = buildStructuredDraftSection(data);

  return {
    templateName: 'AI-CAS Controlled Corrective Action PDF',
    templateVersion: 'V4-M13C-preview-foundation',
    modelSource: 'WO 008604 corrective action style model',
    status: humanConfirmed ? 'locked-until-controlled-release' : 'foundation-only',
    releaseGate: 'PDF/export is disabled until future controlled release milestone. Human confirmation remains required.',
    layoutNotes: [
      'Use a clean shop-floor corrective action sheet structure modeled after WO 008604.',
      'Prioritize readable header fields, boxed problem/correction sections, evidence placeholders, and approval status.',
      'This file defines template data only; it does not generate, download, print, email, or release a PDF.',
      'Future PDF generation must consume this template only after the controlled release gate is implemented.',
      'V4-M13C preview includes structured draft sections and Review-step evidence metadata only.',
    ],
    sections: [
      {
        sectionId: 'header-title',
        title: 'Header / Corrective Action Title',
        layoutHint: 'header',
        fields: [
          { label: 'Corrective Action Title', value: manualBlank('Corrective Action Title', data.correctionType), required: true },
          { label: 'Template Status', value: 'Controlled PDF preview only — export disabled', required: true },
          { label: 'Human Confirmation Status', value: humanConfirmed ? 'Human final review confirmed' : 'Human final review not confirmed', required: true },
        ],
      },
      {
        sectionId: 'job-router-data',
        title: 'Job / Router Data',
        layoutHint: 'two-column-table',
        fields: [
          { label: 'Work Order', value: manualBlank('Work Order', data.workOrderNumber), required: true },
          { label: 'Part Number', value: manualBlank('Part Number', data.partNumber), required: true },
          { label: 'Part Description', value: manualBlank('Part Description', data.partDescription), required: false },
          { label: 'Customer / Job Name', value: manualBlank('Customer / Job Name', data.customerOrJob), required: false },
          { label: 'Quantity Affected', value: manualBlank('Quantity Affected', data.quantityAffected || data.quantity), required: false },
          { label: 'Found At Department', value: manualBlank('Found At Department', data.foundAtDepartment || data.affectedArea), required: true },
          { label: 'Suspected Failure Point', value: manualBlank('Suspected Failure Point', data.suspectedFailurePoint), required: true },
        ],
      },
      structuredDraftSection ?? {
        sectionId: 'problem-summary',
        title: 'Problem Summary',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'Problem Summary', value: manualBlank('Problem Summary', issueSummary(data)), required: true },
        ],
      },
      {
        sectionId: 'corrective-action-requirements',
        title: 'Corrective Action Requirements',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'Immediate Containment', value: manualBlank('Immediate Containment', data.immediateContainment), required: true },
          { label: 'Required Correction', value: manualBlank('Required Correction', requiredCorrection(data)), required: true },
          { label: 'Prevention / Standard Work Update', value: manualBlank('Prevention / Standard Work Update', data.preventionStandardWorkUpdate), required: true },
          { label: 'Inspection / Verification Requirement', value: manualBlank('Inspection / Verification Requirement', data.inspectionVerificationRequirement), required: true },
          { label: 'Release Approval Requirement', value: manualBlank('Release Approval Requirement', data.releaseApprovalRequirement), required: true },
        ],
      },
      {
        sectionId: 'photo-evidence',
        title: 'Photo Evidence Placeholder Area',
        layoutHint: 'photo-evidence-grid',
        fields: buildPhotoEvidenceFields(data),
      },
      {
        sectionId: 'human-confirmation-approval',
        title: 'Human Confirmation / Approval Status',
        layoutHint: 'approval-status',
        fields: [
          { label: 'AI Extracted Data Confirmation', value: manualBlank('AI Extracted Data Confirmation', data.aiExtractedDataConfirmation), required: true },
          { label: 'Human Release Confirmation', value: manualBlank('Human Release Confirmation', data.humanReleaseConfirmation), required: true },
          { label: 'Final Review Gate', value: humanConfirmed ? 'Confirmed in app state — export still disabled' : 'Not confirmed — release/export locked', required: true },
        ],
      },
    ],
  };
}
