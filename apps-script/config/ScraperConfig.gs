/**
 * ScraperConfig.gs
 * Configuration for property scraping parameters
 */

var SCRAPER_CONFIG = {
  // Search parameters
  searchParams: {
    minPrice: 10000,
    maxPrice: 500000,
    minAcreage: 0.5,
    maxAcreage: 100,
    locations: ['Texas', 'Florida', 'Georgia', 'Arizona', 'North Carolina'], // Add your target states
    daysOnMarketMax: 365
  },
  
  // Google Sheets configuration
  sheetConfig: {
    spreadsheetId: '', // Set this via Properties Service or manually
    sheetName: 'Properties',
    headerRow: 1
  },
  
  // Rate limiting (to avoid being blocked)
  rateLimit: {
    delayBetweenRequests: 2000, // 2 seconds between requests
    maxRequestsPerRun: 50, // Maximum properties to scrape per run
    enabled: true
  },
  
  // Scraper settings
  enabledScrapers: ['zillow', 'landwatch', 'realtor', 'redfin'],
  
  // User agent strings for web scraping
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ]
};

/**
 * Get search parameters
 * @return {Object} Search parameters
 */
function getSearchParams() {
  return SCRAPER_CONFIG.searchParams;
}

/**
 * Get sheet configuration
 * @return {Object} Sheet configuration
 */
function getSheetConfig() {
  return SCRAPER_CONFIG.sheetConfig;
}

/**
 * Get rate limit settings
 * @return {Object} Rate limit configuration
 */
function getRateLimitConfig() {
  return SCRAPER_CONFIG.rateLimit;
}

/**
 * Get enabled scrapers
 * @return {Array} Array of enabled scraper names
 */
function getEnabledScrapers() {
  return SCRAPER_CONFIG.enabledScrapers;
}

/**
 * Get random user agent
 * @return {String} Random user agent string
 */
function getRandomUserAgent() {
  var agents = SCRAPER_CONFIG.userAgents;
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Build search URL for a given platform
 * @param {String} platform - Platform name (zillow, landwatch, etc.)
 * @param {Object} params - Search parameters
 * @return {String} Constructed search URL
 */
function buildSearchURL(platform, params) {
  var baseUrls = {
    zillow: 'https://www.zillow.com/homes/',
    landwatch: 'https://www.landwatch.com/property-for-sale/',
    realtor: 'https://www.realtor.com/realestateandhomes-search/',
    redfin: 'https://www.redfin.com/state/'
  };
  
  // This is a template - actual URL construction will be in individual scrapers
  return baseUrls[platform] || '';
}

/**
 * Set spreadsheet ID (can be called from setup script)
 * @param {String} spreadsheetId - Google Sheets ID
 */
function setSpreadsheetId(spreadsheetId) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', spreadsheetId);
  SCRAPER_CONFIG.sheetConfig.spreadsheetId = spreadsheetId;
}

/**
 * Get spreadsheet ID from Properties Service or config
 * @return {String} Spreadsheet ID
 */
function getSpreadsheetId() {
  var properties = PropertiesService.getScriptProperties();
  var id = properties.getProperty('SPREADSHEET_ID');
  if (id) {
    return id;
  }
  return SCRAPER_CONFIG.sheetConfig.spreadsheetId;
}

