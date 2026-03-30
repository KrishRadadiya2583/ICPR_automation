function randomMobile() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function randomEmail() {
    const randomStr = Math.random().toString(36).substring(2, 8);
    const number = Date.now().toString().slice(-4);

    return `sub_discounted_full_access-${number}-${randomStr}@yopmail.com`;;
}

module.exports = { randomMobile, randomEmail };