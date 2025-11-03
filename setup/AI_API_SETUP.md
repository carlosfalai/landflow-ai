# AI API Setup Guide

LandFlow AI uses AI (OpenAI or Claude) to classify email replies and generate summaries.

## Choose Your AI Provider

### Option 1: OpenAI (GPT-4)

**Pros:**
- Widely available
- Good classification accuracy
- JSON mode support

**Cons:**
- Requires paid API key (free tier limited)

### Option 2: Claude (Anthropic)

**Pros:**
- Excellent at understanding context
- Better at nuanced classifications
- Strong reasoning

**Cons:**
- Requires paid API key
- Slightly more complex setup

## OpenAI Setup

### Step 1: Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)

### Step 2: Configure in Apps Script

Run this function once:

```javascript
function setupOpenAI() {
  AIConfig.setAPIKey('sk-your-actual-api-key-here');
  AIConfig.setAIProvider('openai');
  Logger.log('OpenAI configured successfully');
}
```

Replace `sk-your-actual-api-key-here` with your actual API key.

### Step 3: Set Model (Optional)

Default is `gpt-4`. To use a different model:

```javascript
function setOpenAIModel() {
  var config = AIConfig.getAIConfig();
  config.openai.model = 'gpt-3.5-turbo'; // Cheaper option
  Logger.log('Model updated');
}
```

### Step 4: Test OpenAI

```javascript
function testOpenAI() {
  var testEmail = "Thank you for your offer. We're interested and would like to discuss further.";
  var result = classifyEmailReply(testEmail);
  Logger.log('Classification result: ' + JSON.stringify(result));
  return result;
}
```

## Claude Setup

### Step 1: Get API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click "Create Key"
5. Copy the key

### Step 2: Configure in Apps Script

Run this function once:

```javascript
function setupClaude() {
  AIConfig.setAPIKey('sk-ant-your-actual-api-key-here');
  AIConfig.setAIProvider('claude');
  Logger.log('Claude configured successfully');
}
```

Replace `sk-ant-your-actual-api-key-here` with your actual API key.

### Step 3: Test Claude

```javascript
function testClaude() {
  var testEmail = "Thank you for your offer. We're interested and would like to discuss further.";
  var result = classifyEmailReply(testEmail);
  Logger.log('Classification result: ' + JSON.stringify(result));
  return result;
}
```

## API Costs

### OpenAI Pricing (as of 2024)

- **GPT-4:** ~$0.03 per 1K tokens (input), $0.06 per 1K tokens (output)
- **GPT-3.5-turbo:** ~$0.0015 per 1K tokens (much cheaper)

**Estimate:** ~$0.01-0.05 per email classification

### Claude Pricing (as of 2024)

- **Claude 3 Sonnet:** ~$0.003 per 1K tokens (input), $0.015 per 1K tokens (output)

**Estimate:** ~$0.005-0.02 per email classification

### Cost Optimization Tips

1. **Use GPT-3.5-turbo** for classification (cheaper, still accurate)
2. **Batch classifications** when possible
3. **Cache results** to avoid re-classifying same emails
4. **Set max_tokens** appropriately (classification needs ~200-500 tokens)

## Configuration Options

### Adjust Classification Prompt

Edit `AIConfig.gs` to customize the classification prompt:

```javascript
classificationPrompt: `Your custom prompt here...
Email to analyze:
{{EMAIL_BODY}}
...`
```

### Adjust Temperature

Lower temperature = more consistent results
Higher temperature = more creative (not recommended for classification)

```javascript
function setAITemperature() {
  var config = AIConfig.getAIConfig();
  config.openai.temperature = 0.2; // More consistent (default is 0.3)
}
```

## Error Handling

The system includes error handling:

1. **API Key Missing:** Returns default classification
2. **API Error:** Logs error, uses default classification
3. **Rate Limit:** Waits and retries (if implemented)
4. **Invalid Response:** Parses best effort, logs warning

## Testing Classification

### Test Different Reply Types

```javascript
function testClassifications() {
  var testCases = [
    { text: "Yes, we accept your offer!", expected: "Interested" },
    { text: "Can you do $50,000 instead?", expected: "Counteroffer" },
    { text: "Not interested, thanks.", expected: "Not Interested" },
    { text: "Click here for great deals!", expected: "Spam" }
  ];
  
  for (var i = 0; i < testCases.length; i++) {
    var result = classifyEmailReply(testCases[i].text);
    Logger.log(testCases[i].expected + ': ' + result.sentiment + ' (confidence: ' + result.confidence + '%)');
  }
}
```

## Security Best Practices

1. **Never Commit API Keys:**
   - Always use Properties Service
   - Never hardcode in scripts
   - Don't share scripts with keys

2. **Rotate Keys Regularly:**
   - Generate new keys periodically
   - Revoke old keys
   - Update in Properties Service

3. **Monitor Usage:**
   - Check API usage dashboards
   - Set up billing alerts
   - Review classification quality

## Troubleshooting

### "API key not set" Error

- Run setup function again
- Check Properties Service has the key
- Verify key is valid (not expired)

### Classification Not Working

- Test API key with curl or Postman
- Check API quotas/limits
- Verify network connectivity
- Review execution logs

### Poor Classification Quality

- Adjust prompt in `AIConfig.gs`
- Try different model (GPT-4 vs GPT-3.5)
- Switch to Claude if needed
- Increase confidence threshold

### Rate Limit Errors

- Reduce frequency of reply processing
- Implement retry logic with backoff
- Use caching for repeated classifications
- Upgrade API tier if available

## Advanced: Custom Models

For specialized classification, you can:

1. Fine-tune GPT-3.5 on your email data
2. Create custom classification endpoints
3. Use multiple models and vote on results
4. Implement confidence-based filtering

This requires more advanced setup but can improve accuracy significantly.

