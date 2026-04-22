
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const logger = require("../utils/logger");

async function launchBrowser() {
    const isHeadless = process.env.PUPPETEER_HEADLESS === "true";
    const startMaximized = process.env.PUPPETEER_START_MAXIMIZED === 'true';

    const rawViewport = process.env.PUPPETEER_DEFAULT_VIEWPORT;
    const defaultViewport =
        !rawViewport || rawViewport === "null" ? null : JSON.parse(rawViewport);

    logger.info(`Launching browser with viewport: ${rawViewport || 'default'}`);

    return await puppeteer.launch({
        headless: isHeadless,
        defaultViewport: defaultViewport,
        args: startMaximized ? ['--start-maximized'] : [],
    });

  // Example: save HTML content

  const htmlContent = await page.content();

  fs.writeFileSync('report.html', htmlContent);
 
}

module.exports = { launchBrowser };
