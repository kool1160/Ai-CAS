import { NextResponse } from 'next/server';

const DEFAULT_RESEND_FROM = 'AI-CAS <onboarding@resend.dev>';
const DEFAULT_RESEND_TEST_RECIPIENT = 'kool1160@gmail.com';

type SendCorrectionRequest = {
  subjectLine?: string;
  reportText?: string;
  emailDraftText?: string;
  workOrderNumber?: string;
  partNumber?: string;
  correctionType?: string;
  affectedArea?: string;
  affectedOperationEquipment?: string;
  recipientEmail?: string;
  senderDisplayName?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  companyName?: string;
  pdfBase64?: string;
  pdfFileName?: string;
};

type ResendAttachment = {
  filename: string;
  content: string;
};

type RecipientResolution = {
  recipient: string;
  intendedRecipient: string;
  testModeRedirected: boolean;
};

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveConfiguredRecipient(payload: SendCorrectionRequest) {
  return cleanValue(payload.recipientEmail) || cleanValue(process.env.REFAB_CONNECT_EMAIL_TO);
}

function resolveSender() {
  return cleanValue(process.env.REFAB_CONNECT_EMAIL_FROM) || DEFAULT_RESEND_FROM;
}

function isResendTestSender(from: string) {
  return from.toLowerCase().includes('onboarding@resend.dev');
}

function resolveRecipient(payload: SendCorrectionRequest, from: string): RecipientResolution {
  const intendedRecipient = resolveConfiguredRecipient(payload);
  const testRecipient = cleanValue(process.env.RESEND_TEST_RECIPIENT) || DEFAULT_RESEND_TEST_RECIPIENT;

  if (isResendTestSender(from) && intendedRecipient && intendedRecipient.toLowerCase() !== testRecipient.toLowerCase()) {
    return {
      recipient: testRecipient,
      intendedRecipient,
      testModeRedirected: true,
    };
  }

  return {
    recipient: intendedRecipient,
    intendedRecipient,
    testModeRedirected: false,
  };
}

function normalizePdfFileName(value: string) {
  const fallback = 'ai-cas-corrective-action.pdf';
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

  if (!normalized) return fallback;
  return normalized.toLowerCase().endsWith('.pdf') ? normalized : `${normalized}.pdf`;
}

function buildPdfAttachment(payload: SendCorrectionRequest): ResendAttachment | null {
  const pdfBase64 = cleanValue(payload.pdfBase64);
  const pdfFileName = normalizePdfFileName(cleanValue(payload.pdfFileName));

  if (!pdfBase64 && !cleanValue(payload.pdfFileName)) return null;

  if (!pdfBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64)) {
    throw new Error('Invalid PDF attachment payload. Generate the controlled PDF again before sending.');
  }

  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  if (pdfBuffer.length === 0 || pdfBuffer.subarray(0, 4).toString('latin1') !== '%PDF') {
    throw new Error('Invalid PDF attachment payload. Only controlled PDF attachments are supported.');
  }

  return {
    filename: pdfFileName,
    content: pdfBase64,
  };
}

function sanitizeSubjectLine(value: string) {
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250);
}

function normalizeContentForComparison(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function shouldAppendReportText(emailDraftText: string, reportText: string) {
  if (!emailDraftText || !reportText) return false;

  const normalizedEmailDraft = normalizeContentForComparison(emailDraftText);
  const normalizedReport = normalizeContentForComparison(reportText);

  if (!normalizedEmailDraft || !normalizedReport) return false;

  return !normalizedEmailDraft.includes(normalizedReport) && !normalizedReport.includes(normalizedEmailDraft);
}

function buildTestModeNotice(recipientResolution: RecipientResolution) {
  if (!recipientResolution.testModeRedirected) return '';

  return `AI-CAS beta email routing notice:\nThis message was redirected to ${recipientResolution.recipient} because the current Resend test sender can only deliver to the verified test inbox. Intended recipient: ${recipientResolution.intendedRecipient}.\n\n---\n\n`;
}

function buildCorrectiveActionEmailBody(payload: SendCorrectionRequest, recipientResolution: RecipientResolution) {
  const emailDraftText = cleanValue(payload.emailDraftText);
  const reportText = cleanValue(payload.reportText);
  const testModeNotice = buildTestModeNotice(recipientResolution);

  if (emailDraftText) {
    if (shouldAppendReportText(emailDraftText, reportText)) {
      return `${testModeNotice}${emailDraftText}

---

Full AI-CAS Corrective Action Report:

${reportText}`;
    }

    return `${testModeNotice}${emailDraftText}`;
  }

  const fallbackBody = buildEmailBody(payload);

  if (reportText) {
    return `${testModeNotice}${fallbackBody}

---

Full AI-CAS Corrective Action Report:

${reportText}`;
  }

  return `${testModeNotice}${fallbackBody}`;
}

function buildEmailBody(payload: SendCorrectionRequest) {
  const workOrderNumber = cleanValue(payload.workOrderNumber) || 'Not provided';
  const partNumber = cleanValue(payload.partNumber) || 'Not provided';
  const correctionType = cleanValue(payload.correctionType) || 'Not provided';
  const affectedArea = cleanValue(payload.affectedArea) || 'Not provided';
  const affectedOperationEquipment = cleanValue(payload.affectedOperationEquipment);
  const companyName = cleanValue(payload.companyName);
  const submittedByName = cleanValue(payload.submittedByName);
  const submittedByEmail = cleanValue(payload.submittedByEmail);

  const submittedBy = [submittedByName, submittedByEmail].filter(Boolean).join(' / ');

  return `Engineering Team,

A work order correction has been submitted through AI-CAS.

Work Order: ${workOrderNumber}
Part Number: ${partNumber}
Correction Type: ${correctionType}
Affected Area: ${affectedArea}${affectedOperationEquipment ? `\nAffected Operation / Equipment: ${affectedOperationEquipment}` : ''}${companyName ? `\nCompany: ${companyName}` : ''}${submittedBy ? `\nSubmitted By: ${submittedBy}` : ''}

Please review the Corrective Action Report for the full issue summary and requested Engineering action.

Thank you,
AI-CAS`;
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

  const subjectLine = sanitizeSubjectLine(cleanValue(payload.subjectLine));
  const reportText = cleanValue(payload.reportText);
  const emailDraftText = cleanValue(payload.emailDraftText);
  const from = resolveSender();
  const recipientResolution = resolveRecipient(payload, from);
  const recipient = recipientResolution.recipient;

  let pdfAttachment: ResendAttachment | null = null;

  try {
    pdfAttachment = buildPdfAttachment(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid PDF attachment payload.' },
      { status: 400 },
    );
  }

  if (!recipient) {
    return NextResponse.json(
      { error: 'No Engineering recipient email is configured. Add one in Setup/Admin or set REFAB_CONNECT_EMAIL_TO.' },
      { status: 400 },
    );
  }

  if (!subjectLine || (!reportText && !emailDraftText)) {
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
      text: buildCorrectiveActionEmailBody(payload, recipientResolution),
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
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
    intendedRecipient: recipientResolution.intendedRecipient || recipient,
    testModeRedirected: recipientResolution.testModeRedirected,
    resendId: typeof responseBody?.id === 'string' ? responseBody.id : null,
  });
}