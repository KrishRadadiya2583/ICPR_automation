const chalk = require("chalk")
const { launchBrowser } = require("./config/puppeteer");
const { runAutomation } = require("./services/automation");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        let browser;

        try {
            console.log(chalk.cyan(`[Retry] Attempt ${attempt}/${MAX_RETRIES}`));

            browser = await launchBrowser();
            const page = await browser.newPage();

            page.setDefaultTimeout(120000);
            page.setDefaultNavigationTimeout(120000);

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
          
                console.log(chalk.gray(" execution of auomation completed"));
            
        }
    }
})();