const logger = require("../utils/logger");
const delay = require("../utils/delay");
const { findPaymentFrame } = require("../core/frameHandler");
const { submitreview } = require("../helper/submitreview");

async function handlePayment(page) {
    logger.process("Waiting for payment iframe...");
    await page.waitForSelector("iframe", { visible: true, timeout: 60000 });

    const frame = await findPaymentFrame(page);

    await page.waitForSelector('iframe#solid-payment-form-iframe, iframe[name="solid-payment-form-iframe"]', { visible: true, timeout: 60000 });

    await delay(3000);

    logger.success("Payment frame found");

    logger.process("card details fill start");

    await frame.waitForSelector("#ccnumber", { visible: true, timeout: 30000 });
    await frame.click("#ccnumber", { clickCount: 3 });
    logger.process("card number typing started.");
    if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        await frame.type("#ccnumber", process.env.PAID_VISA_CARD_NUMBER, { delay: 5 });
        logger.info("using paid visa card")
    }
    else {
        await frame.type("#ccnumber", process.env.CARD_NUMBER, { delay: 10 });
        logger.info("using normal card")
    }

    logger.process("card number typing completed.");

    // Expiry
    await frame.waitForSelector("#cardExpiry", { visible: true, timeout: 30000 });
    await frame.click("#cardExpiry");
    logger.process("card expiry typing started.");

    await frame.type("#cardExpiry", process.env.CARD_EXPIRY, { delay: 5 });
    logger.process("card expiry typing completed.");

    // CVV
    await frame.waitForSelector("#cvv2", { visible: true, timeout: 30000 });
    await frame.click("#cvv2");
    logger.process("card cvv typing started.");
    await frame.type("#cvv2", process.env.CARD_CVV, { delay: 5 });
    logger.process("card cvv typing completed.");

    await delay(1000);
    logger.success("Card details filled");


    if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        // logic for zipcode select & type
        await frame.waitForSelector("input[name ='zip']", { visible: true, timeout: 30000 });
        await frame.click("input[name ='zip']");
        logger.process("card zipcode typing started.");
        await frame.type("input[name ='zip']", "21220", { delay: 5 });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        logger.process("card zipcode typing completed.");
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

    if (process.env.ENABLE_FREE_PLATFORM_ACCESS != "true" && process.env.ENABLE_PAID_PLATFORM != "true") {
        await page.waitForSelector("button.continue-btn", { visible: true, timeout: 30000 });
        await page.click("button.continue-btn");
    }

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    logger.success("dashboard load successfull");

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    await submitreview(page);

    logger.success("Payment Done");
}

module.exports = { handlePayment };
