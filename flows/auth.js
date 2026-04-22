const logger = require("../utils/logger");
const delay = require("../utils/delay");

async function logout(page) {
    await page.waitForSelector(".ant-dropdown-trigger", { visible: true });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click(".ant-dropdown-trigger");

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    const inputs = await page.$$('.mobile_menu_option');
    await inputs[5].click();

    await page.waitForNavigation({ waitUntil: 'load' });

    logger.success("Logout success");
}

module.exports = { logout };
