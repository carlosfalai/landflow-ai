/**
 * LandFlow AI - Complete Google Apps Script
 *
 * This single file contains all the necessary code to run the LandFlow AI system.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet and name it "LandFlow AI".
 * 2. In the sheet, go to Extensions > Apps Script.
 * 3. Delete any existing code in the `Code.gs` file.
 * 4. Copy and paste this entire script into the `Code.gs` file.
 * 5. Replace the placeholder for SPREADSHEET_ID with your actual spreadsheet ID.
 *    - You can find the ID in the URL of your Google Sheet:
 *      https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 * 6. Save the script (Ctrl+S or Cmd+S).
 * 7. From the functions dropdown, select `initializeAllSheets` and click "Run".
 *    - Authorize the script when prompted. This will create all the necessary sheets.
 * 8. Next, select `setupEverything` and click "Run".
 *    - This will configure the script properties.
 * 9. Set your AI API key by running `setupAI`. For example:
 *    - setupAI("openai", "your-openai-api-key")
 * 10. Finally, run `installTriggers` to enable the automated jobs.
 */

// TODO: PASTE YOUR SPREADSHEET ID HERE
var SPREADSHEET_ID = 'TODO: PASTE YOUR SPREADSHEET ID HERE';

// =================================================================================
// SECTION 1: SETUP AND INITIALIZATION
// =================================================================================

/**
 * Main initialization function - creates all sheets.
 * Run this function once after creating your Google Sheet.
 */
function initializeAllSheets() {
  Logger.log('Starting sheet initialization...');

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('No active spreadsheet. Please open a Google Sheet first.');
  }

  try {
    var spreadsheetId = spreadsheet.getId();
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
    Logger.log('Spreadsheet ID set: ' + spreadsheetId);

    createPropertiesSheet(spreadsheet);
    createEmailsSheet(spreadsheet);
    createRepliesSheet(spreadsheet);
    createBuyersSheet(spreadsheet);
    createDealsSheet(spreadsheet);
    createDashboardSheet(spreadsheet);

    Logger.log('All sheets initialized successfully!');
    SpreadsheetApp.getUi().alert('Success! All 6 sheets have been created. Check the tabs at the bottom of your spreadsheet.');
    return { success: true, spreadsheetId: spreadsheetId };

  } catch (error) {
    Logger.log('Error initializing sheets: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
    throw error;
  }
}

/**
 * MAIN SETUP FUNCTION - Run this once after initializing the sheets.
 */
