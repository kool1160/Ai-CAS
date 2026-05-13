const correctiveActionSections = [
  {
    title: 'Job / Part Information',
    description: 'Placeholder for work order, part number, revision, customer, quantity, part description, and material.',
  },
  {
    title: 'Routing / Operations',
    description: 'Placeholder for affected operation, next operation, inspection operation, and routing context.',
  },
  {
    title: 'Issue Summary',
    description: 'Placeholder for the defect, failure point, key feature, and shop-floor issue description.',
  },
  {
    title: 'Corrective Action Requirements',
    description: 'Placeholder for required cleaning, gauge checks, staging rules, and controlled process steps.',
  },
  {
    title: 'Photo Evidence',
    description: 'Placeholder for work order, print, part condition, gauge check, cleaned area, and staging photos.',
  },
  {
    title: 'Operator Checklist',
    description: 'Placeholder for simple pass/fail checklist items operators can follow before release.',
  },
  {
    title: 'Release Approval',
    description: 'Placeholder for responsibility matrix, pass/fail condition, closeout, and release approval.',
  },
];

export function CorrectiveActionBuilderShell() {
  return (
    <article className="card corrective-action-builder-shell">
      <div className="card-header">
        <div>
          <span className="step-pill">V3 SHELL ONLY</span>
          <h2>Corrective Action Builder</h2>
          <p>Create controlled shop-floor corrective action sheets from work order, print, part, gauge, and staging evidence.</p>
        </div>
        <span className="field-status pending">Shell</span>
      </div>

      <p className="field-help">
        This is a frontend shell only. PDF generation, backend storage, AI extraction, and runtime automation are not enabled in V3-M19.
      </p>

      <div className="placeholder-list" style={{ marginTop: 14 }}>
        <div className="placeholder-item">
          <strong>Reference Pattern</strong>
          <span>Corrective Action Sheet with job data, routing context, issue summary, requirements, containment, evidence, checklist, and approval.</span>
        </div>
        <div className="placeholder-item">
          <strong>Future Input Sources</strong>
          <span>Work order, print, part photos, gauge evidence, cleaning evidence, and staging evidence.</span>
        </div>
      </div>

      <section className="agent-workflow-grid" aria-label="Corrective Action Builder shell sections" style={{ marginTop: 16 }}>
        {correctiveActionSections.map((section, index) => (
          <article className="card agent-workflow-card" key={section.title}>
            <div className="card-header">
              <div>
                <span className="step-pill">{String(index + 1).padStart(2, '0')}</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </div>
            <p className="field-help">Placeholder only. Fields and PDF output will be added in a future approved milestone.</p>
          </article>
        ))}
      </section>
    </article>
  );
}
