const inquirer = require('inquirer');
const logger = require("./utils/logger");
const { updateConfig } = require("./config/configManager");             
const { runAutomation } = require("./core/automation");

async function startInteractiveCli() {
    logger.header('Full Interactive Automation CLI');
    logger.info('Press Enter to use [default] values\n');

    const answers = await inquirer.prompt([
        // --- Website Configuration ---
        {
            type: 'list',
            name: 'WEBSITE_URL',
            message: 'Select Target Environment :',
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
            message: 'Run in Headless Mode? on/off',
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
            message: 'Select Execution Flow for your desire subscription type:',
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
            message: 'Number of users to register at once:',
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
            message: 'Auto-unlock the latest report after report generation?',
            default: process.env.UNLOCK_REPORT === 'true',
            when: (ans) => ans.ENABLE_CREATE_REPORT
        },
        {
            type: 'confirm',
            name: 'DOWNLOAD_PDF',
            message: 'Download PDF reports / pdf_subscription?',
            default: process.env.DOWNLOAD_PDF === 'true'
        },

        // --- HTML Result Settings ---
        {
            type: 'confirm',
            name: 'HTML_PAGE_CREATION_FOR_USER_DETAILS',
            message: 'Create local HTML result pages for user credentials and details?',
            default: process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === 'true'
        },
        {
            type: 'confirm',
            name: 'OPEN_HTML_PAGES',
            message: 'Auto-open generated HTML pages with user credentials and details?',
            default: process.env.OPEN_HTML_PAGES === 'true',
            when: (ans) => ans.HTML_PAGE_CREATION_FOR_USER_DETAILS
        },

        // --- Browser behavior & Recording
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
            message: 'Recording save path:',
            default: process.env.RECORDING_SAVE_PATH || '',
            when: (ans) => ans.ENABLE_RECORDING
        }
    ]);

    const finalConfig = {
        ...answers,
        PUPPETEER_HEADLESS: String(answers.PUPPETEER_HEADLESS),
        PUPPETEER_START_MAXIMIZED: String(answers.PUPPETEER_START_MAXIMIZED),
        ENABLE_CREATE_REPORT: String(answers.ENABLE_CREATE_REPORT || false),
        UNLOCK_REPORT: String(answers.UNLOCK_REPORT || false),
        DOWNLOAD_PDF: String(answers.DOWNLOAD_PDF),
        HTML_PAGE_CREATION_FOR_USER_DETAILS: String(answers.HTML_PAGE_CREATION_FOR_USER_DETAILS),
        OPEN_HTML_PAGES: String(answers.OPEN_HTML_PAGES || false),
        BROWSER_CLOSE_ON_COMPLETION: String(answers.BROWSER_CLOSE_ON_COMPLETION),
        ENABLE_RECORDING: String(answers.ENABLE_RECORDING),

        ENABLE_DISCOUNTED_FULL_FLOW: 'false',
        ENABLE_PRO_ACCESS_FLOW: 'false',
        ENABLE_STANDARD_FLOW: 'false',
        ENABLE_PAID_PLATFORM_ACCESS: 'false',
        ENABLE_FREE_PLATFORM_ACCESS: 'false',
        ENABLE_PAID_PLATFORM: 'false'
    };

    finalConfig[answers.activeFlow] = 'true';
    updateConfig(finalConfig);

    logger.success('All configurations updated. Starting automation...\n');
    await runAutomation();
}

if (require.main === module) {
    startInteractiveCli().catch(err => {
        logger.error('CLI Error', err);
        process.exit(1);
    });
}

module.exports = { startInteractiveCli };
