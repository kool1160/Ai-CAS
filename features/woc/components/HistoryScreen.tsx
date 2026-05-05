import type { HistoryRecord } from '../types/wocSessionTypes';

type HistoryScreenProps = {
  historyRecords: HistoryRecord[];
  selectedHistory: HistoryRecord | null;
  onSelectHistory: (historyId: string) => void;
};

export function HistoryScreen({ historyRecords, selectedHistory, onSelectHistory }: HistoryScreenProps) {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>History</h1>
        <p>Completed correction packages for this app session.</p>
      </div>
      <div className="placeholder-list">
        {historyRecords.length === 0 ? (
          <div className="placeholder-item">
            <strong>No completed records</strong>
            <span>Complete final review, then tap Send / Confirm Send to create a session history record.</span>
          </div>
        ) : (
          historyRecords.map((record) => (
            <div className="placeholder-item" key={record.historyId}>
              <strong>{record.historyId} · {record.subjectLine}</strong>
              <span>{record.status} · WO {record.workOrderNumber} · Part {record.partNumber}</span>
              <span>{record.affectedArea} · {record.correctionType} · {record.completedTimestamp}</span>
              <div className="action-row">
                <button className="button secondary" type="button" onClick={() => onSelectHistory(record.historyId)}>Open History</button>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedHistory && (
        <article className="card">
          <div className="card-header">
            <div>
              <h2>{selectedHistory.historyId}</h2>
              <p>{selectedHistory.status} · {selectedHistory.completedTimestamp}</p>
            </div>
            <span className="field-status confirmed">Completed</span>
          </div>
          <h3>Completed Engineering Report</h3>
          <div className="preview-box">{selectedHistory.reportText}</div>
          <h3 style={{ marginTop: 14 }}>Completed Email Draft</h3>
          <div className="preview-box">{selectedHistory.emailDraftText}</div>
        </article>
      )}
    </section>
  );
}
