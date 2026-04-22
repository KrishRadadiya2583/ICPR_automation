const { randomMobile, randomEmail } = require("../utils/generator");
const delay = require("../utils/delay");
const logger = require("../utils/logger");

async function useremailtype(page) {
    await page.waitForSelector("#input", { visible: true });
    const email = randomEmail();
    logger.data("Email", email);
    await page.type("#input", email, { delay: 50 });
    // ===== STEP 4: REGISTER =====
    await page.click("button.hl_cta_wrap");


    return email;

}

module.exports = { useremailtype };