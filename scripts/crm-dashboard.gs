/**
 * SolveX Lead Management CRM: Dashboard, row colours and follow-up reminders.
 * Google Apps Script bound to the lead management spreadsheet.
 *
 * Expected "Sheet1" layout:
 * A Lead ID | B Date Received | C Full Name | D Email | E Phone | F Business Name
 * G Service | H Message | I Lead Source | J Status | K Project Budget | L How Heard
 * M Follow-up Date | N Last Contacted
 *
 * Built by SolveX: AI Automation & Digital Solutions
 */

const LEADS_SHEET = 'Sheet1';
const DASH_SHEET = 'Dashboard';
const STATUSES = ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiating', 'Converted', 'Lost'];
const BUDGETS = ['Below $100', '$100–$300', '$301–$500', '$501–$1,000', 'Above $1,000', 'Not sure yet'];
const ALERT_EMAIL = '';      // leave empty to email the sheet owner
const REMINDER_HOUR = 8;     // daily reminder time (script time zone)

/* ---------- Menu ---------- */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SolveX CRM')
    .addItem('Build / Refresh Dashboard', 'buildDashboard')
    .addItem('Send follow-up reminders now', 'sendFollowUpReminders')
    .addItem('Turn on daily reminders', 'installDailyReminder')
    .addToUi();
}

