/**
 * SheetInitializer.gs
 * Automatically creates and configures all Google Sheets for LandFlow AI
 * 
 * RUN THIS ONCE AFTER CREATING A NEW GOOGLE SHEET
 * It will create all 6 sheet tabs with proper columns, formulas, and formatting
 */

/**
 * Main initialization function - creates all sheets
 */
function initializeAllSheets() {
  Logger.log('Starting sheet initialization...');
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('No active spreadsheet. Please open a Google Sheet first.');
  }
  
  try {
    // Set spreadsheet ID for other scripts
    var spreadsheetId = spreadsheet.getId();
    ScraperConfig.setSpreadsheetId(spreadsheetId);
    Logger.log('Spreadsheet ID set: ' + spreadsheetId);
    
    // Create all sheets
    createPropertiesSheet(spreadsheet);
    createEmailsSheet(spreadsheet);
    createRepliesSheet(spreadsheet);
    createBuyersSheet(spreadsheet);
    createDealsSheet(spreadsheet);
    createDashboardSheet(spreadsheet);
    
    Logger.log('All sheets initialized successfully!');
    return { success: true, spreadsheetId: spreadsheetId };
    
  } catch (error) {
    Logger.log('Error initializing sheets: ' + error.toString());
    throw error;
  }
}

/**
 * Create Properties sheet
 */
function createPropertiesSheet(spreadsheet) {
  var sheetName = 'Properties';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  
  // Clear existing data
  sheet.clear();
  
  // Headers
  var headers = [
    'ID', 'Address', 'County', 'Price', 'Acreage', 'Seller', 'URL', 
    'Contacted', 'Offer Sent', 'Offer Amount', 'Status', 
    'Days on Market', 'Listing Date', 'Source', 'Last Updated'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 120);  // ID
  sheet.setColumnWidth(2, 250); // Address
  sheet.setColumnWidth(3, 120);  // County
  sheet.setColumnWidth(4, 100); // Price
  sheet.setColumnWidth(5, 80);   // Acreage
  sheet.setColumnWidth(6, 150);  // Seller
  sheet.setColumnWidth(7, 300);  // URL
  sheet.setColumnWidth(8, 80);   // Contacted
  sheet.setColumnWidth(9, 100);  // Offer Sent
  sheet.setColumnWidth(10, 110); // Offer Amount
  sheet.setColumnWidth(11, 120); // Status
  sheet.setColumnWidth(12, 120); // Days on Market
  sheet.setColumnWidth(13, 110); // Listing Date
  sheet.setColumnWidth(14, 100); // Source
  sheet.setColumnWidth(15, 150); // Last Updated
  
  // Data validation for Status column (K)
  var statusRange = sheet.getRange(2, 11, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'Contacted', 'Offer Sent', 'Response Received', 'Under Review', 'Dormant', 'Under Contract', 'Closed'])
    .build();
  statusRange.setDataValidation(statusRule);
  
  // Conditional formatting
  // New properties - Green
  var newRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('K:K')])
    .whenFormulaSatisfied('=$K2="New"')
    .setBackground('#C8E6C9')
    .build();
  
  // Offer Sent - Yellow
  var offerSentRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('K:K')])
    .whenFormulaSatisfied('=$K2="Offer Sent"')
    .setBackground('#FFF9C4')
    .build();
  
  // Response Received - Blue
  var responseRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('K:K')])
    .whenFormulaSatisfied('=$K2="Response Received"')
    .setBackground('#BBDEFB')
    .build();
  
  // Under Review - Orange
  var reviewRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('K:K')])
    .whenFormulaSatisfied('=$K2="Under Review"')
    .setBackground('#FFE0B2')
    .build();
  
  // Dormant - Gray
  var dormantRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('K:K')])
    .whenFormulaSatisfied('=$K2="Dormant"')
    .setBackground('#E0E0E0')
    .build();
  
  sheet.setConditionalFormatRules([
    newRule, offerSentRule, responseRule, reviewRule, dormantRule
  ]);
  
  // Format columns
  sheet.getRange('D:D').setNumberFormat('$#,##0'); // Price
  sheet.getRange('E:E').setNumberFormat('0.00');   // Acreage
  sheet.getRange('I:I').setNumberFormat('mm/dd/yyyy'); // Offer Sent
  sheet.getRange('J:J').setNumberFormat('$#,##0'); // Offer Amount
  sheet.getRange('M:M').setNumberFormat('mm/dd/yyyy'); // Listing Date
  sheet.getRange('O:O').setNumberFormat('mm/dd/yyyy hh:mm:ss'); // Last Updated
  
  Logger.log('Properties sheet created');
}

/**
 * Create Emails sheet
 */
