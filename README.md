# 🏞️ LandFlow AI

**Automate every step of land flipping — from sourcing to closing — powered by Google Sheets, AI, and email automation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Google Apps Script](https://img.shields.io/badge/Platform-Google%20Apps%20Script-4285F4)](https://script.google.com)

## 🎯 Overview

LandFlow AI is a fully autonomous real estate acquisitions assistant that performs the complete land wholesaling process end-to-end:

- 🔍 **Automated Property Sourcing** - Scrapes listings from Zillow, LandWatch, Realtor.com, and Redfin
- 📧 **Email Outreach Automation** - Sends personalized offers with automatic follow-ups
- 🤖 **AI-Powered Reply Classification** - Uses Claude/OpenAI to analyze responses and trigger workflows
- 🏗️ **Buyer Matching Engine** - Automatically matches properties to verified builders
- 📊 **Live Dashboard** - Real-time tracking of deals, metrics, and KPIs
- 📈 **Performance Analytics** - Response rates, conversion metrics, profit tracking

## 🚀 Quick Start

### Prerequisites

- Google Account (Gmail)
- Google Sheets access
- OpenAI API key OR Claude API key (for AI classification)
- 10 minutes for setup

### Installation (3 Steps)

#### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "LandFlow AI"

#### Step 2: Set Up Sheets

1. In your Google Sheet: **Extensions → Apps Script**
2. Copy and paste the code from `QUICK_SETUP_CODE.gs`
3. Select function: **`initializeAllSheets`**
4. Click **Run** → Authorize when prompted
5. ✅ All 6 sheets will be created automatically!

#### Step 3: Configure System

1. Copy `SIMPLE_SETUP.gs` into Apps Script
2. Run: **`setupEverything()`**
3. Set AI API key: **`setupAI("openai", "your-key")`**
4. Install triggers: **`installTriggers()`**

**Done!** 🎉

## 📋 Complete Setup Guide

For detailed setup instructions, see:

- **[SIMPLE_INSTRUCTIONS.md](SIMPLE_INSTRUCTIONS.md)** - Quick 3-step setup
- **[setup/INSTALLATION.md](setup/INSTALLATION.md)** - Complete installation guide
- **[setup/SHEETS_SETUP.md](setup/SHEETS_SETUP.md)** - Sheet setup (automatic if you use QUICK_SETUP_CODE.gs)
- **[setup/GMAIL_API_SETUP.md](setup/GMAIL_API_SETUP.md)** - Gmail API configuration
- **[setup/AI_API_SETUP.md](setup/AI_API_SETUP.md)** - AI API configuration
- **[setup/TRIGGER_SETUP.md](setup/TRIGGER_SETUP.md)** - Automation triggers

## 📁 Project Structure

```
landflow-ai/
├── apps-script/              # Google Apps Script code
│   ├── config/              # Configuration files
│   ├── scrapers/            # Property scraping modules
│   ├── email/               # Email automation
│   ├── ai/                  # AI classification
│   ├── buyers/              # Buyer matching
│   ├── dashboard/           # Dashboard metrics
│   ├── triggers/            # Automation triggers
│   ├── utils/               # Utility functions
│   └── setup/               # Setup scripts
├── templates/                # Email HTML templates
├── data/                     # JSON data files
├── sheets-templates/         # Sheet structure docs
├── setup/                   # Setup guides
├── docs/                     # Documentation
├── QUICK_SETUP_CODE.gs      # ⭐ Start here - Auto-creates all sheets
├── SIMPLE_SETUP.gs          # ⭐ Simple configuration
└── README.md                 # This file
```

## 🎯 Core Features

### Property Sourcing Engine

- **Multi-platform scraping**: Zillow, LandWatch, Realtor.com, Redfin
- **Smart filtering**: Location, price range, acreage, days on market
- **Deduplication**: Automatically prevents duplicate entries
- **Daily updates**: Scheduled automatic scraping

### Email Outreach Automation

- **Personalized templates**: Dynamic email generation
- **Offer calculation**: 70-80% of listing price (configurable)
- **Auto follow-ups**: 48-hour intervals, max 3 attempts
- **Status tracking**: Complete email lifecycle management

### AI Reply Classification

- **Sentiment analysis**: Interested, Counteroffer, Not Interested, Spam
- **Automated workflows**: Triggers appropriate responses
- **Confidence scoring**: AI confidence levels
- **Conversation summaries**: Automatic thread summaries

### Buyer Matching

- **Verified builder database**: DR Horton, LGI Homes, Lennar, etc.
- **Smart matching**: Location, acreage, price range
- **Automated outreach**: Sends property details to matched buyers
- **Response tracking**: Tracks builder interest

### Dashboard & Analytics

- **Real-time metrics**: Offers, responses, conversions
- **Profit tracking**: Monthly and all-time totals
- **Pipeline status**: Visual deal progression
- **Daily digest**: Email summary of activity

## ⚙️ Configuration

### Search Parameters

Edit `apps-script/config/ScraperConfig.gs`:

```javascript
searchParams: {
  minPrice: 10000,
  maxPrice: 500000,
  minAcreage: 0.5,
  maxAcreage: 100,
  locations: ['Texas', 'Florida', 'Georgia'],
  daysOnMarketMax: 365
}
```

### Offer Calculation

Modify offer percentage range in `apps-script/email/OfferCalculator.gs`:

```javascript
calculateOffer(listingPrice, 65, 75); // 65-75% range
```

### Email Templates

Customize templates in `apps-script/email/TemplateEngine.gs` or edit HTML files in `templates/`

## 🔧 Usage

### Manual Functions

Run these in Apps Script for testing:

- `manualScrapeProperties()` - Test property scraping
- `manualSendOutreach()` - Test email sending
- `manualProcessReplies()` - Test reply processing
- `refreshDashboard()` - Update dashboard now
- `testSystem()` - Verify all components

### Automation

Once triggers are installed:

- **Daily (8 AM)**: Property scraping + outreach
- **Hourly**: Reply processing
- **Every 4 hours**: Follow-up emails
- **Every 6 hours**: Dashboard refresh

## 📊 Sheets Overview

| Sheet | Purpose | Key Features |
|-------|---------|--------------|
| **Properties** | Property listings | Status tracking, offer amounts, days on market |
| **Emails** | Email log | Sent/received tracking, follow-up scheduling |
| **Replies** | Response analysis | AI classification, sentiment, next actions |
| **Buyers** | Builder database | Contact info, matching criteria, responses |
| **Deals** | Deal pipeline | Profit calculations, close dates, status |
| **Performance Dashboard** | Live metrics | KPIs, conversion rates, monthly totals |

## 🔑 API Keys

### Gmail API

- Automatic with Apps Script
- No additional setup needed
- Authorize on first Gmail function call

### AI API

Choose one:

**OpenAI:**
- Get key: https://platform.openai.com/api-keys
- Run: `setupAI("openai", "your-key")`

**Claude:**
- Get key: https://console.anthropic.com/
- Run: `setupAI("claude", "your-key")`

## 🐛 Troubleshooting

Common issues and solutions:

- **Sheets not created**: Run `initializeAllSheets()` again
- **Gmail not working**: Run any Gmail function to authorize
- **AI classification fails**: Check API key and quotas
- **Triggers not running**: Check execution logs in Apps Script

For detailed troubleshooting, see **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**

## 📚 Documentation

- **[Workflow Documentation](docs/WORKFLOW.md)** - Complete system workflow
- **[Customization Guide](docs/CUSTOMIZATION.md)** - How to customize
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues

## 🚧 Future Features

- [ ] HubSpot/Airtable CRM integration
- [ ] SMS follow-ups (Twilio)
- [ ] AI voice negotiation calls
- [ ] Auto document generation (contracts)
- [ ] Machine learning offer optimization

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Additional property sources
- Better scraping reliability
- Enhanced AI prompts
- Additional integrations

## 📝 License

This project is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

Built to automate Alex Mineo's land flipping model. Perfect for wholesalers who want to scale their operations.

## 🔗 Related

- **[Summarize AI Chrome Extension](https://chromewebstore.google.com/detail/summarize-ai/pgnlnpfeedgjhkhdokjjkjhbmkdajoik)** - Instant email thread summarization

---

**⭐ Star this repo if you find it useful!**

**Need help?** Open an issue or check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
