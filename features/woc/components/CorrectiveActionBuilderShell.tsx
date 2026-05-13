'use client';

import { useState } from 'react';

type CorrectiveActionData = {
  workOrder: string;
  partNumber: string;
  revision: string;
  customer: string;
  quantity: string;
  partDescription: string;
  material: string;
  affectedOperation: string;
  nextOperation: string;
  inspectionOperation: string;
  keyFeature: string;
  gaugeCheckMethod: string;
  acceptanceStandard: string;
  issueSummary: string;
};

const defaultCorrectiveActionData: CorrectiveActionData = {
  workOrder: '008604',
  partNumber: '1124191',
  revision: 'C',
  customer: 'JOST INTERNATIONAL',
  quantity: '500 EA',
  partDescription: 'Brace Ear Weldment',
  material: '3/8 in. HSLA GR50',
  affectedOperation: 'CT10 - 4K Mazak Laser',
  nextOperation: 'RW10 - Cobot Welder',
  inspectionOperation: 'QC10 - Inspection',
  keyFeature: 'Ø .672 hole / square check',
  gaugeCheckMethod: 'Approved no-go pin/gauge',
  acceptanceStandard: 'No-go pin must not enter',
  issueSummary: '',
};

export function CorrectiveActionBuilderShell() {
  const [correctiveActionData, setCorrectiveActionData] = useState<CorrectiveActionData>(defaultCorrectiveActionData);

  const updateField = (key: keyof CorrectiveActionData, value: string) => {
    setCorrectiveActionData((current) => ({ ...current, [key]: value }));
  };

  return (
    <article className="card corrective-action-builder-shell">
      <div className="card-header">
        <div>
          <span className="step-pill">V3 DATA MODEL</span>
          <h2>Corrective Action Builder</h2>
          <p>Create controlled shop-floor corrective action sheets from work order, print, part, gauge, and staging evidence.</p>
        </div>
        <span className="field-status confirmed">Fields</span>
      </div>

      <p className="field-help">
        Frontend data-entry only. PDF generation, backend storage, AI extraction, GitHub automation, and runtime agent execution are not enabled in V3-M20.
      </p>

      <section className="agent-workflow-grid" aria-label="Corrective Action Builder data fields" style={{ marginTop: 16 }}>
        <article className="card agent-workflow-card">
          <div className="card-header">
            <div>
              <span className="step-pill">01</span>
              <h3>Job / Part Information</h3>
              <p>Editable work order, part, customer, quantity, description, and material fields.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Work Order
              <input type="text" value={correctiveActionData.workOrder} onChange={(event) => updateField('workOrder', event.target.value)} placeholder="008604" />
            </label>
            <label>
              Part Number
              <input type="text" value={correctiveActionData.partNumber} onChange={(event) => updateField('partNumber', event.target.value)} placeholder="1124191" />
            </label>
            <label>
              Revision
              <input type="text" value={correctiveActionData.revision} onChange={(event) => updateField('revision', event.target.value)} placeholder="C" />
            </label>
            <label>
              Customer
              <input type="text" value={correctiveActionData.customer} onChange={(event) => updateField('customer', event.target.value)} placeholder="JOST INTERNATIONAL" />
            </label>
            <label>
              Quantity
              <input type="text" value={correctiveActionData.quantity} onChange={(event) => updateField('quantity', event.target.value)} placeholder="500 EA" />
            </label>
            <label>
              Part Description
              <input type="text" value={correctiveActionData.partDescription} onChange={(event) => updateField('partDescription', event.target.value)} placeholder="Brace Ear Weldment" />
            </label>
            <label>
              Material
              <input type="text" value={correctiveActionData.material} onChange={(event) => updateField('material', event.target.value)} placeholder="3/8 in. HSLA GR50" />
            </label>
          </div>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header">
            <div>
              <span className="step-pill">02</span>
              <h3>Routing / Operations</h3>
              <p>Editable routing context for the operation where the condition starts and where it affects downstream work.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Affected Operation
              <input type="text" value={correctiveActionData.affectedOperation} onChange={(event) => updateField('affectedOperation', event.target.value)} placeholder="CT10 - 4K Mazak Laser" />
            </label>
            <label>
              Next Operation
              <input type="text" value={correctiveActionData.nextOperation} onChange={(event) => updateField('nextOperation', event.target.value)} placeholder="RW10 - Cobot Welder" />
            </label>
            <label>
              Inspection Operation
              <input type="text" value={correctiveActionData.inspectionOperation} onChange={(event) => updateField('inspectionOperation', event.target.value)} placeholder="QC10 - Inspection" />
            </label>
          </div>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header">
            <div>
              <span className="step-pill">03</span>
              <h3>Key Feature / Inspection</h3>
              <p>Editable critical feature, gauge method, and acceptance standard for the corrective action sheet.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Key Feature
              <input type="text" value={correctiveActionData.keyFeature} onChange={(event) => updateField('keyFeature', event.target.value)} placeholder="Ø .672 hole / square check" />
            </label>
            <label>
              Gauge / Check Method
              <input type="text" value={correctiveActionData.gaugeCheckMethod} onChange={(event) => updateField('gaugeCheckMethod', event.target.value)} placeholder="Approved no-go pin/gauge" />
            </label>
            <label>
              Acceptance Standard
              <input type="text" value={correctiveActionData.acceptanceStandard} onChange={(event) => updateField('acceptanceStandard', event.target.value)} placeholder="No-go pin must not enter" />
            </label>
          </div>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header">
            <div>
              <span className="step-pill">04</span>
              <h3>Issue Summary</h3>
              <p>Editable description of the observed problem and why the corrective action is needed.</p>
            </div>
          </div>
          <label>
            Issue Summary
            <textarea
              value={correctiveActionData.issueSummary}
              onChange={(event) => updateField('issueSummary', event.target.value)}
              placeholder="Describe the hole-size issue, cleaning/staging problem, routing impact, or welding readiness concern."
            />
          </label>
        </article>

        <article className="card agent-workflow-card">
          <div className="card-header">
            <div>
              <span className="step-pill">05</span>
              <h3>Future Sections</h3>
              <p>Corrective action requirements, photo evidence slots, operator checklist, and release approval remain planned for future milestones.</p>
            </div>
          </div>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <strong>Next Build Areas</strong>
              <span>Requirements, pass/fail sections, evidence slots, operator checklist, PDF layout, preview, and local history.</span>
            </div>
          </div>
        </article>
      </section>
    </article>
  );
}
