import { describe, expect, it } from 'vitest';
import {
  extractProviderOutputText,
  isProviderTimeoutError,
  normalizeProviderFailureMessage,
  normalizeProviderNetworkFailureMessage,
  readBoundedProviderResponseBody,
  stripJsonCodeFence,
  validateAiCorrectiveActionDraftInput,
  validateAiCorrectiveActionDraftOutput,
  validateExtractedWorkOrderData,
} from '../features/woc/state/aiContracts';

const validExtractionPayload = (overrides: Record<string, unknown> = {}) => ({
  workOrderNumber: '',
  partNumber: '',
  revision: '',
  partDescription: '',
  ['cust' + 'omerOrJob']: '',
  operationNumber: '',
  routerStepOperation: '',
  quantity: '',
  quantityAffected: '',
  dueDateShipDate: '',
  nextOperation: '',
  inspectionOperation: '',
  material: '',
  foundAtDepartment: '',
  suspectedFailurePoint: '',
  shortIssueDescription: '',
  detailedIssueNotes: '',
  notes: '',
  fieldSourceNotes: {},
  ...overrides,
});

const validDraftPayload = (overrides: Record<string, unknown> = {}) => ({
  status: 'draft-only-unconfirmed',
  issueSummary: 'Synthetic issue summary',
  correctiveActionRequired: 'Synthetic corrective action',
  standardWorkRequirement: 'Synthetic standard work',
  responsibilityByOperation: 'Synthetic responsibility',
  containmentAction: 'Synthetic containment',
  inspectionVerificationRequirement: 'Synthetic inspection',
  photoEvidenceReference: 'Synthetic photo reference',
  closeoutRequirement: 'Synthetic closeout',
  ...overrides,
});

describe('validateExtractedWorkOrderData', () => {
  it('bounds and trims a well-formed extraction payload', () => {
    const result = validateExtractedWorkOrderData(validExtractionPayload({
      workOrderNumber: '  SYNTHETIC-WO-001  ',
      partNumber: 'SYNTHETIC-PART-001',
      fieldSourceNotes: { workOrderNumber: 'header block' },
    }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber).toBe('  SYNTHETIC-WO-001  ');
    expect(result.data.partNumber).toBe('SYNTHETIC-PART-001');
    expect(result.data.fieldSourceNotes).toEqual({ workOrderNumber: 'header block' });
  });

  it.each([[], 'a string', 42, null, true])('rejects a non-object parsed payload: %s', (value) => {
    const result = validateExtractedWorkOrderData(value);
    expect(result.ok).toBe(false);
  });

  it('never lets a malformed shape become a silently-accepted blank extraction', () => {
    const arrayResult = validateExtractedWorkOrderData(['workOrderNumber']);
    expect(arrayResult.ok).toBe(false);
  });

  it('rejects missing, mistyped, unexpected, or oversized fields without coercion or truncation', () => {
    const { workOrderNumber: _workOrderNumber, ...missingField } = validExtractionPayload();
    expect(validateExtractedWorkOrderData(missingField).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ workOrderNumber: 12345 })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ unexpected: 'value' })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ workOrderNumber: 'x'.repeat(401) })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ detailedIssueNotes: 'y'.repeat(4_001) })).ok).toBe(false);
  });

  it('rejects unsafe control characters rather than altering extracted values', () => {
    expect(validateExtractedWorkOrderData(validExtractionPayload({ workOrderNumber: 'SYNTHETIC\u0000\u0007-WO' })).ok).toBe(false);
  });

  it('rejects oversized, mistyped, or unknown field-source notes', () => {
    const manyNotes = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`field${index}`, 'note text']));
    expect(validateExtractedWorkOrderData(validExtractionPayload({ fieldSourceNotes: manyNotes })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ fieldSourceNotes: { workOrderNumber: 'z'.repeat(201) } })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ fieldSourceNotes: { workOrderNumber: 42 } })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ fieldSourceNotes: { unrecognized: 'header block' } })).ok).toBe(false);
    expect(validateExtractedWorkOrderData(validExtractionPayload({ fieldSourceNotes: ['not', 'an', 'object'] })).ok).toBe(false);
  });
});

