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

