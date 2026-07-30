import { describe, expect, it } from 'vitest';
import {
  extractProviderOutputText,
  isProviderTimeoutError,
  normalizeProviderFailureMessage,
  normalizeProviderNetworkFailureMessage,
  stripJsonCodeFence,
  validateAiCorrectiveActionDraftInput,
  validateAiCorrectiveActionDraftOutput,
  validateExtractedWorkOrderData,
} from '../features/woc/state/aiContracts';

describe('validateExtractedWorkOrderData', () => {
  it('bounds and trims a well-formed extraction payload', () => {
    const result = validateExtractedWorkOrderData({
      workOrderNumber: '  SYNTHETIC-WO-001  ',
      partNumber: 'SYNTHETIC-PART-001',
      fieldSourceNotes: { workOrderNumber: 'header block' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber).toBe('SYNTHETIC-WO-001');
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

  it('bounds oversized field values instead of accepting them unbounded', () => {
    const result = validateExtractedWorkOrderData({ workOrderNumber: 'x'.repeat(10_000), detailedIssueNotes: 'y'.repeat(10_000) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber?.length).toBeLessThanOrEqual(400);
    expect(result.data.detailedIssueNotes?.length).toBeLessThanOrEqual(4_000);
  });

  it('strips unsafe control characters from extracted values', () => {
    const result = validateExtractedWorkOrderData({ workOrderNumber: 'SYNTHETIC\u0000\u0007-WO' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber).toBe('SYNTHETIC-WO');
  });

  it('coerces non-string field values to an empty string rather than throwing', () => {
    const result = validateExtractedWorkOrderData({ workOrderNumber: 12345, partNumber: { nested: true } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber).toBe('');
    expect(result.data.partNumber).toBe('');
  });

  it('bounds field-source notes to a maximum entry count and per-note length', () => {
    const manyNotes = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`field${index}`, 'note text']));
    const result = validateExtractedWorkOrderData({ fieldSourceNotes: manyNotes });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.data.fieldSourceNotes ?? {}).length).toBeLessThanOrEqual(40);

    const longNote = validateExtractedWorkOrderData({ fieldSourceNotes: { workOrderNumber: 'z'.repeat(1_000) } });
    expect(longNote.ok).toBe(true);
    if (!longNote.ok) return;
    expect(longNote.data.fieldSourceNotes?.workOrderNumber.length).toBeLessThanOrEqual(200);
  });

  it('drops non-string field-source note values and non-object note containers', () => {
    const result = validateExtractedWorkOrderData({ fieldSourceNotes: { workOrderNumber: 42, partNumber: 'header block' } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.fieldSourceNotes).toEqual({ partNumber: 'header block' });

    const notObject = validateExtractedWorkOrderData({ fieldSourceNotes: ['not', 'an', 'object'] });
    expect(notObject.ok).toBe(true);
    if (!notObject.ok) return;
    expect(notObject.data.fieldSourceNotes).toEqual({});
  });
});

describe('validateAiCorrectiveActionDraftInput', () => {
  it('bounds a well-formed draft input', () => {
    const result = validateAiCorrectiveActionDraftInput({
      workOrderNumber: '  SYNTHETIC-WO-001  ',
      detailedIssueNotes: 'z'.repeat(10_000),
      photoEvidenceAttached: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workOrderNumber).toBe('SYNTHETIC-WO-001');
    expect(result.data.detailedIssueNotes?.length).toBeLessThanOrEqual(4_000);
    expect(result.data.photoEvidenceAttached).toBe(true);
  });

  it.each([[], 'a string', 42, null])('rejects a non-object input: %s', (value) => {
    const result = validateAiCorrectiveActionDraftInput(value);
    expect(result.ok).toBe(false);
  });

  it('only accepts a strict boolean true for photoEvidenceAttached', () => {
    const truthyString = validateAiCorrectiveActionDraftInput({ photoEvidenceAttached: 'true' });
    expect(truthyString.ok).toBe(true);
    if (!truthyString.ok) return;
    expect(truthyString.data.photoEvidenceAttached).toBe(false);
  });
});

describe('validateAiCorrectiveActionDraftOutput', () => {
  it('bounds a well-formed draft output and forces the literal status', () => {
    const result = validateAiCorrectiveActionDraftOutput({
      status: 'released',
      issueSummary: '  Synthetic issue summary  ',
      correctiveActionRequired: 'x'.repeat(10_000),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe('draft-only-unconfirmed');
    expect(result.data.issueSummary).toBe('Synthetic issue summary');
    expect(result.data.correctiveActionRequired.length).toBeLessThanOrEqual(4_000);
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
  it('distinguishes timeout from other network failures', () => {
    expect(normalizeProviderNetworkFailureMessage('extraction', true)).toContain('timed out');
    expect(normalizeProviderNetworkFailureMessage('extraction', false)).toContain('could not be completed');
  });
});

describe('isProviderTimeoutError', () => {
  it('recognizes AbortSignal.timeout and abort errors', () => {
    const timeoutError = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const otherError = new TypeError('fetch failed');

    expect(isProviderTimeoutError(timeoutError)).toBe(true);
    expect(isProviderTimeoutError(abortError)).toBe(true);
    expect(isProviderTimeoutError(otherError)).toBe(false);
    expect(isProviderTimeoutError('not an error')).toBe(false);
  });
});
