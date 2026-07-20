import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/send-correction/route';

const basePayload = {
  subjectLine: 'Synthetic corrective action review',
  reportText: 'Complete synthetic report text with the submitted issue and requested action.',
  emailDraftText: 'Please review this synthetic corrective-action draft.',
  workOrderNumber: 'SYNTHETIC-WO-001',
  partNumber: 'SYNTHETIC-PART-001',
  correctionType: 'Synthetic correction type',
  affectedArea: 'Synthetic affected area',
  companyName: 'SYNTHETIC-COMPANY',
  submittedByName: 'Synthetic Operator',
  submittedByEmail: 'operator@example.invalid',
  sendPin: '1234',
  finalReviewConfirmed: true,
};

function requestFor(payload: Record<string, unknown> = basePayload) {
  return new Request('http://localhost/api/send-correction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

describe('POST /api/send-correction', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    process.env.AI_CAS_EMAIL_RELEASE_ENABLED = 'true';
    process.env.RESEND_API_KEY = 'synthetic-resend-key';
    process.env.REFAB_CONNECT_SEND_PIN = '1234';
    process.env.REFAB_CONNECT_EMAIL_TO = 'engineering@example.invalid';
    process.env.REFAB_CONNECT_EMAIL_FROM = 'AI-CAS <ai-cas@example.invalid>';
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'synthetic-resend-id' }), { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const key of [
      'AI_CAS_EMAIL_RELEASE_ENABLED',
      'RESEND_API_KEY',
      'REFAB_CONNECT_SEND_PIN',
      'REFAB_CONNECT_EMAIL_TO',
      'REFAB_CONNECT_EMAIL_FROM',
    ]) delete process.env[key];
    fetchMock.mockReset();
  });

  it.each([undefined, 'false', 'True', 'TRUE', '1', 'yes'])('fails closed for release flag %s', async (flag) => {
    if (flag === undefined) delete process.env.AI_CAS_EMAIL_RELEASE_ENABLED;
    else process.env.AI_CAS_EMAIL_RELEASE_ENABLED = flag;

    const response = await POST(requestFor());

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([undefined, false, 'true', 1, {}])('requires a literal boolean final review confirmation: %s', async (confirmation) => {
    const response = await POST(requestFor({ ...basePayload, finalReviewConfirmed: confirmation }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses only the server-configured destination and includes the approved draft and complete report', async () => {
    const response = await POST(requestFor({ ...basePayload, recipientEmail: 'attacker@example.invalid' }));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(String(init.body));

    expect(sent.to).toEqual(['engineering@example.invalid']);
    expect(sent.from).toBe('AI-CAS <ai-cas@example.invalid>');
    expect(sent.text).toContain(basePayload.emailDraftText);
    expect(sent.text).toContain(basePayload.reportText);
    expect(sent.text).toContain(basePayload.workOrderNumber);
    expect(sent.text).toContain(basePayload.partNumber);
    expect(sent.text).toContain(basePayload.correctionType);
    expect(sent.text).toContain(basePayload.affectedArea);
    expect(sent.text).toContain(basePayload.companyName);
    expect(sent.text).toContain(basePayload.submittedByName);
    expect(sent.text).not.toContain('Refab Connect');
    expect(sent.text).toContain('not attached');
  });

  it('fails closed when the server recipient is missing or unsafe', async () => {
    delete process.env.REFAB_CONNECT_EMAIL_TO;
    let response = await POST(requestFor());
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();

    process.env.REFAB_CONNECT_EMAIL_TO = 'engineering@example.invalid\r\nBcc: attacker@example.invalid';
    response = await POST(requestFor());
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed when provider credentials or sender configuration are missing', async () => {
    delete process.env.RESEND_API_KEY;
    let response = await POST(requestFor());
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();

    process.env.RESEND_API_KEY = 'synthetic-resend-key';
    delete process.env.REFAB_CONNECT_SEND_PIN;
    response = await POST(requestFor());
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();

    process.env.REFAB_CONNECT_SEND_PIN = '1234';
    delete process.env.REFAB_CONNECT_EMAIL_FROM;
    response = await POST(requestFor());
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { subjectLine: '' },
    { reportText: '' },
    { emailDraftText: '' },
    { subjectLine: 'x'.repeat(201) },
    { reportText: 'x'.repeat(100_001) },
  ])('rejects missing or oversized content: %s', async (invalidContent) => {
    const response = await POST(requestFor({ ...basePayload, ...invalidContent }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects malformed content before the provider call', async () => {
    const response = await POST(requestFor({ ...basePayload, subjectLine: 'Injected\r\nBcc: attacker@example.invalid' }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not call the provider twice for one accepted request', async () => {
    await POST(requestFor());

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
