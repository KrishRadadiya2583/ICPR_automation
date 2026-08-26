require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { launchBrowser } = require("../config/puppeteer");
const { cloudAccess } = require("../helper/cloud_access");
const { ensureAtHome } = require("../flows/navigation");
const { registerusers } = require("../flows/registration");

const TIMEOUT = Number(process.env.POPUP_TIMEOUT_MS || 60_000);
const SCREENSHOT_DIRECTORY = path.join(__dirname, "screenshots", "reportpopups");
const LANGUAGES = [
  "en", "cs", "de", "es", "el", "fr", "hu", "fi", "et", "hi", "yue", "th", "bn", "ms",
  "hr", "ko", "id", "ja", "sv", "it", "bg", "sr", "uk", "he", "sk", "da", "ar",
  "nl", "no", "pl", "zh", "pt", "ro", "sl", "tr", "pt-br", "vi", "bs", "tk", "zu",
  "ru", "lv", "lt", "fil",
];

function languageUrl(storedUrl, language) {
  const url = new URL(storedUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length) pathParts[0] = language;
  else pathParts.push(language);

  url.pathname = `/${pathParts.join("/")}`;
  return url.toString();
}

async function openLanguageAndCapture(page, storedUrl, language) {
  const targetUrl = languageUrl(storedUrl, language);

  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: TIMEOUT });
  }

  const screenshotPath = path.join(
    SCREENSHOT_DIRECTORY,
    `report_popup_${language}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Language URL opened: ${page.url()}`);
  console.log(`Screenshot saved: ${screenshotPath}`);
}

async function run() {
  const browser = await launchBrowser();
  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();
  page.setDefaultTimeout(TIMEOUT);
  page.setDefaultNavigationTimeout(TIMEOUT);

  await cloudAccess(page);
  browser.on("targetcreated", async (target) => {
    if (target.type() !== "page") return;

    try {
      const newPage = await target.page();
      if (newPage) await cloudAccess(newPage);
    } catch (error) {
      console.warn("Could not apply Cloudflare Access to new tab:", error.message);
    }
  });

  try {
    fs.mkdirSync(SCREENSHOT_DIRECTORY, { recursive: true });
    await ensureAtHome(page);

    // Register exactly one user with the project's existing registration flow.
    await registerusers(page);

    // This URL is captured only after registration completes. Every language
    // URL below is derived from this same value by changing only its language.
    const registeredUrl = page.url();
    console.log(`Stored post-registration URL: ${registeredUrl}`);

    for (const language of LANGUAGES) {
      await openLanguageAndCapture(page, registeredUrl, language);
    }
  } catch (error) {
    console.error("Report popup automation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (process.env.BROWSER_CLOSE_ON_COMPLETION === "true") {
      await browser.close();
    } else {
      console.log("Browser left open. Press Ctrl+C to stop the script.");
    }
  }
}

run();
