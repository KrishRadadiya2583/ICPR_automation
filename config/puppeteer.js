
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function launchBrowser() {
    const isHeadless = process.env.PUPPETEER_HEADLESS === "true";
    const startMaximized = process.env.PUPPETEER_START_MAXIMIZED === 'true';

    const rawViewport = process.env.PUPPETEER_DEFAULT_VIEWPORT;
    const defaultViewport =
        !rawViewport || rawViewport === "null" ? null : JSON.parse(rawViewport);

    return await puppeteer.launch({
        headless: isHeadless,
        defaultViewport: defaultViewport,
        args: startMaximized ? ['--start-maximized'] : [],
    });
}

module.exports = { launchBrowser };
