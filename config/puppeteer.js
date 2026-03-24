const puppeteer = require("puppeteer");

async function launchBrowser() {
    return await puppeteer.launch({
        headless: true,
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