/**
 * COPY AND PASTE THIS ENTIRE FILE INTO GOOGLE APPS SCRIPT
 * 
 * Steps:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. DELETE all existing code in Code.gs
 * 4. PASTE this entire file
 * 5. Click Save (Ctrl+S or Cmd+S)
 * 6. Select function: initializeAllSheets
 * 7. Click Run button
 * 8. Authorize when prompted
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
    var spreadsheetId = spreadsheet.getId();
    Logger.log('Spreadsheet ID: ' + spreadsheetId);
    
    createPropertiesSheet(spreadsheet);
    createEmailsSheet(spreadsheet);
    createRepliesSheet(spreadsheet);
    createBuyersSheet(spreadsheet);
    createDealsSheet(spreadsheet);
    createDashboardSheet(spreadsheet);
    
    Logger.log('All sheets initialized successfully!');
    SpreadsheetApp.getUi().alert('Success! All 6 sheets have been created. Check the tabs at the bottom of your spreadsheet.');
    return { success: true, spreadsheetId: spreadsheetId };
    
  } catch (error) {
    Logger.log('Error initializing sheets: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
    throw error;
  }
}

function createPropertiesSheet(spreadsheet) {
  var sheetName = 'Properties';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  sheet.clear();
  
  var headers = ['ID', 'Address', 'County', 'Price', 'Acreage', 'Seller', 'URL', 'Contacted', 'Offer Sent', 'Offer Amount', 'Status', 'Days on Market', 'Listing Date', 'Source', 'Last Updated'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 300);
  sheet.setColumnWidth(8, 80);
  sheet.setColumnWidth(9, 100);
  sheet.setColumnWidth(10, 110);
  sheet.setColumnWidth(11, 120);
  sheet.setColumnWidth(12, 120);
  sheet.setColumnWidth(13, 110);
  sheet.setColumnWidth(14, 100);
  sheet.setColumnWidth(15, 150);
  
  var statusRange = sheet.getRange(2, 11, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['New', 'Contacted', 'Offer Sent', 'Response Received', 'Under Review', 'Dormant', 'Under Contract', 'Closed']).build();
  statusRange.setDataValidation(statusRule);
  
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().setRanges([sheet.getRange('K:K')]).whenFormulaSatisfied('=$K2="New"').setBackground('#C8E6C9').build(),
    SpreadsheetApp.newConditionalFormatRule().setRanges([sheet.getRange('K:K')]).whenFormulaSatisfied('=$K2="Offer Sent"').setBackground('#FFF9C4').build(),
    SpreadsheetApp.newConditionalFormatRule().setRanges([sheet.getRange('K:K')]).whenFormulaSatisfied('=$K2="Response Received"').setBackground('#BBDEFB').build(),
    SpreadsheetApp.newConditionalFormatRule().setRanges([sheet.getRange('K:K')]).whenFormulaSatisfied('=$K2="Under Review"').setBackground('#FFE0B2').build(),
    SpreadsheetApp.newConditionalFormatRule().setRanges([sheet.getRange('K:K')]).whenFormulaSatisfied('=$K2="Dormant"').setBackground('#E0E0E0').build()
  ];
  sheet.setConditionalFormatRules(rules);
  
  sheet.getRange('D:D').setNumberFormat('$#,##0');
  sheet.getRange('E:E').setNumberFormat('0.00');
  sheet.getRange('I:I').setNumberFormat('mm/dd/yyyy');
  sheet.getRange('J:J').setNumberFormat('$#,##0');
  sheet.getRange('M:M').setNumberFormat('mm/dd/yyyy');
  sheet.getRange('O:O').setNumberFormat('mm/dd/yyyy hh:mm:ss');
}

function createEmailsSheet(spreadsheet) {
  var sheetName = 'Emails';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  sheet.clear();
  
  var headers = ['Property ID', 'Agent Email', 'Agent Name', 'Subject', 'Status', 'Timestamp', 'Message ID', 'Thread ID', 'Follow Up Date', 'Follow Up Count', 'Email Type'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#34A853');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 300);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 200);
  sheet.setColumnWidth(8, 200);
  sheet.setColumnWidth(9, 120);
  sheet.setColumnWidth(10, 120);
  sheet.setColumnWidth(11, 120);
  
  var statusRange = sheet.getRange(2, 5, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['Draft', 'Sent', 'Delivered', 'Opened', 'Replied']).build();
  statusRange.setDataValidation(statusRule);
  
  var typeRange = sheet.getRange(2, 11, 1000, 1);
  var typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['Initial', 'Follow-up', 'Counteroffer', 'Confirmation']).build();
  typeRange.setDataValidation(typeRule);
  
  sheet.getRange('F:F').setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange('I:I').setNumberFormat('mm/dd/yyyy');
}

function createRepliesSheet(spreadsheet) {
  var sheetName = 'Replies';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  sheet.clear();
  
  var headers = ['Property ID', 'Email Thread ID', 'Reply Timestamp', 'Sentiment', 'Reply Type', 'AI Confidence', 'Original Offer', 'Counteroffer Amount', 'Notes', 'Next Action', 'Action Taken', 'Handler Status'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#EA4335');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 110);
  sheet.setColumnWidth(8, 130);
  sheet.setColumnWidth(9, 400);
  sheet.setColumnWidth(10, 200);
  sheet.setColumnWidth(11, 100);
  sheet.setColumnWidth(12, 120);
  
  var sentimentRange = sheet.getRange(2, 4, 1000, 1);
  var sentimentRule = SpreadsheetApp.newDataValidation().requireValueInList(['Interested', 'Counteroffer', 'Not Interested', 'Spam', 'Neutral']).build();
  sentimentRange.setDataValidation(sentimentRule);
  
  var typeRange = sheet.getRange(2, 5, 1000, 1);
  var typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['Acceptance', 'Counteroffer', 'Rejection', 'Question', 'Unclear']).build();
  typeRange.setDataValidation(typeRule);
  
  var statusRange = sheet.getRange(2, 12, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['Pending', 'Processed', 'Follow-up Sent', 'Marked Dormant']).build();
  statusRange.setDataValidation(statusRule);
  
  sheet.getRange('C:C').setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange('F:F').setNumberFormat('0%');
  sheet.getRange('G:G').setNumberFormat('$#,##0');
  sheet.getRange('H:H').setNumberFormat('$#,##0');
}

function createBuyersSheet(spreadsheet) {
  var sheetName = 'Buyers';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  sheet.clear();
  
  var headers = ['Company', 'Contact Name', 'Email', 'Phone', 'Location', 'Lot Size Min', 'Lot Size Max', 'Price Range Min', 'Price Range Max', 'Property Match', 'Contacted', 'Last Contact', 'Response', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#FBBC04');
  headerRange.setFontColor('#000000');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 250);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 120);
  sheet.setColumnWidth(9, 120);
  sheet.setColumnWidth(10, 200);
  sheet.setColumnWidth(11, 100);
  sheet.setColumnWidth(12, 110);
  sheet.setColumnWidth(13, 120);
  sheet.setColumnWidth(14, 300);
  
  var responseRange = sheet.getRange(2, 13, 1000, 1);
  var responseRule = SpreadsheetApp.newDataValidation().requireValueInList(['No Reply', 'Interested', 'Not Interested', 'Under Review']).build();
  responseRange.setDataValidation(responseRule);
  
  sheet.getRange('F:F').setNumberFormat('0.00');
  sheet.getRange('G:G').setNumberFormat('0.00');
  sheet.getRange('H:H').setNumberFormat('$#,##0');
  sheet.getRange('I:I').setNumberFormat('$#,##0');
  sheet.getRange('K:K').setNumberFormat('mm/dd/yyyy');
  sheet.getRange('L:L').setNumberFormat('mm/dd/yyyy');
}

function createDealsSheet(spreadsheet) {
  var sheetName = 'Deals';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  sheet.clear();
  
  var headers = ['Deal ID', 'Property ID', 'Property Address', 'Seller Offer', 'Buyer Offer', 'Profit', 'Profit Margin', 'Close Date', 'Status', 'Buyer Company', 'Seller Name', 'Contract Date', 'Days to Close', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#9C27B0');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 120);
  sheet.setColumnWidth(10, 150);
  sheet.setColumnWidth(11, 150);
  sheet.setColumnWidth(12, 110);
  sheet.setColumnWidth(13, 100);
  sheet.setColumnWidth(14, 300);
  
  var statusRange = sheet.getRange(2, 9, 1000, 1);
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['Under Contract', 'In Escrow', 'Closed', 'Cancelled']).build();
  statusRange.setDataValidation(statusRule);
  
  sheet.getRange(2, 6).setFormula('=IF(AND(D2>0,E2>0),E2-D2,"")');
  sheet.getRange(2, 7).setFormula('=IF(D2>0,F2/D2,"")');
  sheet.getRange(2, 13).setFormula('=IF(AND(L2<>"",H2<>""),H2-L2,"")');
  
  sheet.getRange('D:D').setNumberFormat('$#,##0');
  sheet.getRange('E:E').setNumberFormat('$#,##0');
  sheet.getRange('F:F').setNumberFormat('$#,##0');
  sheet.getRange('G:G').setNumberFormat('0.00%');
  sheet.getRange('H:H').setNumberFormat('mm/dd/yyyy');
  sheet.getRange('L:L').setNumberFormat('mm/dd/yyyy');
}

function createDashboardSheet(spreadsheet) {
  var sheetName = 'Performance Dashboard';
  var sheet = getOrCreateSheet(spreadsheet, sheetName);
  sheet.clear();
  
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
  
  sheet.getRange('C5').setNumberFormat('$#,##0');
  sheet.getRange('C6').setNumberFormat('$#,##0');
  sheet.getRange('C8').setNumberFormat('$#,##0');
  sheet.getRange('C3').setNumberFormat('0');
  sheet.getRange('C4').setNumberFormat('0');
  sheet.getRange('C7').setNumberFormat('0');
  
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
  
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 150);
}

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

