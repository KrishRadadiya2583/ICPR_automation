function randomMobile() {
    const firstDigit = Math.floor(Math.random() * 4) + 6; // 6–9
    const remaining = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0');

    return firstDigit + remaining;
}

function randomEmail() {
    const number = Math.floor(100000 + Math.random() * 900000);


    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true") {
        return `sub_discounted_full_access_${number}@yopmail.com`;
    }
    else if (process.env.ENABLE_PRO_ACCESS_FLOW === "true") {
        return `sub_pro_access_${number}@yopmail.com`;
    }
    else if (process.env.ENABLE_STANDARD_FLOW === "true") {
        return `sub_standard_${number}@yopmail.com`;
    }
    else if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        return `paid_visa_${number}@yopmail.com`;
    }
    else if (process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        return `free_platform_access_${number}@yopmail.com`;
    }
    else if (process.env.ENABLE_PAID_PLATFORM === "true") {
        return `paid_platform_${number}@yopmail.com`;
    }
    else {
        return `demouser_${number}@yopmail.com`;
    }

}

module.exports = { randomMobile, randomEmail };