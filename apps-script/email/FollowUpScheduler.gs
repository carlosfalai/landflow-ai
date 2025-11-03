/**
 * FollowUpScheduler.gs
 * Handles automated follow-up email scheduling and sending
 */

/**
 * Process and send follow-up emails
 * Called by hourly or daily triggers
 */
function processFollowUpEmails() {
  Logger.log('Starting follow-up email processing at ' + new Date());
  
  var emailsToFollowUp = getEmailsNeedingFollowUp(2); // 48 hours (2 days)
  
  Logger.log('Found ' + emailsToFollowUp.length + ' emails needing follow-up');
  
  var sent = 0;
  var skipped = 0;
  
  for (var i = 0; i < emailsToFollowUp.length; i++) {
    var emailData = emailsToFollowUp[i];
    
    try {
      // Get property data
      var propertyData = getPropertyById(emailData.propertyId);
      
      if (!propertyData) {
        Logger.log('Property not found: ' + emailData.propertyId);
        skipped++;
        continue;
      }
      
      // Check if property status allows follow-ups
      var propertyStatus = propertyData[10]; // Column K: Status
      if (propertyStatus === 'Under Review' || propertyStatus === 'Under Contract' || propertyStatus === 'Closed') {
        Logger.log('Skipping follow-up - property status: ' + propertyStatus);
        skipped++;
        continue;
      }
      
      // Check follow-up count (max 3 follow-ups)
      if (emailData.followUpCount >= 3) {
        Logger.log('Max follow-ups reached for property: ' + emailData.propertyId);
        // Mark property as Dormant
        updatePropertyStatus(emailData.propertyId, 'Dormant');
        skipped++;
        continue;
      }
      
      // Send follow-up email
      var recipientData = {
        email: emailData.agentEmail,
        name: emailData.agentName
      };
      
      // Get original offer amount from Properties sheet or previous emails
      var offerAmount = getLastOfferAmount(emailData.propertyId);
      
      if (!offerAmount) {
        // Calculate new offer if none exists
        offerAmount = calculateOfferForProperty(propertyData);
      }
      
      var result = sendFollowUpEmail(propertyData, recipientData, offerAmount, emailData.threadId);
      
      if (result.success) {
        // Update follow-up count
        incrementFollowUpCount(emailData.messageId);
        
        // Log new follow-up email
        logEmail(
          emailData.propertyId,
          emailData.agentEmail,
          emailData.agentName,
          result.subject,
          'Sent',
          result.messageId,
          emailData.threadId || result.threadId,
          'Follow-up'
        );
        
        sent++;
        Logger.log('Follow-up sent for property: ' + emailData.propertyId);
        
        // Rate limiting
        Utilities.sleep(1000); // 1 second between emails
      } else {
        Logger.log('Failed to send follow-up: ' + result.error);
        skipped++;
      }
      
    } catch (error) {
      Logger.log('Error processing follow-up for property ' + emailData.propertyId + ': ' + error.toString());
      logError('FollowUpScheduler', error);
      skipped++;
    }
  }
  
  Logger.log('Follow-up processing complete: ' + sent + ' sent, ' + skipped + ' skipped');
  return {
    sent: sent,
    skipped: skipped,
    total: emailsToFollowUp.length
  };
}

/**
 * Send follow-up email
 * @param {Object} propertyData - Property data
 * @param {Object} recipientData - Recipient data
 * @param {Number} offerAmount - Offer amount
 * @param {String} threadId - Gmail thread ID for reply
 * @return {Object} Result object with success, messageId, threadId, subject
 */
function sendFollowUpEmail(propertyData, recipientData, offerAmount, threadId) {
  try {
    var htmlBody = generateEmailHTML('follow-up', propertyData, recipientData, offerAmount);
    var subject = generateEmailSubject('follow-up', propertyData);
    
    var options = {
      htmlBody: htmlBody,
      replyTo: getUserContactInfo().YOUR_EMAIL
    };
    
    // If thread ID exists, use Gmail API to send as reply
    if (threadId) {
      try {
        var gmailMessage = GmailApp.sendEmail(
          recipientData.email,
          'Re: ' + subject,
          '',
          {
            htmlBody: htmlBody,
            replyTo: getUserContactInfo().YOUR_EMAIL
          }
        );
        
        return {
          success: true,
          messageId: gmailMessage.getId(),
          threadId: gmailMessage.getThread().getId(),
          subject: 'Re: ' + subject
        };
      } catch (e) {
        // Fall back to regular email
      }
    }
    
    // Send regular email
    var message = MailApp.sendEmail({
      to: recipientData.email,
      subject: subject,
      htmlBody: htmlBody,
      replyTo: getUserContactInfo().YOUR_EMAIL
    });
    
    return {
      success: true,
      messageId: message.messageId || '',
      threadId: threadId || '',
      subject: subject
    };
    
  } catch (error) {
    Logger.log('Error sending follow-up email: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get property data by ID
 * @param {String} propertyId - Property ID
 * @return {Array} Property row data
 */
function getPropertyById(propertyId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');
  
  if (!sheet) return null;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find property by ID (Column A)
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId) {
      return values[i];
    }
  }
  
  return null;
}

/**
 * Get last offer amount for a property
 * @param {String} propertyId - Property ID
 * @return {Number} Offer amount or 0
 */
function getLastOfferAmount(propertyId) {
  var emails = getPropertyEmails(propertyId);
  
  // Get offer from Properties sheet (Column J)
  var propertyData = getPropertyById(propertyId);
  if (propertyData && propertyData[9]) {
    return parseFloat(propertyData[9]) || 0;
  }
  
  return 0;
}

/**
 * Update property status
 * @param {String} propertyId - Property ID
 * @param {String} newStatus - New status
 */
function updatePropertyStatus(propertyId, newStatus) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');
  
  if (!sheet) return;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find property by ID (Column A)
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId) {
      sheet.getRange(i + 1, 11).setValue(newStatus); // Column K: Status
      sheet.getRange(i + 1, 15).setValue(new Date()); // Column O: Last Updated
      break;
    }
  }
}

