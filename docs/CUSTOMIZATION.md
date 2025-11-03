# Customization Guide

How to customize LandFlow AI for your specific needs.

## Search Parameters

### Modify Property Search Criteria

Edit `ScraperConfig.gs`:

```javascript
searchParams: {
  minPrice: 10000,        // Minimum listing price
  maxPrice: 500000,       // Maximum listing price
  minAcreage: 0.5,        // Minimum acres
  maxAcreage: 100,        // Maximum acres
  locations: ['Texas', 'Florida'], // Target states
  daysOnMarketMax: 365    // Max days on market
}
```

### Add More Locations

```javascript
locations: [
  'Texas', 'Florida', 'Georgia', 
  'Arizona', 'North Carolina',
  'South Carolina', 'Tennessee' // Add more
]
```

### Adjust Scraping Frequency

Edit trigger times in `TriggerInstaller.gs` or:

```javascript
// Scrape twice daily
ScriptApp.newTrigger('runPropertyScrapers')
  .timeBased()
  .everyDays(1)
  .atHour(8)
  .create();

ScriptApp.newTrigger('runPropertyScrapers')
  .timeBased()
  .everyDays(1)
  .atHour(14) // 2 PM
  .create();
```

## Offer Calculation

### Change Offer Percentage Range

Edit `OfferCalculator.gs`:

```javascript
// Default: 70-80%
calculateOffer(listingPrice, 65, 75); // 65-75% range

// Or modify in calculateOfferForProperty:
var baseMinPercent = 65; // Was 70
var baseMaxPercent = 75; // Was 80
```

### Adjust Based on Days on Market

```javascript
// More aggressive for older listings
if (daysOnMarket > 180) {
  baseMinPercent = 60; // Was 65
  baseMaxPercent = 70; // Was 75
}
```

### Custom Offer Strategy

```javascript
function customOfferStrategy(property) {
  var price = property.price;
  var acreage = property.acreage;
  
  // Custom logic based on acreage
  if (acreage > 5) {
    return price * 0.65; // Larger lots: lower percentage
  } else {
    return price * 0.75; // Smaller lots: higher percentage
  }
}
```

## Email Templates

### Customize Email Content

Edit templates in `TemplateEngine.gs`:

```javascript
function getInitialTemplate() {
  return `<!DOCTYPE html>
  <html>
  <body>
    <p>Hello {{AGENT_NAME}},</p>
    
    <p>YOUR CUSTOM MESSAGE HERE</p>
    
    <p>Our offer: {{OFFER_AMOUNT}}</p>
    
    <p>{{YOUR_NAME}}</p>
  </body>
  </html>`;
}
```

### Add More Template Variables

1. Add to data object in `generateEmailHTML()`:
```javascript
var data = {
  PROPERTY_ADDRESS: propertyData.address,
  // Add new variable:
  PROPERTY_ACREAGE: propertyData.acreage,
  CUSTOM_FIELD: 'custom value'
};
```

2. Use in template:
```html
<p>Property size: {{PROPERTY_ACREAGE}} acres</p>
<p>Note: {{CUSTOM_FIELD}}</p>
```

### Change Email Subject Lines

Edit `generateEmailSubject()`:

```javascript
var subjects = {
  'initial': 'Cash Offer - ' + address,
  'follow-up': 'Following Up: ' + address,
  // Add custom:
  'counteroffer': 'Revised Offer for ' + address
};
```

## Follow-up Settings

### Change Follow-up Interval

Edit `EmailLogger.gs`:

```javascript
// Default: 48 hours
var followUpDate = new Date(timestamp.getTime() + (48 * 60 * 60 * 1000));

// Change to 72 hours (3 days):
var followUpDate = new Date(timestamp.getTime() + (72 * 60 * 60 * 1000));
```

### Adjust Max Follow-ups

Edit `FollowUpScheduler.gs`:

```javascript
// Default: 3 follow-ups max
if (emailData.followUpCount >= 3) {
  // Change to 5:
if (emailData.followUpCount >= 5) {
```

### Custom Follow-up Schedule

```javascript
function getFollowUpSchedule(followUpCount) {
  var intervals = [
    48,   // First follow-up: 48 hours
    72,   // Second: 72 hours
    96    // Third: 96 hours
  ];
  
  return intervals[followUpCount] || 120; // Default: 120 hours
}
```

## AI Classification

### Custom Classification Prompt

Edit `AIConfig.gs`:

```javascript
classificationPrompt: `Analyze this real estate email reply.

Focus on these aspects:
- Is seller interested?
- Do they want to negotiate?
- Any counteroffer mentioned?
- Is it spam or legitimate?

Email:
{{EMAIL_BODY}}

Return JSON with: sentiment, replyType, confidence, counterofferAmount, summary, nextAction`
```

### Adjust Confidence Threshold

Filter low-confidence results:

```javascript
function classifyEmailReply(emailBody) {
  var result = classifyEmailReply(emailBody);
  
  // Only use if confidence > 70%
  if (result.confidence < 70) {
    result.sentiment = 'Neutral'; // Require manual review
  }
  
  return result;
}
```

