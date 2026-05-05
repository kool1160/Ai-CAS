import { NextResponse } from 'next/server';

const DEFAULT_RESEND_FROM = 'REFAB Connect <onboarding@resend.dev>';

type SendCorrectionRequest = {
  subjectLine?: string;
  reportText?: string;
  emailDraftText?: string;
  workOrderNumber?: string;
  partNumber?: string;
  correctionType?: string;
  affectedArea?: string;
  recipientEmail?: string;
  senderDisplayName?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  companyName?: string;
  sendPin?: string;
};

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveRecipient(payload: SendCorrectionRequest) {
  return cleanValue(payload.recipientEmail) || cleanValue(process.env.REFAB_CONNECT_EMAIL_TO);
}

function resolveSender() {
  return cleanValue(process.env.REFAB_CONNECT_EMAIL_FROM) || DEFAULT_RESEND_FROM;
}

function buildEmailBody(payload: SendCorrectionRequest) {
  const workOrderNumber = cleanValue(payload.workOrderNumber) || 'Not provided';
  const partNumber = cleanValue(payload.partNumber) || 'Not provided';
  const correctionType = cleanValue(payload.correctionType) || 'Not provided';
  const affectedArea = cleanValue(payload.affectedArea) || 'Not provided';
  const companyName = cleanValue(payload.companyName);
  const submittedByName = cleanValue(payload.submittedByName);
  const submittedByEmail = cleanValue(payload.submittedByEmail);

  const submittedBy = [submittedByName, submittedByEmail].filter(Boolean).join(' / ');

  return `Engineering Team,

A work order correction has been submitted through Refab Connect.

Work Order: ${workOrderNumber}
Part Number: ${partNumber}
Correction Type: ${correctionType}
Affected Area: ${affectedArea}${companyName ? `\nCompany: ${companyName}` : ''}${submittedBy ? `\nSubmitted By: ${submittedBy}` : ''}

Please review the Engineering Correction Report for the full issue summary and requested Engineering action.

Thank you,
Refab Connect`;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredSendPin = cleanValue(process.env.REFAB_CONNECT_SEND_PIN);

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured. Email was not sent.' },
      { status: 503 },
    );
  }

  if (!configuredSendPin) {
    return NextResponse.json(
      { error: 'REFAB_CONNECT_SEND_PIN is not configured. Email was not sent.' },
      { status: 503 },
    );
  }

  let payload: SendCorrectionRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid send request.' }, { status: 400 });
  }

  const submittedSendPin = cleanValue(payload.sendPin);

  if (!/^\d{4}$/.test(submittedSendPin) || submittedSendPin !== configuredSendPin) {
    return NextResponse.json({ error: 'Incorrect Send PIN. Email was not sent.' }, { status: 401 });
  }

  const subjectLine = cleanValue(payload.subjectLine);
  const reportText = cleanValue(payload.reportText);
  const emailDraftText = cleanValue(payload.emailDraftText);
  const recipient = resolveRecipient(payload);
  const from = resolveSender();

  if (!recipient) {
    return NextResponse.json(
      { error: 'No Engineering recipient email is configured. Add one in Setup/Admin or set REFAB_CONNECT_EMAIL_TO.' },
      { status: 400 },
    );
  }

  if (!subjectLine || !reportText || !emailDraftText) {
    return NextResponse.json(
      { error: 'Missing generated report, email draft, or subject line.' },
      { status: 400 },
    );
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
      text: buildEmailBody(payload),
    }),
  });

  const responseBody = await resendResponse.json();

  if (!resendResponse.ok) {
    const errorMessage =
      typeof responseBody?.message === 'string'
        ? responseBody.message
        : typeof responseBody?.error === 'string'
          ? responseBody.error
          : 'Resend email send failed.';

    return NextResponse.json({ error: errorMessage }, { status: resendResponse.status });
  }

  return NextResponse.json({
    sent: true,
    recipient,
    resendId: typeof responseBody?.id === 'string' ? responseBody.id : null,
  });
}
