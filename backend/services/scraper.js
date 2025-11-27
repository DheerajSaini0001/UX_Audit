const puppeteer = require('puppeteer');
const { runUxAudit } = require('../ux_audit/uxaudit');

const scrapePage = async (url, deviceType) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "false",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        if (deviceType === 'mobile') {
            // Emulate iPhone X
            await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
        } else {
            // Desktop
            await page.setViewport({ width: 1920, height: 1080 });
        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const title = await page.title();
        const htmlContent = await page.content();

        // Run UX Audit
        console.log('Running UX Audit...');
        const auditResults = await runUxAudit(page, deviceType);
        console.log('UX Audit complete.');

        return { title, htmlContent, auditResults };
    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = { scrapePage };
