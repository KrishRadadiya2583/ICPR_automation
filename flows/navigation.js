const chalk = require("chalk");

async function ensureAtHome(page) {
    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true") {
        const targetUrl = process.env.WEBSITE_URL.trim() + "track";
        console.log(chalk.bgCyanBright("discounted full access flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_PRO_ACCESS_FLOW === "true") {
        const targetUrl = process.env.WEBSITE_URL.trim() + "tracking";
        console.log(chalk.bgCyanBright("pro access flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_STANDARD_FLOW === "true") {
        const targetUrl = process.env.WEBSITE_URL.trim() + "track";
        console.log(chalk.bgCyanBright("standard access flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        const targetUrl = process.env.WEBSITE_URL.trim() + "tracking";
        console.log(chalk.bgCyanBright("paid platform access flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        const targetUrl = process.env.WEBSITE_URL.trim() + "tracking";
        console.log(chalk.bgCyanBright("free platform access flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else if (process.env.ENABLE_PAID_PLATFORM === "true") {
        const targetUrl = process.env.WEBSITE_URL.trim() + "tracking";
        console.log(chalk.bgCyanBright("paid platform funnel flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
    else {
        const targetUrl = process.env.WEBSITE_URL.trim();
        console.log(chalk.bgCyanBright("default access flow enabled"));
        console.log(chalk.blue("Navigating to:"), targetUrl);
        await page.goto(targetUrl, { waitUntil: "load" });
    }
}

module.exports = { ensureAtHome };
