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

type ActionFeedback = {
  completed: string;
  next: string;
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

function getStepRecommendation(step: string) {
  if (step === 'Implementation') return 'Paste Chat 2 task result card, then save workflow.';
  if (step === 'Testing') return 'Generate testing handoff, then paste Chat 3 test result card.';
  if (step === 'Locked') return 'Generate the planning lock card, then copy it back to Chat 1.';
  if (step === 'Documented') return 'Generate the documentation tracker update for Chat 4.';
  return 'Generate the implementation handoff, then copy/paste it into Chat 2.';
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

function getStageCard(step: string): { key: WorkflowCardKey; title: string; helper: string; actionLabel?: string } {
  if (step === 'Implementation') {
    return {
      key: 'implementationResult',
      title: 'Implementation Result',
      helper: 'Paste Chat 2 task result card here.',
    };
  }

  if (step === 'Testing') {
    return {
      key: 'testingResult',
      title: 'Testing Handoff / Testing Result',
      helper: 'Generate testing handoff, then paste Chat 3 test result card here.',
      actionLabel: 'Generate Testing Handoff',
    };
  }

  if (step === 'Locked') {
    return {
      key: 'planningLock',
      title: 'Planning Lock Card',
      helper: 'Generate or paste the Planning lock card here.',
      actionLabel: 'Generate Planning Lock',
    };
  }

  if (step === 'Documented') {
    return {
      key: 'documentationUpdate',
      title: 'Documentation Tracker Update',
      helper: 'Generate or paste the Chat 4 tracker update here.',
      actionLabel: 'Generate Tracker Update',
    };
  }

  return {
    key: 'planningHandoff',
    title: 'Implementation Handoff',
    helper: 'Generate the Chat 2 implementation handoff, then copy it into Chat 2.',
    actionLabel: 'Generate Implementation Handoff',
  };
}

export function AgentConsoleShell() {
  const [workflowState, setWorkflowState] = useState<AgentConsoleWorkflowState>(defaultWorkflowState);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>({
    completed: 'Agent Console ready.',
    next: 'Start a milestone or continue the saved workflow.',
  });
  const [nextMilestoneId, setNextMilestoneId] = useState('');
  const [nextMilestoneName, setNextMilestoneName] = useState('');
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const activeStep = workflowState.currentStep || workflowState.status || 'Planning';
  const activeStageCard = getStageCard(activeStep);
  const nextStepLabel = statusSteps[statusSteps.indexOf(activeStep as WorkflowStepName) + 1];

  const setFeedback = (completed: string, next = getStepRecommendation(activeStep)) => {
    setActionFeedback({ completed, next });
  };

  useEffect(() => {
    const savedState = loadWorkflowState();
    setWorkflowState(savedState);
    setActionFeedback({
      completed: savedState.milestoneId ? `Restored workflow: ${savedState.milestoneId}` : 'Agent Console ready.',
      next: getStepRecommendation(savedState.currentStep || savedState.status || 'Planning'),
    });
  }, []);

  const updateWorkflowState = (nextState: AgentConsoleWorkflowState, shouldPersist = false) => {
    setWorkflowState(nextState);
    if (shouldPersist) persistWorkflowState(nextState);
  };

  const updateField = (key: keyof AgentConsoleWorkflowState, value: string) => {
    setWorkflowState((current) => ({ ...current, [key]: value }));
  };

  const saveWorkflow = () => {
    persistWorkflowState(workflowState);
    setFeedback('Workflow saved locally.', getStepRecommendation(activeStep));
  };

  const clearWorkflow = () => {
    window.localStorage.removeItem(agentConsoleStorageKey);
    setWorkflowState(defaultWorkflowState);
    setFeedback('Workflow cleared.', 'Start a new milestone from Quick Start.');
  };

  const advanceWorkflow = (step: WorkflowStepName) => {
    const nextState = { ...workflowState, status: step, currentStep: step };
    updateWorkflowState(nextState, true);
    setFeedback(`Moved to ${step}.`, getStepRecommendation(step));
  };

  const moveToNextStep = () => {
    const currentIndex = statusSteps.indexOf(activeStep as WorkflowStepName);
    const nextStep = statusSteps[currentIndex + 1];

    if (!nextStep) {
      setFeedback('Workflow is already at Documented.', 'Generate the documentation tracker update if it is not complete yet.');
      return;
    }

    advanceWorkflow(nextStep);
  };

  const useSuggestedMilestone = () => {
    setNextMilestoneId('V3-M11');
    setNextMilestoneName('Agent Console Quick Start / Milestone Autofill');
    setFeedback('Suggested milestone loaded: V3-M11.', 'Review the milestone fields, then tap Start New Milestone.');
  };

  const startNewMilestone = () => {
    const milestoneId = nextMilestoneId.trim() || 'V3-M11';
    const nextState: AgentConsoleWorkflowState = {
      ...defaultWorkflowState,
      milestoneId,
      milestoneName: nextMilestoneName.trim() || 'Agent Console Quick Start / Milestone Autofill',
      status: 'Planning',
      currentStep: 'Planning',
      commitSha: 'Pending',
      notes: 'New milestone started from Agent Console.',
    };

    updateWorkflowState(nextState, true);
    setFeedback(`Milestone started: ${milestoneId}.`, 'Generate the implementation handoff, then copy/paste it into Chat 2.');
  };

  const copyCard = async (key: WorkflowCardKey, title: string) => {
    const value = workflowState[key].trim();
    if (!value) {
      setFeedback(`${title} is empty. Nothing copied.`, 'Generate or paste the card before copying.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setFeedback('Copied to clipboard.', `Paste ${title} into the correct chat, then return here for the next step.`);
    } catch {
      setFeedback(`${title} could not be copied.`, 'Use manual selection as the fallback copy method.');
    }
  };

  const generateCard = (key: WorkflowCardKey, value: string, label: string, next: string) => {
    updateWorkflowState({ ...workflowState, [key]: value });
    setFeedback(`${label} generated.`, next);
  };

  const generateStageCard = (key: WorkflowCardKey) => {
    if (key === 'planningHandoff') {
      generateCard(
        'planningHandoff',
        buildImplementationHandoff(workflowState),
        'Implementation Handoff',
        'Ready to copy/paste into Chat 2.'
      );
    }

    if (key === 'testingResult') {
      generateCard(
        'testingResult',
        buildTestingHandoff(workflowState),
        'Testing Handoff',
        'Ready to copy/paste into Chat 3, then paste Chat 3 test result card here.'
      );
    }

    if (key === 'planningLock') {
      generateCard(
        'planningLock',
        buildPlanningLockCard(workflowState),
        'Planning Lock Card',
        'Ready to copy back to Chat 1 for milestone lock.'
      );
    }

    if (key === 'documentationUpdate') {
      generateCard(
        'documentationUpdate',
        buildDocumentationTrackerUpdate(workflowState),
        'Documentation Tracker Update',
        'Ready to copy/paste into Chat 4.'
      );
    }
  };

  return (
    <article className="card agent-console-shell">
      <div className="screen-title agent-console-title">
        <span className="step-pill">V3 WORKFLOW CONTROLLER</span>
        <h1>Agent Console</h1>
        <p>Operator-style cockpit for moving V3 milestones through planning, implementation, testing, lock, and documentation.</p>
      </div>

      <section className="card agent-current-milestone" aria-live="polite">
        <div className="card-header">
          <div>
            <h2>Action Status</h2>
            <p>{actionFeedback.completed}</p>
          </div>
          <span className="field-status confirmed">Done</span>
        </div>
        <div className="placeholder-list">
          <div className="placeholder-item">
            <strong>Last Action</strong>
            <span>{actionFeedback.completed}</span>
          </div>
          <div className="placeholder-item">
            <strong>Next Recommended Action</strong>
            <span>{actionFeedback.next}</span>
          </div>
        </div>
      </section>

      <section className="card agent-quick-start">
        <div className="card-header">
          <div>
            <h2>Quick Start</h2>
            <p>Start the next milestone and reset the cockpit to Planning.</p>
          </div>
          <span className="field-status confirmed">Essential Mode</span>
        </div>
        <div className="form-grid agent-console-fields">
          <label>
            Next Milestone ID
            <input type="text" value={nextMilestoneId} onChange={(event) => setNextMilestoneId(event.target.value)} placeholder="Example: V3-M15" aria-label="Next Milestone ID" />
          </label>
          <label>
            Next Milestone Name
            <input type="text" value={nextMilestoneName} onChange={(event) => setNextMilestoneName(event.target.value)} placeholder="Agent Console Action Feedback / Completion Status Strip" aria-label="Next Milestone Name" />
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

        <p className="field-help">Tap any workflow stage below to jump there, or use Next Step to move forward one stage.</p>
        <section className="agent-console-status" aria-label="Agent Console workflow timeline">
          {statusSteps.map((step, index) => (
            <button
              className={activeStep === step ? 'agent-status-step active' : 'agent-status-step'}
              type="button"
              onClick={() => advanceWorkflow(step)}
              key={step}
              title={`Tap to move workflow to ${step}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              <small>Tap</small>
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
          {nextStepLabel && <button className="button success" type="button" onClick={moveToNextStep}>Next Step: {nextStepLabel}</button>}
          <button className="button secondary" type="button" onClick={() => setShowAdvancedDetails((current) => !current)}>
            {showAdvancedDetails ? 'Hide Advanced Details' : 'Show Advanced Details'}
          </button>
        </div>
      </section>

      <section className="card agent-actions-panel">
        <div className="card-header">
          <div>
            <h2>{activeStageCard.title}</h2>
            <p>{activeStageCard.helper}</p>
          </div>
          <span className="field-status confirmed">{activeStep}</span>
        </div>
        <textarea
          value={workflowState[activeStageCard.key]}
          onChange={(event) => updateField(activeStageCard.key, event.target.value)}
          placeholder={activeStageCard.helper}
          aria-label={activeStageCard.title}
        />
        <div className="action-row">
          {activeStageCard.actionLabel && (
            <button className="button secondary" type="button" onClick={() => generateStageCard(activeStageCard.key)}>{activeStageCard.actionLabel}</button>
          )}
          <button className="button secondary" type="button" onClick={() => copyCard(activeStageCard.key, activeStageCard.title)}>Copy Card</button>
        </div>
      </section>

      {showAdvancedDetails && (
        <>
          <section className="card agent-details-panel">
            <div className="card-header">
              <div>
                <h2>Advanced Details</h2>
                <p>Manual corrections, commits, notes, and all card text remain available here.</p>
              </div>
              <span className="field-status pending">Advanced</span>
            </div>
            <div className="form-grid agent-console-fields">
              <label>
                Milestone ID
                <input type="text" value={workflowState.milestoneId} onChange={(event) => updateField('milestoneId', event.target.value)} placeholder="Example: V3-M15" aria-label="Milestone ID" />
              </label>
              <label>
                Milestone Name
                <input type="text" value={workflowState.milestoneName} onChange={(event) => updateField('milestoneName', event.target.value)} placeholder="Agent Console Action Feedback / Completion Status Strip" aria-label="Milestone Name" />
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
            <h2>All Generators</h2>
            <p>Advanced/manual access to every generator. No API, backend, OpenAI, GitHub, or automation calls are wired.</p>
            <div className="action-row agent-action-grid">
              <button className="button secondary" type="button" onClick={() => generateCard('planningHandoff', buildImplementationHandoff(workflowState), 'Implementation Handoff', 'Ready to copy/paste into Chat 2.')}>Implementation Handoff</button>
              <button className="button secondary" type="button" onClick={() => generateCard('testingResult', buildTestingHandoff(workflowState), 'Testing Handoff', 'Ready to copy/paste into Chat 3, then paste Chat 3 test result card here.')}>Testing Handoff</button>
              <button className="button secondary" type="button" onClick={() => generateCard('planningLock', buildPlanningLockCard(workflowState), 'Planning Lock Card', 'Ready to copy back to Chat 1 for milestone lock.')}>Planning Lock</button>
              <button className="button secondary" type="button" onClick={() => generateCard('documentationUpdate', buildDocumentationTrackerUpdate(workflowState), 'Documentation Tracker Update', 'Ready to copy/paste into Chat 4.')}>Tracker Update</button>
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
        </>
      )}
    </article>
  );
}
