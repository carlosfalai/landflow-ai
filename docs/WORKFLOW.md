# LandFlow AI - Workflow Documentation

Complete workflow documentation for how LandFlow AI operates.

## System Workflow Overview

```
Property Sources → Scraping → Properties Sheet → Outreach → Emails Sheet
                                                              ↓
Replies Sheet ← AI Classification ← Reply Parser ← Gmail ← Replies
     ↓
Response Handler → Follow-ups / Negotiations → Deals Sheet
                                                      ↓
Buyer Matching → Buyer Outreach → Buyers Sheet
                                                      ↓
Dashboard ← Metrics ← All Sheets
```

## Phase 1: Property Sourcing

### Daily Scraping Process

1. **Trigger:** Daily at 8:00 AM
2. **Function:** `runPropertyScrapers()`

**Steps:**
1. Loads search parameters from `ScraperConfig`
2. Runs scrapers for each enabled platform:
   - Zillow
   - LandWatch
   - Realtor.com
   - Redfin
3. Each scraper:
   - Constructs search URL with filters
   - Fetches HTML/API data
   - Parses property listings
   - Extracts: address, price, acreage, county, seller, URL
4. Deduplicates properties (by URL or address)
5. Writes to Properties sheet:
   - New properties: Status = "New"
   - Existing properties: Updates Last Updated timestamp

**Output:**
- Properties sheet updated with new listings
- Duplicates automatically skipped

## Phase 2: Email Outreach

### Automated Outreach Process

1. **Trigger:** Daily at 8:00 AM (part of daily job)
2. **Function:** `sendOutreachEmails()`

**Steps:**
1. Scans Properties sheet for:
   - Status = "New"
   - No existing emails logged
2. For each property:
   - Extracts recipient info (agent email/name)
   - Calculates offer (70-80% of listing price)
   - Generates personalized email HTML
   - Sends email via Gmail API
3. Logs email to Emails sheet:
   - Property ID, agent info, subject, timestamp
   - Follow-up date = 48 hours later
4. Updates Properties sheet:
   - Status = "Offer Sent"
   - Offer Amount = calculated offer
   - Offer Sent date = today

**Output:**
- Emails sent to property agents/sellers
- Emails sheet updated with all sent emails
- Properties status updated

## Phase 3: Reply Processing

### Hourly Reply Classification

1. **Trigger:** Every hour
2. **Function:** `processIncomingReplies()`

**Steps:**
1. Searches Gmail for:
   - Inbox emails
   - From external senders
   - Unread replies
2. For each reply:
   - Matches to property via thread ID or sender email
   - Extracts email body text
   - Sends to AI classifier (Claude/OpenAI)
3. AI Classification:
   - Sentiment: Interested, Counteroffer, Not Interested, Spam, Neutral
   - Reply Type: Acceptance, Counteroffer, Rejection, Question, Unclear
   - Confidence score (0-100)
   - Counteroffer amount (if mentioned)
   - Summary and next action
4. Logs to Replies sheet:
   - Property ID, thread ID, classification results
   - Handler status = "Pending"
5. Updates email status:
   - Emails sheet: Status = "Replied"
   - Marks Gmail message as read

**Output:**
- Replies sheet updated with classifications
- Email statuses updated
- Properties flagged for follow-up

## Phase 4: Response Handling

### Automated Response Actions

1. **Trigger:** After reply classification
2. **Function:** `handleClassifiedReply()`

**Actions by Sentiment:**

### Interested
- Updates Properties: Status = "Response Received"
- Sends confirmation email
- Logs confirmation to Emails sheet
- Updates Replies: Handler Status = "Processed"

### Counteroffer
- Updates Properties: Status = "Under Review"
- Generates counteroffer strategy
- Sends counteroffer response email
- Updates offer amount in Properties sheet
- Updates Replies: Handler Status = "Processed"

### Not Interested
- Updates Properties: Status = "Dormant"
- Updates Replies: Handler Status = "Processed"
- Stops all follow-ups for property

### Spam
- Updates Replies: Handler Status = "Processed"
- Adds spam label to Gmail message
- No property status change

**Output:**
- Appropriate responses sent automatically
- Properties status updated
- Deal pipeline progresses

## Phase 5: Follow-up Automation

### Automatic Follow-ups

1. **Trigger:** Every 4 hours
2. **Function:** `processFollowUpEmails()`

**Steps:**
1. Finds emails needing follow-up:
   - Follow-up date has passed
   - Status ≠ "Replied"
   - Follow-up count < 3
2. For each email:
   - Checks property status (skip if Under Review/Closed)
   - Generates follow-up email
   - Sends follow-up email
   - Increments follow-up count
   - Updates follow-up date (+48 hours)
