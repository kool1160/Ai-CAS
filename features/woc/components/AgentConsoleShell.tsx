const workflowCards = [
  {
    title: 'Planning Handoff',
    placeholder: 'Paste or draft the Chat 1 planning handoff here before sending it to implementation.',
  },
  {
    title: 'Implementation Result',
    placeholder: 'Paste Chat 2 task result card here after implementation finishes.',
  },
  {
    title: 'Testing Result',
    placeholder: 'Paste Chat 3 test result card here after documentation/runtime review.',
  },
  {
    title: 'Planning Lock',
    placeholder: 'Paste or draft the Chat 1 planning close card here when the milestone passes.',
  },
  {
    title: 'Documentation Update',
    placeholder: 'Paste the Chat 4 tracker update or documentation closeout note here.',
  },
];

const statusSteps = ['Planning', 'Implementation', 'Testing', 'Locked', 'Documented'];

const actionButtons = [
  'Start Milestone',
  'Generate Implementation Handoff',
  'Paste Implementation Result',
  'Generate Testing Handoff',
  'Paste Testing Result',
  'Lock Passed',
  'Generate Tracker Update',
];

export function AgentConsoleShell() {
  return (
    <article className="card agent-console-shell">
      <div className="screen-title agent-console-title">
        <span className="step-pill">V3 WORKFLOW CONTROLLER</span>
        <h1>Agent Console</h1>
        <p>
          A workflow controller for moving Refab Connect V3 milestones through planning, implementation,
          testing, lock, and documentation steps.
        </p>
      </div>

      <section className="agent-console-status" aria-label="Agent Console status steps">
        {statusSteps.map((step, index) => (
          <div className="agent-status-step" key={step}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>

      <section className="card agent-current-milestone">
        <div className="card-header">
          <div>
            <h2>Current Milestone</h2>
            <p>Manual control shell only. Future automation will build from this structure.</p>
          </div>
          <span className="field-status confirmed">Shell</span>
        </div>

        <div className="form-grid agent-console-fields">
          <label>
            Milestone ID
            <input type="text" placeholder="Example: V3-M4" aria-label="Milestone ID" />
          </label>
          <label>
            Milestone Name
            <input type="text" placeholder="Agent Console UI Shell / Workflow Controller Start" aria-label="Milestone Name" />
          </label>
          <label>
            Status
            <input type="text" placeholder="Planning / Implementation / Testing / Locked / Documented" aria-label="Status" />
          </label>
          <label>
            Current Step
            <input type="text" placeholder="Example: Waiting for Chat 3 review" aria-label="Current Step" />
          </label>
          <label>
            Commit SHA
            <input type="text" placeholder="Paste accepted commit SHA when available" aria-label="Commit SHA" />
          </label>
          <label className="agent-console-notes">
            Notes
            <textarea placeholder="Short milestone notes, blockers, or next action." aria-label="Notes" />
          </label>
        </div>
      </section>

      <section className="agent-workflow-grid" aria-label="Agent Console workflow cards">
        {workflowCards.map((card) => (
          <article className="card agent-workflow-card" key={card.title}>
            <div className="card-header">
              <div>
                <h3>{card.title}</h3>
                <p>{card.placeholder}</p>
              </div>
            </div>
            <textarea placeholder={card.placeholder} aria-label={card.title} />
            <button className="button secondary full-width" type="button" disabled>
              Copy Placeholder
            </button>
          </article>
        ))}
      </section>

      <section className="card agent-actions-panel">
        <h2>Workflow Actions</h2>
        <p>Buttons are visible placeholders only. No API, backend, OpenAI, GitHub, or automation calls are wired in V3-M4.</p>
        <div className="action-row agent-action-grid">
          {actionButtons.map((label) => (
            <button className="button secondary" type="button" disabled key={label}>
              {label}
            </button>
          ))}
        </div>
      </section>
    </article>
  );
}
