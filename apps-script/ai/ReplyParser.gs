/**
 * ReplyParser.gs
 * Reads incoming email replies using Gmail API
 */

/**
 * Process incoming email replies
 * Called by hourly triggers
 */
function processIncomingReplies() {
  Logger.log('Starting reply processing at ' + new Date());
  
  try {
    // Get unprocessed replies
    var replies = getUnprocessedReplies();
    
    Logger.log('Found ' + replies.length + ' unprocessed replies');
    
    var processed = 0;
    var errors = 0;
    
    for (var i = 0; i < replies.length; i++) {
      var reply = replies[i];
      
      try {
        // Classify reply using AI
        var classification = classifyEmailReply(reply.body);
        
        // Log to Replies sheet
        logReply(
          reply.propertyId,
          reply.threadId,
          new Date(),
          classification.sentiment,
          classification.replyType,
          classification.confidence,
          reply.originalOffer || 0,
          classification.counterofferAmount || 0,
          classification.summary,
          classification.nextAction
        );
        
        // Update email status to "Replied"
        if (reply.messageId) {
          updateEmailStatus(reply.messageId, 'Replied');
        }
        
        // Handle response based on classification
        handleClassifiedReply(reply, classification);
        
        processed++;
        Logger.log('Processed reply for property: ' + reply.propertyId);
        
      } catch (error) {
        Logger.log('Error processing reply: ' + error.toString());
        logError('ReplyParser', error);
        errors++;
      }
    }
    
    Logger.log('Reply processing complete: ' + processed + ' processed, ' + errors + ' errors');
    return {
      processed: processed,
      errors: errors,
      total: replies.length
    };
    
  } catch (error) {
    Logger.log('Error in processIncomingReplies: ' + error.toString());
    logError('ReplyParser', error);
    return {
      processed: 0,
      errors: 1,
      total: 0
    };
  }
}

/**
 * Get unprocessed email replies from Gmail
 * @return {Array} Array of reply objects
 */
function getUnprocessedReplies() {
  var replies = [];
  
  try {
    // Search for emails that are replies to our sent emails
    // Look for emails with "Re:" in subject and sent to our email
    var ourEmail = getUserContactInfo().YOUR_EMAIL || Session.getActiveUser().getEmail();
    var query = 'in:inbox from:-me to:' + ourEmail + ' is:unread';
    
    var threads = GmailApp.search(query, 0, 50); // Limit to 50 threads
    
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var messages = thread.getMessages();
      
      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];
        
        // Check if this is a reply (has "Re:" in subject or is part of thread)
        if (message.isInInbox() && !message.isStarred()) {
          var replyData = extractReplyData(message, thread);
          
          if (replyData) {
            replies.push(replyData);
          }
        }
      }
    }
    
  } catch (error) {
    Logger.log('Error getting unprocessed replies: ' + error.toString());
  }
  
  return replies;
}

/**
 * Extract reply data from Gmail message
 * @param {GmailMessage} message - Gmail message object
 * @param {GmailThread} thread - Gmail thread object
 * @return {Object} Reply data object or null
 */
function extractReplyData(message, thread) {
  try {
    // Get thread ID
    var threadId = thread.getId();
    
    // Find corresponding email in Emails sheet
    var emailData = findEmailByThreadId(threadId);
    
    if (!emailData) {
      // Try to find by sender email
      var senderEmail = message.getFrom();
      emailData = findEmailByRecipient(senderEmail);
    }
    
    if (!emailData) {
      return null; // Can't match to a property
    }
    
    // Extract email body
    var body = message.getPlainBody();
    if (!body || body.trim() === '') {
      body = message.getBody();
      // Strip HTML tags if needed
      body = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    return {
      propertyId: emailData.propertyId,
      messageId: message.getId(),
      threadId: threadId,
      senderEmail: senderEmail,
      senderName: extractSenderName(message.getFrom()),
      subject: message.getSubject(),
      body: body,
      date: message.getDate(),
      originalOffer: emailData.offerAmount
    };
    
  } catch (error) {
    Logger.log('Error extracting reply data: ' + error.toString());
    return null;
  }
}

/**
 * Find email data by thread ID
 * @param {String} threadId - Gmail thread ID
 * @return {Object} Email data or null
 */
function findEmailByThreadId(threadId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return null;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find email with matching thread ID (Column H)
  for (var i = 1; i < values.length; i++) {
    if (values[i][7] === threadId) {
      return {
        propertyId: values[i][0],
        agentEmail: values[i][1],
        agentName: values[i][2],
        offerAmount: getPropertyOfferAmount(values[i][0])
      };
    }
  }
  
  return null;
}

/**
 * Find email data by recipient email
 * @param {String} recipientEmail - Recipient email address
 * @return {Object} Email data or null
 */
function findEmailByRecipient(recipientEmail) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return null;
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find most recent email to this recipient (Column B)
  for (var i = values.length - 1; i >= 1; i--) {
    if (values[i][1] === recipientEmail) {
      return {
        propertyId: values[i][0],
        agentEmail: values[i][1],
        agentName: values[i][2],
        offerAmount: getPropertyOfferAmount(values[i][0])
      };
    }
  }
  
  return null;
}

/**
 * Get property offer amount
 * @param {String} propertyId - Property ID
 * @return {Number} Offer amount
 */
function getPropertyOfferAmount(propertyId) {
  var propertyData = getPropertyById(propertyId);
  if (propertyData && propertyData[9]) {
    return parseFloat(propertyData[9]) || 0;
  }
  return 0;
}

/**
 * Extract sender name from email string
 * @param {String} fromString - Email "From" string (e.g., "John Doe <john@example.com>")
 * @return {String} Sender name
 */
function extractSenderName(fromString) {
  if (!fromString) return '';
  
  var match = fromString.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim().replace(/["']/g, '');
  }
  
  return fromString.split('@')[0];
}

/**
 * Mark email as processed (read)
 * @param {String} messageId - Gmail message ID
 */
function markEmailAsProcessed(messageId) {
  try {
    var message = GmailApp.getMessageById(messageId);
    message.markRead();
    message.removeLabel(GmailApp.getUserLabelByName('UNREAD'));
  } catch (error) {
    Logger.log('Error marking email as processed: ' + error.toString());
  }
}

