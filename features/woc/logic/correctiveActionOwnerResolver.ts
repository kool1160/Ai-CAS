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

const MANUFACTURING_ENGINEERING_PRODUCTION = 'Manufacturing Engineering / Production';
const PURCHASING_MATERIAL_CONTROL = 'Purchasing / Material Control';
const QUALITY_PRODUCTION = 'Quality / Production';

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

  if (/(?:incorrect\s+(?:time|rate)|run[-\s]?rate|runtime|cycle\s*time|time\s*study|standard\s+(?:time|hours?)|parts?\s*(?:\/|per)\s*hour|\d+\s*(?:parts?\s*)?(?:\/|per)\s*hour|hours?\s+per\s+part|minutes?\s+per\s+part|obtainable|router\s+(?:time|rate|standard))/i.test(context)) {
    return MANUFACTURING_ENGINEERING_PRODUCTION;
  }

  if (/(?:missing\s+(?:material|component|part|hardware)|purchas(?:e|ed|ing)|material\s+control|vendor|supplier|component|raw\s+material)/i.test(context)) {
    return PURCHASING_MATERIAL_CONTROL;
  }

  if (/(?:quality|inspection|defect|nonconform|reject|gauge|no[-\s]?go|dimension|out\s+of\s+tolerance)/i.test(context)) {
    return QUALITY_PRODUCTION;
  }

  if (/(?:router|operation|work\s*order|work\s*instruction|standard\s*work|routing|process\s*step|step\b)/i.test(context)) {
    return MANUFACTURING_ENGINEERING_PRODUCTION;
  }

  return MANUFACTURING_ENGINEERING_PRODUCTION;
}

export function alignActionSubjectWithResolvedOwner(actionText: string, owner: string) {
  const normalizedAction = normalize(actionText);
  if (!normalizedAction) return '';

  return normalizedAction.replace(
    /^\s*(?:Other\s*\/\s*Needs\s*Review|Other|Needs\s*Review|Not\s*confirmed)\s+(?=should\b|must\b|needs\b|shall\b|will\b|is\s+responsible\b)/i,
    `${owner} `,
  );
}