## Buyer Matching

### Add More Builders

Edit `BuyerDatabase.gs`:

```javascript
function getVerifiedBuilders() {
  return [
    // Existing builders...
    {
      company: 'New Builder Name',
      contactName: 'Contact Person',
      email: 'contact@builder.com',
      location: 'Texas, Florida',
      lotSizeMin: 0.25,
      lotSizeMax: 5.0,
      priceRangeMin: 15000,
      priceRangeMax: 500000
    }
  ];
}
```

### Custom Matching Logic

Edit `MatchingEngine.gs`:

```javascript
function matchesBuyerCriteria(property, buyer) {
  // Add custom criteria:
  if (property.county === 'Specific County') {
    // Special matching for this county
    return true;
  }
  
  // Standard matching...
  return locationMatches() && acreageMatches() && priceMatches();
}
```

### Adjust Buyer Contact Frequency

Edit `BuyerOutreach.gs`:

```javascript
// Default: 30 days
var thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// Change to 60 days:
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
```

## Dashboard Customization

### Add Custom Metrics

Edit `MetricsCalculator.gs`:

```javascript
function calculateDashboardMetrics() {
  var metrics = {
    // Existing metrics...
    
    // Add custom:
    avgDaysToClose: calculateAvgDaysToClose(),
    conversionRate: calculateConversionRate(),
    topPerformingLocation: findTopLocation()
  };
  
  return metrics;
}
```

### Custom Digest Email

Edit `DigestEmailer.gs`:

```javascript
function generateDigestEmailHTML(metrics) {
  var html = '<h2>Your Custom Daily Report</h2>';
  
  // Add custom sections:
  html += '<h3>Custom Section</h3>';
  html += '<p>Your custom content here</p>';
  
  return html;
}
```

## Status Values

### Custom Property Statuses

Add new statuses in Properties sheet data validation:

1. In Google Sheets: Data → Data validation
2. Add new status: "Under Negotiation", "Pending Inspection", etc.
3. Update code to handle new statuses:

```javascript
if (status === 'Under Negotiation') {
  // Custom handling
}
```

### Custom Email Statuses

Add to Emails sheet data validation:
- "Bounced"
- "Opened"
- "Clicked"

## Rate Limiting

### Adjust Request Delays

Edit `ScraperConfig.gs`:

```javascript
rateLimit: {
  delayBetweenRequests: 3000, // 3 seconds (was 2)
  maxRequestsPerRun: 100,      // More per run (was 50)
  enabled: true
}
```

### Custom Rate Limiting

```javascript
function customRateLimit(platform) {
  var limits = {
    'zillow': 3000,      // 3 seconds for Zillow
    'landwatch': 2000,   // 2 seconds for LandWatch
    'realtor': 4000      // 4 seconds for Realtor
  };
  
  Utilities.sleep(limits[platform] || 2000);
}
```

## Error Handling

### Custom Error Actions

Edit error logging:

```javascript
function logError(source, error) {
  // Standard logging...
  
  // Add custom actions:
  if (error.toString().includes('quota')) {
    // Send alert email
    MailApp.sendEmail({
      to: 'alerts@example.com',
      subject: 'Quota Warning',
      body: 'API quota exceeded'
    });
  }
}
```

## Integration Points

### Add CRM Integration

```javascript
function syncToCRM(property) {
  // HubSpot API
  var url = 'https://api.hubapi.com/...';
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + hubspotKey },
    payload: JSON.stringify({
      address: property.address,
      price: property.price
    })
  });
}
```

### Add SMS Notifications

```javascript
function sendSMSAlert(message) {
  // Twilio API
  var url = 'https://api.twilio.com/...';
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Authorization': 'Basic ' + twilioAuth },
    payload: {
      To: '+1234567890',
      From: '+0987654321',
      Body: message
    }
  });
}
```

## Advanced Customization

### Custom Scraper

Add new source:

1. Create `NewSiteScraper.gs`
2. Implement scraping logic
3. Add to `ScraperManager`:

```javascript
var scraperFunctions = {
  'zillow': scrapeZillow,
  'newsite': scrapeNewSite  // New scraper
};
```

### Custom Workflows

Add new automation:

```javascript
function customWorkflow(propertyId) {
  // Your custom logic
  // E.g., send to multiple platforms
  // Or custom validation
}
```

## Best Practices

1. **Test Changes:** Test customizations in test mode first
2. **Backup:** Keep backup of original code
3. **Documentation:** Document custom changes
4. **Version Control:** Use Git if possible
5. **Incremental:** Make one change at a time
6. **Monitor:** Watch for errors after changes

## Configuration File Pattern

Create centralized config:

```javascript
// CustomConfig.gs
var CUSTOM_CONFIG = {
  businessName: 'Your Business Name',
  emailSignature: 'Custom signature',
  customRules: {
    minOfferPercent: 65,
    maxOfferPercent: 80,
    followUpDays: 3
  }
};
```

Use throughout code:

```javascript
var minPercent = CUSTOM_CONFIG.customRules.minOfferPercent;
```

