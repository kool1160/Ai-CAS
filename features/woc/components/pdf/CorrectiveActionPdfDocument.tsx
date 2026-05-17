import type {
  ControlledCorrectiveActionPdfTemplate,
  ControlledPdfTemplateField,
  ControlledPdfTemplateSection,
} from '../../logic/controlledPdfTemplateFoundation';

type CorrectiveActionPdfDocumentProps = {
  template: ControlledCorrectiveActionPdfTemplate;
};

export type CorrectiveActionPdfLine = {
  text: string;
  variant: 'title' | 'subtitle' | 'section' | 'label' | 'body' | 'gate' | 'footer';
};

const MAX_TEXT_LINE_LENGTH = 92;

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function wrapText(value: string, maxLineLength = MAX_TEXT_LINE_LENGTH) {
  const normalized = normalizeText(value);
  if (!normalized) return [''];

  return normalized.split('\n').flatMap((paragraph) => {
    const words = paragraph.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      if (candidate.length <= maxLineLength) {
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

function fieldLines(field: ControlledPdfTemplateField): CorrectiveActionPdfLine[] {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  const bodyLines = wrapText(field.value);

  return [
    { text: label, variant: 'label' },
    ...bodyLines.map((text) => ({ text, variant: 'body' }) satisfies CorrectiveActionPdfLine),
  ];
}

function sectionLines(section: ControlledPdfTemplateSection): CorrectiveActionPdfLine[] {
  return [
    { text: section.title, variant: 'section' },
    ...section.fields.flatMap(fieldLines),
  ];
}

export function CorrectiveActionPdfDocument({ template }: CorrectiveActionPdfDocumentProps): CorrectiveActionPdfLine[] {
  return [
    { text: template.templateName, variant: 'title' },
    { text: template.modelSource, variant: 'subtitle' },
    { text: `Template: ${template.templateVersion} - Status: ${template.status}`, variant: 'subtitle' },
    { text: `Review gate: ${template.releaseGate}`, variant: 'gate' },
    ...template.sections.flatMap(sectionLines),
    {
      text: 'Text-only evidence metadata. No photo images are embedded in this PDF.',
      variant: 'footer',
    },
    ...(template.layoutNotes.length
      ? [{ text: `Appendix note: ${template.layoutNotes.join(' ')}`, variant: 'footer' } satisfies CorrectiveActionPdfLine]
      : []),
  ];
}
