import type { ControlledCorrectiveActionPdfTemplate } from '../logic/controlledPdfTemplateFoundation';

type ControlledPdfPreviewRendererProps = {
  template: ControlledCorrectiveActionPdfTemplate;
};

function getSectionClass(layoutHint: string) {
  if (layoutHint === 'header') return 'controlled-pdf-preview-section controlled-pdf-preview-header';
  if (layoutHint === 'photo-evidence-grid') return 'controlled-pdf-preview-section controlled-pdf-preview-evidence';
  if (layoutHint === 'approval-status') return 'controlled-pdf-preview-section controlled-pdf-preview-approval';
  return 'controlled-pdf-preview-section';
}

export function ControlledPdfPreviewRenderer({ template }: ControlledPdfPreviewRendererProps) {
  return (
    <article className="card controlled-pdf-preview">
      <div className="card-header review-badge-header">
        <div>
          <div className="review-badge-row" aria-label="Controlled PDF preview status">
            <span className="step-pill">PDF PREVIEW · DRAFT ONLY</span>
            <span className="field-status">Unreleased</span>
          </div>
          <h2>{template.templateName}</h2>
          <p>{template.modelSource} · {template.templateVersion}</p>
        </div>
      </div>

      <div className="preview-box">
        <strong>Controlled Preview Status</strong>
        <p>{template.releaseGate}</p>
        <p>No download, print, send, or release behavior is enabled from this preview.</p>
      </div>

      <div className="stack" style={{ marginTop: 16 }}>
        {template.sections.map((section) => (
          <section className={getSectionClass(section.layoutHint)} key={section.sectionId}>
            <div className="card-header">
              <div>
                <h3>{section.title}</h3>
                <p>{section.layoutHint}</p>
              </div>
            </div>
            <div className="placeholder-list">
              {section.fields.map((field) => (
                <div className="placeholder-item" key={`${section.sectionId}-${field.label}`}>
                  <strong>{field.label}{field.required ? ' *' : ''}</strong>
                  <span>{field.value}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="field-help">
        Controlled PDF preview only. Future export must remain gated by human confirmation and an approved release milestone.
      </p>
    </article>
  );
}
