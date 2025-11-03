# Gmail API Setup Guide

LandFlow AI uses Gmail API to read incoming email replies and send emails with proper threading.

## Automatic Setup (Recommended)

Google Apps Script has built-in Gmail access. When you first use Gmail functions, you'll be prompted to authorize:

1. **First Time Using Gmail Functions:**
   - Run any function that uses Gmail (e.g., `manualProcessReplies()`)
   - You'll see an authorization dialog
   - Click "Review Permissions"
   - Select your Google account
   - Click "Allow" to grant permissions

2. **Required Permissions:**
   - Read Gmail messages
   - Send emails on your behalf
   - Access Gmail threads

## Manual API Enablement

If you need to enable Gmail API manually:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services → Library**
4. Search for "Gmail API"
5. Click "Enable"
6. Go back to Apps Script
7. Run a Gmail function to trigger authorization

## Testing Gmail Access

Run this test function:

```javascript
function testGmailAccess() {
  try {
    var threads = GmailApp.getInboxThreads(0, 1);
    Logger.log('Gmail access OK. Found ' + threads.length + ' threads');
    return { success: true, message: 'Gmail API accessible' };
  } catch (error) {
    Logger.log('Gmail access error: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}
```

## Email Account Requirements

- **Sending Account:** Use the same Google account that owns the Apps Script project
- **Reply-To Address:** Set in `TemplateEngine.getUserContactInfo()`
- **Rate Limits:** Gmail API has daily quotas (see below)

## Gmail API Quotas

- **Daily Sending Limit:** 500 emails per day (free tier)
- **Read Limit:** 1,000 queries per day
- **Rate Limit:** 250 requests per second per user

If you hit limits:
- Reduce frequency of scraping/outreach
- Batch email sends
- Upgrade Google Workspace account

## Troubleshooting

### "Authorization Required" Error

1. Run a Gmail function manually
2. Click "Review Permissions" when prompted
3. Grant all requested permissions

### Emails Not Sending

1. Check Apps Script execution logs
2. Verify email address format
3. Check Gmail API quotas
4. Ensure account is not suspended

### Replies Not Being Processed

1. Verify Gmail API is enabled
2. Check email search query in `ReplyParser.gs`
3. Ensure emails are in inbox (not spam)
4. Check thread ID matching logic

## Advanced: Using Gmail API Directly

If you need more control, you can use the Gmail REST API:

1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Use `UrlFetchApp` to make API calls
4. Handle OAuth tokens

This is more complex but offers more features. For most use cases, the built-in `GmailApp` is sufficient.

## Security Notes

- Never share your Apps Script project with unauthorized users
- Gmail access tokens are stored securely by Google
- Review permissions regularly in Google Account settings
- Use separate Google account for automation if desired

## Best Practices

1. **Monitor Email Sending:**
   - Check Emails sheet regularly
   - Review sent emails in Gmail
   - Monitor bounce rates

2. **Handle Unsubscribes:**
   - Process "UNSUBSCRIBE" replies
   - Remove addresses from future sends
   - Respect opt-out requests

3. **Email Content:**
   - Follow CAN-SPAM Act requirements
   - Include unsubscribe instructions
   - Use clear sender information

4. **Rate Limiting:**
   - Add delays between sends
   - Batch sends when possible
   - Monitor quota usage

