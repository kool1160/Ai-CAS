import type { StructuredCorrectiveActionDraft } from './aiCorrectiveActionDraftFoundation';
import {
  buildMildTimeRateContainmentText,
  getGeneratedSectionText,
  isIncorrectTimeRateIssue,
} from './containmentLanguageGuard';
import { removeUploadedRouterContextFromFinalText } from './finalOutputSanitizer';
import {
  buildAiCasProfessionalSummary,
  buildAiCasRequiredAction,
  buildStandardEvidenceRows,
  getOriginalOperatorNote,
  type StandardEvidenceItem,
} from './standardCorrectiveActionReport';

export type ControlledPdfTemplateStatus = 'foundation-only' | 'locked-until-controlled-release';

export type ControlledPdfEvidenceItem = StandardEvidenceItem & {
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
  operationNumber?: string;
  routerStepOperation?: string;
  affectedOperationEquipment?: string;
  correctionType?: string;
  affectedArea?: string;
  foundAtDepartment?: string;
  correctiveActionOwnerDepartment?: string;
  productionImpact?: string;
  suspectedFailurePoint?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
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
  submittedBy?: string;
  dateCaptured?: string;
  priority?: string;
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

const DEFAULT_SUBMITTED_BY = 'AI-CAS — Corrective Action System';
const DEFAULT_DATE_CAPTURED = 'Pending final review date';

function valueOrNotConfirmed(value?: string) {
  return value?.trim() || 'Not confirmed';
}

function firstFilled(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() ?? '').find(Boolean) ?? '';
}

function optionalField(label: string, value?: string): ControlledPdfTemplateField[] {
  const normalized = value?.trim() ?? '';
  return normalized ? [{ label, value: normalized, required: false }] : [];
}

function isOtherOrBlank(value?: string) {
  const normalized = value?.trim().toLowerCase() ?? '';
  return !normalized || normalized === 'other' || normalized === 'other / needs review';
}

function getAffectedArea(data: ControlledPdfTemplateInput) {
  return firstFilled(data.foundAtDepartment, data.affectedArea, 'affected department');
}

function getAffectedOperationEquipment(data: ControlledPdfTemplateInput) {
  const selectedOperation = data.affectedOperationEquipment?.trim() ?? '';
  if (selectedOperation && !isOtherOrBlank(selectedOperation)) return selectedOperation;

  if (getAffectedArea(data).toLowerCase() === 'welding') return 'Welding';

  return 'Operation needs confirmation';
}

function sanitizePdfFieldValue(data: ControlledPdfTemplateInput, value: string) {
  return removeUploadedRouterContextFromFinalText(value, {
    operationNumber: data.operationNumber,
    routerStepOperation: data.routerStepOperation,
    affectedOperationEquipment: getAffectedOperationEquipment(data),
  });
}

function sanitizePdfTemplate(
  data: ControlledPdfTemplateInput,
  template: ControlledCorrectiveActionPdfTemplate,
): ControlledCorrectiveActionPdfTemplate {
  return {
    ...template,
    sections: template.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => ({
        ...field,
        value: sanitizePdfFieldValue(data, field.value),
      })),
    })),
  };
}

