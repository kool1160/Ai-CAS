import { NextResponse } from 'next/server';
import {
  buildAiCorrectiveActionDraftPrompt,
  type AiCorrectiveActionDraftFoundation,
  type AiCorrectiveActionDraftOutput,
} from '../../../features/woc/logic/aiCorrectiveActionDraftFoundation';

type DraftRequestBody = {
  aiDraftFoundation?: AiCorrectiveActionDraftFoundation;
};

const REQUIRED_DRAFT_KEYS: Array<keyof AiCorrectiveActionDraftOutput> = [
  'status',
  'issueSummary',
  'correctiveActionRequired',
  'standardWorkRequirement',
  'responsibilityByOperation',
  'containmentAction',
  'inspectionVerificationRequirement',
  'photoEvidenceReference',
  'closeoutRequirement',
];

function safeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

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

function parseDraftJson(outputText: string): AiCorrectiveActionDraftOutput {
  const cleaned = outputText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<AiCorrectiveActionDraftOutput>;

  return {
    status: 'draft-only-unconfirmed',
    issueSummary: safeString(parsed.issueSummary),
    correctiveActionRequired: safeString(parsed.correctiveActionRequired),
    standardWorkRequirement: safeString(parsed.standardWorkRequirement),
    responsibilityByOperation: safeString(parsed.responsibilityByOperation),
    containmentAction: safeString(parsed.containmentAction),
    inspectionVerificationRequirement: safeString(parsed.inspectionVerificationRequirement),
    photoEvidenceReference: safeString(parsed.photoEvidenceReference),
    closeoutRequirement: safeString(parsed.closeoutRequirement),
  };
}

function getMissingDraftSections(draft: AiCorrectiveActionDraftOutput) {
  return REQUIRED_DRAFT_KEYS.filter((key) => !String(draft[key]).trim());
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. AI corrective-action drafting is unavailable. Manual drafting remains available.' },
      { status: 503 },
    );
  }

  let body: DraftRequestBody;

  try {
    body = (await request.json()) as DraftRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const aiDraftFoundation = body.aiDraftFoundation;

  if (!aiDraftFoundation?.input) {
    return NextResponse.json(
      { error: 'Missing aiDraftFoundation input. Generate and review a V4 draft foundation before requesting AI drafting.' },
      { status: 400 },
    );
  }

  const prompt = `${buildAiCorrectiveActionDraftPrompt(aiDraftFoundation.input)}\n\nReturn only valid JSON with these exact keys: status, issueSummary, correctiveActionRequired, standardWorkRequirement, responsibilityByOperation, containmentAction, inspectionVerificationRequirement, photoEvidenceReference, closeoutRequirement. status must equal draft-only-unconfirmed.`;

  const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_DRAFT_MODEL ?? 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
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
        : 'AI corrective-action drafting failed. Manual drafting remains available.';

    return NextResponse.json({ error: errorMessage }, { status: openAiResponse.status });
  }

  const outputText = extractOutputText(responseBody);

  if (!outputText) {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned no readable output. Manual drafting remains available.' },
      { status: 502 },
    );
  }

  try {
    const draft = parseDraftJson(outputText);
    const missingDraftSections = getMissingDraftSections(draft).filter((section) => section !== 'status');

    return NextResponse.json({
      draft,
      status: 'draft-only-unconfirmed',
      draftSource: 'openai-corrective-action-draft',
      missingDraftSections,
      releaseGate: 'AI draft output is editable and unconfirmed. Human review remains required before release/PDF.',
    });
  } catch {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned unreadable JSON. Manual drafting remains available.' },
      { status: 502 },
    );
  }
}
