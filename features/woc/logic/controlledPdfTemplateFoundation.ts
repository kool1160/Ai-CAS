import type { StructuredCorrectiveActionDraft } from './aiCorrectiveActionDraftFoundation';
import {
  buildVectisProfessionalSummary,
  buildVectisRequiredAction,
  buildStandardEvidenceRows,
  getOperatorStatement,
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

const DEFAULT_SUBMITTED_BY = 'Vectis — Corrective Action System';
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

export function buildControlledCorrectiveActionPdfTemplate(
  data: ControlledPdfTemplateInput,
  confirmations: ControlledPdfTemplateConfirmationInput = {},
): ControlledCorrectiveActionPdfTemplate {
  const humanConfirmed = Boolean(confirmations.finalReviewConfirmed);
  const dateCaptured = valueOrNotConfirmed(data.dateCaptured ?? DEFAULT_DATE_CAPTURED);
  const submittedBy = valueOrNotConfirmed(data.submittedBy ?? DEFAULT_SUBMITTED_BY);
  const evidenceRows = buildStandardEvidenceRows(data);
  const reviewGateStatus = humanConfirmed ? 'Confirmed by final human review.' : 'Pending final human review.';

  return {
    templateName: 'VECTIS CORRECTIVE ACTION REPORT',
    templateVersion: 'V8-M2B-standard-report',
    modelSource: 'Vectis | Let’s weld. | Capture. Confirm. Correct.',
    status: humanConfirmed ? 'locked-until-controlled-release' : 'foundation-only',
    releaseGate: 'Draft first. Confirm accuracy. Then send/export/print.',
    layoutNotes: data.evidenceItems?.length
      ? ['Optional appendix contains evidence metadata only. Photo images are not embedded in this PDF.']
      : [],
    sections: [
      {
        sectionId: 'purpose',
        title: 'Purpose',
        layoutHint: 'header',
        fields: [
          {
            label: 'Purpose',
            value: 'Convert shop-floor issue capture into clear, professional corrective-action language for review, routing, and controlled documentation.',
            required: true,
          },
        ],
      },
      {
        sectionId: 'job-work-order-information',
        title: '1. JOB / WORK ORDER INFORMATION',
        layoutHint: 'two-column-table',
        fields: [
          { label: 'Work Order', value: valueOrNotConfirmed(data.workOrderNumber), required: true },
          { label: 'Part Number', value: valueOrNotConfirmed(data.partNumber), required: true },
          ...optionalField('Customer / Job', data.customerOrJob),
          ...optionalField('Quantity', firstFilled(data.quantityAffected, data.quantity)),
          { label: 'Affected Department / Area', value: valueOrNotConfirmed(getAffectedArea(data)), required: true },
          { label: 'Affected Operation / Equipment', value: valueOrNotConfirmed(getAffectedOperationEquipment(data)), required: true },
          ...optionalField('Router Step / Operation (uploaded router context)', firstFilled(data.routerStepOperation, data.operationNumber)),
          { label: 'Date Captured', value: dateCaptured, required: true },
          { label: 'Submitted By', value: submittedBy, required: true },
          { label: 'Priority', value: data.priority?.trim() || 'Standard review', required: true },
        ],
      },
      {
        sectionId: 'confirmed-issue-summary',
        title: '2. CONFIRMED ISSUE SUMMARY',
        layoutHint: 'full-width-text',
        fields: [
          {
            label: 'Operator / Shop-Floor Issue Statement',
            value: getOperatorStatement(data),
            required: true,
          },
          {
            label: 'Vectis Corrective Action Summary',
            value: buildVectisProfessionalSummary(data),
            required: true,
          },
        ],
      },
      {
        sectionId: 'evidence-and-verification',
        title: '3. EVIDENCE AND VERIFICATION',
        layoutHint: 'photo-evidence-grid',
        fields: evidenceRows.map((row) => ({
          label: row.slot,
          value: `Type / Label: ${row.typeLabel}\nStatus: ${row.status}\nNotes: ${row.notes}`,
          required: false,
        })),
      },
      {
        sectionId: 'required-correction-action',
        title: '4. REQUIRED CORRECTION / ACTION',
        layoutHint: 'full-width-text',
        fields: [
          { label: 'AI-Written Corrective Action', value: buildVectisRequiredAction(data), required: true },
          ...optionalField('Containment / Immediate Check', firstFilled(data.structuredDraft?.sections.containmentAction?.draftText, data.immediateContainment)),
          ...optionalField('Inspection / Verification', firstFilled(data.structuredDraft?.sections.inspectionVerificationRequirement?.draftText, data.inspectionVerificationRequirement)),
          ...optionalField('Standard Work / Prevention Update', firstFilled(data.structuredDraft?.sections.standardWorkRequirement?.draftText, data.preventionStandardWorkUpdate)),
        ],
      },
      {
        sectionId: 'review-gate',
        title: '5. REVIEW GATE',
        layoutHint: 'approval-status',
        fields: [
          { label: 'Data Confirmed', value: reviewGateStatus, required: true },
          { label: 'Output Approved', value: humanConfirmed ? 'Approved for controlled PDF/email action.' : 'Pending final human review.', required: true },
          { label: 'Approved By', value: humanConfirmed ? submittedBy : 'Pending human approval', required: true },
          { label: 'Date', value: dateCaptured, required: true },
          { label: 'Rule', value: 'Draft first. Confirm accuracy. Then send/export/print.', required: true },
        ],
      },
    ],
  };
}
