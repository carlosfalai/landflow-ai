/**
 * ZillowScraper.gs
 * Scrapes vacant land listings from Zillow
 */

/**
 * Scrape Zillow for land listings
 * @param {Object} params - Search parameters
 * @return {Array} Array of property objects
 */
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

