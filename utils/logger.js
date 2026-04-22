const chalk = require("chalk");

const logger = {
    info: (msg) => {
        console.log(chalk.blue.bold("INFO  ") + chalk.white(msg));
    },
    success: (msg) => {
        console.log(chalk.green.bold("SUCCESS ") + chalk.white(msg));
    },
    error: (msg, err = "") => {
        console.log(chalk.red.bold("ERROR ") + chalk.red(msg), err);
    },
    warn: (msg) => {
        console.log(chalk.yellow.bold("WARN  ") + chalk.yellow(msg));
    },
    step: (msg) => {
        console.log(chalk.cyan.bold("STEP  ") + chalk.cyan(msg));
    },
    data: (label, value) => {
        console.log(chalk.magenta.bold("DATA  ") + chalk.magenta(`${label}: `) + chalk.white(value));
    },
    process: (msg) => {
        console.log(chalk.gray.bold("PROC  ") + chalk.gray(msg));
    },
    divider: () => {
        console.log(chalk.gray("--------------------------------------------------"));
    },
    header: (msg) => {
        console.log("\n" + chalk.bgBlue.white.bold(` ${msg.toUpperCase()} `) + "\n");
    }
};

module.exports = logger;
