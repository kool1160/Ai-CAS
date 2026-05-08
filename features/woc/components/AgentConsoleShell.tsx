'use client';

import { useEffect, useState } from 'react';

const agentConsoleStorageKey = 'refab-connect-v3-agent-console-workflow';

type WorkflowCardKey = 'planningHandoff' | 'implementationResult' | 'testingResult' | 'planningLock' | 'documentationUpdate';
type WorkflowStepName = 'Planning' | 'Implementation' | 'Testing' | 'Locked' | 'Documented';

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
  status: 'Planning',
  currentStep: 'Planning',
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

const statusSteps: WorkflowStepName[] = ['Planning', 'Implementation', 'Testing', 'Locked', 'Documented'];

function persistWorkflowState(state: AgentConsoleWorkflowState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(agentConsoleStorageKey, JSON.stringify(state));
}

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

function getMilestoneLabel(state: AgentConsoleWorkflowState) {
  const milestoneId = state.milestoneId.trim() || '[MILESTONE ID]';
  const milestoneName = state.milestoneName.trim() || '[MILESTONE NAME]';
  return `${milestoneId} — ${milestoneName}`;
}

function getMilestoneId(state: AgentConsoleWorkflowState) {
  return state.milestoneId.trim() || '[MILESTONE ID]';
}

function getCommitSha(state: AgentConsoleWorkflowState) {
  return state.commitSha.trim() || '[COMMIT SHA]';
}

function getNotes(state: AgentConsoleWorkflowState) {
  return state.notes.trim() || '[NOTES]';
}

function getFieldSummary(state: AgentConsoleWorkflowState) {
  return `Milestone: ${getMilestoneLabel(state)}\nStatus: ${state.status.trim() || '[STATUS]'}\nCurrent Step: ${state.currentStep.trim() || '[CURRENT STEP]'}\nCommit: ${getCommitSha(state)}\nNotes: ${getNotes(state)}`;
}

function buildImplementationHandoff(state: AgentConsoleWorkflowState) {
  return `REFAB CONNECT V3 — IMPLEMENTATION TASK\n\nMilestone:\n${getMilestoneLabel(state)}\n\nCurrent State:\n${getFieldSummary(state)}\n\nScope Rules:\n- Complete only the approved milestone scope.\n- Do not touch V2 files.\n- Do not add backend, API, OpenAI, GitHub automation, or unrelated features unless explicitly approved.\n\nReturn only this card:\n\n# TASK RESULT CARD\n\nTask:\n${getMilestoneLabel(state)}\n\nResult:\nPass / Fail\n\nMilestone:\n${getMilestoneId(state)}\n\nCommit:\n[commit SHA]\n\nDeployment:\nPassed / Failed / Not applicable\n\nChanged:\n- [files changed]\n\nKey Output:\n[brief summary]\n\nErrors / Blockers:\n- [none or list]\n\nNext Needed:\nBring this result card back to Chat 1 for testing handoff.`;
}

function buildTestingHandoff(state: AgentConsoleWorkflowState) {
  return `REFAB CONNECT V3 — TESTING HANDOFF\n\nMilestone:\n${getMilestoneLabel(state)}\n\nCurrent State:\n${getFieldSummary(state)}\n\nImplementation Result:\n${state.implementationResult.trim() || '[PASTE IMPLEMENTATION RESULT CARD HERE]'}\n\nTest Only:\n- Approved milestone scope.\n- Changed files/areas.\n- Existing V3 screen safety where applicable.\n- No V2 file changes.\n- No unapproved backend/API/OpenAI/GitHub automation.\n\nReturn only this card:\n\n# TEST RESULT CARD\n\nTested:\n${getMilestoneLabel(state)}\n\nResult:\nPass / Fail\n\nDevice / Browser:\n[device/browser or static repo inspection]\n\nMilestone:\n${getMilestoneId(state)}\n\nDeployment:\nPassed / Failed / Not applicable\n\nPassed:\n- [checks passed]\n\nFailed:\n- [checks failed or None]\n\nIssues / Blockers:\n- [none or list]\n\nRecommendation:\nPass to Planning / Return to Implementation`;
}

function buildPlanningLockCard(state: AgentConsoleWorkflowState) {
  return `# PLANNING CLOSE CARD\n\nMilestone:\n${getMilestoneLabel(state)}\n\nStatus:\nFULLY CLOSED / PASSED / LOCKED\n\nDocumentation Tracker:\nPending Chat 4 update\n\nResult:\n${getMilestoneId(state)} is complete after Chat 4 updates the running tracker.\n\nCommit:\n${getCommitSha(state)}\n\nTesting:\n${state.testingResult.trim() || '[PASTE TEST RESULT SUMMARY HERE]'}\n\nLocked:\n- Approved milestone scope completed.\n- V2 remains closed.\n- No unapproved backend/API/OpenAI/GitHub automation added.\n- No unrelated feature expansion accepted.\n\nNotes:\n${getNotes(state)}\n\nNext Approved Milestone:\n[ENTER NEXT MILESTONE]\n\nNext Action:\nSend tracker update to Chat 4.`;
}

