require('dotenv').config();
const chalk = require("chalk");
const { launchBrowser } = require("./config/puppeteer");
const { ensureAtHome } = require("./flows/navigation");
const { registerusers } = require("./flows/registration");
const { generateReportsAndUnlock } = require("./flows/reports");
const { logout } = require("./flows/auth");

const delay = require("./utils/delay");

const MAX_RETRIES = process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES) : 3;
const RETRY_DELAY_MS = process.env.RETRY_DELAY_MS ? parseInt(process.env.RETRY_DELAY_MS) : 5000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
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
                    } else if (i != userRegistrationCount) {
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
})();