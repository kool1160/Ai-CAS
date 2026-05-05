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

const PRINT_ROOT_ID = 'refab-print-root';
const PRINT_STYLE_ID = 'refab-print-styles';

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

function removeExistingPrintOverlay() {
  document.getElementById(PRINT_ROOT_ID)?.remove();
  document.getElementById(PRINT_STYLE_ID)?.remove();
}

function getPrintStyles() {
  return `
    @media screen {
      #${PRINT_ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 99999;
        overflow: auto;
        padding: 16px;
        background: #ffffff;
        color: #111827;
        -webkit-overflow-scrolling: touch;
      }
      #${PRINT_ROOT_ID} * {
        box-sizing: border-box;
      }
      #${PRINT_ROOT_ID} .print-actions {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        gap: 8px;
        margin: -16px -16px 12px;
        padding: 10px 16px;
        background: #111827;
        border-bottom: 1px solid #374151;
      }
      #${PRINT_ROOT_ID} .print-actions button {
        min-height: 40px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 0 14px;
        background: #ffffff;
        color: #111827;
        font: 700 13px Arial, Helvetica, sans-serif;
      }
      #${PRINT_ROOT_ID} .print-actions button.primary {
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;
      }
      #${PRINT_ROOT_ID} .page {
        width: min(100%, 8.5in);
        margin: 0 auto;
        padding: 0.22in;
        background: #ffffff;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
        line-height: 1.28;
      }
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
      body > *:not(#${PRINT_ROOT_ID}):not(#${PRINT_STYLE_ID}) {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      #${PRINT_ROOT_ID} {
        display: block !important;
        position: static !important;
        inset: auto !important;
        width: auto !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #111827 !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      #${PRINT_ROOT_ID} .print-actions {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      #${PRINT_ROOT_ID} .page {
        display: block !important;
        width: auto !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #111827 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 11px !important;
        line-height: 1.26 !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      #${PRINT_ROOT_ID} .footer {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      #${PRINT_ROOT_ID} .report-box {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
    }

    @page {
      size: letter;
      margin: 0.2in;
    }

    #${PRINT_ROOT_ID} .brand-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #111827;
      background: #111827;
      color: #ffffff;
      padding: 6px 9px;
      margin-bottom: 7px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      break-after: avoid;
      page-break-after: avoid;
    }
    #${PRINT_ROOT_ID} .header {
      border: 1px solid #111827;
      border-left: 6px solid #111827;
      padding: 8px 10px;
      margin-bottom: 8px;
      break-inside: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    #${PRINT_ROOT_ID} .kicker {
      color: #374151;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    #${PRINT_ROOT_ID} h1 {
      margin: 2px 0 2px;
      color: #111827;
      font-size: 18px;
      line-height: 1.02;
    }
    #${PRINT_ROOT_ID} .subtitle {
      margin: 0;
      color: #4b5563;
      font-size: 9.5px;
      font-weight: 700;
    }
    #${PRINT_ROOT_ID} table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 8px;
      break-inside: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    #${PRINT_ROOT_ID} th,
    #${PRINT_ROOT_ID} td {
      border: 1px solid #d1d5db;
      padding: 4px 6px;
      vertical-align: top;
      text-align: left;
    }
    #${PRINT_ROOT_ID} th {
      width: 32%;
      background: #f3f4f6;
      color: #111827;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.035em;
    }
    #${PRINT_ROOT_ID} td {
      color: #111827;
      font-weight: 600;
    }
    #${PRINT_ROOT_ID} .callout {
      border: 1px solid #111827;
      border-left: 5px solid #111827;
      padding: 6px 8px;
      margin: 0 0 7px;
      break-inside: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    #${PRINT_ROOT_ID} .callout h2 {
      margin: 0 0 3px;
      color: #111827;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.035em;
    }
    #${PRINT_ROOT_ID} .callout p {
      margin: 0;
      color: #111827;
      font-weight: 600;
    }
    #${PRINT_ROOT_ID} .section-title {
      margin: 8px 0 5px;
      border-bottom: 1px solid #111827;
      padding-bottom: 3px;
      color: #111827;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.035em;
      break-after: avoid;
      page-break-after: avoid;
    }
    #${PRINT_ROOT_ID} .report-box {
      border: 1px solid #d1d5db;
      background: #ffffff;
      padding: 7px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      break-after: avoid;
      page-break-after: avoid;
    }
    #${PRINT_ROOT_ID} .footer {
      margin-top: 4px;
      border-top: 1px solid #d1d5db;
      padding-top: 3px;
      color: #6b7280;
      font-size: 8px;
      line-height: 1.1;
    }
  `;
}

export function printCorrectionReport(report: PrintCorrectionReportInput) {
  removeExistingPrintOverlay();

  const generatedTimestamp = report.generatedTimestamp || new Date().toLocaleString();
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

  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = getPrintStyles();

  const printRoot = document.createElement('section');
  printRoot.id = PRINT_ROOT_ID;
  printRoot.setAttribute('aria-label', 'Printable Engineering Correction Report');
  printRoot.innerHTML = `
    <div class="print-actions">
      <button class="primary" type="button" data-print-report>Print / Save PDF</button>
      <button type="button" data-close-print>Close</button>
    </div>
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
  `;

  document.body.appendChild(style);
  document.body.appendChild(printRoot);

  printRoot.querySelector('[data-close-print]')?.addEventListener('click', removeExistingPrintOverlay);
  printRoot.querySelector('[data-print-report]')?.addEventListener('click', () => window.print());

  requestAnimationFrame(() => {
    window.setTimeout(() => window.print(), 250);
  });
}
