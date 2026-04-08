require('dotenv').config();
const chalk = require("chalk");
const express = require("express");
const path = require("path");
const { updateConfig } = require("./config/configManager");
const { launchBrowser } = require("./config/puppeteer");
const { ensureAtHome } = require("./flows/navigation");
const { registerusers } = require("./flows/registration");
const { generateReportsAndUnlock } = require("./flows/reports");
const { logout } = require("./flows/auth");
const { downloadPDF } = require("./flows/pdf_subscription");
const delay = require("./utils/delay");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get current environment configuration
app.get('/api/config', (req, res) => {
    const config = {
        WEBSITE_URL: process.env.WEBSITE_URL || '',
        PUPPETEER_HEADLESS: process.env.PUPPETEER_HEADLESS || 'false',
        PUPPETEER_START_MAXIMIZED: process.env.PUPPETEER_START_MAXIMIZED || 'true',
        PUPPETEER_DEFAULT_VIEWPORT: process.env.PUPPETEER_DEFAULT_VIEWPORT || 'null',
        ENABLE_DISCOUNTED_FULL_FLOW: process.env.ENABLE_DISCOUNTED_FULL_FLOW || 'true',
        ENABLE_PRO_ACCESS_FLOW: process.env.ENABLE_PRO_ACCESS_FLOW || 'false',
        ENABLE_STANDARD_FLOW: process.env.ENABLE_STANDARD_FLOW || 'false',
        ENABLE_PAID_PLATFORM_ACCESS: process.env.ENABLE_PAID_PLATFORM_ACCESS || 'false',
        USER_REGISTRATION_COUNT: process.env.USER_REGISTRATION_COUNT || '1',
        MAX_RETRIES: process.env.MAX_RETRIES || '3',
        CARD_NUMBER: process.env.CARD_NUMBER || '',
        CARD_EXPIRY: process.env.CARD_EXPIRY || '',
        CARD_CVV: process.env.CARD_CVV || '',
        ENABLE_CREATE_REPORT: process.env.ENABLE_CREATE_REPORT || 'false',
        REPORT_COUNT: process.env.REPORT_COUNT || '1',
        UNLOCK_REPORT: process.env.UNLOCK_REPORT || 'false',
        DOWNLOAD_PDF: process.env.DOWNLOAD_PDF || 'false',
        HTML_PAGE_CREATION_FOR_USER_DETAILS: process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS || 'false',
        OPEN_HTML_PAGES: process.env.OPEN_HTML_PAGES || 'false',
        BROWSER_CLOSE_ON_COMPLETION: process.env.BROWSER_CLOSE_ON_COMPLETION || 'false'
    };
    res.json(config);
});

// API endpoint to configure and run automation
app.post('/api/config-and-run', async (req, res) => {
    try {
        const config = req.body;
        updateConfig(config);
        
        // Run automation in background
        runAutomation().catch(err => console.error('Background automation error:', err));
        
        res.json({ success: true, message: 'Automation started' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Serve UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Main automation function
async function runAutomation() {
    let browser;
    let page;

    // Helper to safely start or restart the browser
    async function initBrowser() {
        if (browser) {
            try { await browser.close(); } catch (err) {}
        }
        browser = await launchBrowser();
        const pages = await browser.pages();
        page = pages[0]; // use existing tab
        page.setDefaultTimeout(90000);
        page.setDefaultNavigationTimeout(90000);
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const MAX_RETRIES = process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES) : 3;
    const RETRY_DELAY_MS = process.env.RETRY_DELAY_MS ? parseInt(process.env.RETRY_DELAY_MS) : 5000;

    try {
        console.log(chalk.green("[START]"), "Starting automation process...");
        await initBrowser();

        const userRegistrationCount = process.env.USER_REGISTRATION_COUNT ? parseInt(process.env.USER_REGISTRATION_COUNT) : 1;

        // Loop over the total number of users to process
        for (let i = 1; i <= userRegistrationCount; i++) {
            
            // Retry loop for the specific user registration
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    if (attempt > 1) {
                         console.log(chalk.cyan(`[Retry] User ${i} Attempt ${attempt}/${MAX_RETRIES}`));
                    }

                    await ensureAtHome(page);
                    await registerusers(page);

                    
                    console.log(chalk.bgGreen("[success]"), "user " + i + " register successfully");
                    
                    if (userRegistrationCount === 1) {

                        await generateReportsAndUnlock(page);

                        if (process.env.DOWNLOAD_PDF === "true") {
                             await downloadPDF(page);
                         }

                    } else if (i != userRegistrationCount) {

                        await delay(process.env.COMMON_DELAY_ONCLICKS);
                        await logout(page);
                    }
                  
                    await delay(process.env.COMMON_DELAY_ONCLICKS);
                    
                    // Break the attempt loop if successful
                    break;
                } catch (err) {
                    console.error(chalk.red(`[❌ Error for user ${i} on Attempt ${attempt}]:`), err.message);

                    if (attempt === MAX_RETRIES) {
                        console.error(
                            chalk.bgRed.white("[FATAL]"),
                            `Max retries reached (${MAX_RETRIES}) for User ${i}. Skipping to next user.`
                        );
                        break;
                    }

                    console.log(chalk.yellow(`[Retry] Waiting ${RETRY_DELAY_MS / 1000}s before retrying this part of automation...`));
                    await sleep(RETRY_DELAY_MS);
                    
                    // Restart the browser to clear dirty state before retrying this flow
                    await initBrowser();
                }
            }
        }
        
        console.log(chalk.green(`[✅ Success] Automation fully completed.`));

    } catch (criticalErr) {
        console.error(chalk.red(`[❌ Critical Error:]`), criticalErr.message);
    } finally {
        if (process.env.BROWSER_CLOSE_ON_COMPLETION == "true") {
            if (browser) {
                await browser.close();
                console.log(chalk.gray("[Cleanup] Browser closed based on BROWSER_CLOSE_ON_COMPLETION."));
            }
        } else {
            console.log(chalk.gray("browser close on completion is set to false, keeping browser open for debugging"));
        }
    }
}

// Check if running from CLI or starting server
const args = process.argv.slice(2);
const CLI_MODE = args.includes('--cli');

if (CLI_MODE) {
    // CLI mode - run automation directly
    runAutomation().catch(err => {
        console.error('Automation failed:', err);
        process.exit(1);
    });
} else {
    // Server mode - start Express server
    app.listen(PORT, () => {
        console.log(chalk.green(`✓ Automation Dashboard running at http://localhost:${PORT}`));
        console.log(chalk.cyan(`  Open your browser and navigate to http://localhost:${PORT}`));
    });
}