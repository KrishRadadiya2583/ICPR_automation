# ICPR Automation

Browser automation tool built with Node.js and Puppeteer for handling user registration flows, payment processing, report generation, and session management with built-in retry logic.

## Features

- **Retry Mechanism** -- Automatically retries failed steps with configurable limits and browser restart
- **Browser Automation** -- Full control using Puppeteer with stealth plugin for anti-bot detection
- **User Registration** -- Handles bulk or single user registration flows
- **Report Generation** -- Create and unlock reports after registration
- **PDF Subscription** -- Download PDF subscriptions for registered users
- **HTML Reports** -- Generate HTML pages with user credentials for easy reference
- **Environment-based Config** -- All settings controlled via `.env` file
- **Modular Architecture** -- Easily extendable with new flows

## Prerequisites

- **Node.js** 18 or higher
- **pnpm**   npm install -g pnpm
- ~500MB disk space for Chromium (downloaded automatically during install)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd icpr-automation
   ```

2. **Install dependencies** (also downloads Chromium automatically)

   ```bash
   pnpm install
   ```

3. **Create your environment file**

   ```bash
   cp .env.example .env
   ```

4. **Configure `.env`** -- Open `.env` and set at minimum:
   - `WEBSITE_URL` -- target website URL
   - `CARD_NUMBER`, `CARD_EXPIRY`, `CARD_CVV` -- payment card details
   - Enable exactly one execution flow (`ENABLE_DISCOUNTED_FULL_FLOW`, etc.)

5. **Run the automation**

   ```bash
   pnpm start
   ```

## Configuration

All configuration is managed through the `.env` file. See `.env.example` for the full list with descriptions.

### Key Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBSITE_URL` | Target website URL | *(required)* |
| `CARD_NUMBER` | 16-digit payment card number | *(required)* |
| `CARD_EXPIRY` | Card expiry in MM/YY format | *(required)* |
| `CARD_CVV` | 3-4 digit CVV code | *(required)* |
| `USER_REGISTRATION_COUNT` | Number of users to register | `1` |
| `PUPPETEER_HEADLESS` | Run browser without UI | `false` |

### Execution Flows

Enable **exactly one** of these flows per run:

| Flow | Description |
|------|-------------|
| `ENABLE_DISCOUNTED_FULL_FLOW` | Discounted registration flow |
| `ENABLE_PRO_ACCESS_FLOW` | Pro access registration flow |
| `ENABLE_STANDARD_FLOW` | Standard registration flow |
| `ENABLE_PAID_PLATFORM_ACCESS` | Paid platform access flow |

### Optional Features

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_CREATE_REPORT` | Generate reports after registration | `false` |
| `REPORT_COUNT` | Number of reports to generate | `1` |
| `UNLOCK_REPORT` | Unlock the latest report | `false` |
| `DOWNLOAD_PDF` | Download PDF subscription | `false` |
| `HTML_PAGE_CREATION_FOR_USER_DETAILS` | Generate HTML page with user credentials | `false` |
| `OPEN_HTML_PAGES` | Auto-open generated HTML pages | `true` |

### Timing & Retry

| Variable | Description | Default |
|----------|-------------|---------|
| `PAGE_TIMEOUT` | Page load timeout (ms) | `90000` |
| `IFRAME_TIMEOUT` | Iframe load timeout (ms) | `120000` |
| `REPORT_TIMEOUT` | Report generation timeout (ms) | `60000` |
| `COMMON_DELAY_ONCLICKS` | Delay after clicks (ms) | `200` |
| `TYPING_DELAY` | Delay between keystrokes (ms) | `50` |
| `CLICK_DELAY_MS` | Click delay in PDF flow (ms) | `200` |
| `MAX_RETRIES` | Max retry attempts per user | `3` |
| `RETRY_DELAY_MS` | Delay between retries (ms) | `5000` |

## Project Structure

```
icpr-automation/
├── config/
│   └── puppeteer.js          # Browser launch configuration
├── core/
│   └── frameHandler.js       # Iframe detection for payment
├── flows/
│   ├── auth.js               # Logout functionality
│   ├── htmlgenerator.js      # HTML report generation
│   ├── navigation.js         # Flow routing based on config
│   ├── payment.js            # Card payment via iframe
│   ├── pdf_subscription.js   # PDF download flow
│   ├── registration.js       # User registration + password fetch
│   ├── reports.js            # Report generation & unlock
│   └── yopmailpasswordfetcher.js  # Password retrieval from Yopmail
├── services/
│   └── fileService.js        # Writes user emails to file
├── utils/
│   ├── delay.js              # Promise-based delay utility
│   ├── generator.js          # Random mobile/email generation
│   └── logger.js             # Colored console logging
├── public/                   # Generated HTML output (created at runtime)
├── index.js                  # Main entry point with retry logic
├── .env.example              # Environment variable template
├── package.json              # pnpm package file
├── pnpm-lock.yaml            # pnpm lock file
└── pnpm-workspace.yaml       # pnpm workspace file
```

## Workflow Overview

```
1. Launch Browser
2. Validate environment configuration
3. Loop through users (USER_REGISTRATION_COUNT):
   ├── Navigate to website
   ├── Register user (phone + email + payment)
   ├── Generate reports (if ENABLE_CREATE_REPORT=true)
   ├── Unlock report (if UNLOCK_REPORT=true)
   ├── Download PDF (if DOWNLOAD_PDF=true)
   ├── Generate HTML report (if HTML_PAGE_CREATION_FOR_USER_DETAILS=true)
   └── Logout (if more users remaining)
4. Retry on failure (up to MAX_RETRIES, with browser restart)
5. Close browser (if BROWSER_CLOSE_ON_COMPLETION=true)
```

## Development

Use **nodemon** for auto-reload during development:

```bash
pnpm dev
```

### Adding New Flows

1. Create a new file in the `flows/` directory
2. Export your async function that accepts a `page` parameter
3. Import and call it from `index.js` at the appropriate step

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Missing required environment variables` | Copy `.env.example` to `.env` and fill in required values |
| `Cannot find module` errors | Run `pnpm install` to install dependencies |
| Browser crashes or doesn't open | Set `PUPPETEER_HEADLESS=true` to run without UI |
| Payment fails | Verify `CARD_NUMBER`, `CARD_EXPIRY`, and `CARD_CVV` in `.env` |
| Timeout errors | Increase `PAGE_TIMEOUT` or `IFRAME_TIMEOUT` in `.env` |
| `SyntaxError: Unexpected token` | Check `PUPPETEER_DEFAULT_VIEWPORT` is `null` or valid JSON |
| Chromium download fails | Check network connection and disk space (~500MB needed) |
| Reports not generating | Ensure `ENABLE_CREATE_REPORT=true` and `REPORT_COUNT` is set |
| PDF download not working | Ensure `DOWNLOAD_PDF=true` in `.env` |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Run the automation |
| `pnpm dev` | Run with auto-reload (nodemon) |
| `pnpm install` | Install dependencies + download Chromium |
 
