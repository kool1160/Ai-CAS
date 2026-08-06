import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/draft-corrective-action/route';

function openAiTextResponse(outputText: string, status = 200) {
  return new Response(JSON.stringify({ output_text: outputText }), { status });
}

function streamFailureResponse(onRead: () => Error) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('{'));
    },
    pull(controller) {
      controller.error(onRead());
    },
  }, { highWaterMark: 0 }));
}

function requestFor(body: unknown, signal?: AbortSignal) {
  return new Request('http://localhost/api/draft-corrective-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

const validDraftFoundation = {
  input: {
    workOrderNumber: 'SYNTHETIC-WO-001',
    shortIssueDescription: 'Synthetic issue description',
  },
};

const validDraftOutput = {
  status: 'draft-only-unconfirmed',
  issueSummary: 'Synthetic issue summary',
  correctiveActionRequired: 'Synthetic corrective action',
  standardWorkRequirement: 'Synthetic standard work',
  responsibilityByOperation: 'Synthetic responsibility',
  containmentAction: 'Synthetic containment',
  inspectionVerificationRequirement: 'Synthetic inspection',
  photoEvidenceReference: 'Synthetic photo reference',
  closeoutRequirement: 'Synthetic closeout',
};

describe('POST /api/draft-corrective-action', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    process.env.OPENAI_API_KEY = 'synthetic-openai-key';
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_DRAFT_MODEL;
  });

  it('fails closed when OPENAI_API_KEY is not configured', async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON request bodies', async () => {
    const response = await POST(new Request('http://localhost/api/draft-corrective-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json {{{',
    }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([null, [], 'not an object', 42])('rejects a valid-JSON non-object request body: %p', async (body) => {
    const response = await POST(requestFor(body));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a request missing aiDraftFoundation.input', async () => {
    const response = await POST(requestFor({}));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a structurally malformed aiDraftFoundation.input', async () => {
    const response = await POST(requestFor({ aiDraftFoundation: { input: 'not-an-object' } }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('generates a bounded draft from a valid provider response', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify(validDraftOutput)));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.draft.status).toBe('draft-only-unconfirmed');
    expect(payload.draft.issueSummary).toBe('Synthetic issue summary');
    expect(payload.missingDraftSections).toEqual([]);
  });

  it('rejects a contradictory provider status rather than overwriting it', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify({ ...validDraftOutput, status: 'released-and-approved' })));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));

    expect(response.status).toBe(502);
  });

  it('rejects oversized client-supplied input before it reaches the provider request', async () => {
    const oversizedFoundation = { input: { detailedIssueNotes: 'z'.repeat(50_000) } };
    const response = await POST(requestFor({ aiDraftFoundation: oversizedFoundation }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes a provider HTTP error without forwarding raw provider text', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: { message: 'internal secret backend detail' } }), { status: 429 }));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).not.toContain('internal secret backend detail');
    expect(payload.error).toContain('rate limit');
  });

  it('normalizes a provider timeout without hanging', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' }));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    const payload = await response.json();

    expect(response.status).toBe(504);
    expect(payload.error).toContain('timed out');
  });

  it('normalizes a generic network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).not.toContain('fetch failed');
  });

  it('fails clearly on unparsable provider output', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse('not valid json {{{'));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    expect(response.status).toBe(502);
  });

  it('fails clearly on a structurally malformed (non-object) provider payload instead of accepting a blank draft', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify('just a string, not the expected object')));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.draft).toBeUndefined();
  });

  it.each([
    ['partial', { ...validDraftOutput, issueSummary: undefined }],
    ['mistyped', { ...validDraftOutput, containmentAction: 123 }],
    ['empty', { ...validDraftOutput, closeoutRequirement: '   ' }],
    ['oversized section', { ...validDraftOutput, issueSummary: 'z'.repeat(4_001) }],
  ])('rejects %s provider draft output', async (_label, output) => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify(output)));
    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    expect(response.status).toBe(502);
  });

  it('rejects an oversized provider response', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse('x'.repeat(20_001)));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    expect(response.status).toBe(502);
  });

  it('rejects an oversized provider wrapper before parsing it', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ output_text: JSON.stringify(validDraftOutput), padding: 'x'.repeat(30_000) })));
    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    expect(response.status).toBe(502);
  });

  it('propagates caller abort separately from provider timeout', async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockImplementation((_url, init: RequestInit) => {
      expect((init.signal as AbortSignal).aborted).toBe(true);
      return Promise.reject(Object.assign(new Error('caller aborted'), { name: 'AbortError' }));
    });

    const response = await POST(new Request('http://localhost/api/draft-corrective-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiDraftFoundation: validDraftFoundation }),
      signal: controller.signal,
    }));
    const payload = await response.json();

    expect(response.status).toBe(499);
    expect(payload.error).toContain('cancelled');
  });

  it('preserves caller cancellation while reading a provider response stream', async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue(streamFailureResponse(() => {
      controller.abort();
      return Object.assign(new Error('stream aborted'), { name: 'AbortError' });
    }));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }, controller.signal));
    const payload = await response.json();

    expect(response.status).toBe(499);
    expect(payload.error).toContain('cancelled');
  });

  it('preserves provider timeout while reading a provider response stream', async () => {
    const timeoutController = new AbortController();
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    fetchMock.mockResolvedValue(streamFailureResponse(() => {
      timeoutController.abort(Object.assign(new Error('stream timed out'), { name: 'TimeoutError' }));
      return Object.assign(new Error('stream aborted'), { name: 'AbortError' });
    }));

    try {
      const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
      const payload = await response.json();

      expect(response.status).toBe(504);
      expect(payload.error).toContain('timed out');
    } finally {
      timeoutSpy.mockRestore();
    }
  });

  it('fails clearly when the provider returns no readable output', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(''));

    const response = await POST(requestFor({ aiDraftFoundation: validDraftFoundation }));
    expect(response.status).toBe(502);
  });
});
