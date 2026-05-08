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
  { key: 'planningHandoff', title: 'Planning Handoff', placeholder: 'Paste or generate the Chat 2 implementation handoff.' },
  { key: 'implementationResult', title: 'Implementation Result', placeholder: 'Paste Chat 2 task result card.' },
  { key: 'testingResult', title: 'Testing Result', placeholder: 'Paste or generate Chat 3 testing handoff/result.' },
  { key: 'planningLock', title: 'Planning Lock', placeholder: 'Generate or paste the Planning close card.' },
  { key: 'documentationUpdate', title: 'Documentation Update', placeholder: 'Generate or paste the Chat 4 tracker update.' },
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
  const [nextMilestoneId, setNextMilestoneId] = useState('');
  const [nextMilestoneName, setNextMilestoneName] = useState('');

  useEffect(() => {
    setWorkflowState(loadWorkflowState());
  }, []);

  const updateWorkflowState = (nextState: AgentConsoleWorkflowState, shouldPersist = false) => {
    setWorkflowState(nextState);
    if (shouldPersist) persistWorkflowState(nextState);
  };

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
    const nextState = { ...workflowState, status: step, currentStep: step };
    updateWorkflowState(nextState, true);
    setStorageFeedback(`Workflow moved to ${step} and saved locally.`);
  };

  const useSuggestedMilestone = () => {
    setNextMilestoneId('V3-M11');
    setNextMilestoneName('Agent Console Quick Start / Milestone Autofill');
    setStorageFeedback('Suggested V3-M11 loaded into Quick Start.');
  };

  const startNewMilestone = () => {
    const nextState: AgentConsoleWorkflowState = {
      ...defaultWorkflowState,
      milestoneId: nextMilestoneId.trim() || 'V3-M11',
      milestoneName: nextMilestoneName.trim() || 'Agent Console Quick Start / Milestone Autofill',
      status: 'Planning',
      currentStep: 'Planning',
      commitSha: 'Pending',
      notes: 'New milestone started from Agent Console.',
    };

    updateWorkflowState(nextState, true);
    setStorageFeedback('New milestone started and saved locally.');
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
    updateWorkflowState({ ...workflowState, [key]: value });
    setStorageFeedback(`${label} generated. Review, save, then copy when ready.`);
  };

  const activeStep = workflowState.currentStep || workflowState.status || 'Planning';

  return (
    <article className="card agent-console-shell">
      <div className="screen-title agent-console-title">
        <span className="step-pill">V3 WORKFLOW CONTROLLER</span>
        <h1>Agent Console</h1>
        <p>Operator-style cockpit for moving V3 milestones through planning, implementation, testing, lock, and documentation.</p>
      </div>

      <section className="card agent-quick-start">
        <div className="card-header">
          <div>
            <h2>Quick Start</h2>
            <p>Start the next milestone and reset the cockpit to Planning.</p>
          </div>
          <span className="field-status confirmed">Autofill</span>
        </div>
        <div className="form-grid agent-console-fields">
          <label>
            Next Milestone ID
            <input type="text" value={nextMilestoneId} onChange={(event) => setNextMilestoneId(event.target.value)} placeholder="Example: V3-M12" aria-label="Next Milestone ID" />
          </label>
          <label>
            Next Milestone Name
            <input type="text" value={nextMilestoneName} onChange={(event) => setNextMilestoneName(event.target.value)} placeholder="Agent Console Workflow Condensation / Operator UX Pass" aria-label="Next Milestone Name" />
          </label>
        </div>
        <div className="action-row">
          <button className="button secondary" type="button" onClick={useSuggestedMilestone}>Use Suggested V3-M11</button>
          <button className="button success" type="button" onClick={startNewMilestone}>Start New Milestone</button>
        </div>
      </section>

      <section className="card agent-current-milestone">
        <div className="card-header">
          <div>
            <h2>{workflowState.milestoneId || 'No Milestone Started'}</h2>
            <p>{workflowState.milestoneName || 'Use Quick Start to load the next V3 milestone.'}</p>
          </div>
          <span className="field-status confirmed">{activeStep}</span>
        </div>

        <section className="agent-console-status" aria-label="Agent Console workflow timeline">
          {statusSteps.map((step, index) => (
            <button className={activeStep === step ? 'agent-status-step active' : 'agent-status-step'} type="button" onClick={() => advanceWorkflow(step)} key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </button>
          ))}
        </section>

        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item">
            <strong>Status / Step</strong>
            <span>{workflowState.status || 'Planning'} / {workflowState.currentStep || 'Planning'}</span>
          </div>
          <div className="placeholder-item">
            <strong>Commit</strong>
            <span>{workflowState.commitSha || 'Pending'}</span>
          </div>
          <div className="placeholder-item">
            <strong>Notes</strong>
            <span>{workflowState.notes || 'No notes added yet.'}</span>
          </div>
        </div>

        <div className="action-row">
          <button className="button success" type="button" onClick={saveWorkflow}>Save Workflow</button>
          <button className="button danger" type="button" onClick={clearWorkflow}>Clear Workflow</button>
        </div>
        {storageFeedback && <p className="field-help">Agent Console: {storageFeedback}</p>}
      </section>

      <section className="card agent-details-panel">
        <div className="card-header">
          <div>
            <h2>Milestone Details</h2>
            <p>Secondary fields for manual corrections, commits, and notes.</p>
          </div>
        </div>
        <div className="form-grid agent-console-fields">
          <label>
            Milestone ID
            <input type="text" value={workflowState.milestoneId} onChange={(event) => updateField('milestoneId', event.target.value)} placeholder="Example: V3-M12" aria-label="Milestone ID" />
          </label>
          <label>
            Milestone Name
            <input type="text" value={workflowState.milestoneName} onChange={(event) => updateField('milestoneName', event.target.value)} placeholder="Agent Console Workflow Condensation / Operator UX Pass" aria-label="Milestone Name" />
          </label>
          <label>
            Commit SHA
            <input type="text" value={workflowState.commitSha} onChange={(event) => updateField('commitSha', event.target.value)} placeholder="Pending" aria-label="Commit SHA" />
          </label>
          <label className="agent-console-notes">
            Notes
            <textarea value={workflowState.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Short milestone notes, blockers, or next action." aria-label="Notes" />
          </label>
        </div>
      </section>

      <section className="card agent-actions-panel">
        <h2>Generate Handoffs</h2>
        <p>Local template buttons only. No API, backend, OpenAI, GitHub, or automation calls are wired in V3-M12.</p>
        <div className="action-row agent-action-grid">
          <button className="button secondary" type="button" onClick={() => generateCard('planningHandoff', buildImplementationHandoff(workflowState), 'Implementation handoff')}>Implementation Handoff</button>
          <button className="button secondary" type="button" onClick={() => generateCard('testingResult', buildTestingHandoff(workflowState), 'Testing handoff')}>Testing Handoff</button>
          <button className="button secondary" type="button" onClick={() => generateCard('planningLock', buildPlanningLockCard(workflowState), 'Planning lock card')}>Planning Lock</button>
          <button className="button secondary" type="button" onClick={() => generateCard('documentationUpdate', buildDocumentationTrackerUpdate(workflowState), 'Documentation tracker update')}>Tracker Update</button>
        </div>
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
    </article>
  );
}
