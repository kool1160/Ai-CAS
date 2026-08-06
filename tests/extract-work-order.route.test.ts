import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/extract-work-order/route';

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

function requestWithFile(file: File | null, signal?: AbortSignal) {
  const formData = new FormData();
  if (file) formData.append('file', file);
  return new Request('http://localhost/api/extract-work-order', { method: 'POST', body: formData, signal });
}

function syntheticImageFile(size = 1024) {
  return new File([new Uint8Array(size)], 'synthetic-router.png', { type: 'image/png' });
}

const validExtractionOutput = (overrides: Record<string, unknown> = {}) => ({
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

describe('POST /api/extract-work-order', () => {
  const fetchMock = vi.fn();
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    process.env.OPENAI_API_KEY = 'synthetic-openai-key';
    fetchMock.mockReset();
    infoSpy.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_VISION_MODEL;
  });

  it('fails closed when OPENAI_API_KEY is not configured', async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await POST(requestWithFile(syntheticImageFile()));
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a request with no file', async () => {
    const response = await POST(requestWithFile(null));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a non-image file', async () => {
    const file = new File(['synthetic text'], 'notes.txt', { type: 'text/plain' });
    const response = await POST(requestWithFile(file));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an oversized upload', async () => {
    const response = await POST(requestWithFile(syntheticImageFile(9 * 1024 * 1024)));
    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('extracts and bounds a valid provider response', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify(validExtractionOutput({
      workOrderNumber: 'SYNTHETIC-WO-001',
      partNumber: 'SYNTHETIC-PART-001',
      fieldSourceNotes: { workOrderNumber: 'header block' },
    }))));

    const response = await POST(requestWithFile(syntheticImageFile()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.extracted.workOrderNumber).toBe('SYNTHETIC-WO-001');
    expect(payload.extractionSource).toBe('openai-vision');
    expect(payload.missingExpectedFields).toContain('routerStepOperation');
    expect(payload.fieldSourceNotes).toEqual({ workOrderNumber: 'header block' });
  });

  it('strips a ```json code fence from the provider output', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(`\`\`\`json\n${JSON.stringify(validExtractionOutput({ workOrderNumber: 'SYNTHETIC-WO-002' }))}\n\`\`\``));

    const response = await POST(requestWithFile(syntheticImageFile()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.extracted.workOrderNumber).toBe('SYNTHETIC-WO-002');
  });

  it('normalizes a provider HTTP error without forwarding raw provider text', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: { message: 'internal secret backend detail' } }), { status: 429 }));

    const response = await POST(requestWithFile(syntheticImageFile()));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).not.toContain('internal secret backend detail');
    expect(payload.error).toContain('rate limit');
  });

  it('normalizes a provider timeout without hanging', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' }));

    const response = await POST(requestWithFile(syntheticImageFile()));
    const payload = await response.json();

    expect(response.status).toBe(504);
    expect(payload.error).toContain('timed out');
  });

  it('normalizes a generic network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const response = await POST(requestWithFile(syntheticImageFile()));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).not.toContain('fetch failed');
  });

  it('fails clearly on unparsable provider output', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse('not valid json {{{'));

    const response = await POST(requestWithFile(syntheticImageFile()));
    expect(response.status).toBe(502);
  });

  it('fails clearly on a structurally malformed (non-object) provider payload instead of silently accepting a blank extraction', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify(['unexpected', 'array', 'shape'])));

    const response = await POST(requestWithFile(syntheticImageFile()));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.extracted).toBeUndefined();
  });

  it.each([
    ['partial', validExtractionOutput({ workOrderNumber: undefined })],
    ['mistyped', validExtractionOutput({ partNumber: 123 })],
    ['oversized field', validExtractionOutput({ notes: 'z'.repeat(4_001) })],
  ])('rejects %s provider extraction output', async (_label, output) => {
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify(output)));
    const response = await POST(requestWithFile(syntheticImageFile()));
    expect(response.status).toBe(502);
  });

  it('rejects an oversized provider response', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse('x'.repeat(20_001)));

    const response = await POST(requestWithFile(syntheticImageFile()));
    expect(response.status).toBe(502);
  });

  it('rejects an oversized provider wrapper before parsing it', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ output_text: JSON.stringify(validExtractionOutput()), padding: 'x'.repeat(30_000) })));
    const response = await POST(requestWithFile(syntheticImageFile()));
    expect(response.status).toBe(502);
  });

  it('propagates caller abort separately from provider timeout', async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockImplementation((_url, init: RequestInit) => {
      expect((init.signal as AbortSignal).aborted).toBe(true);
      return Promise.reject(Object.assign(new Error('caller aborted'), { name: 'AbortError' }));
    });

    const response = await POST(requestWithFile(syntheticImageFile(), controller.signal));
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

    const response = await POST(requestWithFile(syntheticImageFile(), controller.signal));
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
      const response = await POST(requestWithFile(syntheticImageFile()));
      const payload = await response.json();

      expect(response.status).toBe(504);
      expect(payload.error).toContain('timed out');
    } finally {
      timeoutSpy.mockRestore();
    }
  });

  it('fails clearly when the provider returns no readable output', async () => {
    fetchMock.mockResolvedValue(openAiTextResponse(''));

    const response = await POST(requestWithFile(syntheticImageFile()));
    expect(response.status).toBe(502);
  });

  it('does not write extracted document text into server logs', async () => {
    const sensitiveNoteValue = 'SYNTHETIC-DO-NOT-LOG-DOCUMENT-TEXT-MARKER';
    fetchMock.mockResolvedValue(openAiTextResponse(JSON.stringify(validExtractionOutput({
      workOrderNumber: 'SYNTHETIC-WO-003',
      fieldSourceNotes: { workOrderNumber: sensitiveNoteValue },
    }))));

    await POST(requestWithFile(syntheticImageFile()));

    const loggedText = infoSpy.mock.calls.map((call) => JSON.stringify(call)).join('\n');
    expect(loggedText).not.toContain(sensitiveNoteValue);
  });
});
