type PrintCorrectionReportInput = {
  subjectLine?: string;
  workOrderNumber?: string;
  partNumber?: string;
  revision?: string;
  customerOrJob?: string;
  quantity?: string;
  affectedArea?: string;
  correctionType?: string;
  submittedBy?: string;
  status?: string;
  generatedTimestamp?: string;
  reportText: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildRow(label: string, value?: string) {
  const cleaned = value?.trim();
  if (!cleaned) return '';

  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(cleaned)}</td></tr>`;
}

export function printCorrectionReport(report: PrintCorrectionReportInput) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');

  if (!printWindow) {
    window.print();
    return;
  }

  const generatedTimestamp = report.generatedTimestamp || new Date().toLocaleString();
  const title = report.subjectLine?.trim() || 'Engineering Correction Report';

  const metadataRows = [
    buildRow('Work Order Number', report.workOrderNumber),
    buildRow('Part Number', report.partNumber),
    buildRow('Revision', report.revision),
    buildRow('Customer / Job', report.customerOrJob),
    buildRow('Quantity', report.quantity),
    buildRow('Affected Area', report.affectedArea),
    buildRow('Correction Type', report.correctionType),
    buildRow('Submitted By / Source', report.submittedBy),
    buildRow('Status', report.status),
    buildRow('Generated', generatedTimestamp),
  ].join('');

  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #ffffff;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.45;
    }
    .page {
      width: min(100%, 8.5in);
      margin: 0 auto;
      padding: 0.42in;
    }
    .header {
      border-bottom: 2px solid #111827;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .kicker {
      color: #374151;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      margin: 4px 0 4px;
      color: #111827;
      font-size: 24px;
      line-height: 1.1;
    }
    .subtitle {
      margin: 0;
      color: #4b5563;
      font-size: 12px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 16px;
    }
    th,
    td {
      border: 1px solid #d1d5db;
      padding: 8px 9px;
      vertical-align: top;
      text-align: left;
    }
    th {
      width: 34%;
      background: #f3f4f6;
      color: #111827;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      color: #111827;
      font-weight: 600;
    }
    .section-title {
      margin: 18px 0 8px;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 6px;
      color: #111827;
      font-size: 15px;
    }
    .report-box {
      border: 1px solid #d1d5db;
      background: #ffffff;
      padding: 12px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .footer {
      margin-top: 18px;
      border-top: 1px solid #d1d5db;
      padding-top: 8px;
      color: #6b7280;
      font-size: 10px;
    }
    @page {
      size: letter;
      margin: 0.35in;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { width: auto; padding: 0; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div class="kicker">Refab Connect / AI-WOC</div>
      <h1>Engineering Correction Report</h1>
      <p class="subtitle">Work Order Correction System · Powered by Applied Intelligence Framework</p>
    </header>
    <table>
      <tbody>${metadataRows}</tbody>
    </table>
    <h2 class="section-title">Correction Report</h2>
    <section class="report-box">${escapeHtml(report.reportText)}</section>
    <footer class="footer">Generated from Refab Connect browser print/export. Review all information before release to Engineering.</footer>
  </main>
  <script>
    window.onload = () => {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`);

  printWindow.document.close();
}
