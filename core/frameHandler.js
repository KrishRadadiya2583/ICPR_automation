const delay = require("../utils/delay");



async function findPaymentFrame(page) {
    const selector = 'iframe#solid-payment-form-iframe, iframe[name="solid-payment-form-iframe"]';

    const start = Date.now();

    while (Date.now() - start < 60000) {
        const elementHandle = await page.$(selector);

        if (elementHandle) {
            const frame = await elementHandle.contentFrame();
            if (frame) return frame;
        }

        await delay(500);
    }

    throw new Error("Payment iframe not found");
}

module.exports = { findPaymentFrame };