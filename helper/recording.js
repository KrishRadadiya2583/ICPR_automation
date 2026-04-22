const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');
const logger = require("../utils/logger");

async function startRecording(page) {
    // Determine recording directory
    let dir;
    if (process.env.RECORDING_SAVE_PATH && process.env.RECORDING_SAVE_PATH.trim() !== "") {
        dir = process.env.RECORDING_SAVE_PATH;
    } else {
        dir = path.join(__dirname, '..', 'recordings');
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize and start screen recorder
    const recorder = new PuppeteerScreenRecorder(page, {
        followNewTab: true,
        fps: 25,
        videoFrame: {
            width: 1920,
            height: 1080
        }
    });

    const now = new Date();
    const indianTime = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    // Convert to filename-safe format
    const fileNameTime = indianTime
        .replace(/\//g, "-")
        .replace(/, /g, "_")
        .replace(/:/g, "-");

    let flowName = "automation";
    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW == "true") flowName = "discounted_full_flow";
    else if (process.env.ENABLE_PRO_ACCESS_FLOW == "true") flowName = "pro_access_flow";
    else if (process.env.ENABLE_STANDARD_FLOW == "true") flowName = "standard_flow";
    else if (process.env.ENABLE_PAID_PLATFORM_ACCESS == "true") flowName = "paid_platform_access";
    else if (process.env.ENABLE_FREE_PLATFORM_ACCESS == "true") flowName = "free_platform_access";
    else if (process.env.ENABLE_PAID_PLATFORM == "true") flowName = "paid_platform";

    const savePath = path.join(dir, `recording_${flowName}_${fileNameTime}.mp4`);
    await recorder.start(savePath);
    logger.info(`Started recording: ${savePath}`);

    return recorder;
}

async function stopRecording(recorder) {
    if (recorder) {
        try {
            await recorder.stop();
            logger.process("Stopped recording video.");
        } catch (err) { }
    }
}

module.exports = {
    startRecording,
    stopRecording
};
