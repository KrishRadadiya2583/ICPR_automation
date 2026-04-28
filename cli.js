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
                { name: 'Dev Environment', value: 'https://dev.infochecker.com/' },
                { name: 'Stage Environment', value: 'https://stage.infochecker.com/' },
                { name: 'UAT Environment', value: 'https://uat.infochecker.com/' }
            ],
            default: process.env.WEBSITE_URL
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
        {
            type: 'list',
            name: 'nextStep',
            message: 'Subscription selected. What would you like to do next?',
            choices: [
                { name: 'Continue to customize remaining settings', value: 'continue' },
                { name: 'Execute automation now (with default values)', value: 'execute' }
            ],
            default: 'execute'
        },

        // --- User registration Settings ---
        {
            type: 'input',
            name: 'USER_REGISTRATION_COUNT',
            message: 'Number of users to register at once:',
            default: process.env.USER_REGISTRATION_COUNT || '1',
            validate: val => !isNaN(val) || 'Enter a number',
            when: (ans) => ans.nextStep === 'continue'
        },

        // --- Card Details ---
        {
            type: 'input',
            name: 'CARD_NUMBER',
            message: 'Enter 16-digit Card Number:',
            default: process.env.CARD_NUMBER,
            validate: val => val.length === 16 || 'Must be 16 digits',
            when: (ans) => ans.nextStep === 'continue'
        },
        {
            type: 'input',
            name: 'CARD_EXPIRY',
            message: 'Card Expiry (MM/YY):',
            default: process.env.CARD_EXPIRY,
            validate: val => /^\d{2}\/\d{2}$/.test(val) || 'Use MM/YY format',
            when: (ans) => ans.nextStep === 'continue'
        },
        {
            type: 'input',
            name: 'CARD_CVV',
            message: 'Card CVV:',
            default: process.env.CARD_CVV,
            validate: val => val.length >= 3 || 'Must be 3-4 digits',
            when: (ans) => ans.nextStep === 'continue'
        },

        // --- Report & PDF Settings ---
        {
            type: 'confirm',
            name: 'ENABLE_CREATE_REPORT',
            message: 'Generate reports after registration?',
            default: process.env.ENABLE_CREATE_REPORT === 'true',
            when: (ans) => ans.nextStep === 'continue'
        },
        {
            type: 'input',
            name: 'REPORT_COUNT',
            message: 'How many reports to generate?',
            default: process.env.REPORT_COUNT || '1',
            when: (ans) => ans.nextStep === 'continue' && ans.ENABLE_CREATE_REPORT
        },
        {
            type: 'confirm',
            name: 'UNLOCK_REPORT',
            message: 'Auto-unlock the latest report after report generation?',
            default: process.env.UNLOCK_REPORT === 'true',
            when: (ans) => ans.nextStep === 'continue' && ans.ENABLE_CREATE_REPORT
        },
        {
            type: 'confirm',
            name: 'DOWNLOAD_PDF',
            message: 'Download PDF reports / pdf_subscription?',
            default: process.env.DOWNLOAD_PDF === 'true',
            when: (ans) => ans.nextStep === 'continue'
        },

        // --- HTML Result Settings ---
        {
            type: 'confirm',
            name: 'HTML_PAGE_CREATION_FOR_USER_DETAILS',
            message: 'Create local HTML result pages for user credentials and details?',
            default: process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === 'true',
            when: (ans) => ans.nextStep === 'continue'
        },
        {
            type: 'confirm',
            name: 'OPEN_HTML_PAGES',
            message: 'Auto-open generated HTML pages with user credentials and details?',
            default: process.env.OPEN_HTML_PAGES === 'true',
            when: (ans) => ans.nextStep === 'continue' && ans.HTML_PAGE_CREATION_FOR_USER_DETAILS
        },

        // --- Browser behavior & Recording
        {
            type: 'confirm',
            name: 'BROWSER_CLOSE_ON_COMPLETION',
            message: 'Close browser on completion?',
            default: process.env.BROWSER_CLOSE_ON_COMPLETION === 'true',
            when: (ans) => ans.nextStep === 'continue'
        },
        {
            type: 'confirm',
            name: 'ENABLE_RECORDING',
            message: 'Enable screen recording for proof?',
            default: process.env.ENABLE_RECORDING === 'true',
            when: (ans) => ans.nextStep === 'continue'
        },
        {
            type: 'input',
            name: 'RECORDING_SAVE_PATH',
            message: 'Recording save path:',
            default: process.env.RECORDING_SAVE_PATH || '',
            when: (ans) => ans.nextStep === 'continue' && ans.ENABLE_RECORDING
        }
    ]);

    const finalConfig = {
        ...answers,
        PUPPETEER_HEADLESS: String(answers.PUPPETEER_HEADLESS ?? (process.env.PUPPETEER_HEADLESS === 'true')),
        PUPPETEER_START_MAXIMIZED: String(answers.PUPPETEER_START_MAXIMIZED ?? (process.env.PUPPETEER_START_MAXIMIZED === 'true')),
        PUPPETEER_DEFAULT_VIEWPORT: answers.PUPPETEER_DEFAULT_VIEWPORT || process.env.PUPPETEER_DEFAULT_VIEWPORT || 'null',
        
        USER_REGISTRATION_COUNT: answers.USER_REGISTRATION_COUNT || process.env.USER_REGISTRATION_COUNT || '1',
        MAX_RETRIES: answers.MAX_RETRIES || process.env.MAX_RETRIES || '3',
        CARD_NUMBER: answers.CARD_NUMBER || process.env.CARD_NUMBER,
        CARD_EXPIRY: answers.CARD_EXPIRY || process.env.CARD_EXPIRY,
        CARD_CVV: answers.CARD_CVV || process.env.CARD_CVV,

        ENABLE_CREATE_REPORT: String(answers.ENABLE_CREATE_REPORT ?? (process.env.ENABLE_CREATE_REPORT === 'true')),
        REPORT_COUNT: answers.REPORT_COUNT || process.env.REPORT_COUNT || '1',
        UNLOCK_REPORT: String(answers.UNLOCK_REPORT ?? (process.env.UNLOCK_REPORT === 'true')),
        DOWNLOAD_PDF: String(answers.DOWNLOAD_PDF ?? (process.env.DOWNLOAD_PDF === 'true')),
        HTML_PAGE_CREATION_FOR_USER_DETAILS: String(answers.HTML_PAGE_CREATION_FOR_USER_DETAILS ?? (process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === 'true')),
        OPEN_HTML_PAGES: String(answers.OPEN_HTML_PAGES ?? (process.env.OPEN_HTML_PAGES === 'true')),
        BROWSER_CLOSE_ON_COMPLETION: String(answers.BROWSER_CLOSE_ON_COMPLETION ?? (process.env.BROWSER_CLOSE_ON_COMPLETION === 'true')),
        ENABLE_RECORDING: String(answers.ENABLE_RECORDING ?? (process.env.ENABLE_RECORDING === 'true')),
        RECORDING_SAVE_PATH: answers.RECORDING_SAVE_PATH || process.env.RECORDING_SAVE_PATH || '',

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
