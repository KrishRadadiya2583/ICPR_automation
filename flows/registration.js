const express = require("express");
const chalk = require("chalk");
const { handlePayment } = require("./payment");
const { appendUser } = require("../services/fileService");
const { generateHTML } = require("./htmlgenerator");
const { fetchPassword } = require("./yopmailpasswordfetcher");
const delay = require("../utils/delay");
const { reportEmailFetcher } = require("./reportemailfetcher");
const { searchmobileno } = require("../helper/searchmobileno");
const { useremailtype } = require("../helper/useremailtype");
const { findHiddenIframe } = require("../core/frameHandler");

const users = [];
async function registerusers(page) {

    // mobil number search & submit

    const mobile = await searchmobileno(page);

    console.log("mobile number typed", mobile)

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    // email type & submit

    const email = await useremailtype(page);

    await delay(process.env.COMMON_DELAY_ONCLICKS)


    // free platform access

    if (process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        await delay(4000)

        await page.goBack();
        await delay(2000)

        await page.goBack();

        await delay(2000)

        await page.waitForSelector(".location__btn", { visible: true, timeout: 60000 })
        await delay(2000)
        await page.click(".location__btn", { clickCount: 10 })
        await delay(5000)
    }



    console.log(chalk.cyan("Waiting for payment page..."));


    console.log(chalk.green("[success]"), "user register successfully");

    if (process.env.ENABLE_PAID_PLATFORM === "true") {

        await delay(10000)

        await page.close();

        await reportEmailFetcher(page, email);

        console.log(chalk.bgGreenBright("report email fetch success & open report"))

        await delay(5000)


        console.log("FIND A SEE NOW BUTTON")


    }

    if(process.env.ENABLE_PAID_PLATFORM != "true"){
        
           // handla payment & card details
       await delay(process.env.COMMON_DELAY_ONCLICKS);
        await handlePayment(page);
        await delay(process.env.COMMON_DELAY_ONCLICKS);

    }
 



    if (process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === "true") {
        console.log(chalk.yellow("Fetching password for:"), email, "STARTED");

        await delay(process.env.COMMON_DELAY_ONCLICKS); // wait for file write
        const result = await fetchPassword(page, email);

        await delay(process.env.COMMON_DELAY_ONCLICKS);

        console.log(chalk.yellow("Fetching password for:"), email, "COMPLETED");
        console.log("Result:", result);

        users.push({ email: email, password: result });

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
