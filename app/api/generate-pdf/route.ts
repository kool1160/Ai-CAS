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
const PAGE_MARGIN_X = 40;
const PAGE_START_Y = 744;
const PAGE_BOTTOM_Y = 48;
const PAGE_CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN_X * 2);
const LABEL_COLUMN_WIDTH = 150;
const VALUE_COLUMN_X = PAGE_MARGIN_X + LABEL_COLUMN_WIDTH + 10;
const VALUE_COLUMN_WIDTH = PAGE_CONTENT_WIDTH - LABEL_COLUMN_WIDTH - 10;
const TEXT_LINE_HEIGHT = 11;
const LINE_HEIGHT = 16;
const TITLE_LINE_HEIGHT = 28;
const SECTION_LINE_HEIGHT = 24;
const ROW_VERTICAL_PADDING = 8;
const BODY_BOX_VERTICAL_PADDING = 10;
const SECTION_KEEP_WITH_NEXT_HEIGHT = 64;

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

function normalizePdfText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function wrapPdfText(value: string, maxCharacters: number) {
  const normalized = normalizePdfText(value);
  if (!normalized) return [''];

  return normalized.split('\n').flatMap((paragraph) => {
    const words = paragraph.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      if (candidate.length <= maxCharacters) {
        currentLine = candidate;
        return;
      }

      if (currentLine) lines.push(currentLine);
      currentLine = word;
    });

    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [''];
  });
}

function tableRowHeight(line: CorrectiveActionPdfLine) {
  const labelLines = wrapPdfText(line.label ?? '', 24);
  const valueLines = wrapPdfText(line.value ?? '', 66);
  return Math.max(28, (Math.max(labelLines.length, valueLines.length) * TEXT_LINE_HEIGHT) + ROW_VERTICAL_PADDING + 6);
}

function bodyBoxHeight(line: CorrectiveActionPdfLine) {
  const labelLines = wrapPdfText(line.label ?? '', 90);
  const valueLines = wrapPdfText(line.value ?? '', 94);
  return Math.max(42, ((labelLines.length + valueLines.length) * TEXT_LINE_HEIGHT) + BODY_BOX_VERTICAL_PADDING + 10);
}

function lineHeight(line: CorrectiveActionPdfLine) {
  if (line.variant === 'title') return TITLE_LINE_HEIGHT;
  if (line.variant === 'section') return SECTION_LINE_HEIGHT;
  if (line.variant === 'tableRow') return tableRowHeight(line);
  if (line.variant === 'bodyBox') return bodyBoxHeight(line);
  if (line.variant === 'spacer') return 10;
  return LINE_HEIGHT;
}

function paginateLines(lines: CorrectiveActionPdfLine[]) {
  const pages: PdfPage[] = [[]];
  let remainingHeight = PAGE_START_Y - PAGE_BOTTOM_Y;

  lines.forEach((line, index) => {
    const requiredHeight = lineHeight(line);
    const nextLine = lines[index + 1];
    const sectionKeepHeight = line.variant === 'section' && nextLine
      ? Math.min(SECTION_KEEP_WITH_NEXT_HEIGHT, requiredHeight + lineHeight(nextLine))
      : requiredHeight;
    const heightToCheck = line.variant === 'section' ? sectionKeepHeight : requiredHeight;

    if (pages[pages.length - 1].length > 0 && heightToCheck > remainingHeight) {
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

function renderText(x: number, y: number, size: number, font: 'F1' | 'F2', text: string) {
  return [
    'BT',
    `/${font} ${size} Tf`,
    `${x} ${y} Td`,
    `(${escapePdfText(text)}) Tj`,
    'ET',
  ].join('\n');
}

function renderWrappedText(x: number, startY: number, size: number, font: 'F1' | 'F2', lines: string[]) {
  return lines.map((text, index) => renderText(x, startY - (index * TEXT_LINE_HEIGHT), size, font, text));
}

function renderPageContent(page: PdfPage, pageIndex: number, pageCount: number) {
  let cursorY = PAGE_START_Y;
  const operations: string[] = [];

  operations.push(renderText(PAGE_MARGIN_X, 28, 8, 'F1', `AI-CAS Corrective Action Sheet - Page ${pageIndex + 1} of ${pageCount}`));

  page.forEach((line) => {
    if (line.variant === 'spacer') {
      cursorY -= lineHeight(line);
      return;
    }

    if (line.variant === 'title') {
      operations.push(renderText(PAGE_MARGIN_X, cursorY, 20, 'F2', line.text));
      cursorY -= lineHeight(line);
      return;
    }

    if (line.variant === 'section') {
      operations.push('0 0 0 rg');
      operations.push(`${PAGE_MARGIN_X} ${cursorY - 16} ${PAGE_CONTENT_WIDTH} 20 re f`);
      operations.push('1 1 1 rg');
      operations.push(renderText(PAGE_MARGIN_X + 8, cursorY - 11, 11, 'F2', line.text));
      operations.push('0 0 0 rg');
      cursorY -= lineHeight(line);
      return;
    }

    if (line.variant === 'tableRow') {
      const rowHeight = lineHeight(line);
      const rowY = cursorY - rowHeight + 4;
      const labelLines = wrapPdfText(line.label ?? '', 24);
      const valueLines = wrapPdfText(line.value ?? '', 66);
      const textTopY = cursorY - 13;

      operations.push(`${PAGE_MARGIN_X} ${rowY} ${PAGE_CONTENT_WIDTH} ${rowHeight - 4} re S`);
      operations.push(`${PAGE_MARGIN_X + LABEL_COLUMN_WIDTH} ${rowY} m ${PAGE_MARGIN_X + LABEL_COLUMN_WIDTH} ${rowY + rowHeight - 4} l S`);
      operations.push(...renderWrappedText(PAGE_MARGIN_X + 6, textTopY, 8.6, 'F2', labelLines));
      operations.push(...renderWrappedText(VALUE_COLUMN_X, textTopY, 8.8, 'F1', valueLines));

      cursorY -= rowHeight;
      return;
    }

    if (line.variant === 'bodyBox') {
      const boxHeight = lineHeight(line);
      const boxY = cursorY - boxHeight + 4;
      const labelLines = wrapPdfText(line.label ?? '', 90);
      const valueLines = wrapPdfText(line.value ?? '', 94);
      const labelStartY = cursorY - 13;
      const valueStartY = labelStartY - (labelLines.length * TEXT_LINE_HEIGHT) - 3;

      operations.push(`${PAGE_MARGIN_X} ${boxY} ${PAGE_CONTENT_WIDTH} ${boxHeight - 4} re S`);
      operations.push(...renderWrappedText(PAGE_MARGIN_X + 6, labelStartY, 8.8, 'F2', labelLines));
      operations.push(...renderWrappedText(PAGE_MARGIN_X + 6, valueStartY, 8.8, 'F1', valueLines));
      cursorY -= boxHeight;
      return;
    }

    operations.push(renderText(PAGE_MARGIN_X, cursorY, 9, line.variant === 'label' || line.variant === 'gate' ? 'F2' : 'F1', line.text));
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
      'Content-Disposition': 'inline; filename="ai-cas-corrective-action-sheet.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}