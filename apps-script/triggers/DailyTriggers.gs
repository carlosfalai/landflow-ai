/**
 * DailyTriggers.gs
 * Daily automation triggers
 */

/**
 * Daily job runner - runs property scraping and outreach
 * Schedule this to run daily (e.g., 8 AM)
 */
function runDailyJob() {
  Logger.log('Starting daily job at ' + new Date());
  
  try {
    // Step 1: Scrape new properties
    Logger.log('Step 1: Running property scrapers...');
    var scrapeResult = runPropertyScrapers();
    Logger.log('Scraping complete: ' + JSON.stringify(scrapeResult));
    
    // Step 2: Send outreach emails to new properties
    Logger.log('Step 2: Sending outreach emails...');
    var outreachResult = sendOutreachEmails();
    Logger.log('Outreach complete: ' + JSON.stringify(outreachResult));
    
    // Step 3: Process follow-up emails
    Logger.log('Step 3: Processing follow-up emails...');
    var followUpResult = processFollowUpEmails();
    Logger.log('Follow-up complete: ' + JSON.stringify(followUpResult));
    
    // Step 4: Refresh dashboard
    Logger.log('Step 4: Refreshing dashboard...');
    refreshDashboard();
    
    // Step 5: Send daily digest
    Logger.log('Step 5: Sending daily digest...');
    sendDailyDigest();
    
    Logger.log('Daily job completed successfully');
    
    return {
      success: true,
      scrape: scrapeResult,
      outreach: outreachResult,
      followUp: followUpResult
    };
    
  } catch (error) {
    Logger.log('Error in daily job: ' + error.toString());
    logError('DailyTriggers', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Match properties to buyers (runs daily)
 */
function runDailyBuyerMatching() {
  Logger.log('Running daily buyer matching at ' + new Date());
  
  try {
    var spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      Logger.log('Spreadsheet ID not set');
      return;
    }
    
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName('Properties');
    
    if (!sheet) {
      Logger.log('Properties sheet not found');
      return;
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    
    var matched = 0;
    
    // Find properties under contract
    for (var i = 1; i < values.length; i++) {
      var status = values[i][10]; // Column K: Status
      
      if (status === 'Under Contract') {
        var propertyId = values[i][0]; // Column A: Property ID
        var matchingBuyers = matchPropertyToBuyers(propertyId);
        
        if (matchingBuyers && matchingBuyers.length > 0) {
          matched++;
        }
      }
    }
    
    Logger.log('Buyer matching complete: ' + matched + ' properties matched');
    
  } catch (error) {
    Logger.log('Error in buyer matching: ' + error.toString());
    logError('DailyTriggers-BuyerMatching', error);
  }
}