/* ---------- Dashboard ---------- */
function buildDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const leads = ss.getSheetByName(LEADS_SHEET);
  if (!leads) {
    throw new Error('Sheet "' + LEADS_SHEET + '" not found. Check LEADS_SHEET at the top of the script.');
  }

  formatLeadsSheet_(leads);

  let sh = ss.getSheetByName(DASH_SHEET);
  if (sh) {
    sh.getCharts().forEach(function (c) { sh.removeChart(c); });
    sh.clear();
  } else {
    sh = ss.insertSheet(DASH_SHEET, 0);
  }
  sh.setHiddenGridlines(true);
  sh.setTabColor('#8b5cf6');

  // Column widths (wide enough for service names and KPI labels)
  sh.setColumnWidth(1, 170);  // A
  sh.setColumnWidth(2, 130);  // B
  sh.setColumnWidth(3, 130);  // C
  sh.setColumnWidth(4, 230);  // D
  sh.setColumnWidth(5, 120);  // E
  sh.setColumnWidth(6, 150);  // F
  sh.setColumnWidth(7, 170);  // G
  sh.setColumnWidth(8, 80);   // H
  sh.setColumnWidth(9, 20);   // I (spacer before charts)

  // helper: open-ended range of one column on the leads sheet
  const R = function (c) { return "'" + LEADS_SHEET + "'!" + c + '2:' + c; };

  // Title
  sh.getRange('A1').setValue('SolveX Lead Management Dashboard')
    .setFontSize(22).setFontWeight('bold').setFontColor('#6d28d9');
  sh.getRange('A2')
    .setFormula('="Live data from ' + LEADS_SHEET + ' | Updated "&TEXT(NOW(),"dd MMM yyyy HH:mm")')
    .setFontColor('#6b7280');

  // KPI cards (labels row 4, values row 5)
  const kpis = [
    ['Total Leads', '=COUNTA(' + R('A') + ')'],
    ['New Leads', '=COUNTIF(' + R('J') + ',"New")'],
    ['Active Pipeline', '=SUM(COUNTIF(' + R('J') + ',{"Contacted","Interested","Proposal Sent","Negotiating"}))'],
    ['Converted', '=COUNTIF(' + R('J') + ',"Converted")'],
    ['Conversion Rate', '=IFERROR(COUNTIF(' + R('J') + ',"Converted")/COUNTA(' + R('A') + '),0)'],
    ['Leads (Last 7 Days)', '=COUNTIFS(' + R('B') + ',">="&(TODAY()-7))'],
    ['Follow-ups Due', '=COUNTIFS(' + R('M') + ',"<="&TODAY(),' + R('J') + ',"<>Converted",' + R('J') + ',"<>Lost")']
  ];
  sh.getRange(4, 1, 1, 7).setValues([kpis.map(function (k) { return k[0]; })])
    .setBackground('#8b5cf6').setFontColor('#ffffff').setFontWeight('bold')
    .setHorizontalAlignment('center');
  sh.getRange(5, 1, 1, 7).setFormulas([kpis.map(function (k) { return k[1]; })])
    .setFontSize(26).setFontWeight('bold').setFontColor('#1f2937')
    .setHorizontalAlignment('center').setBackground('#f5f3ff');
  sh.getRange('E5').setNumberFormat('0.0%');
  sh.setRowHeight(5, 56);

  // Section headings
  const headings = {
    A8: 'Pipeline by Status',
    D8: 'Leads by Service',
    G8: 'Leads by Source',
    A19: 'Leads by Project Budget',
    D24: 'How Leads Found Us',
    A34: 'Follow-ups Due or Overdue'
  };
  Object.keys(headings).forEach(function (cell) {
    sh.getRange(cell).setValue(headings[cell])
      .setFontSize(13).setFontWeight('bold').setFontColor('#6d28d9');
  });

  // Status table (fixed order)
  sh.getRange('A9:B9').setValues([['Status', 'Leads']]);
  sh.getRange(10, 1, STATUSES.length, 1).setValues(STATUSES.map(function (s) { return [s]; }));
  sh.getRange(10, 2, STATUSES.length, 1).setFormulas(
    STATUSES.map(function (s, i) { return ['=COUNTIF(' + R('J') + ',A' + (10 + i) + ')']; })
  );

  // Budget table (fixed order, lowest to highest)
  sh.getRange('A20:B20').setValues([['Project Budget', 'Leads']]);
  sh.getRange(21, 1, BUDGETS.length, 1).setValues(BUDGETS.map(function (b) { return [b]; }));
  sh.getRange(21, 2, BUDGETS.length, 1).setFormulas(
    BUDGETS.map(function (b, i) { return ['=COUNTIF(' + R('K') + ',A' + (21 + i) + ')']; })
  );

  // Auto-growing tables
  sh.getRange('D9').setFormula(queryTable_(R('G'), 'Service'));
  sh.getRange('G9').setFormula(queryTable_(R('I'), 'Lead Source'));
  sh.getRange('D25').setFormula(queryTable_(R('L'), 'How Heard'));

  // Follow-ups due or overdue
  const followQuery =
    '=IFERROR(QUERY(\'' + LEADS_SHEET + '\'!A2:N,' +
    '"select C, F, J, M where M is not null and M <= date \'"&TEXT(TODAY(),"yyyy-mm-dd")&"\' ' +
    'and J <> \'Converted\' and J <> \'Lost\' order by M ' +
    'label C \'Name\', F \'Business\', J \'Status\', M \'Follow-up Due\'",0),"No follow-ups due")';
  sh.getRange('A35').setFormula(followQuery);
  sh.getRange('D36:D200').setNumberFormat('yyyy-mm-dd');

  // Table header styling
  ['A9:B9', 'D9:E9', 'G9:H9', 'A20:B20', 'D25:E25', 'A35:D35'].forEach(function (a) {
    sh.getRange(a).setFontWeight('bold').setBackground('#ede9fe');
  });

  addCharts_(sh);
  ss.setActiveSheet(sh);
  ss.toast('Dashboard is ready.', 'SolveX CRM', 5);
}

function queryTable_(rangeRef, label) {
  return '=IFERROR(QUERY(' + rangeRef + ',' +
    '"select Col1, count(Col1) where Col1 is not null group by Col1 ' +
    'order by count(Col1) desc label Col1 \'' + label + '\', count(Col1) \'Leads\'",0),"No data yet")';
}

function addCharts_(sh) {
  // Status chart, beside the top tables (column J)
  const statusChart = sh.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sh.getRange('A9:B16'))
    .setNumHeaders(1)
    .setPosition(7, 10, 0, 0)
    .setOption('title', 'Leads by Status')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#8b5cf6'])
    .setOption('width', 480)
    .setOption('height', 280)
    .build();
  sh.insertChart(statusChart);

  // Service chart, below the status chart
  const serviceChart = sh.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(sh.getRange('D9:E19'))
    .setNumHeaders(1)
    .setPosition(22, 10, 0, 0)
    .setOption('title', 'Leads by Service')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#a78bfa'])
    .setOption('width', 480)
    .setOption('height', 300)
    .build();
  sh.insertChart(serviceChart);
}

