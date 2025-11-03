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

