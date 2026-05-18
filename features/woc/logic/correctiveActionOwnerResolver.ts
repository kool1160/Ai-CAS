export type CorrectiveActionOwnerInput = {
  correctiveActionOwnerDepartment?: string;
  correctionType?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  issueDetails?: string;
  requiredCorrection?: string;
  requestedEngineeringAction?: string;
  affectedArea?: string;
  foundAtDepartment?: string;
  affectedOperationEquipment?: string;
  routerStepOperation?: string;
};

const ENGINEERING_CORRECTION_ORDER = 'Engineering Correction Order';
const PURCHASING_CORRECTION_ORDER = 'Purchasing Correction Order';
const SUPERVISOR_PRODUCTION_CORRECTION_ORDER = 'Supervisor / Production Correction Order';
const QUALITY_CORRECTION_ORDER = 'Quality Correction Order';

const UNRESOLVED_OWNER_VALUES = new Set(['other', 'other / needs review', 'needs review', 'not confirmed']);

function normalize(value?: string) {
  return value?.trim() ?? '';
}

export function isUnresolvedCorrectiveActionOwner(value?: string) {
  const normalized = normalize(value).toLowerCase();
  return !normalized || UNRESOLVED_OWNER_VALUES.has(normalized);
}

function ownerContext(input: CorrectiveActionOwnerInput) {
  return [
    input.correctionType,
    input.shortIssueDescription,
    input.detailedIssueNotes,
    input.issueDetails,
    input.requiredCorrection,
    input.requestedEngineeringAction,
    input.affectedArea,
    input.foundAtDepartment,
    input.affectedOperationEquipment,
    input.routerStepOperation,
  ]
    .map(normalize)
    .filter(Boolean)
    .join('\n');
}

export function resolveCorrectiveActionOwnerDepartment(input: CorrectiveActionOwnerInput) {
  const selectedOwner = normalize(input.correctiveActionOwnerDepartment);
  if (!isUnresolvedCorrectiveActionOwner(selectedOwner)) return selectedOwner;

  const context = ownerContext(input);

  // Preserve V8-M6H behavior: run-rate/runtime/time-study mismatches stay in engineering-style review.
  if (/(?:incorrect\s+(?:time|rate)|run[-\s]?rate|runtime|cycle\s*time|time\s*study|standard\s+(?:time|hours?)|parts?\s*(?:\/|per)\s*hour|\d+\s*(?:parts?\s*)?(?:\/|per)\s*hour|hours?\s+per\s+part|minutes?\s+per\s+part|obtainable|router\s+(?:time|rate|standard))/i.test(context)) {
    return ENGINEERING_CORRECTION_ORDER;
  }

  if (/(?:quality|inspection|defect|nonconform|reject|rework|scrap|gauge|no[-\s]?go|dimension|out\s+of\s+tolerance|bad\s+weld)/i.test(context)) {
    return QUALITY_CORRECTION_ORDER;
  }

  const hasPurchasingAvailabilitySignal =
    /(?:listed\s+(?:on|in)\s+(?:the\s+)?(?:work\s*order|router|material(?:s)?\s*list)|inventory|in\s+stock|available|availability|short|unavailable|late|vendor|supplier|material\s+control|purchas(?:e|ed|ing))/i.test(
      context,
    ) && /(?:missing|none|not\s+available|unavailable|short|late|wrong|out\s+of\s+stock|not\s+in\s+inventory)/i.test(context);

  if (hasPurchasingAvailabilitySignal) {
    return PURCHASING_CORRECTION_ORDER;
  }

  if (
    /(?:print\s*(?:to|-)?\s*router\s*mismatch|work\s*order\s+is\s+wrong|router\s+is\s+wrong|missing\s+router\s+step|missing\s+operation|work\s*instruction\s+is\s+(?:bad|missing|unclear|incorrect)|not\s+listed\s+on\s+(?:the\s+)?(?:work\s*order|router|material(?:s)?\s*list)|missing\s+required\s+part|required\s+quantity\s+is\s+wrong\s+before\s+production|bom|bill\s+of\s+materials?)/i.test(
      context,
    )
  ) {
    return ENGINEERING_CORRECTION_ORDER;
  }

  if (
    /(?:only\s+cut\s+\d+|supposed\s+to\s+cut|produced\s+the\s+wrong\s+amount|quantity\s+is\s+short|operation\s+was\s+missed|not\s+staged|not\s+found|department\s+execution|in-?house\s+produ(?:ced|ction)|downstream\s+flow|welding\s+is\s+waiting)/i.test(
      context,
    )
  ) {
    return SUPERVISOR_PRODUCTION_CORRECTION_ORDER;
  }

  if (/(?:router|operation|work\s*order|work\s*instruction|standard\s*work|routing|process\s*step|step\b)/i.test(context)) {
    return ENGINEERING_CORRECTION_ORDER;
  }

  return ENGINEERING_CORRECTION_ORDER;
}

export function alignActionSubjectWithResolvedOwner(actionText: string, owner: string) {
  const normalizedAction = normalize(actionText);
  if (!normalizedAction) return '';

  return normalizedAction.replace(
    /^\s*(?:Other\s*\/\s*Needs\s*Review|Other|Needs\s*Review|Not\s*confirmed)\s+(?=should\b|must\b|needs\b|shall\b|will\b|is\s+responsible\b)/i,
    `${owner} `,
  );
}
