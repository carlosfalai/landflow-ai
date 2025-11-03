/**
 * SIMPLE SETUP - Copy this entire file into Google Apps Script
 * 
 * STEPS:
 * 1. In your Google Sheet: Extensions → Apps Script
 * 2. DELETE all existing code
 * 3. PASTE this entire file
 * 4. Click Save
 * 5. Run: setupEverything()
 * 6. Authorize when prompted
 * 
 * That's it! Your Spreadsheet ID is already set below.
 */

// YOUR SPREADSHEET ID (already filled in)
var SPREADSHEET_ID = '1fyaRw-vDTYO-LV8PlDGRqx8WScy_8PpmYCkKgGmXCa4';

/**
 * MAIN SETUP FUNCTION - Run this once!
 */
function setupEverything() {
  Logger.log('Setting up LandFlow AI...');
  
  try {
    // 1. Set Spreadsheet ID
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet ID set');
    
    // 2. Set default contact info (CHANGE THESE!)
    PropertiesService.getScriptProperties().setProperty('YOUR_NAME', 'Land Acquisition Team');
    PropertiesService.getScriptProperties().setProperty('YOUR_COMPANY', 'LandFlow AI');
    PropertiesService.getScriptProperties().setProperty('YOUR_EMAIL', Session.getActiveUser().getEmail());
    PropertiesService.getScriptProperties().setProperty('YOUR_PHONE', '');
    Logger.log('✅ Contact info set');
    
    // 3. Test Gmail access
    try {
      GmailApp.getInboxThreads(0, 1);
      Logger.log('✅ Gmail access OK');
    } catch (e) {
      Logger.log('⚠️ Gmail needs authorization - run any Gmail function to authorize');
    }
    
    // 4. Initialize buyer database (if function exists)
    try {
      initializeBuyerDatabase();
      Logger.log('✅ Buyer database initialized');
    } catch (e) {
      Logger.log('⚠️ Buyer database function not found - add it later');
    }
    
    Logger.log('🎉 Setup complete!');
    Logger.log('');
    Logger.log('NEXT STEPS:');
    Logger.log('1. Set AI API key: run setupAI("openai", "your-key") or setupAI("claude", "your-key")');
    Logger.log('2. Customize contact info: run updateContactInfo()');
    Logger.log('3. Install triggers: run installTriggers()');
    
    SpreadsheetApp.getUi().alert('Setup Complete!\n\nNext: Set AI API key and install triggers.');
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Set AI API Key - Run this after getting your API key
 */
function setupAI(provider, apiKey) {
  if (!provider || !apiKey) {
    Logger.log('Usage: setupAI("openai", "your-key") or setupAI("claude", "your-key")');
    return;
  }
  
  PropertiesService.getScriptProperties().setProperty('AI_API_KEY', apiKey);
  PropertiesService.getScriptProperties().setProperty('AI_PROVIDER', provider.toLowerCase());
  Logger.log('✅ AI API configured: ' + provider);
  SpreadsheetApp.getUi().alert('AI API configured! Provider: ' + provider);
}

/**
 * Update your contact information
 */
function updateContactInfo() {
  var ui = SpreadsheetApp.getUi();
  
  var nameResponse = ui.prompt('Enter your name:', ui.ButtonSet.OK_CANCEL);
  if (nameResponse.getSelectedButton() !== ui.Button.OK) return;
  
  var companyResponse = ui.prompt('Enter your company:', ui.ButtonSet.OK_CANCEL);
  if (companyResponse.getSelectedButton() !== ui.Button.OK) return;
  
  var emailResponse = ui.prompt('Enter your email:', ui.ButtonSet.OK_CANCEL);
  if (emailResponse.getSelectedButton() !== ui.Button.OK) return;
  
  PropertiesService.getScriptProperties().setProperty('YOUR_NAME', nameResponse.getResponseText());
  PropertiesService.getScriptProperties().setProperty('YOUR_COMPANY', companyResponse.getResponseText());
  PropertiesService.getScriptProperties().setProperty('YOUR_EMAIL', emailResponse.getResponseText());
  
  Logger.log('✅ Contact info updated');
  ui.alert('Contact info updated!');
}

/**
 * Install automation triggers
 */
function installTriggers() {
  try {
    // Delete existing triggers
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    
    // Daily job (8 AM)
    ScriptApp.newTrigger('runDailyJob')
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .create();
    
    // Hourly reply processing
    ScriptApp.newTrigger('runHourlyJob')
      .timeBased()
      .everyHours(1)
      .create();
    
    Logger.log('✅ Triggers installed');
    SpreadsheetApp.getUi().alert('Automation triggers installed!\n\nDaily scraping: 8 AM\nReply processing: Every hour');
    
  } catch (error) {
    Logger.log('❌ Error installing triggers: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Test system - Run this to verify everything works
 */
function testSystem() {
  Logger.log('Testing system...');
  
  var props = PropertiesService.getScriptProperties();
  
  // Test 1: Spreadsheet ID
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (ssId) {
    try {
      SpreadsheetApp.openById(ssId);
      Logger.log('✅ Spreadsheet accessible');
    } catch (e) {
      Logger.log('❌ Spreadsheet error: ' + e);
    }
  } else {
    Logger.log('❌ Spreadsheet ID not set');
  }
  
  // Test 2: Gmail
  try {
    GmailApp.getInboxThreads(0, 1);
    Logger.log('✅ Gmail accessible');
  } catch (e) {
    Logger.log('⚠️ Gmail: ' + e.toString());
  }
  
  // Test 3: AI API
  var aiKey = props.getProperty('AI_API_KEY');
  Logger.log(aiKey ? '✅ AI API key set' : '⚠️ AI API key not set');
  
  // Test 4: Contact info
  var name = props.getProperty('YOUR_NAME');
  Logger.log(name ? '✅ Contact info set' : '⚠️ Contact info not set');
  
  Logger.log('Test complete! Check logs above.');
}

/**
 * Simple functions to get stored values (for other scripts to use)
 */
function getSpreadsheetId() {
  return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || SPREADSHEET_ID;
}

function getUserContactInfo() {
  var props = PropertiesService.getScriptProperties();
  return {
    YOUR_NAME: props.getProperty('YOUR_NAME') || 'Land Acquisition Team',
    YOUR_COMPANY: props.getProperty('YOUR_COMPANY') || 'LandFlow AI',
    YOUR_EMAIL: props.getProperty('YOUR_EMAIL') || Session.getActiveUser().getEmail(),
    YOUR_PHONE: props.getProperty('YOUR_PHONE') || ''
  };
}

/**
 * Placeholder functions (add full implementations later)
 */
function runDailyJob() {
  Logger.log('Daily job would run here - add scraper code');
}

function runHourlyJob() {
  Logger.log('Hourly job would run here - add reply processor code');
}

function initializeBuyerDatabase() {
  Logger.log('Buyer database initialization - add implementation');
}

