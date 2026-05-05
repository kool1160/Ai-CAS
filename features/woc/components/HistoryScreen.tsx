import { printCorrectionReport } from '../logic/printCorrectionReport';
import type { HistoryRecord } from '../types/wocSessionTypes';

type HistoryScreenProps = {
  historyRecords: HistoryRecord[];
  selectedHistory: HistoryRecord | null;
  onSelectHistory: (historyId: string) => void;
};

export function HistoryScreen({ historyRecords, selectedHistory, onSelectHistory }: HistoryScreenProps) {
  const handlePrintHistoryReport = () => {
    if (!selectedHistory) return;

    printCorrectionReport({
      subjectLine: selectedHistory.subjectLine,
      workOrderNumber: selectedHistory.workOrderNumber,
      partNumber: selectedHistory.partNumber,
      affectedArea: selectedHistory.affectedArea,
      correctionType: selectedHistory.correctionType,
      submittedBy: selectedHistory.submittedBy,
      status: selectedHistory.status,
      generatedTimestamp: selectedHistory.completedTimestamp,
      reportText: selectedHistory.reportText,
    });
  };

  return (
    <section className="stack">
      <div className="screen-title">
        <h1>History</h1>
        <p>Completed correction packages saved on this browser.</p>
      </div>
      <div className="placeholder-list">
        {historyRecords.length === 0 ? (
          <div className="placeholder-item">
            <strong>No completed records</strong>
            <span>Sent correction packages will appear here after final review and send.</span>
          </div>
        ) : (
          historyRecords.map((record) => (
            <div className="placeholder-item" key={record.historyId}>
              <strong>{record.historyId} · {record.subjectLine}</strong>
              <span>{record.status} · WO {record.workOrderNumber} · Part {record.partNumber}</span>
              <span>{record.affectedArea} · {record.correctionType} · {record.completedTimestamp}</span>
              {record.submittedBy && <span>Submitted By: {record.submittedBy}</span>}
              {record.resendId && <span>Resend ID: {record.resendId}</span>}
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
            <span className="field-status confirmed">Recorded</span>
          </div>
          {selectedHistory.submittedBy && <p className="field-help">Submitted By: {selectedHistory.submittedBy}</p>}
          <h3>Saved Engineering Report</h3>
          <div className="preview-box">{selectedHistory.reportText}</div>
          <h3 style={{ marginTop: 14 }}>Saved Email Draft</h3>
          <div className="preview-box">{selectedHistory.emailDraftText}</div>
          <div className="action-row">
            <button className="button secondary" type="button" onClick={handlePrintHistoryReport}>Export / Print Report</button>
          </div>
        </article>
      )}
    </section>
  );
}
