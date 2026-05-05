import { NextResponse } from 'next/server';

type ExtractedWorkOrderData = {
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  customerOrJob?: string;
  quantity?: string;
  notes?: string;
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

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

function parseExtractedJson(outputText: string): ExtractedWorkOrderData {
  const cleaned = outputText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as ExtractedWorkOrderData;

  return {
    workOrderNumber: typeof parsed.workOrderNumber === 'string' ? parsed.workOrderNumber : '',
    partNumber: typeof parsed.partNumber === 'string' ? parsed.partNumber : '',
    revision: typeof parsed.revision === 'string' ? parsed.revision : '',
    customerOrJob: typeof parsed.customerOrJob === 'string' ? parsed.customerOrJob : '',
    quantity: typeof parsed.quantity === 'string' ? parsed.quantity : '',
    notes: typeof parsed.notes === 'string' ? parsed.notes : '',
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. Manual entry is still available.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No upload file was provided.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'M9 extraction currently supports uploaded image files only. Manual entry is still available.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Uploaded image is too large for extraction. Please use a smaller image or manual entry.' },
      { status: 413 },
    );
  }

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
              text: 'Extract work order/router/header data from this image. Return only valid JSON with these exact keys: workOrderNumber, partNumber, revision, customerOrJob, quantity, notes. Use empty strings for fields that are not found. Do not include markdown.',
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

  if (!openAiResponse.ok) {
    const errorMessage =
      typeof responseBody?.error?.message === 'string'
        ? responseBody.error.message
        : 'AI Vision extraction failed. Manual entry is still available.';

    return NextResponse.json({ error: errorMessage }, { status: openAiResponse.status });
  }

  const outputText = extractOutputText(responseBody);

  if (!outputText) {
    return NextResponse.json(
      { error: 'AI Vision returned no readable extraction output. Manual entry is still available.' },
      { status: 502 },
    );
  }

  try {
    return NextResponse.json({ extracted: parseExtractedJson(outputText) });
  } catch {
    return NextResponse.json(
      { error: 'AI Vision extraction returned unreadable data. Manual entry is still available.' },
      { status: 502 },
    );
  }
}
