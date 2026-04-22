const logger = require("../utils/logger");
const delay = require("../utils/delay");
const { randomMobile } = require("../utils/generator");

async function generateReportsAndUnlock(page) {
    for (let i = 1; i <= process.env.REPORT_COUNT; i++) {
        if (process.env.ENABLE_CREATE_REPORT != "true") {
            logger.warn("report generation skipped");
            break;
        }
        else {
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.waitForSelector('a[data-title="Search other Number"]', { visible: true, timeout: 30000 });
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.click('a[data-title="Search other Number"]');

            logger.process("generate new report button click success");

            // input number for new report
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.waitForSelector('.ant-input-outlined.input-form.form-control', { visible: true });
            await delay(process.env.COMMON_DELAY_ONCLICKS);

            const inputs = await page.$$('.ant-input-outlined.input-form.form-control');
            await inputs[1].type(randomMobile(), { delay: 50 }); // second input

            logger.process("number enter success");

            // click on submit
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.waitForSelector("#btnSubmit", { visible: true });
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.click("#btnSubmit");

            logger.process("submit button click success");

            await page.waitForSelector('a[data-title="Search other Number"]', { visible: true, timeout: 60000 });
            logger.success("report " + i + " generate  successfull");
            await delay(500);
        }
    }

    if (process.env.UNLOCK_REPORT == "true") {
        // unlock latest report 
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.waitForSelector(".UnlockFullReport", { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(".UnlockFullReport");

        // again click on unlock report
        await page.waitForSelector(".vc_btn3-inline", { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(".vc_btn3-inline");

        // Play sound for unlock
        process.stdout.write('\x07');

        logger.success("unlock latest report success");

        // Always open the report
        logger.success("report open successfull");

        // close info page
        await page.waitForSelector(".accuracy__transparent_btn", { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(".accuracy__transparent_btn");

        logger.process("info page close success");

        // view report
        await page.waitForSelector(".report__popup_pay_btn", { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(".report__popup_pay_btn");

        logger.success("view report success");
    }
}

module.exports = { generateReportsAndUnlock };
