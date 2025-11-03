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

