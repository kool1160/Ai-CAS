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
>;

const STRONG_CONTAINMENT_ACTION_PATTERN =
  /\b(?:production\s+halt(?:ed|ing)?|halt(?:ed|ing)?\s+(?:all\s+)?production|stop\s+production|stopping\s+production|job\s+hold|shipment\s+hold|hold\s+all\s+parts|quarantine(?:d|s|ing)?|scrap(?:ped|ping)?|rework(?:ed|ing)?|customer\s+notification|notif(?:y|ied|ying)\s+(?:the\s+)?customer|safety\s+escalation|stop[-\s]?ship(?:ment)?|pause(?:d|s|ing)?\s+(?:the\s+)?job)\b/i;

const TIME_RATE_ISSUE_PATTERN =
  /\b(?:incorrect\s+(?:time|rate)|run[-\s]?rate|runtime|cycle\s*time|time\s*study|standard\s+(?:time|hours?)|p\.?p\.?h\.?|(?:pcs|parts?|pieces?)\s*(?:\/\s*(?:hr|hour)|per\s+hour)|\d+\s*(?:(?:parts?|pieces?|pcs)\s*)?(?:\/\s*(?:hr|hour)|per\s+hour)|\d+\s*pph|hours?\s+per\s+part|minutes?\s+per\s+part|obtainable|router\s+(?:time|rate|standard))\b/i;

export type ExtractedRateValue = {
  value: string;
  context: 'expected' | 'observed' | 'unknown';
};

const RATE_VALUE_PATTERN =
  /\b\d+(?:\.\d+)?\s*(?:(?:p\.?p\.?h\.?)|(?:(?:pcs|parts?|pieces?)\s*)?(?:\/\s*(?:hr|hour)|per\s+hour))\b/gi;

const OBSERVED_RATE_CONTEXT_PATTERNS = [
  /\bactual\b/gi,
  /\bcan\s+only\b/gi,
  /\bobserved\b/gi,
  /\bobtainable\b/gi,
  /\bbaseline\b/gi,
  /\bable\s+to\b/gi,
  /\bunable\s+to\b/gi,
  /\bonly\b/gi,
];

const EXPECTED_RATE_CONTEXT_PATTERNS = [
  /\brouter\b/gi,
  /\bwork\s+order\b/gi,
  /\bwork-order\b/gi,
  /\bstandard\b/gi,
  /\bexpected\b/gi,
  /\blisted\b/gi,
  /\btarget\b/gi,
  /\bcurrent\b/gi,
];

function normalize(value?: string) {
  return value?.trim() ?? '';
}

function firstFilled(...values: Array<string | undefined>) {
  return values.map(normalize).find(Boolean) ?? '';
}

function findNearestRateContext(text: string, rateStartIndex: number): ExtractedRateValue['context'] {
  const contextStart = Math.max(0, rateStartIndex - 80);
  const contextWindow = text.slice(contextStart, rateStartIndex);
  const delimiterIndex = Math.max(
    contextWindow.lastIndexOf(','),
    contextWindow.lastIndexOf(';'),
    contextWindow.lastIndexOf('.'),
    contextWindow.lastIndexOf('\n'),
  );
  const localContext = contextWindow.slice(delimiterIndex + 1);
  const contextOffset = contextStart + delimiterIndex + 1;

  const findNearestCue = (patterns: RegExp[]) => {
    let nearestEnd = -1;

    patterns.forEach((pattern) => {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(localContext)) !== null) {
        nearestEnd = Math.max(nearestEnd, contextOffset + match.index + match[0].length);
      }
    });

    return nearestEnd;
  };

  const observedCueEnd = findNearestCue(OBSERVED_RATE_CONTEXT_PATTERNS);
  const expectedCueEnd = findNearestCue(EXPECTED_RATE_CONTEXT_PATTERNS);

  if (observedCueEnd === -1 && expectedCueEnd === -1) return 'unknown';
  if (observedCueEnd > expectedCueEnd) return 'observed';
  return 'expected';
}

export function extractRateValues(text?: string): ExtractedRateValue[] {
  const normalized = normalize(text);
  if (!normalized) return [];

  RATE_VALUE_PATTERN.lastIndex = 0;
  const values: ExtractedRateValue[] = [];
  let match: RegExpExecArray | null;

  while ((match = RATE_VALUE_PATTERN.exec(normalized)) !== null) {
    values.push({
      value: match[0].trim(),
      context: findNearestRateContext(normalized, match.index),
    });
  }

  return values;
}

function getRateMismatchValues(input: ContainmentLanguageGuardInput) {
  const extractedValues = extractRateValues(
    [input.shortIssueDescription, input.detailedIssueNotes, input.correctionType].map(normalize).join('\n'),
  );
  const expected = extractedValues.find((rate) => rate.context === 'expected')?.value;
  const observed = extractedValues.find((rate) => rate.context === 'observed')?.value;

  return { expected, observed };
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

export function buildMildTimeRateSummaryText(input: ContainmentLanguageGuardInput) {
  const affectedProcess = getAffectedProcess(input);
  const { expected, observed } = getRateMismatchValues(input);

  if (expected && observed) {
    return `Operator reported a run-rate/runtime mismatch for ${affectedProcess}. Expected/router/work-order rate: ${expected}. Observed/actual rate: ${observed}. AI-CAS preserved the operator statement separately and drafted a review-focused correction to verify actual output, confirm the realistic baseline, and update the router if validated.`;
  }

  return `Operator reported an incorrect time/rate concern for ${affectedProcess}. AI-CAS preserved the operator statement separately and drafted a review-focused correction to verify actual output, confirm the realistic baseline, and update the router if validated.`;
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
