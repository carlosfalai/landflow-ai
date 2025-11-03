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

