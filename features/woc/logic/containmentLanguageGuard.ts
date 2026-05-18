import type {
  AiCorrectiveActionDraftInput,
  AiCorrectiveActionDraftSectionKey,
  StructuredCorrectiveActionDraft,
} from './aiCorrectiveActionDraftFoundation';
import { resolveCorrectiveActionOwnerDepartment } from './correctiveActionOwnerResolver';

export type ContainmentLanguageGuardInput = Pick<
  AiCorrectiveActionDraftInput,
  | 'shortIssueDescription'
  | 'detailedIssueNotes'
  | 'correctionType'
  | 'affectedArea'
  | 'foundAtDepartment'
  | 'affectedOperationEquipment'
  | 'correctiveActionOwnerDepartment'
  | 'workOrderNumber'
  | 'partNumber'
>;

const STRONG_CONTAINMENT_ACTION_PATTERN =
  /\b(?:production\s+halt(?:ed|ing)?|halt(?:ed|ing)?\s+(?:all\s+)?production|stop\s+production|stopping\s+production|job\s+hold|shipment\s+hold|hold\s+all\s+parts|quarantine(?:d|s|ing)?|scrap(?:ped|ping)?|rework(?:ed|ing)?|customer\s+notification|notif(?:y|ied|ying)\s+(?:the\s+)?customer|safety\s+escalation|stop[-\s]?ship(?:ment)?|pause(?:d|s|ing)?\s+(?:the\s+)?job)\b/i;

const RATE_VALUE_PATTERN =
  /\b(\d+(?:\.\d+)?)\s*(p\s*\.?\s*p\s*\.?\s*h|pieces?\s+per\s+hour|pcs\s*(?:\/|per)\s*hour|parts?\s*(?:\/|per)\s*hour)\b/gi;

type TimeRateValue = {
  value: string;
  label: string;
  index: number;
};

export type TimeRateMismatchDetails = {
  expectedRate?: string;
  observedRate?: string;
  expectedRateSource?: 'work order' | 'router standard' | 'work order/router standard';
};

const TIME_RATE_ISSUE_PATTERN =
  /\b(?:incorrect\s+(?:time|rate)|run[-\s]?rate|runtime|cycle\s*time|time\s*study|standard\s+(?:time|hours?)|p\s*\.?\s*p\s*\.?\s*h\b|pieces?\s+per\s+hour|pcs\s*(?:\/|per)\s*hour|parts?\s*(?:\/|per)\s*hour|per\s+hour|\d+\s*(?:p\s*\.?\s*p\s*\.?\s*h|(?:parts?|pieces?|pcs)\s*(?:\/|per)\s*hour)|hours?\s+per\s+part|minutes?\s+per\s+part|cannot\s+obtain|not\s+obtainable|obtainable|baseline|work\s+order\s+is\s+off|router\s+is\s+off|router\s+(?:time|rate|standard))\b/i;

function normalize(value?: string) {
  return value?.trim() ?? '';
}

function firstFilled(...values: Array<string | undefined>) {
  return values.map(normalize).find(Boolean) ?? '';
}

function getOperatorStatement(input: ContainmentLanguageGuardInput) {
  return normalize(input.shortIssueDescription);
}

function getAffectedProcess(input: ContainmentLanguageGuardInput) {
  return firstFilled(input.affectedOperationEquipment, input.foundAtDepartment, input.affectedArea, 'affected operation');
}

function getOwnerDepartment(input: ContainmentLanguageGuardInput) {
  return resolveCorrectiveActionOwnerDepartment(input);
}

function getJobContext(input: ContainmentLanguageGuardInput) {
  const workOrder = normalize(input.workOrderNumber);
  const partNumber = normalize(input.partNumber);

  return [workOrder ? `WO ${workOrder}` : '', partNumber ? `Part ${partNumber}` : ''].filter(Boolean).join(' / ');
}

function normalizeRateLabel(value: string, unit: string) {
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '');
  if (/^p\.?p\.?h$/.test(normalizedUnit)) return `${value} PPH`;
  if (normalizedUnit === 'pcs/hr') return `${value} pcs/hr`;
  if (normalizedUnit === 'pcsperhour') return `${value} pcs per hour`;
  if (normalizedUnit === 'parts/hr') return `${value} parts/hr`;
  if (normalizedUnit === 'partperhour' || normalizedUnit === 'partsperhour') return `${value} parts per hour`;
  if (normalizedUnit === 'pieceperhour' || normalizedUnit === 'piecesperhour') return `${value} pieces per hour`;

  return `${value} ${unit.trim()}`;
}

