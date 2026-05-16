import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { NextResponse } from 'next/server';
import { CorrectiveActionPdfDocument } from '../../../features/woc/components/pdf/CorrectiveActionPdfDocument';
import type { ControlledCorrectiveActionPdfTemplate } from '../../../features/woc/logic/controlledPdfTemplateFoundation';

export const runtime = 'nodejs';

type GeneratePdfRequestBody = {
  template?: ControlledCorrectiveActionPdfTemplate;
  finalReviewConfirmed?: boolean;
  confirmations?: {
    finalReviewConfirmed?: boolean;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isControlledPdfTemplate(value: unknown): value is ControlledCorrectiveActionPdfTemplate {
  if (!isRecord(value)) return false;

  return (
    isString(value.templateName) &&
    isString(value.templateVersion) &&
    isString(value.modelSource) &&
    isString(value.status) &&
    isString(value.releaseGate) &&
    Array.isArray(value.layoutNotes) &&
    value.layoutNotes.every(isString) &&
    Array.isArray(value.sections) &&
    value.sections.every((section) => {
      if (!isRecord(section)) return false;

      return (
        isString(section.sectionId) &&
        isString(section.title) &&
        isString(section.layoutHint) &&
        Array.isArray(section.fields) &&
        section.fields.every((field) => (
          isRecord(field) &&
          isString(field.label) &&
          isString(field.value) &&
          typeof field.required === 'boolean'
        ))
      );
    })
  );
}

function getTemplateFromBody(body: unknown) {
  if (isControlledPdfTemplate(body)) return body;
  if (isRecord(body) && isControlledPdfTemplate(body.template)) return body.template;
  return null;
}

function getHumanConfirmation(body: GeneratePdfRequestBody) {
  return body.finalReviewConfirmed === true || body.confirmations?.finalReviewConfirmed === true;
}

export async function POST(request: Request) {
  let body: GeneratePdfRequestBody;

  try {
    body = (await request.json()) as GeneratePdfRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const template = getTemplateFromBody(body);

  if (!template) {
    return NextResponse.json(
      { error: 'Missing or invalid controlled corrective-action PDF template JSON.' },
      { status: 400 },
    );
  }

  if (!getHumanConfirmation(body)) {
    return NextResponse.json(
      { error: 'Human final review confirmation is required before server-side PDF generation.' },
      { status: 403 },
    );
  }

  const pdfBuffer = await renderToBuffer(createElement(CorrectiveActionPdfDocument, { template }));
  const pdfBytes = new Uint8Array(pdfBuffer);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="corrective-action-foundation.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
