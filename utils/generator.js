function randomMobile() {
    return "9" + Math.floor(100000000 + Math.random() * 900000000);
}

function randomEmail() {
    return `user${Date.now()}@yopmail.com`;
}

module.exports = { randomMobile, randomEmail };