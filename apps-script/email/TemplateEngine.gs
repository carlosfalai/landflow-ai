/**
 * TemplateEngine.gs
 * Generates personalized email templates
 */

/**
 * Get email template content
 * @param {String} templateType - Template type ('initial' or 'follow-up')
 * @return {String} HTML template content
 */
function getEmailTemplate(templateType) {
  var templates = {
    'initial': getInitialTemplate(),
    'follow-up': getFollowUpTemplate(),
    'counteroffer': getCounterofferTemplate(),
    'confirmation': getConfirmationTemplate()
  };
  
  return templates[templateType] || templates['initial'];
}

/**
 * Get initial outreach template
 * @return {String} HTML template
 */
function getInitialTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#4CAF50;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.offer-box{background-color:#fff;border:2px solid #4CAF50;padding:15px;margin:20px 0;text-align:center;border-radius:5px}.offer-amount{font-size:28px;font-weight:bold;color:#4CAF50;margin:10px 0}.footer{background-color:#f0f0f0;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 5px 5px}</style></head><body><div class="header"><h2>Cash Offer for {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>I hope this email finds you well. I came across your listing for the vacant land at <strong>{{PROPERTY_ADDRESS}}</strong> and I\'m interested in making a cash offer.</p><p>We specialize in quick, hassle-free transactions and can close within 7-14 days if the terms work for both parties.</p><div class="offer-box"><p><strong>Our Cash Offer:</strong></p><div class="offer-amount">{{OFFER_AMOUNT}}</div><p style="font-size:12px;color:#666;">Cash • No Financing Contingencies • Quick Closing</p></div><p>I understand this is below the asking price of {{LISTING_PRICE}}, but we can offer:</p><ul><li>Cash transaction (no bank delays)</li><li>Fast closing (7-14 days)</li><li>As-is purchase (no inspections or contingencies)</li><li>No need for staging or showings</li></ul><p>Would you be open to discussing this offer? I\'m ready to move forward quickly if this works for your client.</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div><div class="footer"><p>This is an automated email. If you wish to unsubscribe, please reply with "UNSUBSCRIBE".</p></div></body></html>';
}

/**
 * Get follow-up template
 * @return {String} HTML template
 */
function getFollowUpTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#FF9800;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.offer-box{background-color:#fff;border:2px solid #FF9800;padding:15px;margin:20px 0;text-align:center;border-radius:5px}.offer-amount{font-size:28px;font-weight:bold;color:#FF9800;margin:10px 0}.footer{background-color:#f0f0f0;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 5px 5px}</style></head><body><div class="header"><h2>Following Up: Cash Offer for {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>I wanted to follow up on my previous email regarding the vacant land at <strong>{{PROPERTY_ADDRESS}}</strong>.</p><p>I\'m still very interested in this property and wanted to see if you\'ve had a chance to review our cash offer of <strong>{{OFFER_AMOUNT}}</strong>.</p><div class="offer-box"><p><strong>Our Cash Offer Remains:</strong></p><div class="offer-amount">{{OFFER_AMOUNT}}</div><p style="font-size:12px;color:#666;">Cash • No Financing Contingencies • Quick Closing</p></div><p>Please let me know if your client would like to counteroffer or if you need any additional information.</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div><div class="footer"><p>This is a follow-up email. If you wish to unsubscribe, please reply with "UNSUBSCRIBE".</p></div></body></html>';
}

/**
 * Get counteroffer template
 * @return {String} HTML template
 */
function getCounterofferTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#2196F3;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.offer-box{background-color:#fff;border:2px solid #2196F3;padding:15px;margin:20px 0;text-align:center;border-radius:5px}.offer-amount{font-size:28px;font-weight:bold;color:#2196F3;margin:10px 0}</style></head><body><div class="header"><h2>Revised Offer for {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>Thank you for your response. I appreciate you sharing your client\'s counteroffer.</p><p>After reviewing the terms, I\'d like to present a revised offer:</p><div class="offer-box"><p><strong>Our Revised Cash Offer:</strong></p><div class="offer-amount">{{OFFER_AMOUNT}}</div></div><p>This offer is based on [specific reasons - market conditions, property analysis, etc.]. We\'re still committed to a fast, cash closing.</p><p>I\'m confident we can find terms that work for both parties. Would you like to discuss?</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div></body></html>';
}

