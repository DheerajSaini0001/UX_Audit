const puppeteer = require('puppeteer');

// Helper to calculate Flesch Reading Ease
function calculateFleschScore(text) {
    if (!text) return 0;
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = text.split(/[aeiouy]+/).length; // Rough approximation

    if (sentences === 0 || words === 0) return 0;

    // Formula: 206.835 - 1.015(total words / total sentences) - 84.6(total syllables / total words)
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.min(100, Math.max(0, score)); // Clamp between 0 and 100
}

async function runUxAudit(page, deviceType) {
    const auditResults = {
        cls: { score: 0, status: 'pass', details: '' },
        tapTargets: { score: 0, status: 'pass', details: [] },
        textSize: { score: 0, status: 'pass', details: [] },
        viewport: { score: 0, status: 'pass', details: '' },
        horizontalScroll: { score: 0, status: 'pass', details: '' },
        stickyHeader: { score: 0, status: 'pass', details: '' },
        readability: { score: 0, status: 'pass', details: '' },
        overallScore: 0,
    };

    // 1. Layout Shifts (CLS)
    // Puppeteer doesn't give direct CLS easily without a trace, but we can try to get it from performance metrics if available, 
    // or use a script to observe LayoutShift entries.
    const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
            let cumulativeLayoutShift = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cumulativeLayoutShift += entry.value;
                    }
                }
            });
            observer.observe({ type: 'layout-shift', buffered: true });

            // Wait a bit to capture shifts (simulated)
            setTimeout(() => {
                resolve(cumulativeLayoutShift);
            }, 1000);
        });
    });

    const clsLimit = deviceType === 'mobile' ? 0.15 : 0.10;
    auditResults.cls.score = cls;
    auditResults.cls.status = cls <= clsLimit ? 'pass' : 'fail';
    auditResults.cls.details = `CLS is ${cls.toFixed(4)}. Limit is ${clsLimit}.`;

    // 2. Tap Target Size
    const tapTargets = await page.evaluate((deviceType) => {
        const minSize = deviceType === 'mobile' ? 48 : 32;
        const clickableElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
        const issues = [];

        clickableElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { // Visible
                if (rect.width < minSize || rect.height < minSize) {
                    issues.push({
                        tag: el.tagName,
                        text: el.innerText ? el.innerText.substring(0, 20) : el.id || el.className,
                        width: rect.width,
                        height: rect.height
                    });
                }
            }
        });
        return issues;
    }, deviceType);

    auditResults.tapTargets.status = tapTargets.length === 0 ? 'pass' : 'fail';
    auditResults.tapTargets.details = tapTargets;
    auditResults.tapTargets.score = Math.max(0, 100 - (tapTargets.length * 5)); // Deduct points for issues

    // 3. Text Readability Size
    const textIssues = await page.evaluate((deviceType) => {
        const minSize = deviceType === 'mobile' ? 16 : 14;
        const textElements = Array.from(document.querySelectorAll('p, span, div, li, a'));
        const issues = [];

        textElements.forEach(el => {
            // Check if it has direct text content
            const hasText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
            if (hasText) {
                const style = window.getComputedStyle(el);
                const fontSize = parseFloat(style.fontSize);
                if (fontSize < minSize) {
                    issues.push({
                        tag: el.tagName,
                        text: el.innerText ? el.innerText.substring(0, 20) : '',
                        fontSize: fontSize
                    });
                }
            }
        });
        return issues.slice(0, 20); // Limit to top 20 to save space
    }, deviceType);

    auditResults.textSize.status = textIssues.length === 0 ? 'pass' : 'fail';
    auditResults.textSize.details = textIssues;

    // 4. Viewport Meta Tag (Mobile only)
    if (deviceType === 'mobile') {
        const viewportMeta = await page.$('meta[name="viewport"]');
        if (viewportMeta) {
            const content = await page.evaluate(el => el.getAttribute('content'), viewportMeta);
            if (content.includes('width=device-width') && content.includes('initial-scale=1')) {
                auditResults.viewport.status = 'pass';
                auditResults.viewport.details = 'Viewport meta tag is correct.';
            } else {
                auditResults.viewport.status = 'fail';
                auditResults.viewport.details = `Viewport meta tag found but content is: ${content}`;
            }
        } else {
            auditResults.viewport.status = 'fail';
            auditResults.viewport.details = 'Viewport meta tag missing.';
        }
    } else {
        auditResults.viewport.status = 'pass';
        auditResults.viewport.details = 'Not required for desktop.';
    }

    // 6. Horizontal Scroll Issues
    // Check at current viewport
    const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Also check specific breakpoints if mobile
    let scrollIssues = [];
    if (deviceType === 'mobile') {
        const breakpoints = [320, 375, 414, 480];
        for (const width of breakpoints) {
            await page.setViewport({ width, height: 800, isMobile: true });
            const scroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
            if (scroll) scrollIssues.push(`${width}px`);
        }
        // Reset viewport
        await page.setViewport({ width: 375, height: 812, isMobile: true });
    }

    if (hasHorizontalScroll || scrollIssues.length > 0) {
        auditResults.horizontalScroll.status = 'fail';
        auditResults.horizontalScroll.details = `Horizontal scroll detected at: ${hasHorizontalScroll ? 'Current Viewport' : ''} ${scrollIssues.join(', ')}`;
    } else {
        auditResults.horizontalScroll.details = 'No horizontal scroll detected.';
    }

    // 7. Sticky Header
    const headerCheck = await page.evaluate((deviceType) => {
        const headers = Array.from(document.querySelectorAll('header, .header, [class*="header"]'));
        const stickyHeaders = headers.filter(h => {
            const style = window.getComputedStyle(h);
            return style.position === 'fixed' || style.position === 'sticky';
        });

        if (stickyHeaders.length === 0) return { status: 'pass', height: 0 };

        const maxLimit = deviceType === 'mobile' ? 64 : 100;
        let maxH = 0;
        for (const h of stickyHeaders) {
            const rect = h.getBoundingClientRect();
            if (rect.height > maxH) maxH = rect.height;
        }

        return {
            status: maxH <= maxLimit ? 'pass' : 'fail',
            height: maxH,
            limit: maxLimit
        };
    }, deviceType);

    auditResults.stickyHeader.status = headerCheck.status;
    auditResults.stickyHeader.details = `Sticky header height: ${headerCheck.height}px. Limit: ${headerCheck.limit}px.`;

    // 9. Readability Score
    const textContent = await page.evaluate(() => document.body.innerText);
    const fleschScore = calculateFleschScore(textContent);

    let readabilityLimitMin = deviceType === 'mobile' ? 45 : 50; // Using Article limits as baseline

    auditResults.readability.score = fleschScore;
    auditResults.readability.status = fleschScore >= readabilityLimitMin ? 'pass' : 'fail';
    auditResults.readability.details = `Flesch Reading Ease: ${fleschScore.toFixed(2)}. Target > ${readabilityLimitMin}.`;

    // 10. Navigation Depth (≤3 clicks to key pages)
    const navDepth = await page.evaluate(() => {
        // 1. Find navigation elements
        const navElements = Array.from(document.querySelectorAll('nav, header, [role="navigation"]'));
        let links = [];

        if (navElements.length > 0) {
            navElements.forEach(nav => {
                const navLinks = Array.from(nav.querySelectorAll('a[href]'));
                links = links.concat(navLinks);
            });
        } else {
            // Fallback: check all links if no explicit nav found (less ideal but safer)
            links = Array.from(document.querySelectorAll('a[href]'));
        }

        // Filter for internal links only
        const internalLinks = links.filter(link => {
            return link.hostname === window.location.hostname;
        });

        if (internalLinks.length === 0) return { score: 100, details: 'No internal navigation links found.' };

        // Calculate depth
        let shallowLinksCount = 0;
        const totalLinks = internalLinks.length;
        const linkDetails = [];

        internalLinks.forEach(link => {
            const path = link.pathname;
            // Remove leading/trailing slashes and split
            const segments = path.replace(/^\/|\/$/g, '').split('/').filter(s => s.length > 0);
            const depth = segments.length;

            if (depth <= 3) {
                shallowLinksCount++;
            }

            linkDetails.push({
                text: link.innerText.substring(0, 30) || 'No Text',
                href: path,
                depth: depth
            });
        });

        const percentage = (shallowLinksCount / totalLinks) * 100;
        return {
            score: percentage,
            details: `${shallowLinksCount} out of ${totalLinks} navigation links are ≤3 clicks deep (${percentage.toFixed(1)}%).`,
            links: linkDetails
        };
    });

    auditResults.navigationDepth = {
        score: navDepth.score,
        status: navDepth.score >= 80 ? 'pass' : 'fail', // Threshold: 80% of links should be shallow
        details: navDepth.details,
        links: navDepth.links // Pass the detailed list to the frontend
    };

    // Calculate Overall Score (Simple weighted average)
    let totalScore = 0;
    let maxScore = 0;

    // Weights
    const weights = {
        cls: 2,
        tapTargets: 3,
        textSize: 3,
        viewport: 3,
        horizontalScroll: 3,
        stickyHeader: 1,
        readability: 2,
        navigationDepth: 2
    };

    // Helper to add score
    const addScore = (key, passed) => {
        maxScore += weights[key] * 100;
        if (passed) totalScore += weights[key] * 100;
    };

    addScore('cls', auditResults.cls.status === 'pass');
    addScore('tapTargets', auditResults.tapTargets.status === 'pass'); // Could use partial score
    addScore('textSize', auditResults.textSize.status === 'pass');
    addScore('viewport', auditResults.viewport.status === 'pass');
    addScore('horizontalScroll', auditResults.horizontalScroll.status === 'pass');
    addScore('stickyHeader', auditResults.stickyHeader.status === 'pass');
    addScore('readability', auditResults.readability.status === 'pass');
    addScore('navigationDepth', auditResults.navigationDepth.status === 'pass');

    auditResults.overallScore = Math.round((totalScore / maxScore) * 100);

    return auditResults;
}

module.exports = { runUxAudit };
