require('dotenv').config();
const chalk = require("chalk")
const { launchBrowser } = require("./config/puppeteer");
const { runAutomation } = require("./Automation");

const MAX_RETRIES = process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES) : 3;
const RETRY_DELAY_MS = process.env.RETRY_DELAY_MS ? parseInt(process.env.RETRY_DELAY_MS) : 5000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        let browser;

        try {
            console.log(chalk.cyan(`[Retry] Attempt ${attempt}/${MAX_RETRIES}`));

         browser = await launchBrowser();

    const pages = await browser.pages();
    const page = pages[0]; // use existing tab

            page.setDefaultTimeout(90000);
            page.setDefaultNavigationTimeout(90000);

            await runAutomation(page);
            console.log(chalk.green(`[✅ Success] Automation completed on attempt ${attempt}`));
            break;
        } catch (err) {
            console.error(chalk.red(`[❌ Attempt ${attempt} failed:]`), err.message);

            if (attempt === MAX_RETRIES) {
                console.error(
                    chalk.bgRed.white("[FATAL]"),
                    `Max retries reached (${MAX_RETRIES}). Automation failed.`
                );
                break;
            }

            console.log(chalk.yellow(`[Retry] Waiting ${RETRY_DELAY_MS / 1000}s before next attempt...`));
            await sleep(RETRY_DELAY_MS);
        } finally {

            if (process.env.BROWSER_CLOSE_ON_COMPLETION == "true") {
                if (browser) {
                await browser.close();
                console.log(chalk.gray("[Cleanup] Browser closed"));
            }
            else{
                console.log(chalk.gray("browser close on completion is set to false, keeping browser open for debugging"));
            }
            }
            
        }
    }
})();