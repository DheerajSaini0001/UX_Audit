const puppeteer = require('puppeteer');
const { runUxAudit } = require('./backend/ux_audit/uxaudit');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Mock HTML content with specific navigation depth
    // 3 links pass (depth <= 3), 1 link fails (depth 4)
    // Expected Score: 75%
    const htmlContent = `
    <html>
        <body>
            <nav>
                <!-- Links will be injected via JS to ensure absolute URLs match mocked hostname -->
            </nav>
        </body>
    </html>
    `;

    await page.setContent(htmlContent);

    // Mock window.location.hostname for the test
    await page.evaluate(() => {
        Object.defineProperty(window, 'location', {
            value: {
                hostname: 'example.com',
                href: 'http://example.com/',
                origin: 'http://example.com'
            },
            writable: true
        });
    });

    // Update links to be absolute to match the mocked hostname
    await page.evaluate(() => {
        const nav = document.querySelector('nav');
        // Using string concatenation to avoid backtick issues in the tool call
        nav.innerHTML = '<a href="http://example.com/home">Home</a>' +
            '<a href="http://example.com/about">About</a>' +
            '<a href="http://example.com/products/software/tools">Tools</a>' +
            '<a href="http://example.com/products/software/tools/v1">Version 1</a>';
    });

    console.log('Running Audit...');
    try {
        const results = await runUxAudit(page, 'desktop');
        console.log('Navigation Depth Result:', JSON.stringify(results.navigationDepth, null, 2));
    } catch (error) {
        console.error('Error running audit:', error);
    }

    await browser.close();
})();
