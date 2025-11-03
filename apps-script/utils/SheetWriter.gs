/**
 * SheetWriter.gs
 * Utility functions for writing data to Google Sheets
 */

/**
 * Get the Properties sheet
 * @return {Sheet} Google Sheet object
 */
function getPropertiesSheet() {
  var spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not set. Use ScraperConfig.setSpreadsheetId() first.');
  }
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Properties');
  
  if (!sheet) {
    throw new Error('Properties sheet not found. Please create it first.');
  }
  
  return sheet;
}

/**
 * Write property data to sheet
 * @param {Object} propertyData - Property data object
 * @return {Number} Row number where data was written
 */
function writePropertyToSheet(propertyData) {
  var sheet = getPropertiesSheet();
  var dataRange = sheet.getDataRange();
  var lastRow = dataRange.getLastRow();
  
  // Check for duplicates based on URL or Address
  var existingRow = findExistingProperty(propertyData);
  if (existingRow > 0) {
    // Update existing row
    return updatePropertyRow(sheet, existingRow, propertyData);
  }
  
  // Generate property ID
  var propertyId = 'PROP-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  
  // Prepare row data
  var rowData = [
    propertyId, // A: ID
    propertyData.address || '', // B: Address
    propertyData.county || '', // C: County
    propertyData.price || '', // D: Price
    propertyData.acreage || '', // E: Acreage
    propertyData.seller || '', // F: Seller
    propertyData.url || '', // G: URL
    false, // H: Contacted (checkbox)
    '', // I: Offer Sent
    '', // J: Offer Amount
    'New', // K: Status
    propertyData.daysOnMarket || '', // L: Days on Market
    propertyData.listingDate || new Date(), // M: Listing Date
    propertyData.source || '', // N: Source
    new Date() // O: Last Updated
  ];
  
  // Write to next available row
  var newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
  
  // Format the row
  formatPropertyRow(sheet, newRow);
  
  return newRow;
}

/**
 * Find existing property by URL or Address
 * @param {Object} propertyData - Property data object
 * @return {Number} Row number if found, 0 if not found
 */
function findExistingProperty(propertyData) {
  var sheet = getPropertiesSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Skip header row
  for (var i = 1; i < values.length; i++) {
    var rowUrl = values[i][6]; // Column G: URL
    var rowAddress = values[i][1]; // Column B: Address
    
    // Match by URL (most reliable)
    if (propertyData.url && rowUrl === propertyData.url) {
      return i + 1; // Return 1-based row number
    }
    
    // Match by address (normalize for comparison)
    if (propertyData.address && rowAddress) {
      var normalizedInput = normalizeAddress(propertyData.address);
      var normalizedRow = normalizeAddress(rowAddress);
      if (normalizedInput === normalizedRow) {
        return i + 1;
      }
    }
  }
  
  return 0; // Not found
}

/**
 * Normalize address for comparison
 * @param {String} address - Address string
 * @return {String} Normalized address
 */
function normalizeAddress(address) {
  return address.toLowerCase()
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Update existing property row
 * @param {Sheet} sheet - Sheet object
 * @param {Number} rowNum - Row number (1-based)
 * @param {Object} propertyData - Updated property data
 * @return {Number} Row number
 */
function updatePropertyRow(sheet, rowNum, propertyData) {
  // Update only certain columns (don't overwrite user-entered data)
  var updateData = [
    null, // A: ID (don't update)
    propertyData.address || null, // B: Address
    propertyData.county || null, // C: County
    propertyData.price || null, // D: Price
    propertyData.acreage || null, // E: Acreage
    propertyData.seller || null, // F: Seller
    propertyData.url || null, // G: URL
    null, // H: Contacted (don't update)
    null, // I: Offer Sent (don't update)
    null, // J: Offer Amount (don't update)
    null, // K: Status (don't update unless property was removed from source)
    propertyData.daysOnMarket || null, // L: Days on Market
    propertyData.listingDate || null, // M: Listing Date
    propertyData.source || null, // N: Source
    new Date() // O: Last Updated
  ];
  
  // Update only non-null values
  for (var col = 1; col <= updateData.length; col++) {
    if (updateData[col - 1] !== null) {
      sheet.getRange(rowNum, col).setValue(updateData[col - 1]);
    }
  }
  
  formatPropertyRow(sheet, rowNum);
  
  return rowNum;
}

/**
 * Format property row
 * @param {Sheet} sheet - Sheet object
 * @param {Number} rowNum - Row number (1-based)
 */
function formatPropertyRow(sheet, rowNum) {
  // Format price as currency (Column D)
  sheet.getRange(rowNum, 4).setNumberFormat('$#,##0');
  
  // Format acreage (Column E)
  sheet.getRange(rowNum, 5).setNumberFormat('0.00');
  
  // Format dates (Columns I, M, O)
  sheet.getRange(rowNum, 9).setNumberFormat('mm/dd/yyyy');
  sheet.getRange(rowNum, 13).setNumberFormat('mm/dd/yyyy');
  sheet.getRange(rowNum, 15).setNumberFormat('mm/dd/yyyy hh:mm:ss');
  
  // Format URL as hyperlink (Column G)
  var url = sheet.getRange(rowNum, 7).getValue();
  if (url && url.toString().startsWith('http')) {
    sheet.getRange(rowNum, 7).setFormula('=HYPERLINK("' + url + '","' + url + '")');
  }
}

/**
 * Batch write properties (more efficient for multiple properties)
 * @param {Array} propertiesArray - Array of property data objects
 * @return {Number} Number of properties written
 */
function batchWriteProperties(propertiesArray) {
  var sheet = getPropertiesSheet();
  var dataRange = sheet.getDataRange();
  var lastRow = dataRange.getLastRow();
  var newRows = [];
  var updatedRows = 0;
  
  for (var i = 0; i < propertiesArray.length; i++) {
    var propertyData = propertiesArray[i];
    
    // Check for duplicates
    var existingRow = findExistingProperty(propertyData);
    
    if (existingRow > 0) {
      // Update existing
      updatePropertyRow(sheet, existingRow, propertyData);
      updatedRows++;
    } else {
      // Prepare new row
      var propertyId = 'PROP-' + Utilities.getUuid().substring(0, 8).toUpperCase();
      var rowData = [
        propertyId,
        propertyData.address || '',
        propertyData.county || '',
        propertyData.price || '',
        propertyData.acreage || '',
        propertyData.seller || '',
        propertyData.url || '',
        false,
        '',
        '',
        'New',
        propertyData.daysOnMarket || '',
        propertyData.listingDate || new Date(),
        propertyData.source || '',
        new Date()
      ];
      newRows.push(rowData);
    }
  }
  
  // Write all new rows at once
  if (newRows.length > 0) {
    var startRow = lastRow + 1;
    sheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    
    // Format all new rows
    for (var j = 0; j < newRows.length; j++) {
      formatPropertyRow(sheet, startRow + j);
    }
  }
  
  return {
    new: newRows.length,
    updated: updatedRows,
    total: newRows.length + updatedRows
  };
}

