const textReadabilityModule = require('text-readability');
const textReadability = textReadabilityModule.default || textReadabilityModule;

// Helper to count syllables in a word (heuristic)
function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    const syllableMatch = word.match(/[aeiouy]{1,2}/g);
    return syllableMatch ? syllableMatch.length : 1;
}

// Helper to calculate Readability Stats
function calculateReadabilityStats(text) {
    const cleanText = text.trim();
    if (!cleanText) return null;

    // 1. Count Sentences
    // Split by . ! ? followed by space or end of string
    const sentences = cleanText.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);

    // 2. Count Words
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = Math.max(1, words.length);

    // 3. Count Syllables
    let syllableCount = 0;
    words.forEach(w => {
        syllableCount += countSyllables(w);
    });

    // 4. Calculate Averages
    const ASL = wordCount / sentenceCount; // Average Sentence Length
    const ASW = syllableCount / wordCount; // Average Syllables per Word

    // 5. Calculate Flesch Score
    // Formula: 206.835 – (1.015 × ASL) – (84.6 × ASW)
    const score = 206.835 - (1.015 * ASL) - (84.6 * ASW);

    return {
        score,
        ASL,
        ASW,
        sentenceCount,
        wordCount,
        syllableCount
    };
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
        navigationDepth: { score: 0, status: 'pass', details: '' },
        intrusiveInterstitials: { score: 0, status: 'pass', details: '' },
        imageStability: { score: 0, status: 'pass', details: '' },

        overallScore: 0,
    };

    // ... (existing code for other checks) ...

    // 9. Readability Score
    // Get all text for overall score
    const textContent = await page.evaluate(() => document.body.innerText);

    // Calculate Overall Stats
    const overallStats = calculateReadabilityStats(textContent);
    const overallFleschScore = overallStats ? overallStats.score : 0;

    // Get individual paragraphs for granular analysis
    const paragraphs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('p'))
            .map(p => p.innerText)
            .filter(text => text.length > 50); // Only check substantial paragraphs
    });

    const url = page.url();

    // Detect Page Type using robust multi-rule logic
    const pageType = await page.evaluate(() => {
        const url = window.location.href;
        const pathname = window.location.pathname.toLowerCase();

        // 1. URL Pattern
        const blogUrlPatterns = ['/blog/', '/articles/', '/news/', '/posts/', '/story/'];
        const productUrlPatterns = ['/product/', '/products/', '/shop/', '/item/', '/store/', '/category/'];

        const isBlogUrl = blogUrlPatterns.some(p => pathname.includes(p));
        const isProductUrl = productUrlPatterns.some(p => pathname.includes(p));

        // 2. Schema Markup
        let schemaType = null;
        const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of schemas) {
            try {
                const json = JSON.parse(script.innerText);
                const types = Array.isArray(json) ? json.map(j => j['@type']) : [json['@type']];
                const flatTypes = types.flat();

                if (flatTypes.some(t => ['Product', 'Offer', 'AggregateRating'].includes(t))) {
                    schemaType = 'Product';
                    break;
                }
                if (flatTypes.some(t => ['BlogPosting', 'Article', 'NewsArticle'].includes(t))) {
                    schemaType = 'Article';
                    break;
                }
            } catch (e) { }
        }

        // 3. DOM Structure
        const hasArticleTag = !!document.querySelector('article');
        const hasTimeTag = !!document.querySelector('time');
        const hasAddToCart = !!document.querySelector('.add-to-cart, #add-to-cart, button[name="add-to-cart"]');
        const hasPrice = !!document.querySelector('.price, [itemprop="price"]');

        // 4. CTA Detection
        const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"]'));
        const ctaText = buttons.map(b => b.innerText.toLowerCase()).join(' ');
        const hasBuyCTA = ctaText.includes('add to cart') || ctaText.includes('buy now');
        const hasShareCTA = ctaText.includes('share') || ctaText.includes('subscribe');

        // 5. Word Count
        const bodyText = document.body.innerText || '';
        const wordCount = bodyText.split(/\s+/).length;

        // 6. Combined Rule (Scoring Logic)
        // Priority: Product
        if (isProductUrl || schemaType === 'Product' || hasBuyCTA || hasAddToCart) {
            return 'Product Page';
        }

        // Priority: Blog
        if (isBlogUrl || schemaType === 'Article' || (hasArticleTag && wordCount > 500)) {
            return 'Article/Blog';
        }

        // Fallback based on word count
        if (wordCount > 500) return 'Article/Blog';
        if (wordCount < 300 && (hasPrice || hasBuyCTA)) return 'Product Page';

        return 'Article/Blog'; // Default safe fallback
    });

    // Define Limits based on Page Type
    let readabilityMin, readabilityMax;
    if (pageType === 'Product Page') {
        readabilityMin = 40;
        readabilityMax = 60;
    } else {
        // Article/Blog
        readabilityMin = 50;
        readabilityMax = 70;
    }

    const tolerance = 15;
    const passed = overallFleschScore >= readabilityMin && overallFleschScore <= (readabilityMax + tolerance);

    // Analyze Paragraphs
    const problematicContent = [];
    paragraphs.forEach(pText => {
        const stats = calculateReadabilityStats(pText);

        // If score is significantly below minimum (hard to read)
        if (stats && stats.score < readabilityMin) {
            // Determine Reason based on ASL and ASW
            let reasonParts = [];
            if (stats.ASL > 20) {
                reasonParts.push(`Long sentences (avg ${Math.round(stats.ASL)} words)`);
            }
            if (stats.ASW > 1.6) {
                // Find complex words (>= 4 syllables)
                const complexWords = pText.split(/\s+/)
                    .map(w => w.replace(/[^a-zA-Z]/g, '')) // Clean punctuation
                    .filter(w => w.length > 6 && countSyllables(w) >= 4) // Filter for length and syllables
                    .filter((v, i, a) => a.indexOf(v) === i) // Unique
                    .slice(0, 3); // Top 3

                let vocabReason = `Complex vocabulary (avg ${stats.ASW.toFixed(1)} syllables/word)`;
                if (complexWords.length > 0) {
                    vocabReason += `. Words like: ${complexWords.join(', ')}`;
                }
                reasonParts.push(vocabReason);
            }

            let reason = reasonParts.join(' & ') || 'Hard to read';

            problematicContent.push({
                text: pText.substring(0, 150) + (pText.length > 150 ? '...' : ''), // Truncate for display
                score: stats.score,
                reason: reason,
                stats: {
                    ASL: stats.ASL,
                    ASW: stats.ASW
                }
            });
        }
    });

    auditResults.readability.score = overallFleschScore;
    auditResults.readability.status = passed ? 'pass' : 'fail';
    auditResults.readability.details = `Type: ${pageType}. Score: ${overallFleschScore.toFixed(2)}. Target: ${readabilityMin}-${readabilityMax} (allowed +${tolerance}).`;
    auditResults.readability.meta = {
        pageType: pageType,
        targetMin: readabilityMin,
        targetMax: readabilityMax,
        problematicContent: problematicContent.slice(0, 5), // Limit to top 5 issues
        overallStats: overallStats // Include overall ASL/ASW for the report
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
    const tapTargetsData = await page.evaluate((deviceType) => {
        const minSize = deviceType === 'mobile' ? 44 : 24;
        const clickableElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
        const total = clickableElements.length;
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
        return { total, issues };
    }, deviceType);

    const tapScore = tapTargetsData.total > 0
        ? Math.round(((tapTargetsData.total - tapTargetsData.issues.length) / tapTargetsData.total) * 100)
        : 100;

    auditResults.tapTargets.status = tapScore >= 90 ? 'pass' : 'fail';
    auditResults.tapTargets.score = tapScore;
    auditResults.tapTargets.details = tapTargetsData.issues;
    auditResults.tapTargets.meta = {
        total: tapTargetsData.total,
        passed: tapTargetsData.total - tapTargetsData.issues.length,
        failed: tapTargetsData.issues.length
    };

    // 3. Text Readability Size
    const textSizeData = await page.evaluate((deviceType) => {
        const minSize = deviceType === 'mobile' ? 16 : 14;
        const textElements = Array.from(document.querySelectorAll('p, span, div, li, a, h1, h2, h3, h4, h5, h6'));
        // Filter for elements that actually have text content directly
        const validElements = textElements.filter(el => {
            return Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
        });

        const total = validElements.length;
        const issues = [];

        validElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            if (fontSize < minSize) {
                issues.push({
                    tag: el.tagName,
                    text: el.innerText ? el.innerText.substring(0, 20) : '',
                    fontSize: fontSize
                });
            }
        });
        return { total, issues: issues.slice(0, 20) }; // Limit return size
    }, deviceType);

    const textScore = textSizeData.total > 0
        ? Math.round(((textSizeData.total - textSizeData.issues.length) / textSizeData.total) * 100)
        : 100;

    auditResults.textSize.status = textScore >= 90 ? 'pass' : 'fail';
    auditResults.textSize.score = textScore;
    auditResults.textSize.details = textSizeData.issues;
    auditResults.textSize.meta = {
        total: textSizeData.total,
        passed: textSizeData.total - textSizeData.issues.length,
        failed: textSizeData.issues.length
    };

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

    // 11. Intrusive Interstitials (Popups, Modals, Scroll Blocking)
    const interstitialCheck = await page.evaluate((deviceType) => {
        function detectOverlay() {
            const elements = [...document.querySelectorAll("*")];
            return elements.some(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return (
                    (style.position === "fixed" || style.position === "absolute") &&
                    rect.width >= window.innerWidth * 0.9 &&
                    rect.height >= window.innerHeight * 0.9 &&
                    parseInt(style.zIndex) > 1000
                );
            });
        }

        function detectScrollBlock() {
            const bodyStyle = window.getComputedStyle(document.body);
            const htmlStyle = window.getComputedStyle(document.documentElement);
            return (
                bodyStyle.overflow === "hidden" ||
                bodyStyle.overflowY === "hidden" ||
                htmlStyle.overflow === "hidden" ||
                htmlStyle.overflowY === "hidden"
            );
        }

        function detectModal() {
            const elements = [...document.querySelectorAll("*")];
            return elements.some(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return (
                    style.position === "fixed" &&
                    rect.width >= 300 &&
                    rect.height >= 250 &&
                    parseInt(style.zIndex) > 999
                );
            });
        }

        const hasOverlay = detectOverlay();
        const hasScrollBlock = detectScrollBlock();
        const hasModal = detectModal();

        let details = [];
        if (hasOverlay) details.push("Full-screen overlay detected");
        if (hasScrollBlock) details.push("Scroll blocking detected");
        if (hasModal) details.push("Intrusive modal detected");

        const prefix = deviceType === 'mobile' ? 'Mobile View' : 'Desktop View';

        return {
            status: (hasOverlay || hasScrollBlock || hasModal) ? 'fail' : 'pass',
            details: details.length > 0 ? `${prefix}: ${details.join(", ")}` : `${prefix}: No intrusive interstitials found.`
        };
    }, deviceType);

    auditResults.intrusiveInterstitials = {
        score: interstitialCheck.status === 'pass' ? 100 : 0,
        status: interstitialCheck.status,
        details: interstitialCheck.details
    };

    // 12. Image Ratio Consistency (Prevent Layout Shifts)
    const imageStability = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const total = images.length;
        const issues = [];

        images.forEach(img => {
            const hasWidth = img.hasAttribute('width');
            const hasHeight = img.hasAttribute('height');
            const style = window.getComputedStyle(img);
            const hasAspectRatio = style.aspectRatio !== 'auto';

            // Pass if (width AND height) OR aspect-ratio is set
            if (!((hasWidth && hasHeight) || hasAspectRatio)) {
                issues.push({
                    src: img.src || 'No Source',
                    details: 'Missing explicit width/height or aspect-ratio'
                });
            }
        });

        return {
            total: total,
            issues: issues.slice(0, 10) // Limit to top 10
        };
    });

    const imageScore = imageStability.total > 0
        ? Math.round(((imageStability.total - imageStability.issues.length) / imageStability.total) * 100)
        : 100;

    auditResults.imageStability = {
        score: imageScore,
        status: imageScore >= 90 ? 'pass' : 'fail',
        meta: {
            total: imageStability.total,
            passed: imageStability.total - imageStability.issues.length,
            failed: imageStability.issues.length
        },
        details: imageStability.issues
    };





    // Calculate Overall Score (Weighted Average)
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
        navigationDepth: 2,
        intrusiveInterstitials: 3,
        imageStability: 2,
        
};

