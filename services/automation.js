const chalk = require("chalk");
const delay = require("../utils/delay");
const { randomMobile, randomEmail } = require("../utils/generator");

async function runAutomation(page) {
    console.log(chalk.green("[START]"), "opning url in browser...");

    await page.goto("https://dev-pr.infochecker.com/en/track?c=usd1", {
        waitUntil: "load",
    });

    // ===== STEP 1: MOBILE =====
    const mobile = randomMobile();
    console.log(chalk.blue("Mobile:"), mobile);

    await page.waitForSelector("input[placeholder='Enter a phone number']");
    await page.type("input[placeholder='Enter a phone number']", mobile, { delay: 200 });

    // ===== STEP 2: SEARCH =====
    await Promise.all([
        page.waitForNavigation(),
        page.click("button[type='submit']")
    ]);

    console.log(chalk.green("Search submitted"));

    // ===== STEP 3: EMAIL =====
    await page.waitForSelector("#input");
    const email = randomEmail();


    console.log(chalk.blueBright("Email:", email));


    await delay(2000)

    await page.type("#input", email, { delay: 200 });

    
await delay(1000)
    // ===== STEP 4: REGISTER =====
    await page.click("button.hl_cta_wrap");

    console.log(chalk.cyan("Waiting for payment page..."));
    await delay(5000);

    // ===== STEP 5: HANDLE IFRAME =====
   console.log(chalk.yellow("Waiting for payment iframe..."));

// Wait until iframe appears in DOM
await page.waitForSelector("iframe", { timeout: 15000 });

// Wait until correct iframe is loaded
const frame = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject("Iframe timeout"), 15000);

    const checkFrame = () => {
        const frame = page.frames().find(f =>
            f.url().includes("stripe") || f.url().includes("payment")
        );

        if (frame) {
            clearTimeout(timeout);
            resolve(frame);
        } else {
            setTimeout(checkFrame, 500);
        }
    };

    checkFrame();
});

console.log(chalk.red(" Payment frame found"));

    // Card Number

    console.log(chalk.blue("card detailes fill start"))
    await frame.waitForSelector("#ccnumber");
    await frame.type("#ccnumber", "4067429974719265", { delay: 200 });

    // Expiry
    await frame.type("#cardExpiry", "12/34", { delay: 200 });

    // CVV
    await frame.type("#cvv2", "123", { delay: 200 });

    console.log(chalk.green("Card details filled"));

    // Submit
    await page.click("#submit");

    console.log(chalk.magenta(" Payment Done"));


    console.log(chalk.green("[success]"),"user register successfully")


// click on continue

await delay(4000)

await page.waitForSelector("button.continue-btn", { visible: true });

await delay(2000)
await page.click("button.continue-btn");

  console.log(chalk.green("[successfull]"),"dashboard load successfull")


  await delay(2000)



}

module.exports = { runAutomation };