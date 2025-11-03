/**
 * BuyerDatabase.gs
 * Manages verified builder buyer database
 */

/**
 * Initialize buyer database from JSON data
 * Call this once to populate the Buyers sheet
 */
function initializeBuyerDatabase() {
  Logger.log('Initializing buyer database...');
  
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set');
  }
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');
  
  if (!sheet) {
    throw new Error('Buyers sheet not found');
  }
  
  // Check if already populated
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    Logger.log('Buyer database already populated. Row count: ' + (lastRow - 1));
    return;
  }
  
  // Get buyer data from JSON
  var buyers = getVerifiedBuilders();
  
  var rows = [];
  for (var i = 0; i < buyers.length; i++) {
    var buyer = buyers[i];
    rows.push([
      buyer.company || '',
      buyer.contactName || '',
      buyer.email || '',
      buyer.phone || '',
      buyer.location || '',
      buyer.lotSizeMin || 0,
      buyer.lotSizeMax || 100,
      buyer.priceRangeMin || 0,
      buyer.priceRangeMax || 1000000,
      '', // Property Match - will be filled later
      '', // Contacted
      '', // Last Contact
      'No Reply', // Response
      buyer.notes || ''
    ]);
  }
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    
    // Format rows
    for (var j = 0; j < rows.length; j++) {
      var rowNum = j + 2;
      sheet.getRange(rowNum, 6).setNumberFormat('0.00'); // Lot Size Min
      sheet.getRange(rowNum, 7).setNumberFormat('0.00'); // Lot Size Max
      sheet.getRange(rowNum, 8).setNumberFormat('$#,##0'); // Price Range Min
      sheet.getRange(rowNum, 9).setNumberFormat('$#,##0'); // Price Range Max
      sheet.getRange(rowNum, 11).setNumberFormat('mm/dd/yyyy'); // Contacted
      sheet.getRange(rowNum, 12).setNumberFormat('mm/dd/yyyy'); // Last Contact
    }
    
    Logger.log('Buyer database initialized with ' + rows.length + ' buyers');
  }
}

/**
 * Get verified builders from JSON
 * @return {Array} Array of buyer objects
 */
function getVerifiedBuilders() {
  // In real implementation, you would read from a file or Properties Service
  // For now, return hardcoded data (can be replaced with JSON file read)
  return [
    {
      company: 'DR Horton',
      contactName: 'Land Acquisition Team',
      email: 'landacquisition@drhorton.com',
      phone: '',
      location: 'Texas, Florida, Georgia, North Carolina, Arizona',
      lotSizeMin: 0.25,
      lotSizeMax: 5.0,
      priceRangeMin: 15000,
      priceRangeMax: 500000
    },
    {
      company: 'LGI Homes',
      contactName: 'Land Development',
      email: 'land@lgihomes.com',
      phone: '',
      location: 'Texas, Florida, Georgia, North Carolina',
      lotSizeMin: 0.20,
      lotSizeMax: 3.0,
      priceRangeMin: 12000,
      priceRangeMax: 400000
    },
    {
      company: 'Lennar',
      contactName: 'Land Acquisition',
      email: 'land@lennar.com',
      phone: '',
      location: 'Texas, Florida, California, Arizona, Nevada',
      lotSizeMin: 0.30,
      lotSizeMax: 10.0,
      priceRangeMin: 20000,
      priceRangeMax: 750000
    },
    {
      company: 'Pulte Homes',
      contactName: 'Land Team',
      email: 'land@pulte.com',
      phone: '',
      location: 'Texas, Florida, Georgia, North Carolina, Arizona',
      lotSizeMin: 0.25,
      lotSizeMax: 5.0,
      priceRangeMin: 15000,
      priceRangeMax: 500000
    },
    {
      company: 'KB Home',
      contactName: 'Land Development',
      email: 'land@kbhome.com',
      phone: '',
      location: 'Texas, California, Florida, Arizona',
      lotSizeMin: 0.20,
      lotSizeMax: 4.0,
      priceRangeMin: 12000,
      priceRangeMax: 450000
    }
  ];
}

/**
 * Get all buyers from Buyers sheet
 * @return {Array} Array of buyer row data
 */
function getAllBuyers() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return [];
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Buyers');
  
  if (!sheet) return [];
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var buyers = [];
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    buyers.push({
      rowIndex: i + 1,
      company: values[i][0],
      contactName: values[i][1],
      email: values[i][2],
      phone: values[i][3],
      location: values[i][4],
      lotSizeMin: values[i][5] || 0,
      lotSizeMax: values[i][6] || 100,
      priceRangeMin: values[i][7] || 0,
      priceRangeMax: values[i][8] || 1000000,
      propertyMatch: values[i][9] || '',
      contacted: values[i][10],
      lastContact: values[i][11],
      response: values[i][12] || 'No Reply',
      notes: values[i][13] || ''
    });
  }
  
  return buyers;
}

