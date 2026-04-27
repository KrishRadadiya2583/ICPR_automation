const logger = require("../utils/logger");
const delay = require("../utils/delay");
const { handlePayment } = require("./payment");
const { cloudAccess } = require("../helper/cloud_access");

async function reportEmailFetcher(page, email) {
    const yopmailPage = await page.browser().newPage();

    await yopmailPage.goto(`https://yopmail.com/en/?login=${email}`, {
        waitUntil: "domcontentloaded",
    });

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.close();


    for (let attempt = 0; attempt < 25; attempt++) {
        logger.step(`Checking Report Email (Attempt ${attempt + 1})`);

        await yopmailPage.mouse.move(
            100 + Math.random() * 200,
            200 + Math.random() * 200
        );
        await delay(2000 + Math.random() * 2000);

        try {
            await yopmailPage.click("#refresh");
        } catch (e) {
            logger.error("Error clicking refresh", e);
        }

        await delay(4000);

        const inboxHandle = await yopmailPage.$("#ifinbox");
        if (!inboxHandle) continue;

        const inboxFrame = await inboxHandle.contentFrame();
        if (!inboxFrame) continue;

        await inboxFrame.waitForSelector(".m", { timeout: 10000 }).catch(() => { });

        const emails = await inboxFrame.$$(".m");

        if (!emails.length) {
            logger.process("No emails yet...");
            continue;
        }

        for (let i = 0; i < emails.length; i++) {
            try {
                const freshEmails = await inboxFrame.$$(".m");
                if (!freshEmails[i]) continue;

                await freshEmails[i].click();
                await delay(3000);

                const mailHandle = await yopmailPage.$("#ifmail");
                if (!mailHandle) continue;

                const mailFrame = await mailHandle.contentFrame();
                if (!mailFrame) continue;

                await delay(2000);

                const content = await mailFrame.evaluate(() =>
                    document.body.innerText.trim()
                );

                logger.info("Email content preview: " + content.slice(0, 50).replace(/\n/g, ' '));

                // CAPTCHA detection
                if (content.includes("CAPTCHA")) {
                    logger.warn("CAPTCHA detected, waiting...");
                    await delay(15000);
                    continue;
                }

                // Target email detection
                if (
                    content.toLowerCase().includes("infochecker") ||
                    content.toLowerCase().includes("view now")
                ) {
                    logger.success("Target email found");

                    try {
                        // wait for links inside email
                        await mailFrame.waitForSelector("a", { timeout: 8000 });

                        const links = await mailFrame.$$("a");

                        for (let link of links) {
                            const text = await mailFrame.evaluate(
                                el => el.innerText,
                                link
                            );

                            if (text && text.toLowerCase().includes("view now")) {
                                logger.process("Found 'View Now' button");

                                // scroll into view
                                await mailFrame.evaluate(el => {
                                    el.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                    });
                                }, link);

                                await delay(2000);

                                // Instead of clicking, get the href and open a new page manually
                                const targetUrl = await mailFrame.evaluate(el => el.href, link);
                                logger.info(`Target URL: ${targetUrl}`);

                                const browser = yopmailPage.browser();
                                await yopmailPage.close();

                                {
                                    const page = await browser.newPage();
                                    
                                    // Now set headers via cloudAccess
                                    await cloudAccess(page);
                                    
                                    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });

                                    await delay(process.env.COMMON_DELAY_ONCLICKS);

                                    await page.waitForSelector(".location__button_wrap.blurred .unlock__btn_info.user__dark .npd__unlock_icon");
                                    logger.success("Location button found")

                                    await delay(4000)

                                    await page.evaluate(() => {
                                        const el = document.querySelector(".location__button_wrap.blurred .npd__unlock_icon");
                                        if (el) el.scrollIntoView({ block: "center" });
                                    });
                                    await delay(process.env.COMMON_DELAY_ONCLICKS)
                                    await page.click(".location__button_wrap.blurred .npd__unlock_icon");
                                    await delay(process.env.COMMON_DELAY_ONCLICKS);

                                    await delay(2000)
                                    await delay(process.env.COMMON_DELAY_ONCLICKS);
                                    await handlePayment(page);
                                    await delay(process.env.COMMON_DELAY_ONCLICKS);
                                }

                                return; // stop everything once clicked
                            }
                        }

                        logger.warn("'View Now' not found in this email");

                    } catch (err) {
                        logger.error("Error finding button", err);
                    }
                }

            } catch (err) {
                logger.error("Error reading email, retrying...");
            }
        }

        await delay(5000);
    }
}

module.exports = { reportEmailFetcher };