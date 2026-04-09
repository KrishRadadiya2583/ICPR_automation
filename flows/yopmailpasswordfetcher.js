const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchPassword(page, email) {

  const yopmailPage = await page.browser().newPage();

  await yopmailPage.goto(`https://yopmail.com/en/?login=${email}`, {
    waitUntil: "domcontentloaded",
  });

  let lastMailContent = "";

  for (let attempt = 0; attempt < 25; attempt++) {
    console.log(`Attempt ${attempt + 1}`);

    await yopmailPage.mouse.move(
      100 + Math.random() * 200,
      200 + Math.random() * 200
    );
    await delay(2000 + Math.random() * 2000);


    try {
      await yopmailPage.click("#refresh");
    } catch (e) { }

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

        if (!content || content === lastMailContent) continue;
        lastMailContent = content;

        // 🎯 Target email detection
        if (
          content.includes("Account Created") &&
          content.includes("Infochecker.com") &&
          content.toLowerCase().includes("password")
        ) {
          console.log("✅ Target email found");

          const lines = content.split("\n").map((l) => l.trim());

          let password = null;

          for (let j = 0; j < lines.length; j++) {
            if (lines[j].toLowerCase().includes("password")) {
              password = lines[j + 1]?.trim();
              break;
            }
          }

          if (password) {
            console.log("✅ Password:", password);
            await yopmailPage.close(); // 👉 close only tab
            return password;
          }
        }
      } catch (err) {
        console.log("Error reading email, retrying...");
      }
    }

    await delay(5000);
  }

  await yopmailPage.close();
  return null;
}

module.exports = { fetchPassword };