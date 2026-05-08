'use client';

import { useEffect, useState } from 'react';

const agentConsoleStorageKey = 'refab-connect-v3-agent-console-workflow';

type WorkflowCardKey = 'planningHandoff' | 'implementationResult' | 'testingResult' | 'planningLock' | 'documentationUpdate';

type AgentConsoleWorkflowState = {
  milestoneId: string;
  milestoneName: string;
  status: string;
  currentStep: string;
  commitSha: string;
  notes: string;
  planningHandoff: string;
  implementationResult: string;
  testingResult: string;
  planningLock: string;
  documentationUpdate: string;
};

const defaultWorkflowState: AgentConsoleWorkflowState = {
  milestoneId: '',
  milestoneName: '',
  status: '',
  currentStep: '',
  commitSha: '',
  notes: '',
  planningHandoff: '',
  implementationResult: '',
  testingResult: '',
  planningLock: '',
  documentationUpdate: '',
};

const workflowCards: Array<{ key: WorkflowCardKey; title: string; placeholder: string }> = [
  {
    key: 'planningHandoff',
    title: 'Planning Handoff',
    placeholder: 'Paste or draft the Chat 1 planning handoff here before sending it to implementation.',
  },
  {
    key: 'implementationResult',
    title: 'Implementation Result',
    placeholder: 'Paste Chat 2 task result card here after implementation finishes.',
  },
  {
    key: 'testingResult',
    title: 'Testing Result',
    placeholder: 'Paste Chat 3 test result card here after documentation/runtime review.',
  },
  {
    key: 'planningLock',
    title: 'Planning Lock',
    placeholder: 'Paste or draft the Chat 1 planning close card here when the milestone passes.',
  },
  {
    key: 'documentationUpdate',
    title: 'Documentation Update',
    placeholder: 'Paste the Chat 4 tracker update or documentation closeout note here.',
  },
];

const statusSteps = ['Planning', 'Implementation', 'Testing', 'Locked', 'Documented'];

const placeholderActionButtons = [
  'Start Milestone',
  'Generate Implementation Handoff',
  'Paste Implementation Result',
  'Generate Testing Handoff',
  'Paste Testing Result',
  'Lock Passed',
  'Generate Tracker Update',
];

function loadWorkflowState() {
  if (typeof window === 'undefined') return defaultWorkflowState;

  try {
    const saved = window.localStorage.getItem(agentConsoleStorageKey);
    if (!saved) return defaultWorkflowState;

    return { ...defaultWorkflowState, ...JSON.parse(saved) } as AgentConsoleWorkflowState;
  } catch {
    return defaultWorkflowState;
  }
}

export function AgentConsoleShell() {
  const [workflowState, setWorkflowState] = useState<AgentConsoleWorkflowState>(defaultWorkflowState);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);

  useEffect(() => {
    setWorkflowState(loadWorkflowState());
  }, []);

  const updateField = (key: keyof AgentConsoleWorkflowState, value: string) => {
    setWorkflowState((current) => ({ ...current, [key]: value }));
    setStorageFeedback(null);
  };

  const saveWorkflow = () => {
    window.localStorage.setItem(agentConsoleStorageKey, JSON.stringify(workflowState));
    setStorageFeedback('Workflow saved locally on this device/browser.');
  };

  const clearWorkflow = () => {
    window.localStorage.removeItem(agentConsoleStorageKey);
    setWorkflowState(defaultWorkflowState);
    setStorageFeedback('Workflow cleared from local storage.');
  };

  const copyCard = async (key: WorkflowCardKey, title: string) => {
    const value = workflowState[key].trim();
    if (!value) {
      setStorageFeedback(`${title} is empty. Nothing copied.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStorageFeedback(`${title} copied to clipboard.`);
    } catch {
      setStorageFeedback(`${title} could not be copied. Use manual selection as fallback.`);
    }
  };

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
            <p>Manual local workflow storage only. Future automation will build from this structure.</p>
          </div>
          <span className="field-status confirmed">Local</span>
        </div>

        <div className="form-grid agent-console-fields">
          <label>
            Milestone ID
            <input
              type="text"
              value={workflowState.milestoneId}
              onChange={(event) => updateField('milestoneId', event.target.value)}
              placeholder="Example: V3-M5"
              aria-label="Milestone ID"
            />
          </label>
          <label>
            Milestone Name
            <input
              type="text"
              value={workflowState.milestoneName}
              onChange={(event) => updateField('milestoneName', event.target.value)}
              placeholder="Agent Console Workflow State / Local Card Storage"
              aria-label="Milestone Name"
            />
          </label>
          <label>
            Status
            <input
              type="text"
              value={workflowState.status}
              onChange={(event) => updateField('status', event.target.value)}
              placeholder="Planning / Implementation / Testing / Locked / Documented"
              aria-label="Status"
            />
          </label>
          <label>
            Current Step
            <input
              type="text"
              value={workflowState.currentStep}
              onChange={(event) => updateField('currentStep', event.target.value)}
              placeholder="Example: Waiting for Chat 3 review"
              aria-label="Current Step"
            />
          </label>
          <label>
            Commit SHA
            <input
              type="text"
              value={workflowState.commitSha}
              onChange={(event) => updateField('commitSha', event.target.value)}
              placeholder="Paste accepted commit SHA when available"
              aria-label="Commit SHA"
            />
          </label>
          <label className="agent-console-notes">
            Notes
            <textarea
              value={workflowState.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Short milestone notes, blockers, or next action."
              aria-label="Notes"
            />
          </label>
        </div>

        <div className="action-row">
          <button className="button success" type="button" onClick={saveWorkflow}>Save Workflow</button>
          <button className="button danger" type="button" onClick={clearWorkflow}>Clear Workflow</button>
        </div>
        {storageFeedback && <p className="field-help">Agent Console: {storageFeedback}</p>}
      </section>

      <section className="agent-workflow-grid" aria-label="Agent Console workflow cards">
        {workflowCards.map((card) => (
          <article className="card agent-workflow-card" key={card.key}>
            <div className="card-header">
              <div>
                <h3>{card.title}</h3>
                <p>{card.placeholder}</p>
              </div>
            </div>
            <textarea
              value={workflowState[card.key]}
              onChange={(event) => updateField(card.key, event.target.value)}
              placeholder={card.placeholder}
              aria-label={card.title}
            />
            <button className="button secondary full-width" type="button" onClick={() => copyCard(card.key, card.title)}>
              Copy Card
            </button>
          </article>
        ))}
      </section>

      <section className="card agent-actions-panel">
        <h2>Workflow Actions</h2>
        <p>
          Save Workflow and Copy Card are local browser utilities. The remaining buttons are visible placeholders only.
          No API, backend, OpenAI, GitHub, or automation calls are wired in V3-M5.
        </p>
        <div className="action-row agent-action-grid">
          {placeholderActionButtons.map((label) => (
            <button className="button secondary" type="button" disabled key={label}>
              {label}
            </button>
          ))}
        </div>
      </section>
    </article>
  );
}
