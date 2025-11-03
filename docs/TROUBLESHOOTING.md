# Troubleshooting Guide

Common issues and solutions for LandFlow AI.

## General Issues

### Spreadsheet ID Not Set

**Error:** "Spreadsheet ID not set"

**Solution:**
```javascript
ScraperConfig.setSpreadsheetId('YOUR_SPREADSHEET_ID');
```

### Sheets Not Found

**Error:** "Properties sheet not found"

**Solution:**
1. Verify sheet tab names match exactly:
   - "Properties"
   - "Emails"
   - "Replies"
   - "Buyers"
   - "Deals"
   - "Performance Dashboard"
2. Case-sensitive! Use exact names

### Function Not Found

**Error:** "Function X is not defined"

**Solution:**
1. Check all script files are loaded
2. Verify function names match exactly
3. Ensure files are saved in Apps Script

## Scraping Issues

### No Properties Scraped

**Symptoms:** Properties sheet empty or no new entries

**Solutions:**
1. **Check Search Parameters:**
   ```javascript
   var params = getSearchParams();
   Logger.log(JSON.stringify(params));
   ```
2. **Test Individual Scraper:**
   ```javascript
   var result = scrapeZillow();
   Logger.log('Found: ' + result.length);
   ```
3. **Check Rate Limits:**
   - May be blocked by websites
   - Try different user agents
   - Reduce scraping frequency

### Scraper Errors

**Error:** "Failed to fetch" or "HTTP Error 403"

**Solutions:**
1. Websites may block automated requests
2. **Use APIs instead of scraping** (if available)
3. Add delays between requests
4. Rotate user agents
5. Consider using proxies (advanced)

**Note:** Web scraping may violate terms of service. Consider:
- Using official APIs
- Obtaining permission
- Using third-party data services

### Duplicate Properties

**Symptoms:** Same property added multiple times

**Solutions:**
1. Deduplication logic should handle this
2. Check `findExistingProperty()` function
3. Verify URL normalization works
4. Manually remove duplicates if needed

## Email Issues

### Emails Not Sending

**Error:** "Gmail API error" or "Failed to send"

**Solutions:**
1. **Check Gmail Authorization:**
   - Run a Gmail function manually
   - Grant permissions when prompted
2. **Verify Email Addresses:**
   - Check recipient email format
   - Ensure not empty
3. **Check Quotas:**
   - Gmail: 500 emails/day (free)
   - Reduce sending frequency if needed
4. **Review Execution Logs:**
   - Check for specific error messages
   - Verify API access

### Follow-ups Not Sending

**Symptoms:** No follow-up emails sent

**Solutions:**
1. **Check Follow-up Dates:**
   - Verify follow-up date calculations
   - Ensure dates are in future
2. **Check Email Status:**
   - Follow-ups only sent if status ≠ "Replied"
   - Verify status column values
3. **Check Follow-up Count:**
   - Max 3 follow-ups per property
   - Reset if needed manually

### Replies Not Processed

**Symptoms:** Incoming replies not classified

**Solutions:**
1. **Check Gmail Search Query:**
   ```javascript
   // In ReplyParser.gs, verify query:
   var query = 'in:inbox from:-me to:YOUR_EMAIL is:unread';
   ```
2. **Verify Email Matching:**
   - Check thread ID matching
   - Verify sender email extraction
3. **Check Gmail Labels:**
   - Ensure emails not in spam
   - Check filters not blocking

## AI Classification Issues

### API Key Not Set

**Error:** "API key not set"

**Solution:**
```javascript
AIConfig.setAPIKey('your-api-key');
AIConfig.setAIProvider('openai'); // or 'claude'
```

### Classification Not Working

**Symptoms:** All classifications return "Neutral" or errors

**Solutions:**
1. **Test API Access:**
   ```javascript
   testOpenAI(); // or testClaude();
   ```
2. **Check API Quotas:**
   - Verify account has credits
   - Check rate limits
3. **Review API Response:**
   - Check execution logs
   - Verify JSON parsing works
4. **Test with Sample Email:**
   ```javascript
   var result = classifyEmailReply("Yes, we accept!");
   Logger.log(result.sentiment); // Should be "Interested"
   ```

### Poor Classification Quality

**Symptoms:** Wrong classifications, low confidence

**Solutions:**
1. **Adjust Prompt:**
   - Edit `AIConfig.gs`
   - Make prompt more specific
2. **Try Different Model:**
   - Switch to GPT-4 (better accuracy)
   - Or try Claude
3. **Increase Confidence Threshold:**
   - Filter low-confidence results
   - Review manually
4. **Add More Examples:**
   - Fine-tune on your data (advanced)

### High API Costs

**Solutions:**
1. Use GPT-3.5-turbo instead of GPT-4
2. Cache classification results
3. Reduce classification frequency
4. Batch multiple emails together

## Dashboard Issues

