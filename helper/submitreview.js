const logger = require("../utils/logger");
const delay = require("../utils/delay");

async function submitreview(page) {

    // submit review default 4 star
    await page.waitForSelector(".ant-rate-star-second", { visible: true });
    await page.click('.ant-rate-star:nth-child(4)');

    logger.success("review submit success");

    //  close review modal
    await page.waitForSelector(".ant-modal-close", { visible: true });
    await page.click('.ant-modal-close');

    logger.success("review close button click success");

    // close report modal
    await page.waitForSelector(".ant-modal-close-x", { visible: true });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click(".ant-modal-close-x");

    logger.success("report close button click success");
}

module.exports = { submitreview };