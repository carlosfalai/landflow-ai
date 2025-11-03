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

