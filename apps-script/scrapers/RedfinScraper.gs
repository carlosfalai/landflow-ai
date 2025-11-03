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

