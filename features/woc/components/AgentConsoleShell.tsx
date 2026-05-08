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

function getFieldSummary(state: AgentConsoleWorkflowState) {
  return `Milestone ID:\n${state.milestoneId.trim() || '[MILESTONE ID]'}\n\nMilestone Name:\n${state.milestoneName.trim() || '[MILESTONE NAME]'}\n\nStatus:\n${state.status.trim() || '[STATUS]'}\n\nCurrent Step:\n${state.currentStep.trim() || '[CURRENT STEP]'}\n\nCommit SHA:\n${state.commitSha.trim() || '[COMMIT SHA / NOT AVAILABLE]'}\n\nNotes:\n${state.notes.trim() || '[NOTES]'};`;
}

function buildImplementationHandoff(state: AgentConsoleWorkflowState) {
  return `REFAB CONNECT V3 — IMPLEMENTATION TASK\n\nMilestone:\n${getMilestoneLabel(state)}\n\nGoal:\nUse this Planning handoff to complete the approved milestone only.\n\nCurrent Workflow Fields:\n${getFieldSummary(state)}\n\nScope:\nFollow the approved Planning scope only.\nDo not expand features.\nDo not touch V2 files.\nDo not add backend/API/OpenAI/GitHub automation unless explicitly approved.\n\nRequired Output:\nReturn only a TASK RESULT CARD.\n\n# TASK RESULT CARD\n\nTask:\n${getMilestoneLabel(state)}\n\nResult:\nPass / Fail\n\nMilestone:\n${state.milestoneId.trim() || '[MILESTONE ID]'}\n\nCommit:\n[commit SHA]\n\nDeployment:\nPassed / Failed / Not applicable\n\nChanged:\n- [files changed]\n\nKey Output:\n[brief summary]\n\nErrors / Blockers:\n- [none or list]\n\nNext Needed:\nBring this result card back to Chat 1 for testing handoff.`;
}

function buildTestingHandoff(state: AgentConsoleWorkflowState) {
  return `REFAB CONNECT V3 — TESTING HANDOFF\n\nMilestone:\n${getMilestoneLabel(state)}\n\nTest Scope:\nReview only the approved milestone changes.\nDo not test unapproved future features.\nDo not implement code.\n\nCurrent Workflow Fields:\n${getFieldSummary(state)}\n\nImplementation Result:\n${state.implementationResult.trim() || '[PASTE IMPLEMENTATION RESULT CARD HERE]'}\n\nAcceptance Checks:\n- Confirm the approved files/areas changed as expected.\n- Confirm no V2 files changed.\n- Confirm no backend/API/OpenAI/GitHub automation was added unless approved.\n- Confirm existing V3 screens still load where applicable.\n- Report pass/fail clearly.\n\nRequired Output:\nReturn only a TEST RESULT CARD.\n\n# TEST RESULT CARD\n\nTested:\n${getMilestoneLabel(state)}\n\nResult:\nPass / Fail\n\nDevice / Browser:\n[device/browser or static repo inspection]\n\nMilestone:\n${state.milestoneId.trim() || '[MILESTONE ID]'}\n\nDeployment:\nPassed / Failed / Not applicable\n\nPassed:\n- [checks passed]\n\nFailed:\n- [checks failed or None]\n\nIssues / Blockers:\n- [none or list]\n\nRecommendation:\nPass to Planning / Return to Implementation`;
}

function buildPlanningLockCard(state: AgentConsoleWorkflowState) {
  return `# PLANNING CLOSE CARD\n\nMilestone:\n${getMilestoneLabel(state)}\n\nStatus:\nFULLY CLOSED / PASSED / LOCKED\n\nDocumentation Tracker:\nPending Chat 4 update\n\nResult:\n${state.milestoneId.trim() || '[MILESTONE ID]'} is officially complete once Chat 4 updates the running tracker.\n\nImplementation Commit:\n${state.commitSha.trim() || '[COMMIT SHA]'}\n\nTesting Result:\n${state.testingResult.trim() || '[PASTE TEST RESULT SUMMARY HERE]'}\n\nLocked:\n- Approved milestone scope completed\n- V2 remains closed\n- No unapproved backend/API/OpenAI/GitHub automation added\n- No unrelated feature expansion accepted\n\nNotes:\n${state.notes.trim() || '[NOTES]'}\n\nNext Approved Milestone:\n[ENTER NEXT MILESTONE]\n\nNext Action:\nSend finalized tracker update to Chat 4.`;
}

function buildDocumentationTrackerUpdate(state: AgentConsoleWorkflowState) {
  return `# V3 RUNNING TRACKER UPDATE\n\nMilestone:\n${getMilestoneLabel(state)}\n\nStatus:\nLOCKED / PASSED\n\nCommit:\n${state.commitSha.trim() || '[COMMIT SHA]'}\n\nDeployment:\nNot applicable unless noted\n\nSummary:\n${state.notes.trim() || '[SHORT SUMMARY OF WHAT THIS MILESTONE COMPLETED]'}\n\nFiles / Areas Affected:\n- [ADD FILES / AREAS FROM IMPLEMENTATION RESULT]\n\nTesting Completed:\n${state.testingResult.trim() || '[PASTE TEST RESULT SUMMARY HERE]'}\n\nIssues / Resolutions:\nNone reported unless listed in testing.\n\nDecisions Locked:\n- ${state.milestoneId.trim() || '[MILESTONE ID]'} is closed.\n- V2 remains closed.\n- Future work must continue through approved Planning handoffs.\n\nNext Step:\n[ENTER NEXT APPROVED MILESTONE OR ACTION]`;
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

  const generateCard = (key: WorkflowCardKey, value: string, label: string) => {
    setWorkflowState((current) => ({ ...current, [key]: value }));
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
            <input type="text" value={workflowState.milestoneId} onChange={(event) => updateField('milestoneId', event.target.value)} placeholder="Example: V3-M6" aria-label="Milestone ID" />
          </label>
          <label>
            Milestone Name
            <input type="text" value={workflowState.milestoneName} onChange={(event) => updateField('milestoneName', event.target.value)} placeholder="Agent Console Handoff Generator Buttons" aria-label="Milestone Name" />
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
          Generator buttons populate local workflow cards only. No API, backend, OpenAI, GitHub, or automation calls are wired in V3-M6.
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
