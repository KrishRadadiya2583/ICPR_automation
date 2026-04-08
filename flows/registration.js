const express = require("express");
const chalk = require("chalk");
const { randomMobile, randomEmail } = require("../utils/generator");
const { handlePayment } = require("./payment");
const { appendUser } = require("../services/fileService");
const {generateHTML} = require("./htmlgenerator");
const { fetchPassword} = require("./yopmailpasswordfetcher");
const delay = require("../utils/delay");


const users =[];
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
        await delay(500)
        await page.waitForSelector(".span-text , button[type='submit'] , .input-suffix", { visible: true , clickCount: 10 });
        await delay(500)
        await page.click(".span-text , button[type='submit'] , .input-suffix");
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

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await handlePayment(page);
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    
    console.log(chalk.green("[success]"), "user register successfully");


if(process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === "true") {
    console.log(chalk.yellow("Fetching password for:"), email,"STARTED");
 
    await delay(process.env.COMMON_DELAY_ONCLICKS); // wait for file write
     const result = await fetchPassword(page, email);

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    console.log(chalk.yellow("Fetching password for:"), email,"COMPLETED");
    console.log("Result:", result);


    users.push({ email:email, password: result });
  
await delay(1000)
    
    console.log(users);


if (users.length == parseInt(process.env.USER_REGISTRATION_COUNT)) {
    console.log(chalk.green("[Report]"), "Generating HTML report for all users...");
    console.log(chalk.green("[Report]"), "Users to include in report:", users.length);
    const htmlFilePath = await generateHTML(users);
    
    if (process.env.OPEN_HTML_PAGES === "true") {
        console.log(chalk.green("[Report]"), "Opening HTML page...");
        try {
            const open = (await import('open')).default;
            await open(htmlFilePath);
        } catch (err) {
            console.error(chalk.red("[Error]"), "Failed to open HTML page:", err);
        }
    }
}

}


    appendUser(email);
}

module.exports = { registerusers };
