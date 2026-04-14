    const chalk = require("chalk");
    const delay = require("../utils/delay");
    const { findPaymentFrame } = require("../core/frameHandler");
    const {submitreview} = require("../helper/submitreview");

    async function handlePayment(page) {
        console.log(chalk.yellow("Waiting for payment iframe..."));
        await page.waitForSelector("iframe", { visible: true, timeout: 60000 });

        const frame = await findPaymentFrame(page);

        console.log(chalk.green("Payment frame found"));
        console.log(chalk.blue("Frame URL:"), frame.url());

        // Card Number
        console.log(chalk.blue("card details fill start"));

        await frame.waitForSelector("#ccnumber", { visible: true,timeout:30000 });
await frame.click("#ccnumber", { clickCount: 3 });
        console.log(chalk.blue(" card number typing started."));    
    if(process.env.ENABLE_PAID_PLATFORM_ACCESS === "true"){
        await frame.type("#ccnumber", process.env.PAID_VISA_CARD_NUMBER,{delay:5});
        console.log("use paid visa card")    
    }
    else{
        await frame.type("#ccnumber", process.env.CARD_NUMBER,{delay:10});
        console.log("use normal card")

    }

        console.log(chalk.blue(" card number typing completed."));



        // Expiry
        await frame.waitForSelector("#cardExpiry", { visible: true,timeout:30000 });
await frame.click("#cardExpiry", { clickCount: 3 });
        console.log(chalk.blue(" card expiry typing started."));
        
        await frame.type("#cardExpiry", process.env.CARD_EXPIRY,{delay:5});
        console.log(chalk.blue(" card expiry typing completed."));



        // CVV
        await frame.waitForSelector("#cvv2", { visible: true,timeout:30000 });
        await frame.click("#cvv2", { clickCount: 3 });
        console.log(chalk.blue(" card cvv typing started."));
        await frame.type("#cvv2", process.env.CARD_CVV,{delay:5});
        console.log(chalk.blue(" card cvv typing completed."));

    await delay(1000);
        console.log(chalk.green("Card details filled"));


        if(process.env.ENABLE_PAID_PLATFORM_ACCESS === "true"){
      // logic for zipcode select & type
       await frame.waitForSelector("input[name ='zip']", { visible: true,timeout:30000 });
        await frame.click("input[name ='zip']", { clickCount: 3 });
        console.log(chalk.blue(" card zipcode typing started."));
        await frame.type("input[name ='zip']","21220",{delay:5});
await delay(process.env.COMMON_DELAY_ONCLICKS);
        console.log(chalk.blue(" card zipcode typing completed."));

        }



        // Submit card details
        const submitElement = await frame.$("#submit");
        if (submitElement) {
            await submitElement.click();
        } else {
            await page.waitForSelector("#submit", { visible: true });
            await page.click("#submit");
        }

        // click on continue to open dashboard
        await delay(process.env.COMMON_DELAY_ONCLICKS);

    if(process.env.ENABLE_FREE_PLATFORM_ACCESS != "true" && process.env.ENABLE_PAID_PLATFORM != "true" ){
        await page.waitForSelector("button.continue-btn", { visible: true,timeout:30000 });
        await page.click("button.continue-btn");
    }

        await delay(process.env.COMMON_DELAY_ONCLICKS);
        console.log(chalk.green("[successfull]"), "dashboard load successfull");

        await delay(process.env.COMMON_DELAY_ONCLICKS);

            await submitreview(page);
        
        console.log(chalk.magenta(" Payment Done"));
    }

    module.exports = { handlePayment };
