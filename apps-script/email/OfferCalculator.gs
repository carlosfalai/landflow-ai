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

