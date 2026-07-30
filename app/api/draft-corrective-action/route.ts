import { NextResponse } from 'next/server';
import {
  buildAiCorrectiveActionDraftPrompt,
  type AiCorrectiveActionDraftFoundation,
  type AiCorrectiveActionDraftOutput,
} from '../../../features/woc/logic/aiCorrectiveActionDraftFoundation';
import {
  PROVIDER_OUTPUT_MAX_LENGTH,
  PROVIDER_REQUEST_TIMEOUT_MS,
  extractProviderOutputText,
  isProviderTimeoutError,
  normalizeProviderFailureMessage,
  normalizeProviderNetworkFailureMessage,
  stripJsonCodeFence,
  validateAiCorrectiveActionDraftInput,
  validateAiCorrectiveActionDraftOutput,
} from '../../../features/woc/state/aiContracts';

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

  const rawInput = body.aiDraftFoundation?.input;

  if (!rawInput) {
    return NextResponse.json(
      { error: 'Missing aiDraftFoundation input. Generate and review a V4 draft foundation before requesting AI drafting.' },
      { status: 400 },
    );
  }

  const inputValidation = validateAiCorrectiveActionDraftInput(rawInput);
  if (!inputValidation.ok) {
    return NextResponse.json(
      { error: 'aiDraftFoundation input has an unsupported data structure. Generate and review a V4 draft foundation before requesting AI drafting.' },
      { status: 400 },
    );
  }

  const prompt = `${buildAiCorrectiveActionDraftPrompt(inputValidation.data)}\n\nReturn only valid JSON with these exact keys: status, issueSummary, correctiveActionRequired, standardWorkRequirement, responsibilityByOperation, containmentAction, inspectionVerificationRequirement, photoEvidenceReference, closeoutRequirement. status must equal draft-only-unconfirmed.`;

  let openAiResponse: Response;
  try {
    openAiResponse = await fetch('https://api.openai.com/v1/responses', {
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
      signal: AbortSignal.timeout(PROVIDER_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = isProviderTimeoutError(error);
    return NextResponse.json(
      { error: normalizeProviderNetworkFailureMessage('drafting', timedOut) },
      { status: timedOut ? 504 : 502 },
    );
  }

  let responseBody: unknown;
  try {
    responseBody = await openAiResponse.json();
  } catch {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned an unreadable response. Manual drafting remains available.' },
      { status: 502 },
    );
  }

  if (!openAiResponse.ok) {
    return NextResponse.json(
      { error: normalizeProviderFailureMessage(openAiResponse.status, 'drafting') },
      { status: openAiResponse.status },
    );
  }

  const outputText = extractProviderOutputText(responseBody);

  if (!outputText) {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned no readable output. Manual drafting remains available.' },
      { status: 502 },
    );
  }

  if (outputText.length > PROVIDER_OUTPUT_MAX_LENGTH) {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned an oversized response. Manual drafting remains available.' },
      { status: 502 },
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonCodeFence(outputText));
  } catch {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned unreadable JSON. Manual drafting remains available.' },
      { status: 502 },
    );
  }

  const draftValidation = validateAiCorrectiveActionDraftOutput(parsedJson);
  if (!draftValidation.ok) {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned an unsupported data structure. Manual drafting remains available.' },
      { status: 502 },
    );
  }

  const draft = draftValidation.data;
  const missingDraftSections = getMissingDraftSections(draft).filter((section) => section !== 'status');

  return NextResponse.json({
    draft,
    status: 'draft-only-unconfirmed',
    draftSource: 'openai-corrective-action-draft',
    missingDraftSections,
    releaseGate: 'AI draft output is editable and unconfirmed. Human review remains required before release/PDF.',
  });
}
