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
  variant: 'title' | 'subtitle' | 'section' | 'label' | 'body' | 'gate' | 'footer' | 'tableRow' | 'bodyBox' | 'spacer';
  label?: string;
  value?: string;
  required?: boolean;
};

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function fieldLine(field: ControlledPdfTemplateField, section: ControlledPdfTemplateSection): CorrectiveActionPdfLine {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  const value = normalizeText(field.value);
  const fullWidthLayouts = new Set(['full-width-text', 'photo-evidence-grid']);

  if (fullWidthLayouts.has(section.layoutHint)) {
    return {
      text: `${label}: ${value}`,
      variant: 'bodyBox',
      label,
      value,
      required: field.required,
    };
  }

  return {
    text: `${label}: ${value}`,
    variant: 'tableRow',
    label,
    value,
    required: field.required,
  };
}

function sectionLines(section: ControlledPdfTemplateSection): CorrectiveActionPdfLine[] {
  return [
    { text: section.title, variant: 'section' },
    ...section.fields.map((field) => fieldLine(field, section)),
    { text: '', variant: 'spacer' },
  ];
}

export function CorrectiveActionPdfDocument({ template }: CorrectiveActionPdfDocumentProps): CorrectiveActionPdfLine[] {
  const hasEvidenceSection = template.sections.some((section) => section.sectionId === 'evidence-and-verification');

  return [
    { text: 'AI-CAS Corrective Action Sheet', variant: 'title' },
    { text: template.modelSource, variant: 'subtitle' },
    { text: `Template: ${template.templateVersion} - Status: ${template.status}`, variant: 'subtitle' },
    { text: `Review gate: ${template.releaseGate}`, variant: 'gate' },
    { text: '', variant: 'spacer' },
    ...template.sections.flatMap(sectionLines),
    ...(hasEvidenceSection
      ? [{ text: 'Evidence metadata only. Photo images are not embedded in this PDF.', variant: 'footer' } satisfies CorrectiveActionPdfLine]
      : []),
    ...(template.layoutNotes.length
      ? [{ text: `Appendix note: ${template.layoutNotes.join(' ')}`, variant: 'footer' } satisfies CorrectiveActionPdfLine]
      : []),
  ];
}