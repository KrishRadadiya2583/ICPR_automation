require('dotenv').config();
const chalk = require("chalk");
const delay = require("../utils/delay");
const { randomMobile, randomEmail } = require("../utils/generator");


async function runAutomation(page) {
    console.log(chalk.green("[START]"), "opning url in browser...");

    await page.goto(process.env.WEBSITE_URL, {
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


    await delay(process.env.COMMON_DELAY_ONCLICKS)
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
    await frame.type("#ccnumber", process.env.CARD_NUMBER, { delay: 200 });

    // Expiry
    await frame.type("#cardExpiry", process.env.CARD_EXPIRY, { delay: 200 });

    // CVV
    await frame.type("#cvv2", process.env.CARD_CVV, { delay: 200 });

    console.log(chalk.green("Card details filled"));

    // Submit card details
    await page.click("#submit");

    console.log(chalk.magenta(" Payment Done"));


    console.log(chalk.green("[success]"), "user register successfully")


    // click on continue to open dashboard
    await delay(5000)

    await page.waitForSelector("button.continue-btn", { visible: true });

    await delay(2000)
    await page.click("button.continue-btn");

    console.log(chalk.green("[successfull]"), "dashboard load successfull")


    await delay(4000)


    // submit review default 4 star

    await page.waitForSelector(".ant-rate-star-second", { visible: true });

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click('.ant-rate-star:nth-child(4)');

    console.log(chalk.bgBlue("review submit success"))

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    //  close review modal
    await page.waitForSelector(".ant-modal-close", { visible: true });

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click('.ant-modal-close');

    console.log(chalk.bgBlue("review close button click success"))

    // close report modal

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.waitForSelector(".ant-modal-close-x", { visible: true })

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click(".ant-modal-close-x")

    console.log(chalk.bgYellow("report close button click success"))


    // generate new report

    for (let i = 1; i <= process.env.REPORT_COUNT; i++) {

        await page.waitForSelector("a.menu_button[href='/en/dashboard']", { visible: true })

        await delay(process.env.COMMON_DELAY_ONCLICKS)

        await page.click("a.menu_button[href='/en/dashboard']")

        console.log("generate new report button click success")

        // input number for new report

        await delay(process.env.COMMON_DELAY_ONCLICKS)

        await page.waitForSelector('.ant-input-outlined.input-form.form-control', { visible: true });

        const inputs = await page.$$('.ant-input-outlined.input-form.form-control');
        await inputs[1].type(randomMobile(), { delay: 200 }); // second input

        await delay(process.env.COMMON_DELAY_ONCLICKS)
        console.log("number enter success")


        // click on submit

        await delay(process.env.COMMON_DELAY_ONCLICKS)

        await page.waitForSelector("#btnSubmit", { visible: true })

        await page.click("#btnSubmit")

        console.log("submit button click success")

        console.log(chalk.bgGreen("report " + i + " generate  successfull"))
    }

    // unlock latest report 

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.waitForSelector(".UnlockFullReport", { visible: true })

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click(".UnlockFullReport")

    // again click on unlock report

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.waitForSelector(".vc_btn3-inline", { visible: true })

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click(".vc_btn3-inline")

    console.log(chalk.bgGreenBright("unlock latest report success"))

    console.log(chalk.bgGray("report open successfull"))


    // close info page

    await delay(2000)

    await page.waitForSelector(".accuracy__transparent_btn", { visible: true })

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click(".accuracy__transparent_btn")

    console.log(chalk.bgMagentaBright("info page close success"))


    // view report
    await delay(2000)

    await page.waitForSelector(".report__popup_pay_btn", { visible: true })

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    await page.click(".report__popup_pay_btn")

    console.log(chalk.bgYellowBright("view report success"))

}

module.exports = { runAutomation };