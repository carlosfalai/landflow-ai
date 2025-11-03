/**
 * BuyerOutreach.gs
 * Sends automated outreach emails to matched buyers
 */

/**
 * Send buyer outreach emails for properties under contract
 * Called when a property status changes to "Under Contract"
 */
function sendBuyerOutreachForProperty(propertyId) {
  Logger.log('Sending buyer outreach for property: ' + propertyId);
  
  var propertyData = getPropertyById(propertyId);
  if (!propertyData) {
    Logger.log('Property not found: ' + propertyId);
    return;
  }
  
  // Find matching buyers
  var matchingBuyers = findMatchingBuyers(propertyData);
  
  if (matchingBuyers.length === 0) {
    Logger.log('No matching buyers found for property: ' + propertyId);
    return;
  }
  
  var sent = 0;
  var errors = 0;
  
  for (var i = 0; i < matchingBuyers.length; i++) {
    var buyer = matchingBuyers[i];
    
    try {
      // Check if already contacted (within last 30 days)
      if (shouldContactBuyer(buyer)) {
        var result = sendBuyerEmail(propertyData, buyer);
        
        if (result.success) {
          // Update buyer record
          updateBuyerContact(buyer.rowIndex, propertyId);
          sent++;
          Logger.log('Buyer outreach sent to: ' + buyer.company);
          
          // Rate limiting
          Utilities.sleep(2000);
        } else {
          errors++;
        }
      } else {
        Logger.log('Skipping buyer (recently contacted): ' + buyer.company);
      }
      
    } catch (error) {
      Logger.log('Error sending buyer outreach: ' + error.toString());
      errors++;
    }
  }
  
  Logger.log('Buyer outreach complete: ' + sent + ' sent, ' + errors + ' errors');
  return {
    sent: sent,
    errors: errors,
    total: matchingBuyers.length
  };
}

/**
 * Check if buyer should be contacted
 * @param {Object} buyer - Buyer object
 * @return {Boolean} True if should contact
 */
function shouldContactBuyer(buyer) {
  // If never contacted, yes
  if (!buyer.lastContact) {
    return true;
  }
  
  // If contacted more than 30 days ago, yes
  var lastContact = new Date(buyer.lastContact);
  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return lastContact < thirtyDaysAgo;
}

/**
 * Send buyer outreach email
 * @param {Array} propertyData - Property row data
 * @param {Object} buyer - Buyer object
 * @return {Object} Result object
 */
function sendBuyerEmail(propertyData, buyer) {
  try {
    var address = propertyData[1] || ''; // Column B: Address
    var acreage = propertyData[4] || 0; // Column E: Acreage
    var price = propertyData[3] || 0; // Column D: Price
    var offerAmount = propertyData[9] || price; // Column J: Offer Amount
    
    var subject = 'Land Opportunity: ' + address + ' (' + acreage + ' acres)';
    
    var htmlBody = generateBuyerEmailHTML(propertyData, buyer, offerAmount);
    
    // Send email
    MailApp.sendEmail({
      to: buyer.email,
      subject: subject,
      htmlBody: htmlBody,
      replyTo: getUserContactInfo().YOUR_EMAIL,
      name: getUserContactInfo().YOUR_NAME
    });
    
    return {
      success: true,
      subject: subject
    };
    
  } catch (error) {
    Logger.log('Error sending buyer email: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate buyer email HTML
 * @param {Array} propertyData - Property row data
 * @param {Object} buyer - Buyer object
 * @param {Number} askingPrice - Asking price to buyer
 * @return {String} HTML email body
 */
function generateBuyerEmailHTML(propertyData, buyer, askingPrice) {
  var address = propertyData[1] || '';
  var acreage = propertyData[4] || 0;
  var county = propertyData[2] || '';
  var url = propertyData[6] || ''; // Column G: URL
  
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#2196F3;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.property-box{background-color:#fff;border:2px solid #2196F3;padding:15px;margin:20px 0;border-radius:5px}</style></head><body>';
  html += '<div class="header"><h2>Land Opportunity - ' + address + '</h2></div>';
  html += '<div class="content">';
  html += '<p>Hello ' + (buyer.contactName || buyer.company) + ',</p>';
  html += '<p>I have a land opportunity that may interest ' + buyer.company + '.</p>';
  html += '<div class="property-box">';
  html += '<h3>Property Details:</h3>';
  html += '<p><strong>Address:</strong> ' + address + '</p>';
  html += '<p><strong>County:</strong> ' + county + '</p>';
  html += '<p><strong>Acreage:</strong> ' + acreage + ' acres</p>';
  html += '<p><strong>Asking Price:</strong> ' + formatCurrency(askingPrice) + '</p>';
  if (url) {
    html += '<p><strong>Listing:</strong> <a href="' + url + '">View Listing</a></p>';
  }
  html += '</div>';
  html += '<p>This property is currently under contract and available for assignment. ';
  html += 'We can close quickly and are open to discussing terms.</p>';
  html += '<p>If this aligns with your acquisition criteria, please let me know and we can discuss further.</p>';
  html += '<p>Best regards,<br>' + getUserContactInfo().YOUR_NAME + '<br>' + getUserContactInfo().YOUR_COMPANY + '<br>' + getUserContactInfo().YOUR_EMAIL + '</p>';
  html += '</div></body></html>';
  
  return html;
}

/**
 * Update buyer contact record
 * @param {Number} rowIndex - Buyer row index (1-based)
 * @param {String} propertyId - Property ID
 */
function updateBuyerContact(rowIndex, propertyId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');
  
  if (!sheet) return;
  
  var now = new Date();
  
  // Update contacted date if first time
  var contactedDate = sheet.getRange(rowIndex, 11).getValue();
  if (!contactedDate) {
    sheet.getRange(rowIndex, 11).setValue(now); // Column K: Contacted
  }
  
  // Update last contact
  sheet.getRange(rowIndex, 12).setValue(now); // Column L: Last Contact
  
  // Update property match
  var currentMatches = sheet.getRange(rowIndex, 10).getValue() || '';
  var matches = currentMatches ? currentMatches.toString().split(',') : [];
  if (matches.indexOf(propertyId) < 0) {
    matches.push(propertyId);
    sheet.getRange(rowIndex, 10).setValue(matches.join(','));
  }
}

