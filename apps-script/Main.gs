/**
 * Main.gs
 * Central orchestration script and entry points
 */

/**
 * Main initialization function
 * Run this once after setting up the Google Sheet
 */
function initializeLandFlowAI() {
  Logger.log('Initializing LandFlow AI...');
  
  try {
    // Step 1: Set spreadsheet ID (user must set this first)
    var spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      Logger.log('ERROR: Spreadsheet ID not set. Use ScraperConfig.setSpreadsheetId() first.');
      return;
    }
    
    // Step 2: Initialize buyer database
    Logger.log('Initializing buyer database...');
    initializeBuyerDatabase();
    
    // Step 3: Install triggers
    Logger.log('Installing triggers...');
    var triggerResult = installAllTriggers();
    
    Logger.log('LandFlow AI initialization complete!');
    Logger.log('Triggers installed: ' + triggerResult.success);
    
    return {
      success: true,
      spreadsheetId: spreadsheetId,
      triggersInstalled: triggerResult.success
    };
    
  } catch (error) {
    Logger.log('Error initializing LandFlow AI: ' + error.toString());
    logError('Main-Initialize', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test function - run all components manually
 */
function testSystem() {
  Logger.log('Running system test...');
  
  try {
    // Test 1: Config
    Logger.log('Test 1: Configuration');
    var config = getSearchParams();
    Logger.log('Search params: ' + JSON.stringify(config));
    
    // Test 2: Sheet access
    Logger.log('Test 2: Sheet access');
    var sheet = getPropertiesSheet();
    Logger.log('Properties sheet accessed: ' + (sheet ? 'OK' : 'FAIL'));
    
    // Test 3: Buyer database
    Logger.log('Test 3: Buyer database');
    var buyers = getAllBuyers();
    Logger.log('Buyers loaded: ' + buyers.length);
    
    // Test 4: Metrics
    Logger.log('Test 4: Metrics calculation');
    var metrics = calculateDashboardMetrics();
    Logger.log('Metrics calculated: ' + JSON.stringify(metrics));
    
    Logger.log('System test complete - all components OK');
    return { success: true };
    
  } catch (error) {
    Logger.log('System test failed: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Manual trigger for property scraping (for testing)
 */
function manualScrapeProperties() {
  Logger.log('Manual property scraping triggered');
  return runPropertyScrapers();
}

/**
 * Manual trigger for sending outreach (for testing)
 */
function manualSendOutreach() {
  Logger.log('Manual outreach triggered');
  return sendOutreachEmails();
}

/**
 * Manual trigger for processing replies (for testing)
 */
function manualProcessReplies() {
  Logger.log('Manual reply processing triggered');
  return processIncomingReplies();
}

