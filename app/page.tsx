'use client';

import { useMemo, useState } from 'react';
import {
  affectedProcessOptions,
  confirmDataFields,
  correctionTypeOptions,
  createGeneratedPackage,
  defaultWocConfirmations,
  defaultWocCorrectionData,
  getGateStatus,
  resetDependentConfirmations,
  type GeneratedCorrectionPackage,
  type WocConfirmationState,
  type WocCorrectionData,
} from '../features/woc/state/wocDataModel';

type Screen = 'home' | 'capture' | 'confirm' | 'generate' | 'review' | 'drafts' | 'history' | 'more';

type NavItem = {
  label: string;
  screen: Screen;
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

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [wocData, setWocData] = useState<WocCorrectionData>(defaultWocCorrectionData);
  const [confirmations, setConfirmations] = useState<WocConfirmationState>(defaultWocConfirmations);
  const [manualEntry, setManualEntry] = useState('');
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedCorrectionPackage>(null);

  const gateStatus = useMemo(
    () => getGateStatus(wocData, confirmations, generatedPackage),
    [confirmations, generatedPackage, wocData],
  );

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

  const updateWocData = (key: keyof WocCorrectionData, value: string) => {
    setWocData((current) => ({ ...current, [key]: value }));
    setConfirmations((current) => resetDependentConfirmations(current, key, value));
    setGeneratedPackage(null);
  };

  const confirmWorkOrderData = () => {
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: Boolean(wocData.workOrderNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const confirmPartNumber = () => {
    setConfirmations((current) => ({
      ...current,
      partNumberConfirmed: Boolean(wocData.partNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const confirmAllRequiredData = () => {
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: Boolean(wocData.workOrderNumber.trim()),
      partNumberConfirmed: Boolean(wocData.partNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const startCapture = () => {
    setActiveScreen('capture');
  };

  const goToConfirm = () => {
    setActiveScreen('confirm');
  };

  const goToGenerate = () => {
    if (!gateStatus.confirmReady) return;
    setActiveScreen('generate');
  };

  const generateDraft = () => {
    if (!gateStatus.generateReady) return;
    setGeneratedPackage(createGeneratedPackage(wocData));
    setConfirmations((current) => ({ ...current, finalReviewConfirmed: false }));
    setActiveScreen('review');
  };

  const setFinalReviewConfirmed = (confirmed: boolean) => {
    setConfirmations((current) => ({ ...current, finalReviewConfirmed: confirmed }));
  };

  const getFieldConfirmed = (key: keyof WocCorrectionData) => {
    if (key === 'workOrderNumber') return confirmations.workOrderDataConfirmed;
    if (key === 'partNumber') return confirmations.partNumberConfirmed;
    return Boolean(wocData[key].trim());
  };

  const confirmField = (key: keyof WocCorrectionData) => {
    if (key === 'workOrderNumber') confirmWorkOrderData();
    if (key === 'partNumber') confirmPartNumber();
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
              <p>Review and edit WOC data before it can move into the correction package.</p>
            </div>

            <article className="card">
              <div className="field-list">
                {confirmDataFields.map((field) => {
                  const confirmed = getFieldConfirmed(field.key);
                  return (
                    <div className="field-row" key={field.key}>
                      <strong>
                        {field.label}{field.required ? ' *' : ''}
                        <span className={confirmed ? 'field-status confirmed' : 'field-status'}>
                          {confirmed ? 'Confirmed' : 'Review'}
                        </span>
                      </strong>
                      <input
                        type="text"
                        value={wocData[field.key]}
                        onChange={(event) => updateWocData(field.key, event.target.value)}
                        placeholder={field.required ? `${field.label} required` : `${field.label} optional`}
                      />
                      {field.confirmable && (
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => confirmField(field.key)}
                          disabled={!wocData[field.key].trim() || confirmed}
                        >
                          Confirm {field.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="action-row">
                <button className="button success" type="button" onClick={confirmAllRequiredData}>Confirm Required Fields</button>
                <button className="button primary" type="button" onClick={goToGenerate} disabled={!gateStatus.confirmReady}>
                  Continue to Build Correction
                </button>
              </div>
              {!gateStatus.confirmReady && (
                <p className="field-help">Work Order and Part Number must be filled in and confirmed before Generate unlocks.</p>
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
                  <select value={wocData.correctionType} onChange={(event) => updateWocData('correctionType', event.target.value)}>
                    {correctionTypeOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Process / Department Affected
                  <select value={wocData.affectedProcess} onChange={(event) => updateWocData('affectedProcess', event.target.value)}>
                    {affectedProcessOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Issue Details
                  <textarea value={wocData.issueDetails} onChange={(event) => updateWocData('issueDetails', event.target.value)} />
                </label>
                <label>
                  Requested Engineering Action
                  <textarea value={wocData.requestedEngineeringAction} onChange={(event) => updateWocData('requestedEngineeringAction', event.target.value)} />
                </label>
              </div>
              <div className="action-row">
                <button className="button danger full-width" type="button" onClick={generateDraft} disabled={!gateStatus.generateReady}>
                  Generate Draft
                </button>
              </div>
              {!gateStatus.generateReady && (
                <p className="field-help">Generate requires confirmed Work Order, confirmed Part Number, correction type, issue details, and requested Engineering action.</p>
              )}
            </article>
          </section>
        )}

        {activeScreen === 'review' && (
          <section className="stack">
            <div className="screen-title">
              <h1>Review / Send</h1>
              <p>Generated report and email preview placeholders. Copy/send controls remain placeholders until send logic is wired.</p>
            </div>

            <article className="card">
              <div className="card-header">
                <div>
                  <h2>{generatedPackage ? 'Draft Ready' : 'Draft Not Generated'}</h2>
                  <p>Final review gate controls whether the placeholder send button is enabled.</p>
                </div>
                <span className={gateStatus.sendReady ? 'field-status confirmed' : 'field-status'}>{gateStatus.sendReady ? 'Ready to Send' : 'Review'}</span>
              </div>
              <div className="preview-box">{generatedPackage?.reportPreview ?? 'Generate a correction package before final review.'}</div>
            </article>

            <article className="card">
              <h2>Email Draft Preview</h2>
              <div className="preview-box">{generatedPackage?.emailPreview ?? 'Generate a correction package before final review.'}</div>
              <div className="action-row">
                <button className="button secondary" type="button" disabled={!generatedPackage}>Copy Report</button>
                <button className="button secondary" type="button" disabled={!generatedPackage}>Copy Email Draft</button>
                <button className="button secondary" type="button" disabled={!generatedPackage}>Save Draft</button>
              </div>
              <label style={{ marginTop: 14 }}>
                <input
                  checked={confirmations.finalReviewConfirmed}
                  disabled={!generatedPackage}
                  onChange={(event) => setFinalReviewConfirmed(event.target.checked)}
                  type="checkbox"
                />
                Final review confirmed
              </label>
              <div className="action-row">
                <button className="button danger full-width" type="button" disabled={!gateStatus.sendReady}>Send / Confirm Send</button>
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
              {generatedPackage ? (
                <div className="placeholder-item">
                  <strong>Current Generated Draft</strong>
                  <span>{wocData.correctionType} · Generated {generatedPackage.generatedAt}</span>
                </div>
              ) : (
                <div className="placeholder-item">
                  <strong>No active generated draft</strong>
                  <span>Draft behavior will be wired after core gates are stable.</span>
                </div>
              )}
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
                  <span>Milestone 2: WOC data model and required gate logic.</span>
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
