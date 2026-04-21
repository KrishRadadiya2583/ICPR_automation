require('dotenv').config();
const open = require("open").default;
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
const { startRecording, stopRecording } = require('./helper/recording');
const fs = require('fs');



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
        ENABLE_FREE_PLATFORM_ACCESS: process.env.ENABLE_FREE_PLATFORM_ACCESS || 'false',
        ENABLE_PAID_PLATFORM: process.env.ENABLE_PAID_PLATFORM || 'false',
        USER_REGISTRATION_COUNT: process.env.USER_REGISTRATION_COUNT || '1',
        MAX_RETRIES: process.env.MAX_RETRIES || '3',
        CARD_NUMBER: process.env.CARD_NUMBER || '',
        CARD_EXPIRY: process.env.CARD_EXPIRY || '',
        CARD_CVV: process.env.CARD_CVV || '',
        PAID_VISA_CARD_NUMBER: process.env.PAID_VISA_CARD_NUMBER || '4532456618142692',
        ENABLE_CREATE_REPORT: process.env.ENABLE_CREATE_REPORT || 'false',
        REPORT_COUNT: process.env.REPORT_COUNT || '1',
        UNLOCK_REPORT: process.env.UNLOCK_REPORT || 'false',
        DOWNLOAD_PDF: process.env.DOWNLOAD_PDF || 'false',
        HTML_PAGE_CREATION_FOR_USER_DETAILS: process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS || 'false',
        OPEN_HTML_PAGES: process.env.OPEN_HTML_PAGES || 'false',
        BROWSER_CLOSE_ON_COMPLETION: process.env.BROWSER_CLOSE_ON_COMPLETION || 'false',
        ENABLE_RECORDING: process.env.ENABLE_RECORDING || 'false',
        RECORDING_SAVE_PATH: process.env.RECORDING_SAVE_PATH || ''
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

