# Properties Sheet Template

## Sheet Name: "Properties"

## Column Structure (Columns A through J)

| Column | Header | Data Type | Description | Formula/Notes |
|--------|--------|-----------|-------------|---------------|
| A | ID | Text | Unique property identifier | Auto-generated: `=CONCATENATE("PROP-",ROW()-1)` or UUID |
| B | Address | Text | Full property address | Format: "Street Address, City, State ZIP" |
| C | County | Text | County name | Auto-extracted or manual entry |
| D | Price | Number | Listing price | Currency format |
| E | Acreage | Number | Land size in acres | Decimal format (e.g., 2.5) |
| F | Seller | Text | Seller name or agent contact | From scraped data or manual |
| G | URL | Text | Source listing URL | Hyperlink format |
| H | Contacted | Checkbox/Date | Whether property has been contacted | TRUE/FALSE or date of first contact |
| I | Offer Sent | Date | Date offer email was sent | Auto-populated by Apps Script |
| J | Offer Amount | Currency | Amount of offer made | Calculated as 70-80% of Price |
| K | Status | Text | Current status | Values: "New", "Contacted", "Offer Sent", "Response Received", "Under Review", "Dormant", "Under Contract", "Closed" |
| L | Days on Market | Number | Days since listing date | `=TODAY()-M1` where M is listing date |
| M | Listing Date | Date | Date property was listed | From source website |
| N | Source | Text | Source website | "Zillow", "LandWatch", "Realtor.com", "Redfin" |
| O | Last Updated | Timestamp | Last time row was updated | `=NOW()` formula or Apps Script timestamp |

## Data Validation Rules

- **Status Column (K)**: Dropdown with values: "New", "Contacted", "Offer Sent", "Response Received", "Under Review", "Dormant", "Under Contract", "Closed"
- **Price Column (D)**: Number format, minimum 0
- **Acreage Column (E)**: Number format, minimum 0.01

## Conditional Formatting

1. **New Properties**: Status = "New" → Green background
2. **Offers Sent**: Status = "Offer Sent" → Yellow background
3. **Response Received**: Status = "Response Received" → Blue background
4. **Under Review**: Status = "Under Review" → Orange background
5. **Dormant**: Status = "Dormant" → Gray background
6. **Days on Market > 90**: Red text

## Formulas

- **Offer Amount (J)**: `=IF(D2>0, RANDBETWEEN(ROUND(D2*0.7,0), ROUND(D2*0.8,0)), "")`
- **Days on Market (L)**: `=IF(M2<>"", TODAY()-M2, "")`

## Protected Ranges

- Column A (ID): Protected from manual edits (Apps Script only)
- Column O (Last Updated): Protected from manual edits (Apps Script only)

## Row 1: Header Row
- Bold, freeze row
- Background color: #4285F4 (Google Blue)
- Text color: White
