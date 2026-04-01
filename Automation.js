const chalk = require("chalk");
const { ensureAtHome } = require("./flows/navigation");
const { registerusers } = require("./flows/registration");
const { generateReportsAndUnlock } = require("./flows/reports");
const { logout } = require("./flows/auth");
const { clearUsersFile } = require("./services/fileService");
const delay = require("./utils/delay");

async function runAutomation(page) {
    console.log(chalk.green("[START]"), "opning url in browser...");

    if (process.env.USER_REGISTRATION_COUNT > 1) {
        clearUsersFile();
        
        // Clear file before appending new users
        for (let i = 1; i <= process.env.USER_REGISTRATION_COUNT; i++) {
            try {
                await ensureAtHome(page);
                await registerusers(page);
                console.log(chalk.bgGreen("[success]"), "user " + i + " register successfully");
                
                if (i != process.env.USER_REGISTRATION_COUNT) {
                    await logout(page);
                }
              
                await delay(process.env.COMMON_DELAY_ONCLICKS);
            } catch (err) {
                console.error(chalk.red("[Error for user " + i + "]"), err.message);
            }
        }
    } else {
        try {
            clearUsersFile();
            // Clear file before appending new user
            await ensureAtHome(page);
            await registerusers(page);
            await generateReportsAndUnlock(page);
        } catch (err) {
            console.error(chalk.red("[Error]"), err.message);
        }
    }
}

module.exports = { runAutomation };
