const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function startRecording(page) {
    // Ensure recording directory exists


    const dir = path.join(__dirname, '..', 'recordings');


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


    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW == "true") {
        const savePath = path.join(dir, `recording_discounted_full_flow_${fileNameTime}.mp4`);
        await recorder.start(savePath);
        console.log(chalk.blue(`[Recording] Started recording: ${savePath}`));
    }
    else if (process.env.ENABLE_PRO_ACCESS_FLOW == "true") {
        const savePath = path.join(dir, `recording_pro_access_flow_${fileNameTime}.mp4`);
        await recorder.start(savePath);
        console.log(chalk.blue(`[Recording] Started recording: ${savePath}`));
    }
    else if (process.env.ENABLE_STANDARD_FLOW == "true") {
        const savePath = path.join(dir, `recording_standard_flow_${fileNameTime}.mp4`);
        await recorder.start(savePath);
        console.log(chalk.blue(`[Recording] Started recording: ${savePath}`));
    }
    else if (process.env.ENABLE_PAID_PLATFORM_ACCESS == "true") {
        const savePath = path.join(dir, `recording_paid_platform_access_${fileNameTime}.mp4`);
        await recorder.start(savePath);
        console.log(chalk.blue(`[Recording] Started recording: ${savePath}`));
    }
    else if (process.env.ENABLE_FREE_PLATFORM_ACCESS == "true") {
        const savePath = path.join(dir, `recording_free_platform_access_${fileNameTime}.mp4`);
        await recorder.start(savePath);
        console.log(chalk.blue(`[Recording] Started recording: ${savePath}`));
    }
    else if (process.env.ENABLE_PAID_PLATFORM == "true") {
        const savePath = path.join(dir, `recording_paid_platform_${fileNameTime}.mp4`);
        await recorder.start(savePath);
        console.log(chalk.blue(`[Recording] Started recording: ${savePath}`));
    }

    return recorder;
}

async function stopRecording(recorder) {
    if (recorder) {
        try {
            await recorder.stop();
            console.log(chalk.gray("[Recording] Stopped recording video."));
        } catch (err) { }
    }
}

module.exports = {
    startRecording,
    stopRecording
};
