const chalk = require("chalk");
const delay = require("../utils/delay");
const { randomMobile } = require("../utils/generator");


async function downloadPDF(page) {
  try {
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.waitForSelector(`a[data-title="PDF"]`, { visible: true, timeout: 30000 });
    await delay(2000);
    await page.click(`a[data-title="PDF"]`, { delay: 10, clickCount: 10 });
    console.log(chalk.green("[PDF]"), "Clicked on PDF subscription link");

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    await page.waitForSelector('#site_Privacy', { visible: true, timeout: 30000 });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click('#site_Privacy');

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    await page.waitForSelector('button[type="submit"]', { visible: true, timeout: 30000 });
    await delay(process.env.CLICK_DELAY_MS);
    await page.click('button[type="submit"]');


  } catch (err) {
    console.log(chalk.red("[PDF]"), "Failed to download PDF:", err);
  }
}


module.exports = { downloadPDF };
