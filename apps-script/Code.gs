// Google Apps Script: receives RSVPs from the invitation page and writes them to this spreadsheet.
// Setup: see README.md ("Google Sheet setup").

const SHEET_NAME = 'Yanıtlar';
const MAX_GUESTS = 5;
const HEADERS = ['Tarih', 'Ad Soyad', 'Katılım', 'Kişi sayısı', 'İletişim', 'Mesaj', 'Davet linki adı'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const data = JSON.parse(e.postData.contents);

    // Honeypot: real visitors leave this empty
    if (data.website) return reply({ ok: true });

    const name = clean(data.name, 100);
    const invitedAs = clean(data.invitedAs, 100);
    const contact = clean(data.contact, 150);
    const message = clean(data.message, 1000);
    const attending = data.attending === true;
    let count = 0;
    if (!name) return reply({ ok: false, error: 'name' });
    if (typeof data.attending !== 'boolean') return reply({ ok: false, error: 'attending' });
    if (attending) {
      count = Number(data.guestCount);
      if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) return reply({ ok: false, error: 'guestCount' });
    }

    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    const row = [new Date(), name, attending ? 'Evet' : 'Hayır', count, contact, message, invitedAs];

    // A personal link (?ad=...) updates that guest's earlier answer instead of adding a duplicate
    let target = 0;
    if (invitedAs && sheet.getLastRow() > 1) {
      const col = sheet.getRange(2, 7, sheet.getLastRow() - 1, 1).getValues();
      for (let i = col.length - 1; i >= 0; i--) {
        if (String(col[i][0]) === invitedAs) { target = i + 2; break; }
      }
    }
    if (target) sheet.getRange(target, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);

    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

// Answers are written to this spreadsheet (the ID is in its URL: docs.google.com/spreadsheets/d/<ID>/edit).
// Leave empty only if this script is bound to the spreadsheet (Extensions > Apps Script).
const SPREADSHEET_ID = '1HaNAxppQ3ju-G0NOdSzaHxi3ecJ8T64eCHNwaTqi8jA';

function getSpreadsheet() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

// Run once from the editor to authorize the script and prepare the "Yanıtlar" tab; the log shows the spreadsheet URL.
function setup() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  Logger.log(ss.getUrl());
}

function doGet() {
  return reply({ ok: true, info: 'RSVP endpoint is running' });
}

// Trim, cap the length, and neutralise spreadsheet formulas
function clean(v, max) {
  let s = typeof v === 'string' ? v.trim().slice(0, max) : '';
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