/* ---------- Leads sheet formatting ---------- */
function formatLeadsSheet_(leads) {
  leads.getRange('B2:B1000').setNumberFormat('yyyy-mm-dd');
  leads.getRange('M2:N1000').setNumberFormat('yyyy-mm-dd');
  leads.getRange('E2:E1000').setNumberFormat('@');

  const colors = {
    'New': '#dbeafe',
    'Contacted': '#fef9c3',
    'Interested': '#ffedd5',
    'Proposal Sent': '#ede9fe',
    'Negotiating': '#dcfce7',
    'Converted': '#bbf7d0',
    'Lost': '#fee2e2'
  };
  const rowRange = leads.getRange('A2:N1000');

  const rules = [];
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($M2<>"",$M2<TODAY(),$J2<>"Converted",$J2<>"Lost")')
      .setFontColor('#b91c1c')
      .setBold(true)
      .setRanges([leads.getRange('M2:M1000')])
      .build()
  );
  Object.keys(colors).forEach(function (status) {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$J2="' + status + '"')
        .setBackground(colors[status])
        .setRanges([rowRange])
        .build()
    );
  });
  leads.setConditionalFormatRules(rules);

  // Readable widths on the leads sheet
  leads.setColumnWidth(3, 150);   // Full Name
  leads.setColumnWidth(4, 220);   // Email
  leads.setColumnWidth(5, 130);   // Phone
  leads.setColumnWidth(6, 160);   // Business
  leads.setColumnWidth(7, 190);   // Service
  leads.setColumnWidth(8, 300);   // Message
}

/* ---------- Follow-up reminders ---------- */
function sendFollowUpReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(LEADS_SHEET);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const tz = ss.getSpreadsheetTimeZone();
  const rows = sh.getRange(2, 1, lastRow - 1, 14).getValues();

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const due = rows.filter(function (r) {
    const d = r[12];
    const status = r[9];
    return d instanceof Date && d <= endOfToday && status !== 'Converted' && status !== 'Lost';
  }).sort(function (a, b) { return a[12] - b[12]; });

  if (!due.length) {
    ss.toast('No follow-ups due today.', 'SolveX CRM', 5);
    return;
  }

  const recipient = ALERT_EMAIL || Session.getEffectiveUser().getEmail();

  let html = '<h2>SolveX follow-up reminders</h2>' +
    '<p>' + due.length + ' lead(s) need attention.</p>' +
    '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    '<tr style="background:#8b5cf6;color:#fff">' +
    '<th style="padding:8px;text-align:left">Name</th>' +
    '<th style="padding:8px;text-align:left">Business</th>' +
    '<th style="padding:8px;text-align:left">Service</th>' +
    '<th style="padding:8px;text-align:left">Status</th>' +
    '<th style="padding:8px;text-align:left">Due</th>' +
    '<th style="padding:8px;text-align:left">Phone</th></tr>';

  due.forEach(function (r) {
    const days = Math.floor((startOfToday - r[12]) / 86400000);
    const dueText = Utilities.formatDate(r[12], tz, 'dd MMM yyyy') +
      (days > 0 ? ' (' + days + ' day' + (days > 1 ? 's' : '') + ' overdue)' : ' (today)');
    html += '<tr>' +
      '<td style="padding:8px;border-bottom:1px solid #ddd">' + esc_(r[2]) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #ddd">' + esc_(r[5]) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #ddd">' + esc_(r[6]) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #ddd">' + esc_(r[9]) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #ddd">' + esc_(dueText) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #ddd">' + esc_(r[4]) + '</td></tr>';
  });

  html += '</table><p><a href="' + ss.getUrl() + '">Open the CRM</a></p>' +
    '<p><strong>Innovate. Automate. Elevate.</strong></p>';

  MailApp.sendEmail({
    to: recipient,
    subject: 'SolveX: ' + due.length + ' follow-up(s) due',
    htmlBody: html
  });
  ss.toast('Reminder email sent.', 'SolveX CRM', 5);
}

function installDailyReminder() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendFollowUpReminders') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendFollowUpReminders')
    .timeBased()
    .everyDays(1)
    .atHour(REMINDER_HOUR)
    .create();
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('Daily reminders are on (around ' + REMINDER_HOUR + ':00).', 'SolveX CRM', 5);
}

function esc_(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
