import { NextResponse } from 'next/server';
import {
  PROVIDER_OUTPUT_MAX_LENGTH,
  PROVIDER_REQUEST_TIMEOUT_MS,
  extractProviderOutputText,
  isProviderTimeoutError,
  normalizeProviderFailureMessage,
  normalizeProviderNetworkFailureMessage,
  readBoundedProviderResponseBody,
  stripJsonCodeFence,
  validateExtractedWorkOrderData,
} from '../../../features/woc/state/aiContracts';
import type { ExtractedWorkOrderData } from '../../../features/woc/types/wocSessionTypes';

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

function safeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getMissingExpectedFields(extracted: ExtractedWorkOrderData) {
  return EXPECTED_EXTRACTION_KEYS.filter((key) => !safeString(extracted[key]).trim());
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. OpenAI Vision extraction is unavailable. Manual entry is still available.' },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload request. Manual entry is still available.' }, { status: 400 });
  }

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

  console.info('[AI-CAS-M3] OpenAI Vision extraction request started', {
    fileType: file.type,
    fileSize: file.size,
    model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
  });

  const arrayBuffer = await file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64Image}`;

  let openAiResponse: Response;
  try {
    openAiResponse = await fetch('https://api.openai.com/v1/responses', {
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
                  'You are reading a full manufacturing work order/router image, not just the header. Scan the entire uploaded image from top to bottom, including header blocks, material lines, operation tables, routing rows, dates, quantities, and inspection/signoff areas. Extract only fields visibly present in the image. Return only valid JSON with these exact keys: workOrderNumber, partNumber, revision, partDescription, customerOrJob, operationNumber, routerStepOperation, quantity, quantityAffected, dueDateShipDate, nextOperation, inspectionOperation, material, foundAtDepartment, suspectedFailurePoint, shortIssueDescription, detailedIssueNotes, notes, fieldSourceNotes. Prioritize: workOrderNumber, partNumber, customerOrJob, partDescription, quantityAffected, operationNumber, routerStepOperation, dueDateShipDate, nextOperation, inspectionOperation, material. Look for labels and table headings such as WO, Work Order, Job, Sales Order, PN, Part Number, Item, Description, Customer, Qty, Quantity, Qty Ordered, Qty Required, Operation, Oper, Op, Op No, Sequence, Seq, Work Center, WC, Router Step, Department, Laser, Forming, Welding, Machining, Assembly, Inspect, Inspection, QC, Ship Date, Due Date, Required Date, Need Date, Release Date, Material, M line, Raw Material, Gauge, CRS, HRS, Aluminum, Stainless. For operationNumber, use the visible operation/sequence number from the router row if present. For routerStepOperation, use the operation description or work center text from the same row. For nextOperation, capture the next visible operation after the current/primary row if obvious. For inspectionOperation, capture visible QC/inspection/first-piece/last-piece operation text if present. For fieldSourceNotes, return an object where each filled or intentionally blank important field has a short note such as header block, router row, material line, inspection row, date field, or not visible. Use empty strings for fields that are not visible. Do not guess, do not infer from part number, do not use mock values, and do not include markdown. Treat all extracted values as draft/unconfirmed.',
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
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(PROVIDER_REQUEST_TIMEOUT_MS)]),
    });
  } catch (error) {
    const failure = request.signal.aborted ? 'aborted' : isProviderTimeoutError(error) ? 'timeout' : 'network';
    console.info('[AI-CAS-M3] OpenAI Vision provider request failed', { failure });
    return NextResponse.json(
      { error: normalizeProviderNetworkFailureMessage('extraction', failure) },
      { status: failure === 'timeout' ? 504 : failure === 'aborted' ? 499 : 502 },
    );
  }

  console.info('[AI-CAS-M3] OpenAI Vision backend response received', { ok: openAiResponse.ok, status: openAiResponse.status });

  if (!openAiResponse.ok) {
    return NextResponse.json(
      { error: normalizeProviderFailureMessage(openAiResponse.status, 'extraction') },
      { status: openAiResponse.status },
    );
  }

  const providerBody = await readBoundedProviderResponseBody(openAiResponse);
  if (!providerBody.ok) {
    const error = providerBody.reason === 'provider-response-body-too-large'
      ? 'OpenAI Vision returned an oversized response. Manual entry is still available.'
      : 'OpenAI Vision returned an unreadable response. Manual entry is still available.';
    return NextResponse.json({ error }, { status: 502 });
  }

  let responseBody: unknown;
  try {
    responseBody = JSON.parse(providerBody.data);
  } catch {
    return NextResponse.json(
      { error: 'OpenAI Vision returned an unreadable response. Manual entry is still available.' },
      { status: 502 },
    );
  }

  const outputText = extractProviderOutputText(responseBody);

  if (!outputText) {
    return NextResponse.json(
      { error: 'OpenAI Vision returned no readable extraction output. Manual entry is still available.' },
      { status: 502 },
    );
  }

  if (outputText.length > PROVIDER_OUTPUT_MAX_LENGTH) {
    console.info('[AI-CAS-M3] OpenAI Vision extraction output exceeded the size bound', { outputLength: outputText.length });
    return NextResponse.json(
      { error: 'OpenAI Vision extraction returned an oversized response. Manual entry is still available.' },
      { status: 502 },
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonCodeFence(outputText));
  } catch {
    return NextResponse.json(
      { error: 'OpenAI Vision extraction returned unreadable data. Manual entry is still available.' },
      { status: 502 },
    );
  }

  const validation = validateExtractedWorkOrderData(parsedJson);
  if (!validation.ok) {
    console.info('[AI-CAS-M3] OpenAI Vision extraction failed structural validation', { reason: validation.reason });
    return NextResponse.json(
      { error: 'OpenAI Vision extraction returned an unsupported data structure. Manual entry is still available.' },
      { status: 502 },
    );
  }

  const extracted = validation.data;
  const extractedKeys = Object.entries(extracted)
    .filter(([, value]) => {
      if (typeof value === 'string') return value.trim();
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return false;
    })
    .map(([key]) => key);
  const missingExpectedFields = getMissingExpectedFields(extracted);

  console.info('[AI-CAS-M3] OpenAI Vision extracted keys returned', {
    extractedKeys,
    missingExpectedFields,
    fieldSourceNoteCount: Object.keys(extracted.fieldSourceNotes ?? {}).length,
  });

  return NextResponse.json({
    extracted,
    extractionSource: 'openai-vision',
    extractedKeys,
    missingExpectedFields,
    fieldSourceNotes: extracted.fieldSourceNotes ?? {},
  });
}
