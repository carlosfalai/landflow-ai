# Performance Dashboard Sheet Template

## Sheet Name: "Performance Dashboard"

## Layout Structure

### Section 1: Key Metrics (Rows 1-10, Columns A-D)

| Cell | Label | Formula/Value |
|------|-------|---------------|
| A1 | **PERFORMANCE METRICS** | Header (merge A1:D1) |
| A3 | Total Offers Made | `=COUNTA(Emails!A:A)-1` |
| A4 | Total Responses | `=COUNTIF(Replies!D:D, "Interested")+COUNTIF(Replies!D:D, "Counteroffer")` |
| A5 | Response Rate | `=IF(A3>0, A4/A3, 0)` (formatted as percentage) |
| A6 | Offers to Close Ratio | `=IF(A3>0, COUNTIF(Deals!I:I, "Closed")/A3, 0)` |
| A7 | Average Profit per Deal | `=IFERROR(AVERAGEIF(Deals!I:I, "Closed", Deals!F:F), 0)` |
| A8 | Monthly Profit Total | `=SUMIFS(Deals!F:F, Deals!I:I, "Closed", Deals!H:H, ">="&EOMONTH(TODAY(),-1)+1, Deals!H:H, "<="&EOMONTH(TODAY(),0))` |
| A9 | Deals Closed This Month | `=COUNTIFS(Deals!I:I, "Closed", Deals!H:H, ">="&EOMONTH(TODAY(),-1)+1, Deals!H:H, "<="&EOMONTH(TODAY(),0))` |
| A10 | Total Profit (All Time) | `=SUMIF(Deals!I:I, "Closed", Deals!F:F)` |

### Section 2: Pipeline Status (Rows 12-20, Columns A-C)

| Cell | Label | Formula/Value |
|------|-------|---------------|
| A12 | **PIPELINE STATUS** | Header |
| A14 | New Properties | `=COUNTIF(Properties!K:K, "New")` |
| A15 | Offers Sent | `=COUNTIF(Properties!K:K, "Offer Sent")` |
| A16 | Under Review | `=COUNTIF(Properties!K:K, "Under Review")` |
| A17 | Under Contract | `=COUNTIF(Properties!K:K, "Under Contract")` |
| A18 | Dormant | `=COUNTIF(Properties!K:K, "Dormant")` |

### Section 3: Response Analysis (Rows 22-28, Columns A-B)

| Cell | Label | Formula/Value |
|------|-------|---------------|
| A22 | **RESPONSE BREAKDOWN** | Header |
| A24 | Interested | `=COUNTIF(Replies!D:D, "Interested")` |
| A25 | Counteroffers | `=COUNTIF(Replies!D:D, "Counteroffer")` |
| A26 | Not Interested | `=COUNTIF(Replies!D:D, "Not Interested")` |
| A27 | Spam | `=COUNTIF(Replies!D:D, "Spam")` |

### Section 4: Monthly Trends (Rows 30-40, Columns A-D)

| Cell | Label | Formula/Value |
|------|-------|---------------|
| A30 | **MONTHLY TRENDS** | Header |
| A32 | Month | Current month label |
| B32 | Offers | `=COUNTIFS(Emails!F:F, ">="&EOMONTH(TODAY(),-1)+1, Emails!F:F, "<="&EOMONTH(TODAY(),0))` |
| C32 | Responses | `=COUNTIFS(Replies!C:C, ">="&EOMONTH(TODAY(),-1)+1, Replies!C:C, "<="&EOMONTH(TODAY(),0))` |
| D32 | Closed | `=COUNTIFS(Deals!H:H, ">="&EOMONTH(TODAY(),-1)+1, Deals!H:H, "<="&EOMONTH(TODAY(),0), Deals!I:I, "Closed")` |

## Conditional Formatting

1. **Response Rate > 20%**: Green background
2. **Response Rate < 10%**: Red background
3. **Profit > $50k/month**: Green text, bold
4. **Profit < $10k/month**: Yellow background

## Data Refresh Note

This dashboard automatically updates when Apps Script runs `DashboardUpdater.gs`. Metrics are calculated in real-time from linked sheets.

## Chart Recommendations

- Create a pie chart for "Pipeline Status" (Rows 14-18)
- Create a bar chart for "Response Breakdown" (Rows 24-27)
- Create a line chart for "Monthly Trends" (Row 32 and previous months)

