const fs = require('fs');

function clearUsersFile() {
    if (fs.existsSync("users.txt")) {
        fs.unlinkSync("users.txt");
        console.log("users.txt deleted");
    } else {
        console.log("users.txt does not exist");
    }
}

function appendUser(email) {
    const now = new Date();

    // Format: YYYY-MM-DD HH:mm:ss
    const user_datetime = now.toLocaleString();

    fs.appendFileSync(
        'users.txt',
        `user email:${email} | user_datetime:${user_datetime}\n`
    );
}

module.exports = { clearUsersFile, appendUser };
