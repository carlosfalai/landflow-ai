/**
 * OutreachManager.gs
 * Manages automated outreach to property listings
 */

/**
 * Send outreach emails to new properties
 * Called by daily triggers
 */
function sendOutreachEmails() {
  Logger.log('Starting outreach email job at ' + new Date());
  
  var newProperties = getNewProperties();
  Logger.log('Found ' + newProperties.length + ' new properties to contact');
  
  var sent = 0;
  var skipped = 0;
  var errors = 0;
  
  for (var i = 0; i < newProperties.length; i++) {
    var property = newProperties[i];
    
    try {
      // Check if property already has emails sent
      var existingEmails = getPropertyEmails(property[0]); // property[0] is Property ID
      
      if (existingEmails.length > 0) {
        Logger.log('Property already contacted: ' + property[0]);
        skipped++;
        continue;
      }
      
      // Get recipient information
      var recipientData = extractRecipientInfo(property);
      
      if (!recipientData.email) {
        Logger.log('No email found for property: ' + property[0]);
        skipped++;
        continue;
      }
      
      // Calculate offer
      var offerAmount = calculateOfferForProperty(property);
      
      if (offerAmount <= 0) {
        Logger.log('Invalid offer amount for property: ' + property[0]);
        skipped++;
        continue;
      }
      
      // Send email
      var result = sendInitialOutreachEmail(property, recipientData, offerAmount);
      
      if (result.success) {
        // Log email
        logEmail(
          property[0], // Property ID
          recipientData.email,
          recipientData.name,
          result.subject,
          'Sent',
          result.messageId,
          result.threadId,
          'Initial'
        );
        
        // Update property status
        updatePropertyStatus(property[0], 'Offer Sent');
        
        // Update offer amount in Properties sheet (Column J)
        var spreadsheetId = getSpreadsheetId();
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName('Properties');
        var dataRange = sheet.getDataRange();
        var values = dataRange.getValues();
        
        for (var j = 1; j < values.length; j++) {
          if (values[j][0] === property[0]) {
            sheet.getRange(j + 1, 10).setValue(offerAmount); // Column J: Offer Amount
            sheet.getRange(j + 1, 9).setValue(new Date()); // Column I: Offer Sent
            break;
          }
        }
        
        sent++;
        Logger.log('Email sent for property: ' + property[0]);
        
        // Rate limiting - delay between emails
        Utilities.sleep(2000); // 2 seconds between emails
        
      } else {
        Logger.log('Failed to send email: ' + result.error);
        errors++;
      }
      
    } catch (error) {
      Logger.log('Error processing property ' + property[0] + ': ' + error.toString());
      logError('OutreachManager', error);
      errors++;
    }
  }
  
  Logger.log('Outreach email job complete: ' + sent + ' sent, ' + skipped + ' skipped, ' + errors + ' errors');
  return {
    sent: sent,
    skipped: skipped,
    errors: errors,
    total: newProperties.length
  };
}

/**
 * Get new properties that haven't been contacted
 * @return {Array} Array of property row data
 */
function getNewProperties() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');
  
  if (!sheet) return [];
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var newProperties = [];
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var status = row[10]; // Column K: Status
    
    // Include "New" status properties
    if (status === 'New' || status === '') {
      newProperties.push(row);
    }
  }
  
  return newProperties;
}

/**
 * Extract recipient information from property data
 * @param {Array} property - Property row data
 * @return {Object} Recipient data with email and name
 */
function extractRecipientInfo(property) {
  var recipient = {
    email: '',
    name: ''
  };
  
  // Try to extract from Seller column (Column F) or other fields
  var sellerInfo = property[5] || ''; // Column F: Seller
  
  // Look for email pattern in seller info
  var emailMatch = sellerInfo.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    recipient.email = emailMatch[0];
  }
  
  // Extract name (remove email if present)
  recipient.name = sellerInfo.replace(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/, '').trim();
  
  // If no email found, try to construct from property URL
  // This is a placeholder - real implementation would need to scrape contact info
  if (!recipient.email && property[6]) { // Column G: URL
    // For now, return empty - would need to scrape listing page for contact info
    // In real implementation, you might scrape the listing page to find agent email
  }
  
  return recipient;
}

/**
 * Send initial outreach email
 * @param {Array} property - Property row data
 * @param {Object} recipientData - Recipient data
 * @param {Number} offerAmount - Offer amount
 * @return {Object} Result object
 */
function sendInitialOutreachEmail(property, recipientData, offerAmount) {
  try {
    var propertyData = {
      address: property[1], // Column B: Address
      price: property[3], // Column D: Price
      acreage: property[4], // Column E: Acreage
      daysOnMarket: property[11] || 0 // Column L: Days on Market
    };
    
    var htmlBody = generateEmailHTML('initial', propertyData, recipientData, offerAmount);
    var subject = generateEmailSubject('initial', propertyData);
    
    // Send email via Gmail API for better tracking
    try {
      var gmailMessage = GmailApp.sendEmail(
        recipientData.email,
        subject,
        '',
        {
          htmlBody: htmlBody,
          replyTo: getUserContactInfo().YOUR_EMAIL,
          name: getUserContactInfo().YOUR_NAME
        }
      );
      
      return {
        success: true,
        messageId: gmailMessage.getId(),
        threadId: gmailMessage.getThread().getId(),
        subject: subject
      };
      
    } catch (gmailError) {
      // Fall back to MailApp
      Logger.log('Gmail API failed, using MailApp: ' + gmailError.toString());
      
      MailApp.sendEmail({
        to: recipientData.email,
        subject: subject,
        htmlBody: htmlBody,
        replyTo: getUserContactInfo().YOUR_EMAIL,
        name: getUserContactInfo().YOUR_NAME
      });
      
      return {
        success: true,
        messageId: Utilities.getUuid(), // Generate UUID as message ID
        threadId: '',
        subject: subject
      };
    }
    
  } catch (error) {
    Logger.log('Error sending initial outreach email: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

