const { randomMobile, randomEmail } = require("../utils/generator");
const delay = require("../utils/delay");
const logger = require("../utils/logger");

async function searchmobileno(page) {

    const mobile = randomMobile();
    logger.data("Mobile", mobile);

    await page.waitForSelector("input[placeholder='Enter a phone number']");
    await page.type("input[placeholder='Enter a phone number']", mobile, { delay: 50 });

    // ===== STEP 2: SEARCH =====
    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true" || process.env.ENABLE_STANDARD_FLOW === "true") {
        await Promise.all([
            page.waitForNavigation(),
            page.click("button[type='submit']")
        ]);
        logger.success("Search submitted");
    }
    else {
        await delay(500)
        await page.waitForSelector(".span-text , button[type='submit'] , .input-suffix", { visible: true, clickCount: 10 });
        await delay(500)
        await page.click(".span-text , button[type='submit'] , .input-suffix");
        logger.success("Search submitted");
    }

    return mobile;
}

module.exports = { searchmobileno };