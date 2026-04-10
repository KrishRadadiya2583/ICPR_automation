const delay = require("../utils/delay");

async function findPaymentFrame(page) {
    const allowed = ["stripe", "payment", "checkout"];

    const start = Date.now();
    while (Date.now() - start < 60000) {
        const frame = page.frames().find((f) => {
            const u = f.url();
            if (!u) return false;
            return allowed.some((token) => u.includes(token));
        });

        if (frame) return frame;
        await delay(500);
    }

    throw new Error("Payment iframe not found");
}




module.exports = { findPaymentFrame};