async function runAutomation() {
    let browser;
    let page;
    let recorder;
    const filePath = "./public/users.html";

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("[Error] Failed to delete HTML page:", err);
            } else {
                console.log("File deleted successfully");
            }
        });
    }

    // Helper to safely start or restart the browser
    async function initBrowser() {


        await stopRecording(recorder);
        if (browser) {
            try { await browser.close(); } catch (err) { }
        }
        browser = await launchBrowser();
        const pages = await browser.pages();
        page = pages[0]; // use existing tab
        page.setDefaultTimeout(90000);
        page.setDefaultNavigationTimeout(90000);

        if (process.env.ENABLE_RECORDING === "true") {
            recorder = await startRecording(page);
        }
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
        await stopRecording(recorder);
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
const CLI_MODE = process.env.ENABLE_CLI_MODE === 'true';

if (CLI_MODE) {
    const inquirer = require('inquirer');

    async function interactiveCli() {
        console.log(chalk.gray('Press Enter to use [default] values\n'));

        const answers = await inquirer.prompt([
            // --- Website Configuration ---
            {
                type: 'list',
                name: 'WEBSITE_URL',
                message: 'Select Target Environment URL:',
                choices: [
                    { name: 'Dev Environment', value: 'https://dev-pr.infochecker.com/' },
                    { name: 'Stage Environment', value: 'https://stage-pr.infochecker.com/' },
                    { name: 'UAT Environment', value: 'https://uat.infochecker.com/' }
                ],
                default: process.env.WEBSITE_URL
            },

            // --- Puppeteer Settings ---
            {
                type: 'confirm',
                name: 'PUPPETEER_HEADLESS',
                message: 'Run in Headless Mode?',
                default: process.env.PUPPETEER_HEADLESS === 'true'
            },
            {
                type: 'confirm',
                name: 'PUPPETEER_START_MAXIMIZED',
                message: 'Should the browser start maximized?',
                default: process.env.PUPPETEER_START_MAXIMIZED === 'true'
            },
            {
                type: 'list',
                name: 'PUPPETEER_DEFAULT_VIEWPORT',
                message: 'Select Browser Viewport:',
                choices: [
                    { name: 'Default (Auto)', value: 'null' },
                    { name: 'MacBook Pro 14" (1728x1117)', value: '{"width":1728,"height":1117}' },
                    { name: 'Full HD Laptop (1920x1080)', value: '{"width":1920,"height":1080}' }
                ],
                default: process.env.PUPPETEER_DEFAULT_VIEWPORT || 'null'
            },

            // --- Execution Flow ---
            {
                type: 'list',
                name: 'activeFlow',
                message: 'Select Execution Flow:',
                choices: [
                    { name: 'Discounted Full Access', value: 'ENABLE_DISCOUNTED_FULL_FLOW' },
                    { name: 'Pro Access', value: 'ENABLE_PRO_ACCESS_FLOW' },
                    { name: 'Standard Flow', value: 'ENABLE_STANDARD_FLOW' },
                    { name: 'Paid Platform Access', value: 'ENABLE_PAID_PLATFORM_ACCESS' },
                    { name: 'Free Platform Access', value: 'ENABLE_FREE_PLATFORM_ACCESS' },
                    { name: 'Paid Platform', value: 'ENABLE_PAID_PLATFORM' }
                ],
                default: () => {
                    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW === 'true') return 'ENABLE_DISCOUNTED_FULL_FLOW';
                    if (process.env.ENABLE_PRO_ACCESS_FLOW === 'true') return 'ENABLE_PRO_ACCESS_FLOW';
                    if (process.env.ENABLE_STANDARD_FLOW === 'true') return 'ENABLE_STANDARD_FLOW';
                    if (process.env.ENABLE_PAID_PLATFORM_ACCESS === 'true') return 'ENABLE_PAID_PLATFORM_ACCESS';
                    if (process.env.ENABLE_FREE_PLATFORM_ACCESS === 'true') return 'ENABLE_FREE_PLATFORM_ACCESS';
                    if (process.env.ENABLE_PAID_PLATFORM === 'true') return 'ENABLE_PAID_PLATFORM';
                    return 'ENABLE_DISCOUNTED_FULL_FLOW';
                }
            },

            // --- User registration Settings ---
            {
                type: 'input',
                name: 'USER_REGISTRATION_COUNT',
                message: 'Number of users to register:',
                default: process.env.USER_REGISTRATION_COUNT || '1',
                validate: val => !isNaN(val) || 'Enter a number'
            },
            {
                type: 'input',
                name: 'MAX_RETRIES',
                message: 'Max retries on failure:',
                default: process.env.MAX_RETRIES || '3',
                validate: val => !isNaN(val) || 'Enter a number'
            },

            // --- Card Details ---
            {
                type: 'input',
                name: 'CARD_NUMBER',
                message: 'Enter 16-digit Card Number:',
                default: process.env.CARD_NUMBER,
                validate: val => val.length === 16 || 'Must be 16 digits'
            },
            {
                type: 'input',
                name: 'CARD_EXPIRY',
                message: 'Card Expiry (MM/YY):',
                default: process.env.CARD_EXPIRY,
                validate: val => /^\d{2}\/\d{2}$/.test(val) || 'Use MM/YY format'
            },
            {
                type: 'input',
                name: 'CARD_CVV',
                message: 'Card CVV:',
                default: process.env.CARD_CVV,
                validate: val => val.length >= 3 || 'Must be 3-4 digits'
            },

            // --- Report & PDF Settings ---
            {
                type: 'confirm',
                name: 'ENABLE_CREATE_REPORT',
                message: 'Generate reports after registration?',
                default: process.env.ENABLE_CREATE_REPORT === 'true'
            },
            {
                type: 'input',
                name: 'REPORT_COUNT',
                message: 'How many reports to generate?',
                default: process.env.REPORT_COUNT || '1',
                when: (ans) => ans.ENABLE_CREATE_REPORT
            },
            {
                type: 'confirm',
                name: 'UNLOCK_REPORT',
                message: 'Auto-unlock the latest report?',
                default: process.env.UNLOCK_REPORT === 'true',
                when: (ans) => ans.ENABLE_CREATE_REPORT
            },
            {
                type: 'confirm',
                name: 'DOWNLOAD_PDF',
                message: 'Download PDF reports?',
                default: process.env.DOWNLOAD_PDF === 'true'
            },

            // --- HTML Result Settings ---
            {
                type: 'confirm',
                name: 'HTML_PAGE_CREATION_FOR_USER_DETAILS',
                message: 'Create local HTML result pages?',
                default: process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === 'true'
            },
            {
                type: 'confirm',
                name: 'OPEN_HTML_PAGES',
                message: 'Auto-open generated HTML pages?',
                default: process.env.OPEN_HTML_PAGES === 'true',
                when: (ans) => ans.HTML_PAGE_CREATION_FOR_USER_DETAILS
            },

            // --- Browser behavior & Recording ---
            {
                type: 'confirm',
                name: 'BROWSER_CLOSE_ON_COMPLETION',
                message: 'Close browser on completion?',
                default: process.env.BROWSER_CLOSE_ON_COMPLETION === 'true'
            },
            {
                type: 'confirm',
                name: 'ENABLE_RECORDING',
                message: 'Enable screen recording for proof?',
                default: process.env.ENABLE_RECORDING === 'true'
            },
            {
                type: 'input',
                name: 'RECORDING_SAVE_PATH',
                message: 'Recording save path (leave empty for default):',
                default: process.env.RECORDING_SAVE_PATH || '',
                when: (ans) => ans.ENABLE_RECORDING
            }
        ]);

        // Process final configuration object
        const finalConfig = {
            ...answers,
            // Convert booleans to strings
            PUPPETEER_HEADLESS: String(answers.PUPPETEER_HEADLESS),
            PUPPETEER_START_MAXIMIZED: String(answers.PUPPETEER_START_MAXIMIZED),
            ENABLE_CREATE_REPORT: String(answers.ENABLE_CREATE_REPORT || false),
            UNLOCK_REPORT: String(answers.UNLOCK_REPORT || false),
            DOWNLOAD_PDF: String(answers.DOWNLOAD_PDF),
            HTML_PAGE_CREATION_FOR_USER_DETAILS: String(answers.HTML_PAGE_CREATION_FOR_USER_DETAILS),
            OPEN_HTML_PAGES: String(answers.OPEN_HTML_PAGES || false),
            BROWSER_CLOSE_ON_COMPLETION: String(answers.BROWSER_CLOSE_ON_COMPLETION),
            ENABLE_RECORDING: String(answers.ENABLE_RECORDING),

            // Reset all flows
            ENABLE_DISCOUNTED_FULL_FLOW: 'false',
            ENABLE_PRO_ACCESS_FLOW: 'false',
            ENABLE_STANDARD_FLOW: 'false',
            ENABLE_PAID_PLATFORM_ACCESS: 'false',
            ENABLE_FREE_PLATFORM_ACCESS: 'false',
            ENABLE_PAID_PLATFORM: 'false'
        };

        // Enable only selected flow
        finalConfig[answers.activeFlow] = 'true';

        // Apply config to environment settings
        updateConfig(finalConfig);

        console.log(chalk.green('\n✓ All configurations updated. Starting automation...\n'));

        await runAutomation();
    }

    interactiveCli().catch(err => {
        console.error(chalk.red('\n❌ Automation failed:'), err);
        process.exit(1);
    });
} else {
    // Server mode - start Express server
    app.listen(PORT, async () => {

        console.log(chalk.green(`✓ Automation Dashboard running at http://localhost:${PORT}`));
        console.log(chalk.cyan(`  Open your browser and navigate to http://localhost:${PORT}`));

        // Automatically open the browser
        await open(`http://localhost:${PORT}`);
    });
}