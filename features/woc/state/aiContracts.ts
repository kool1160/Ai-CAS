import type { AiCorrectiveActionDraftInput, AiCorrectiveActionDraftOutput } from '../logic/aiCorrectiveActionDraftFoundation';
import type { ExtractedWorkOrderData } from '../types/wocSessionTypes';

export type AiRequestContext = 'extraction' | 'drafting';

export const PROVIDER_REQUEST_TIMEOUT_MS = 25_000;
export const PROVIDER_OUTPUT_MAX_LENGTH = 20_000;

const EXTRACTED_SHORT_FIELD_MAX_LENGTH = 400;
const EXTRACTED_LONG_FIELD_MAX_LENGTH = 4_000;
const SOURCE_NOTE_MAX_LENGTH = 200;
const SOURCE_NOTE_MAX_ENTRIES = 40;
const SOURCE_NOTE_KEY_MAX_LENGTH = 80;

const DRAFT_INPUT_SHORT_FIELD_MAX_LENGTH = 400;
const DRAFT_INPUT_LONG_FIELD_MAX_LENGTH = 4_000;
const DRAFT_SECTION_MAX_LENGTH = 4_000;

const UNSAFE_CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

type ExtractedStringField = Exclude<keyof ExtractedWorkOrderData, 'fieldSourceNotes'>;
type DraftInputStringField = Exclude<keyof AiCorrectiveActionDraftInput, 'photoEvidenceAttached'>;

const EXTRACTED_SHORT_FIELDS: ExtractedStringField[] = [
  'workOrderNumber',
  'partNumber',
  'revision',
  'partDescription',
  'customerOrJob',
  'operationNumber',
  'routerStepOperation',
  'quantity',
  'quantityAffected',
  'dueDateShipDate',
  'nextOperation',
  'inspectionOperation',
  'material',
  'foundAtDepartment',
  'suspectedFailurePoint',
  'shortIssueDescription',
];

const EXTRACTED_LONG_FIELDS: ExtractedStringField[] = ['detailedIssueNotes', 'notes'];

const DRAFT_INPUT_SHORT_FIELDS: DraftInputStringField[] = [
  'workOrderNumber',
  'partNumber',
  'partDescription',
  'customerOrJob',
  'operationNumber',
  'routerStepOperation',
  'quantityAffected',
  'foundAtDepartment',
  'suspectedFailurePoint',
  'correctiveActionOwnerDepartment',
  'shortIssueDescription',
  'evidenceLabel',
  'photoEvidenceFileName',
];

const DRAFT_INPUT_LONG_FIELDS: DraftInputStringField[] = ['detailedIssueNotes'];

const DRAFT_OUTPUT_SECTIONS: Array<Exclude<keyof AiCorrectiveActionDraftOutput, 'status'>> = [
  'issueSummary',
  'correctiveActionRequired',
  'standardWorkRequirement',
  'responsibilityByOperation',
  'containmentAction',
  'inspectionVerificationRequirement',
  'photoEvidenceReference',
  'closeoutRequirement',
];

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; reason: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stripUnsafeControlCharacters(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(UNSAFE_CONTROL_CHARACTER_PATTERN, '');
}

function boundedText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return stripUnsafeControlCharacters(value).trim().slice(0, maxLength);
}

function boundedFieldSourceNotes(value: unknown): Record<string, string> {
  if (!isPlainObject(value)) return {};

  return Object.entries(value)
    .slice(0, SOURCE_NOTE_MAX_ENTRIES)
    .reduce<Record<string, string>>((notes, [key, note]) => {
      if (typeof note !== 'string') return notes;
      const boundedKey = boundedText(key, SOURCE_NOTE_KEY_MAX_LENGTH);
      if (!boundedKey) return notes;
      notes[boundedKey] = boundedText(note, SOURCE_NOTE_MAX_LENGTH);
      return notes;
    }, {});
}

/**
 * Strips a ```json / ``` code fence some providers wrap structured output in.
 */
