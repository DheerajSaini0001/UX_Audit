import React from 'react';

const ScrapeDetails = ({ scrape, loading }) => {
    if (loading) {
        return (
            <div className="px-6 py-8 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                    <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                    <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                    <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!scrape) return null;

    const { auditResults, url, device } = scrape;

    // Helper to get color for score
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBadge = (score) => {
        if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300';
    };

    // Calculate CLS Score (0-100) for display, as backend returns raw value
    const getClsScore = (value) => {
        if (value > 0.25) return 0;
        if (value > 0.1) return Math.round(50 + ((0.25 - value) / 0.15) * 40);
        return Math.round(90 + ((0.1 - value) / 0.1) * 10);
    };

    const clsScore = auditResults?.cls ? getClsScore(auditResults.cls.score) : 0;

    return (
        <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className={`text-2xl font-bold text-gray-900 dark:text-white truncate mb-1 ${loading ? 'animate-pulse' : ''}`}>
                        {scrape.title || scrape.url || 'No Title'}
                    </h2>
                    <a href={scrape.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-purple-300 hover:text-indigo-800 dark:hover:text-white transition-colors flex items-center">
                        {scrape.url}
                        <span className="ml-1">↗</span>
                    </a>
                </div>
                <div className="flex space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${device === 'mobile' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'}`}>
                        {device === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
                    </span>
                    {auditResults && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBadge(auditResults.overallScore)}`}>
                            Score: {auditResults.overallScore}
                        </span>
                    )}
                </div>
            </div>

            {scrape.auditResults && (
                <div className="border-t border-gray-200 dark:border-white/10 pt-8">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
                        Audit Results
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                        {/* CLS Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">Layout Shift (CLS)</h5>
                                <span className={`font-bold ${getScoreColor(clsScore)}`}>
                                    {clsScore}/100
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Value: <span className="font-mono text-gray-900 dark:text-white">{auditResults.cls?.score?.toFixed(3) || 0}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Cumulative Layout Shift measures visual stability. Lower is better.
                            </p>
                        </div>

                        {/* Tap Targets Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">Tap Targets</h5>
                                <span className={`font-bold ${getScoreColor(auditResults.tapTargets?.score || 0)}`}>
                                    {auditResults.tapTargets?.score || 0}/100
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-600 dark:text-gray-300">Passed: <span className="text-green-600 dark:text-green-400 font-medium">{auditResults.tapTargets?.meta?.passed || 0}</span></p>
                                <p className="text-gray-600 dark:text-gray-300">Failed: <span className="text-red-600 dark:text-red-400 font-medium">{auditResults.tapTargets?.meta?.failed || 0}</span></p>
                            </div>
                            {auditResults.tapTargets?.details && auditResults.tapTargets.details.length > 0 && (
                                <div className="mt-3 bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-500/10">
                                    <p className="text-xs text-red-600 dark:text-red-300 font-bold mb-2">{auditResults.tapTargets.details.length} issues found:</p>
                                    <ul className="list-disc pl-4 text-xs text-red-500 dark:text-red-200/80 max-h-32 overflow-y-auto space-y-1">
                                        {auditResults.tapTargets.details.map((issue, idx) => (
                                            <li key={idx}>
                                                {issue.tag} ({Math.round(issue.width)}x{Math.round(issue.height)}): "{issue.text}"
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Interactive elements should be at least 48x48px (mobile) or 44x44px (desktop).
                            </p>
                        </div>

                        {/* Text Size Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">Text Size</h5>
                                <span className={`font-bold ${getScoreColor(auditResults.textSize?.score || 0)}`}>
                                    {auditResults.textSize?.score || 0}/100
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-600 dark:text-gray-300">Passed: <span className="text-green-600 dark:text-green-400 font-medium">{auditResults.textSize?.meta?.passed || 0}</span></p>
                                <p className="text-gray-600 dark:text-gray-300">Failed: <span className="text-red-600 dark:text-red-400 font-medium">{auditResults.textSize?.meta?.failed || 0}</span></p>
                            </div>
                            {auditResults.textSize?.details && auditResults.textSize.details.length > 0 && (
                                <div className="mt-3 bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-500/10">
                                    <p className="text-xs text-red-600 dark:text-red-300 font-bold mb-2">{auditResults.textSize.details.length} small text elements:</p>
                                    <ul className="list-disc pl-4 text-xs text-red-500 dark:text-red-200/80 max-h-32 overflow-y-auto space-y-1">
                                        {auditResults.textSize.details.map((issue, idx) => (
                                            <li key={idx}>
                                                {issue.tag} ({issue.fontSize}px): "{issue.text}"
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Text should be at least 16px (mobile) or 14px (desktop).
                            </p>
                        </div>

                        {/* Viewport Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Viewport</h5>
                            <div className="flex items-center mb-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${auditResults.viewport?.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                                    {auditResults.viewport?.status?.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{auditResults.viewport?.details || 'No data'}</p>
                        </div>

                        {/* Horizontal Scroll Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Horizontal Scroll</h5>
                            <div className="flex items-center mb-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${auditResults.horizontalScroll?.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                                    {auditResults.horizontalScroll?.status?.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{auditResults.horizontalScroll?.details || 'No data'}</p>
                        </div>

                        {/* Sticky Header Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Sticky Header</h5>
                            <div className="flex items-center mb-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${auditResults.stickyHeader?.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                                    {auditResults.stickyHeader?.status?.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{auditResults.stickyHeader?.details || 'No data'}</p>
                        </div>

                        {/* Readability Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 md:col-span-2 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">Content Readability</h5>
                                <span className={`font-bold ${getScoreColor(auditResults.readability?.score || 0)}`}>
                                    {auditResults.readability?.score?.toFixed(1) || 0}/100
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flesch Score</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{auditResults.readability?.score?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Sentence Length</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{auditResults.readability?.meta?.overallStats?.ASL?.toFixed(1) || 'N/A'} words</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Syllables/Word</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{auditResults.readability?.meta?.overallStats?.ASW?.toFixed(2) || 'N/A'}</span>
                                </div>
                            </div>

                            {auditResults.readability?.meta?.problematicContent && auditResults.readability.meta.problematicContent.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm font-medium text-red-600 dark:text-red-300">Issues Found:</p>
                                    {auditResults.readability.meta.problematicContent.map((issue, idx) => (
                                        <div key={idx} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/10 p-3 rounded-lg text-xs">
                                            <p className="text-gray-800 dark:text-gray-200 mb-1">"{issue.text.substring(0, 100)}..."</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="text-red-600 dark:text-red-400 font-medium">{issue.reason}</span>
                                                {issue.stats && (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        (ASL: {issue.stats.ASL?.toFixed(1)}, ASW: {issue.stats.ASW?.toFixed(2)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2">No significant readability issues found.</p>
                            )}
                        </div>

                        {/* Navigation Depth Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 md:col-span-2 shadow-sm dark:shadow-none">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Navigation Depth</h5>
                            <div className="flex items-center mb-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${auditResults.navigationDepth?.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                                    {auditResults.navigationDepth?.status?.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{auditResults.navigationDepth?.details || 'No data'}</p>

                            {auditResults.navigationDepth?.links && auditResults.navigationDepth.links.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Link Structure:</p>
                                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-black/20">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                                            <thead className="bg-gray-100 dark:bg-white/5">
                                                <tr>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Text</th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Path</th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Depth</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                                {auditResults.navigationDepth.links.map((link, idx) => (
                                                    <tr key={idx} className={link.depth <= 3 ? 'bg-green-50 dark:bg-green-500/5' : 'bg-red-50 dark:bg-red-500/5'}>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">{link.text}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center flex-wrap gap-1">
                                                                <span className="font-medium text-gray-500">Home</span>
                                                                {link.href === '/' ? null : (
                                                                    link.href.split('/').filter(Boolean).map((segment, i) => (
                                                                        <React.Fragment key={i}>
                                                                            <span className="text-gray-400">→</span>
                                                                            <span className="bg-gray-100 dark:bg-white/10 px-1 rounded border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                                                                                {segment}
                                                                            </span>
                                                                        </React.Fragment>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">{link.depth}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Intrusive Interstitials */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">Intrusive Interstitials</h5>
                                <span className={`font-bold ${getScoreColor(auditResults.intrusiveInterstitials?.score || 0)}`}>
                                    {auditResults.intrusiveInterstitials?.score || 0}/100
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                {auditResults.intrusiveInterstitials?.status === 'fail' ? (
                                    <span className="text-red-600 dark:text-red-400">{auditResults.intrusiveInterstitials.details}</span>
                                ) : (
                                    <span className="text-green-600 dark:text-green-400">No intrusive interstitials found.</span>
                                )}
                            </p>
                        </div>

                        {/* Image Ratio Consistency */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">Image Aspect Ratios</h5>
                                <span className={`font-bold ${getScoreColor(auditResults.imageStability?.score || 0)}`}>
                                    {auditResults.imageStability?.score || 0}/100
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-600 dark:text-gray-300">Passed: <span className="text-green-600 dark:text-green-400 font-medium">{auditResults.imageStability?.meta?.passed || 0}</span></p>
                                <p className="text-gray-600 dark:text-gray-300">Failed: <span className="text-red-600 dark:text-red-400 font-medium">{auditResults.imageStability?.meta?.failed || 0}</span></p>
                            </div>
                            {auditResults.imageStability?.details && auditResults.imageStability.details.length > 0 && (
                                <div className="mt-3 bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-500/10">
                                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Images missing dimensions:</p>
                                    <ul className="list-disc list-inside text-xs text-red-500 dark:text-red-400 max-h-20 overflow-y-auto">
                                        {auditResults.imageStability.details.map((img, i) => (
                                            <li key={i} className="truncate">{img.src || 'No Source'}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrapeDetails;
