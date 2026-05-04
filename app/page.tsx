'use client';

import { useMemo, useState } from 'react';

type Screen = 'home' | 'capture' | 'confirm' | 'generate' | 'review' | 'drafts' | 'history' | 'more';

type NavItem = {
  label: string;
  screen: Screen;
};

type ExtractedField = {
  label: string;
  value: string;
  confirmed: boolean;
};

const bottomNav: NavItem[] = [
  { label: 'Home', screen: 'home' },
  { label: 'Capture', screen: 'capture' },
  { label: 'Drafts', screen: 'drafts' },
  { label: 'History', screen: 'history' },
  { label: 'More', screen: 'more' },
];

const workflow = [
  ['01', 'Capture Router', 'Take a photo, upload a file, or use manual entry.'],
  ['02', 'Extract + Confirm', 'Review work order data before it moves forward.'],
  ['03', 'Build Correction', 'Select the correction type and describe the issue.'],
  ['04', 'Generate Draft', 'Create the Engineering report and email draft.'],
  ['05', 'Confirm + Send', 'Review everything before copy/send controls unlock.'],
];

const initialFields: ExtractedField[] = [
  { label: 'Work Order', value: '042631-001', confirmed: false },
  { label: 'Part Number', value: 'CYM-1750-LH-BU', confirmed: false },
  { label: 'Revision', value: 'B', confirmed: false },
  { label: 'Customer', value: 'ENWORK', confirmed: false },
  { label: 'Quantity', value: '35 EA', confirmed: false },
];

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [fields, setFields] = useState<ExtractedField[]>(initialFields);
  const [manualEntry, setManualEntry] = useState('');
  const [correctionType, setCorrectionType] = useState('Incorrect Time / Rate');
  const [processAffected, setProcessAffected] = useState('Welding');
  const [issueDetails, setIssueDetails] = useState('Router time does not match the sustainable shop-floor baseline.');
  const [requestedAction, setRequestedAction] = useState('Review and update the router time/rate to the correct Engineering-approved baseline.');
  const [draftGenerated, setDraftGenerated] = useState(false);
  const [finalReviewConfirmed, setFinalReviewConfirmed] = useState(false);

  const workOrderConfirmed = fields.find((field) => field.label === 'Work Order')?.confirmed ?? false;
  const partNumberConfirmed = fields.find((field) => field.label === 'Part Number')?.confirmed ?? false;
  const allFieldsConfirmed = fields.every((field) => field.confirmed);
  const correctionReady = Boolean(correctionType.trim() && issueDetails.trim() && requestedAction.trim());
  const readyToSend = Boolean(workOrderConfirmed && partNumberConfirmed && correctionReady && draftGenerated && finalReviewConfirmed);

  const currentStepLabel = useMemo(() => {
    const labels: Record<Screen, string> = {
      home: 'System Active',
      capture: 'Capture Work Order Data',
      confirm: 'Confirm Extracted Information',
      generate: 'Generate Correction Package',
      review: 'Review and Send',
      drafts: 'Drafts',
      history: 'History',
      more: 'More',
    };

    return labels[activeScreen];
  }, [activeScreen]);

  const reportPreview = useMemo(() => `ENGINEERING REPORT PREVIEW

Work Order: 042631-001
Part Number: CYM-1750-LH-BU
Correction Type: ${correctionType}
Process: ${processAffected}

Issue: ${issueDetails}

Requested Action: ${requestedAction}`, [correctionType, issueDetails, processAffected, requestedAction]);

  const emailPreview = `To: Engineering
Subject: Work Order Correction Request

Please review the attached correction package for the affected work order/router data.`;

  const confirmField = (label: string) => {
    setFields((current) => current.map((field) => (
      field.label === label ? { ...field, confirmed: true } : field
    )));
  };

  const confirmAllFields = () => {
    setFields((current) => current.map((field) => ({ ...field, confirmed: true })));
  };

  const startCapture = () => {
    setActiveScreen('capture');
  };

  const goToConfirm = () => {
    setActiveScreen('confirm');
  };

  const goToGenerate = () => {
    setActiveScreen('generate');
  };

  const generateDraft = () => {
    setDraftGenerated(true);
    setFinalReviewConfirmed(false);
    setActiveScreen('review');
  };

  return (
    <main className="app-shell">
      <div className="app-frame">
        <div className="screen-title">
          <span className="step-pill">REFAB CONNECT · {currentStepLabel}</span>
        </div>

        {activeScreen === 'home' && (
          <section className="stack">
            <div className="hero">
              <span className="status-pill"><span className="status-dot" />SYSTEM ACTIVE</span>
              <div className="brand-mark">
                <span className="brand-kicker">REFAB CONNECT</span>
                <h1 className="brand-title">Correction System Active</h1>
                <p className="brand-subtitle">Work Order Correction System</p>
                <p className="brand-subtitle">Powered by Applied Intelligence Framework</p>
              </div>
              <p className="helper-text">Clear. Guided. Fast.</p>
              <button className="button primary full-width" type="button" onClick={startCapture}>Start Capture</button>
            </div>

            <div className="card-grid">
              {workflow.map(([number, title, description]) => (
                <article className="card workflow-card" key={title}>
                  <span className="step-number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeScreen === 'capture' && (
          <section className="stack">
            <div className="screen-title">
              <h1>Capture Router</h1>
              <p>Capture the work order/header data. OCR and AI Vision are intentionally not wired in this milestone.</p>
            </div>

            <article className="card">
              <div className="card-header">
                <div>
                  <h2>Photo / Upload</h2>
                  <p>Placeholder capture controls for the clean screen flow.</p>
                </div>
                <span className="step-pill">Step 1</span>
              </div>
              <div className="action-row">
                <button className="button secondary" type="button">Take Photo</button>
                <button className="button secondary" type="button">Upload File</button>
              </div>
            </article>

            <article className="card">
              <h2>Manual Entry Fallback</h2>
              <p>Manual fallback remains visible so the shop-floor user is never blocked by extraction failure.</p>
              <div className="form-grid" style={{ marginTop: 14 }}>
                <label>
                  Router/Header Notes
                  <textarea
                    value={manualEntry}
                    onChange={(event) => setManualEntry(event.target.value)}
                    placeholder="Paste or type work order/router information here."
                  />
                </label>
              </div>
              <div className="action-row">
                <button className="button primary full-width" type="button" onClick={goToConfirm}>Capture Router</button>
              </div>
            </article>
          </section>
        )}

        {activeScreen === 'confirm' && (
          <section className="stack">
            <div className="screen-title">
              <h1>Extract + Confirm</h1>
              <p>Mock extracted fields are shown for Milestone 1. Required fields must be confirmed before proceeding.</p>
            </div>

            <article className="card">
              <div className="field-list">
                {fields.map((field) => (
                  <div className="field-row" key={field.label}>
                    <strong>
                      {field.label}
                      <span className={field.confirmed ? 'field-status confirmed' : 'field-status'}>
                        {field.confirmed ? 'Confirmed' : 'Review'}
                      </span>
                    </strong>
                    <span className="field-value">{field.value}</span>
                    <button className="button secondary" type="button" onClick={() => confirmField(field.label)} disabled={field.confirmed}>
                      Confirm {field.label}
                    </button>
                  </div>
                ))}
              </div>
              <div className="action-row">
                <button className="button success" type="button" onClick={confirmAllFields}>Confirm All Fields</button>
                <button className="button primary" type="button" onClick={goToGenerate} disabled={!workOrderConfirmed || !partNumberConfirmed}>
                  Continue to Build Correction
                </button>
              </div>
              {!allFieldsConfirmed && (
                <p className="field-help">Work Order and Part Number are required to continue. Remaining fields stay visible for review.</p>
              )}
            </article>
          </section>
        )}

        {activeScreen === 'generate' && (
          <section className="stack">
            <div className="screen-title">
              <h1>Build Correction</h1>
              <p>Select the correction type, define the affected process, and enter the correction request.</p>
            </div>

            <article className="card">
              <div className="form-grid">
                <label>
                  Correction Type
                  <select value={correctionType} onChange={(event) => setCorrectionType(event.target.value)}>
                    <option>Incorrect Time / Rate</option>
                    <option>Missing Grind / Finish Operation</option>
                    <option>Missing Weld Operation</option>
                    <option>Missing Fixture / Work Instruction</option>
                    <option>Wrong / Missing Router Step</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Process Affected
                  <select value={processAffected} onChange={(event) => setProcessAffected(event.target.value)}>
                    <option>Welding</option>
                    <option>Cobot Welding</option>
                    <option>Grinding / Finish</option>
                    <option>Laser / Forming</option>
                    <option>Inspection / Quality</option>
                    <option>Fixture / Setup</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Issue Details
                  <textarea value={issueDetails} onChange={(event) => setIssueDetails(event.target.value)} />
                </label>
                <label>
                  Requested Correction / Action
                  <textarea value={requestedAction} onChange={(event) => setRequestedAction(event.target.value)} />
                </label>
              </div>
              <div className="action-row">
                <button className="button danger full-width" type="button" onClick={generateDraft} disabled={!correctionReady}>
                  Generate Draft
                </button>
              </div>
            </article>
          </section>
        )}

        {activeScreen === 'review' && (
          <section className="stack">
            <div className="screen-title">
              <h1>Review / Send</h1>
              <p>Report and email preview placeholders. Copy/send controls are placeholders until send logic is wired.</p>
            </div>

            <article className="card">
              <div className="card-header">
                <div>
                  <h2>{draftGenerated ? 'Draft Ready' : 'Draft Not Generated'}</h2>
                  <p>Final review gate controls whether the placeholder send button is enabled.</p>
                </div>
                <span className={readyToSend ? 'field-status confirmed' : 'field-status'}>{readyToSend ? 'Ready to Send' : 'Review'}</span>
              </div>
              <div className="preview-box">{reportPreview}</div>
            </article>

            <article className="card">
              <h2>Email Draft Preview</h2>
              <div className="preview-box">{emailPreview}</div>
              <div className="action-row">
                <button className="button secondary" type="button">Copy Report</button>
                <button className="button secondary" type="button">Copy Email Draft</button>
                <button className="button secondary" type="button">Save Draft</button>
              </div>
              <label style={{ marginTop: 14 }}>
                <input
                  checked={finalReviewConfirmed}
                  onChange={(event) => setFinalReviewConfirmed(event.target.checked)}
                  type="checkbox"
                />
                Final review confirmed
              </label>
              <div className="action-row">
                <button className="button danger full-width" type="button" disabled={!readyToSend}>Send / Confirm Send</button>
              </div>
            </article>
          </section>
        )}

        {activeScreen === 'drafts' && (
          <section className="stack">
            <div className="screen-title">
              <h1>Drafts</h1>
              <p>Placeholder list for generated correction packages.</p>
            </div>
            <div className="placeholder-list">
              <div className="placeholder-item">
                <strong>Draft WOC-0001</strong>
                <span>Incorrect Time / Rate · Awaiting final review</span>
              </div>
              <div className="placeholder-item">
                <strong>No live draft storage yet</strong>
                <span>Draft behavior will be wired after core structure is stable.</span>
              </div>
            </div>
          </section>
        )}

        {activeScreen === 'history' && (
          <section className="stack">
            <div className="screen-title">
              <h1>History</h1>
              <p>Placeholder list for submitted or copied correction history.</p>
            </div>
            <div className="placeholder-list">
              <div className="placeholder-item">
                <strong>History placeholder</strong>
                <span>Submitted records will appear here when history behavior is wired.</span>
              </div>
            </div>
          </section>
        )}

        {activeScreen === 'more' && (
          <section className="stack">
            <div className="screen-title">
              <h1>More</h1>
              <p>Settings, help, and system information placeholders.</p>
            </div>
            <article className="card">
              <h2>Settings / Help</h2>
              <p>Future settings can live here without disrupting the main correction workflow.</p>
              <div className="placeholder-list" style={{ marginTop: 14 }}>
                <div className="placeholder-item">
                  <strong>System Purpose</strong>
                  <span>Fix bad router data before it becomes waste.</span>
                </div>
                <div className="placeholder-item">
                  <strong>Build Status</strong>
                  <span>Milestone 1: clean screen flow only.</span>
                </div>
              </div>
            </article>
          </section>
        )}
      </div>

      <nav className="nav-dock" aria-label="Primary navigation">
        {bottomNav.map((item) => (
          <button
            className={activeScreen === item.screen ? 'nav-button active' : 'nav-button'}
            key={item.label}
            type="button"
            onClick={() => setActiveScreen(item.screen)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
