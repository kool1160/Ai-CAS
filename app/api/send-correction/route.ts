import { NextResponse } from 'next/server';

const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 100_000;
const MAX_CONTEXT_LENGTH = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SendCorrectionRequest = {
  subjectLine?: unknown;
  reportText?: unknown;
  emailDraftText?: unknown;
  workOrderNumber?: unknown;
  partNumber?: unknown;
  correctionType?: unknown;
  affectedArea?: unknown;
  senderDisplayName?: unknown;
  submittedByName?: unknown;
  submittedByEmail?: unknown;
  companyName?: unknown;
  sendPin?: unknown;
  finalReviewConfirmed?: unknown;
};

function cleanValue(value: unknown, maxLength = MAX_CONTEXT_LENGTH) {
  if (typeof value !== 'string') return '';
  const cleaned = value.trim();
  return cleaned.length <= maxLength ? cleaned : '';
}

function hasHeaderInjection(value: string) {
  return /[\r\n]/.test(value);
}

function isConfiguredEmail(value: string) {
  return Boolean(value) && value.length <= MAX_CONTEXT_LENGTH && !hasHeaderInjection(value) && EMAIL_PATTERN.test(value);
}

function isConfiguredSender(value: string) {
  if (!value || value.length > MAX_CONTEXT_LENGTH || hasHeaderInjection(value)) return false;
  const address = value.match(/<([^<>]+)>/)?.[1] || value;
  return isConfiguredEmail(address);
}

function isEmailReleaseEnabled() {
  return process.env.AI_CAS_EMAIL_RELEASE_ENABLED?.trim() === 'true';
}

const payloadStringLimits: Record<string, number> = {
  subjectLine: MAX_SUBJECT_LENGTH,
  reportText: MAX_BODY_LENGTH,
  emailDraftText: MAX_BODY_LENGTH,
  workOrderNumber: MAX_CONTEXT_LENGTH,
  partNumber: MAX_CONTEXT_LENGTH,
  correctionType: MAX_CONTEXT_LENGTH,
  affectedArea: MAX_CONTEXT_LENGTH,
  senderDisplayName: MAX_CONTEXT_LENGTH,
  submittedByName: MAX_CONTEXT_LENGTH,
  submittedByEmail: MAX_CONTEXT_LENGTH,
  companyName: MAX_CONTEXT_LENGTH,
  sendPin: 64,
  recipientEmail: MAX_CONTEXT_LENGTH,
};

function hasInvalidPayloadStrings(payload: SendCorrectionRequest) {
  for (const [key, maxLength] of Object.entries(payloadStringLimits)) {
    const value = payload[key as keyof SendCorrectionRequest];
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.length > maxLength) return true;
    if (['subjectLine', 'recipientEmail', 'senderDisplayName', 'submittedByEmail'].includes(key) && hasHeaderInjection(value)) return true;
  }

  const submittedByEmail = cleanValue(payload.submittedByEmail);
  return Boolean(submittedByEmail) && !isConfiguredEmail(submittedByEmail);
}

function buildEmailBody(payload: SendCorrectionRequest, reportText: string, emailDraftText: string) {
  const workOrderNumber = cleanValue(payload.workOrderNumber) || 'Not provided';
  const partNumber = cleanValue(payload.partNumber) || 'Not provided';
  const correctionType = cleanValue(payload.correctionType) || 'Not provided';
  const affectedArea = cleanValue(payload.affectedArea) || 'Not provided';
  const companyName = cleanValue(payload.companyName);
  const submittedByName = cleanValue(payload.submittedByName);
  const submittedByEmail = cleanValue(payload.submittedByEmail);
  const submittedBy = [submittedByName, submittedByEmail].filter(Boolean).join(' / ');

  return `AI-CAS Corrective Action Draft / Human Review Confirmed

This message contains an AI-CAS draft prepared for human review. It is not an automatic release or approval.

Work Order: ${workOrderNumber}
Part Number: ${partNumber}
Correction Type: ${correctionType}
Affected Area: ${affectedArea}${companyName ? `\nCompany: ${companyName}` : ''}${submittedBy ? `\nSubmitted By: ${submittedBy}` : ''}

Approved Email Draft:
${emailDraftText}

Complete Submitted Report:
${reportText}

Evidence files or images are not attached to this message.`;
}

export async function POST(request: Request) {
  if (!isEmailReleaseEnabled()) {
    return NextResponse.json({ error: 'Email release is disabled.' }, { status: 503 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const configuredSendPin = cleanValue(process.env.REFAB_CONNECT_SEND_PIN, 64);
  const recipient = cleanValue(process.env.REFAB_CONNECT_EMAIL_TO);
  const from = cleanValue(process.env.REFAB_CONNECT_EMAIL_FROM);

  if (!apiKey || !/^\d{4}$/.test(configuredSendPin) || !recipient || !from) {
    return NextResponse.json({ error: 'Server email release configuration is incomplete.' }, { status: 503 });
  }

  if (!isConfiguredEmail(recipient) || !isConfiguredSender(from)) {
    return NextResponse.json({ error: 'Server email release configuration is invalid.' }, { status: 503 });
  }

  let payload: SendCorrectionRequest;

  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid send request.' }, { status: 400 });
    }
    payload = parsed as SendCorrectionRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid send request.' }, { status: 400 });
  }

  if (payload.finalReviewConfirmed !== true) {
    return NextResponse.json({ error: 'Final review confirmation is required.' }, { status: 400 });
  }

  if (hasInvalidPayloadStrings(payload)) {
    return NextResponse.json({ error: 'Invalid send request content.' }, { status: 400 });
  }

  const submittedSendPin = cleanValue(payload.sendPin, 64);
  if (!/^\d{4}$/.test(submittedSendPin) || submittedSendPin !== configuredSendPin) {
    return NextResponse.json({ error: 'Incorrect Send PIN. Email was not sent.' }, { status: 401 });
  }

  const subjectLine = cleanValue(payload.subjectLine, MAX_SUBJECT_LENGTH);
  const reportText = cleanValue(payload.reportText, MAX_BODY_LENGTH);
  const emailDraftText = cleanValue(payload.emailDraftText, MAX_BODY_LENGTH);

  if (!subjectLine || hasHeaderInjection(subjectLine) || !reportText || !emailDraftText) {
    return NextResponse.json({ error: 'Missing or invalid generated report, email draft, or subject line.' }, { status: 400 });
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: subjectLine,
      text: buildEmailBody(payload, reportText, emailDraftText),
    }),
  });

  let responseBody: unknown = null;
  try {
    responseBody = await resendResponse.json();
  } catch {
    responseBody = null;
  }

  if (!resendResponse.ok) {
    return NextResponse.json({ error: 'Email provider rejected the request.' }, { status: 502 });
  }

  const resendId = typeof responseBody === 'object' && responseBody !== null && 'id' in responseBody && typeof responseBody.id === 'string'
    ? responseBody.id
    : null;

  return NextResponse.json({ sent: true, resendId });
}
