/**
 * EmailLogger.gs
 * Logs all email activities to the Emails sheet
 */

/**
 * Log email to Emails sheet
 * @param {String} propertyId - Property ID
 * @param {String} agentEmail - Agent email address
 * @param {String} agentName - Agent name
 * @param {String} subject - Email subject
 * @param {String} status - Email status
 * @param {String} messageId - Gmail message ID
 * @param {String} threadId - Gmail thread ID
 * @param {String} emailType - Email type ('Initial', 'Follow-up', etc.)
 * @return {Number} Row number where email was logged
 */
function logEmail(propertyId, agentEmail, agentName, subject, status, messageId, threadId, emailType) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set');
  }
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) {
    throw new Error('Emails sheet not found');
  }
  
  var lastRow = sheet.getLastRow();
  var timestamp = new Date();
  
  // Calculate follow-up date (48 hours later)
  var followUpDate = new Date(timestamp.getTime() + (48 * 60 * 60 * 1000));
  
  var rowData = [
    propertyId, // A: Property ID
    agentEmail, // B: Agent Email
    agentName || '', // C: Agent Name
    subject, // D: Subject
    status || 'Sent', // E: Status
    timestamp, // F: Timestamp
    messageId || '', // G: Message ID
    threadId || '', // H: Thread ID
    followUpDate, // I: Follow Up Date
    0, // J: Follow Up Count
    emailType || 'Initial' // K: Email Type
  ];
  
  var newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
  
  // Format the row
  sheet.getRange(newRow, 6).setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange(newRow, 9).setNumberFormat('mm/dd/yyyy');
  
  return newRow;
}

/**
 * Update email status
 * @param {String} messageId - Gmail message ID
 * @param {String} newStatus - New status
 */
function updateEmailStatus(messageId, newStatus) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find row with matching message ID (Column G)
  for (var i = 1; i < values.length; i++) {
    if (values[i][6] === messageId) {
      sheet.getRange(i + 1, 5).setValue(newStatus); // Column E: Status
      break;
    }
  }
}

/**
 * Increment follow-up count for an email
 * @param {String} messageId - Gmail message ID
 */
function incrementFollowUpCount(messageId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find row with matching message ID (Column G)
  for (var i = 1; i < values.length; i++) {
    if (values[i][6] === messageId) {
      var currentCount = values[i][9] || 0; // Column J: Follow Up Count
      sheet.getRange(i + 1, 10).setValue(currentCount + 1);
      break;
    }
  }
}

/**
 * Get emails needing follow-up
 * @param {Number} daysThreshold - Days threshold (default 2 for 48 hours)
 * @return {Array} Array of email row data
 */
function getEmailsNeedingFollowUp(daysThreshold) {
  var threshold = daysThreshold || 2;
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return [];
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  
  var emailsToFollowUp = [];
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var followUpDate = row[8]; // Column I: Follow Up Date
    var status = row[4]; // Column E: Status
    var followUpCount = row[9] || 0; // Column J: Follow Up Count
    
    // Check if follow-up date has passed and status is not "Replied"
    if (followUpDate instanceof Date && status !== 'Replied') {
      var followUp = new Date(followUpDate);
      followUp.setHours(0, 0, 0, 0);
      
      var daysDiff = Math.floor((today - followUp) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && followUpCount < 3) {
        emailsToFollowUp.push({
          rowIndex: i + 1,
          propertyId: row[0],
          agentEmail: row[1],
          agentName: row[2],
          subject: row[3],
          status: row[4],
          timestamp: row[5],
          messageId: row[6],
          threadId: row[7],
          followUpDate: row[8],
          followUpCount: followUpCount,
          emailType: row[10]
        });
      }
    }
  }
  
  return emailsToFollowUp;
}

/**
 * Get property emails
 * @param {String} propertyId - Property ID
 * @return {Array} Array of email row data
 */
function getPropertyEmails(propertyId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return [];
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var emails = [];
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId) {
      emails.push({
        rowIndex: i + 1,
        propertyId: values[i][0],
        agentEmail: values[i][1],
        agentName: values[i][2],
        subject: values[i][3],
        status: values[i][4],
        timestamp: values[i][5],
        messageId: values[i][6],
        threadId: values[i][7],
        followUpDate: values[i][8],
        followUpCount: values[i][9] || 0,
        emailType: values[i][10]
      });
    }
  }
  
  return emails;
}

