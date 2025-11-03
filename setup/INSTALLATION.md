# LandFlow AI - Installation Guide

Complete step-by-step installation instructions for LandFlow AI.

## Prerequisites

1. **Google Account** with access to:
   - Google Sheets
   - Google Apps Script
   - Gmail (for email automation)

2. **API Keys** (you'll need these):
   - OpenAI API key OR Claude (Anthropic) API key
   - Gmail API access (automatic with Apps Script)

3. **Time Required**: 30-60 minutes for full setup

## Step 1: Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Rename it to "LandFlow AI - Deal Tracker"
4. Follow the detailed instructions in [SHEETS_SETUP.md](SHEETS_SETUP.md)
5. **Important:** Note your Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - Copy the `SPREADSHEET_ID` value

## Step 2: Create Apps Script Project

1. In your Google Sheet, go to **Extensions → Apps Script**
2. A new Apps Script editor will open
3. Delete the default `myFunction` code
4. You'll need to create multiple script files:

### Creating Script Files in Apps Script

Apps Script uses a different structure than regular files. You have two options:

**Option A: Single File (Simpler)**
- Copy the contents of ALL `.gs` files from the `apps-script/` folder
- Paste them into one Apps Script file (they'll all be accessible)
- This works but can be harder to manage

**Option B: Multiple Files (Recommended)**
- Click the `+` button next to "Files" to create new files
- Create files matching the structure:
  - `Main.gs`
  - `config/ScraperConfig.gs`
  - `config/AIConfig.gs`
  - `scrapers/ZillowScraper.gs`
  - `scrapers/LandWatchScraper.gs`
  - `scrapers/RealtorScraper.gs`
  - `scrapers/RedfinScraper.gs`
  - `scrapers/ScraperManager.gs`
  - `utils/SheetWriter.gs`
  - `utils/DataAggregator.gs`
  - `email/TemplateEngine.gs`
  - `email/OfferCalculator.gs`
  - `email/OutreachManager.gs`
  - `email/EmailLogger.gs`
  - `email/FollowUpScheduler.gs`
  - `ai/ClaudeClassifier.gs`
  - `ai/ReplyParser.gs`
  - `ai/ConversationLogger.gs`
  - `ai/ResponseHandler.gs`
  - `ai/NegotiationEngine.gs`
  - `buyers/BuyerDatabase.gs`
  - `buyers/MatchingEngine.gs`
  - `buyers/BuyerOutreach.gs`
  - `dashboard/MetricsCalculator.gs`
  - `dashboard/DashboardUpdater.gs`
  - `dashboard/DigestEmailer.gs`
  - `triggers/DailyTriggers.gs`
  - `triggers/HourlyTriggers.gs`
  - `triggers/TriggerInstaller.gs`

- Copy and paste the contents from each corresponding file

## Step 3: Configure Spreadsheet ID

1. In Apps Script, run this function once:
   ```javascript
   function setupSpreadsheetId() {
     var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your ID
     ScraperConfig.setSpreadsheetId(SPREADSHEET_ID);
     Logger.log('Spreadsheet ID set successfully');
   }
   ```
2. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID
3. Click "Run" to execute
4. Check the Execution log to confirm success

## Step 4: Set Up Gmail API

Follow the detailed instructions in [GMAIL_API_SETUP.md](GMAIL_API_SETUP.md)

Key steps:
1. Enable Gmail API in Apps Script
2. Authorize Gmail access when prompted
3. Test Gmail access

## Step 5: Set Up AI API

Follow the detailed instructions in [AI_API_SETUP.md](AI_API_SETUP.md)

**For OpenAI:**
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Set it using: `AIConfig.setAPIKey('your-key-here')`

**For Claude:**
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Set it using: `AIConfig.setAPIKey('your-key-here')`
3. Set provider: `AIConfig.setAIProvider('claude')`

## Step 6: Configure User Contact Information

Set your contact details (used in email templates):

```javascript
function setupUserInfo() {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('YOUR_NAME', 'Your Name');
  properties.setProperty('YOUR_COMPANY', 'Your Company Name');
  properties.setProperty('YOUR_EMAIL', 'your-email@example.com');
  properties.setProperty('YOUR_PHONE', '+1-555-123-4567');
  Logger.log('User info set successfully');
}
```

Run this function once.

## Step 7: Initialize Buyer Database

1. Run `initializeBuyerDatabase()` function once
2. This will populate the Buyers sheet with verified builders
3. Verify the Buyers sheet has data

## Step 8: Install Automation Triggers

1. Run `installAllTriggers()` function once
2. This will set up:
   - Daily property scraping (8 AM)
   - Daily buyer matching (10 AM)
   - Hourly reply processing
   - Follow-up checks (every 4 hours)
   - Dashboard refresh (every 6 hours)

## Step 9: Test the System

1. Run `testSystem()` function
2. Check execution log for any errors
3. Verify:
   - Sheets are accessible
   - Configuration is loaded
   - Buyers database is populated

## Step 10: Manual Testing

Before going live, test each component:

1. **Test Scraping:**
   ```javascript
   manualScrapeProperties()
   ```
   - Check Properties sheet for new entries

2. **Test Outreach:**
   ```javascript
   manualSendOutreach()
   ```
   - Check Emails sheet for logged emails
   - Verify email was sent (check your Gmail)

3. **Test Reply Processing:**
   ```javascript
   manualProcessReplies()
   ```
   - Send yourself a test reply
   - Check Replies sheet for classification

## Step 11: Go Live

Once testing is complete:
1. Triggers will run automatically
2. Monitor the Dashboard sheet for metrics
3. Check daily digest emails
4. Review Error Log sheet for any issues

## Troubleshooting

If you encounter issues:
1. Check [TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
2. Review execution logs in Apps Script
3. Check Error Log sheet in Google Sheets

## Next Steps

- Customize search parameters in `ScraperConfig.gs`
- Adjust email templates in `templates/` folder
- Modify offer calculation percentages
- Add more builder contacts to Buyers sheet

## Support

For detailed information on specific components, see:
- [WORKFLOW.md](../docs/WORKFLOW.md) - System workflow
- [CUSTOMIZATION.md](../docs/CUSTOMIZATION.md) - Customization options
- [TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) - Common issues

