
const logger = require("../utils/logger");
const { handlePayment } = require("./payment");
const { appendUser } = require("../services/fileService");
const { generateHTML } = require("./htmlgenerator");
const { fetchPassword } = require("./yopmailpasswordfetcher");
const delay = require("../utils/delay");
const { reportEmailFetcher } = require("./reportemailfetcher");
const { searchmobileno } = require("../helper/searchmobileno");
const { useremailtype } = require("../helper/useremailtype");
const { free_platform_access } = require("../helper/free_platform_access");

const users = [];
async function registerusers(page) {

    // mobil number search & submit

    const mobile = await searchmobileno(page);

    logger.data("Mobile typed", mobile)

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    // email type & submit

    const email = await useremailtype(page);

    await delay(process.env.COMMON_DELAY_ONCLICKS)


    // free platform access

    if (process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        await delay(4000)

        await free_platform_access(page);

        logger.success("Free platform access successful");

        await delay(4000)

    }



    logger.process("Waiting for payment page...");


    logger.success("User register successful");

    if (process.env.ENABLE_PAID_PLATFORM === "true") {

        await delay(10000)


        await reportEmailFetcher(page, email);

        logger.success("report email fetch success & open report")

        await delay(5000)
        logger.process("looking for 'See Now' button")


    }

    if (process.env.ENABLE_PAID_PLATFORM != "true") {
        await handlePayment(page);
        await delay(process.env.COMMON_DELAY_ONCLICKS);

    }




    if (process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === "true") {
        logger.step("Fetching password for " + email + " STARTED");

        await delay(process.env.COMMON_DELAY_ONCLICKS); // wait for file write
        const result = await fetchPassword(page, email);

        await delay(process.env.COMMON_DELAY_ONCLICKS);

        logger.step("Fetching password for " + email + " COMPLETED");
        logger.data("Result", result);

        users.push({ email: email, password: result });

        await delay(1000)


        if (users.length == parseInt(process.env.USER_REGISTRATION_COUNT)) {
            logger.process("Generating HTML report for all users...");
            logger.data("Users to include in report", users.length);
            const htmlFilePath = await generateHTML(users);

            if (process.env.OPEN_HTML_PAGES === "true") {
                logger.process("Opening HTML page...");
                try {
                    const open = (await import('open')).default;
                    await open(htmlFilePath);
                } catch (err) {
                    logger.error("Failed to open HTML page", err);
                }
            }
        }

    }


    appendUser(email);
}

module.exports = { registerusers };
