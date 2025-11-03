# Next Steps - What to Do Now

## ✅ Step 1: Verify Sheets (Just Check!)

1. Go back to your Google Sheet tab
2. You should see 6 tabs at the bottom:
   - ✅ Properties (blue headers)
   - ✅ Emails (green headers)
   - ✅ Replies (red headers)
   - ✅ Buyers (yellow headers)
   - ✅ Deals (purple headers)
   - ✅ Performance Dashboard

If you see all 6 tabs, you're good! If not, run `initializeAllSheets()` again.

---

## Step 2: Get Your Spreadsheet ID

1. Look at your Google Sheet URL in the browser
2. It looks like: `https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit`
3. **Copy that ID** (the long string between `/d/` and `/edit`)

You'll need this in Step 4.

---

## Step 3: Copy All Apps Script Files

You need to add all the automation scripts. Here's the easiest way:

### Option A: Add Files One by One (Recommended)

1. In Apps Script, click the **+** button next to "Files"
2. Create new files for each module:

**Essential Files to Add:**
- `Main.gs` - Main orchestration
- `config/ScraperConfig.gs` - Configuration
- `config/AIConfig.gs` - AI configuration
- `utils/SheetWriter.gs` - Sheet writing utilities
- `scrapers/ScraperManager.gs` - Scraper orchestration
- `scrapers/ZillowScraper.gs` - Zillow scraper
- `scrapers/LandWatchScraper.gs` - LandWatch scraper
- `email/OutreachManager.gs` - Email automation
- `email/TemplateEngine.gs` - Email templates
- `ai/ClaudeClassifier.gs` - AI classification
- `ai/ReplyParser.gs` - Reply processing
- `buyers/BuyerDatabase.gs` - Buyer database
- `triggers/TriggerInstaller.gs` - Trigger setup

**Or Option B: Copy All at Once**

Copy all the `.gs` files from the `apps-script/` folder. You can create folders in Apps Script by naming files like `config/ScraperConfig` (Apps Script will create the folder structure).

---

## Step 4: Set Your Spreadsheet ID

In Apps Script, add this function and run it once (replace with YOUR ID):

```javascript
function setMySpreadsheetId() {
  var SPREADSHEET_ID = 'PASTE_YOUR_ID_HERE';
  
  // Store in Properties Service
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
  
  Logger.log('Spreadsheet ID set: ' + SPREADSHEET_ID);
  
  // If ScraperConfig exists, also set it there
  if (typeof setSpreadsheetId === 'function') {
    setSpreadsheetId(SPREADSHEET_ID);
  }
}
```

---

## Step 5: Set Up Gmail API

1. In Apps Script, go to **Triggers** (clock icon on left)
2. Click **+ Add Trigger**
3. Select any function (like `testGmailAccess`)
4. When prompted, authorize Gmail access
5. Click **Review Permissions** → **Allow**

Or test it by running:
```javascript
function testGmailAccess() {
  var threads = GmailApp.getInboxThreads(0, 1);
  Logger.log('Gmail access OK!');
}
```

---

## Step 6: Set Up AI API (Choose One)

### For OpenAI:
```javascript
function setupOpenAI() {
  PropertiesService.getScriptProperties().setProperty('AI_API_KEY', 'sk-your-key-here');
  PropertiesService.getScriptProperties().setProperty('AI_PROVIDER', 'openai');
  Logger.log('OpenAI configured');
}
```

### For Claude:
```javascript
function setupClaude() {
  PropertiesService.getScriptProperties().setProperty('AI_API_KEY', 'sk-ant-your-key-here');
  PropertiesService.getScriptProperties().setProperty('AI_PROVIDER', 'claude');
  Logger.log('Claude configured');
}
```

**Get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Claude: https://console.anthropic.com/

---

## Step 7: Set Your Contact Info

Run this once (customize with your info):

```javascript
function setupContactInfo() {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('YOUR_NAME', 'Your Name Here');
  properties.setProperty('YOUR_COMPANY', 'Your Company Name');
  properties.setProperty('YOUR_EMAIL', 'your-email@example.com');
  properties.setProperty('YOUR_PHONE', '+1-555-123-4567');
  Logger.log('Contact info set');
}
```

---

## Step 8: Initialize Buyer Database

Run this to populate the Buyers sheet:

```javascript
function initBuyers() {
  initializeBuyerDatabase();
  Logger.log('Buyer database initialized');
}
```

---

## Step 9: Test Everything

Run this test function:

```javascript
function testSystem() {
  Logger.log('Testing system...');
  
  // Test 1: Spreadsheet access
  var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
  Logger.log('✅ Spreadsheet accessible');
  
  // Test 2: Sheets exist
  var sheets = ['Properties', 'Emails', 'Replies', 'Buyers', 'Deals', 'Performance Dashboard'];
  for (var i = 0; i < sheets.length; i++) {
    var sheet = ss.getSheetByName(sheets[i]);
    Logger.log(sheet ? '✅ ' + sheets[i] + ' exists' : '❌ ' + sheets[i] + ' missing');
  }
  
  // Test 3: Gmail
  try {
    GmailApp.getInboxThreads(0, 1);
    Logger.log('✅ Gmail accessible');
  } catch (e) {
    Logger.log('❌ Gmail not accessible: ' + e);
  }
  
  // Test 4: AI API
  var apiKey = PropertiesService.getScriptProperties().getProperty('AI_API_KEY');
  Logger.log(apiKey ? '✅ AI API key set' : '⚠️ AI API key not set');
  
  Logger.log('Test complete!');
}
```

---

## Step 10: Install Automation Triggers

Once everything is set up, install the automation:

```javascript
function setupAutomation() {
  installAllTriggers();
  Logger.log('Automation triggers installed!');
}
```

This will set up:
- Daily property scraping (8 AM)
- Daily buyer matching (10 AM)
- Hourly reply processing
- Follow-up checks (every 4 hours)
- Dashboard refresh (every 6 hours)

---

## You're Done! 🎉

Your system will now:
1. ✅ Scrape properties daily
2. ✅ Send automated outreach emails
3. ✅ Process replies with AI
4. ✅ Track everything in sheets
5. ✅ Match properties to buyers
6. ✅ Update dashboard automatically

---

## Quick Reference

**Manual Functions You Can Run:**

- `manualScrapeProperties()` - Test property scraping
- `manualSendOutreach()` - Test email sending
- `manualProcessReplies()` - Test reply processing
- `refreshDashboard()` - Update dashboard now
- `sendDailyDigest()` - Send digest email

**Monitoring:**
- Check **Execution log** in Apps Script
- View **Performance Dashboard** sheet
- Check **Error Log** sheet if you create one

**Need Help?**
- See `docs/TROUBLESHOOTING.md`
- Check execution logs for errors
- Verify all setup steps completed

