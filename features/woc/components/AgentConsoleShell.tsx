'use client';

import { useEffect, useState } from 'react';

const agentConsoleStorageKey = 'refab-connect-v3-agent-console-workflow';

type WorkflowCardKey = 'planningHandoff' | 'implementationResult' | 'testingResult' | 'planningLock' | 'documentationUpdate';
type WorkflowStepName = 'Planning' | 'Implementation' | 'Testing' | 'Locked' | 'Documented' | 'Returned to Planning';

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

type MilestoneOption = {
  id: string;
  name: string;
};

const milestoneOptions: MilestoneOption[] = [
  { id: 'V3-M11', name: 'Agent Console Quick Start / Milestone Autofill' },
  { id: 'V3-M12', name: 'Agent Console Workflow Condensation / Operator UX Pass' },
  { id: 'V3-M13', name: 'Agent Console Field Reduction / Essential Mode' },
  { id: 'V3-M14', name: 'Agent Console Runtime UX Polish / Stage-Based Cards' },
  { id: 'V3-M15', name: 'Agent Console Action Feedback / Completion Status Strip' },
  { id: 'V3-M16', name: 'Milestone Dropdown + PASS/FAIL Workflow Routing' },
];

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

const statusSteps: WorkflowStepName[] = ['Planning', 'Implementation', 'Testing', 'Locked', 'Documented', 'Returned to Planning'];

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

function resultLooksPass(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes('result:\npass') || normalized.includes('result: pass') || normalized.includes('pass');
}

function resultLooksFail(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes('result:\nfail') || normalized.includes('result: fail') || normalized.includes('fail');
}

function getStepRecommendation(step: string) {
  if (step === 'Implementation') return 'Paste Chat 2 task result card, then choose PASS or FAIL.';
  if (step === 'Testing') return 'Paste Chat 3 test result card, then choose PASS or FAIL.';
  if (step === 'Locked') return 'Generate the planning lock card, then copy it back to Chat 1.';
  if (step === 'Documented') return 'Generate the documentation tracker update for Chat 4.';
  if (step === 'Returned to Planning') return 'Review the failed result, correct the handoff, and run implementation again.';
  return 'Select a milestone, then run implementation.';
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
  if (step === 'Implementation') return { key: 'implementationResult', title: 'Implementation Result', helper: 'Paste Chat 2 task result card here.' };
  if (step === 'Testing') return { key: 'testingResult', title: 'Testing Handoff / Testing Result', helper: 'Generate testing handoff, then paste Chat 3 test result card here.', actionLabel: 'Generate Testing Handoff' };
  if (step === 'Locked') return { key: 'planningLock', title: 'Planning Lock Card', helper: 'Generate or paste the Planning lock card here.', actionLabel: 'Generate Planning Lock' };
  if (step === 'Documented') return { key: 'documentationUpdate', title: 'Documentation Tracker Update', helper: 'Generate or paste the Chat 4 tracker update here.', actionLabel: 'Generate Tracker Update' };
  return { key: 'planningHandoff', title: 'Implementation Handoff', helper: 'Generate the Chat 2 implementation handoff, then copy it into Chat 2.', actionLabel: 'Generate Implementation Handoff' };
}