/**
 * Get confirmation template
 * @return {String} HTML template
 */
function getConfirmationTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#4CAF50;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}</style></head><body><div class="header"><h2>Next Steps - {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>Thank you for your interest in moving forward with our offer for <strong>{{PROPERTY_ADDRESS}}</strong>.</p><p>I\'m excited to work with you and your client to close this deal quickly.</p><p><strong>Next Steps:</strong></p><ol><li>I\'ll prepare the purchase agreement</li><li>You can review with your client</li><li>We\'ll schedule a closing date within 7-14 days</li><li>Cash funds will be ready at closing</li></ol><p>Please let me know the best way to proceed. I can send the agreement via email or coordinate with your preferred closing company.</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div></body></html>';
}

/**
 * Replace template variables with actual data
 * @param {String} template - Template HTML string
 * @param {Object} data - Data object with replacement values
 * @return {String} Processed HTML
 */
function processTemplate(template, data) {
  var processed = template;
  
  // Replace all template variables
  for (var key in data) {
    var placeholder = '{{' + key.toUpperCase() + '}}';
    var value = data[key] || '';
    processed = processed.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return processed;
}

/**
 * Get user contact information from Properties Service
 * @return {Object} User contact info
 */
function getUserContactInfo() {
  var properties = PropertiesService.getScriptProperties();
  
  return {
    YOUR_NAME: properties.getProperty('YOUR_NAME') || 'Land Acquisition Team',
    YOUR_COMPANY: properties.getProperty('YOUR_COMPANY') || 'LandFlow AI',
    YOUR_EMAIL: properties.getProperty('YOUR_EMAIL') || Session.getActiveUser().getEmail(),
    YOUR_PHONE: properties.getProperty('YOUR_PHONE') || ''
  };
}

/**
 * Generate personalized email HTML
 * @param {String} templateType - Template type
 * @param {Object} propertyData - Property data
 * @param {Object} recipientData - Recipient data (agent name, email)
 * @param {Number} offerAmount - Offer amount
 * @return {String} Complete HTML email
 */
function generateEmailHTML(templateType, propertyData, recipientData, offerAmount) {
  var template = getEmailTemplate(templateType);
  var userInfo = getUserContactInfo();
  
  var data = {
    PROPERTY_ADDRESS: propertyData.address || propertyData[1] || '',
    AGENT_NAME: recipientData.name || recipientData.agentName || 'Sir/Madam',
    OFFER_AMOUNT: formatCurrency(offerAmount),
    LISTING_PRICE: formatCurrency(propertyData.price || propertyData[3] || 0),
    YOUR_NAME: userInfo.YOUR_NAME,
    YOUR_COMPANY: userInfo.YOUR_COMPANY,
    YOUR_EMAIL: userInfo.YOUR_EMAIL,
    YOUR_PHONE: userInfo.YOUR_PHONE
  };
  
  return processTemplate(template, data);
}

/**
 * Generate email subject line
 * @param {String} templateType - Template type
 * @param {Object} propertyData - Property data
 * @return {String} Email subject
 */
function generateEmailSubject(templateType, propertyData) {
  var address = propertyData.address || propertyData[1] || 'Vacant Land';
  
  var subjects = {
    'initial': 'Cash Offer - ' + address,
    'follow-up': 'Following Up: Cash Offer - ' + address,
    'counteroffer': 'Revised Cash Offer - ' + address,
    'confirmation': 'Next Steps - ' + address
  };
  
  return subjects[templateType] || subjects['initial'];
}

