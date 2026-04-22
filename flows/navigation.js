const logger = require("../utils/logger");

async function ensureAtHome(page) {
    let baseUrl = (process.env.WEBSITE_URL).trim() + "en/";
    if (!baseUrl.endsWith('/')) {
        baseUrl += 'en/';
    }

    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true") {
        const targetUrl = baseUrl + "track";
        logger.header("discounted full access flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_PRO_ACCESS_FLOW === "true") {
        const targetUrl = baseUrl + "tracking";
        logger.header("pro access flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_STANDARD_FLOW === "true") {
        const targetUrl = baseUrl + "track";
        logger.header("standard access flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        const targetUrl = baseUrl + "tracking";
        logger.header("paid platform access flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        const targetUrl = baseUrl + "tracking";
        logger.header("free platform access flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_PAID_PLATFORM === "true") {
        const targetUrl = baseUrl + "tracking";
        logger.header("paid platform funnel flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else {
        const targetUrl = baseUrl;
        logger.header("default access flow enabled");
        logger.info(`Navigating to: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
}

module.exports = { ensureAtHome };
