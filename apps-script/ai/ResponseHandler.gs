/**
 * ResponseHandler.gs
 * Handles classified replies and triggers appropriate workflows
 */

/**
 * Handle classified reply and trigger appropriate action
 * @param {Object} replyData - Reply data object
 * @param {Object} classification - AI classification result
 */
function handleClassifiedReply(replyData, classification) {
  Logger.log('Handling classified reply for property: ' + replyData.propertyId);
  Logger.log('Sentiment: ' + classification.sentiment + ', Type: ' + classification.replyType);
  
  var sentiment = classification.sentiment;
  var replyType = classification.replyType;
  
  // Mark email as processed
  if (replyData.messageId) {
    markEmailAsProcessed(replyData.messageId);
  }
  
  // Update property status
  var propertyData = getPropertyById(replyData.propertyId);
  if (!propertyData) {
    Logger.log('Property not found: ' + replyData.propertyId);
    return;
  }
  
  // Handle based on sentiment
  if (sentiment === 'Interested') {
    handleInterestedReply(replyData, classification, propertyData);
  } else if (sentiment === 'Counteroffer') {
    handleCounterofferReply(replyData, classification, propertyData);
  } else if (sentiment === 'Not Interested') {
    handleNotInterestedReply(replyData, classification, propertyData);
  } else if (sentiment === 'Spam') {
    handleSpamReply(replyData, classification, propertyData);
  } else {
    // Neutral - mark for manual review
    updatePropertyStatus(replyData.propertyId, 'Under Review');
    updateReplyStatus(replyData.propertyId, replyData.threadId, 'Pending');
  }
}

/**
 * Handle interested reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleInterestedReply(replyData, classification, propertyData) {
  Logger.log('Processing interested reply');
  
  // Update property status
  updatePropertyStatus(replyData.propertyId, 'Response Received');
  
  // Update reply status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');
  
  // Send confirmation email
  try {
    var recipientData = {
      email: replyData.senderEmail,
      name: replyData.senderName
    };
    
    var offerAmount = classification.counterofferAmount > 0 
      ? classification.counterofferAmount 
      : getPropertyOfferAmount(replyData.propertyId);
    
    var htmlBody = generateEmailHTML('confirmation', propertyData, recipientData, offerAmount);
    var subject = generateEmailSubject('confirmation', propertyData);
    
    // Send confirmation email
    if (replyData.threadId) {
      var gmailMessage = GmailApp.sendEmail(
        recipientData.email,
        'Re: ' + subject,
        '',
        {
          htmlBody: htmlBody,
          replyTo: getUserContactInfo().YOUR_EMAIL
        }
      );
      
      // Log confirmation email
      logEmail(
        replyData.propertyId,
        recipientData.email,
        recipientData.name,
        'Re: ' + subject,
        'Sent',
        gmailMessage.getId(),
        replyData.threadId,
        'Confirmation'
      );
    }
    
  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.toString());
  }
}

/**
 * Handle counteroffer reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleCounterofferReply(replyData, classification, propertyData) {
  Logger.log('Processing counteroffer reply');
  
  // Update property status
  updatePropertyStatus(replyData.propertyId, 'Under Review');
  
  // Update reply status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');
  
  // Generate new offer if counteroffer is reasonable
  var counterofferAmount = classification.counterofferAmount || 0;
  var listingPrice = propertyData[3] || 0; // Column D: Price
  
  if (counterofferAmount > 0 && counterofferAmount < listingPrice) {
    // Counteroffer is valid - generate response offer
    var newOffer = generateCounterofferResponse(counterofferAmount, listingPrice);
    
    if (newOffer > 0) {
      // Send counteroffer response
      sendCounterofferResponse(replyData, propertyData, newOffer, counterofferAmount);
    }
  }
}

/**
 * Handle not interested reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleNotInterestedReply(replyData, classification, propertyData) {
  Logger.log('Processing not interested reply');
  
  // Mark property as dormant
  updatePropertyStatus(replyData.propertyId, 'Dormant');
  
  // Update reply status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');
}

/**
 * Handle spam reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleSpamReply(replyData, classification, propertyData) {
  Logger.log('Processing spam reply');
  
  // Mark reply as processed but don't change property status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');
  
  // Optionally add spam label to email
  try {
    if (replyData.messageId) {
      var message = GmailApp.getMessageById(replyData.messageId);
      message.addLabel(GmailApp.getUserLabelByName('SPAM') || GmailApp.createLabel('SPAM'));
    }
  } catch (error) {
    // Label doesn't exist or other error - ignore
  }
}

/**
 * Generate counteroffer response amount
 * @param {Number} sellerCounteroffer - Seller's counteroffer
 * @param {Number} listingPrice - Original listing price
 * @return {Number} New offer amount
 */
function generateCounterofferResponse(sellerCounteroffer, listingPrice) {
  // Strategy: meet somewhere between original offer and seller counteroffer
  // Or if counteroffer is reasonable, accept it
  
  var originalOfferRange = {
    min: listingPrice * 0.70,
    max: listingPrice * 0.80
  };
  
  // If counteroffer is within our max range, consider accepting
  if (sellerCounteroffer <= listingPrice * 0.85) {
    // Return counteroffer or slightly below
    return Math.round(sellerCounteroffer * 0.98 / 1000) * 1000; // 2% below counteroffer, rounded
  }
  
  // Counteroffer too high - generate new offer
  var middlePoint = (originalOfferRange.max + sellerCounteroffer) / 2;
  return Math.round(middlePoint / 1000) * 1000; // Round to nearest $1000
}

/**
 * Send counteroffer response email
 * @param {Object} replyData - Reply data
 * @param {Array} propertyData - Property data
 * @param {Number} newOffer - New offer amount
 * @param {Number} sellerCounteroffer - Seller's counteroffer
 */
function sendCounterofferResponse(replyData, propertyData, newOffer, sellerCounteroffer) {
  try {
    var recipientData = {
      email: replyData.senderEmail,
      name: replyData.senderName
    };
    
    var htmlBody = generateEmailHTML('counteroffer', propertyData, recipientData, newOffer);
    var subject = generateEmailSubject('counteroffer', propertyData);
    
    if (replyData.threadId) {
      var gmailMessage = GmailApp.sendEmail(
        recipientData.email,
        'Re: ' + subject,
        '',
        {
          htmlBody: htmlBody,
          replyTo: getUserContactInfo().YOUR_EMAIL
        }
      );
      
      // Log counteroffer email
      logEmail(
        replyData.propertyId,
        recipientData.email,
        recipientData.name,
        'Re: ' + subject,
        'Sent',
        gmailMessage.getId(),
        replyData.threadId,
        'Counteroffer'
      );
      
      // Update offer amount in Properties sheet
      var spreadsheetId = getSpreadsheetId();
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName('Properties');
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] === replyData.propertyId) {
          sheet.getRange(i + 1, 10).setValue(newOffer); // Column J: Offer Amount
          break;
        }
      }
    }
    
  } catch (error) {
    Logger.log('Error sending counteroffer response: ' + error.toString());
  }
}