export function stripJsonCodeFence(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

export function extractProviderOutputText(responseBody: unknown): string {
  if (typeof responseBody !== 'object' || responseBody === null) return '';

  const maybeOutputText = (responseBody as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string') return maybeOutputText;

  const output = (responseBody as { output?: unknown }).output;
  if (!Array.isArray(output)) return '';

  return output
    .flatMap((item) => {
      if (typeof item !== 'object' || item === null) return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((contentItem) => {
        if (typeof contentItem !== 'object' || contentItem === null) return '';
        const text = (contentItem as { text?: unknown }).text;
        return typeof text === 'string' ? text : '';
      });
    })
    .join('\n')
    .trim();
}

/**
 * Validates and bounds a parsed OpenAI Vision extraction payload. A parsed
 * value that is not a plain object (array, string, number, null) is rejected
 * outright rather than silently accepted as an all-blank extraction.
 */
export function validateExtractedWorkOrderData(value: unknown): ValidationResult<ExtractedWorkOrderData> {
  if (!isPlainObject(value)) return { ok: false, reason: 'extracted-payload-not-an-object' };

  const data: ExtractedWorkOrderData = {};
  for (const field of EXTRACTED_SHORT_FIELDS) data[field] = boundedText(value[field], EXTRACTED_SHORT_FIELD_MAX_LENGTH);
  for (const field of EXTRACTED_LONG_FIELDS) data[field] = boundedText(value[field], EXTRACTED_LONG_FIELD_MAX_LENGTH);
  data.fieldSourceNotes = boundedFieldSourceNotes(value.fieldSourceNotes);

  return { ok: true, data };
}

/**
 * Validates and bounds a client-supplied AI drafting input before it is used
 * to build the server-owned prompt. A non-object shape is rejected; every
 * accepted field is bounded and control characters are stripped.
 */
export function validateAiCorrectiveActionDraftInput(value: unknown): ValidationResult<AiCorrectiveActionDraftInput> {
  if (!isPlainObject(value)) return { ok: false, reason: 'draft-input-not-an-object' };

  const data: AiCorrectiveActionDraftInput = {};
  for (const field of DRAFT_INPUT_SHORT_FIELDS) data[field] = boundedText(value[field], DRAFT_INPUT_SHORT_FIELD_MAX_LENGTH);
  for (const field of DRAFT_INPUT_LONG_FIELDS) data[field] = boundedText(value[field], DRAFT_INPUT_LONG_FIELD_MAX_LENGTH);
  data.photoEvidenceAttached = value.photoEvidenceAttached === true;

  return { ok: true, data };
}

/**
 * Validates and bounds a parsed AI drafting output payload. `status` is
 * always forced to the literal `draft-only-unconfirmed` value regardless of
 * what the provider returned; the provider is never trusted for release
 * state. A non-object shape is rejected rather than silently accepted as an
 * all-blank draft.
 */
export function validateAiCorrectiveActionDraftOutput(value: unknown): ValidationResult<AiCorrectiveActionDraftOutput> {
  if (!isPlainObject(value)) return { ok: false, reason: 'draft-payload-not-an-object' };

  const data = { status: 'draft-only-unconfirmed' as const } as AiCorrectiveActionDraftOutput;
  for (const section of DRAFT_OUTPUT_SECTIONS) data[section] = boundedText(value[section], DRAFT_SECTION_MAX_LENGTH);

  return { ok: true, data };
}

function manualFallbackText(context: AiRequestContext): string {
  return context === 'extraction' ? 'Manual entry is still available.' : 'Manual drafting remains available.';
}

/**
 * Normalizes a failed provider HTTP response into a safe, generic message.
 * Raw provider error text is never forwarded to the client.
 */
export function normalizeProviderFailureMessage(status: number, context: AiRequestContext): string {
  const fallback = manualFallbackText(context);
  if (status === 401 || status === 403) return `AI provider authentication failed. ${fallback}`;
  if (status === 429) return `AI provider rate limit reached. ${fallback}`;
  if (status >= 500) return `AI provider is temporarily unavailable. ${fallback}`;
  return `AI provider rejected the request. ${fallback}`;
}

/**
 * Normalizes a fetch-level failure (timeout, abort, network error) into a
 * safe, generic message. Raw exception details are never forwarded to the
 * client.
 */
export function normalizeProviderNetworkFailureMessage(context: AiRequestContext, timedOut: boolean): string {
  const fallback = manualFallbackText(context);
  return timedOut
    ? `AI provider request timed out. ${fallback}`
    : `AI provider request could not be completed. ${fallback}`;
}

export function isProviderTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}
