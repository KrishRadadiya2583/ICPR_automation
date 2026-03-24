const puppeteer = require("puppeteer");

async function launchBrowser() {
    return await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });
}

module.exports = { launchBrowser };