function createEmailsSheet(spreadsheet) {
  var sheetName = 'Emails';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  
  sheet.clear();
  
  var headers = [
    'Property ID', 'Agent Email', 'Agent Name', 'Subject', 'Status', 
    'Timestamp', 'Message ID', 'Thread ID', 'Follow Up Date', 
    'Follow Up Count', 'Email Type'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#34A853');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  // Column widths
  sheet.setColumnWidth(1, 120);  // Property ID
  sheet.setColumnWidth(2, 200); // Agent Email
  sheet.setColumnWidth(3, 150); // Agent Name
  sheet.setColumnWidth(4, 300); // Subject
  sheet.setColumnWidth(5, 100); // Status
  sheet.setColumnWidth(6, 150);  // Timestamp
  sheet.setColumnWidth(7, 200); // Message ID
  sheet.setColumnWidth(8, 200); // Thread ID
  sheet.setColumnWidth(9, 120); // Follow Up Date
  sheet.setColumnWidth(10, 120); // Follow Up Count
  sheet.setColumnWidth(11, 120); // Email Type
  
  // Data validation
  var statusRange = sheet.getRange(2, 5, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Draft', 'Sent', 'Delivered', 'Opened', 'Replied'])
    .build();
  statusRange.setDataValidation(statusRule);
  
  var typeRange = sheet.getRange(2, 11, 1000, 1);
  var typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Initial', 'Follow-up', 'Counteroffer', 'Confirmation'])
    .build();
  typeRange.setDataValidation(typeRule);
  
  // Format columns
  sheet.getRange('F:F').setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange('I:I').setNumberFormat('mm/dd/yyyy');
  
  Logger.log('Emails sheet created');
}

/**
 * Create Replies sheet
 */
function createRepliesSheet(spreadsheet) {
  var sheetName = 'Replies';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  
  sheet.clear();
  
  var headers = [
    'Property ID', 'Email Thread ID', 'Reply Timestamp', 'Sentiment', 
    'Reply Type', 'AI Confidence', 'Original Offer', 'Counteroffer Amount', 
    'Notes', 'Next Action', 'Action Taken', 'Handler Status'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#EA4335');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  // Column widths
  sheet.setColumnWidth(1, 120);  // Property ID
  sheet.setColumnWidth(2, 200); // Thread ID
  sheet.setColumnWidth(3, 150); // Reply Timestamp
  sheet.setColumnWidth(4, 120); // Sentiment
  sheet.setColumnWidth(5, 120); // Reply Type
  sheet.setColumnWidth(6, 100); // AI Confidence
  sheet.setColumnWidth(7, 110); // Original Offer
  sheet.setColumnWidth(8, 130); // Counteroffer Amount
  sheet.setColumnWidth(9, 400); // Notes
  sheet.setColumnWidth(10, 200); // Next Action
  sheet.setColumnWidth(11, 100); // Action Taken
  sheet.setColumnWidth(12, 120); // Handler Status
  
  // Data validation
  var sentimentRange = sheet.getRange(2, 4, 1000, 1);
  var sentimentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Interested', 'Counteroffer', 'Not Interested', 'Spam', 'Neutral'])
    .build();
  sentimentRange.setDataValidation(sentimentRule);
  
  var typeRange = sheet.getRange(2, 5, 1000, 1);
  var typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Acceptance', 'Counteroffer', 'Rejection', 'Question', 'Unclear'])
    .build();
  typeRange.setDataValidation(typeRule);
  
  var statusRange = sheet.getRange(2, 12, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Processed', 'Follow-up Sent', 'Marked Dormant'])
    .build();
  statusRange.setDataValidation(statusRule);
  
  // Format columns
  sheet.getRange('C:C').setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange('F:F').setNumberFormat('0%'); // Confidence as percentage
  sheet.getRange('G:G').setNumberFormat('$#,##0');
  sheet.getRange('H:H').setNumberFormat('$#,##0');
  
  Logger.log('Replies sheet created');
}

/**
 * Create Buyers sheet
 */
function createBuyersSheet(spreadsheet) {
  var sheetName = 'Buyers';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  
  sheet.clear();
  
  var headers = [
    'Company', 'Contact Name', 'Email', 'Phone', 'Location', 
    'Lot Size Min', 'Lot Size Max', 'Price Range Min', 'Price Range Max', 
    'Property Match', 'Contacted', 'Last Contact', 'Response', 'Notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#FBBC04');
  headerRange.setFontColor('#000000');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  // Column widths
  sheet.setColumnWidth(1, 150); // Company
  sheet.setColumnWidth(2, 150); // Contact Name
  sheet.setColumnWidth(3, 200); // Email
  sheet.setColumnWidth(4, 120); // Phone
  sheet.setColumnWidth(5, 250); // Location
  sheet.setColumnWidth(6, 100); // Lot Size Min
  sheet.setColumnWidth(7, 100); // Lot Size Max
  sheet.setColumnWidth(8, 120); // Price Range Min
  sheet.setColumnWidth(9, 120); // Price Range Max
  sheet.setColumnWidth(10, 200); // Property Match
  sheet.setColumnWidth(11, 100); // Contacted
  sheet.setColumnWidth(12, 110); // Last Contact
  sheet.setColumnWidth(13, 120); // Response
  sheet.setColumnWidth(14, 300); // Notes
  
  // Data validation
  var responseRange = sheet.getRange(2, 13, 1000, 1);
  var responseRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['No Reply', 'Interested', 'Not Interested', 'Under Review'])
    .build();
  responseRange.setDataValidation(responseRule);
  
  // Format columns
  sheet.getRange('F:F').setNumberFormat('0.00'); // Lot Size Min
  sheet.getRange('G:G').setNumberFormat('0.00'); // Lot Size Max
  sheet.getRange('H:H').setNumberFormat('$#,##0'); // Price Range Min
  sheet.getRange('I:I').setNumberFormat('$#,##0'); // Price Range Max
  sheet.getRange('K:K').setNumberFormat('mm/dd/yyyy'); // Contacted
  sheet.getRange('L:L').setNumberFormat('mm/dd/yyyy'); // Last Contact
  
  Logger.log('Buyers sheet created');
}

/**
 * Create Deals sheet
 */
function createDealsSheet(spreadsheet) {
  var sheetName = 'Deals';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  
  sheet.clear();
  
  var headers = [
    'Deal ID', 'Property ID', 'Property Address', 'Seller Offer', 'Buyer Offer', 
    'Profit', 'Profit Margin', 'Close Date', 'Status', 'Buyer Company', 
    'Seller Name', 'Contract Date', 'Days to Close', 'Notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#9C27B0');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  // Column widths
  sheet.setColumnWidth(1, 120);  // Deal ID
  sheet.setColumnWidth(2, 120);  // Property ID
  sheet.setColumnWidth(3, 250);  // Property Address
  sheet.setColumnWidth(4, 110);  // Seller Offer
  sheet.setColumnWidth(5, 110);  // Buyer Offer
  sheet.setColumnWidth(6, 100);  // Profit
  sheet.setColumnWidth(7, 100);  // Profit Margin
  sheet.setColumnWidth(8, 100);  // Close Date
  sheet.setColumnWidth(9, 120);  // Status
  sheet.setColumnWidth(10, 150); // Buyer Company
  sheet.setColumnWidth(11, 150); // Seller Name
  sheet.setColumnWidth(12, 110); // Contract Date
  sheet.setColumnWidth(13, 100); // Days to Close
  sheet.setColumnWidth(14, 300); // Notes
  
  // Data validation
  var statusRange = sheet.getRange(2, 9, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Under Contract', 'In Escrow', 'Closed', 'Cancelled'])
    .build();
  statusRange.setDataValidation(statusRule);
  
  // Formulas for profit calculation (row 2 as example)
  // Profit = Buyer Offer - Seller Offer
  sheet.getRange(2, 6).setFormula('=IF(AND(D2>0,E2>0),E2-D2,"")');
  // Profit Margin = Profit / Seller Offer
  sheet.getRange(2, 7).setFormula('=IF(D2>0,F2/D2,"")');
  // Days to Close = Close Date - Contract Date
  sheet.getRange(2, 13).setFormula('=IF(AND(L2<>"",H2<>""),H2-L2,"")');
  
  // Format columns
  sheet.getRange('D:D').setNumberFormat('$#,##0'); // Seller Offer
  sheet.getRange('E:E').setNumberFormat('$#,##0'); // Buyer Offer
  sheet.getRange('F:F').setNumberFormat('$#,##0'); // Profit
  sheet.getRange('G:G').setNumberFormat('0.00%');  // Profit Margin
  sheet.getRange('H:H').setNumberFormat('mm/dd/yyyy'); // Close Date
  sheet.getRange('L:L').setNumberFormat('mm/dd/yyyy'); // Contract Date
  
  Logger.log('Deals sheet created');
}

/**
 * Create Performance Dashboard sheet
 */
function createDashboardSheet(spreadsheet) {
  var sheetName = 'Performance Dashboard';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  
  sheet.clear();
  
  // Key Metrics Section
  sheet.getRange(1, 1, 1, 4).merge().setValue('PERFORMANCE METRICS').setFontWeight('bold').setFontSize(14).setBackground('#4285F4').setFontColor('#FFFFFF');
  
  var metrics = [
    ['Total Offers Made', '=COUNTA(Emails!A:A)-1'],
    ['Total Responses', '=COUNTIF(Replies!D:D,"Interested")+COUNTIF(Replies!D:D,"Counteroffer")'],
    ['Response Rate', '=IF(A3>0,A4/A3,0)'],
    ['Offers to Close Ratio', '=IF(A3>0,COUNTIF(Deals!I:I,"Closed")/A3,0)'],
    ['Average Profit per Deal', '=IFERROR(AVERAGEIF(Deals!I:I,"Closed",Deals!F:F),0)'],
    ['Monthly Profit Total', '=SUMIFS(Deals!F:F,Deals!I:I,"Closed",Deals!H:H,">="&EOMONTH(TODAY(),-1)+1,Deals!H:H,"<="&EOMONTH(TODAY(),0))'],
    ['Deals Closed This Month', '=COUNTIFS(Deals!I:I,"Closed",Deals!H:H,">="&EOMONTH(TODAY(),-1)+1,Deals!H:H,"<="&EOMONTH(TODAY(),0))'],
    ['Total Profit (All Time)', '=SUMIF(Deals!I:I,"Closed",Deals!F:F)']
  ];
  
  for (var i = 0; i < metrics.length; i++) {
    sheet.getRange(i + 3, 1).setValue(metrics[i][0]).setFontWeight('bold');
    sheet.getRange(i + 3, 2).setFormula(metrics[i][1]);
  }
  
  // Format metrics
  sheet.getRange('C:C').setNumberFormat('$#,##0'); // Profit columns
  sheet.getRange('C5').setNumberFormat('$#,##0'); // Avg Profit
  sheet.getRange('C6').setNumberFormat('$#,##0'); // Monthly Profit
  sheet.getRange('C8').setNumberFormat('$#,##0'); // Total Profit
  sheet.getRange('C3').setNumberFormat('0'); // Total Offers
  sheet.getRange('C4').setNumberFormat('0'); // Total Responses
  sheet.getRange('C5').setNumberFormat('$#,##0'); // Avg Profit
  sheet.getRange('C7').setNumberFormat('0'); // Deals Closed
  sheet.getRange('C3:C4').setNumberFormat('0.00%'); // Response Rate and Ratio
  
  // Pipeline Status Section
  sheet.getRange(12, 1, 1, 3).merge().setValue('PIPELINE STATUS').setFontWeight('bold').setFontSize(14).setBackground('#4285F4').setFontColor('#FFFFFF');
  
  var pipeline = [
    ['New Properties', '=COUNTIF(Properties!K:K,"New")'],
    ['Offers Sent', '=COUNTIF(Properties!K:K,"Offer Sent")'],
    ['Under Review', '=COUNTIF(Properties!K:K,"Under Review")'],
    ['Under Contract', '=COUNTIF(Properties!K:K,"Under Contract")'],
    ['Dormant', '=COUNTIF(Properties!K:K,"Dormant")']
  ];
  
  for (var j = 0; j < pipeline.length; j++) {
    sheet.getRange(j + 14, 1).setValue(pipeline[j][0]).setFontWeight('bold');
    sheet.getRange(j + 14, 2).setFormula(pipeline[j][1]);
  }
  
  // Response Breakdown Section
  sheet.getRange(22, 1, 1, 2).merge().setValue('RESPONSE BREAKDOWN').setFontWeight('bold').setFontSize(14).setBackground('#4285F4').setFontColor('#FFFFFF');
  
  var responses = [
    ['Interested', '=COUNTIF(Replies!D:D,"Interested")'],
    ['Counteroffers', '=COUNTIF(Replies!D:D,"Counteroffer")'],
    ['Not Interested', '=COUNTIF(Replies!D:D,"Not Interested")'],
    ['Spam', '=COUNTIF(Replies!D:D,"Spam")']
  ];
  
  for (var k = 0; k < responses.length; k++) {
    sheet.getRange(k + 24, 1).setValue(responses[k][0]).setFontWeight('bold');
    sheet.getRange(k + 24, 2).setFormula(responses[k][1]);
  }
  
  // Set column widths
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 150);
  
  Logger.log('Dashboard sheet created');
}

/**
 * Helper: Get or create sheet
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log('Created new sheet: ' + sheetName);
  } else {
    Logger.log('Using existing sheet: ' + sheetName);
  }
  return sheet;
}

/**
 * Test function to verify sheets are set up correctly
 */
function verifySheetsSetup() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var requiredSheets = ['Properties', 'Emails', 'Replies', 'Buyers', 'Deals', 'Performance Dashboard'];
  var missingSheets = [];
  
  for (var i = 0; i < requiredSheets.length; i++) {
    var sheet = spreadsheet.getSheetByName(requiredSheets[i]);
    if (!sheet) {
      missingSheets.push(requiredSheets[i]);
    }
  }
  
  if (missingSheets.length > 0) {
    Logger.log('Missing sheets: ' + missingSheets.join(', '));
    return { success: false, missing: missingSheets };
  }
  
  Logger.log('All sheets verified!');
  return { success: true };
}

