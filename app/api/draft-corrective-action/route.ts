import { NextResponse } from 'next/server';
import {
  aiCorrectiveActionDraftSectionTitles,
  buildAiCorrectiveActionDraftPrompt,
  type AiCorrectiveActionDraftFoundation,
  type AiCorrectiveActionDraftOutput,
  type AiCorrectiveActionDraftSection,
  type AiCorrectiveActionDraftSectionKey,
  type StructuredCorrectiveActionDraft,
} from '../../../features/woc/logic/aiCorrectiveActionDraftFoundation';

type DraftRequestBody = {
  aiDraftFoundation?: AiCorrectiveActionDraftFoundation;
};

const REQUIRED_DRAFT_KEYS: AiCorrectiveActionDraftSectionKey[] = [
  'issueSummary',
  'correctiveActionRequired',
  'standardWorkRequirement',
  'responsibilityByOperation',
  'containmentAction',
  'inspectionVerificationRequirement',
  'photoEvidenceReference',
  'closeoutRequirement',
];

const releaseGate = 'AI draft output is editable and unconfirmed. Human review remains required before release/PDF.';

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

function sectionFromUnknown(key: AiCorrectiveActionDraftSectionKey, value: unknown): AiCorrectiveActionDraftSection {
  const title = aiCorrectiveActionDraftSectionTitles[key];

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const section = value as Partial<AiCorrectiveActionDraftSection>;

    return {
      key,
      title,
      draftText: safeString(section.draftText),
      sourceContext: safeString(section.sourceContext),
      requiresHumanReview: true,
    };
  }

  return {
    key,
    title,
    draftText: safeString(value),
    sourceContext: '',
    requiresHumanReview: true,
  };
}

function parseStructuredDraftJson(outputText: string): StructuredCorrectiveActionDraft {
  const cleaned = outputText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<StructuredCorrectiveActionDraft> & Partial<AiCorrectiveActionDraftOutput>;
  const rawSections = typeof parsed.sections === 'object' && parsed.sections !== null ? parsed.sections : {};

  return {
    status: 'draft-only-unconfirmed',
    draftSource: 'openai-corrective-action-draft',
    releaseGate,
    sections: REQUIRED_DRAFT_KEYS.reduce<StructuredCorrectiveActionDraft['sections']>((sections, key) => {
      sections[key] = sectionFromUnknown(key, (rawSections as Record<string, unknown>)[key] ?? parsed[key]);
      return sections;
    }, {} as StructuredCorrectiveActionDraft['sections']),
  };
}

function flattenStructuredDraft(structuredDraft: StructuredCorrectiveActionDraft): AiCorrectiveActionDraftOutput {
  return {
    status: 'draft-only-unconfirmed',
    issueSummary: structuredDraft.sections.issueSummary.draftText,
    correctiveActionRequired: structuredDraft.sections.correctiveActionRequired.draftText,
    standardWorkRequirement: structuredDraft.sections.standardWorkRequirement.draftText,
    responsibilityByOperation: structuredDraft.sections.responsibilityByOperation.draftText,
    containmentAction: structuredDraft.sections.containmentAction.draftText,
    inspectionVerificationRequirement: structuredDraft.sections.inspectionVerificationRequirement.draftText,
    photoEvidenceReference: structuredDraft.sections.photoEvidenceReference.draftText,
    closeoutRequirement: structuredDraft.sections.closeoutRequirement.draftText,
  };
}

function getMissingDraftSections(structuredDraft: StructuredCorrectiveActionDraft) {
  return REQUIRED_DRAFT_KEYS.filter((key) => !structuredDraft.sections[key].draftText.trim());
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

  const prompt = buildAiCorrectiveActionDraftPrompt(aiDraftFoundation.input);

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
    const structuredDraft = parseStructuredDraftJson(outputText);
    const draft = flattenStructuredDraft(structuredDraft);
    const missingDraftSections = getMissingDraftSections(structuredDraft);

    return NextResponse.json({
      structuredDraft,
      draft,
      status: 'draft-only-unconfirmed',
      draftSource: 'openai-corrective-action-draft',
      missingDraftSections,
      releaseGate,
    });
  } catch {
    return NextResponse.json(
      { error: 'AI corrective-action drafting returned unreadable JSON. Manual drafting remains available.' },
      { status: 502 },
    );
  }
}
