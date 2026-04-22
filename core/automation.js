const logger = require("../utils/logger");
const fs = require('fs');
const { launchBrowser } = require("../config/puppeteer");
const { ensureAtHome } = require("../flows/navigation");
const { registerusers } = require("../flows/registration");
const { generateReportsAndUnlock } = require("../flows/reports");
const { logout } = require("../flows/auth");
const { downloadPDF } = require("../flows/pdf_subscription");
const delay = require("../utils/delay");
const { startRecording, stopRecording } = require('../helper/recording');

async function runAutomation() {
    let browser;
    let page;
    let recorder;
    const filePath = "./public/users.html";

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.error("Failed to delete HTML page", err);
            } else {
                logger.process("Previous results file deleted");
            }
        });
    }

    // Helper to safely start or restart the browser
    async function initBrowser() {
        if (recorder) await stopRecording(recorder);
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
        logger.header("Starting Automation Process");
        await initBrowser();

        const userRegistrationCount = process.env.USER_REGISTRATION_COUNT ? parseInt(process.env.USER_REGISTRATION_COUNT) : 1;

        // Loop over the total number of users to process
        for (let i = 1; i <= userRegistrationCount; i++) {
            // Retry loop for the specific user registration
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    if (attempt > 1) {
                        logger.step(`User ${i} Attempt ${attempt}/${MAX_RETRIES}`);
                    }

                    await ensureAtHome(page);
                    await registerusers(page);

                    logger.success("user " + i + " registered successfully");

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
                    break;
                } catch (err) {
                    logger.error(`Error for user ${i} on Attempt ${attempt}`, err.message);

                    if (attempt === MAX_RETRIES) {
                        logger.error(`Max retries reached (${MAX_RETRIES}) for User ${i}. Skipping to next user.`);
                        break;
                    }

                    logger.warn(`Waiting ${RETRY_DELAY_MS / 1000}s before retrying...`);
                    await sleep(RETRY_DELAY_MS);
                    await initBrowser();
                }
            }
        }

        logger.divider();
        logger.success("Automation fully completed");

    } catch (criticalErr) {
        logger.error("Critical Error", criticalErr.message);
    } finally {
        await stopRecording(recorder);
        if (process.env.BROWSER_CLOSE_ON_COMPLETION == "true") {
            if (browser) {
                await browser.close();
                logger.process("Browser closed.");
            }
        } else {
            logger.info("browser close on completion is set to false, keeping browser open for debugging");
        }
    }
}

module.exports = { runAutomation };