// Helper to add score
const addScore = (key, score) => {
    maxScore += weights[key] * 100;
    totalScore += weights[key] * score;
};

// Calculate scores for binary checks (0 or 100)
const viewportScore = auditResults.viewport.status === 'pass' ? 100 : 0;
const scrollScore = auditResults.horizontalScroll.status === 'pass' ? 100 : 0;
const headerScore = auditResults.stickyHeader.status === 'pass' ? 100 : 0;

// Map CLS to 0-100 score (0.1 = 90, 0.25 = 50, >0.25 = 0)
let clsScore = 100;
if (auditResults.cls.score > 0.25) clsScore = 0;
else if (auditResults.cls.score > 0.1) clsScore = 50 + ((0.25 - auditResults.cls.score) / 0.15) * 40; // Linear interpolation between 50 and 90
else clsScore = 90 + ((0.1 - auditResults.cls.score) / 0.1) * 10; // Linear interpolation between 90 and 100

// Use actual scores for proportional metrics
addScore('cls', clsScore);
addScore('tapTargets', auditResults.tapTargets.score);
addScore('textSize', auditResults.textSize.score);
addScore('viewport', viewportScore);
addScore('horizontalScroll', scrollScore);
addScore('stickyHeader', headerScore);
addScore('readability', auditResults.readability.score); // Use Flesch score directly (clamped 0-100 usually, but can be negative. Let's clamp it)

// Clamp readability score for overall calculation
const clampedReadability = Math.max(0, Math.min(100, auditResults.readability.score));
// Re-add readability with clamped score
maxScore -= weights['readability'] * 100; // Remove previous add
totalScore -= weights['readability'] * auditResults.readability.score; // Remove previous add
addScore('readability', clampedReadability);

addScore('navigationDepth', auditResults.navigationDepth.score);
addScore('intrusiveInterstitials', auditResults.intrusiveInterstitials.score);
addScore('imageStability', auditResults.imageStability.score);


auditResults.overallScore = Math.round((totalScore / maxScore) * 100);

return auditResults;
}

module.exports = { runUxAudit };
