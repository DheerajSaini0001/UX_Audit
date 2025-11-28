const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
const cloudConfig = {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
};

if (!cloudConfig.cloud_name || !cloudConfig.api_key || !cloudConfig.api_secret) {
    console.error("❌ Cloudinary credentials missing in .env file!");
    console.error("Current config:", {
        cloud_name: cloudConfig.cloud_name ? 'Set' : 'Missing',
        api_key: cloudConfig.api_key ? 'Set' : 'Missing',
        api_secret: cloudConfig.api_secret ? 'Set' : 'Missing'
    });
}

cloudinary.config(cloudConfig);

async function captureScreenshot(url, deviceType) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        let width, height, isMobile;

        if (deviceType === 'mobile') {
            width = 375;
            height = 812;
            isMobile = true;
            await page.setViewport({ width, height, isMobile, deviceScaleFactor: 2 });
        } else {
            width = 1920;
            height = 1080;
            isMobile = false;
            await page.setViewport({ width, height });
        }

        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        const timestamp = Date.now();
        const filepath = `screenshot-${deviceType}-${timestamp}.png`;

        // Save screenshot to local file
        await page.screenshot({
            path: filepath,
            fullPage: false
        });

        await browser.close();
        browser = null;

        console.log(`📸 ${deviceType} screenshot saved locally:`, filepath);

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(filepath, {
            folder: "ux_audit_screenshots",
            public_id: `screenshot_${deviceType}_${timestamp}`
        });

        console.log("☁️ Uploaded to Cloudinary:");
        console.log(uploadResponse.secure_url);

        // Clean up local file
        const fs = require('fs');
        fs.unlinkSync(filepath);

        return uploadResponse.secure_url;
    } catch (error) {
        console.error("Screenshot error:", error);
        if (browser) await browser.close();
        return null;
    }
}

module.exports = { captureScreenshot };
