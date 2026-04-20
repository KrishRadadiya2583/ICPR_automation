const { randomMobile, randomEmail } = require("../utils/generator");
const delay = require("../utils/delay");
const chalk = require("chalk");


async function useremailtype(page) {
    await page.waitForSelector("#input", { visible: true });
    const email = randomEmail();
    console.log(chalk.blueBright("Email:", email));
    await page.type("#input", email, { delay: 50 });
    // ===== STEP 4: REGISTER =====
    await page.click("button.hl_cta_wrap");


    return email;

}

module.exports = { useremailtype };