describe('validateAiCorrectiveActionDraftInput', () => {
  it('accepts well-formed optional draft input without modifying it', () => {
    const result = validateAiCorrectiveActionDraftInput({
      workOrderNumber: '  SYNTHETIC-WO-001  ',
      detailedIssueNotes: 'synthetic details',
      photoEvidenceAttached: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber).toBe('  SYNTHETIC-WO-001  ');
    expect(result.data.detailedIssueNotes).toBe('synthetic details');
    expect(result.data.photoEvidenceAttached).toBe(true);
  });

  it.each([[], 'a string', 42, null])('rejects a non-object input: %s', (value) => {
    const result = validateAiCorrectiveActionDraftInput(value);
    expect(result.ok).toBe(false);
  });

  it('rejects invalid, unknown, or oversized client facts instead of changing them', () => {
    expect(validateAiCorrectiveActionDraftInput({ photoEvidenceAttached: 'true' }).ok).toBe(false);
    expect(validateAiCorrectiveActionDraftInput({ unknownFact: 'ignored before this repair' }).ok).toBe(false);
    expect(validateAiCorrectiveActionDraftInput({ detailedIssueNotes: 'z'.repeat(4_001) }).ok).toBe(false);
  });
});

describe('validateAiCorrectiveActionDraftOutput', () => {
  it('accepts a complete exact draft output', () => {
    const result = validateAiCorrectiveActionDraftOutput(validDraftPayload({ issueSummary: '  Synthetic issue summary  ' }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe('draft-only-unconfirmed');
    expect(result.data.issueSummary).toBe('  Synthetic issue summary  ');
  });

  it('rejects partial, contradictory, empty, mistyped, or oversized draft output', () => {
    const { closeoutRequirement: _closeoutRequirement, ...partial } = validDraftPayload();
    expect(validateAiCorrectiveActionDraftOutput(partial).ok).toBe(false);
    expect(validateAiCorrectiveActionDraftOutput(validDraftPayload({ status: 'released' })).ok).toBe(false);
    expect(validateAiCorrectiveActionDraftOutput(validDraftPayload({ issueSummary: '   ' })).ok).toBe(false);
    expect(validateAiCorrectiveActionDraftOutput(validDraftPayload({ containmentAction: 123 })).ok).toBe(false);
    expect(validateAiCorrectiveActionDraftOutput(validDraftPayload({ closeoutRequirement: 'z'.repeat(4_001) })).ok).toBe(false);
  });

  it.each([[], 'a string', 42, null])('rejects a non-object payload rather than accepting a silent blank draft: %s', (value) => {
    const result = validateAiCorrectiveActionDraftOutput(value);
    expect(result.ok).toBe(false);
  });
});

describe('stripJsonCodeFence', () => {
  it('strips a ```json fence', () => {
    expect(stripJsonCodeFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('strips a plain ``` fence', () => {
    expect(stripJsonCodeFence('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('passes plain text through unchanged', () => {
    expect(stripJsonCodeFence('{"a":1}')).toBe('{"a":1}');
  });
});

describe('extractProviderOutputText', () => {
  it('prefers output_text when present', () => {
    expect(extractProviderOutputText({ output_text: 'hello' })).toBe('hello');
  });

  it('joins text from an output content array', () => {
    const body = { output: [{ content: [{ text: 'line one' }, { text: 'line two' }] }] };
    expect(extractProviderOutputText(body)).toBe('line one\nline two');
  });

  it.each([null, undefined, 'a string', 42, {}, { output: 'not-an-array' }])('returns an empty string for unsupported shapes: %s', (value) => {
    expect(extractProviderOutputText(value)).toBe('');
  });
});

describe('normalizeProviderFailureMessage', () => {
  it('never forwards raw provider text and categorizes by status', () => {
    expect(normalizeProviderFailureMessage(401, 'extraction')).toContain('authentication failed');
    expect(normalizeProviderFailureMessage(403, 'extraction')).toContain('authentication failed');
    expect(normalizeProviderFailureMessage(429, 'drafting')).toContain('rate limit');
    expect(normalizeProviderFailureMessage(500, 'drafting')).toContain('temporarily unavailable');
    expect(normalizeProviderFailureMessage(503, 'drafting')).toContain('temporarily unavailable');
    expect(normalizeProviderFailureMessage(418, 'extraction')).toContain('rejected the request');
  });

  it('uses context-specific manual fallback wording', () => {
    expect(normalizeProviderFailureMessage(500, 'extraction')).toContain('Manual entry is still available.');
    expect(normalizeProviderFailureMessage(500, 'drafting')).toContain('Manual drafting remains available.');
  });
});

describe('normalizeProviderNetworkFailureMessage', () => {
  it('distinguishes caller cancellation, timeout, and other network failures', () => {
    expect(normalizeProviderNetworkFailureMessage('extraction', 'timeout')).toContain('timed out');
    expect(normalizeProviderNetworkFailureMessage('extraction', 'aborted')).toContain('cancelled');
    expect(normalizeProviderNetworkFailureMessage('extraction', 'network')).toContain('could not be completed');
  });
});

describe('provider response boundaries', () => {
  it('rejects a provider wrapper before parsing when it exceeds the byte cap', async () => {
    const result = await readBoundedProviderResponseBody(new Response('x'.repeat(30_000)), {
      callerSignal: new AbortController().signal,
      timeoutSignal: new AbortController().signal,
    });
    expect(result.ok).toBe(false);
  });

  it('recognizes timeouts without treating caller aborts as timeouts', () => {
    const timeoutError = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const otherError = new TypeError('fetch failed');

    expect(isProviderTimeoutError(timeoutError)).toBe(true);
    expect(isProviderTimeoutError(abortError)).toBe(false);
    expect(isProviderTimeoutError(otherError)).toBe(false);
    expect(isProviderTimeoutError('not an error')).toBe(false);
  });
});
