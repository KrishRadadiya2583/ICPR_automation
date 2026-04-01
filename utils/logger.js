const chalk = require("chalk");

const logger = {
    info: (...args) => console.log(chalk.blue(...args)),
    success: (...args) => console.log(chalk.green(...args)),
    error: (...args) => console.error(chalk.red(...args)),
    warn: (...args) => console.log(chalk.yellow(...args)),
    log: (...args) => console.log(...args)
};

module.exports = logger;
