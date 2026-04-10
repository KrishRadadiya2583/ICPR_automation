const delay = require("../utils/delay");

async function reportEmailFetcher(page, email) {
    const yopmailPage = await page.browser().newPage();

    await yopmailPage.goto(`https://yopmail.com/en/?login=${email}`, {
        waitUntil: "domcontentloaded",
    });

    await delay(process.env.COMMON_DELAY_ONCLICKS);

    for (let attempt = 0; attempt < 25; attempt++) {
        console.log(`Attempt ${attempt + 1}`);

        await yopmailPage.mouse.move(
            100 + Math.random() * 200,
            200 + Math.random() * 200
        );
        await delay(2000 + Math.random() * 2000);

        try {
            await yopmailPage.click("#refresh");
        } catch (e) {
            console.log("Error clicking refresh:", e);
        }

        await delay(4000);

        const inboxHandle = await yopmailPage.$("#ifinbox");
        if (!inboxHandle) continue;

        const inboxFrame = await inboxHandle.contentFrame();
        if (!inboxFrame) continue;

        await inboxFrame.waitForSelector(".m", { timeout: 10000 }).catch(() => { });

        const emails = await inboxFrame.$$(".m");

        if (!emails.length) {
            console.log("No emails yet...");
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

                console.log("Email content:", content.slice(0, 100));

                // 🚨 CAPTCHA detection
                if (content.includes("CAPTCHA")) {
                    console.log("⚠️ CAPTCHA detected, waiting...");
                    await delay(15000);
                    continue;
                }

                // 🎯 Target email detection
                if (
                    content.toLowerCase().includes("infochecker") ||
                    content.toLowerCase().includes("view now")
                ) {
                    console.log("✅ Target email found");

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
                                console.log("🔍 Found 'View Now' button");

                                // scroll into view
                                await mailFrame.evaluate(el => {
                                    el.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                    });
                                }, link);

                                await delay(2000);

                                // click and detect new tab
                                const [newTarget] = await Promise.all([
                                    yopmailPage.browser().waitForTarget(
                                        target => target.opener() === yopmailPage.target(),
                                        { timeout: 10000 }
                                    ).catch(() => null),
                                    link.click()
                                ]);

                                if (newTarget) {
                                    const newPage = await newTarget.page();
                                    await newPage.bringToFront();
                                    console.log("Opened in new tab:", newPage.url());

                                    await yopmailPage.close();
                     
     

                                } else {
                                    console.log(" Clicked (same tab)");
                                }

                                return; // ✅ stop everything once clicked
                            }
                        }

                        console.log("❌ 'View Now' not found in this email");

                    } catch (err) {
                        console.log("Error finding button:", err);
                    }
                }

            } catch (err) {
                console.log("Error reading email, retrying...");
            }
        }

        await delay(5000);
    }
}

module.exports = { reportEmailFetcher };