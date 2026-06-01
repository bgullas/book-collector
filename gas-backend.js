// ============================================================
// Google Apps Script Backend — paste this in script.google.com
// ============================================================
// Spreadsheet ID is hard-coded below. Deploy as Web App:
//   Execute as: Me
//   Who has access: Anyone
// ============================================================

var SHEET_ID = '14Yy2gb5i-vq4dZQQRq-C8YOz3ira_CyF7OiSnH_CpSU';
var SHEET_NAME = 'Sheet1'; // change if your tab has a different name

// Headers — written once on first run
var HEADERS = ['Timestamp', 'ISBN', 'Book Name (Manglish)', 'Book Name (Malayalam)', 'Author', 'Publisher', 'Added By'];

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  // Transliteration endpoint — called by the PWA
  if (action === 'transliterate') {
    var text = e.parameter.text || '';
    var result = transliterateToMalayalam(text);
    return jsonResponse({ success: true, malayalam: result });
  }

  return jsonResponse({ status: 'Book Collector API running' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (ex) {
    return jsonResponse({ success: false, error: 'Server busy, please retry' });
  }

  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    sheet.appendRow([
      new Date(),
      data.isbn        || '',
      data.manglish    || '',
      data.malayalam   || '',
      data.author      || '',
      data.publisher   || '',
      data.addedBy     || ''
    ]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// Uses Google's own Input Tools API — no quota issues inside Apps Script
function transliterateToMalayalam(text) {
  if (!text || !text.trim()) return '';
  try {
    var url = 'https://inputtools.google.com/request?text='
      + encodeURIComponent(text)
      + '&itc=ml-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8';
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var json = JSON.parse(response.getContentText());
    // Response shape: ["SUCCESS", [["word", ["translation", ...]]]]
    if (json[0] === 'SUCCESS' && json[1] && json[1][0] && json[1][0][1]) {
      return json[1][0][1][0] || text;
    }
    return text;
  } catch (e) {
    return text;
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