3. Max follow-ups:
   - After 3 follow-ups, marks property as "Dormant"
   - Stops all future follow-ups

**Output:**
- Follow-up emails sent automatically
- Properties marked dormant after max attempts
- Follow-up counts tracked

## Phase 6: Buyer Matching

### Property-to-Buyer Matching

1. **Trigger:** Daily at 10:00 AM
2. **Function:** `runDailyBuyerMatching()`

**Steps:**
1. Scans Properties sheet for:
   - Status = "Under Contract"
2. For each property:
   - Extracts: location, acreage, price
   - Matches to Buyers sheet criteria:
     - Location (state) matches
     - Acreage within buyer range
     - Price within buyer range
   - Updates Buyers sheet:
     - Adds Property ID to Property Match column
3. If matches found:
   - Can trigger buyer outreach (see Phase 7)

**Output:**
- Buyers sheet updated with property matches
- Properties linked to potential buyers

## Phase 7: Buyer Outreach

### Builder Outreach

1. **Trigger:** Manual or when property goes "Under Contract"
2. **Function:** `sendBuyerOutreachForProperty()`

**Steps:**
1. Finds matching buyers (from Phase 6)
2. For each buyer:
   - Checks if contacted recently (< 30 days)
   - Generates buyer email with property details
   - Sends email to builder contact
   - Updates Buyers sheet:
     - Last Contact = today
     - Property Match updated
3. Tracks responses in Buyers sheet

**Output:**
- Buyer emails sent
- Buyers sheet updated
- Response tracking initiated

## Phase 8: Deal Pipeline

### Deal Tracking

**Manual or Automated:**

When a property moves forward:
1. User or system updates Properties: Status = "Under Contract"
2. Creates entry in Deals sheet:
   - Property ID, seller offer, buyer offer
   - Calculates profit = buyer offer - seller offer
   - Status = "Under Contract"
3. As deal progresses:
   - Status updates: "In Escrow" → "Closed"
   - Close date entered
   - Profit calculated
4. Metrics update:
   - Dashboard reflects closed deals
   - Monthly profit calculated

**Output:**
- Deals sheet tracks all transactions
- Profit calculations automated
- Dashboard metrics updated

## Phase 9: Dashboard & Reporting

### Real-Time Metrics

1. **Trigger:** Every 6 hours + after major events
2. **Function:** `refreshDashboard()`

**Metrics Calculated:**
- Total Offers Made
- Total Responses
- Response Rate (%)
- Offer-to-Close Ratio (%)
- Average Profit per Deal
- Monthly Profit Total
- Deals Closed This Month
- Pipeline Status Breakdown

**Daily Digest Email:**
1. **Trigger:** Daily (after daily job)
2. **Function:** `sendDailyDigest()`

**Contents:**
- Key metrics summary
- Pipeline status
- Response breakdown
- Monthly trends

**Output:**
- Dashboard sheet updated
- Daily email summary sent

## Data Flow Diagram

```
┌─────────────────┐
│ Property Sites  │
│ (Zillow, etc.)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│   Scrapers      │────▶│  Properties  │
│                 │     │    Sheet     │
└─────────────────┘     └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Outreach   │
                        │   Manager    │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐     ┌──────────────┐
                        │     Gmail    │────▶│  Emails      │
                        │      API     │     │    Sheet     │
                        └──────┬───────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────┐     ┌──────────────┐
                        │  Reply Parser│────▶│   Replies    │
                        └──────┬───────┘     │    Sheet     │
                               │             └──────────────┘
                               ▼
                        ┌──────────────┐
                        │   AI Classifier│
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐     ┌──────────────┐
                        │  Response    │────▶│   Deals      │
                        │   Handler    │     │    Sheet     │
                        └──────┬───────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────┐     ┌──────────────┐
                        │   Buyer      │────▶│   Buyers     │
                        │  Matching    │     │    Sheet     │
                        └──────┬───────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Dashboard   │
                        │    Sheet     │
                        └──────────────┘
```

## Error Handling

All phases include error handling:

1. **Try-Catch Blocks:** All functions wrapped
2. **Error Logging:** Errors logged to Error Log sheet
3. **Graceful Failures:** System continues on errors
4. **Retry Logic:** Built into critical functions

## Performance Optimization

- **Rate Limiting:** Delays between API calls
- **Batch Operations:** Writes multiple rows at once
- **Caching:** Avoids redundant API calls
- **Selective Updates:** Only updates changed data

## Monitoring

Monitor system health:

1. **Execution Logs:** Apps Script execution history
2. **Error Log Sheet:** All errors tracked
3. **Dashboard Metrics:** Real-time KPI visibility
4. **Daily Digest:** Summary email each day