export function AgentConsoleShell() {
  const [workflowState, setWorkflowState] = useState<AgentConsoleWorkflowState>(defaultWorkflowState);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>({ completed: 'Agent Console ready.', next: 'Select a milestone or continue the saved workflow.' });
  const [nextMilestoneId, setNextMilestoneId] = useState('');
  const [nextMilestoneName, setNextMilestoneName] = useState('');
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const activeStep = workflowState.currentStep || workflowState.status || 'Planning';
  const activeStageCard = getStageCard(activeStep);
  const implementationPassed = resultLooksPass(workflowState.implementationResult) && !resultLooksFail(workflowState.implementationResult);
  const testingPassed = resultLooksPass(workflowState.testingResult) && !resultLooksFail(workflowState.testingResult);

  const setFeedback = (completed: string, next = getStepRecommendation(activeStep)) => setActionFeedback({ completed, next });

  useEffect(() => {
    const savedState = loadWorkflowState();
    setWorkflowState(savedState);
    setActionFeedback({ completed: savedState.milestoneId ? `Restored workflow: ${savedState.milestoneId}` : 'Agent Console ready.', next: getStepRecommendation(savedState.currentStep || savedState.status || 'Planning') });
  }, []);

  const updateWorkflowState = (nextState: AgentConsoleWorkflowState, shouldPersist = false) => {
    setWorkflowState(nextState);
    if (shouldPersist) persistWorkflowState(nextState);
  };

  const updateField = (key: keyof AgentConsoleWorkflowState, value: string) => setWorkflowState((current) => ({ ...current, [key]: value }));

  const saveWorkflow = () => {
    persistWorkflowState(workflowState);
    setFeedback('Workflow saved locally.', getStepRecommendation(activeStep));
  };

  const clearWorkflow = () => {
    window.localStorage.removeItem(agentConsoleStorageKey);
    setWorkflowState(defaultWorkflowState);
    setFeedback('Workflow cleared.', 'Select a milestone from the dropdown.');
  };

  const setWorkflowStage = (step: WorkflowStepName, completed: string, next?: string) => {
    const nextState = { ...workflowState, status: step, currentStep: step };
    updateWorkflowState(nextState, true);
    setFeedback(completed, next || getStepRecommendation(step));
  };

  const selectMilestone = (milestoneId: string) => {
    const option = milestoneOptions.find((item) => item.id === milestoneId);
    if (!option) return;

    const nextState: AgentConsoleWorkflowState = {
      ...defaultWorkflowState,
      milestoneId: option.id,
      milestoneName: option.name,
      status: 'Planning',
      currentStep: 'Planning',
      commitSha: 'Pending',
      notes: `Milestone selected from Agent Console dropdown: ${option.id}.`,
    };

    setNextMilestoneId(option.id);
    setNextMilestoneName(option.name);
    updateWorkflowState(nextState, true);
    setFeedback(`Milestone selected: ${option.id}.`, 'Run implementation when ready.');
  };

  const useSuggestedMilestone = () => selectMilestone('V3-M16');

  const startNewMilestone = () => {
    const milestoneId = nextMilestoneId.trim() || 'V3-M16';
    const milestoneName = nextMilestoneName.trim() || 'Milestone Dropdown + PASS/FAIL Workflow Routing';
    const nextState: AgentConsoleWorkflowState = { ...defaultWorkflowState, milestoneId, milestoneName, status: 'Planning', currentStep: 'Planning', commitSha: 'Pending', notes: 'New milestone started from Agent Console.' };
    updateWorkflowState(nextState, true);
    setFeedback(`Milestone started: ${milestoneId}.`, 'Run implementation when ready.');
  };

  const runImplementation = () => {
    const nextState = { ...workflowState, status: 'Implementation', currentStep: 'Implementation', planningHandoff: buildImplementationHandoff(workflowState) };
    updateWorkflowState(nextState, true);
    setFeedback('Implementation handoff generated.', 'Copy the handoff into Chat 2, then paste the implementation result here.');
  };

  const handleImplementationResult = (value: string) => {
    const nextState = { ...workflowState, implementationResult: value };
    if (resultLooksFail(value)) {
      nextState.status = 'Returned to Planning';
      nextState.currentStep = 'Returned to Planning';
      updateWorkflowState(nextState, true);
      setFeedback('Implementation failed — returned to Planning.', 'Review the result, correct the handoff, then run implementation again.');
      return;
    }

    updateWorkflowState(nextState);
    if (resultLooksPass(value)) setFeedback('Implementation passed.', 'Send to Testing is now enabled.');
  };

  const sendToTesting = () => {
    const nextState = { ...workflowState, status: 'Testing', currentStep: 'Testing', testingResult: buildTestingHandoff(workflowState) };
    updateWorkflowState(nextState, true);
    setFeedback('Testing handoff generated.', 'Copy the testing handoff into Chat 3, then paste the test result here.');
  };

  const handleTestingResult = (value: string) => {
    const nextState = { ...workflowState, testingResult: value };
    if (resultLooksFail(value)) {
      nextState.status = 'Returned to Planning';
      nextState.currentStep = 'Returned to Planning';
      updateWorkflowState(nextState, true);
      setFeedback('Testing failed — returned to Planning.', 'Review the test result, correct the handoff, then run implementation again.');
      return;
    }

    updateWorkflowState(nextState);
    if (resultLooksPass(value)) setFeedback('Testing passed.', 'Complete Workflow is now enabled.');
  };

  const completeWorkflow = () => {
    const lockedState = { ...workflowState, status: 'Locked', currentStep: 'Locked', planningLock: buildPlanningLockCard(workflowState), documentationUpdate: buildDocumentationTrackerUpdate(workflowState) };
    updateWorkflowState(lockedState, true);
    setFeedback('Workflow completed and moved to Locked.', 'Copy the Planning Lock card, then send the tracker update to Chat 4.');
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
    if (key === 'planningHandoff') generateCard('planningHandoff', buildImplementationHandoff(workflowState), 'Implementation Handoff', 'Ready to copy/paste into Chat 2.');
    if (key === 'testingResult') generateCard('testingResult', buildTestingHandoff(workflowState), 'Testing Handoff', 'Ready to copy/paste into Chat 3, then paste Chat 3 test result card here.');
    if (key === 'planningLock') generateCard('planningLock', buildPlanningLockCard(workflowState), 'Planning Lock Card', 'Ready to copy back to Chat 1 for milestone lock.');
    if (key === 'documentationUpdate') generateCard('documentationUpdate', buildDocumentationTrackerUpdate(workflowState), 'Documentation Tracker Update', 'Ready to copy/paste into Chat 4.');
  };

  return (
    <article className="card agent-console-shell">
      <div className="screen-title agent-console-title">
        <span className="step-pill">V3 WORKFLOW CONTROLLER</span>
        <h1>Agent Console</h1>
        <p>State-driven cockpit for selecting V3 milestones and manually routing PASS/FAIL results.</p>
      </div>

      <section className="card agent-current-milestone" aria-live="polite">
        <div className="card-header">
          <div>
            <h2>Action Status</h2>
            <p>{actionFeedback.completed}</p>
          </div>
          <span className="field-status confirmed">{activeStep}</span>
        </div>
        <div className="placeholder-list">
          <div className="placeholder-item"><strong>Last Action</strong><span>{actionFeedback.completed}</span></div>
          <div className="placeholder-item"><strong>Next Recommended Action</strong><span>{actionFeedback.next}</span></div>
        </div>
      </section>

      <section className="card agent-quick-start">
        <div className="card-header">
          <div>
            <h2>Milestone Select</h2>
            <p>Pick a V3 milestone to auto-fill the workflow.</p>
          </div>
          <span className="field-status confirmed">Essential Mode</span>
        </div>
        <div className="form-grid agent-console-fields">
          <label>
            Milestone Dropdown
            <select value={workflowState.milestoneId} onChange={(event) => selectMilestone(event.target.value)} aria-label="Milestone Dropdown">
              <option value="">Select milestone</option>
              {milestoneOptions.map((option) => <option value={option.id} key={option.id}>{option.id} — {option.name}</option>)}
            </select>
          </label>
          <label>
            Next Milestone ID
            <input type="text" value={nextMilestoneId} onChange={(event) => setNextMilestoneId(event.target.value)} placeholder="Example: V3-M16" aria-label="Next Milestone ID" />
          </label>
          <label>
            Next Milestone Name
            <input type="text" value={nextMilestoneName} onChange={(event) => setNextMilestoneName(event.target.value)} placeholder="Milestone Dropdown + PASS/FAIL Workflow Routing" aria-label="Next Milestone Name" />
          </label>
        </div>
        <div className="action-row">
          <button className="button secondary" type="button" onClick={useSuggestedMilestone}>Use Suggested V3-M16</button>
          <button className="button success" type="button" onClick={startNewMilestone}>Start New Milestone</button>
        </div>
      </section>

      <section className="card agent-current-milestone">
        <div className="card-header">
          <div>
            <h2>{workflowState.milestoneId || 'No Milestone Started'}</h2>
            <p>{workflowState.milestoneName || 'Select a milestone to load the workflow.'}</p>
          </div>
          <span className="field-status confirmed">{activeStep}</span>
        </div>

        <section className="agent-console-status" aria-label="Agent Console workflow state strip">
          {statusSteps.map((step, index) => (
            <button className={activeStep === step ? 'agent-status-step active' : 'agent-status-step'} type="button" onClick={() => setWorkflowStage(step, `Workflow moved to ${step}.`)} key={step} title={`Move workflow to ${step}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </button>
          ))}
        </section>

        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item"><strong>Status / Step</strong><span>{workflowState.status || 'Planning'} / {workflowState.currentStep || 'Planning'}</span></div>
          <div className="placeholder-item"><strong>Commit</strong><span>{workflowState.commitSha || 'Pending'}</span></div>
          <div className="placeholder-item"><strong>Notes</strong><span>{workflowState.notes || 'No notes added yet.'}</span></div>
        </div>

        <div className="action-row">
          <button className="button success" type="button" onClick={runImplementation}>Run Implementation</button>
          <button className="button secondary" type="button" onClick={sendToTesting} disabled={!implementationPassed}>Send to Testing</button>
          <button className="button success" type="button" onClick={completeWorkflow} disabled={!testingPassed}>Complete Workflow</button>
          <button className="button secondary" type="button" onClick={() => setShowAdvancedDetails((current) => !current)}>{showAdvancedDetails ? 'Hide Advanced Details' : 'Show Advanced Details'}</button>
        </div>
        <div className="action-row">
          <button className="button success" type="button" onClick={saveWorkflow}>Save Workflow</button>
          <button className="button danger" type="button" onClick={clearWorkflow}>Clear Workflow</button>
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
          onChange={(event) => {
            if (activeStageCard.key === 'implementationResult') handleImplementationResult(event.target.value);
            else if (activeStageCard.key === 'testingResult') handleTestingResult(event.target.value);
            else updateField(activeStageCard.key, event.target.value);
          }}
          placeholder={activeStageCard.helper}
          aria-label={activeStageCard.title}
        />
        <div className="action-row">
          {activeStageCard.actionLabel && <button className="button secondary" type="button" onClick={() => generateStageCard(activeStageCard.key)}>{activeStageCard.actionLabel}</button>}
          <button className="button secondary" type="button" onClick={() => copyCard(activeStageCard.key, activeStageCard.title)}>Copy Card</button>
        </div>
      </section>

      {showAdvancedDetails && (
        <>
          <section className="card agent-details-panel">
            <div className="card-header"><div><h2>Advanced Details</h2><p>Manual corrections, commits, notes, and all card text remain available here.</p></div><span className="field-status pending">Advanced</span></div>
            <div className="form-grid agent-console-fields">
              <label>Milestone ID<input type="text" value={workflowState.milestoneId} onChange={(event) => updateField('milestoneId', event.target.value)} placeholder="Example: V3-M16" aria-label="Milestone ID" /></label>
              <label>Milestone Name<input type="text" value={workflowState.milestoneName} onChange={(event) => updateField('milestoneName', event.target.value)} placeholder="Milestone Dropdown + PASS/FAIL Workflow Routing" aria-label="Milestone Name" /></label>
              <label>Status<input type="text" value={workflowState.status} onChange={(event) => updateField('status', event.target.value)} placeholder="Planning" aria-label="Status" /></label>
              <label>Current Step<input type="text" value={workflowState.currentStep} onChange={(event) => updateField('currentStep', event.target.value)} placeholder="Planning" aria-label="Current Step" /></label>
              <label>Commit SHA<input type="text" value={workflowState.commitSha} onChange={(event) => updateField('commitSha', event.target.value)} placeholder="Pending" aria-label="Commit SHA" /></label>
              <label className="agent-console-notes">Notes<textarea value={workflowState.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Short milestone notes, blockers, or next action." aria-label="Notes" /></label>
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
                <div className="card-header"><div><h3>{card.title}</h3><p>{card.placeholder}</p></div></div>
                <textarea
                  value={workflowState[card.key]}
                  onChange={(event) => {
                    if (card.key === 'implementationResult') handleImplementationResult(event.target.value);
                    else if (card.key === 'testingResult') handleTestingResult(event.target.value);
                    else updateField(card.key, event.target.value);
                  }}
                  placeholder={card.placeholder}
                  aria-label={card.title}
                />
                <button className="button secondary full-width" type="button" onClick={() => copyCard(card.key, card.title)}>Copy Card</button>
              </article>
            ))}
          </section>
        </>
      )}
    </article>
  );
}
