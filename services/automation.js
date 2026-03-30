require('dotenv').config();
const chalk = require("chalk");
const fs = require('fs')
const delay = require("../utils/delay");
const { randomMobile, randomEmail } = require("../utils/generator");

async function runAutomation(page) {
    console.log(chalk.green("[START]"), "opning url in browser...");

    async function ensureAtHome() {
        const targetUrl = process.env.WEBSITE_URL.trim();
        await page.goto(targetUrl, { waitUntil: "load" });
    }

    async function findPaymentFrame() {
        const allowed = ["stripe", "payment", "checkout"];

        const start = Date.now();
        while (Date.now() - start < 15000) {
            const frame = page.frames().find((f) => {
                const u = f.url();
                if (!u) return false;
                return allowed.some((token) => u.includes(token));
            });

            if (frame) return frame;
            await delay(300);
        }

        throw new Error("Payment iframe not found");
    }

    await ensureAtHome();

    // ===== STEP 1: MOBILE =====

    async function registerusers(page) {

        const mobile = randomMobile();
        console.log(chalk.blue("Mobile:"), mobile);

        await page.waitForSelector("input[placeholder='Enter a phone number']");
        await page.type("input[placeholder='Enter a phone number']", mobile, { delay: 50 });

        // ===== STEP 2: SEARCH =====
        await Promise.all([
            page.waitForNavigation(),
            page.click("button[type='submit']")
        ]);

        console.log(chalk.green("Search submitted"));

        // ===== STEP 3: EMAIL =====


        await page.waitForSelector("#input", { visible: true });
        const email = randomEmail();
        console.log(chalk.blueBright("Email:", email));
        await page.type("#input", email, { delay: 50 });


        // ===== STEP 4: REGISTER =====
        await page.click("button.hl_cta_wrap");


        

        console.log(chalk.cyan("Waiting for payment page..."));
        // ===== STEP 5: HANDLE IFRAME =====
        console.log(chalk.yellow("Waiting for payment iframe..."));

        await page.waitForSelector("iframe", { visible: true, timeout: 120000 });

        const frame = await findPaymentFrame();

        console.log(chalk.green("Payment frame found"));
        console.log(chalk.blue("Frame URL:"), frame.url());

        // Card Number
        console.log(chalk.blue("card details fill start"));
  
        await frame.waitForSelector("#ccnumber", { visible: true });
        await frame.type("#ccnumber", process.env.CARD_NUMBER, { delay: 10 });
    
    

        // Expiry
        await frame.waitForSelector("#cardExpiry", { visible: true });
        await frame.type("#cardExpiry", process.env.CARD_EXPIRY, { delay: 10 });

       
        // CVV
        await frame.waitForSelector("#cvv2", { visible: true });
        await frame.type("#cvv2", process.env.CARD_CVV, { delay: 10 });

  await delay(process.env.COMMON_DELAY_ONCLICKS)

        console.log(chalk.green("Card details filled"));

        // Submit card details
        const submitElement = await frame.$("#submit");
        if (submitElement) {
            await submitElement.click();
        } else {
            await page.waitForSelector("#submit", { visible: true });
            await page.click("#submit");
        }




        // click on continue to open dashboard
        await delay(process.env.COMMON_DELAY_ONCLICKS)

        await page.waitForSelector("button.continue-btn", { visible: true });
        await page.click("button.continue-btn");

        console.log(chalk.green("[successfull]"), "dashboard load successfull")

        // submit review default 4 star

        await page.waitForSelector(".ant-rate-star-second", { visible: true });



        await page.click('.ant-rate-star:nth-child(4)');

        console.log(chalk.bgBlue("review submit success"))



        //  close review modal
        await page.waitForSelector(".ant-modal-close", { visible: true });



        await page.click('.ant-modal-close');

        console.log(chalk.bgBlue("review close button click success"))

        // close report modal


        await page.waitForSelector(".ant-modal-close-x", { visible: true })
        await delay(process.env.COMMON_DELAY_ONCLICKS)
        await page.click(".ant-modal-close-x")

        console.log(chalk.bgYellow("report close button click success"))

        
        console.log(chalk.magenta(" Payment Done"));

        
        console.log(chalk.green("[success]"), "user register successfully")

        if(process.env.USER_REGISTRATION_COUNT>1){
        fs.appendFileSync("users.txt",`user email:${email}\n`)
        }
    }

    async function logout(page) {

        await page.waitForSelector(".ant-dropdown-trigger", { visible: true })
        await delay(process.env.COMMON_DELAY_ONCLICKS)
        await page.click(".ant-dropdown-trigger")

        await delay(process.env.COMMON_DELAY_ONCLICKS)

        const inputs = await page.$$('.mobile_menu_option');
        await inputs[5].click();

        await page.waitForNavigation({ waitUntil: 'load' });

        console.log(chalk.bgBlue("logout success"))
    }

    async function generateReportsAndUnlock(page) {
        
        for (let i = 1; i <= process.env.REPORT_COUNT; i++) {

            await delay(process.env.COMMON_DELAY_ONCLICKS)


            await page.waitForSelector('a[data-title="Search other Number"]', { visible: true, timeout: 30000 });


            await delay(process.env.COMMON_DELAY_ONCLICKS)

            await page.click('a[data-title="Search other Number"]')

            console.log("generate new report button click success")


            // input number for new report

            await delay(process.env.COMMON_DELAY_ONCLICKS)

            await page.waitForSelector('.ant-input-outlined.input-form.form-control', { visible: true });

            await delay(process.env.COMMON_DELAY_ONCLICKS)

            const inputs = await page.$$('.ant-input-outlined.input-form.form-control');
            await inputs[1].type(randomMobile(), { delay: 50 }); // second input


            console.log("number enter success")

            // click on submit
            await delay(process.env.COMMON_DELAY_ONCLICKS)
            await page.waitForSelector("#btnSubmit", { visible: true })

            await delay(process.env.COMMON_DELAY_ONCLICKS)

            await page.click("#btnSubmit")

            console.log("submit button click success")

        await page.waitForSelector('a[data-title="Search other Number"]', { visible: true, timeout: 60000 });
            console.log(chalk.bgGreen("report " + i + " generate  successfull"))
            await delay(500)
        }

        if (process.env.UNLOCK_REPORT == "true") {

            // unlock latest report 

            await delay(process.env.COMMON_DELAY_ONCLICKS)
            await page.waitForSelector(".UnlockFullReport", { visible: true })

            await delay(process.env.COMMON_DELAY_ONCLICKS)

            await page.click(".UnlockFullReport")

            // again click on unlock report

            await page.waitForSelector(".vc_btn3-inline", { visible: true })

            await delay(process.env.COMMON_DELAY_ONCLICKS)

            await page.click(".vc_btn3-inline")

            // Play sound for unlock
            process.stdout.write('\x07');

            console.log(chalk.bgGreenBright("unlock latest report success"))


        // Always open the report
        console.log(chalk.bgGray("report open successfull"))

        // close info page

        await page.waitForSelector(".accuracy__transparent_btn", { visible: true })

        await delay(process.env.COMMON_DELAY_ONCLICKS)

        await page.click(".accuracy__transparent_btn")

        console.log(chalk.bgMagentaBright("info page close success"))

        // view report

        await page.waitForSelector(".report__popup_pay_btn", { visible: true })

        await delay(process.env.COMMON_DELAY_ONCLICKS)

        await page.click(".report__popup_pay_btn")

        console.log(chalk.bgYellowBright("view report success"))
        }
    }

    if (process.env.USER_REGISTRATION_COUNT > 1) {
        for (let i = 1; i <= process.env.USER_REGISTRATION_COUNT; i++) {
            try {
                await ensureAtHome();
                await registerusers(page)
                console.log(chalk.bgGreen("[success]"), "user " + i + " register successfully")
                if(i != process.env.USER_REGISTRATION_COUNT){
                      await logout(page)
                }
              
                await delay(process.env.COMMON_DELAY_ONCLICKS)
            } catch (err) {
                console.error(chalk.red("[Error for user " + i + "]"), err.message);
            }
        }
    } else {
        try {
            await registerusers(page)
            await generateReportsAndUnlock(page)
        } catch (err) {
            console.error(chalk.red("[Error]"), err.message);
        }
    }







}

module.exports = { runAutomation };