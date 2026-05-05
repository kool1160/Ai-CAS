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

function getReportValue(reportText: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escapedLabel}:\\s*(.+)$`, 'im');
  const match = reportText.match(pattern);
  return match?.[1]?.trim() ?? '';
}

function resolveField(explicitValue: string | undefined, reportText: string, label: string) {
  return explicitValue?.trim() || getReportValue(reportText, label);
}

export function printCorrectionReport(report: PrintCorrectionReportInput) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');

  if (!printWindow) {
    window.print();
    return;
  }

  const generatedTimestamp = report.generatedTimestamp || new Date().toLocaleString();
  const title = report.subjectLine?.trim() || 'Engineering Correction Report';
  const workOrderNumber = resolveField(report.workOrderNumber, report.reportText, 'Work Order Number');
  const partNumber = resolveField(report.partNumber, report.reportText, 'Part Number');
  const revision = resolveField(report.revision, report.reportText, 'Revision');
  const customerOrJob = resolveField(report.customerOrJob, report.reportText, 'Customer / Job');
  const quantity = resolveField(report.quantity, report.reportText, 'Quantity');
  const affectedArea = resolveField(report.affectedArea, report.reportText, 'Affected Area');
  const correctionType = resolveField(report.correctionType, report.reportText, 'Correction Type');
  const submittedBy = resolveField(report.submittedBy, report.reportText, 'Submitted By / Source');
  const status = resolveField(report.status, report.reportText, 'Status');
  const issueSummary = getReportValue(report.reportText, 'Issue Summary');
  const requestedAction = getReportValue(report.reportText, 'Requested Engineering Action');

  const metadataRows = [
    buildRow('Work Order Number', workOrderNumber),
    buildRow('Part Number', partNumber),
    buildRow('Revision', revision),
    buildRow('Customer / Job', customerOrJob),
    buildRow('Quantity', quantity),
    buildRow('Affected Area', affectedArea),
    buildRow('Correction Type', correctionType),
    buildRow('Submitted By / Source', submittedBy),
    buildRow('Status', status),
    buildRow('Generated', generatedTimestamp),
  ].join('');

  const issueSummaryBlock = issueSummary
    ? `<section class="callout"><h2>Issue Summary</h2><p>${escapeHtml(issueSummary)}</p></section>`
    : '';
  const requestedActionBlock = requestedAction
    ? `<section class="callout"><h2>Requested Engineering Action</h2><p>${escapeHtml(requestedAction)}</p></section>`
    : '';

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
    .brand-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #111827;
      background: #111827;
      color: #ffffff;
      padding: 9px 11px;
      margin-bottom: 12px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .header {
      border: 1px solid #111827;
      border-left: 8px solid #111827;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .kicker {
      color: #374151;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      margin: 5px 0 4px;
      color: #111827;
      font-size: 24px;
      line-height: 1.08;
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
      margin: 0 0 14px;
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
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      color: #111827;
      font-weight: 600;
    }
    .callout {
      border: 1px solid #111827;
      border-left: 6px solid #111827;
      padding: 10px 12px;
      margin: 0 0 12px;
      break-inside: avoid;
    }
    .callout h2 {
      margin: 0 0 5px;
      color: #111827;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .callout p {
      margin: 0;
      color: #111827;
      font-weight: 600;
    }
    .section-title {
      margin: 16px 0 8px;
      border-bottom: 2px solid #111827;
      padding-bottom: 6px;
      color: #111827;
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
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
    <div class="brand-bar"><span>REFAB CONNECT</span><span>AI-WOC</span></div>
    <header class="header">
      <div class="kicker">Work Order Correction System</div>
      <h1>Engineering Correction Report</h1>
      <p class="subtitle">Powered by Applied Intelligence Framework · Print-Ready Correction Document</p>
    </header>
    <table>
      <tbody>${metadataRows}</tbody>
    </table>
    ${issueSummaryBlock}
    ${requestedActionBlock}
    <h2 class="section-title">Full Engineering Correction Report</h2>
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
