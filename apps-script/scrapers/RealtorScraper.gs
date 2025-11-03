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

