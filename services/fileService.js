const fs = require('fs');


function appendUser(email) {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).formatToParts(now);

    const get = (type) => parts.find(p => p.type === type).value;

    const formattedDate = `${get("year")}-${get("month")}-${get("day")}_${get("hour")}-${get("minute")}-${get("second")}`;

    const fileName = `users-${formattedDate}.txt`;

    fs.appendFileSync(fileName, `${email}\n`);
}
module.exports = { appendUser };
