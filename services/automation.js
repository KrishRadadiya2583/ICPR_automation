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
    await page.type("input[placeholder='Enter a phone number']", mobile,{delay:10});

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
    await page.type("#input", email,{delay:10});


    // ===== STEP 4: REGISTER =====
    await page.click("button.hl_cta_wrap");

    console.log(chalk.cyan("Waiting for payment page..."));
    // ===== STEP 5: HANDLE IFRAME =====
    console.log(chalk.yellow("Waiting for payment iframe..."));

    // Wait until iframe appears in DOM
    await page.waitForSelector("iframe",{visible:true});

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
    await frame.waitForSelector("#ccnumber",{visible:true});
    await frame.type("#ccnumber", process.env.CARD_NUMBER, { delay: 10 });

    // Expiry
    await frame.waitForSelector("#cardExpiry",{visible:true});
    await frame.type("#cardExpiry", process.env.CARD_EXPIRY, { delay: 10 });

    // CVV
    await frame.waitForSelector("#cvv2",{visible:true});
    await frame.type("#cvv2", process.env.CARD_CVV, { delay: 10 });

    console.log(chalk.green("Card details filled"));

    // Submit card details
    await page.waitForSelector("#submit",{visible:true});
    await page.click("#submit");

    console.log(chalk.magenta(" Payment Done"));


    console.log(chalk.green("[success]"), "user register successfully")


    // click on continue to open dashboard

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
await delay(500)
    await page.click(".ant-modal-close-x")

    console.log(chalk.bgYellow("report close button click success"))


    await page.waitForSelector(".ant-dropdown-trigger",{visible:true})
    await delay(500)
    await page.click(".ant-dropdown-trigger")

    await delay(500)
    
    //  const inputs = await page.$$('.mobile_menu_option');
    //  await inputs[5].click(); 

    // console.log(chalk.bgBlue("logout success"))


    // generate new report


    for (let i = 1; i <= process.env.REPORT_COUNT; i++) {

        await page.waitForSelector('a[data-title="Search other Number"]', { visible: true })

        await delay(1000)

        await page.click("a[data-title='Search other Number']")

        console.log("generate new report button click success")


        // input number for new report

        await delay(3000)

        await page.waitForSelector('.ant-input-outlined.input-form.form-control', { visible: true });

        await delay(500)

      const inputs = await page.$$('.ant-input-outlined.input-form.form-control');
        await inputs[1].type(randomMobile(), { delay: 10 }); // second input

  
        console.log("number enter success")


        // click on submit

     

        await page.waitForSelector("#btnSubmit", { visible: true })

        await page.click("#btnSubmit")

        console.log("submit button click success")

        console.log(chalk.bgGreen("report " + i + " generate  successfull"))
    }

    // unlock latest report 



    await page.waitForSelector(".UnlockFullReport", { visible: true })

    await delay(500)

    await page.click(".UnlockFullReport")

    // again click on unlock report

 

    await page.waitForSelector(".vc_btn3-inline", { visible: true })

    await delay(500)

    await page.click(".vc_btn3-inline")

    console.log(chalk.bgGreenBright("unlock latest report success"))

    console.log(chalk.bgGray("report open successfull"))


    // close info page



    await page.waitForSelector(".accuracy__transparent_btn", { visible: true })

    await delay(500)

    await page.click(".accuracy__transparent_btn")

    console.log(chalk.bgMagentaBright("info page close success"))


    // view report
 

    await page.waitForSelector(".report__popup_pay_btn", { visible: true })

    await delay(500)
    
    await page.click(".report__popup_pay_btn")

    console.log(chalk.bgYellowBright("view report success"))

}

module.exports = { runAutomation };