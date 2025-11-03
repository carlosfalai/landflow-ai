# Trigger Setup Guide

LandFlow AI uses time-driven triggers to automate all processes.

## Automatic Installation

Run this function once:

```javascript
installAllTriggers()
```

This will install all required triggers automatically.

## Installed Triggers

### Daily Triggers

1. **Daily Job** (`runDailyJob`)
   - **Time:** 8:00 AM daily
   - **Function:** Runs property scraping, outreach, and follow-ups
   - **Frequency:** Once per day

2. **Buyer Matching** (`runDailyBuyerMatching`)
   - **Time:** 10:00 AM daily
   - **Function:** Matches properties under contract to buyers
   - **Frequency:** Once per day

### Hourly Triggers

3. **Hourly Job** (`runHourlyJob`)
   - **Time:** Every hour
   - **Function:** Processes incoming email replies
   - **Frequency:** Every 1 hour

4. **Follow-up Check** (`checkFollowUps`)
   - **Time:** Every 4 hours
   - **Function:** Checks and sends follow-up emails
   - **Frequency:** Every 4 hours

5. **Dashboard Refresh** (`refreshDashboard`)
   - **Time:** Every 6 hours
   - **Function:** Updates dashboard metrics
   - **Frequency:** Every 6 hours

## Manual Trigger Installation

If automatic installation fails, install manually:

### Install Daily Trigger

```javascript
ScriptApp.newTrigger('runDailyJob')
  .timeBased()
  .everyDays(1)
  .atHour(8)
  .create();
```

### Install Hourly Trigger

```javascript
ScriptApp.newTrigger('runHourlyJob')
  .timeBased()
  .everyHours(1)
  .create();
```

### Install Follow-up Trigger

```javascript
ScriptApp.newTrigger('checkFollowUps')
  .timeBased()
  .everyHours(4)
  .create();
```

## Custom Schedule

To customize trigger times:

```javascript
function installCustomTriggers() {
  var schedule = {
    dailyTime: 9,        // 9 AM instead of 8 AM
    hourlyEnabled: true, // Enable hourly jobs
    followUpInterval: 6  // Check follow-ups every 6 hours
  };
  
  installCustomTriggers(schedule);
}
```

## Viewing Active Triggers

```javascript
function listTriggers() {
  var triggers = listTriggers();
  for (var i = 0; i < triggers.length; i++) {
    Logger.log('Trigger: ' + triggers[i].functionName);
  }
}
```

Or in Apps Script:
1. Go to **Triggers** (clock icon) in left sidebar
2. View all installed triggers
3. See next execution times
4. View execution history

## Deleting Triggers

### Delete All Triggers

```javascript
deleteAllTriggers()
```

### Delete Specific Trigger

1. Go to **Triggers** in Apps Script
2. Click the trigger you want to delete
3. Click "Delete Trigger"

## Trigger Execution History

View execution logs:

1. Go to **Executions** in Apps Script (clock icon)
2. See all trigger executions
3. Click any execution to see logs
4. Check for errors or issues

## Troubleshooting

### Triggers Not Running

1. **Check Execution Logs:**
   - Go to Executions
   - Look for failed runs
   - Check error messages

2. **Verify Function Names:**
   - Ensure function names match exactly
   - Check for typos in trigger installation

3. **Check Permissions:**
   - Triggers need same permissions as manual runs
   - Authorize when prompted

4. **Time Zone Issues:**
   - Triggers use script time zone
   - Set in Apps Script settings (Project Settings → Time zone)

### Trigger Execution Errors

Common errors:

1. **"Function not found"**
   - Function name doesn't exist
   - Check spelling
   - Ensure function is saved

2. **"Authorization required"**
   - First run needs authorization
   - Run function manually once
   - Grant permissions

3. **"Execution timeout"**
   - Script ran too long
   - Optimize code
   - Break into smaller functions

4. **"Quota exceeded"**
   - Too many executions
   - Reduce trigger frequency
   - Check daily quotas

## Best Practices

1. **Monitor Execution:**
   - Check logs regularly
   - Set up error notifications
   - Review execution times

2. **Error Handling:**
   - All functions have try-catch
   - Errors logged to Error Log sheet
   - System continues on errors

3. **Rate Limiting:**
   - Built into scrapers
   - Delays between emails
   - Respects API quotas

4. **Testing:**
   - Test functions manually first
   - Use `testSystem()` function
   - Verify triggers after installation

## Disabling Triggers

To temporarily disable:

1. Delete triggers: `deleteAllTriggers()`
2. Re-enable when ready: `installAllTriggers()`

Or disable individually:
1. Go to Triggers
2. Click trigger
3. Click "Disable"

## Notification Settings

Apps Script can send email notifications on failures:

1. Go to **Triggers**
2. Click trigger
3. Check "Notify me immediately" under "Failure notifications"
4. Save

You'll receive emails if triggers fail.

## Quota Limits

Apps Script has daily quotas:

- **Execution Time:** 6 hours/day (free tier)
- **Triggers:** Unlimited
- **API Calls:** Varies by service

Monitor usage to avoid hitting limits.

## Advanced: Event-Driven Triggers

You can also create event-driven triggers:

```javascript
// Trigger on sheet edit
ScriptApp.newTrigger('onSheetEdit')
  .onEdit()
  .create();

// Trigger on form submit
ScriptApp.newTrigger('onFormSubmit')
  .onFormSubmit()
  .create();
```

This is useful for real-time updates when sheets change.

