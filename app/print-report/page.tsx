'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PRINT_REPORT_STORAGE_KEY,
  type PrintCorrectionReportInput,
} from '../../features/woc/logic/printCorrectionReport';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getReportValue(reportText: string, label: string) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'im');
  const match = reportText.match(pattern);
  return match?.[1]?.trim() ?? '';
}

function resolveField(explicitValue: string | undefined, reportText: string, label: string) {
  return explicitValue?.trim() || getReportValue(reportText, label);
}

function isPrintPayload(value: unknown): value is PrintCorrectionReportInput {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'reportText' in value &&
    typeof (value as { reportText?: unknown }).reportText === 'string' &&
    (value as { reportText: string }).reportText.trim(),
  );
}

export default function PrintReportPage() {
  const [report, setReport] = useState<PrintCorrectionReportInput | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PRINT_REPORT_STORAGE_KEY);
      if (!raw) {
        setLoadError('No report data was found. Return to Refab Connect and choose Export / Print Report again.');
        return;
      }

      const parsed = JSON.parse(raw);
      if (!isPrintPayload(parsed)) {
        setLoadError('Saved print report data is invalid. Return to Refab Connect and export the report again.');
        return;
      }

      setReport(parsed);
    } catch {
      setLoadError('Unable to load the print report. Return to Refab Connect and export the report again.');
    }
  }, []);

  const fields = useMemo(() => {
    if (!report) return [];

    return [
      ['Work Order Number', resolveField(report.workOrderNumber, report.reportText, 'Work Order Number')],
      ['Part Number', resolveField(report.partNumber, report.reportText, 'Part Number')],
      ['Revision', resolveField(report.revision, report.reportText, 'Revision')],
      ['Customer / Job', resolveField(report.customerOrJob, report.reportText, 'Customer / Job')],
      ['Quantity', resolveField(report.quantity, report.reportText, 'Quantity')],
      ['Affected Area', resolveField(report.affectedArea, report.reportText, 'Affected Area')],
      ['Correction Type', resolveField(report.correctionType, report.reportText, 'Correction Type')],
      ['Submitted By / Source', resolveField(report.submittedBy, report.reportText, 'Submitted By / Source')],
      ['Status', resolveField(report.status, report.reportText, 'Status')],
      ['Generated', report.generatedTimestamp || new Date().toLocaleString()],
    ].filter(([, value]) => value?.trim());
  }, [report]);

  const issueSummary = report ? getReportValue(report.reportText, 'Issue Summary') : '';
  const requestedAction = report ? getReportValue(report.reportText, 'Requested Engineering Action') : '';

  return (
    <main className="print-report-page">
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: Arial, Helvetica, sans-serif;
        }

        .print-report-page {
          min-height: 0;
          background: #ffffff;
          color: #000000;
          padding: 12px;
        }

        .print-controls {
          display: flex;
          gap: 8px;
          max-width: 8.5in;
          margin: 0 auto 10px;
        }

        .print-controls button {
          min-height: 40px;
          border: 1px solid #111827;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          padding: 0 14px;
          font: 700 13px Arial, Helvetica, sans-serif;
        }

        .print-controls button.primary {
          background: #111827;
          color: #ffffff;
        }

        .report-page {
          width: min(100%, 8.5in);
          margin: 0 auto;
          background: #ffffff;
          color: #111827;
          font-size: 11px;
          line-height: 1.24;
        }

        .brand-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #111827;
          background: #ffffff;
          color: #000000;
          padding: 5px 8px;
          margin-bottom: 6px;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .header {
          border: 1px solid #111827;
          border-left: 6px solid #111827;
          padding: 7px 10px;
          margin-bottom: 7px;
          background: #ffffff;
        }

        .kicker {
          color: #374151;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        h1 {
          margin: 2px 0;
          color: #111827;
          font-size: 18px;
          line-height: 1.02;
        }

        .subtitle {
          margin: 0;
          color: #4b5563;
          font-size: 9.5px;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 7px;
          background: #ffffff;
        }

        th,
        td {
          border: 1px solid #d1d5db;
          padding: 4px 6px;
          vertical-align: top;
          text-align: left;
        }

        th {
          width: 32%;
          background: #f3f4f6;
          color: #111827;
          font-size: 8.5px;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        td {
          background: #ffffff;
          color: #111827;
          font-weight: 600;
        }

        .callout {
          border: 1px solid #111827;
          border-left: 5px solid #111827;
          padding: 6px 8px;
          margin: 0 0 6px;
          background: #ffffff;
        }

        .callout h2 {
          margin: 0 0 3px;
          color: #111827;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        .callout p {
          margin: 0;
          color: #111827;
          font-weight: 600;
        }

        .section-title {
          margin: 7px 0 4px;
          border-bottom: 1px solid #111827;
          padding-bottom: 3px;
          color: #111827;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        .report-box {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          padding: 6px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .error-box {
          max-width: 8.5in;
          margin: 24px auto;
          border: 1px solid #d1d5db;
          padding: 16px;
          color: #111827;
          background: #ffffff;
        }

        @page {
          size: letter;
          margin: 0.18in;
        }

        @media print {
          html,
          body {
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #__next,
          .print-report-page {
            display: block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .print-controls {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .report-page {
            display: block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
            line-height: 1.22 !important;
            background: #ffffff !important;
            color: #000000 !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .brand-bar,
          .header,
          table,
          .callout,
          .section-title,
          .report-box {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .report-box {
            margin-bottom: 0 !important;
          }
        }
      `}</style>

      <div className="print-controls">
        <button type="button" onClick={() => window.history.back()}>Back</button>
        <button className="primary" type="button" onClick={() => window.print()}>Print / Save PDF</button>
      </div>

      {report ? (
        <article className="report-page">
          <div className="brand-bar"><span>REFAB CONNECT</span><span>AI-WOC</span></div>
          <header className="header">
            <div className="kicker">Work Order Correction System</div>
            <h1>Engineering Correction Report</h1>
            <p className="subtitle">Powered by Applied Intelligence Framework · Print-Ready Correction Document</p>
          </header>

          <table>
            <tbody>
              {fields.map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {issueSummary && (
            <section className="callout">
              <h2>Issue Summary</h2>
              <p>{issueSummary}</p>
            </section>
          )}

          {requestedAction && (
            <section className="callout">
              <h2>Requested Engineering Action</h2>
              <p>{requestedAction}</p>
            </section>
          )}

          <h2 className="section-title">Full Engineering Correction Report</h2>
          <section className="report-box">{report.reportText}</section>
        </article>
      ) : (
        <section className="error-box">
          <h1>Print Report Not Available</h1>
          <p>{loadError || 'Loading report data...'}</p>
        </section>
      )}
    </main>
  );
}