function buildDocumentationTrackerUpdate(state: AgentConsoleWorkflowState) {
  return `# V3 RUNNING TRACKER UPDATE\n\nMilestone:\n${getMilestoneLabel(state)}\n\nStatus:\nLOCKED / PASSED\n\nCommit:\n${getCommitSha(state)}\n\nDeployment:\nNot applicable unless noted\n\nSummary:\n${getNotes(state)}\n\nChanged:\n- [files / areas changed]\n\nTesting:\n${state.testingResult.trim() || '[PASTE TEST RESULT SUMMARY HERE]'}\n\nIssues / Resolutions:\nNone reported unless listed in testing.\n\nDecisions Locked:\n- ${getMilestoneId(state)} is closed.\n- V2 remains closed.\n- Continue through approved Planning handoffs only.\n\nNext Step:\n[ENTER NEXT APPROVED MILESTONE OR ACTION]`;
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
    persistWorkflowState(workflowState);
    setStorageFeedback('Workflow saved locally on this device/browser.');
  };

  const clearWorkflow = () => {
    window.localStorage.removeItem(agentConsoleStorageKey);
    setWorkflowState(defaultWorkflowState);
    setStorageFeedback('Workflow cleared from local storage.');
  };

  const advanceWorkflow = (step: WorkflowStepName) => {
    const nextState = {
      ...workflowState,
      status: step,
      currentStep: step,
    };

    setWorkflowState(nextState);
    persistWorkflowState(nextState);
    setStorageFeedback(`Workflow moved to ${step} and saved locally.`);
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

  const generateCard = (key: WorkflowCardKey, value: string, label: string) => {
    const nextState = { ...workflowState, [key]: value };
    setWorkflowState(nextState);
    setStorageFeedback(`${label} generated. Review, save, then copy when ready.`);
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
        {statusSteps.map((step, index) => {
          const activeStep = workflowState.currentStep || workflowState.status || 'Planning';
          return (
            <div className={activeStep === step ? 'agent-status-step active' : 'agent-status-step'} key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          );
        })}
      </section>

      <section className="card agent-current-milestone">
        <div className="card-header">
          <div>
            <h2>Current Milestone</h2>
            <p>Manual local workflow storage only. Future automation will build from this structure.</p>
          </div>
          <span className="field-status confirmed">{workflowState.currentStep || workflowState.status || 'Planning'}</span>
        </div>

        <div className="form-grid agent-console-fields">
          <label>
            Milestone ID
            <input type="text" value={workflowState.milestoneId} onChange={(event) => updateField('milestoneId', event.target.value)} placeholder="Example: V3-M7" aria-label="Milestone ID" />
          </label>
          <label>
            Milestone Name
            <input type="text" value={workflowState.milestoneName} onChange={(event) => updateField('milestoneName', event.target.value)} placeholder="Agent Console Guided Step Flow / Status Advancement" aria-label="Milestone Name" />
          </label>
          <label>
            Status
            <input type="text" value={workflowState.status} onChange={(event) => updateField('status', event.target.value)} placeholder="Planning / Implementation / Testing / Locked / Documented" aria-label="Status" />
          </label>
          <label>
            Current Step
            <input type="text" value={workflowState.currentStep} onChange={(event) => updateField('currentStep', event.target.value)} placeholder="Example: Waiting for Chat 3 review" aria-label="Current Step" />
          </label>
          <label>
            Commit SHA
            <input type="text" value={workflowState.commitSha} onChange={(event) => updateField('commitSha', event.target.value)} placeholder="Paste accepted commit SHA when available" aria-label="Commit SHA" />
          </label>
          <label className="agent-console-notes">
            Notes
            <textarea value={workflowState.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Short milestone notes, blockers, or next action." aria-label="Notes" />
          </label>
        </div>

        <div className="action-row">
          <button className="button secondary" type="button" onClick={() => advanceWorkflow('Implementation')}>Move to Implementation</button>
          <button className="button secondary" type="button" onClick={() => advanceWorkflow('Testing')}>Move to Testing</button>
          <button className="button secondary" type="button" onClick={() => advanceWorkflow('Locked')}>Move to Locked</button>
          <button className="button secondary" type="button" onClick={() => advanceWorkflow('Documented')}>Move to Documented</button>
          <button className="button primary" type="button" onClick={() => advanceWorkflow('Planning')}>Reset to Planning</button>
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
            <textarea value={workflowState[card.key]} onChange={(event) => updateField(card.key, event.target.value)} placeholder={card.placeholder} aria-label={card.title} />
            <button className="button secondary full-width" type="button" onClick={() => copyCard(card.key, card.title)}>Copy Card</button>
          </article>
        ))}
      </section>

      <section className="card agent-actions-panel">
        <h2>Workflow Actions</h2>
        <p>
          Generator buttons populate local workflow cards only. No API, backend, OpenAI, GitHub, or automation calls are wired in V3-M7.
        </p>
        <div className="action-row agent-action-grid">
          <button className="button secondary" type="button" onClick={() => generateCard('planningHandoff', buildImplementationHandoff(workflowState), 'Implementation handoff')}>Generate Implementation Handoff</button>
          <button className="button secondary" type="button" onClick={() => generateCard('testingResult', buildTestingHandoff(workflowState), 'Testing handoff')}>Generate Testing Handoff</button>
          <button className="button secondary" type="button" onClick={() => generateCard('planningLock', buildPlanningLockCard(workflowState), 'Planning lock card')}>Generate Planning Lock Card</button>
          <button className="button secondary" type="button" onClick={() => generateCard('documentationUpdate', buildDocumentationTrackerUpdate(workflowState), 'Documentation tracker update')}>Generate Documentation Tracker Update</button>
        </div>
      </section>
    </article>
  );
}
