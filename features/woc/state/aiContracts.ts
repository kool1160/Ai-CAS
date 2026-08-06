import type { AiCorrectiveActionDraftInput, AiCorrectiveActionDraftOutput } from '../logic/aiCorrectiveActionDraftFoundation';
import type { ExtractedWorkOrderData } from '../types/wocSessionTypes';

export type AiRequestContext = 'extraction' | 'drafting';

export const PROVIDER_REQUEST_TIMEOUT_MS = 25_000;
export const PROVIDER_OUTPUT_MAX_LENGTH = 20_000;
export const PROVIDER_RESPONSE_BODY_MAX_BYTES = 24_000;

const EXTRACTED_SHORT_FIELD_MAX_LENGTH = 400;
const EXTRACTED_LONG_FIELD_MAX_LENGTH = 4_000;
const SOURCE_NOTE_MAX_LENGTH = 200;
const SOURCE_NOTE_MAX_ENTRIES = 40;

const DRAFT_INPUT_SHORT_FIELD_MAX_LENGTH = 400;
const DRAFT_INPUT_LONG_FIELD_MAX_LENGTH = 4_000;
const DRAFT_SECTION_MAX_LENGTH = 4_000;

const UNSAFE_CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

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

const EXTRACTED_FIELDS_WITH_SOURCE_NOTES = [...EXTRACTED_SHORT_FIELDS, ...EXTRACTED_LONG_FIELDS, 'fieldSourceNotes'] as const;
const DRAFT_OUTPUT_FIELDS = ['status', ...DRAFT_OUTPUT_SECTIONS] as const;
const DRAFT_INPUT_FIELDS = [...DRAFT_INPUT_SHORT_FIELDS, ...DRAFT_INPUT_LONG_FIELDS, 'photoEvidenceAttached'] as const;

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; reason: string };

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expectedKeys: readonly string[]) {
  const keys = Object.keys(value);
  return keys.length === expectedKeys.length && expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function hasOnlyAllowedKeys(value: Record<string, unknown>, allowedKeys: readonly string[]) {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function validateText(value: unknown, maxLength: number, allowEmpty: boolean): ValidationResult<string> {
  if (typeof value !== 'string') return { ok: false, reason: 'not-a-string' };
  if (value.length > maxLength) return { ok: false, reason: 'too-long' };
  if (UNSAFE_CONTROL_CHARACTER_PATTERN.test(value)) return { ok: false, reason: 'contains-control-character' };
  if (!allowEmpty && !value.trim()) return { ok: false, reason: 'empty' };
  return { ok: true, data: value };
}

function validateFieldSourceNotes(value: unknown): ValidationResult<Record<string, string>> {
  if (!isPlainObject(value)) return { ok: false, reason: 'field-source-notes-not-an-object' };

  const entries = Object.entries(value);
  if (entries.length > SOURCE_NOTE_MAX_ENTRIES) return { ok: false, reason: 'field-source-notes-too-many-entries' };

  const notes: Record<string, string> = {};
  for (const [key, note] of entries) {
    if (!EXTRACTED_SHORT_FIELDS.includes(key as ExtractedStringField) && !EXTRACTED_LONG_FIELDS.includes(key as ExtractedStringField)) {
      return { ok: false, reason: 'field-source-notes-unknown-field' };
    }

    const noteValidation = validateText(note, SOURCE_NOTE_MAX_LENGTH, true);
    if (!noteValidation.ok) return { ok: false, reason: `field-source-notes-${noteValidation.reason}` };
    notes[key] = noteValidation.data;
  }

  return { ok: true, data: notes };
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
  if (!hasExactKeys(value, EXTRACTED_FIELDS_WITH_SOURCE_NOTES)) return { ok: false, reason: 'extracted-payload-keys-invalid' };

  const data: ExtractedWorkOrderData = {};
  for (const field of EXTRACTED_SHORT_FIELDS) {
    const fieldValidation = validateText(value[field], EXTRACTED_SHORT_FIELD_MAX_LENGTH, true);
    if (!fieldValidation.ok) return { ok: false, reason: `extracted-${field}-${fieldValidation.reason}` };
    data[field] = fieldValidation.data;
  }
  for (const field of EXTRACTED_LONG_FIELDS) {
    const fieldValidation = validateText(value[field], EXTRACTED_LONG_FIELD_MAX_LENGTH, true);
    if (!fieldValidation.ok) return { ok: false, reason: `extracted-${field}-${fieldValidation.reason}` };
    data[field] = fieldValidation.data;
  }

  const sourceNotesValidation = validateFieldSourceNotes(value.fieldSourceNotes);
  if (!sourceNotesValidation.ok) return sourceNotesValidation;
  data.fieldSourceNotes = sourceNotesValidation.data;

  return { ok: true, data };
}

/**
 * Validates and bounds a client-supplied AI drafting input before it is used
 * to build the server-owned prompt. A non-object shape is rejected; every
 * accepted field is bounded and control characters are stripped.
 */
export function validateAiCorrectiveActionDraftInput(value: unknown): ValidationResult<AiCorrectiveActionDraftInput> {
  if (!isPlainObject(value)) return { ok: false, reason: 'draft-input-not-an-object' };
  if (!hasOnlyAllowedKeys(value, DRAFT_INPUT_FIELDS)) return { ok: false, reason: 'draft-input-unknown-field' };

  const data: AiCorrectiveActionDraftInput = {};
  for (const field of DRAFT_INPUT_SHORT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(value, field)) continue;
    const fieldValidation = validateText(value[field], DRAFT_INPUT_SHORT_FIELD_MAX_LENGTH, true);
    if (!fieldValidation.ok) return { ok: false, reason: `draft-input-${field}-${fieldValidation.reason}` };
    data[field] = fieldValidation.data;
  }
  for (const field of DRAFT_INPUT_LONG_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(value, field)) continue;
    const fieldValidation = validateText(value[field], DRAFT_INPUT_LONG_FIELD_MAX_LENGTH, true);
    if (!fieldValidation.ok) return { ok: false, reason: `draft-input-${field}-${fieldValidation.reason}` };
    data[field] = fieldValidation.data;
  }
  if (Object.prototype.hasOwnProperty.call(value, 'photoEvidenceAttached')) {
    if (typeof value.photoEvidenceAttached !== 'boolean') return { ok: false, reason: 'draft-input-photo-evidence-attached-not-a-boolean' };
    data.photoEvidenceAttached = value.photoEvidenceAttached;
  }

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
  if (!hasExactKeys(value, DRAFT_OUTPUT_FIELDS)) return { ok: false, reason: 'draft-payload-keys-invalid' };
  if (value.status !== 'draft-only-unconfirmed') return { ok: false, reason: 'draft-payload-status-invalid' };

  const data = { status: 'draft-only-unconfirmed' as const } as AiCorrectiveActionDraftOutput;
  for (const section of DRAFT_OUTPUT_SECTIONS) {
    const sectionValidation = validateText(value[section], DRAFT_SECTION_MAX_LENGTH, false);
    if (!sectionValidation.ok) return { ok: false, reason: `draft-${section}-${sectionValidation.reason}` };
    data[section] = sectionValidation.data;
  }

  return { ok: true, data };
}

/**
 * Reads a provider wrapper incrementally so it is size-bounded before JSON
 * parsing. The wrapper can be larger than its extracted text, so it has an
 * independent cap.
 */
export async function readBoundedProviderResponseBody(response: Response): Promise<ValidationResult<string>> {
  if (!response.body) return { ok: false, reason: 'provider-response-body-missing' };

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > PROVIDER_RESPONSE_BODY_MAX_BYTES) {
        await reader.cancel();
        return { ok: false, reason: 'provider-response-body-too-large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'provider-response-body-unreadable' };
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, data: new TextDecoder().decode(body) };
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
export function normalizeProviderNetworkFailureMessage(context: AiRequestContext, failure: 'timeout' | 'aborted' | 'network'): string {
  const fallback = manualFallbackText(context);
  if (failure === 'timeout') return `AI provider request timed out. ${fallback}`;
  if (failure === 'aborted') return `AI provider request was cancelled. ${fallback}`;
  return `AI provider request could not be completed. ${fallback}`;
}

export function isProviderTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}
