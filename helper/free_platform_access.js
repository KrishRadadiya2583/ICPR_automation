const delay = require("../utils/delay");

async function free_platform_access(page) {
    await page.goBack();
    await delay(2000)

    await page.goBack();

    await delay(2000)

    await page.waitForSelector(".location__btn", { visible: true, timeout: 60000 })
    await delay(2000)
    await page.click(".location__btn", { clickCount: 10 })
}

module.exports = { free_platform_access };