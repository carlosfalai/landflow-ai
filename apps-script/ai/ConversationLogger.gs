/**
 * ConversationLogger.gs
 * Logs replies to the Replies sheet
 */

/**
 * Log reply to Replies sheet
 * @param {String} propertyId - Property ID
 * @param {String} threadId - Gmail thread ID
 * @param {Date} timestamp - Reply timestamp
 * @param {String} sentiment - AI-classified sentiment
 * @param {String} replyType - Reply type
 * @param {Number} confidence - AI confidence score
 * @param {Number} originalOffer - Original offer amount
 * @param {Number} counterofferAmount - Counteroffer amount if present
 * @param {String} notes - Summary/notes
 * @param {String} nextAction - Recommended next action
 * @return {Number} Row number where reply was logged
 */
function logReply(propertyId, threadId, timestamp, sentiment, replyType, confidence, originalOffer, counterofferAmount, notes, nextAction) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set');
  }
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Replies');
  
  if (!sheet) {
    throw new Error('Replies sheet not found');
  }
  
  var lastRow = sheet.getLastRow();
  
  var rowData = [
    propertyId, // A: Property ID
    threadId || '', // B: Email Thread ID
    timestamp || new Date(), // C: Reply Timestamp
    sentiment || 'Neutral', // D: Sentiment
    replyType || 'Unclear', // E: Reply Type
    confidence || 0, // F: AI Confidence
    originalOffer || 0, // G: Original Offer
    counterofferAmount || 0, // H: Counteroffer Amount
    notes || '', // I: Notes
    nextAction || '', // J: Next Action
    false, // K: Action Taken (checkbox)
    'Pending' // L: Handler Status
  ];
  
  var newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
  
  // Format the row
  sheet.getRange(newRow, 3).setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange(newRow, 6).setNumberFormat('0%');
  sheet.getRange(newRow, 7).setNumberFormat('$#,##0');
  sheet.getRange(newRow, 8).setNumberFormat('$#,##0');
  
  return newRow;
}

/**
 * Update reply handler status
 * @param {String} propertyId - Property ID
 * @param {String} threadId - Thread ID
 * @param {String} newStatus - New handler status
 */
function updateReplyStatus(propertyId, threadId, newStatus) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Replies');
  
  if (!sheet) return;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find matching reply
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId && values[i][1] === threadId) {
      sheet.getRange(i + 1, 12).setValue(newStatus); // Column L: Handler Status
      sheet.getRange(i + 1, 11).setValue(true); // Column K: Action Taken
      break;
    }
  }
}

