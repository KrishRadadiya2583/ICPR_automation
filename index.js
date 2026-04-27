require('dotenv').config();
const open = require("open").default;
const express = require("express");
const path = require("path");
const { updateConfig } = require("./config/configManager");
const { runAutomation } = require("./core/automation");
const { startInteractiveCli } = require("./cli");
const logger = require("./utils/logger");

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

// API endpoint to configure and run automation (UI)
app.post('/api/config-and-run', async (req, res) => {
    try {
        const config = req.body;
        updateConfig(config);
        runAutomation().catch(err => logger.error('Background automation error', err));
        res.json({ success: true, message: 'Automation started' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Serve UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Main execution logic
const CLI_MODE = process.env.ENABLE_CLI_MODE === 'true';

if (CLI_MODE) {
    startInteractiveCli().catch(err => {
        logger.error('CLI Error', err);
        process.exit(1);
    });
} else {
    // Server mode - start Express server
    app.listen(PORT, async () => {
        logger.header("Automation Dashboard Started");
        logger.success(`Dashboard running at http://localhost:${PORT}`);
        logger.info(`Open your browser and navigate to http://localhost:${PORT}`);
        await open(`http://localhost:${PORT}`);
    });
}