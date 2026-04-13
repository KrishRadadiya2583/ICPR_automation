const chalk = require("chalk");
const delay = require("../utils/delay");

async function submitreview(page) {

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
}

module.exports = { submitreview };