### Metrics Not Updating

**Symptoms:** Dashboard shows zeros or old data

**Solutions:**
1. **Refresh Manually:**
   ```javascript
   refreshDashboard();
   ```
2. **Check Formulas:**
   - Verify sheet formulas are correct
   - See Dashboard.md template
3. **Check Data References:**
   - Ensure sheet names match
   - Verify column references

### Incorrect Calculations

**Solutions:**
1. **Check Formula Logic:**
   - Review MetricsCalculator.gs
   - Verify calculations
2. **Verify Data Format:**
   - Ensure numbers formatted correctly
   - Check date formats
3. **Test Individual Metrics:**
   ```javascript
   var metrics = calculateDashboardMetrics();
   Logger.log(JSON.stringify(metrics));
   ```

## Trigger Issues

### Triggers Not Running

**Symptoms:** Automation not executing

**Solutions:**
1. **Check Trigger Installation:**
   ```javascript
   var triggers = listTriggers();
   Logger.log(JSON.stringify(triggers));
   ```
2. **Reinstall Triggers:**
   ```javascript
   deleteAllTriggers();
   installAllTriggers();
   ```
3. **Check Execution Logs:**
   - Go to Executions in Apps Script
   - See if triggers are running
   - Check for errors
4. **Verify Time Zone:**
   - Set in Project Settings
   - Triggers use script time zone

### Execution Timeout

**Error:** "Execution timeout"

**Solutions:**
1. **Optimize Code:**
   - Reduce data processing
   - Limit number of operations
2. **Break Into Smaller Functions:**
   - Split daily job into parts
   - Use separate triggers
3. **Increase Limits:**
   - Apps Script: 6 hours/day (free)
   - Upgrade if needed

## Buyer Matching Issues

### No Buyers Matched

**Symptoms:** Properties not matching to buyers

**Solutions:**
1. **Check Location Matching:**
   - Verify state extraction
   - Check buyer location strings
2. **Verify Criteria:**
   - Acreage within range?
   - Price within range?
   - Test matching logic:
     ```javascript
     var property = [/* property data */];
     var matches = findMatchingBuyers(property);
     Logger.log('Matches: ' + matches.length);
     ```
3. **Check Buyer Database:**
   - Ensure buyers initialized
   - Verify buyer criteria values

## Data Issues

### Missing Data

**Symptoms:** Columns empty or incorrect

**Solutions:**
1. **Check Data Extraction:**
   - Verify scraper extracts all fields
   - Check HTML parsing logic
2. **Review Sheet Formulas:**
   - Some columns auto-calculate
   - Verify formula references
3. **Check Data Types:**
   - Numbers vs text
   - Date formats

### Formatting Issues

**Symptoms:** Numbers as text, dates wrong format

**Solutions:**
1. **Reformat Cells:**
   - Use sheet formatting
   - Or script formatting:
     ```javascript
     sheet.getRange(row, col).setNumberFormat('$#,##0');
     ```
2. **Check Data Entry:**
   - Ensure consistent formats
   - Validate on entry

## Performance Issues

### Slow Execution

**Symptoms:** Functions taking too long

**Solutions:**
1. **Reduce Data Volume:**
   - Limit scrapes per run
   - Filter unnecessary data
2. **Optimize Queries:**
   - Batch operations
   - Cache results
3. **Add Delays:**
   - Between API calls
   - To respect rate limits

### Quota Exceeded

**Errors:** "Quota exceeded" or "Rate limit exceeded"

**Solutions:**
1. **Check Quotas:**
   - Apps Script: 6 hours/day
   - Gmail: 500 emails/day
   - AI API: varies by provider
2. **Reduce Frequency:**
   - Increase trigger intervals
   - Batch operations
3. **Upgrade:**
   - Google Workspace (higher limits)
   - AI API tier (more credits)

## Getting Help

### Debug Mode

Enable detailed logging:
```javascript
// In any function, add:
Logger.log('Debug: variable = ' + variable);
```

View logs:
1. Go to Apps Script
2. Click "Executions"
3. Select execution
4. View logs

### Error Log Sheet

Check Error Log sheet in Google Sheets:
- All errors automatically logged
- Includes stack traces
- Timestamped

### Manual Testing

Test components individually:
```javascript
testSystem();              // Test all components
manualScrapeProperties();  // Test scraping
manualSendOutreach();      // Test emails
manualProcessReplies();    // Test replies
```

### Common Fixes

1. **Re-authorize:** Run function manually, grant permissions
2. **Re-install Triggers:** Delete and reinstall
3. **Check Config:** Verify all settings correct
4. **Review Logs:** Check execution logs for errors
5. **Verify Data:** Ensure sheets have correct structure

## Still Having Issues?

1. Check execution logs thoroughly
2. Review Error Log sheet
3. Test individual functions
4. Verify all configuration
5. Check API quotas and limits
6. Review code for typos/errors

