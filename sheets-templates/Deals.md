# Deals Sheet Template

## Sheet Name: "Deals"

## Column Structure

| Column | Header | Data Type | Description | Formula/Notes |
|--------|--------|-----------|-------------|---------------|
| A | Deal ID | Text | Unique deal identifier | Auto-generated: `=CONCATENATE("DEAL-",ROW()-1)` |
| B | Property ID | Text | Links to Properties sheet | Foreign key reference |
| C | Property Address | Text | Property address | Lookup from Properties |
| D | Seller Offer | Currency | Final agreed price with seller | Currency format |
| E | Buyer Offer | Currency | Sale price to buyer | Currency format |
| F | Profit | Currency | Net profit | `=E2-D2` |
| G | Profit Margin | Percentage | Profit percentage | `=F2/D2` |
| H | Close Date | Date | Expected or actual closing date | Date format |
| I | Status | Text | Deal status | "Under Contract", "In Escrow", "Closed", "Cancelled" |
| J | Buyer Company | Text | Buyer company name | Links to Buyers sheet |
| K | Seller Name | Text | Seller contact name | From Properties sheet |
| L | Contract Date | Date | Date contract was signed | Date format |
| M | Days to Close | Number | Days from contract to close | `=H2-L2` |
| N | Notes | Text | Deal notes | Manual entry or AI-generated |

## Data Validation Rules

- **Status Column (I)**: Dropdown: "Under Contract", "In Escrow", "Closed", "Cancelled"

## Conditional Formatting

1. **Under Contract**: Status = "Under Contract" → Yellow background
2. **In Escrow**: Status = "In Escrow" → Blue background
3. **Closed**: Status = "Closed" → Green background
4. **High Profit (>$10k)**: Profit > 10000 → Green text
5. **Low Profit (<$5k)**: Profit < 5000 → Red text

## Formulas

- **Profit (F)**: `=IF(AND(D2>0, E2>0), E2-D2, "")`
- **Profit Margin (G)**: `=IF(D2>0, F2/D2, "")` formatted as percentage
- **Days to Close (M)**: `=IF(AND(L2<>"", H2<>""), H2-L2, "")`

## Lookup Functions

- **Property Address (C)**: `=IFERROR(VLOOKUP(B2, Properties!A:B, 2, FALSE), "")`
- **Seller Name (K)**: `=IFERROR(VLOOKUP(B2, Properties!A:F, 6, FALSE), "")`

## Row 1: Header Row
- Bold, freeze row
- Background color: #9C27B0 (Purple)
- Text color: White

