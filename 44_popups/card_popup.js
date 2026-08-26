require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { launchBrowser } = require("../config/puppeteer");
const { cloudAccess } = require("../helper/cloud_access");
const { ensureAtHome } = require("../flows/navigation");
const { findPaymentFrame } = require("../core/frameHandler");

const TIMEOUT = Number(process.env.POPUP_TIMEOUT_MS || 60_000);
const SCREENSHOT_DIRECTORY = path.join(__dirname, "screenshots", "cardpopups");
const LANGUAGES = [
  "en", "cs", "de", "es", "el", "fr", "hu", "fi", "et", "hi", "yue", "th", "bn", "ms",
  "hr", "ko", "id", "ja", "sv", "it", "bg", "sr", "uk", "he", "sk", "da", "ar",
  "nl", "no", "pl", "zh", "pt", "ro", "sl", "tr", "pt-br", "vi", "bs", "tk", "zu",
  "ru", "lv", "lt", "fil",
];

const SELECTORS = {
  numberInput: [
    'input[inputmode="tel"]',
    'input[type="tel"]',
    'input[name*="phone" i]',
    'input[name*="mobile" i]',
  ],
  numberSubmit: [
    'button[type="submit"]',
    'input[type="submit"]',
    ".span-text",
    ".input-suffix",
  ],
  // Same selectors and typing approach used by helper/useremailtype.js.
  emailInput: ["#input"],
  emailSubmit: ["button.hl_cta_wrap"],
  paymentFrame: 'iframe#payment-form-iframe, iframe[name="payment-form-iframe"]',
};

function randomMobileNumber() {
  return `9${Math.floor(100_000_000 + Math.random() * 900_000_000)}`;
}

function commonEmail(number) {
  return `sub_discounted_full_access_${number}@yopmail.com`;
}

async function waitForAny(page, selectors, timeout = TIMEOUT) {
  const selector = await page.waitForFunction(
    (candidates) => candidates.find((candidate) => {
      const element = document.querySelector(candidate);
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.visibility !== "hidden" && style.display !== "none";
    }),
    { timeout },
    selectors,
  );

  return selector.jsonValue();
}

function languageUrl(currentUrl, language) {
  const url = new URL(currentUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length) pathParts[0] = language;
  else pathParts.push(language);

  url.pathname = `/${pathParts.join("/")}`;
  return url.toString();
}

async function enterNumberAndSubmit(page, mobileNumber) {
  const inputSelector = await waitForAny(page, SELECTORS.numberInput);
  await page.click(inputSelector, { clickCount: 3 });
  await page.type(inputSelector, mobileNumber, { delay: 50 });

  const submitSelector = await waitForAny(page, SELECTORS.numberSubmit);
  await page.click(submitSelector);
  console.log(`Submitted mobile number: ${mobileNumber}`);
}

async function enterEmailAndSubmit(page, email) {
  const inputSelector = await waitForAny(page, SELECTORS.emailInput);
  await page.click(inputSelector, { clickCount: 3 });
  await page.type(inputSelector, email, { delay: 50 });

  const submitSelector = await waitForAny(page, SELECTORS.emailSubmit);
  await page.click(submitSelector);
  console.log(`Submitted email: ${email}`);
}

async function waitForCardPopup(page) {
  console.log("Waiting for payment iframe...");
  await page.waitForSelector(SELECTORS.paymentFrame, {
    visible: true,
    timeout: TIMEOUT,
  });

  const paymentFrame = await findPaymentFrame(page);
  await paymentFrame.waitForSelector("#ccnumber", {
    visible: true,
    timeout: TIMEOUT,
  });
  console.log("Payment iframe and card form are fully visible.");
}

async function captureScreenshot(page, language) {
  const screenshotPath = path.join(
    SCREENSHOT_DIRECTORY,
    `card_popup_${language}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

async function submitLanguageAndCapture(page, baseUrl, language) {
  const targetUrl = languageUrl(baseUrl, language);
  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: TIMEOUT });
  }

  console.log(`Language base URL opened: ${page.url()}`);
  const mobileNumber = randomMobileNumber();
  await enterNumberAndSubmit(page, mobileNumber);
  await enterEmailAndSubmit(page, commonEmail(mobileNumber));
  console.log("Waiting 10 seconds after email submit...");
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  await waitForCardPopup(page);
  await captureScreenshot(page, language);
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
    const baseUrl = page.url();
    console.log(`Stored base URL: ${baseUrl}`);

    for (const language of LANGUAGES) {
      await submitLanguageAndCapture(page, baseUrl, language);
    }
  } catch (error) {
    console.error("Submitted-email popup automation failed:", error.message);
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
