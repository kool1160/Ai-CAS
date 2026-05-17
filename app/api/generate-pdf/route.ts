import { NextResponse } from 'next/server';
import { CorrectiveActionPdfDocument, type CorrectiveActionPdfLine } from '../../../features/woc/components/pdf/CorrectiveActionPdfDocument';
import type { ControlledCorrectiveActionPdfTemplate } from '../../../features/woc/logic/controlledPdfTemplateFoundation';

export const runtime = 'nodejs';

type GeneratePdfRequestBody = {
  template?: ControlledCorrectiveActionPdfTemplate;
  finalReviewConfirmed?: boolean;
  confirmations?: {
    finalReviewConfirmed?: boolean;
  };
};

type PdfPage = CorrectiveActionPdfLine[];

const PAGE_HEIGHT = 792;
const PAGE_WIDTH = 612;
const PAGE_MARGIN_X = 48;
const PAGE_START_Y = 744;
const PAGE_BOTTOM_Y = 48;
const LINE_HEIGHT = 14;
const TITLE_LINE_HEIGHT = 22;
const SECTION_LINE_HEIGHT = 18;

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

function lineHeight(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title') return TITLE_LINE_HEIGHT;
  if (line.variant === 'section') return SECTION_LINE_HEIGHT;
  return LINE_HEIGHT;
}

function paginateLines(lines: CorrectiveActionPdfLine[]) {
  const pages: PdfPage[] = [[]];
  let remainingHeight = PAGE_START_Y - PAGE_BOTTOM_Y;

  lines.forEach((line) => {
    const requiredHeight = lineHeight(line);

    if (pages[pages.length - 1].length > 0 && requiredHeight > remainingHeight) {
      pages.push([]);
      remainingHeight = PAGE_START_Y - PAGE_BOTTOM_Y;
    }

    pages[pages.length - 1].push(line);
    remainingHeight -= requiredHeight;
  });

  return pages;
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, ' ');
}

function fontSize(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title') return 18;
  if (line.variant === 'section') return 13;
  if (line.variant === 'label') return 10;
  if (line.variant === 'footer' || line.variant === 'subtitle') return 8;
  return 9;
}

function fontName(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title' || line.variant === 'section' || line.variant === 'label' || line.variant === 'gate') {
    return 'F2';
  }

  return 'F1';
}

function renderPageContent(page: PdfPage, pageIndex: number, pageCount: number) {
  let cursorY = PAGE_START_Y;
  const operations = [
    'BT',
    `/F1 8 Tf`,
    `${PAGE_MARGIN_X} 28 Td`,
    `(Vectis Corrective Action Report - Page ${pageIndex + 1} of ${pageCount}) Tj`,
    'ET',
  ];

  page.forEach((line) => {
    const size = fontSize(line);
    operations.push('BT');
    operations.push(`/${fontName(line)} ${size} Tf`);
    operations.push(`${PAGE_MARGIN_X} ${cursorY} Td`);
    operations.push(`(${escapePdfText(line.text)}) Tj`);
    operations.push('ET');
    cursorY -= lineHeight(line);
  });

  return operations.join('\n');
}

function createPdfObject(id: number, body: string) {
  return `${id} 0 obj\n${body}\nendobj\n`;
}

function buildPdfBinary(lines: CorrectiveActionPdfLine[]) {
  const pages = paginateLines(lines);
  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontRegularId = 3;
  const fontBoldId = 4;
  const firstPageId = 5;
  const firstContentId = firstPageId + pages.length;
  const pageObjectIds = pages.map((_, index) => firstPageId + index);
  const contentObjectIds = pages.map((_, index) => firstContentId + index);

  objects[catalogId] = createPdfObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  objects[pagesId] = createPdfObject(pagesId, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objects[fontRegularId] = createPdfObject(fontRegularId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects[fontBoldId] = createPdfObject(fontBoldId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  pages.forEach((page, index) => {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    const content = renderPageContent(page, index, pages.length);

    objects[pageId] = createPdfObject(
      pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects[contentId] = createPdfObject(contentId, `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.slice(1).forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += object;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
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

  const pdfBuffer = buildPdfBinary(CorrectiveActionPdfDocument({ template }));

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="vectis-corrective-action-report.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
