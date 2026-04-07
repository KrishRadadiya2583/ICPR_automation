
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const isHeadless = process.env.PUPPETEER_HEADLESS === 'false';
const startMaximized = process.env.PUPPETEER_START_MAXIMIZED === 'true';

const defaultViewport =
  process.env.PUPPETEER_DEFAULT_VIEWPORT === 'null'
    ? null
    : JSON.parse(process.env.PUPPETEER_DEFAULT_VIEWPORT);


async function launchBrowser() {
    return await puppeteer.launch({
        headless: isHeadless,
        defaultViewport: defaultViewport,
        args:startMaximized ? ['--start-maximized','--no-sandbox','--disable-setuid-sandbox'] : [],
    });
}

module.exports = { launchBrowser };