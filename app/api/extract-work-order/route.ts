import { NextResponse } from 'next/server';

type ExtractedWorkOrderData = {
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  partDescription?: string;
  customerOrJob?: string;
  operationNumber?: string;
  routerStepOperation?: string;
  quantity?: string;
  quantityAffected?: string;
  dueDateShipDate?: string;
  nextOperation?: string;
  inspectionOperation?: string;
  material?: string;
  foundAtDepartment?: string;
  suspectedFailurePoint?: string;
  shortIssueDescription?: string;
  detailedIssueNotes?: string;
  notes?: string;
  fieldSourceNotes?: Record<string, string>;
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const EXPECTED_EXTRACTION_KEYS: Array<keyof ExtractedWorkOrderData> = [
  'workOrderNumber',
  'partNumber',
  'customerOrJob',
  'partDescription',
  'quantityAffected',
  'operationNumber',
  'routerStepOperation',
  'dueDateShipDate',
  'nextOperation',
  'inspectionOperation',
  'material',
];

function extractOutputText(responseBody: unknown): string {
  if (typeof responseBody !== 'object' || responseBody === null) return '';

  const maybeOutputText = (responseBody as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string') return maybeOutputText;

  const output = (responseBody as { output?: unknown }).output;
  if (!Array.isArray(output)) return '';

  return output
    .flatMap((item) => {
      if (typeof item !== 'object' || item === null) return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((contentItem) => {
        if (typeof contentItem !== 'object' || contentItem === null) return '';
        const text = (contentItem as { text?: unknown }).text;
        return typeof text === 'string' ? text : '';
      });
    })
    .join('\n')
    .trim();
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function safeSourceNotes(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};

  return Object.entries(value).reduce<Record<string, string>>((notes, [key, note]) => {
    if (typeof note === 'string') notes[key] = note;
    return notes;
  }, {});
}

function getMissingExpectedFields(extracted: ExtractedWorkOrderData) {
  return EXPECTED_EXTRACTION_KEYS.filter((key) => !safeString(extracted[key]).trim());
}

function parseExtractedJson(outputText: string): ExtractedWorkOrderData {
  const cleaned = outputText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as ExtractedWorkOrderData;

  return {
    workOrderNumber: safeString(parsed.workOrderNumber),
    partNumber: safeString(parsed.partNumber),
    revision: safeString(parsed.revision),
    partDescription: safeString(parsed.partDescription),
    customerOrJob: safeString(parsed.customerOrJob),
    operationNumber: safeString(parsed.operationNumber),
    routerStepOperation: safeString(parsed.routerStepOperation),
    quantity: safeString(parsed.quantity),
    quantityAffected: safeString(parsed.quantityAffected),
    dueDateShipDate: safeString(parsed.dueDateShipDate),
    nextOperation: safeString(parsed.nextOperation),
    inspectionOperation: safeString(parsed.inspectionOperation),
    material: safeString(parsed.material),
    foundAtDepartment: safeString(parsed.foundAtDepartment),
    suspectedFailurePoint: safeString(parsed.suspectedFailurePoint),
    shortIssueDescription: '',
    detailedIssueNotes: '',
    notes: safeString(parsed.notes),
    fieldSourceNotes: safeSourceNotes(parsed.fieldSourceNotes),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. OpenAI Vision extraction is unavailable. Manual entry is still available.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No upload file was provided for OpenAI Vision extraction.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'OpenAI Vision extraction currently supports uploaded image files only. Manual entry is still available.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Uploaded image is too large for OpenAI Vision extraction. Please use a smaller image or manual entry.' },
      { status: 413 },
    );
  }

  console.info('[Vectis Vision] OpenAI Vision extraction request started', {
    fileType: file.type,
    fileSize: file.size,
    model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
  });

  const arrayBuffer = await file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64Image}`;

  const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                'You are reading a full manufacturing work order/router image, not just the header. Scan the entire uploaded image from top to bottom, including header blocks, material lines, operation tables, routing rows, dates, quantities, and inspection/signoff areas. Extract only fields visibly present in the image. Return only valid JSON with these exact keys: workOrderNumber, partNumber, revision, partDescription, customerOrJob, operationNumber, routerStepOperation, quantity, quantityAffected, dueDateShipDate, nextOperation, inspectionOperation, material, foundAtDepartment, suspectedFailurePoint, notes, fieldSourceNotes. Prioritize: workOrderNumber, partNumber, customerOrJob, partDescription, quantityAffected, operationNumber, routerStepOperation, dueDateShipDate, nextOperation, inspectionOperation, material. Look for labels and table headings such as WO, Work Order, Job, Sales Order, PN, Part Number, Item, Description, Customer, Qty, Quantity, Qty Ordered, Qty Required, Operation, Oper, Op, Op No, Sequence, Seq, Work Center, WC, Router Step, Department, Laser, Forming, Welding, Machining, Assembly, Inspect, Inspection, QC, Ship Date, Due Date, Required Date, Need Date, Release Date, Material, M line, Raw Material, Gauge, CRS, HRS, Aluminum, Stainless. For operationNumber, use the visible operation/sequence number from the router row if present. For routerStepOperation, use the operation description or work center text from the same row. For nextOperation, capture the next visible operation after the current/primary row if obvious. For inspectionOperation, capture visible QC/inspection/first-piece/last-piece operation text if present. Do not extract or infer the operator/shop-floor issue statement from router, work-order, OCR, or document notes; place miscellaneous uploaded-document notes only in notes or fieldSourceNotes. For fieldSourceNotes, return an object where each filled or intentionally blank important field has a short note such as header block, router row, material line, inspection row, date field, or not visible. Use empty strings for fields that are not visible. Do not guess, do not infer from part number, do not use mock values, and do not include markdown. Treat all extracted values as draft/unconfirmed.',
            },
            {
              type: 'input_image',
              image_url: dataUrl,
              detail: 'high',
            },
          ],
        },
      ],
    }),
  });

  const responseBody = await openAiResponse.json();
  console.info('[Vectis Vision] OpenAI Vision backend response received', { ok: openAiResponse.ok, status: openAiResponse.status });

  if (!openAiResponse.ok) {
    const errorMessage =
      typeof responseBody?.error?.message === 'string'
        ? responseBody.error.message
        : 'OpenAI Vision extraction failed. Manual entry is still available.';

    return NextResponse.json({ error: errorMessage }, { status: openAiResponse.status });
  }

  const outputText = extractOutputText(responseBody);

  if (!outputText) {
    return NextResponse.json(
      { error: 'OpenAI Vision returned no readable extraction output. Manual entry is still available.' },
      { status: 502 },
    );
  }

  try {
    const extracted = parseExtractedJson(outputText);
    const extractedKeys = Object.entries(extracted)
      .filter(([, value]) => {
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
        return false;
      })
      .map(([key]) => key);
    const missingExpectedFields = getMissingExpectedFields(extracted);

    console.info('[Vectis Vision] OpenAI Vision extracted keys returned', {
      extractedKeys,
      missingExpectedFields,
      fieldSourceNotes: extracted.fieldSourceNotes,
    });

    return NextResponse.json({
      extracted,
      extractionSource: 'openai-vision',
      extractedKeys,
      missingExpectedFields,
      fieldSourceNotes: extracted.fieldSourceNotes ?? {},
    });
  } catch {
    return NextResponse.json(
      { error: 'OpenAI Vision extraction returned unreadable data. Manual entry is still available.' },
      { status: 502 },
    );
  }
}
