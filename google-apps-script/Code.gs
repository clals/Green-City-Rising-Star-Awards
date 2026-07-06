function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    lock.waitLock(5000);
    lockAcquired = true;

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_(false, 'Invalid JSON payload.');
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse_(false, 'Invalid JSON payload.');
    }

    var contestantId = asNonEmptyString_(payload.contestant_id);
    var contestantName = asNonEmptyString_(payload.contestant_name);
    var category = asNonEmptyString_(payload.category);
    var voteCode = asNonEmptyString_(payload.vote_code);
    var timestamp = asNonEmptyString_(payload.timestamp);

    if (!contestantId || !contestantName || !category || !voteCode || !timestamp) {
      return jsonResponse_(false, 'Missing required vote fields.');
    }

    var time = new Date(timestamp);
    if (isNaN(time.getTime())) {
      return jsonResponse_(false, 'Invalid timestamp.');
    }

    var sheet = getVotesSheet_();

    // Prevent duplicate code usage by scanning the Voting Code column.
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existingCodes = sheet.getRange(2, 5, lastRow - 1, 1).getValues();
      var normalizedSubmittedCode = voteCode.toUpperCase();
      for (var i = 0; i < existingCodes.length; i++) {
        var existingCode = String(existingCodes[i][0] || '').trim().toUpperCase();
        if (existingCode && existingCode === normalizedSubmittedCode) {
          return jsonResponse_(false, 'Voting code already used.');
        }
      }
    }

    var ip = asOptionalString_(payload.ip);
    var userAgent = asOptionalString_(payload.user_agent) || asOptionalString_(payload.userAgent);

    sheet.appendRow([
      timestamp,
      contestantId,
      contestantName,
      category,
      voteCode,
      ip,
      userAgent
    ]);

    return jsonResponse_(true);
  } catch (err) {
    return jsonResponse_(false, 'Server error while recording vote.');
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

function doGet(e) {
  try {
    var action = '';
    if (e && e.parameter && typeof e.parameter.action === 'string') {
      action = e.parameter.action.trim();
    }

    if (action !== 'getVotes') {
      return jsonResponse_(false, 'Unsupported action.');
    }

    var sheet = getVotesSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return jsonResponse_(true, '', { votes: [] });
    }

    var rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    var votes = rows.map(function(row, index) {
      return {
        id: 'sheet-' + (index + 2),
        timestamp: String(row[0] || ''),
        contestant_id: String(row[1] || ''),
        contestant_name: String(row[2] || ''),
        category: String(row[3] || ''),
        vote_code: String(row[4] || ''),
        ip: String(row[5] || ''),
        user_agent: String(row[6] || '')
      };
    });

    return jsonResponse_(true, '', { votes: votes });
  } catch (err) {
    return jsonResponse_(false, 'Server error while reading votes.');
  }
}

function getVotesSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Votes');

  if (!sheet) {
    sheet = spreadsheet.insertSheet('Votes');
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Contestant ID',
      'Contestant Name',
      'Category',
      'Voting Code',
      'IP',
      'User Agent'
    ]);
  }

  return sheet;
}

function asNonEmptyString_(value) {
  if (typeof value !== 'string') {
    return '';
  }
  var trimmed = value.trim();
  return trimmed ? trimmed : '';
}

function asOptionalString_(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function jsonResponse_(success, message, extra) {
  var output = { success: !!success };
  if (!success && message) {
    output.message = message;
  }
  if (success && message) {
    output.message = message;
  }
  if (extra && typeof extra === 'object') {
    for (var key in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, key)) {
        output[key] = extra[key];
      }
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
