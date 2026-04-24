const logger = require("../utils/logger");

async function cloudAccess(page) {
    if (!process.env.CF_ACCESS_CLIENT_ID || !process.env.CF_ACCESS_CLIENT_SECRET) {
        return;
    }

    // Prevent duplicate listeners
    if (page._cfAccessApplied) {
        return;
    }
    page._cfAccessApplied = true;

    // Enable interception only if not already enabled
    try {
        await page.setRequestInterception(true);
    } catch (err) {
        // Ignore if already enabled
    }

    page.on('request', (req) => {
        if (req.isInterceptResolutionHandled()) return;

        const headers = {
            ...req.headers(),
            "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
            "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET
        };

        req.continue({ headers });
    });

    logger.process("Cloudflare Access headers applied");
}

module.exports = { cloudAccess };