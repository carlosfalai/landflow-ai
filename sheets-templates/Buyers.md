# Buyers Sheet Template

## Sheet Name: "Buyers"

## Column Structure

| Column | Header | Data Type | Description | Formula/Notes |
|--------|--------|-----------|-------------|---------------|
| A | Company | Text | Builder company name | "DR Horton", "LGI Homes", "Lennar", etc. |
| B | Contact Name | Text | Primary contact person | Full name |
| C | Email | Text | Contact email address | Email format validation |
| D | Phone | Text | Contact phone number | Format: (XXX) XXX-XXXX |
| E | Location | Text | Geographic focus areas | "Texas, Florida, Georgia" |
| F | Lot Size Min | Number | Minimum lot size in acres | Decimal format |
| G | Lot Size Max | Number | Maximum lot size in acres | Decimal format |
| H | Price Range Min | Currency | Minimum purchase price | Currency format |
| I | Price Range Max | Currency | Maximum purchase price | Currency format |
| J | Property Match | Text | Matched property IDs | Comma-separated list |
| K | Contacted | Date | Date first contacted | Auto-populated |
| L | Last Contact | Date | Date of last outreach | Auto-updated |
| M | Response | Text | Response status | "No Reply", "Interested", "Not Interested", "Under Review" |
| N | Notes | Text | Additional notes | Manual or AI-generated |

## Data Validation Rules

- **Company Column (A)**: Dropdown with major builders (DR Horton, LGI Homes, Lennar, Pulte, KB Home, etc.)
- **Response Column (M)**: Dropdown: "No Reply", "Interested", "Not Interested", "Under Review"
- **Email Column (C)**: Data validation for email format

## Conditional Formatting

1. **Interested**: Response = "Interested" → Green background
2. **Not Interested**: Response = "Not Interested" → Red background
3. **No Reply > 7 days**: Last Contact < TODAY()-7 and Response = "No Reply" → Yellow background

## Formulas

- **Days Since Last Contact**: `=IF(L2<>"", TODAY()-L2, "")`
- **Match Count**: `=IF(J2<>"", LEN(J2)-LEN(SUBSTITUTE(J2,",",""))+1, 0)`

## Row 1: Header Row
- Bold, freeze row
- Background color: #FBBC04 (Google Yellow/Orange)
- Text color: Black

