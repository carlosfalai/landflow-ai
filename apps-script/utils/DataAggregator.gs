/**
 * DataAggregator.gs
 * Aggregates data from all sheets for dashboard calculations
 */

/**
 * Get all dashboard data
 * @return {Object} Aggregated data object
 */
function getDashboardData() {
  return {
    properties: getPropertiesData(),
    emails: getEmailsData(),
    replies: getRepliesData(),
    deals: getDealsData(),
    buyers: getBuyersData()
  };
}

/**
 * Get properties data
 * @return {Object} Properties statistics
 */
function getPropertiesData() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return {};
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');
  
  if (!sheet) return {};
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var stats = {
    total: values.length - 1, // Exclude header
    byStatus: {},
    totalValue: 0,
    avgPrice: 0,
    totalAcreage: 0
  };
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var status = values[i][10] || 'New'; // Column K: Status
    var price = parseFloat(values[i][3]) || 0; // Column D: Price
    var acreage = parseFloat(values[i][4]) || 0; // Column E: Acreage
    
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    stats.totalValue += price;
    stats.totalAcreage += acreage;
  }
  
  if (stats.total > 0) {
    stats.avgPrice = stats.totalValue / stats.total;
  }
  
  return stats;
}

/**
 * Get emails data
 * @return {Object} Emails statistics
 */
function getEmailsData() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return {};
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Emails');
  
  if (!sheet) return {};
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var stats = {
    total: values.length - 1,
    byStatus: {},
    byType: {},
    totalFollowUps: 0
  };
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var status = values[i][4] || 'Sent'; // Column E: Status
    var emailType = values[i][10] || 'Initial'; // Column K: Email Type
    var followUpCount = parseInt(values[i][9]) || 0; // Column J: Follow Up Count
    
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    stats.byType[emailType] = (stats.byType[emailType] || 0) + 1;
    stats.totalFollowUps += followUpCount;
  }
  
  return stats;
}

/**
 * Get replies data
 * @return {Object} Replies statistics
 */
function getRepliesData() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return {};
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Replies');
  
  if (!sheet) return {};
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var stats = {
    total: values.length - 1,
    bySentiment: {},
    byType: {},
    avgConfidence: 0,
    totalConfidence: 0
  };
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var sentiment = values[i][3] || 'Neutral'; // Column D: Sentiment
    var replyType = values[i][4] || 'Unclear'; // Column E: Reply Type
    var confidence = parseFloat(values[i][5]) || 0; // Column F: AI Confidence
    
    stats.bySentiment[sentiment] = (stats.bySentiment[sentiment] || 0) + 1;
    stats.byType[replyType] = (stats.byType[replyType] || 0) + 1;
    stats.totalConfidence += confidence;
  }
  
  if (stats.total > 0) {
    stats.avgConfidence = stats.totalConfidence / stats.total;
  }
  
  return stats;
}

/**
 * Get deals data
 * @return {Object} Deals statistics
 */
function getDealsData() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return {};
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Deals');
  
  if (!sheet) return {};
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var stats = {
    total: values.length - 1,
    byStatus: {},
    totalProfit: 0,
    avgProfit: 0,
    totalDeals: 0,
    closedDeals: 0
  };
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var status = values[i][8] || ''; // Column I: Status
    var profit = parseFloat(values[i][5]) || 0; // Column F: Profit
    
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    
    if (status === 'Closed') {
      stats.closedDeals++;
      stats.totalProfit += profit;
    }
  }
  
  if (stats.closedDeals > 0) {
    stats.avgProfit = stats.totalProfit / stats.closedDeals;
  }
  
  stats.totalDeals = values.length - 1;
  
  return stats;
}

/**
 * Get buyers data
 * @return {Object} Buyers statistics
 */
function getBuyersData() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return {};
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');
  
  if (!sheet) return {};
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var stats = {
    total: values.length - 1,
    contacted: 0,
    responded: 0,
    byResponse: {}
  };
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var contacted = values[i][10]; // Column K: Contacted
    var response = values[i][12] || 'No Reply'; // Column M: Response
    
    if (contacted) {
      stats.contacted++;
    }
    
    stats.byResponse[response] = (stats.byResponse[response] || 0) + 1;
    
    if (response !== 'No Reply') {
      stats.responded++;
    }
  }
  
  return stats;
}