export function buildControlledCorrectiveActionPdfTemplate(
  data: ControlledPdfTemplateInput,
  confirmations: ControlledPdfTemplateConfirmationInput = {},
): ControlledCorrectiveActionPdfTemplate {
  const humanConfirmed = Boolean(confirmations.finalReviewConfirmed);
  const dateCaptured = valueOrNotConfirmed(data.dateCaptured ?? DEFAULT_DATE_CAPTURED);
  const submittedBy = valueOrNotConfirmed(data.submittedBy ?? DEFAULT_SUBMITTED_BY);
  const evidenceRows = buildStandardEvidenceRows(data);
  const reviewGateStatus = humanConfirmed ? 'Confirmed by final human review.' : 'Pending final human review.';
  const containmentCheck = firstFilled(
    getGeneratedSectionText(data, 'containmentAction', data.structuredDraft),
    data.immediateContainment,
    isIncorrectTimeRateIssue(data) ? buildMildTimeRateContainmentText(data) : '',
  );

  const hasUsefulEvidence = evidenceRows.some((row) => {
    const status = row.status.trim().toLowerCase();
    const notes = row.notes.trim().toLowerCase();
    return !status.includes('no evidence attached')
      && !notes.includes('no photo images are embedded')
      && !notes.includes('review-step evidence metadata captured');
  });

  const template: ControlledCorrectiveActionPdfTemplate = {
    templateName: 'AI-CAS Corrective Action Sheet',
    templateVersion: 'V8-B1-M8B-corrective-action-sheet',
    modelSource: 'Corrective Action System | Capture. Confirm. Correct. | Applied Intelligence | Standardize to Optimize',
    status: humanConfirmed ? 'locked-until-controlled-release' : 'foundation-only',
    releaseGate: 'Draft first. Confirm accuracy. Then send/export/print.',
    layoutNotes: hasUsefulEvidence
      ? ['Evidence metadata is included only when useful evidence exists. Photo images are not embedded in this PDF.']
      : [],
    sections: [
      {
        sectionId: 'metadata-block',
        title: 'METADATA BLOCK',
        layoutHint: 'two-column-table',
        fields: [
          { label: 'Work Order', value: valueOrNotConfirmed(data.workOrderNumber), required: true },
          { label: 'Part Number', value: valueOrNotConfirmed(data.partNumber), required: true },
          ...optionalField('Part Description', data.partDescription),
          ...optionalField('Customer / Job', data.customerOrJob),
          ...optionalField('Quantity', firstFilled(data.quantityAffected, data.quantity)),
          { label: 'Affected Department / Area', value: valueOrNotConfirmed(getAffectedArea(data)), required: true },
          { label: 'Affected Operation / Equipment', value: valueOrNotConfirmed(getAffectedOperationEquipment(data)), required: true },
          { label: 'Date Captured', value: dateCaptured, required: true },
          { label: 'Submitted By', value: submittedBy, required: true },
          { label: 'Priority', value: data.priority?.trim() || 'Standard review', required: true },
        ],
      },
      {
        sectionId: 'issue-summary',
        title: 'ISSUE SUMMARY',
        layoutHint: 'full-width-text',
        fields: [
          {
            label: 'Professional Issue Summary',
            value: buildAiCasProfessionalSummary(data),
            required: true,
          },
          ...optionalField('Original Operator Note (source reference)', getOriginalOperatorNote(data)),
        ],
      },
      {
        sectionId: 'corrective-action-requirements',
        title: 'CORRECTIVE ACTION REQUIREMENTS',
        layoutHint: 'two-column-table',
        fields: [
          { label: 'Requirement', value: buildAiCasRequiredAction(data), required: true },
          { label: 'Required Standard', value: firstFilled(getGeneratedSectionText(data, 'standardWorkRequirement', data.structuredDraft), data.preventionStandardWorkUpdate, 'Update router/work instruction clarity and verify operator understanding before release.'), required: true },
          { label: 'Acceptance / Verification', value: firstFilled(getGeneratedSectionText(data, 'inspectionVerificationRequirement', data.structuredDraft), data.inspectionVerificationRequirement, 'Owner and Quality verify correction outcome before release.'), required: true },
        ],
      },
      {
        sectionId: 'containment-action',
        title: 'CONTAINMENT ACTION',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'Containment', value: firstFilled(containmentCheck, 'Place affected work on hold, review impacted quantity, verify operation status, and notify responsible owner before release.'), required: true },
        ],
      },
      {
        sectionId: 'responsibility-matrix',
        title: 'RESPONSIBILITY MATRIX',
        layoutHint: 'two-column-table',
        fields: [
          { label: 'Role / Operation', value: `${valueOrNotConfirmed(data.correctiveActionOwnerDepartment)} | ${valueOrNotConfirmed(getAffectedOperationEquipment(data))}`, required: true },
          { label: 'Responsibility', value: 'Review issue, apply correction, verify outcome, and document closeout.', required: true },
        ],
      },
      {
        sectionId: 'pass-fail-condition',
        title: 'PASS / FAIL CONDITION',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'PASS', value: 'Correction is implemented, verification is complete, and required approvals are recorded.', required: true },
          { label: 'FAIL', value: 'Any required correction, verification, or approval remains incomplete.', required: true },
        ],
      },
      {
        sectionId: 'corrective-action-closeout',
        title: 'CORRECTIVE ACTION CLOSEOUT CHECKLIST',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'Checklist 1', value: 'Confirm root issue is addressed at source.', required: true },
          { label: 'Checklist 2', value: 'Confirm affected quantity disposition is complete.', required: true },
          { label: 'Checklist 3', value: firstFilled(getGeneratedSectionText(data, 'standardWorkRequirement', data.structuredDraft), data.preventionStandardWorkUpdate, 'Confirm standard work/router updates are complete when required.'), required: true },
          { label: 'Checklist 4', value: 'Confirm recurrence prevention owner and follow-up date are assigned.', required: true },
        ],
      },
      {
        sectionId: 'release-approval-signoff',
        title: 'RELEASE APPROVAL / SIGNOFF',
        layoutHint: 'approval-status',
        fields: [
          { label: 'Welding / Production', value: '____________________', required: true },
          { label: 'Supervisor', value: '____________________', required: true },
          { label: 'Quality', value: '____________________', required: true },
          { label: 'Engineering / Purchasing (if applicable)', value: '____________________', required: false },
          { label: 'Data Confirmed', value: reviewGateStatus, required: true },
          { label: 'Output Approved', value: humanConfirmed ? 'Approved for controlled PDF/email action.' : 'Pending final human review.', required: true },
          { label: 'Approved By', value: humanConfirmed ? submittedBy : 'Pending human approval', required: true },
          { label: 'Date', value: dateCaptured, required: true },
          { label: 'Rule', value: 'Draft first. Confirm accuracy. Then send/export/print.', required: true },
        ],
      },
      ...(hasUsefulEvidence
        ? [{
          sectionId: 'evidence-and-verification',
          title: 'EVIDENCE',
          layoutHint: 'photo-evidence-grid' as const,
          fields: evidenceRows.map((row) => ({
            label: row.slot,
            value: `Type / Label: ${row.typeLabel}
Status: ${row.status}
Notes: ${row.notes}`,
            required: false,
          })),
        }]
        : []),
    ],
  };

  return sanitizePdfTemplate(data, template);
}