function extractRateValues(text: string): TimeRateValue[] {
  return Array.from(text.matchAll(RATE_VALUE_PATTERN)).map((match) => ({
    value: match[1],
    label: normalizeRateLabel(match[1], match[2]),
    index: match.index ?? 0,
  }));
}

function hasExpectedRateContext(contextBeforeRate: string) {
  return /(?:work\s+order|wo|router|standard|baseline|listed?|set|current|target|expected|off)\b/i.test(contextBeforeRate);
}

function hasObservedRateContext(contextBeforeRate: string) {
  return /(?:can\s+only|only|observed|actual|obtainable|cannot\s+obtain|not\s+obtainable|weld|make|run|output)\b/i.test(
    contextBeforeRate,
  );
}

export function extractTimeRateMismatchDetails(input: ContainmentLanguageGuardInput): TimeRateMismatchDetails {
  const text = [input.shortIssueDescription, input.detailedIssueNotes].map(normalize).filter(Boolean).join('\n');
  if (!text) return {};

  const rates = extractRateValues(text);
  if (!rates.length) return {};

  let expectedRate = '';
  let observedRate = '';

  for (const rate of rates) {
    const contextBeforeRate = text.slice(Math.max(0, rate.index - 80), rate.index);
    if (!observedRate && hasObservedRateContext(contextBeforeRate)) observedRate = rate.label;
    if (!expectedRate && hasExpectedRateContext(contextBeforeRate)) expectedRate = rate.label;
  }

  if (rates.length >= 2 && /(?:work\s+order|router)\s+is\s+off/i.test(text)) {
    observedRate ||= rates[0].label;
    expectedRate ||= rates[rates.length - 1].label;
  }

  const expectedRateSource = /work\s+order/i.test(text)
    ? 'work order'
    : /router/i.test(text)
      ? 'router standard'
      : 'work order/router standard';

  return {
    expectedRate: expectedRate || undefined,
    observedRate: observedRate || undefined,
    expectedRateSource,
  };
}

export function buildTimeRateMismatchSummaryText(input: ContainmentLanguageGuardInput) {
  const affectedProcess = getAffectedProcess(input);
  const jobContext = getJobContext(input);
  const { expectedRate, observedRate, expectedRateSource } = extractTimeRateMismatchDetails(input);
  const contextSuffix = jobContext ? ` for ${jobContext}` : '';

  if (expectedRate && observedRate) {
    return `Operator reported a run-rate/runtime mismatch in ${affectedProcess}${contextSuffix}. The ${expectedRateSource} lists ${expectedRate}, while the observed obtainable rate is ${observedRate}. The router standard should be reviewed and updated if validated.`;
  }

  if (expectedRate) {
    return `Operator reported a run-rate/runtime mismatch in ${affectedProcess}${contextSuffix}. The expected ${expectedRateSource} rate is ${expectedRate}, and the observed output baseline must be verified before any router update is approved.`;
  }

  if (observedRate) {
    return `Operator reported a run-rate/runtime mismatch in ${affectedProcess}${contextSuffix}. The observed obtainable rate is ${observedRate}, and it must be compared with the expected work order/router baseline before any router update is approved.`;
  }

  return `Operator reported a run-rate/runtime mismatch in ${affectedProcess}${contextSuffix}. The expected work order/router baseline and observed output baseline must be compared, then the router standard should be reviewed and updated if validated.`;
}

export function containsStrongContainmentAction(text?: string) {
  return STRONG_CONTAINMENT_ACTION_PATTERN.test(normalize(text));
}

export function operatorExplicitlyRequestedStrongContainment(input: ContainmentLanguageGuardInput) {
  return containsStrongContainmentAction(getOperatorStatement(input));
}

export function isIncorrectTimeRateIssue(input: ContainmentLanguageGuardInput) {
  return TIME_RATE_ISSUE_PATTERN.test(
    [input.correctionType, input.shortIssueDescription, input.detailedIssueNotes].map(normalize).join('\n'),
  );
}

