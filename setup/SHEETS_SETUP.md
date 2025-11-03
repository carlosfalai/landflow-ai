# Google Sheets Setup Guide

## Step 1: Create the Google Sheets File

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Rename it to "LandFlow AI - Deal Tracker"

## Step 2: Create All Sheet Tabs

Create 6 separate sheets (tabs) within your spreadsheet:

1. **Properties** - Main property listings
2. **Emails** - Email tracking
3. **Replies** - Response classification
4. **Buyers** - Builder database
5. **Deals** - Deal pipeline
6. **Performance Dashboard** - Metrics and KPIs

## Step 3: Set Up Each Sheet

### Properties Sheet

1. In Row 1, add headers: `ID`, `Address`, `County`, `Price`, `Acreage`, `Seller`, `URL`, `Contacted`, `Offer Sent`, `Offer Amount`, `Status`, `Days on Market`, `Listing Date`, `Source`, `Last Updated`
2. Format Row 1: Bold, Background Color #4285F4, Text Color White
3. Freeze Row 1
4. Apply conditional formatting:
   - Status = "New" → Green background
   - Status = "Offer Sent" → Yellow background
   - Status = "Response Received" → Blue background
   - Status = "Under Review" → Orange background
   - Status = "Dormant" → Gray background
5. Add data validation to Status column: Dropdown with values "New", "Contacted", "Offer Sent", "Response Received", "Under Review", "Dormant", "Under Contract", "Closed"

### Emails Sheet

1. In Row 1, add headers: `Property ID`, `Agent Email`, `Agent Name`, `Subject`, `Status`, `Timestamp`, `Message ID`, `Thread ID`, `Follow Up Date`, `Follow Up Count`, `Email Type`
2. Format Row 1: Bold, Background Color #34A853, Text Color White
3. Add data validation:
   - Status: "Draft", "Sent", "Delivered", "Opened", "Replied"
   - Email Type: "Initial", "Follow-up", "Counteroffer", "Confirmation"

### Replies Sheet

1. In Row 1, add headers: `Property ID`, `Email Thread ID`, `Reply Timestamp`, `Sentiment`, `Reply Type`, `AI Confidence`, `Original Offer`, `Counteroffer Amount`, `Notes`, `Next Action`, `Action Taken`, `Handler Status`
2. Format Row 1: Bold, Background Color #EA4335, Text Color White
3. Add data validation:
   - Sentiment: "Interested", "Counteroffer", "Not Interested", "Spam", "Neutral"
   - Reply Type: "Acceptance", "Counteroffer", "Rejection", "Question", "Unclear"

### Buyers Sheet

1. In Row 1, add headers: `Company`, `Contact Name`, `Email`, `Phone`, `Location`, `Lot Size Min`, `Lot Size Max`, `Price Range Min`, `Price Range Max`, `Property Match`, `Contacted`, `Last Contact`, `Response`, `Notes`
2. Format Row 1: Bold, Background Color #FBBC04, Text Color Black
3. Pre-populate with major builders (see verified-builders.json)
4. Add data validation for Company and Response columns

### Deals Sheet

1. In Row 1, add headers: `Deal ID`, `Property ID`, `Property Address`, `Seller Offer`, `Buyer Offer`, `Profit`, `Profit Margin`, `Close Date`, `Status`, `Buyer Company`, `Seller Name`, `Contract Date`, `Days to Close`, `Notes`
2. Format Row 1: Bold, Background Color #9C27B0, Text Color White
3. Add data validation for Status: "Under Contract", "In Escrow", "Closed", "Cancelled"

### Performance Dashboard Sheet

1. Set up the layout as described in Dashboard.md template
2. Use the formulas provided in the template
3. Create charts (pie chart for pipeline, bar chart for responses)

## Step 4: Protect Critical Columns

Protect the following ranges from manual editing (Apps Script will manage these):

- Properties: Column A (ID), Column O (Last Updated)
- Emails: Column A (Property ID), Column F (Timestamp), Column G (Message ID), Column H (Thread ID)
- Replies: Column A (Property ID), Column C (Reply Timestamp), Column D (Sentiment), Column F (AI Confidence)

To protect:
1. Right-click on column header
2. Select "Protect range"
3. Add a description: "Apps Script Managed"

## Step 5: Share with Apps Script

1. Note your Google Sheets ID (from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`)
2. You'll use this ID in the Apps Script configuration

## Step 6: Test Data Entry

Add 2-3 test rows to each sheet to verify formulas and formatting work correctly.

## Next Steps

After setting up the sheets:
1. Configure Apps Script project (see INSTALLATION.md)
2. Set up Gmail API (see GMAIL_API_SETUP.md)
3. Set up AI API keys (see AI_API_SETUP.md)
4. Install triggers (see TRIGGER_SETUP.md)

