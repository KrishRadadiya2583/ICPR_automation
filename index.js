const chalk = require("chalk")
const { launchBrowser } = require("./config/puppeteer");
const { runAutomation } = require("./services/automation");


(async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);

    try {
        await runAutomation(page);
    } catch (err) {
        console.error(chalk.red("[❌ Error:]"), err.message);
    }

    // await browser.close();
})();