export function buildMildTimeRateContainmentText(input: ContainmentLanguageGuardInput) {
  const affectedProcess = getAffectedProcess(input);

  return `Track actual output for ${affectedProcess} during the review period. Use the observed baseline for scheduling review until Engineering confirms whether the router standard should be updated. Review current production impact before changing the router standard. No production hold is recommended unless separately directed by supervision or quality.`;
}

export function buildMildTimeRateCorrectiveActionText(input: ContainmentLanguageGuardInput) {
  const owner = getOwnerDepartment(input);
  const affectedProcess = getAffectedProcess(input);

  return `${owner} should review and verify the actual output baseline for ${affectedProcess}, compare it with the current router standard, and update the router if validated. Confirm scheduling impact and document the approved production baseline after Engineering review.`;
}

function buildMildTimeRateSummaryText(input: ContainmentLanguageGuardInput) {
  return buildTimeRateMismatchSummaryText(input);
}

function buildMildTimeRateInspectionText(input: ContainmentLanguageGuardInput) {
  const affectedProcess = getAffectedProcess(input);

  return `Verify actual output for ${affectedProcess} during the review period, confirm the observed baseline, and compare the result with the current router standard before approving any router update.`;
}

function buildMildTimeRateStandardWorkText() {
  return 'Update the router standard, scheduling basis, or related work instructions only if the time/rate review validates that the current standard does not match the observed production baseline.';
}

function buildMildTimeRateCloseoutText() {
  return 'Close the draft only after Engineering completes the time/rate review, confirms whether the router update is required, and records the approved baseline for human review.';
}

function replacementForSection(input: ContainmentLanguageGuardInput, section: AiCorrectiveActionDraftSectionKey) {
  if (!isIncorrectTimeRateIssue(input)) return '';

  if (section === 'issueSummary') return buildMildTimeRateSummaryText(input);
  if (section === 'correctiveActionRequired' || section === 'responsibilityByOperation') {
    return buildMildTimeRateCorrectiveActionText(input);
  }
  if (section === 'containmentAction') return buildMildTimeRateContainmentText(input);
  if (section === 'inspectionVerificationRequirement') return buildMildTimeRateInspectionText(input);
  if (section === 'standardWorkRequirement') return buildMildTimeRateStandardWorkText();
  if (section === 'closeoutRequirement') return buildMildTimeRateCloseoutText();

  return '';
}

export function sanitizeGeneratedContainmentLanguage(
  input: ContainmentLanguageGuardInput,
  section: AiCorrectiveActionDraftSectionKey,
  text?: string,
) {
  const normalized = normalize(text);
  if (!normalized) return '';
  if (section === 'issueSummary' && isIncorrectTimeRateIssue(input)) return replacementForSection(input, section);
  if (operatorExplicitlyRequestedStrongContainment(input)) return normalized;
  if (!containsStrongContainmentAction(normalized)) return normalized;

  return replacementForSection(input, section);
}

export function getGeneratedSectionText(
  input: ContainmentLanguageGuardInput,
  section: AiCorrectiveActionDraftSectionKey,
  structuredDraft?: StructuredCorrectiveActionDraft | null,
) {
  return sanitizeGeneratedContainmentLanguage(input, section, structuredDraft?.sections[section]?.draftText);
}

export function sanitizeStructuredDraftContainmentLanguage(
  input: ContainmentLanguageGuardInput,
  structuredDraft: StructuredCorrectiveActionDraft,
): StructuredCorrectiveActionDraft {
  if (operatorExplicitlyRequestedStrongContainment(input)) return structuredDraft;

  return {
    ...structuredDraft,
    sections: Object.fromEntries(
      Object.entries(structuredDraft.sections).map(([sectionKey, section]) => {
        const key = sectionKey as AiCorrectiveActionDraftSectionKey;
        const sanitizedDraftText = sanitizeGeneratedContainmentLanguage(input, key, section.draftText);

        return [
          key,
          {
            ...section,
            draftText: sanitizedDraftText,
            sourceContext:
              sanitizedDraftText !== section.draftText
                ? `${section.sourceContext || 'AI draft'}; AI-CAS containment guard applied`
                : section.sourceContext,
          },
        ];
      }),
    ) as StructuredCorrectiveActionDraft['sections'],
  };
}
