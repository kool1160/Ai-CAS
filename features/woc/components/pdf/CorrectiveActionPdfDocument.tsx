import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type {
  ControlledCorrectiveActionPdfTemplate,
  ControlledPdfTemplateField,
  ControlledPdfTemplateSection,
} from '../../logic/controlledPdfTemplateFoundation';

type CorrectiveActionPdfDocumentProps = {
  template: ControlledCorrectiveActionPdfTemplate;
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: '#f8fafc',
    color: '#111827',
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.35,
  },
  titleBlock: {
    borderBottom: '2 solid #1f2937',
    marginBottom: 14,
    paddingBottom: 10,
  },
  eyebrow: {
    color: '#475569',
    fontSize: 8,
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: '#334155',
    fontSize: 9,
  },
  releaseGate: {
    backgroundColor: '#fff7ed',
    border: '1 solid #fed7aa',
    borderRadius: 4,
    color: '#7c2d12',
    marginBottom: 12,
    padding: 8,
  },
  releaseGateLabel: {
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1 solid #cbd5e1',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  sectionHeader: {
    borderBottom: '1 solid #e2e8f0',
    marginBottom: 8,
    paddingBottom: 5,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 700,
  },
  layoutHint: {
    color: '#64748b',
    fontSize: 7,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  twoColumnGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fullWidthStack: {
    display: 'flex',
    flexDirection: 'column',
  },
  twoColumnField: {
    border: '1 solid #e2e8f0',
    borderRadius: 4,
    marginBottom: 6,
    marginRight: 6,
    padding: 6,
    width: '48%',
  },
  fullWidthField: {
    border: '1 solid #e2e8f0',
    borderRadius: 4,
    marginBottom: 6,
    padding: 6,
    width: '100%',
  },
  evidenceField: {
    backgroundColor: '#f8fafc',
    border: '1 dashed #94a3b8',
    borderRadius: 4,
    marginBottom: 6,
    padding: 7,
    width: '100%',
  },
  approvalField: {
    backgroundColor: '#ecfdf5',
    border: '1 solid #a7f3d0',
    borderRadius: 4,
    marginBottom: 6,
    padding: 7,
    width: '100%',
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  requiredMarker: {
    color: '#b91c1c',
  },
  fieldValue: {
    color: '#111827',
    fontSize: 9,
  },
  notes: {
    color: '#475569',
    fontSize: 7,
    marginTop: 4,
  },
  footer: {
    borderTop: '1 solid #cbd5e1',
    color: '#64748b',
    fontSize: 7,
    marginTop: 6,
    paddingTop: 6,
  },
});

function normalizePdfText(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function getFieldStyle(section: ControlledPdfTemplateSection) {
  if (section.layoutHint === 'photo-evidence-grid') return styles.evidenceField;
  if (section.layoutHint === 'approval-status') return styles.approvalField;
  if (section.layoutHint === 'two-column-table') return styles.twoColumnField;
  return styles.fullWidthField;
}

function PdfField({ field, section }: { field: ControlledPdfTemplateField; section: ControlledPdfTemplateSection }) {
  return (
    <View style={getFieldStyle(section)} wrap={false}>
      <Text style={styles.fieldLabel}>
        {field.label}
        {field.required ? <Text style={styles.requiredMarker}> *</Text> : null}
      </Text>
      <Text style={styles.fieldValue}>{normalizePdfText(field.value)}</Text>
    </View>
  );
}

function PdfSection({ section }: { section: ControlledPdfTemplateSection }) {
  const stackStyle = section.layoutHint === 'two-column-table' ? styles.twoColumnGrid : styles.fullWidthStack;

  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.layoutHint}>{section.layoutHint}</Text>
      </View>
      <View style={stackStyle}>
        {section.fields.map((field) => (
          <PdfField field={field} key={`${section.sectionId}-${field.label}`} section={section} />
        ))}
      </View>
    </View>
  );
}

export function CorrectiveActionPdfDocument({ template }: CorrectiveActionPdfDocumentProps) {
  return (
    <Document
      author="AI-CAS"
      creator="AI-CAS controlled server-side PDF foundation"
      producer="AI-CAS / @react-pdf/renderer"
      subject="Controlled corrective action PDF foundation"
      title={template.templateName}
    >
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Controlled corrective action PDF · foundation</Text>
          <Text style={styles.title}>{template.templateName}</Text>
          <Text style={styles.subtitle}>
            {template.modelSource} · {template.templateVersion} · {template.status}
          </Text>
        </View>

        <View style={styles.releaseGate} wrap={false}>
          <Text style={styles.releaseGateLabel}>Release gate</Text>
          <Text>{template.releaseGate}</Text>
        </View>

        {template.sections.map((section) => (
          <PdfSection key={section.sectionId} section={section} />
        ))}

        <View style={styles.footer} fixed>
          <Text>
            Text-only evidence references. No photo images are embedded. Review export/send/print UI remains unwired.
          </Text>
        </View>

        {template.layoutNotes.length ? (
          <Text style={styles.notes}>Foundation notes: {template.layoutNotes.join(' ')}</Text>
        ) : null}
      </Page>
    </Document>
  );
}
