import type { LocalEngineeringAnalyticsSummary } from '../persistence/correctionRecordAnalytics';

type EngineeringAnalyticsPreviewProps = {
  summary: LocalEngineeringAnalyticsSummary;
};

function CountList({ emptyText, items }: { emptyText: string; items: { label: string; count: number }[] }) {
  if (items.length === 0) {
    return <span>{emptyText}</span>;
  }

  return (
    <div className="placeholder-list">
      {items.slice(0, 5).map((item) => (
        <div className="placeholder-item" key={item.label}>
          <strong>{item.label}</strong>
          <span>{item.count} local record{item.count === 1 ? '' : 's'}</span>
        </div>
      ))}
    </div>
  );
}

export function EngineeringAnalyticsPreview({ summary }: EngineeringAnalyticsPreviewProps) {
  return (
    <article className="card">
      <div className="card-header">
        <div>
          <h2>Engineering Analytics Preview</h2>
          <p>Local Records Only · Backend Sync Not Active Yet · Analytics Preview</p>
        </div>
        <span className="field-status">M19</span>
      </div>

      {summary.totalRecords === 0 ? (
        <div className="placeholder-item">
          <strong>No local records yet</strong>
          <span>Saved Drafts and Sent History will appear here once correction records exist on this device.</span>
        </div>
      ) : (
        <div className="stack">
          <div className="placeholder-list">
            <div className="placeholder-item">
              <strong>Total Local Records</strong>
              <span>{summary.totalRecords}</span>
            </div>
            <div className="placeholder-item">
              <strong>Draft Records</strong>
              <span>{summary.draftCount}</span>
            </div>
            <div className="placeholder-item">
              <strong>Sent / History Records</strong>
              <span>{summary.historyCount}</span>
            </div>
            <div className="placeholder-item">
              <strong>Photo Evidence Attached</strong>
              <span>{summary.evidenceAttachedCount} local record{summary.evidenceAttachedCount === 1 ? '' : 's'}</span>
            </div>
            <div className="placeholder-item">
              <strong>No Photo Evidence</strong>
              <span>{summary.evidenceMissingCount} local record{summary.evidenceMissingCount === 1 ? '' : 's'}</span>
            </div>
          </div>

          <section>
            <h3>Records by Correction Type</h3>
            <CountList emptyText="No correction type patterns yet." items={summary.byCorrectionType} />
          </section>

          <section>
            <h3>Records by Affected Area</h3>
            <CountList emptyText="No affected area patterns yet." items={summary.byAffectedArea} />
          </section>

          <section>
            <h3>Repeated Part Numbers</h3>
            <CountList emptyText="No repeated part numbers yet." items={summary.repeatedPartNumbers} />
          </section>

          <section>
            <h3>Repeated Work Orders</h3>
            <CountList emptyText="No repeated work orders yet." items={summary.repeatedWorkOrderNumbers} />
          </section>

          <section>
            <h3>Submitted By Summary</h3>
            <CountList emptyText="No submitted-by summary yet." items={summary.submittedBySummary} />
          </section>

          <section>
            <h3>Recent Records</h3>
            <div className="placeholder-list">
              {summary.recentRecords.map((record) => (
                <div className="placeholder-item" key={record.recordId}>
                  <strong>{record.recordId} · {record.recordType}</strong>
                  <span>{record.status} · WO {record.workOrderNumber} · Part {record.partNumber}</span>
                  <span>{record.affectedArea} · {record.correctionType}</span>
                  <span>Photo Evidence: {record.evidence.evidenceAttached ? 'Attached' : 'Not attached'}</span>
                  <span>Submitted By: {record.submittedBy.displayName || record.submittedBy.emailOrEmployeeId || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <p className="field-help">This preview is read-only and uses local browser records only. No database or cloud analytics are active yet.</p>
    </article>
  );
}