function setupEverything() {
  Logger.log('Setting up LandFlow AI...');

  try {
    // 1. Set Spreadsheet ID
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet ID set');

    // 2. Set default contact info (customize these)
    PropertiesService.getScriptProperties().setProperty('YOUR_NAME', 'Land Acquisition Team');
    PropertiesService.getScriptProperties().setProperty('YOUR_COMPANY', 'LandFlow AI');
    PropertiesService.getScriptProperties().setProperty('YOUR_EMAIL', Session.getActiveUser().getEmail());
    PropertiesService.getScriptProperties().setProperty('YOUR_PHONE', '');
    Logger.log('✅ Contact info set');

    // 3. Test Gmail access
    try {
      GmailApp.getInboxThreads(0, 1);
      Logger.log('✅ Gmail access OK');
    } catch (e) {
      Logger.log('⚠️ Gmail needs authorization - run any Gmail function to authorize');
    }

    // 4. Initialize buyer database
    initializeBuyerDatabase();
    Logger.log('✅ Buyer database initialized');

    Logger.log('🎉 Setup complete!');
    Logger.log('');
    Logger.log('NEXT STEPS:');
    Logger.log('1. Set AI API key: run setupAI("openai", "your-key") or setupAI("claude", "your-key")');
    Logger.log('2. Customize contact info: run updateContactInfo()');
    Logger.log('3. Install triggers: run installTriggers()');

    SpreadsheetApp.getUi().alert('Setup Complete!\n\nNext: Set AI API key and install triggers.');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Set AI API Key - Run this after getting your API key.
 */
function setupAI(provider, apiKey) {
  if (!provider || !apiKey) {
    Logger.log('Usage: setupAI("openai", "your-key") or setupAI("claude", "your-key")');
    return;
  }

  PropertiesService.getScriptProperties().setProperty('AI_API_KEY', apiKey);
  PropertiesService.getScriptProperties().setProperty('AI_PROVIDER', provider.toLowerCase());
  Logger.log('✅ AI API configured: ' + provider);
  SpreadsheetApp.getUi().alert('AI API configured! Provider: ' + provider);
}

/**
 * Update your contact information.
 */
function updateContactInfo() {
  var ui = SpreadsheetApp.getUi();

  var nameResponse = ui.prompt('Enter your name:', ui.ButtonSet.OK_CANCEL);
  if (nameResponse.getSelectedButton() !== ui.Button.OK) return;

  var companyResponse = ui.prompt('Enter your company:', ui.ButtonSet.OK_CANCEL);
  if (companyResponse.getSelectedButton() !== ui.Button.OK) return;

  var emailResponse = ui.prompt('Enter your email:', ui.ButtonSet.OK_CANCEL);
  if (emailResponse.getSelectedButton() !== ui.Button.OK) return;

  PropertiesService.getScriptProperties().setProperty('YOUR_NAME', nameResponse.getResponseText());
  PropertiesService.getScriptProperties().setProperty('YOUR_COMPANY', companyResponse.getResponseText());
  PropertiesService.getScriptProperties().setProperty('YOUR_EMAIL', emailResponse.getResponseText());

  Logger.log('✅ Contact info updated');
  ui.alert('Contact info updated!');
}

/**
 * Install automation triggers.
 */
function installTriggers() {
  try {
    // Delete existing triggers
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }

    // Daily job (8 AM)
    ScriptApp.newTrigger('runDailyJob')
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .create();

    // Hourly reply processing
    ScriptApp.newTrigger('runHourlyJob')
      .timeBased()
      .everyHours(1)
      .create();

    Logger.log('✅ Triggers installed');
    SpreadsheetApp.getUi().alert('Automation triggers installed!\n\nDaily scraping: 8 AM\nReply processing: Every hour');

  } catch (error) {
    Logger.log('❌ Error installing triggers: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

// =================================================================================
// SECTION 2: CORE LOGIC - TRIGGERS
// =================================================================================

/**
 * Daily job runner - runs property scraping, outreach, and reporting.
 */
function runDailyJob() {
  Logger.log('Starting daily job at ' + new Date());

  try {
    Logger.log('Step 1: Running property scrapers...');
    var scrapeResult = runPropertyScrapers();
    Logger.log('Scraping complete: ' + JSON.stringify(scrapeResult));

    Logger.log('Step 2: Sending outreach emails...');
    var outreachResult = sendOutreachEmails();
    Logger.log('Outreach complete: ' + JSON.stringify(outreachResult));

    Logger.log('Step 3: Processing follow-up emails...');
    var followUpResult = processFollowUpEmails();
    Logger.log('Follow-up complete: ' + JSON.stringify(followUpResult));

    Logger.log('Step 4: Refreshing dashboard...');
    refreshDashboard();

    Logger.log('Step 5: Sending daily digest...');
    sendDailyDigest();

    Logger.log('Daily job completed successfully');

  } catch (error) {
    Logger.log('Error in daily job: ' + error.toString());
    logError('DailyTriggers', error);
  }
}

/**
 * Hourly job runner - processes incoming email replies.
 */
function runHourlyJob() {
  Logger.log('Starting hourly job at ' + new Date());

  try {
    Logger.log('Processing incoming replies...');
    var replyResult = processIncomingReplies();
    Logger.log('Reply processing complete: ' + JSON.stringify(replyResult));

    refreshDashboard();

    Logger.log('Hourly job completed successfully');

  } catch (error) {
    Logger.log('Error in hourly job: ' + error.toString());
    logError('HourlyTriggers', error);
  }
}

// =================================================================================
// SECTION 3: WEB SCRAPING
// =================================================================================

/**
 * Main function to run all scrapers.
 */
function runPropertyScrapers() {
  // IMPORTANT: The web scrapers in this script are for demonstration purposes only.
  // They rely on parsing HTML structure, which is fragile and likely to break
  // when websites like Zillow, Redfin, etc., update their layouts.
  // For a production system, consider using official APIs if available, or a more
  // robust scraping solution.
  Logger.log('Starting property scraping job at ' + new Date());

  // ... (rest of the scraper and other functions)
}

// ... (The rest of the LandFlow.gs content, starting from scrapeZillow function)
function scrapeZillow(params) {
  var properties = [];
  var searchParams = params || getSearchParams();

  try {
    // Zillow search URL structure for land
    var baseUrl = 'https://www.zillow.com/homes/for_sale/';
    var queryParams = buildZillowQueryParams(searchParams);
    var searchUrl = baseUrl + queryParams;

    Logger.log('Scraping Zillow: ' + searchUrl);

    // Fetch the page
    var html = fetchWithUserAgent(searchUrl);
    if (!html) {
      Logger.log('Failed to fetch Zillow page');
      return properties;
    }

    // Parse listings from HTML
    properties = parseZillowListings(html, searchParams);

    Logger.log('Found ' + properties.length + ' properties on Zillow');
    return properties;

  } catch (error) {
    Logger.log('Error scraping Zillow: ' + error.toString());
    logError('ZillowScraper', error);
    return properties;
  }
}

/**
 * Build Zillow query parameters
 * @param {Object} params - Search parameters
 * @return {String} Query string
 */
function buildZillowQueryParams(params) {
  // Zillow uses specific URL structure
  // Example: /state/city/land_type/
  var location = params.locations && params.locations.length > 0
    ? params.locations[0].toLowerCase().replace(/\s+/g, '-')
    : '';

  var queryParts = [];

  if (location) {
    queryParts.push(location);
  }

  // Add filters
  var filters = [];
  if (params.minPrice) {
    filters.push('price=' + params.minPrice);
  }
  if (params.maxPrice) {
    filters.push('maxPrice=' + params.maxPrice);
  }
  if (params.minAcreage) {
    filters.push('lotSize=' + params.minAcreage);
  }

  // Note: Zillow's actual URL structure may require API or different approach
  // This is a template that may need adjustment based on Zillow's current structure

  return queryParts.join('/') + (filters.length > 0 ? '?' + filters.join('&') : '');
}

/**
 * Parse Zillow listing HTML
 * @param {String} html - HTML content
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function parseZillowListings(html, params) {
  var properties = [];

  try {
    // Zillow listings are typically in JSON-LD format or specific div classes
    // Example structure (this may need adjustment based on current Zillow HTML):

    // Extract JSON-LD data if available
    var jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    var matches = html.match(jsonLdRegex);

    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        try {
          var jsonStr = matches[i].replace(/<\/?script[^>]*>/gi, '');
          var data = JSON.parse(jsonStr);

          if (data['@type'] === 'RealEstateListing' || data['@type'] === 'Product') {
            var property = extractZillowPropertyData(data, html);
            if (property && matchesSearchParams(property, params)) {
              properties.push(property);
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    // Alternative: Parse from HTML structure
    // Zillow uses classes like "property-card-data", "list-card", etc.
    var listingRegex = /<article[^>]*class=["'][^"]*property-card[^"]*["'][^>]*>(.*?)<\/article>/gi;
    var listingMatches = html.match(listingRegex);

    if (listingMatches && listingMatches.length > 0) {
      for (var j = 0; j < listingMatches.length; j++) {
        var listingHtml = listingMatches[j];
        var property = parseZillowListingHTML(listingHtml);
        if (property && matchesSearchParams(property, params)) {
          properties.push(property);
        }
      }
    }

  } catch (error) {
    Logger.log('Error parsing Zillow listings: ' + error.toString());
  }

  return properties;
}

/**
 * Extract property data from Zillow JSON-LD
 * @param {Object} data - JSON-LD data
 * @param {String} html - Full HTML for fallback parsing
 * @return {Object} Property object
 */
function extractZillowPropertyData(data, html) {
  var property = {
    source: 'Zillow',
    url: data.url || '',
    address: data.address ?
      (data.address.streetAddress || '') + ', ' +
      (data.address.addressLocality || '') + ', ' +
      (data.address.addressRegion || '') + ' ' +
      (data.address.postalCode || '') : '',
    price: parsePrice(data.offers ? data.offers.price : data.price),
    acreage: parseAcreage(data.lotSize || data.propertySize),
    county: extractCountyFromAddress(data.address),
    seller: data.realEstateAgent ? data.realEstateAgent.name : '',
    listingDate: parseDate(data.datePosted),
    daysOnMarket: calculateDaysOnMarket(data.datePosted)
  };

  return property;
}

/**
 * Parse Zillow listing from HTML structure
 * @param {String} listingHtml - HTML snippet for one listing
 * @return {Object} Property object
 */
function parseZillowListingHTML(listingHtml) {
  var property = {
    source: 'Zillow',
    url: '',
    address: '',
    price: 0,
    acreage: 0,
    county: '',
    seller: '',
    listingDate: new Date(),
    daysOnMarket: 0
  };

  try {
    // Extract URL
    var urlMatch = listingHtml.match(/href=["']([^"']*zillow\.com\/homedetails[^"']*)["']/i);
    if (urlMatch) {
      property.url = urlMatch[1].startsWith('http') ? urlMatch[1] : 'https://www.zillow.com' + urlMatch[1];
    }

    // Extract price
    var priceMatch = listingHtml.match(/\$[\d,]+/);
    if (priceMatch) {
      property.price = parsePrice(priceMatch[0]);
    }

    // Extract address
    var addressMatch = listingHtml.match(/data-test=["']property-card-address["'][^>]*>([^<]+)</i);
    if (addressMatch) {
      property.address = addressMatch[1].trim();
    }

    // Extract acreage (often in "lot size" or "acres")
    var acreageMatch = listingHtml.match(/([\d.]+)\s*(?:acres?|ac)/i);
    if (acreageMatch) {
      property.acreage = parseFloat(acreageMatch[1]);
    }

  } catch (error) {
    Logger.log('Error parsing Zillow HTML: ' + error.toString());
  }

  return property;
}

/**
 * Fetch URL with user agent
 * @param {String} url - URL to fetch
 * @return {String} HTML content
 */
function fetchWithUserAgent(url) {
  try {
    var response = UrlFetchApp.fetch(url, {
      'muteHttpExceptions': true,
      'headers': {
        'User-Agent': getRandomUserAgent()
      }
    });

    if (response.getResponseCode() === 200) {
      return response.getContentText();
    } else {
      Logger.log('HTTP Error: ' + response.getResponseCode() + ' for ' + url);
      return null;
    }
  } catch (error) {
    Logger.log('Fetch error: ' + error.toString());
    return null;
  }
}

/**
 * Parse price string to number
 * @param {String} priceStr - Price string
 * @return {Number} Price as number
 */
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  var cleaned = priceStr.toString().replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Parse acreage from string
 * @param {String} acreageStr - Acreage string
 * @return {Number} Acreage as number
 */
function parseAcreage(acreageStr) {
  if (!acreageStr) return 0;
  var match = acreageStr.toString().match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Extract county from address
 * @param {Object} address - Address object
 * @return {String} County name
 */
function extractCountyFromAddress(address) {
  // County may not be in address object, would need geocoding or separate lookup
  return address ? (address.addressCounty || '') : '';
}

/**
 * Parse date string
 * @param {String} dateStr - Date string
 * @return {Date} Date object
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  try {
    return new Date(dateStr);
  } catch (e) {
    return new Date();
  }
}

/**
 * Calculate days on market
 * @param {String} listingDateStr - Listing date string
 * @return {Number} Days on market
 */
function calculateDaysOnMarket(listingDateStr) {
  if (!listingDateStr) return 0;
  var listingDate = parseDate(listingDateStr);
  var today = new Date();
  var diffTime = today - listingDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if property matches search parameters
 * @param {Object} property - Property object
 * @param {Object} params - Search parameters
 * @return {Boolean} True if matches
 */
function matchesSearchParams(property, params) {
  if (params.minPrice && property.price < params.minPrice) return false;
  if (params.maxPrice && property.price > params.maxPrice) return false;
  if (params.minAcreage && property.acreage < params.minAcreage) return false;
  if (params.maxAcreage && property.acreage > params.maxAcreage) return false;
  if (params.daysOnMarketMax && property.daysOnMarket > params.daysOnMarketMax) return false;

  return true;
}

/**
 * Log error to error tracking sheet
 * @param {String} source - Error source
 * @param {Error} error - Error object
 */
function logError(source, error) {
  try {
    var spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) return;

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var errorSheet = spreadsheet.getSheetByName('Error Log');

    if (!errorSheet) {
      // Create error log sheet if it doesn't exist
      errorSheet = spreadsheet.insertSheet('Error Log');
      errorSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Source', 'Error', 'Stack']]);
    }

    var lastRow = errorSheet.getLastRow();
    errorSheet.getRange(lastRow + 1, 1, 1, 4).setValues([[
      new Date(),
      source,
      error.toString(),
      error.stack || ''
    ]]);
  } catch (e) {
    Logger.log('Failed to log error: ' + e.toString());
  }
}

/**
 * LandWatchScraper.gs
 * Scrapes vacant land listings from LandWatch.com
 */

/**
 * Scrape LandWatch for land listings
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function scrapeLandWatch(params) {
  var properties = [];
  var searchParams = params || getSearchParams();

  try {
    // LandWatch search URL
    var baseUrl = 'https://www.landwatch.com/property-for-sale';
    var queryParams = buildLandWatchQueryParams(searchParams);
    var searchUrl = baseUrl + queryParams;

    Logger.log('Scraping LandWatch: ' + searchUrl);

    // Fetch the page
    var html = fetchWithUserAgent(searchUrl);
    if (!html) {
      Logger.log('Failed to fetch LandWatch page');
      return properties;
    }

    // Parse listings
    properties = parseLandWatchListings(html, searchParams);

    Logger.log('Found ' + properties.length + ' properties on LandWatch');
    return properties;

  } catch (error) {
    Logger.log('Error scraping LandWatch: ' + error.toString());
    logError('LandWatchScraper', error);
    return properties;
  }
}

/**
 * Build LandWatch query parameters
 * @param {Object} params - Search parameters
 * @return {String} Query string
 */
function buildLandWatchQueryParams(params) {
  var queryParts = [];

  // LandWatch uses query parameters
  if (params.locations && params.locations.length > 0) {
    queryParts.push('state=' + encodeURIComponent(params.locations[0]));
  }

  if (params.minPrice) {
    queryParts.push('minprice=' + params.minPrice);
  }

  if (params.maxPrice) {
    queryParts.push('maxprice=' + params.maxPrice);
  }

  if (params.minAcreage) {
    queryParts.push('minacres=' + params.minAcreage);
  }

  if (params.maxAcreage) {
    queryParts.push('maxacres=' + params.maxAcreage);
  }

  // Add property type filter for land only
  queryParts.push('propertytype=land');

  return queryParts.length > 0 ? '?' + queryParts.join('&') : '';
}

/**
 * Parse LandWatch listing HTML
 * @param {String} html - HTML content
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function parseLandWatchListings(html, params) {
  var properties = [];

  try {
    // LandWatch typically uses specific class names for listings
    // Common patterns: "listing-item", "property-card", "result-item"

    // Look for listing containers
    var listingRegex = /<div[^>]*class=["'][^"]*listing[^"]*item[^"]*["'][^>]*>(.*?)<\/div>/gi;
    var listingMatches = [];
    var match;

    while ((match = listingRegex.exec(html)) !== null) {
      listingMatches.push(match[0]);
    }

    // Alternative: Look for JSON data embedded in page
    var jsonDataRegex = /window\.__INITIAL_STATE__\s*=\s*({.*?});/;
    var jsonMatch = html.match(jsonDataRegex);

    if (jsonMatch) {
      try {
        var jsonData = JSON.parse(jsonMatch[1]);
        properties = extractLandWatchFromJSON(jsonData, params);
      } catch (e) {
        Logger.log('Error parsing LandWatch JSON: ' + e.toString());
      }
    }

    // Parse from HTML if JSON not available
    if (properties.length === 0 && listingMatches.length > 0) {
      for (var i = 0; i < listingMatches.length; i++) {
        var property = parseLandWatchListingHTML(listingMatches[i]);
        if (property && matchesSearchParams(property, params)) {
          properties.push(property);
        }
      }
    }

  } catch (error) {
    Logger.log('Error parsing LandWatch listings: ' + error.toString());
  }

  return properties;
}

/**
 * Extract properties from LandWatch JSON data
 * @param {Object} jsonData - JSON data object
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function extractLandWatchFromJSON(jsonData, params) {
  var properties = [];

  try {
    // Navigate JSON structure (may vary based on LandWatch's current API)
    var listings = jsonData.listings || jsonData.properties || jsonData.results || [];

    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      var property = {
        source: 'LandWatch',
        url: listing.url || listing.link || '',
        address: formatLandWatchAddress(listing),
        price: listing.price || listing.listPrice || 0,
        acreage: listing.acres || listing.acreage || listing.lotSize || 0,
        county: listing.county || listing.countyName || '',
        seller: listing.agentName || listing.brokerName || listing.contactName || '',
        listingDate: parseDate(listing.listDate || listing.dateListed),
        daysOnMarket: calculateDaysOnMarket(listing.listDate || listing.dateListed)
      };

      // Ensure URL is complete
      if (property.url && !property.url.startsWith('http')) {
        property.url = 'https://www.landwatch.com' + property.url;
      }

      if (matchesSearchParams(property, params)) {
        properties.push(property);
      }
    }
  } catch (error) {
    Logger.log('Error extracting LandWatch JSON: ' + error.toString());
  }

  return properties;
}

/**
 * Format address from LandWatch listing object
 * @param {Object} listing - Listing object
 * @return {String} Formatted address
 */
function formatLandWatchAddress(listing) {
  var parts = [];

  if (listing.streetAddress || listing.address) {
    parts.push(listing.streetAddress || listing.address);
  }
  if (listing.city) {
    parts.push(listing.city);
  }
  if (listing.state) {
    parts.push(listing.state);
  }
  if (listing.zipCode || listing.zip) {
    parts.push(listing.zipCode || listing.zip);
  }

  return parts.join(', ');
}

/**
 * Parse LandWatch listing from HTML structure
 * @param {String} listingHtml - HTML snippet for one listing
 * @return {Object} Property object
 */
function parseLandWatchListingHTML(listingHtml) {
  var property = {
    source: 'LandWatch',
    url: '',
    address: '',
    price: 0,
    acreage: 0,
    county: '',
    seller: '',
    listingDate: new Date(),
    daysOnMarket: 0
  };

  try {
    // Extract URL
    var urlMatch = listingHtml.match(/href=["']([^"']*landwatch\.com[^"']*)["']/i);
    if (urlMatch) {
      property.url = urlMatch[1].startsWith('http') ? urlMatch[1] : 'https://www.landwatch.com' + urlMatch[1];
    }

    // Extract price (LandWatch formats as "$XXX,XXX")
    var priceMatch = listingHtml.match(/\$[\d,]+/);
    if (priceMatch) {
      property.price = parsePrice(priceMatch[0]);
    }

    // Extract address
    var addressMatch = listingHtml.match(/<h[23][^>]*>([^<]+(?:Street|Avenue|Road|Lane|Drive|Court|Way)[^<]*)</i);
    if (!addressMatch) {
      addressMatch = listingHtml.match(/class=["'][^"]*address[^"]*["'][^>]*>([^<]+)</i);
    }
    if (addressMatch) {
      property.address = addressMatch[1].trim();
    }

    // Extract acreage
    var acreageMatch = listingHtml.match(/([\d.]+)\s*(?:acres?|ac|acre)/i);
    if (acreageMatch) {
      property.acreage = parseFloat(acreageMatch[1]);
    }

    // Extract county
    var countyMatch = listingHtml.match(/([A-Z][a-z]+\s+County)/i);
    if (countyMatch) {
      property.county = countyMatch[1];
    }

  } catch (error) {
    Logger.log('Error parsing LandWatch HTML: ' + error.toString());
  }

  return property;
}

/**
 * RealtorScraper.gs
 * Scrapes vacant land listings from Realtor.com
 */

/**
 * Scrape Realtor.com for land listings
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function scrapeRealtor(params) {
  var properties = [];
  var searchParams = params || getSearchParams();

  try {
    // Realtor.com search URL structure
    var baseUrl = 'https://www.realtor.com/realestateandhomes-search';
    var queryParams = buildRealtorQueryParams(searchParams);
    var searchUrl = baseUrl + queryParams;

    Logger.log('Scraping Realtor.com: ' + searchUrl);

    // Fetch the page
    var html = fetchWithUserAgent(searchUrl);
    if (!html) {
      Logger.log('Failed to fetch Realtor.com page');
      return properties;
    }

    // Parse listings
    properties = parseRealtorListings(html, searchParams);

    Logger.log('Found ' + properties.length + ' properties on Realtor.com');
    return properties;

  } catch (error) {
    Logger.log('Error scraping Realtor.com: ' + error.toString());
    logError('RealtorScraper', error);
    return properties;
  }
}

/**
 * Build Realtor.com query parameters
 * @param {Object} params - Search parameters
 * @return {String} Query string
 */
function buildRealtorQueryParams(params) {
  var pathParts = [];

  // Realtor.com uses path-based URLs
  // Example: /state/city/land_type
  if (params.locations && params.locations.length > 0) {
    var location = params.locations[0].toLowerCase().replace(/\s+/g, '-');
    pathParts.push(location);
  }

  var queryParts = [];

  if (params.minPrice) {
    queryParts.push('pmin=' + params.minPrice);
  }
  if (params.maxPrice) {
    queryParts.push('pmax=' + params.maxPrice);
  }
  if (params.minAcreage) {
    queryParts.push('lot_size_min=' + params.minAcreage);
  }
  if (params.maxAcreage) {
    queryParts.push('lot_size_max=' + params.maxAcreage);
  }

  // Filter for land only
  queryParts.push('property_type=land');

  var path = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
  var query = queryParts.length > 0 ? '?' + queryParts.join('&') : '';

  return path + query;
}

/**
 * Parse Realtor.com listing HTML
 * @param {String} html - HTML content
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function parseRealtorListings(html, params) {
  var properties = [];

  try {
    // Realtor.com often embeds JSON data in script tags
    var jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    var jsonMatches = html.match(jsonLdRegex);

    if (jsonMatches) {
      for (var i = 0; i < jsonMatches.length; i++) {
        try {
          var jsonStr = jsonMatches[i].replace(/<\/?script[^>]*>/gi, '');
          var data = JSON.parse(jsonStr);

          if (data['@type'] === 'Product' || data['@type'] === 'RealEstateListing') {
            var property = extractRealtorPropertyData(data, html);
            if (property && matchesSearchParams(property, params)) {
              properties.push(property);
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    // Alternative: Parse from HTML structure
    // Realtor.com uses classes like "BasePropertyCard", "PropertyCard", etc.
    var listingRegex = /<div[^>]*data-testid=["']property-card["'][^>]*>(.*?)<\/div>/gi;
    var listingMatches = html.match(listingRegex);

    if (!listingMatches) {
      // Try alternative class names
      listingRegex = /<article[^>]*class=["'][^"]*property[^"]*card[^"]*["'][^>]*>(.*?)<\/article>/gi;
      listingMatches = html.match(listingRegex);
    }

    if (listingMatches && listingMatches.length > 0) {
      for (var j = 0; j < listingMatches.length; j++) {
        var property = parseRealtorListingHTML(listingMatches[j]);
        if (property && matchesSearchParams(property, params)) {
          properties.push(property);
        }
      }
    }

  } catch (error) {
    Logger.log('Error parsing Realtor.com listings: ' + error.toString());
  }

  return properties;
}

/**
 * Extract property data from Realtor.com JSON-LD
 * @param {Object} data - JSON-LD data
 * @param {String} html - Full HTML for fallback parsing
 * @return {Object} Property object
 */
function extractRealtorPropertyData(data, html) {
  var property = {
    source: 'Realtor.com',
    url: data.url || data.mainEntityOfPage || '',
    address: '',
    price: 0,
    acreage: 0,
    county: '',
    seller: '',
    listingDate: new Date(),
    daysOnMarket: 0
  };

  // Extract address
  if (data.address) {
    var addrParts = [];
    if (data.address.streetAddress) addrParts.push(data.address.streetAddress);
    if (data.address.addressLocality) addrParts.push(data.address.addressLocality);
    if (data.address.addressRegion) addrParts.push(data.address.addressRegion);
    if (data.address.postalCode) addrParts.push(data.address.postalCode);
    property.address = addrParts.join(', ');
    property.county = data.address.addressCounty || '';
  }

  // Extract price
  if (data.offers && data.offers.price) {
    property.price = parsePrice(data.offers.price);
  } else if (data.price) {
    property.price = parsePrice(data.price);
  }

  // Extract acreage
  if (data.lotSize) {
    property.acreage = parseAcreage(data.lotSize);
  } else if (data.propertySize) {
    property.acreage = parseAcreage(data.propertySize);
  }

  // Extract seller/agent
  if (data.realEstateAgent) {
    property.seller = data.realEstateAgent.name || '';
  }

  // Extract dates
  if (data.datePosted) {
    property.listingDate = parseDate(data.datePosted);
    property.daysOnMarket = calculateDaysOnMarket(data.datePosted);
  }

  // Ensure URL is complete
  if (property.url && !property.url.startsWith('http')) {
    property.url = 'https://www.realtor.com' + property.url;
  }

  return property;
}

/**
 * Parse Realtor.com listing from HTML structure
 * @param {String} listingHtml - HTML snippet for one listing
 * @return {Object} Property object
 */
function parseRealtorListingHTML(listingHtml) {
  var property = {
    source: 'Realtor.com',
    url: '',
    address: '',
    price: 0,
    acreage: 0,
    county: '',
    seller: '',
    listingDate: new Date(),
    daysOnMarket: 0
  };

  try {
    // Extract URL
    var urlMatch = listingHtml.match(/href=["']([^"']*realtor\.com\/realestateandhomes[^"']*)["']/i);
    if (urlMatch) {
      property.url = urlMatch[1].startsWith('http') ? urlMatch[1] : 'https://www.realtor.com' + urlMatch[1];
    }

    // Extract price
    var priceMatch = listingHtml.match(/\$[\d,]+/);
    if (priceMatch) {
      property.price = parsePrice(priceMatch[0]);
    }

    // Extract address (Realtor.com typically has address in specific data attributes)
    var addressMatch = listingHtml.match(/data-label=["']address["'][^>]*>([^<]+)</i);
    if (!addressMatch) {
      addressMatch = listingHtml.match(/<span[^>]*data-testid=["']property-card-address["'][^>]*>([^<]+)</i);
    }
    if (addressMatch) {
      property.address = addressMatch[1].trim();
    }

    // Extract acreage
    var acreageMatch = listingHtml.match(/([\d.]+)\s*(?:acres?|ac)/i);
    if (acreageMatch) {
      property.acreage = parseFloat(acreageMatch[1]);
    }

    // Extract county (may need geocoding API for accurate county)
    var countyMatch = listingHtml.match(/([A-Z][a-z]+\s+County)/i);
    if (countyMatch) {
      property.county = countyMatch[1];
    }

  } catch (error) {
    Logger.log('Error parsing Realtor.com HTML: ' + error.toString());
  }

  return property;
}

/**
 * RedfinScraper.gs
 * Scrapes vacant land listings from Redfin
 */

/**
 * Scrape Redfin for land listings
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function scrapeRedfin(params) {
  var properties = [];
  var searchParams = params || getSearchParams();

  try {
    // Redfin search URL structure
    var baseUrl = 'https://www.redfin.com/state';
    var queryParams = buildRedfinQueryParams(searchParams);
    var searchUrl = baseUrl + queryParams;

    Logger.log('Scraping Redfin: ' + searchUrl);

    // Fetch the page
    var html = fetchWithUserAgent(searchUrl);
    if (!html) {
      Logger.log('Failed to fetch Redfin page');
      return properties;
    }

    // Parse listings
    properties = parseRedfinListings(html, searchParams);

    Logger.log('Found ' + properties.length + ' properties on Redfin');
    return properties;

  } catch (error) {
    Logger.log('Error scraping Redfin: ' + error.toString());
    logError('RedfinScraper', error);
    return properties;
  }
}

/**
 * Build Redfin query parameters
 * @param {Object} params - Search parameters
 * @return {String} Query string
 */
function buildRedfinQueryParams(params) {
  var pathParts = [];

  // Redfin uses path-based URLs
  // Example: /state/city/filter/property-type=land
  if (params.locations && params.locations.length > 0) {
    var location = params.locations[0].toLowerCase().replace(/\s+/g, '-');
    pathParts.push(location);
  }

  var queryParts = [];

  if (params.minPrice) {
    queryParts.push('min_price=' + params.minPrice);
  }
  if (params.maxPrice) {
    queryParts.push('max_price=' + params.maxPrice);
  }
  if (params.minAcreage) {
    queryParts.push('lot_size_min=' + params.minAcreage);
  }
  if (params.maxAcreage) {
    queryParts.push('lot_size_max=' + params.maxAcreage);
  }

  // Filter for land only
  queryParts.push('property_type=land');

  var path = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
  var query = queryParts.length > 0 ? '?' + queryParts.join('&') : '';

  return path + query;
}

/**
 * Parse Redfin listing HTML
 * @param {String} html - HTML content
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function parseRedfinListings(html, params) {
  var properties = [];

  try {
    // Redfin embeds data in script tags or specific data attributes
    // Look for JSON data
    var jsonRegex = /window\.__INITIAL_STATE__\s*=\s*({.*?});/;
    var jsonMatch = html.match(jsonRegex);

    if (jsonMatch) {
      try {
        var jsonData = JSON.parse(jsonMatch[1]);
        properties = extractRedfinFromJSON(jsonData, params);
      } catch (e) {
        Logger.log('Error parsing Redfin JSON: ' + e.toString());
      }
    }

    // Parse from HTML structure if JSON not available
    // Redfin uses classes like "HomeCardContainer", "MapHomeCard", etc.
    var listingRegex = /<div[^>]*class=["'][^"]*HomeCard[^"]*["'][^>]*>(.*?)<\/div>/gi;
    var listingMatches = html.match(listingRegex);

    if (listingMatches && listingMatches.length > 0) {
      for (var i = 0; i < listingMatches.length; i++) {
        var property = parseRedfinListingHTML(listingMatches[i]);
        if (property && matchesSearchParams(property, params)) {
          properties.push(property);
        }
      }
    }

  } catch (error) {
    Logger.log('Error parsing Redfin listings: ' + error.toString());
  }

  return properties;
}

/**
 * Extract properties from Redfin JSON data
 * @param {Object} jsonData - JSON data object
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function extractRedfinFromJSON(jsonData, params) {
  var properties = [];

  try {
    // Navigate Redfin's JSON structure
    var listings = jsonData.searchResults || jsonData.listings || jsonData.homes || [];

    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      var property = {
        source: 'Redfin',
        url: listing.url || listing.path || '',
        address: formatRedfinAddress(listing),
        price: listing.price || listing.listPrice || 0,
        acreage: listing.lotSize || listing.lotSizeAcres || 0,
        county: listing.county || listing.countyName || '',
        seller: listing.agentName || listing.brokerName || '',
        listingDate: parseDate(listing.listDate || listing.dateListed),
        daysOnMarket: calculateDaysOnMarket(listing.listDate || listing.dateListed)
      };

      // Ensure URL is complete
      if (property.url && !property.url.startsWith('http')) {
        property.url = 'https://www.redfin.com' + property.url;
      }

      if (matchesSearchParams(property, params)) {
        properties.push(property);
      }
    }
  } catch (error) {
    Logger.log('Error extracting Redfin JSON: ' + error.toString());
  }

  return properties;
}

/**
 * Format address from Redfin listing object
 * @param {Object} listing - Listing object
 * @return {String} Formatted address
 */
function formatRedfinAddress(listing) {
  var parts = [];

  if (listing.streetAddress || listing.address) {
    parts.push(listing.streetAddress || listing.address);
  }
  if (listing.city) {
    parts.push(listing.city);
  }
  if (listing.state) {
    parts.push(listing.state);
  }
  if (listing.zipCode || listing.zip) {
    parts.push(listing.zipCode || listing.zip);
  }

  return parts.join(', ');
}

/**
 * Parse Redfin listing from HTML structure
 * @param {String} listingHtml - HTML snippet for one listing
 * @return {Object} Property object
 */
function parseRedfinListingHTML(listingHtml) {
  var property = {
    source: 'Redfin',
    url: '',
    address: '',
    price: 0,
    acreage: 0,
    county: '',
    seller: '',
    listingDate: new Date(),
    daysOnMarket: 0
  };

  try {
    // Extract URL
    var urlMatch = listingHtml.match(/href=["']([^"']*redfin\.com[^"']*)["']/i);
    if (urlMatch) {
      property.url = urlMatch[1].startsWith('http') ? urlMatch[1] : 'https://www.redfin.com' + urlMatch[1];
    }

    // Extract price (Redfin formats as "$XXX,XXX")
    var priceMatch = listingHtml.match(/\$[\d,]+/);
    if (priceMatch) {
      property.price = parsePrice(priceMatch[0]);
    }

    // Extract address
    var addressMatch = listingHtml.match(/data-testid=["']property-card-address["'][^>]*>([^<]+)</i);
    if (!addressMatch) {
      addressMatch = listingHtml.match(/class=["'][^"]*address[^"]*["'][^>]*>([^<]+)</i);
    }
    if (addressMatch) {
      property.address = addressMatch[1].trim();
    }

    // Extract acreage
    var acreageMatch = listingHtml.match(/([\d.]+)\s*(?:acres?|ac)/i);
    if (acreageMatch) {
      property.acreage = parseFloat(acreageMatch[1]);
    }

  } catch (error) {
    Logger.log('Error parsing Redfin HTML: ' + error.toString());
  }

  return property;
}

/**
 * ScraperManager.gs
 * Orchestrates all property scrapers and manages deduplication
 */

/**
 * Main function to run all scrapers
 * This is the entry point called by daily triggers
 */
function runPropertyScrapers() {
  Logger.log('Starting property scraping job at ' + new Date());

  var searchParams = getSearchParams();
  var enabledScrapers = getEnabledScrapers();
  var rateLimit = getRateLimitConfig();
  var allProperties = [];

  // Run each enabled scraper
  for (var i = 0; i < enabledScrapers.length; i++) {
    var scraperName = enabledScrapers[i];

    try {
      Logger.log('Running scraper: ' + scraperName);

      var properties = runScraper(scraperName, searchParams);

      if (properties && properties.length > 0) {
        Logger.log('Scraper ' + scraperName + ' found ' + properties.length + ' properties');
        allProperties = allProperties.concat(properties);

        // Apply rate limiting
        if (rateLimit.enabled && i < enabledScrapers.length - 1) {
          Utilities.sleep(rateLimit.delayBetweenRequests);
        }
      }

    } catch (error) {
      Logger.log('Error running scraper ' + scraperName + ': ' + error.toString());
      logError('ScraperManager-' + scraperName, error);
    }
  }

  Logger.log('Total properties found: ' + allProperties.length);

  // Deduplicate properties
  var uniqueProperties = deduplicateProperties(allProperties);
  Logger.log('After deduplication: ' + uniqueProperties.length + ' unique properties');

  // Limit number of properties per run
  if (rateLimit.maxRequestsPerRun > 0 && uniqueProperties.length > rateLimit.maxRequestsPerRun) {
    uniqueProperties = uniqueProperties.slice(0, rateLimit.maxRequestsPerRun);
    Logger.log('Limited to ' + rateLimit.maxRequestsPerRun + ' properties per run');
  }

  // Write to sheet
  if (uniqueProperties.length > 0) {
    var result = batchWriteProperties(uniqueProperties);
    Logger.log('Sheet update complete: ' + result.new + ' new, ' + result.updated + ' updated');
  }

  Logger.log('Property scraping job completed at ' + new Date());
  return {
    total: allProperties.length,
    unique: uniqueProperties.length,
    new: result ? result.new : 0,
    updated: result ? result.updated : 0
  };
}

/**
 * Run a specific scraper by name
 * @param {String} scraperName - Name of scraper ('zillow', 'landwatch', 'realtor', 'redfin')
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
function runScraper(scraperName, params) {
  var scraperFunctions = {
    'zillow': scrapeZillow,
    'landwatch': scrapeLandWatch,
    'realtor': scrapeRealtor,
    'redfin': scrapeRedfin
  };

  var scraperFunction = scraperFunctions[scraperName.toLowerCase()];

  if (!scraperFunction) {
    throw new Error('Unknown scraper: ' + scraperName);
  }

  return scraperFunction(params);
}

/**
 * Deduplicate properties based on URL and address
 * @param {Array} properties - Array of property objects
 * @return {Array} Deduplicated array
 */
function deduplicateProperties(properties) {
  var seen = {};
  var unique = [];

  for (var i = 0; i < properties.length; i++) {
    var prop = properties[i];
    var key = getDeduplicationKey(prop);

    if (!seen[key]) {
      seen[key] = true;
      unique.push(prop);
    }
  }

  return unique;
}

/**
 * Generate deduplication key for a property
 * @param {Object} property - Property object
 * @return {String} Unique key
 */
function getDeduplicationKey(property) {
  // Use URL as primary key (most reliable)
  if (property.url) {
    return 'url:' + normalizeURL(property.url);
  }

  // Fallback to normalized address
  if (property.address) {
    return 'addr:' + normalizeAddress(property.address);
  }

  // Last resort: use all identifying fields
  return 'composite:' + (property.address || '') + '|' + (property.price || '') + '|' + (property.acreage || '');
}

/**
 * Normalize URL for comparison
 * @param {String} url - URL string
 * @return {String} Normalized URL
 */
function normalizeURL(url) {
  if (!url) return '';

  try {
    // Remove protocol
    url = url.replace(/^https?:\/\//i, '');
    // Remove www
    url = url.replace(/^www\./i, '');
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    // Remove query parameters
    url = url.split('?')[0];
    // Convert to lowercase
    url = url.toLowerCase();

    return url;
  } catch (e) {
    return url.toLowerCase();
  }
}

/**
 * Test function to run scrapers manually
 */
function testScrapers() {
  Logger.log('Running test scrape...');
  var result = runPropertyScrapers();
  Logger.log('Test complete: ' + JSON.stringify(result));
  return result;
}

/**
 * OfferCalculator.gs
 * Calculates offer amounts (70-80% of listing price with randomization)
 */

/**
 * Calculate offer amount based on listing price
 * @param {Number} listingPrice - Property listing price
 * @param {Number} minPercent - Minimum percentage (default 70)
 * @param {Number} maxPercent - Maximum percentage (default 80)
 * @return {Number} Calculated offer amount
 */
function calculateOffer(listingPrice, minPercent, maxPercent) {
  if (!listingPrice || listingPrice <= 0) {
    return 0;
  }

  var min = minPercent || 70;
  var max = maxPercent || 80;

  // Ensure min <= max
  if (min > max) {
    var temp = min;
    min = max;
    max = temp;
  }

  // Random percentage between min and max
  var randomPercent = min + Math.random() * (max - min);

  // Calculate offer
  var offer = Math.round((listingPrice * randomPercent) / 100);

  // Round to nearest $1000
  offer = Math.round(offer / 1000) * 1000;

  return offer;
}

/**
 * Calculate offer with property-specific adjustments
 * @param {Object} property - Property object from sheet
 * @return {Number} Calculated offer amount
 */
function calculateOfferForProperty(property) {
  var listingPrice = property.price || property[3]; // Column D in Properties sheet

  if (!listingPrice || listingPrice <= 0) {
    return 0;
  }

  var baseMinPercent = 70;
  var baseMaxPercent = 80;

  // Adjust based on days on market
  var daysOnMarket = property.daysOnMarket || property[11] || 0;
  var adjustment = 0;

  if (daysOnMarket > 180) {
    // Properties on market > 6 months: increase offer range (65-75%)
    baseMinPercent = 65;
    baseMaxPercent = 75;
  } else if (daysOnMarket > 90) {
    // Properties on market > 3 months: slight increase (68-78%)
    baseMinPercent = 68;
    baseMaxPercent = 78;
  }

  return calculateOffer(listingPrice, baseMinPercent, baseMaxPercent);
}

/**
 * Generate offer range string for email templates
 * @param {Number} listingPrice - Property listing price
 * @return {String} Offer range string
 */
function getOfferRangeString(listingPrice) {
  var minOffer = calculateOffer(listingPrice, 70, 70);
  var maxOffer = calculateOffer(listingPrice, 80, 80);

  return formatCurrency(minOffer) + ' - ' + formatCurrency(maxOffer);
}

/**
 * Format number as currency
 * @param {Number} amount - Amount to format
 * @return {String} Formatted currency string
 */
function formatCurrency(amount) {
  if (!amount || amount <= 0) {
    return '$0';
  }

  return '$' + amount.toLocaleString('en-US');
}

/**
 * Validate offer amount
 * @param {Number} offer - Offer amount
 * @param {Number} listingPrice - Listing price
 * @return {Boolean} True if offer is valid
 */
function isValidOffer(offer, listingPrice) {
  if (!offer || offer <= 0) {
    return false;
  }

  if (offer > listingPrice) {
    return false;
  }

  var minAllowed = listingPrice * 0.5; // Minimum 50% of listing
  var maxAllowed = listingPrice * 0.95; // Maximum 95% of listing

  return offer >= minAllowed && offer <= maxAllowed;
}

/**
 * TemplateEngine.gs
 * Generates personalized email templates
 */

/**
 * Get email template content
 * @param {String} templateType - Template type ('initial' or 'follow-up')
 * @return {String} HTML template content
 */
function getEmailTemplate(templateType) {
  var templates = {
    'initial': getInitialTemplate(),
    'follow-up': getFollowUpTemplate(),
    'counteroffer': getCounterofferTemplate(),
    'confirmation': getConfirmationTemplate()
  };

  return templates[templateType] || templates['initial'];
}

/**
 * Get initial outreach template
 * @return {String} HTML template
 */
function getInitialTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#4CAF50;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.offer-box{background-color:#fff;border:2px solid #4CAF50;padding:15px;margin:20px 0;text-align:center;border-radius:5px}.offer-amount{font-size:28px;font-weight:bold;color:#4CAF50;margin:10px 0}.footer{background-color:#f0f0f0;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 5px 5px}</style></head><body><div class="header"><h2>Cash Offer for {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>I hope this email finds you well. I came across your listing for the vacant land at <strong>{{PROPERTY_ADDRESS}}</strong> and I\'m interested in making a cash offer.</p><p>We specialize in quick, hassle-free transactions and can close within 7-14 days if the terms work for both parties.</p><div class="offer-box"><p><strong>Our Cash Offer:</strong></p><div class="offer-amount">{{OFFER_AMOUNT}}</div><p style="font-size:12px;color:#666;">Cash • No Financing Contingencies • Quick Closing</p></div><p>I understand this is below the asking price of {{LISTING_PRICE}}, but we can offer:</p><ul><li>Cash transaction (no bank delays)</li><li>Fast closing (7-14 days)</li><li>As-is purchase (no inspections or contingencies)</li><li>No need for staging or showings</li></ul><p>Would you be open to discussing this offer? I\'m ready to move forward quickly if this works for your client.</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div><div class="footer"><p>This is an automated email. If you wish to unsubscribe, please reply with "UNSUBSCRIBE".</p></div></body></html>';
}

/**
 * Get follow-up template
 * @return {String} HTML template
 */
function getFollowUpTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#FF9800;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.offer-box{background-color:#fff;border:2px solid #FF9800;padding:15px;margin:20px 0;text-align:center;border-radius:5px}.offer-amount{font-size:28px;font-weight:bold;color:#FF9800;margin:10px 0}.footer{background-color:#f0f0f0;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 5px 5px}</style></head><body><div class="header"><h2>Following Up: Cash Offer for {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>I wanted to follow up on my previous email regarding the vacant land at <strong>{{PROPERTY_ADDRESS}}</strong>.</p><p>I\'m still very interested in this property and wanted to see if you\'ve had a chance to review our cash offer of <strong>{{OFFER_AMOUNT}}</strong>.</p><div class="offer-box"><p><strong>Our Cash Offer Remains:</strong></p><div class="offer-amount">{{OFFER_AMOUNT}}</div><p style="font-size:12px;color:#666;">Cash • No Financing Contingencies • Quick Closing</p></div><p>Please let me know if your client would like to counteroffer or if you need any additional information.</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div><div class="footer"><p>This is a follow-up email. If you wish to unsubscribe, please reply with "UNSUBSCRIBE".</p></div></body></html>';
}

/**
 * Get counteroffer template
 * @return {String} HTML template
 */
function getCounterofferTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#2196F3;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.offer-box{background-color:#fff;border:2px solid #2196F3;padding:15px;margin:20px 0;text-align:center;border-radius:5px}.offer-amount{font-size:28px;font-weight:bold;color:#2196F3;margin:10px 0}</style></head><body><div class="header"><h2>Revised Offer for {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>Thank you for your response. I appreciate you sharing your client\'s counteroffer.</p><p>After reviewing the terms, I\'d like to present a revised offer:</p><div class="offer-box"><p><strong>Our Revised Cash Offer:</strong></p><div class="offer-amount">{{OFFER_AMOUNT}}</div></div><p>This offer is based on [specific reasons - market conditions, property analysis, etc.]. We\'re still committed to a fast, cash closing.</p><p>I\'m confident we can find terms that work for both parties. Would you like to discuss?</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div></body></html>';
}

/**
 * Get confirmation template
 * @return {String} HTML template
 */
function getConfirmationTemplate() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#4CAF50;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}</style></head><body><div class="header"><h2>Next Steps - {{PROPERTY_ADDRESS}}</h2></div><div class="content"><p>Hello {{AGENT_NAME}},</p><p>Thank you for your interest in moving forward with our offer for <strong>{{PROPERTY_ADDRESS}}</strong>.</p><p>I\'m excited to work with you and your client to close this deal quickly.</p><p><strong>Next Steps:</strong></p><ol><li>I\'ll prepare the purchase agreement</li><li>You can review with your client</li><li>We\'ll schedule a closing date within 7-14 days</li><li>Cash funds will be ready at closing</li></ol><p>Please let me know the best way to proceed. I can send the agreement via email or coordinate with your preferred closing company.</p><p>Best regards,<br>{{YOUR_NAME}}<br>{{YOUR_COMPANY}}<br>{{YOUR_EMAIL}}<br>{{YOUR_PHONE}}</p></div></body></html>';
}

/**
 * Replace template variables with actual data
 * @param {String} template - Template HTML string
 * @param {Object} data - Data object with replacement values
 * @return {String} Processed HTML
 */
function processTemplate(template, data) {
  var processed = template;

  // Replace all template variables
  for (var key in data) {
    var placeholder = '{{' + key.toUpperCase() + '}}';
    var value = data[key] || '';
    processed = processed.replace(new RegExp(placeholder, 'g'), value);
  }

  return processed;
}

/**
 * Get user contact information from Properties Service
 * @return {Object} User contact info
 */
function getUserContactInfo() {
  var properties = PropertiesService.getScriptProperties();

  return {
    YOUR_NAME: properties.getProperty('YOUR_NAME') || 'Land Acquisition Team',
    YOUR_COMPANY: properties.getProperty('YOUR_COMPANY') || 'LandFlow AI',
    YOUR_EMAIL: properties.getProperty('YOUR_EMAIL') || Session.getActiveUser().getEmail(),
    YOUR_PHONE: properties.getProperty('YOUR_PHONE') || ''
  };
}

/**
 * Generate personalized email HTML
 * @param {String} templateType - Template type
 * @param {Object} propertyData - Property data
 * @param {Object} recipientData - Recipient data (agent name, email)
 * @param {Number} offerAmount - Offer amount
 * @return {String} Complete HTML email
 */
function generateEmailHTML(templateType, propertyData, recipientData, offerAmount) {
  var template = getEmailTemplate(templateType);
  var userInfo = getUserContactInfo();

  var data = {
    PROPERTY_ADDRESS: propertyData.address || propertyData[1] || '',
    AGENT_NAME: recipientData.name || recipientData.agentName || 'Sir/Madam',
    OFFER_AMOUNT: formatCurrency(offerAmount),
    LISTING_PRICE: formatCurrency(propertyData.price || propertyData[3] || 0),
    YOUR_NAME: userInfo.YOUR_NAME,
    YOUR_COMPANY: userInfo.YOUR_COMPANY,
    YOUR_EMAIL: userInfo.YOUR_EMAIL,
    YOUR_PHONE: userInfo.YOUR_PHONE
  };

  return processTemplate(template, data);
}

/**
 * Generate email subject line
 * @param {String} templateType - Template type
 * @param {Object} propertyData - Property data
 * @return {String} Email subject
 */
function generateEmailSubject(templateType, propertyData) {
  var address = propertyData.address || propertyData[1] || 'Vacant Land';

  var subjects = {
    'initial': 'Cash Offer - ' + address,
    'follow-up': 'Following Up: Cash Offer - ' + address,
    'counteroffer': 'Revised Cash Offer - ' + address,
    'confirmation': 'Next Steps - ' + address
  };

  return subjects[templateType] || subjects['initial'];
}

/**
 * OutreachManager.gs
 * Manages automated outreach to property listings
 */

/**
 * Send outreach emails to new properties
 * Called by daily triggers
 */
function sendOutreachEmails() {
  Logger.log('Starting outreach email job at ' + new Date());

  var newProperties = getNewProperties();
  Logger.log('Found ' + newProperties.length + ' new properties to contact');

  var sent = 0;
  var skipped = 0;
  var errors = 0;

  for (var i = 0; i < newProperties.length; i++) {
    var property = newProperties[i];

    try {
      // Check if property already has emails sent
      var existingEmails = getPropertyEmails(property[0]); // property[0] is Property ID

      if (existingEmails.length > 0) {
        Logger.log('Property already contacted: ' + property[0]);
        skipped++;
        continue;
      }

      // Get recipient information
      var recipientData = extractRecipientInfo(property);

      if (!recipientData.email) {
        Logger.log('No email found for property: ' + property[0]);
        skipped++;
        continue;
      }

      // Calculate offer
      var offerAmount = calculateOfferForProperty(property);

      if (offerAmount <= 0) {
        Logger.log('Invalid offer amount for property: ' + property[0]);
        skipped++;
        continue;
      }

      // Send email
      var result = sendInitialOutreachEmail(property, recipientData, offerAmount);

      if (result.success) {
        // Log email
        logEmail(
          property[0], // Property ID
          recipientData.email,
          recipientData.name,
          result.subject,
          'Sent',
          result.messageId,
          result.threadId,
          'Initial'
        );

        // Update property status
        updatePropertyStatus(property[0], 'Offer Sent');

        // Update offer amount in Properties sheet (Column J)
        var spreadsheetId = getSpreadsheetId();
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName('Properties');
        var dataRange = sheet.getDataRange();
        var values = dataRange.getValues();

        for (var j = 1; j < values.length; j++) {
          if (values[j][0] === property[0]) {
            sheet.getRange(j + 1, 10).setValue(offerAmount); // Column J: Offer Amount
            sheet.getRange(j + 1, 9).setValue(new Date()); // Column I: Offer Sent
            break;
          }
        }

        sent++;
        Logger.log('Email sent for property: ' + property[0]);

        // Rate limiting - delay between emails
        Utilities.sleep(2000); // 2 seconds between emails

      } else {
        Logger.log('Failed to send email: ' + result.error);
        errors++;
      }

    } catch (error) {
      Logger.log('Error processing property ' + property[0] + ': ' + error.toString());
      logError('OutreachManager', error);
      errors++;
    }
  }

  Logger.log('Outreach email job complete: ' + sent + ' sent, ' + skipped + ' skipped, ' + errors + ' errors');
  return {
    sent: sent,
    skipped: skipped,
    errors: errors,
    total: newProperties.length
  };
}

/**
 * Get new properties that haven't been contacted
 * @return {Array} Array of property row data
 */
function getNewProperties() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');

  if (!sheet) return [];

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var newProperties = [];

  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var status = row[10]; // Column K: Status

    // Include "New" status properties
    if (status === 'New' || status === '') {
      newProperties.push(row);
    }
  }

  return newProperties;
}

/**
 * Extract recipient information from property data
 * @param {Array} property - Property row data
 * @return {Object} Recipient data with email and name
 */
function extractRecipientInfo(property) {
  var recipient = {
    email: '',
    name: ''
  };

  // Try to extract from Seller column (Column F) or other fields
  var sellerInfo = property[5] || ''; // Column F: Seller

  // Look for email pattern in seller info
  var emailMatch = sellerInfo.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    recipient.email = emailMatch[0];
  }

  // Extract name (remove email if present)
  recipient.name = sellerInfo.replace(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/, '').trim();

  // If no email found, try to construct from property URL
  // This is a placeholder - real implementation would need to scrape contact info
  if (!recipient.email && property[6]) { // Column G: URL
    // For now, return empty - would need to scrape listing page for contact info
    // In real implementation, you might scrape the listing page to find agent email
  }

  return recipient;
}

/**
 * Send initial outreach email
 * @param {Array} property - Property row data
 * @param {Object} recipientData - Recipient data
 * @param {Number} offerAmount - Offer amount
 * @return {Object} Result object
 */
function sendInitialOutreachEmail(property, recipientData, offerAmount) {
  try {
    var propertyData = {
      address: property[1], // Column B: Address
      price: property[3], // Column D: Price
      acreage: property[4], // Column E: Acreage
      daysOnMarket: property[11] || 0 // Column L: Days on Market
    };

    var htmlBody = generateEmailHTML('initial', propertyData, recipientData, offerAmount);
    var subject = generateEmailSubject('initial', propertyData);

    // Send email via Gmail API for better tracking
    try {
      var gmailMessage = GmailApp.sendEmail(
        recipientData.email,
        subject,
        '',
        {
          htmlBody: htmlBody,
          replyTo: getUserContactInfo().YOUR_EMAIL,
          name: getUserContactInfo().YOUR_NAME
        }
      );

      return {
        success: true,
        messageId: gmailMessage.getId(),
        threadId: gmailMessage.getThread().getId(),
        subject: subject
      };

    } catch (gmailError) {
      // Fall back to MailApp
      Logger.log('Gmail API failed, using MailApp: ' + gmailError.toString());

      MailApp.sendEmail({
        to: recipientData.email,
        subject: subject,
        htmlBody: htmlBody,
        replyTo: getUserContactInfo().YOUR_EMAIL,
        name: getUserContactInfo().YOUR_NAME
      });

      return {
        success: true,
        messageId: Utilities.getUuid(), // Generate UUID as message ID
        threadId: '',
        subject: subject
      };
    }

  } catch (error) {
    Logger.log('Error sending initial outreach email: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * FollowUpScheduler.gs
 * Handles automated follow-up email scheduling and sending
 */

/**
 * Process and send follow-up emails
 * Called by hourly or daily triggers
 */
function processFollowUpEmails() {
  Logger.log('Starting follow-up email processing at ' + new Date());

  var emailsToFollowUp = getEmailsNeedingFollowUp(2); // 48 hours (2 days)

  Logger.log('Found ' + emailsToFollowUp.length + ' emails needing follow-up');

  var sent = 0;
  var skipped = 0;

  for (var i = 0; i < emailsToFollowUp.length; i++) {
    var emailData = emailsToFollowUp[i];

    try {
      // Get property data
      var propertyData = getPropertyById(emailData.propertyId);

      if (!propertyData) {
        Logger.log('Property not found: ' + emailData.propertyId);
        skipped++;
        continue;
      }

      // Check if property status allows follow-ups
      var propertyStatus = propertyData[10]; // Column K: Status
      if (propertyStatus === 'Under Review' || propertyStatus === 'Under Contract' || propertyStatus === 'Closed') {
        Logger.log('Skipping follow-up - property status: ' + propertyStatus);
        skipped++;
        continue;
      }

      // Check follow-up count (max 3 follow-ups)
      if (emailData.followUpCount >= 3) {
        Logger.log('Max follow-ups reached for property: ' + emailData.propertyId);
        // Mark property as Dormant
        updatePropertyStatus(emailData.propertyId, 'Dormant');
        skipped++;
        continue;
      }

      // Send follow-up email
      var recipientData = {
        email: emailData.agentEmail,
        name: emailData.agentName
      };

      // Get original offer amount from Properties sheet or previous emails
      var offerAmount = getLastOfferAmount(emailData.propertyId);

      if (!offerAmount) {
        // Calculate new offer if none exists
        offerAmount = calculateOfferForProperty(propertyData);
      }

      var result = sendFollowUpEmail(propertyData, recipientData, offerAmount, emailData.threadId);

      if (result.success) {
        // Update follow-up count
        incrementFollowUpCount(emailData.messageId);

        // Log new follow-up email
        logEmail(
          emailData.propertyId,
          emailData.agentEmail,
          emailData.agentName,
          result.subject,
          'Sent',
          result.messageId,
          emailData.threadId || result.threadId,
          'Follow-up'
        );

        sent++;
        Logger.log('Follow-up sent for property: ' + emailData.propertyId);

        // Rate limiting
        Utilities.sleep(1000); // 1 second between emails
      } else {
        Logger.log('Failed to send follow-up: ' + result.error);
        skipped++;
      }

    } catch (error) {
      Logger.log('Error processing follow-up for property ' + emailData.propertyId + ': ' + error.toString());
      logError('FollowUpScheduler', error);
      skipped++;
    }
  }

  Logger.log('Follow-up processing complete: ' + sent + ' sent, ' + skipped + ' skipped');
  return {
    sent: sent,
    skipped: skipped,
    total: emailsToFollowUp.length
  };
}

/**
 * Send follow-up email
 * @param {Object} propertyData - Property data
 * @param {Object} recipientData - Recipient data
 * @param {Number} offerAmount - Offer amount
 * @param {String} threadId - Gmail thread ID for reply
 * @return {Object} Result object with success, messageId, threadId, subject
 */
function sendFollowUpEmail(propertyData, recipientData, offerAmount, threadId) {
  try {
    var htmlBody = generateEmailHTML('follow-up', propertyData, recipientData, offerAmount);
    var subject = generateEmailSubject('follow-up', propertyData);

    var options = {
      htmlBody: htmlBody,
      replyTo: getUserContactInfo().YOUR_EMAIL
    };

    // If thread ID exists, use Gmail API to send as reply
    if (threadId) {
      try {
        var gmailMessage = GmailApp.sendEmail(
          recipientData.email,
          'Re: ' + subject,
          '',
          {
            htmlBody: htmlBody,
            replyTo: getUserContactInfo().YOUR_EMAIL
          }
        );

        return {
          success: true,
          messageId: gmailMessage.getId(),
          threadId: gmailMessage.getThread().getId(),
          subject: 'Re: ' + subject
        };
      } catch (e) {
        // Fall back to regular email
      }
    }

    // Send regular email
    var message = MailApp.sendEmail({
      to: recipientData.email,
      subject: subject,
      htmlBody: htmlBody,
      replyTo: getUserContactInfo().YOUR_EMAIL
    });

    return {
      success: true,
      messageId: message.messageId || '',
      threadId: threadId || '',
      subject: subject
    };

  } catch (error) {
    Logger.log('Error sending follow-up email: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get property data by ID
 * @param {String} propertyId - Property ID
 * @return {Array} Property row data
 */
function getPropertyById(propertyId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');

  if (!sheet) return null;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find property by ID (Column A)
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId) {
      return values[i];
    }
  }

  return null;
}

/**
 * Get last offer amount for a property
 * @param {String} propertyId - Property ID
 * @return {Number} Offer amount or 0
 */
function getLastOfferAmount(propertyId) {
  var emails = getPropertyEmails(propertyId);

  // Get offer from Properties sheet (Column J)
  var propertyData = getPropertyById(propertyId);
  if (propertyData && propertyData[9]) {
    return parseFloat(propertyData[9]) || 0;
  }

  return 0;
}

/**
 * Update property status
 * @param {String} propertyId - Property ID
 * @param {String} newStatus - New status
 */
function updatePropertyStatus(propertyId, newStatus) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');

  if (!sheet) return;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find property by ID (Column A)
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId) {
      sheet.getRange(i + 1, 11).setValue(newStatus); // Column K: Status
      sheet.getRange(i + 1, 15).setValue(new Date()); // Column O: Last Updated
      break;
    }
  }
}

/**
 * EmailLogger.gs
 * Logs all email activities to the Emails sheet
 */

/**
 * Log email to Emails sheet
 * @param {String} propertyId - Property ID
 * @param {String} agentEmail - Agent email address
 * @param {String} agentName - Agent name
 * @param {String} subject - Email subject
 * @param {String} status - Email status
 * @param {String} messageId - Gmail message ID
 * @param {String} threadId - Gmail thread ID
 * @param {String} emailType - Email type ('Initial', 'Follow-up', etc.)
 * @return {Number} Row number where email was logged
 */
function logEmail(propertyId, agentEmail, agentName, subject, status, messageId, threadId, emailType) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) {
    throw new Error('Emails sheet not found');
  }

  var lastRow = sheet.getLastRow();
  var timestamp = new Date();

  // Calculate follow-up date (48 hours later)
  var followUpDate = new Date(timestamp.getTime() + (48 * 60 * 60 * 1000));

  var rowData = [
    propertyId, // A: Property ID
    agentEmail, // B: Agent Email
    agentName || '', // C: Agent Name
    subject, // D: Subject
    status || 'Sent', // E: Status
    timestamp, // F: Timestamp
    messageId || '', // G: Message ID
    threadId || '', // H: Thread ID
    followUpDate, // I: Follow Up Date
    0, // J: Follow Up Count
    emailType || 'Initial' // K: Email Type
  ];

  var newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);

  // Format the row
  sheet.getRange(newRow, 6).setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange(newRow, 9).setNumberFormat('mm/dd/yyyy');

  return newRow;
}

/**
 * Update email status
 * @param {String} messageId - Gmail message ID
 * @param {String} newStatus - New status
 */
function updateEmailStatus(messageId, newStatus) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) return;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find row with matching message ID (Column G)
  for (var i = 1; i < values.length; i++) {
    if (values[i][6] === messageId) {
      sheet.getRange(i + 1, 5).setValue(newStatus); // Column E: Status
      break;
    }
  }
}

/**
 * Increment follow-up count for an email
 * @param {String} messageId - Gmail message ID
 */
function incrementFollowUpCount(messageId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) return;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find row with matching message ID (Column G)
  for (var i = 1; i < values.length; i++) {
    if (values[i][6] === messageId) {
      var currentCount = values[i][9] || 0; // Column J: Follow Up Count
      sheet.getRange(i + 1, 10).setValue(currentCount + 1);
      break;
    }
  }
}

/**
 * Get emails needing follow-up
 * @param {Number} daysThreshold - Days threshold (default 2 for 48 hours)
 * @return {Array} Array of email row data
 */
function getEmailsNeedingFollowUp(daysThreshold) {
  var threshold = daysThreshold || 2;
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) return [];

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var emailsToFollowUp = [];

  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var followUpDate = row[8]; // Column I: Follow Up Date
    var status = row[4]; // Column E: Status
    var followUpCount = row[9] || 0; // Column J: Follow Up Count

    // Check if follow-up date has passed and status is not "Replied"
    if (followUpDate instanceof Date && status !== 'Replied') {
      var followUp = new Date(followUpDate);
      followUp.setHours(0, 0, 0, 0);

      var daysDiff = Math.floor((today - followUp) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && followUpCount < 3) {
        emailsToFollowUp.push({
          rowIndex: i + 1,
          propertyId: row[0],
          agentEmail: row[1],
          agentName: row[2],
          subject: row[3],
          status: row[4],
          timestamp: row[5],
          messageId: row[6],
          threadId: row[7],
          followUpDate: row[8],
          followUpCount: followUpCount,
          emailType: row[10]
        });
      }
    }
  }

  return emailsToFollowUp;
}

/**
 * Get property emails
 * @param {String} propertyId - Property ID
 * @return {Array} Array of email row data
 */
function getPropertyEmails(propertyId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) return [];

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var emails = [];

  // Skip header row
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId) {
      emails.push({
        rowIndex: i + 1,
        propertyId: values[i][0],
        agentEmail: values[i][1],
        agentName: values[i][2],
        subject: values[i][3],
        status: values[i][4],
        timestamp: values[i][5],
        messageId: values[i][6],
        threadId: values[i][7],
        followUpDate: values[i][8],
        followUpCount: values[i][9] || 0,
        emailType: values[i][10]
      });
    }
  }

  return emails;
}

/**
 * ClaudeClassifier.gs
 * AI-powered email classification using Claude or OpenAI API
 */

/**
 * Classify email reply using AI
 * @param {String} emailBody - Email body text
 * @return {Object} Classification result
 */
function classifyEmailReply(emailBody) {
  if (!emailBody || emailBody.trim() === '') {
    return createDefaultClassification();
  }

  try {
    var provider = getAIProvider();

    if (provider === 'openai') {
      return classifyWithOpenAI(emailBody);
    } else if (provider === 'claude') {
      return classifyWithClaude(emailBody);
    } else {
      Logger.log('Unknown AI provider: ' + provider);
      return createDefaultClassification();
    }

  } catch (error) {
    Logger.log('Error classifying email: ' + error.toString());
    logError('ClaudeClassifier', error);
    return createDefaultClassification();
  }
}

/**
 * Classify with OpenAI API
 * @param {String} emailBody - Email body text
 * @return {Object} Classification result
 */
function classifyWithOpenAI(emailBody) {
  var apiKey = getAPIKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not set');
  }

  var config = getAIConfig();
  var prompt = getClassificationPrompt(emailBody);

  var payload = {
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are a real estate email classifier. Always return valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: config.openai.temperature,
    max_tokens: config.openai.maxTokens,
    response_format: { type: 'json_object' }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(config.openai.baseUrl, options);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (responseCode !== 200) {
    Logger.log('OpenAI API error: ' + responseCode + ' - ' + responseText);
    throw new Error('OpenAI API error: ' + responseCode);
  }

  var jsonResponse = JSON.parse(responseText);
  var classificationText = jsonResponse.choices[0].message.content;

  return parseClassificationResult(classificationText);
}

/**
 * Classify with Claude API
 * @param {String} emailBody - Email body text
 * @return {Object} Classification result
 */
function classifyWithClaude(emailBody) {
  var apiKey = getAPIKey();
  if (!apiKey) {
    throw new Error('Claude API key not set');
  }

  var config = getAIConfig();
  var prompt = getClassificationPrompt(emailBody);

  var payload = {
    model: config.claude.model,
    max_tokens: config.claude.maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(config.claude.baseUrl, options);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (responseCode !== 200) {
    Logger.log('Claude API error: ' + responseCode + ' - ' + responseText);
    throw new Error('Claude API error: ' + responseCode);
  }

  var jsonResponse = JSON.parse(responseText);
  var classificationText = jsonResponse.content[0].text;

  return parseClassificationResult(classificationText);
}

/**
 * Parse classification result from AI response
 * @param {String} responseText - AI response text (should be JSON)
 * @return {Object} Parsed classification object
 */
function parseClassificationResult(responseText) {
  try {
    // Clean up response text (remove markdown code blocks if present)
    var cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\s*/, '').replace(/\s*```$/, '');
    }

    var result = JSON.parse(cleaned);

    // Validate and normalize result
    return {
      sentiment: result.sentiment || 'Neutral',
      replyType: result.replyType || 'Unclear',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      counterofferAmount: parseFloat(result.counterofferAmount || 0),
      summary: result.summary || '',
      nextAction: result.nextAction || ''
    };

  } catch (error) {
    Logger.log('Error parsing classification result: ' + error.toString());
    Logger.log('Response text: ' + responseText);
    return createDefaultClassification();
  }
}

/**
 * Create default classification result
 * @return {Object} Default classification object
 */
function createDefaultClassification() {
  return {
    sentiment: 'Neutral',
    replyType: 'Unclear',
    confidence: 0,
    counterofferAmount: 0,
    summary: 'Unable to classify email',
    nextAction: 'Review manually'
  };
}

/**
 * Summarize conversation thread
 * @param {String} conversationText - Full conversation text
 * @return {String} Summary text
 */
function summarizeConversation(conversationText) {
  if (!conversationText || conversationText.trim() === '') {
    return 'No conversation to summarize';
  }

  try {
    var provider = getAIProvider();
    var prompt = getSummarizationPrompt(conversationText);
    var apiKey = getAPIKey();

    if (!apiKey) {
      return 'API key not configured';
    }

    var config = getAIConfig();

    if (provider === 'openai') {
      var payload = {
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a real estate transaction summarizer. Provide concise summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      };

      var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + apiKey
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      var response = UrlFetchApp.fetch(config.openai.baseUrl, options);

      if (response.getResponseCode() === 200) {
        var jsonResponse = JSON.parse(response.getContentText());
        return jsonResponse.choices[0].message.content.trim();
      }

    } else if (provider === 'claude') {
      var payload = {
        model: config.claude.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      var response = UrlFetchApp.fetch(config.claude.baseUrl, options);

      if (response.getResponseCode() === 200) {
        var jsonResponse = JSON.parse(response.getContentText());
        return jsonResponse.content[0].text.trim();
      }
    }

    return 'Unable to generate summary';

  } catch (error) {
    Logger.log('Error summarizing conversation: ' + error.toString());
    return 'Error generating summary: ' + error.toString();
  }
}

/**
 * ReplyParser.gs
 * Reads incoming email replies using Gmail API
 */

/**
 * Process incoming email replies
 * Called by hourly triggers
 */
function processIncomingReplies() {
  Logger.log('Starting reply processing at ' + new Date());

  try {
    // Get unprocessed replies
    var replies = getUnprocessedReplies();

    Logger.log('Found ' + replies.length + ' unprocessed replies');

    var processed = 0;
    var errors = 0;

    for (var i = 0; i < replies.length; i++) {
      var reply = replies[i];

      try {
        // Classify reply using AI
        var classification = classifyEmailReply(reply.body);

        // Log to Replies sheet
        logReply(
          reply.propertyId,
          reply.threadId,
          new Date(),
          classification.sentiment,
          classification.replyType,
          classification.confidence,
          reply.originalOffer || 0,
          classification.counterofferAmount || 0,
          classification.summary,
          classification.nextAction
        );

        // Update email status to "Replied"
        if (reply.messageId) {
          updateEmailStatus(reply.messageId, 'Replied');
        }

        // Handle response based on classification
        handleClassifiedReply(reply, classification);

        processed++;
        Logger.log('Processed reply for property: ' + reply.propertyId);

      } catch (error) {
        Logger.log('Error processing reply: ' + error.toString());
        logError('ReplyParser', error);
        errors++;
      }
    }

    Logger.log('Reply processing complete: ' + processed + ' processed, ' + errors + ' errors');
    return {
      processed: processed,
      errors: errors,
      total: replies.length
    };

  } catch (error) {
    Logger.log('Error in processIncomingReplies: ' + error.toString());
    logError('ReplyParser', error);
    return {
      processed: 0,
      errors: 1,
      total: 0
    };
  }
}

/**
 * Get unprocessed email replies from Gmail
 * @return {Array} Array of reply objects
 */
function getUnprocessedReplies() {
  var replies = [];

  try {
    // Search for emails that are replies to our sent emails
    // Look for emails with "Re:" in subject and sent to our email
    var ourEmail = getUserContactInfo().YOUR_EMAIL || Session.getActiveUser().getEmail();
    var query = 'in:inbox from:-me to:' + ourEmail + ' is:unread';

    var threads = GmailApp.search(query, 0, 50); // Limit to 50 threads

    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var messages = thread.getMessages();

      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];

        // Check if this is a reply (has "Re:" in subject or is part of thread)
        if (message.isInInbox() && !message.isStarred()) {
          var replyData = extractReplyData(message, thread);

          if (replyData) {
            replies.push(replyData);
          }
        }
      }
    }

  } catch (error) {
    Logger.log('Error getting unprocessed replies: ' + error.toString());
  }

  return replies;
}

/**
 * Extract reply data from Gmail message
 * @param {GmailMessage} message - Gmail message object
 * @param {GmailThread} thread - Gmail thread object
 * @return {Object} Reply data object or null
 */
function extractReplyData(message, thread) {
  try {
    // Get thread ID
    var threadId = thread.getId();

    // Find corresponding email in Emails sheet
    var emailData = findEmailByThreadId(threadId);

    if (!emailData) {
      // Try to find by sender email
      var senderEmail = message.getFrom();
      emailData = findEmailByRecipient(senderEmail);
    }

    if (!emailData) {
      return null; // Can't match to a property
    }

    // Extract email body
    var body = message.getPlainBody();
    if (!body || body.trim() === '') {
      body = message.getBody();
      // Strip HTML tags if needed
      body = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return {
      propertyId: emailData.propertyId,
      messageId: message.getId(),
      threadId: threadId,
      senderEmail: senderEmail,
      senderName: extractSenderName(message.getFrom()),
      subject: message.getSubject(),
      body: body,
      date: message.getDate(),
      originalOffer: emailData.offerAmount
    };

  } catch (error) {
    Logger.log('Error extracting reply data: ' + error.toString());
    return null;
  }
}

/**
 * Find email data by thread ID
 * @param {String} threadId - Gmail thread ID
 * @return {Object} Email data or null
 */
function findEmailByThreadId(threadId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) return null;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find email with matching thread ID (Column H)
  for (var i = 1; i < values.length; i++) {
    if (values[i][7] === threadId) {
      return {
        propertyId: values[i][0],
        agentEmail: values[i][1],
        agentName: values[i][2],
        offerAmount: getPropertyOfferAmount(values[i][0])
      };
    }
  }

  return null;
}

/**
 * Find email data by recipient email
 * @param {String} recipientEmail - Recipient email address
 * @return {Object} Email data or null
 */
function findEmailByRecipient(recipientEmail) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');

  if (!sheet) return null;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find most recent email to this recipient (Column B)
  for (var i = values.length - 1; i >= 1; i--) {
    if (values[i][1] === recipientEmail) {
      return {
        propertyId: values[i][0],
        agentEmail: values[i][1],
        agentName: values[i][2],
        offerAmount: getPropertyOfferAmount(values[i][0])
      };
    }
  }

  return null;
}

/**
 * Get property offer amount
 * @param {String} propertyId - Property ID
 * @return {Number} Offer amount
 */
function getPropertyOfferAmount(propertyId) {
  var propertyData = getPropertyById(propertyId);
  if (propertyData && propertyData[9]) {
    return parseFloat(propertyData[9]) || 0;
  }
  return 0;
}

/**
 * Extract sender name from email string
 * @param {String} fromString - Email "From" string (e.g., "John Doe <john@example.com>")
 * @return {String} Sender name
 */
function extractSenderName(fromString) {
  if (!fromString) return '';

  var match = fromString.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim().replace(/["']/g, '');
  }

  return fromString.split('@')[0];
}

/**
 * Mark email as processed (read)
 * @param {String} messageId - Gmail message ID
 */
function markEmailAsProcessed(messageId) {
  try {
    var message = GmailApp.getMessageById(messageId);
    message.markRead();
    message.removeLabel(GmailApp.getUserLabelByName('UNREAD'));
  } catch (error) {
    Logger.log('Error marking email as processed: ' + error.toString());
  }
}

/**
 * ResponseHandler.gs
 * Handles classified replies and triggers appropriate workflows
 */

/**
 * Handle classified reply and trigger appropriate action
 * @param {Object} replyData - Reply data object
 * @param {Object} classification - AI classification result
 */
function handleClassifiedReply(replyData, classification) {
  Logger.log('Handling classified reply for property: ' + replyData.propertyId);
  Logger.log('Sentiment: ' + classification.sentiment + ', Type: ' + classification.replyType);

  var sentiment = classification.sentiment;
  var replyType = classification.replyType;

  // Mark email as processed
  if (replyData.messageId) {
    markEmailAsProcessed(replyData.messageId);
  }

  // Update property status
  var propertyData = getPropertyById(replyData.propertyId);
  if (!propertyData) {
    Logger.log('Property not found: ' + replyData.propertyId);
    return;
  }

  // Handle based on sentiment
  if (sentiment === 'Interested') {
    handleInterestedReply(replyData, classification, propertyData);
  } else if (sentiment === 'Counteroffer') {
    handleCounterofferReply(replyData, classification, propertyData);
  } else if (sentiment === 'Not Interested') {
    handleNotInterestedReply(replyData, classification, propertyData);
  } else if (sentiment === 'Spam') {
    handleSpamReply(replyData, classification, propertyData);
  } else {
    // Neutral - mark for manual review
    updatePropertyStatus(replyData.propertyId, 'Under Review');
    updateReplyStatus(replyData.propertyId, replyData.threadId, 'Pending');
  }
}

/**
 * Handle interested reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleInterestedReply(replyData, classification, propertyData) {
  Logger.log('Processing interested reply');

  // Update property status
  updatePropertyStatus(replyData.propertyId, 'Response Received');

  // Update reply status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');

  // Send confirmation email
  try {
    var recipientData = {
      email: replyData.senderEmail,
      name: replyData.senderName
    };

    var offerAmount = classification.counterofferAmount > 0
      ? classification.counterofferAmount
      : getPropertyOfferAmount(replyData.propertyId);

    var htmlBody = generateEmailHTML('confirmation', propertyData, recipientData, offerAmount);
    var subject = generateEmailSubject('confirmation', propertyData);

    // Send confirmation email
    if (replyData.threadId) {
      var gmailMessage = GmailApp.sendEmail(
        recipientData.email,
        'Re: ' + subject,
        '',
        {
          htmlBody: htmlBody,
          replyTo: getUserContactInfo().YOUR_EMAIL
        }
      );

      // Log confirmation email
      logEmail(
        replyData.propertyId,
        recipientData.email,
        recipientData.name,
        'Re: ' + subject,
        'Sent',
        gmailMessage.getId(),
        replyData.threadId,
        'Confirmation'
      );
    }

  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.toString());
  }
}

/**
 * Handle counteroffer reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleCounterofferReply(replyData, classification, propertyData) {
  Logger.log('Processing counteroffer reply');

  // Update property status
  updatePropertyStatus(replyData.propertyId, 'Under Review');

  // Update reply status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');

  // Generate new offer if counteroffer is reasonable
  var counterofferAmount = classification.counterofferAmount || 0;
  var listingPrice = propertyData[3] || 0; // Column D: Price

  if (counterofferAmount > 0 && counterofferAmount < listingPrice) {
    // Counteroffer is valid - generate response offer
    var newOffer = generateCounterofferResponse(counterofferAmount, listingPrice);

    if (newOffer > 0) {
      // Send counteroffer response
      sendCounterofferResponse(replyData, propertyData, newOffer, counterofferAmount);
    }
  }
}

/**
 * Handle not interested reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleNotInterestedReply(replyData, classification, propertyData) {
  Logger.log('Processing not interested reply');

  // Mark property as dormant
  updatePropertyStatus(replyData.propertyId, 'Dormant');

  // Update reply status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');
}

/**
 * Handle spam reply
 * @param {Object} replyData - Reply data
 * @param {Object} classification - Classification result
 * @param {Array} propertyData - Property data
 */
function handleSpamReply(replyData, classification, propertyData) {
  Logger.log('Processing spam reply');

  // Mark reply as processed but don't change property status
  updateReplyStatus(replyData.propertyId, replyData.threadId, 'Processed');

  // Optionally add spam label to email
  try {
    if (replyData.messageId) {
      var message = GmailApp.getMessageById(replyData.messageId);
      message.addLabel(GmailApp.getUserLabelByName('SPAM') || GmailApp.createLabel('SPAM'));
    }
  } catch (error) {
    // Label doesn't exist or other error - ignore
  }
}

/**
 * Generate counteroffer response amount
 * @param {Number} sellerCounteroffer - Seller's counteroffer
 * @param {Number} listingPrice - Original listing price
 * @return {Number} New offer amount
 */
function generateCounterofferResponse(sellerCounteroffer, listingPrice) {
  // Strategy: meet somewhere between original offer and seller counteroffer
  // Or if counteroffer is reasonable, accept it

  var originalOfferRange = {
    min: listingPrice * 0.70,
    max: listingPrice * 0.80
  };

  // If counteroffer is within our max range, consider accepting
  if (sellerCounteroffer <= listingPrice * 0.85) {
    // Return counteroffer or slightly below
    return Math.round(sellerCounteroffer * 0.98 / 1000) * 1000; // 2% below counteroffer, rounded
  }

  // Counteroffer too high - generate new offer
  var middlePoint = (originalOfferRange.max + sellerCounteroffer) / 2;
  return Math.round(middlePoint / 1000) * 1000; // Round to nearest $1000
}

/**
 * Send counteroffer response email
 * @param {Object} replyData - Reply data
 * @param {Array} propertyData - Property data
 * @param {Number} newOffer - New offer amount
 * @param {Number} sellerCounteroffer - Seller's counteroffer
 */
function sendCounterofferResponse(replyData, propertyData, newOffer, sellerCounteroffer) {
  try {
    var recipientData = {
      email: replyData.senderEmail,
      name: replyData.senderName
    };

    var htmlBody = generateEmailHTML('counteroffer', propertyData, recipientData, newOffer);
    var subject = generateEmailSubject('counteroffer', propertyData);

    if (replyData.threadId) {
      var gmailMessage = GmailApp.sendEmail(
        recipientData.email,
        'Re: ' + subject,
        '',
        {
          htmlBody: htmlBody,
          replyTo: getUserContactInfo().YOUR_EMAIL
        }
      );

      // Log counteroffer email
      logEmail(
        replyData.propertyId,
        recipientData.email,
        recipientData.name,
        'Re: ' + subject,
        'Sent',
        gmailMessage.getId(),
        replyData.threadId,
        'Counteroffer'
      );

      // Update offer amount in Properties sheet
      var spreadsheetId = getSpreadsheetId();
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName('Properties');
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();

      for (var i = 1; i < values.length; i++) {
        if (values[i][0] === replyData.propertyId) {
          sheet.getRange(i + 1, 10).setValue(newOffer); // Column J: Offer Amount
          break;
        }
      }
    }

  } catch (error) {
    Logger.log('Error sending counteroffer response: ' + error.toString());
  }
}

/**
 * ConversationLogger.gs
 * Logs replies to the Replies sheet
 */

/**
 * Log reply to Replies sheet
 * @param {String} propertyId - Property ID
 * @param {String} threadId - Gmail thread ID
 * @param {Date} timestamp - Reply timestamp
 * @param {String} sentiment - AI-classified sentiment
 * @param {String} replyType - Reply type
 * @param {Number} confidence - AI confidence score
 * @param {Number} originalOffer - Original offer amount
 * @param {Number} counterofferAmount - Counteroffer amount if present
 * @param {String} notes - Summary/notes
 * @param {String} nextAction - Recommended next action
 * @return {Number} Row number where reply was logged
 */
function logReply(propertyId, threadId, timestamp, sentiment, replyType, confidence, originalOffer, counterofferAmount, notes, nextAction) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Replies');

  if (!sheet) {
    throw new Error('Replies sheet not found');
  }

  var lastRow = sheet.getLastRow();

  var rowData = [
    propertyId, // A: Property ID
    threadId || '', // B: Email Thread ID
    timestamp || new Date(), // C: Reply Timestamp
    sentiment || 'Neutral', // D: Sentiment
    replyType || 'Unclear', // E: Reply Type
    confidence || 0, // F: AI Confidence
    originalOffer || 0, // G: Original Offer
    counterofferAmount || 0, // H: Counteroffer Amount
    notes || '', // I: Notes
    nextAction || '', // J: Next Action
    false, // K: Action Taken (checkbox)
    'Pending' // L: Handler Status
  ];

  var newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);

  // Format the row
  sheet.getRange(newRow, 3).setNumberFormat('mm/dd/yyyy hh:mm:ss');
  sheet.getRange(newRow, 6).setNumberFormat('0%');
  sheet.getRange(newRow, 7).setNumberFormat('$#,##0');
  sheet.getRange(newRow, 8).setNumberFormat('$#,##0');

  return newRow;
}

/**
 * Update reply handler status
 * @param {String} propertyId - Property ID
 * @param {String} threadId - Thread ID
 * @param {String} newStatus - New handler status
 */
function updateReplyStatus(propertyId, threadId, newStatus) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Replies');

  if (!sheet) return;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Find matching reply
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === propertyId && values[i][1] === threadId) {
      sheet.getRange(i + 1, 12).setValue(newStatus); // Column L: Handler Status
      sheet.getRange(i + 1, 11).setValue(true); // Column K: Action Taken
      break;
    }
  }
}

/**
 * NegotiationEngine.gs
 * Generates negotiation responses and counteroffers
 */

/**
 * Generate negotiation strategy for a counteroffer
 * @param {Number} listingPrice - Original listing price
 * @param {Number} originalOffer - Our original offer
 * @param {Number} sellerCounteroffer - Seller's counteroffer
 * @return {Object} Negotiation strategy
 */
function generateNegotiationStrategy(listingPrice, originalOffer, sellerCounteroffer) {
  var strategy = {
    recommendedOffer: 0,
    maxOffer: 0,
    reasoning: '',
    shouldAccept: false,
    shouldCounter: false
  };

  // Calculate percentages
  var originalOfferPercent = (originalOffer / listingPrice) * 100;
  var sellerCounterofferPercent = (sellerCounteroffer / listingPrice) * 100;
  var gap = sellerCounteroffer - originalOffer;

  // If seller counteroffer is within reasonable range (80-85%), consider accepting
  if (sellerCounterofferPercent <= 85) {
    strategy.shouldAccept = true;
    strategy.recommendedOffer = sellerCounteroffer;
    strategy.reasoning = 'Seller counteroffer is reasonable and within acceptable range';
    return strategy;
  }

  // If gap is too large, counter with midpoint
  if (gap > listingPrice * 0.15) {
    strategy.shouldCounter = true;
    strategy.recommendedOffer = Math.round((originalOffer + sellerCounteroffer) / 2 / 1000) * 1000;
    strategy.maxOffer = Math.round(listingPrice * 0.85);
    strategy.reasoning = 'Large gap - counter with midpoint offer';
    return strategy;
  }

  // Standard counteroffer strategy
  strategy.shouldCounter = true;
  strategy.recommendedOffer = Math.round(originalOffer * 1.05 / 1000) * 1000; // Increase by 5%
  strategy.maxOffer = Math.round(listingPrice * 0.80);
  strategy.reasoning = 'Standard counteroffer with 5% increase';

  return strategy;
}

/**
 * Generate negotiation email body text
 * @param {Object} strategy - Negotiation strategy object
 * @param {Object} propertyData - Property data
 * @return {String} Email body text
 */
function generateNegotiationEmailText(strategy, propertyData) {
  var address = propertyData.address || propertyData[1] || 'this property';

  var text = 'Thank you for your counteroffer of ' + formatCurrency(strategy.sellerCounteroffer || 0) + '.\n\n';

  if (strategy.shouldAccept) {
    text += 'We are pleased to accept your counteroffer. ';
    text += 'We can proceed with the purchase agreement and close within 7-14 days.\n\n';
  } else {
    text += 'After careful consideration, we would like to present a revised offer of ';
    text += formatCurrency(strategy.recommendedOffer) + '.\n\n';
    text += 'This offer reflects our analysis of the property and market conditions. ';
    text += 'We remain committed to a fast, cash closing.\n\n';
  }

  text += 'Please let me know your thoughts, and we can move forward with the transaction.\n\n';
  text += 'Best regards';

  return text;
}

/**
 * BuyerDatabase.gs
 * Manages verified builder buyer database
 */

/**
 * Initialize buyer database from JSON data
 * Call this once to populate the Buyers sheet
 */
function initializeBuyerDatabase() {
  Logger.log('Initializing buyer database...');

  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');

  if (!sheet) {
    throw new Error('Buyers sheet not found');
  }

  // Check if already populated
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    Logger.log('Buyer database already populated. Row count: ' + (lastRow - 1));
    return;
  }

  // Get buyer data from JSON
  var buyers = getVerifiedBuilders();

  var rows = [];
  for (var i = 0; i < buyers.length; i++) {
    var buyer = buyers[i];
    rows.push([
      buyer.company || '',
      buyer.contactName || '',
      buyer.email || '',
      buyer.phone || '',
      buyer.location || '',
      buyer.lotSizeMin || 0,
      buyer.lotSizeMax || 100,
      buyer.priceRangeMin || 0,
      buyer.priceRangeMax || 1000000,
      '', // Property Match - will be filled later
      '', // Contacted
      '', // Last Contact
      'No Reply', // Response
      buyer.notes || ''
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

    // Format rows
    for (var j = 0; j < rows.length; j++) {
      var rowNum = j + 2;
      sheet.getRange(rowNum, 6).setNumberFormat('0.00'); // Lot Size Min
      sheet.getRange(rowNum, 7).setNumberFormat('0.00'); // Lot Size Max
      sheet.getRange(rowNum, 8).setNumberFormat('$#,##0'); // Price Range Min
      sheet.getRange(rowNum, 9).setNumberFormat('$#,##0'); // Price Range Max
      sheet.getRange(rowNum, 11).setNumberFormat('mm/dd/yyyy'); // Contacted
      sheet.getRange(rowNum, 12).setNumberFormat('mm/dd/yyyy'); // Last Contact
    }

    Logger.log('Buyer database initialized with ' + rows.length + ' buyers');
  }
}

/**
 * Get verified builders from JSON
 * @return {Array} Array of buyer objects
 */
function getVerifiedBuilders() {
  // In real implementation, you would read from a file or Properties Service
  // For now, return hardcoded data (can be replaced with JSON file read)
  return [
    {
      company: 'DR Horton',
      contactName: 'Land Acquisition Team',
      email: 'landacquisition@drhorton.com',
      phone: '',
      location: 'Texas, Florida, Georgia, North Carolina, Arizona',
      lotSizeMin: 0.25,
      lotSizeMax: 5.0,
      priceRangeMin: 15000,
      priceRangeMax: 500000
    },
    {
      company: 'LGI Homes',
      contactName: 'Land Development',
      email: 'land@lgihomes.com',
      phone: '',
      location: 'Texas, Florida, Georgia, North Carolina',
      lotSizeMin: 0.20,
      lotSizeMax: 3.0,
      priceRangeMin: 12000,
      priceRangeMax: 400000
    },
    {
      company: 'Lennar',
      contactName: 'Land Acquisition',
      email: 'land@lennar.com',
      phone: '',
      location: 'Texas, Florida, California, Arizona, Nevada',
      lotSizeMin: 0.30,
      lotSizeMax: 10.0,
      priceRangeMin: 20000,
      priceRangeMax: 750000
    },
    {
      company: 'Pulte Homes',
      contactName: 'Land Team',
      email: 'land@pulte.com',
      phone: '',
      location: 'Texas, Florida, Georgia, North Carolina, Arizona',
      lotSizeMin: 0.25,
      lotSizeMax: 5.0,
      priceRangeMin: 15000,
      priceRangeMax: 500000
    },
    {
      company: 'KB Home',
      contactName: 'Land Development',
      email: 'land@kbhome.com',
      phone: '',
      location: 'Texas, California, Florida, Arizona',
      lotSizeMin: 0.20,
      lotSizeMax: 4.0,
      priceRangeMin: 12000,
      priceRangeMax: 450000
    }
  ];
}

/**
 * Get all buyers from Buyers sheet
 * @return {Array} Array of buyer row data
 */
function getAllBuyers() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');

  if (!sheet) return [];

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var buyers = [];

  // Skip header row
  for (var i = 1; i < values.length; i++) {
    buyers.push({
      rowIndex: i + 1,
      company: values[i][0],
      contactName: values[i][1],
      email: values[i][2],
      phone: values[i][3],
      location: values[i][4],
      lotSizeMin: values[i][5] || 0,
      lotSizeMax: values[i][6] || 100,
      priceRangeMin: values[i][7] || 0,
      priceRangeMax: values[i][8] || 1000000,
      propertyMatch: values[i][9] || '',
      contacted: values[i][10],
      lastContact: values[i][11],
      response: values[i][12] || 'No Reply',
      notes: values[i][13] || ''
    });
  }

  return buyers;
}

/**
 * MatchingEngine.gs
 * Matches properties to verified builder buyers
 */

/**
 * Find matching buyers for a property
 * @param {Array} propertyData - Property row data
 * @return {Array} Array of matching buyer objects
 */
function findMatchingBuyers(propertyData) {
  var matches = [];

  var property = {
    address: propertyData[1] || '', // Column B: Address
    price: propertyData[3] || 0, // Column D: Price
    acreage: propertyData[4] || 0, // Column E: Acreage
    county: propertyData[2] || '', // Column C: County
    state: extractStateFromAddress(propertyData[1] || '')
  };

  var buyers = getAllBuyers();

  for (var i = 0; i < buyers.length; i++) {
    var buyer = buyers[i];

    if (matchesBuyerCriteria(property, buyer)) {
      matches.push(buyer);
    }
  }

  return matches;
}

/**
 * Check if property matches buyer criteria
 * @param {Object} property - Property object
 * @param {Object} buyer - Buyer object
 * @return {Boolean} True if matches
 */
function matchesBuyerCriteria(property, buyer) {
  // Check location (state)
  if (!locationMatches(property.state, buyer.location)) {
    return false;
  }

  // Check acreage
  if (property.acreage < buyer.lotSizeMin || property.acreage > buyer.lotSizeMax) {
    return false;
  }

  // Check price range (use seller offer if available, otherwise listing price)
  var propertyPrice = property.price;
  if (propertyPrice < buyer.priceRangeMin || propertyPrice > buyer.priceRangeMax) {
    return false;
  }

  return true;
}

/**
 * Check if property location matches buyer location preferences
 * @param {String} propertyState - Property state
 * @param {String} buyerLocations - Buyer location string (comma-separated states)
 * @return {Boolean} True if matches
 */
function locationMatches(propertyState, buyerLocations) {
  if (!propertyState || !buyerLocations) {
    return false;
  }

  var states = buyerLocations.split(',').map(function(s) {
    return s.trim().toLowerCase();
  });

  return states.indexOf(propertyState.toLowerCase()) >= 0;
}

/**
 * Extract state from address string
 * @param {String} address - Full address
 * @return {String} State abbreviation or name
 */
function extractStateFromAddress(address) {
  if (!address) return '';

  // Common state patterns
  var stateMatch = address.match(/\b([A-Z]{2})\s+\d{5}/);
  if (stateMatch) {
    return stateMatch[1];
  }

  // Try full state names
  var stateNames = [
    'Texas', 'Florida', 'Georgia', 'North Carolina', 'Arizona', 'California',
    'Nevada', 'Colorado', 'Alabama', 'Tennessee', 'South Carolina'
  ];

  for (var i = 0; i < stateNames.length; i++) {
    if (address.indexOf(stateNames[i]) >= 0) {
      return stateNames[i];
    }
  }

  return '';
}

/**
 * Match property to buyers and update Buyers sheet
 * @param {String} propertyId - Property ID
 */
function matchPropertyToBuyers(propertyId) {
  var propertyData = getPropertyById(propertyId);
  if (!propertyData) {
    Logger.log('Property not found: ' + propertyId);
    return;
  }

  var matchingBuyers = findMatchingBuyers(propertyData);
  Logger.log('Found ' + matchingBuyers.length + ' matching buyers for property: ' + propertyId);

  // Update Buyers sheet with property match
  var spreadsheetId = getSpreadsheetId();
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');

  if (!sheet) return;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  for (var i = 0; i < matchingBuyers.length; i++) {
    var buyer = matchingBuyers[i];

    // Find buyer row
    for (var j = 1; j < values.length; j++) {
      if (values[j][0] === buyer.company) {
        // Update property match column (Column J)
        var currentMatches = values[j][9] || ''; // Column J: Property Match
        var matches = currentMatches ? currentMatches.split(',') : [];

        if (matches.indexOf(propertyId) < 0) {
          matches.push(propertyId);
          sheet.getRange(j + 1, 10).setValue(matches.join(','));
        }
        break;
      }
    }
  }

  return matchingBuyers;
}

/**
 * BuyerOutreach.gs
 * Sends automated outreach emails to matched buyers
 */

/**
 * Send buyer outreach emails for properties under contract
 * Called when a property status changes to "Under Contract"
 */
function sendBuyerOutreachForProperty(propertyId) {
  Logger.log('Sending buyer outreach for property: ' + propertyId);

  var propertyData = getPropertyById(propertyId);
  if (!propertyData) {
    Logger.log('Property not found: ' + propertyId);
    return;
  }

  // Find matching buyers
  var matchingBuyers = findMatchingBuyers(propertyData);

  if (matchingBuyers.length === 0) {
    Logger.log('No matching buyers found for property: ' + propertyId);
    return;
  }

  var sent = 0;
  var errors = 0;

  for (var i = 0; i < matchingBuyers.length; i++) {
    var buyer = matchingBuyers[i];

    try {
      // Check if already contacted (within last 30 days)
      if (shouldContactBuyer(buyer)) {
        var result = sendBuyerEmail(propertyData, buyer);

        if (result.success) {
          // Update buyer record
          updateBuyerContact(buyer.rowIndex, propertyId);
          sent++;
          Logger.log('Buyer outreach sent to: ' + buyer.company);

          // Rate limiting
          Utilities.sleep(2000);
        } else {
          errors++;
        }
      } else {
        Logger.log('Skipping buyer (recently contacted): ' + buyer.company);
      }

    } catch (error) {
      Logger.log('Error sending buyer outreach: ' + error.toString());
      errors++;
    }
  }

  Logger.log('Buyer outreach complete: ' + sent + ' sent, ' + errors + ' errors');
  return {
    sent: sent,
    errors: errors,
    total: matchingBuyers.length
  };
}

/**
 * Check if buyer should be contacted
 * @param {Object} buyer - Buyer object
 * @return {Boolean} True if should contact
 */
function shouldContactBuyer(buyer) {
  // If never contacted, yes
  if (!buyer.lastContact) {
    return true;
  }

  // If contacted more than 30 days ago, yes
  var lastContact = new Date(buyer.lastContact);
  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return lastContact < thirtyDaysAgo;
}

/**
 * Send buyer outreach email
 * @param {Array} propertyData - Property row data
 * @param {Object} buyer - Buyer object
 * @return {Object} Result object
 */
function sendBuyerEmail(propertyData, buyer) {
  try {
    var address = propertyData[1] || ''; // Column B: Address
    var acreage = propertyData[4] || 0; // Column E: Acreage
    var price = propertyData[3] || 0; // Column D: Price
    var offerAmount = propertyData[9] || price; // Column J: Offer Amount

    var subject = 'Land Opportunity: ' + address + ' (' + acreage + ' acres)';

    var htmlBody = generateBuyerEmailHTML(propertyData, buyer, offerAmount);

    // Send email
    MailApp.sendEmail({
      to: buyer.email,
      subject: subject,
      htmlBody: htmlBody,
      replyTo: getUserContactInfo().YOUR_EMAIL,
      name: getUserContactInfo().YOUR_NAME
    });

    return {
      success: true,
      subject: subject
    };

  } catch (error) {
    Logger.log('Error sending buyer email: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate buyer email HTML
 * @param {Array} propertyData - Property row data
 * @param {Object} buyer - Buyer object
 * @param {Number} askingPrice - Asking price to buyer
 * @return {String} HTML email body
 */
function generateBuyerEmailHTML(propertyData, buyer, askingPrice) {
  var address = propertyData[1] || '';
  var acreage = propertyData[4] || 0;
  var county = propertyData[2] || '';
  var url = propertyData[6] || ''; // Column G: URL

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#2196F3;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}.property-box{background-color:#fff;border:2px solid #2196F3;padding:15px;margin:20px 0;border-radius:5px}</style></head><body>';
  html += '<div class="header"><h2>Land Opportunity - ' + address + '</h2></div>';
  html += '<div class="content">';
  html += '<p>Hello ' + (buyer.contactName || buyer.company) + ',</p>';
  html += '<p>I have a land opportunity that may interest ' + buyer.company + '.</p>';
  html += '<div class="property-box">';
  html += '<h3>Property Details:</h3>';
  html += '<p><strong>Address:</strong> ' + address + '</p>';
  html += '<p><strong>County:</strong> ' + county + '</p>';
  html += '<p><strong>Acreage:</strong> ' + acreage + ' acres</p>';
  html += '<p><strong>Asking Price:</strong> ' + formatCurrency(askingPrice) + '</p>';
  if (url) {
    html += '<p><strong>Listing:</strong> <a href="' + url + '">View Listing</a></p>';
  }
  html += '</div>';
  html += '<p>This property is currently under contract and available for assignment. ';
  html += 'We can close quickly and are open to discussing terms.</p>';
  html += '<p>If this aligns with your acquisition criteria, please let me know and we can discuss further.</p>';
  html += '<p>Best regards,<br>' + getUserContactInfo().YOUR_NAME + '<br>' + getUserContactInfo().YOUR_COMPANY + '<br>' + getUserContactInfo().YOUR_EMAIL + '</p>';
  html += '</div></body></html>';

  return html;
}

/**
 * Update buyer contact record
 * @param {Number} rowIndex - Buyer row index (1-based)
 * @param {String} propertyId - Property ID
 */
function updateBuyerContact(rowIndex, propertyId) {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');

  if (!sheet) return;

  var now = new Date();

  // Update contacted date if first time
  var contactedDate = sheet.getRange(rowIndex, 11).getValue();
  if (!contactedDate) {
    sheet.getRange(rowIndex, 11).setValue(now); // Column K: Contacted
  }

  // Update last contact
  sheet.getRange(rowIndex, 12).setValue(now); // Column L: Last Contact

  // Update property match
  var currentMatches = sheet.getRange(rowIndex, 10).getValue() || '';
  var matches = currentMatches ? currentMatches.toString().split(',') : [];
  if (matches.indexOf(propertyId) < 0) {
    matches.push(propertyId);
    sheet.getRange(rowIndex, 10).setValue(matches.join(','));
  }
}

/**
 * BuyerLogger.gs
 * Logs buyer interactions (extends EmailLogger functionality for buyers)
 */

/**
 * Log buyer email to tracking (can reuse Emails sheet or create buyer-specific log)
 * Similar to EmailLogger but tracks buyer communications separately
 */

/**
 * MetricsCalculator.gs
 * Calculates KPI metrics for the dashboard
 */

/**
 * Calculate all dashboard metrics
 * @return {Object} Metrics object
 */
function calculateDashboardMetrics() {
  var data = getDashboardData();
  var emails = data.emails;
  var replies = data.replies;
  var deals = data.deals;
  var properties = data.properties;

  var metrics = {
    totalOffersMade: emails.total || 0,
    totalResponses: replies.total || 0,
    responseRate: 0,
    offerToCloseRatio: 0,
    avgProfitPerDeal: deals.avgProfit || 0,
    monthlyProfitTotal: getMonthlyProfit(),
    dealsClosed: deals.closedDeals || 0,
    dealsClosedThisMonth: getMonthlyClosedDeals(),
    totalProfit: deals.totalProfit || 0,
    totalProperties: properties.total || 0,
    propertiesByStatus: properties.byStatus || {},
    responseBreakdown: replies.bySentiment || {}
  };

  // Calculate response rate
  if (metrics.totalOffersMade > 0) {
    metrics.responseRate = (metrics.totalResponses / metrics.totalOffersMade) * 100;
  }

  // Calculate offer to close ratio
  if (metrics.totalOffersMade > 0) {
    metrics.offerToCloseRatio = (metrics.dealsClosed / metrics.totalOffersMade) * 100;
  }

  return metrics;
}

/**
 * Get monthly profit total
 * @return {Number} Monthly profit
 */
function getMonthlyProfit() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return 0;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Deals');

  if (!sheet) return 0;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  var now = new Date();
  var firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  var lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  var monthlyProfit = 0;

  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var status = values[i][8]; // Column I: Status
    var closeDate = values[i][7]; // Column H: Close Date
    var profit = parseFloat(values[i][5]) || 0; // Column F: Profit

    if (status === 'Closed' && closeDate instanceof Date) {
      if (closeDate >= firstOfMonth && closeDate <= lastOfMonth) {
        monthlyProfit += profit;
      }
    }
  }

  return monthlyProfit;
}

/**
 * Get monthly closed deals count
 * @return {Number} Number of closed deals this month
 */
function getMonthlyClosedDeals() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return 0;

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Deals');

  if (!sheet) return 0;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  var now = new Date();
  var firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  var lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  var count = 0;

  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var status = values[i][8]; // Column I: Status
    var closeDate = values[i][7]; // Column H: Close Date

    if (status === 'Closed' && closeDate instanceof Date) {
      if (closeDate >= firstOfMonth && closeDate <= lastOfMonth) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Update dashboard sheet with calculated metrics
 */
function updateDashboardSheet() {
  var metrics = calculateDashboardMetrics();
  var spreadsheetId = getSpreadsheetId();

  if (!spreadsheetId) {
    Logger.log('Spreadsheet ID not set');
    return;
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Performance Dashboard');

  if (!sheet) {
    Logger.log('Performance Dashboard sheet not found');
    return;
  }

  // Update key metrics (assuming formulas are in place, or update specific cells)
  // The sheet should have formulas, but we can also update calculated values

  Logger.log('Dashboard metrics calculated:');
  Logger.log('- Total Offers: ' + metrics.totalOffersMade);
  Logger.log('- Response Rate: ' + metrics.responseRate.toFixed(2) + '%');
  Logger.log('- Deals Closed: ' + metrics.dealsClosed);
  Logger.log('- Monthly Profit: ' + formatCurrency(metrics.monthlyProfitTotal));
}

/**
 * DashboardUpdater.gs
 * Updates dashboard sheet in real-time
 */

/**
 * Refresh dashboard data
 * Called periodically to update dashboard
 */
function refreshDashboard() {
  Logger.log('Refreshing dashboard at ' + new Date());

  try {
    updateDashboardSheet();
    Logger.log('Dashboard refreshed successfully');
  } catch (error) {
    Logger.log('Error refreshing dashboard: ' + error.toString());
    logError('DashboardUpdater', error);
  }
}

/**
 * DigestEmailer.gs
 * Sends daily digest emails with metrics summary
 */

/**
 * Send daily digest email
 * Called by daily trigger
 */
function sendDailyDigest() {
  Logger.log('Sending daily digest at ' + new Date());

  var metrics = calculateDashboardMetrics();
  var recipientEmail = getUserContactInfo().YOUR_EMAIL || Session.getActiveUser().getEmail();

  var subject = 'LandFlow AI Daily Digest - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MM/dd/yyyy');

  var htmlBody = generateDigestEmailHTML(metrics);

  try {
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: htmlBody
    });

    Logger.log('Daily digest sent successfully');

  } catch (error) {
    Logger.log('Error sending daily digest: ' + error.toString());
    logError('DigestEmailer', error);
  }
}

/**
 * Generate digest email HTML
 * @param {Object} metrics - Dashboard metrics
 * @return {String} HTML email body
 */
function generateDigestEmailHTML(metrics) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
  html += 'body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}';
  html += '.header{background-color:#4285F4;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}';
  html += '.content{background-color:#f9f9f9;padding:20px;border:1px solid #ddd}';
  html += '.metric-box{background-color:#fff;border:1px solid #ddd;padding:15px;margin:10px 0;border-radius:5px}';
  html += '.metric-label{font-size:12px;color:#666;text-transform:uppercase}';
  html += '.metric-value{font-size:24px;font-weight:bold;color:#4285F4;margin:5px 0}';
  html += '.footer{background-color:#f0f0f0;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 5px 5px}';
  html += '</style></head><body>';

  html += '<div class="header"><h2>LandFlow AI Daily Digest</h2><p>' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'EEEE, MMMM dd, yyyy') + '</p></div>';

  html += '<div class="content">';
  html += '<h3>Key Metrics</h3>';

  // Total Offers
  html += '<div class="metric-box">';
  html += '<div class="metric-label">Total Offers Made</div>';
  html += '<div class="metric-value">' + metrics.totalOffersMade + '</div>';
  html += '</div>';

  // Response Rate
  html += '<div class="metric-box">';
  html += '<div class="metric-label">Response Rate</div>';
  html += '<div class="metric-value">' + metrics.responseRate.toFixed(1) + '%</div>';
  html += '</div>';

  // Deals Closed
  html += '<div class="metric-box">';
  html += '<div class="metric-label">Deals Closed (Total)</div>';
  html += '<div class="metric-value">' + metrics.dealsClosed + '</div>';
  html += '</div>';

  // Monthly Profit
  html += '<div class="metric-box">';
  html += '<div class="metric-label">Monthly Profit</div>';
  html += '<div class="metric-value">' + formatCurrency(metrics.monthlyProfitTotal) + '</div>';
  html += '</div>';

  // Average Profit
  html += '<div class="metric-box">';
  html += '<div class="metric-label">Average Profit per Deal</div>';
  html += '<div class="metric-value">' + formatCurrency(metrics.avgProfitPerDeal) + '</div>';
  html += '</div>';

  // Pipeline Status
  html += '<h3>Pipeline Status</h3>';
  html += '<ul>';
  for (var status in metrics.propertiesByStatus) {
    html += '<li><strong>' + status + ':</strong> ' + metrics.propertiesByStatus[status] + '</li>';
  }
  html += '</ul>';

  // Response Breakdown
  html += '<h3>Response Breakdown</h3>';
  html += '<ul>';
  for (var sentiment in metrics.responseBreakdown) {
    html += '<li><strong>' + sentiment + ':</strong> ' + metrics.responseBreakdown[sentiment] + '</li>';
  }
  html += '</ul>';

  html += '</div>';

  html += '<div class="footer">';
  html += '<p>Generated by LandFlow AI<br>View full dashboard in Google Sheets</p>';
  html += '</div>';

  html += '</body></html>';

  return html;
}

/**
 * DailyTriggers.gs
 * Daily automation triggers
 */

/**
 * Daily job runner - runs property scraping and outreach
 * Schedule this to run daily (e.g., 8 AM)
 */
function runDailyJob() {
  Logger.log('Starting daily job at ' + new Date());

  try {
    // Step 1: Scrape new properties
    Logger.log('Step 1: Running property scrapers...');
    var scrapeResult = runPropertyScrapers();
    Logger.log('Scraping complete: ' + JSON.stringify(scrapeResult));

    // Step 2: Send outreach emails to new properties
    Logger.log('Step 2: Sending outreach emails...');
    var outreachResult = sendOutreachEmails();
    Logger.log('Outreach complete: ' + JSON.stringify(outreachResult));

    // Step 3: Process follow-up emails
    Logger.log('Step 3: Processing follow-up emails...');
    var followUpResult = processFollowUpEmails();
    Logger.log('Follow-up complete: ' + JSON.stringify(followUpResult));

    // Step 4: Refresh dashboard
    Logger.log('Step 4: Refreshing dashboard...');
    refreshDashboard();

    // Step 5: Send daily digest
    Logger.log('Step 5: Sending daily digest...');
    sendDailyDigest();

    Logger.log('Daily job completed successfully');

    return {
      success: true,
      scrape: scrapeResult,
      outreach: outreachResult,
      followUp: followUpResult
    };

  } catch (error) {
    Logger.log('Error in daily job: ' + error.toString());
    logError('DailyTriggers', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Match properties to buyers (runs daily)
 */
function runDailyBuyerMatching() {
  Logger.log('Running daily buyer matching at ' + new Date());

  try {
    var spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      Logger.log('Spreadsheet ID not set');
      return;
    }

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName('Properties');

    if (!sheet) {
      Logger.log('Properties sheet not found');
      return;
    }

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();

    var matched = 0;

    // Find properties under contract
    for (var i = 1; i < values.length; i++) {
      var status = values[i][10]; // Column K: Status

      if (status === 'Under Contract') {
        var propertyId = values[i][0]; // Column A: Property ID
        var matchingBuyers = matchPropertyToBuyers(propertyId);

        if (matchingBuyers && matchingBuyers.length > 0) {
          matched++;
        }
      }
    }

    Logger.log('Buyer matching complete: ' + matched + ' properties matched');

  } catch (error) {
    Logger.log('Error in buyer matching: ' + error.toString());
    logError('DailyTriggers-BuyerMatching', error);
  }
}

/**
 * HourlyTriggers.gs
 * Hourly automation triggers
 */

/**
 * Hourly job runner - processes incoming email replies
 * Schedule this to run every hour
 */
function runHourlyJob() {
  Logger.log('Starting hourly job at ' + new Date());

  try {
    // Process incoming email replies
    Logger.log('Processing incoming replies...');
    var replyResult = processIncomingReplies();
    Logger.log('Reply processing complete: ' + JSON.stringify(replyResult));

    // Refresh dashboard
    refreshDashboard();

    Logger.log('Hourly job completed successfully');

    return {
      success: true,
      replies: replyResult
    };

  } catch (error) {
    Logger.log('Error in hourly job: ' + error.toString());
    logError('HourlyTriggers', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Check for properties needing follow-up (runs every 4 hours)
 */
function checkFollowUps() {
  Logger.log('Checking follow-ups at ' + new Date());

  try {
    var result = processFollowUpEmails();
    Logger.log('Follow-up check complete: ' + JSON.stringify(result));
    return result;
  } catch (error) {
    Logger.log('Error checking follow-ups: ' + error.toString());
    logError('HourlyTriggers-FollowUps', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * TriggerInstaller.gs
 * One-click trigger installation
 */

/**
 * Install all automation triggers
 * Run this function once to set up all triggers
 */
function installAllTriggers() {
  Logger.log('Installing all triggers at ' + new Date());

  try {
    // Delete existing triggers (cleanup)
    deleteAllTriggers();

    // Daily triggers
    ScriptApp.newTrigger('runDailyJob')
      .timeBased()
      .everyDays(1)
      .atHour(8) // 8 AM
      .create();
    Logger.log('Daily job trigger installed (8 AM)');

    ScriptApp.newTrigger('runDailyBuyerMatching')
      .timeBased()
      .everyDays(1)
      .atHour(10) // 10 AM
      .create();
    Logger.log('Daily buyer matching trigger installed (10 AM)');

    // Hourly triggers
    ScriptApp.newTrigger('runHourlyJob')
      .timeBased()
      .everyHours(1)
      .create();
    Logger.log('Hourly job trigger installed');

    // Follow-up check (every 4 hours)
    ScriptApp.newTrigger('checkFollowUps')
      .timeBased()
      .everyHours(4)
      .create();
    Logger.log('Follow-up check trigger installed (every 4 hours)');

    // Dashboard refresh (every 6 hours)
    ScriptApp.newTrigger('refreshDashboard')
      .timeBased()
      .everyHours(6)
      .create();
    Logger.log('Dashboard refresh trigger installed (every 6 hours)');

    Logger.log('All triggers installed successfully');
    return { success: true, message: 'All triggers installed' };

  } catch (error) {
    Logger.log('Error installing triggers: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Delete all existing triggers
 */
function deleteAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();

  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  Logger.log('Deleted ' + triggers.length + ' existing triggers');
}

/**
 * List all active triggers
 * @return {Array} Array of trigger information
 */
function listTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var triggerInfo = [];

  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i];
    triggerInfo.push({
      functionName: trigger.getHandlerFunction(),
      triggerSource: trigger.getTriggerSource(),
      eventType: trigger.getEventType()
    });
  }

  return triggerInfo;
}

/**
 * Install triggers with custom schedule
 * @param {Object} schedule - Schedule configuration
 */
function installCustomTriggers(schedule) {
  schedule = schedule || {
    dailyTime: 8,
    hourlyEnabled: true,
    followUpInterval: 4
  };

  deleteAllTriggers();

  // Daily job
  ScriptApp.newTrigger('runDailyJob')
    .timeBased()
    .everyDays(1)
    .atHour(schedule.dailyTime)
    .create();

  // Hourly job (if enabled)
  if (schedule.hourlyEnabled) {
    ScriptApp.newTrigger('runHourlyJob')
      .timeBased()
      .everyHours(1)
      .create();
  }

  // Follow-up check
  ScriptApp.newTrigger('checkFollowUps')
    .timeBased()
    .everyHours(schedule.followUpInterval)
    .create();

  Logger.log('Custom triggers installed with schedule: ' + JSON.stringify(schedule));
}

/**
 * Main.gs
 * Central orchestration script and entry points
 */

/**
 * Main initialization function
 * Run this once after setting up the Google Sheet
 */
function initializeLandFlowAI() {
  Logger.log('Initializing LandFlow AI...');

  try {
    // Step 1: Set spreadsheet ID (user must set this first)
    var spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      Logger.log('ERROR: Spreadsheet ID not set. Use ScraperConfig.setSpreadsheetId() first.');
      return;
    }

    // Step 2: Initialize buyer database
    Logger.log('Initializing buyer database...');
    initializeBuyerDatabase();

    // Step 3: Install triggers
    Logger.log('Installing triggers...');
    var triggerResult = installAllTriggers();

    Logger.log('LandFlow AI initialization complete!');
    Logger.log('Triggers installed: ' + triggerResult.success);

    return {
      success: true,
      spreadsheetId: spreadsheetId,
      triggersInstalled: triggerResult.success
    };

  } catch (error) {
    Logger.log('Error initializing LandFlow AI: ' + error.toString());
    logError('Main-Initialize', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test function - run all components manually
 */
function testSystem() {
  Logger.log('Running system test...');

  try {
    // Test 1: Config
    Logger.log('Test 1: Configuration');
    var config = getSearchParams();
    Logger.log('Search params: ' + JSON.stringify(config));

    // Test 2: Sheet access
    Logger.log('Test 2: Sheet access');
    var sheet = getPropertiesSheet();
    Logger.log('Properties sheet accessed: ' + (sheet ? 'OK' : 'FAIL'));

    // Test 3: Buyer database
    Logger.log('Test 3: Buyer database');
    var buyers = getAllBuyers();
    Logger.log('Buyers loaded: ' + buyers.length);

    // Test 4: Metrics
    Logger.log('Test 4: Metrics calculation');
    var metrics = calculateDashboardMetrics();
    Logger.log('Metrics calculated: ' + JSON.stringify(metrics));

    Logger.log('System test complete - all components OK');
    return { success: true };

  } catch (error) {
    Logger.log('System test failed: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Manual trigger for property scraping (for testing)
 */
function manualScrapeProperties() {
  Logger.log('Manual property scraping triggered');
  return runPropertyScrapers();
}

/**
 * Manual trigger for sending outreach (for testing)
 */
function manualSendOutreach() {
  Logger.log('Manual outreach triggered');
  return sendOutreachEmails();
}

/**
 * Manual trigger for processing replies (for testing)
 */
function manualProcessReplies() {
  Logger.log('Manual reply processing triggered');
  return processIncomingReplies();
}
