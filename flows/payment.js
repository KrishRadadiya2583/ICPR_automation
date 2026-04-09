const chalk = require("chalk");
const delay = require("../utils/delay");
const { findPaymentFrame } = require("../core/frameHandler");

async function handlePayment(page) {
    console.log(chalk.yellow("Waiting for payment iframe..."));
    await page.waitForSelector("iframe", { visible: true, timeout: 60000 });

    const frame = await findPaymentFrame(page);

    console.log(chalk.green("Payment frame found"));
    console.log(chalk.blue("Frame URL:"), frame.url());

    // Card Number
    console.log(chalk.blue("card details fill start"));

    await delay(100);
    await frame.waitForSelector("#ccnumber", { visible: true, clickCount: 10 });

    console.log(chalk.blue(" card number typing started."));
    
if(process.env.ENABLE_PAID_PLATFORM_ACCESS === "true"){
    await frame.type("#ccnumber", process.env.PAID_VISA_CARD_NUMBER);
}
else{
    await frame.type("#ccnumber", process.env.CARD_NUMBER);
}
    console.log(chalk.blue(" card number typing completed."));



    // Expiry
    await frame.waitForSelector("#cardExpiry", { visible: true, clickCount: 10 });

    console.log(chalk.blue(" card expiry typing started."));
    await frame.type("#cardExpiry", process.env.CARD_EXPIRY);
    console.log(chalk.blue(" card expiry typing completed."));



    // CVV
    await frame.waitForSelector("#cvv2", { visible: true, clickCount: 10 });
    console.log(chalk.blue(" card cvv typing started."));
    await frame.type("#cvv2", process.env.CARD_CVV);
    console.log(chalk.blue(" card cvv typing completed."));

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    console.log(chalk.green("Card details filled"));


    if(process.env.ENABLE_PAID_PLATFORM_ACCESS === "true"){
    //      await frame.waitForSelector("#cvv2", { visible: true, clickCount: 10 });
    // console.log(chalk.blue(" card cvv typing started."));
    // await frame.type("#cvv2", process.env.CARD_CVV);
    // console.log(chalk.blue(" card cvv typing completed."));
        

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

if(process.env.ENABLE_FREE_PLATFORM_ACCESS != "true"){
    await page.waitForSelector("button.continue-btn", { visible: true });
    await page.click("button.continue-btn");
}

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    console.log(chalk.green("[successfull]"), "dashboard load successfull");

    // submit review default 4 star
    await page.waitForSelector(".ant-rate-star-second", { visible: true });
    await page.click('.ant-rate-star:nth-child(4)');

    console.log(chalk.bgBlue("review submit success"));

    //  close review modal
    await page.waitForSelector(".ant-modal-close", { visible: true });
    await page.click('.ant-modal-close');

    console.log(chalk.bgBlue("review close button click success"));

    // close report modal
    await page.waitForSelector(".ant-modal-close-x", { visible: true });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click(".ant-modal-close-x");

    console.log(chalk.bgYellow("report close button click success"));
    console.log(chalk.magenta(" Payment Done"));
}

module.exports = { handlePayment };
