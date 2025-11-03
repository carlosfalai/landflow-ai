# Super Simple Setup - 3 Steps!

## Step 1: Copy the Setup Code (2 minutes)

1. Open `SIMPLE_SETUP.gs` file I just created
2. Select ALL the code (Ctrl+A or Cmd+A)
3. Copy it

## Step 2: Paste into Apps Script (1 minute)

1. In your Google Sheet: **Extensions → Apps Script**
2. **DELETE** all existing code
3. **PASTE** the code you copied
4. Click **Save** (Ctrl+S)

## Step 3: Run Setup (1 minute)

1. In Apps Script, select function: **`setupEverything`**
2. Click **Run** button
3. Click **"Review Permissions"** when prompted
4. Click **Allow**

**Done!** ✅

---

## Optional: Add AI (When You Have API Key)

When you get your OpenAI or Claude API key:

1. In Apps Script, run: `setupAI("openai", "your-key-here")`
   - Or: `setupAI("claude", "your-key-here")`

## Optional: Start Automation

Run: `installTriggers()`

This sets up daily scraping and hourly reply processing.

---

## That's It!

Your system is now ready. The basic setup is complete. You can add more automation features later by copying additional script files, but for now you have:

- ✅ All 6 sheets set up
- ✅ Spreadsheet ID configured
- ✅ Contact info set
- ✅ Basic functions ready

Everything else can be added incrementally!

