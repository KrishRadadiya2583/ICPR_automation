function randomMobile() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function randomEmail() {
    const number = Math.floor(100000 + Math.random() * 900000);


    if(process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true") {
    return `sub_discounted_full_access-${number}@yopmail.com`;
    }
    else if(process.env.ENABLE_PRO_ACCESS_FLOW === "true"){
        return `sub_pro_access-${number}@yopmail.com`;
    }
    else if(process.env.ENABLE_STANDARD_FLOW === "true"){
        return `sub_standard-${number}@yopmail.com`;
    }
    else if(process.env.ENABLE_PAID_PLATFORM_ACCESS === "true"){
        return `paidvisa-${number}@yopmail.com`;
    }
    else{
        return `demouser-${number}@yopmail.com`;
    }

}

module.exports = { randomMobile, randomEmail };