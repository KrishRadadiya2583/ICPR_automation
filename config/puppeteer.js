const puppeteer = require("puppeteer");

async function launchBrowser() {
    return await puppeteer.launch({
        headless: true,
        browser: 'chromium',
        cacheDirectory: '/opt/render/.cache/puppeteer',
        defaultViewport: null,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
        ],
    });
}

module.exports = { launchBrowser };