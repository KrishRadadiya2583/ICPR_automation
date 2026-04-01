const chalk = require("chalk");
const { randomMobile, randomEmail } = require("../utils/generator");
const { handlePayment } = require("./payment");
const { appendUser } = require("../services/fileService");

async function registerusers(page) {
    const mobile = randomMobile();
    console.log(chalk.blue("Mobile:"), mobile);

    await page.waitForSelector("input[placeholder='Enter a phone number']");
    await page.type("input[placeholder='Enter a phone number']", mobile, { delay: 50 });

    // ===== STEP 2: SEARCH =====
    if(process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true" || process.env.ENABLE_STANDARD_FLOW === "true") {
        await Promise.all([
            page.waitForNavigation(),
            page.click("button[type='submit']")
        ]);
        console.log(chalk.green("Search submitted"));
    }
    else {
        await page.waitForSelector(".span-text", { visible: true });
        await page.click(".span-text");
        console.log(chalk.green("Search submitted"));
    }

    // ===== STEP 3: EMAIL =====
    await page.waitForSelector("#input", { visible: true });
    const email = randomEmail();
    console.log(chalk.blueBright("Email:", email));
    await page.type("#input", email, { delay: 50 });


    // ===== STEP 4: REGISTER =====
    await page.click("button.hl_cta_wrap");

    console.log(chalk.cyan("Waiting for payment page..."));

    // ===== STEP 5: HANDLE IFRAME =====
    await handlePayment(page);

    console.log(chalk.green("[success]"), "user register successfully");

    appendUser(email);
}

module.exports = { registerusers };
