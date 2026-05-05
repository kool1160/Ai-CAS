import { NextResponse } from 'next/server';

const TARGET_RECIPIENT = 'kool1160@gmail.com';
const RESEND_FROM = 'REFAB Connect <onboarding@resend.dev>';

type SendCorrectionRequest = {
  subjectLine?: string;
  reportText?: string;
  emailDraftText?: string;
  workOrderNumber?: string;
  partNumber?: string;
  correctionType?: string;
  affectedArea?: string;
};

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildEmailBody(payload: SendCorrectionRequest) {
  const emailDraftText = cleanValue(payload.emailDraftText);
  const reportText = cleanValue(payload.reportText);

  return `${emailDraftText}

---

ENGINEERING REPORT

${reportText}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured. Email was not sent.' },
      { status: 503 },
    );
  }

  let payload: SendCorrectionRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid send request.' }, { status: 400 });
  }

  const subjectLine = cleanValue(payload.subjectLine);
  const reportText = cleanValue(payload.reportText);
  const emailDraftText = cleanValue(payload.emailDraftText);

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
      from: RESEND_FROM,
      to: [TARGET_RECIPIENT],
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
    recipient: TARGET_RECIPIENT,
    resendId: typeof responseBody?.id === 'string' ? responseBody.id : null,
  });
}
