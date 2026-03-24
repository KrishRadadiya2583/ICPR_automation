const { launchBrowser } = require("./config/puppeteer");
const { runAutomation } = require("./services/automation");

(async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    try {
        await runAutomation(page);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }

    // await browser.close();
})();