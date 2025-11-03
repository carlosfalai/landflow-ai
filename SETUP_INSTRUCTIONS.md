# Quick Setup Instructions

## What You Need

1. **A Google Account** (Gmail account)
2. **5 minutes** to set up

## Step-by-Step Setup

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. **Rename it** to "LandFlow AI" (or any name you want)
4. Keep this tab open - you'll use it in Step 2

### Step 2: Open Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab opens with the Apps Script editor

### Step 3: Install the Setup Script

1. In Apps Script, **delete** any default code
2. Copy and paste this file into Apps Script:
   - File: `apps-script/setup/SheetInitializer.gs`
   - Copy ALL the code from that file

3. Also copy these essential files into Apps Script:
   - `apps-script/config/ScraperConfig.gs`
   - `apps-script/Main.gs`
   
   (You can add these as separate files or combine them)

### Step 4: Run the Setup

1. In Apps Script, click the function dropdown (top right)
2. Select **`initializeAllSheets`**
3. Click the **▶ Run** button
4. First time: Click **"Review Permissions"** → Select your account → **"Allow"**
5. Wait 10-20 seconds

### Step 5: Verify It Worked

1. Go back to your Google Sheet tab
2. You should now see **6 tabs** at the bottom:
   - ✅ Properties
   - ✅ Emails
   - ✅ Replies
   - ✅ Buyers
   - ✅ Deals
   - ✅ Performance Dashboard

3. Click on **Properties** tab - you should see formatted headers with colors

### Step 6: Set Your Spreadsheet ID

After the setup runs, you'll see your Spreadsheet ID in the execution log.

**OR** get it from your Google Sheet URL:
- URL looks like: `https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit`
- Copy that ID

Then in Apps Script, run this function once:

```javascript
function setMySpreadsheetId() {
  ScraperConfig.setSpreadsheetId('PASTE_YOUR_ID_HERE');
  Logger.log('Spreadsheet ID set!');
}
```

Replace `PASTE_YOUR_ID_HERE` with your actual ID.

## That's It! ✅

Your Google Sheets are now set up with:
- ✅ All 6 sheet tabs created
- ✅ Proper column headers
- ✅ Data validation dropdowns
- ✅ Color-coded formatting
- ✅ Formulas for calculations
- ✅ Conditional formatting

## Next Steps

1. **Copy remaining Apps Script files** - Copy all other `.gs` files from `apps-script/` folder
2. **Set up Gmail API** - See `setup/GMAIL_API_SETUP.md`
3. **Set up AI API** - See `setup/AI_API_SETUP.md`
4. **Run initialization** - Run `initializeLandFlowAI()` from Main.gs

## Troubleshooting

### "No active spreadsheet" error
- Make sure you're running the script from Apps Script editor
- The sheet must be open in another tab

### Sheets not created
- Check the execution log for errors
- Make sure you granted permissions
- Try running `initializeAllSheets()` again

### Can't find function
- Make sure you copied the entire `SheetInitializer.gs` file
- Check that the code is saved (Ctrl+S or Cmd+S)

## Need Help?

Check the full documentation:
- `setup/INSTALLATION.md` - Complete installation guide
- `docs/TROUBLESHOOTING.md` - Common issues and fixes

