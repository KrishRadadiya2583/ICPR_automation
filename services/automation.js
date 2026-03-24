const delay = require("../utils/delay");
const { randomMobile, randomEmail } = require("../utils/generator");

async function runAutomation(page) {
    console.log("Opening website...");

    await page.goto("https://dev-pr.infochecker.com/en/", {
        waitUntil: "load",
    });

    // ===== STEP 1: MOBILE =====
    const mobile = randomMobile();
    console.log("Mobile:", mobile);

    await page.waitForSelector("input[placeholder='Enter a phone number']");
    await page.type("input[placeholder='Enter a phone number']", mobile, { delay: 50 });

    // ===== STEP 2: SEARCH =====
    await Promise.all([
        page.waitForNavigation(),
        page.click("button[type='submit']")
    ]);

    console.log("Search submitted");

    // ===== STEP 3: EMAIL =====
    await page.waitForSelector("input[placeholder='hello@mail.com']");
    const email = randomEmail();

    console.log("Email:", email);

    await page.type("input[placeholder='hello@mail.com']", email, { delay: 100 });

    // ===== STEP 4: REGISTER =====
    await delay(1000);
    await page.click("button.hl_cta_wrap");

    console.log("Waiting for payment page...");
    await delay(4000);

    // ===== STEP 5: HANDLE IFRAME =====
    const frame = page.frames().find(f =>
        f.url().includes("stripe") || f.url().includes("payment")
    );

    if (!frame) {
        console.log(" Payment frame not found");
        return;
    }

    console.log(" Frame found");

    // Card Number
    await frame.waitForSelector("#ccnumber");
    await frame.type("#ccnumber", "4067429974719265", { delay: 100 });

    // Expiry
    await frame.type("#cardExpiry", "12/34", { delay: 100 });

    // CVV
    await frame.type("#cvv2", "123", { delay: 100 });

    console.log("Card details filled");

    // Submit
    await page.click("#submit");

    console.log(" Payment Done");
    console.log("user register successfully")
}

module.exports = { runAutomation };