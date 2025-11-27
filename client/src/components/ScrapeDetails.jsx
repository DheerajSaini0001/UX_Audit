import React from 'react';

const ScrapeDetails = ({ scrape }) => {
    return (
        <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 truncate">{scrape.title || scrape.url || 'No Title'}</h2>
                    <p className="text-sm text-gray-500">{scrape.url}</p>
                </div>
                <div className="flex space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${scrape.device === 'mobile' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {scrape.device}
                    </span>
                    {scrape.auditResults && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${scrape.auditResults.overallScore >= 80 ? 'bg-green-100 text-green-800' : scrape.auditResults.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            Score: {scrape.auditResults.overallScore}
                        </span>
                    )}
                </div>
            </div>

            {/* Audit Details Section */}
            {scrape.auditResults && (
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-bold text-gray-700 mb-4">Audit Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* CLS */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="font-semibold block mb-1">CLS (Layout Shift)</span>
                            <div className="flex items-center mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.cls.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {scrape.auditResults.cls.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">{scrape.auditResults.cls.details}</p>
                        </div>

                        {/* Tap Targets */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold">Tap Targets</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.tapTargets.score >= 90 ? 'bg-green-100 text-green-800' : scrape.auditResults.tapTargets.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    Score: {scrape.auditResults.tapTargets.score}/100
                                </span>
                            </div>

                            {scrape.auditResults.tapTargets.meta && (
                                <p className="text-xs text-gray-600 mb-2">
                                    {scrape.auditResults.tapTargets.meta.passed} passed out of {scrape.auditResults.tapTargets.meta.total} interactive elements.
                                </p>
                            )}

                            {scrape.auditResults.tapTargets.details.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-red-600 font-semibold mb-1">{scrape.auditResults.tapTargets.details.length} issues found:</p>
                                    <ul className="list-disc pl-4 text-xs text-gray-500 max-h-32 overflow-y-auto">
                                        {scrape.auditResults.tapTargets.details.map((issue, idx) => (
                                            <li key={idx}>
                                                {issue.tag} ({Math.round(issue.width)}x{Math.round(issue.height)}): "{issue.text}"
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {scrape.auditResults.tapTargets.details.length === 0 && (
                                <p className="text-xs text-green-600">All interactive elements are large enough.</p>
                            )}
                        </div>

                        {/* Text Size */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold">Text Size</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.textSize.score >= 90 ? 'bg-green-100 text-green-800' : scrape.auditResults.textSize.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    Score: {scrape.auditResults.textSize.score}/100
                                </span>
                            </div>

                            {scrape.auditResults.textSize.meta && (
                                <p className="text-xs text-gray-600 mb-2">
                                    {scrape.auditResults.textSize.meta.passed} passed out of {scrape.auditResults.textSize.meta.total} text blocks.
                                </p>
                            )}

                            {scrape.auditResults.textSize.details.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-red-600 font-semibold mb-1">{scrape.auditResults.textSize.details.length} small text elements:</p>
                                    <ul className="list-disc pl-4 text-xs text-gray-500 max-h-32 overflow-y-auto">
                                        {scrape.auditResults.textSize.details.map((issue, idx) => (
                                            <li key={idx}>
                                                {issue.tag} ({issue.fontSize}px): "{issue.text}"
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {scrape.auditResults.textSize.details.length === 0 && (
                                <p className="text-xs text-green-600">All text is legible.</p>
                            )}
                        </div>

                        {/* Viewport */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="font-semibold block mb-1">Viewport</span>
                            <div className="flex items-center mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.viewport.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {scrape.auditResults.viewport.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">{scrape.auditResults.viewport.details}</p>
                        </div>

                        {/* Horizontal Scroll */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="font-semibold block mb-1">Horizontal Scroll</span>
                            <div className="flex items-center mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.horizontalScroll.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {scrape.auditResults.horizontalScroll.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">{scrape.auditResults.horizontalScroll.details}</p>
                        </div>

                        {/* Sticky Header */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="font-semibold block mb-1">Sticky Header</span>
                            <div className="flex items-center mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.stickyHeader.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {scrape.auditResults.stickyHeader.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">{scrape.auditResults.stickyHeader.details}</p>
                        </div>

                        {/* Readability */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="font-semibold block mb-1">Readability</span>
                            <div className="flex items-center mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.readability.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {scrape.auditResults.readability.status.toUpperCase()}
                                </span>
                            </div>

                            {scrape.auditResults.readability.meta ? (
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Page Type:</span>
                                        <span className="text-xs font-medium text-gray-700">{scrape.auditResults.readability.meta.pageType}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Flesch Score:</span>
                                        <span className={`text-lg font-bold ${scrape.auditResults.readability.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                            {scrape.auditResults.readability.score.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs text-gray-500">Target Range:</span>
                                        <span className="text-xs text-gray-600">
                                            {scrape.auditResults.readability.meta.targetMin} - {scrape.auditResults.readability.meta.targetMax}
                                        </span>
                                    </div>

                                    {/* Detailed Stats & Formula */}
                                    {scrape.auditResults.readability.meta.overallStats && (
                                        <div className="bg-blue-50 p-3 rounded mb-3 border border-blue-100">
                                            <p className="text-xs font-bold text-blue-800 mb-1">How is this calculated?</p>
                                            <p className="text-[10px] text-blue-600 font-mono mb-2">
                                                Score = 206.835 – (1.015 × ASL) – (84.6 × ASW)
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-[10px] text-gray-500">Avg Sentence Length (ASL)</p>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        {scrape.auditResults.readability.meta.overallStats.ASL.toFixed(1)} words
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500">Avg Syllables/Word (ASW)</p>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        {scrape.auditResults.readability.meta.overallStats.ASW.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {scrape.auditResults.readability.meta.problematicContent && scrape.auditResults.readability.meta.problematicContent.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-red-600 mb-2">Hard to read content:</p>
                                            <ul className="space-y-3">
                                                {scrape.auditResults.readability.meta.problematicContent.map((item, idx) => (
                                                    <li key={idx} className="bg-red-50 p-2 rounded border border-red-100">
                                                        <p className="text-xs text-gray-700 italic mb-2">"{item.text}"</p>

                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-xs font-bold text-red-700">Score: {item.score.toFixed(1)}</p>
                                                                <p className="text-[10px] text-orange-700 font-medium mt-1">{item.reason}</p>
                                                            </div>
                                                            {item.stats && (
                                                                <div className="text-right">
                                                                    <p className="text-[10px] text-gray-500">ASL: {item.stats.ASL.toFixed(1)}</p>
                                                                    <p className="text-[10px] text-gray-500">ASW: {item.stats.ASW.toFixed(2)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-600">{scrape.auditResults.readability.details}</p>
                            )}
                        </div>

                        {/* Navigation Depth */}
                        {scrape.auditResults.navigationDepth && (
                            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                <span className="font-semibold block mb-1">Navigation Depth</span>
                                <div className="flex items-center mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.navigationDepth.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {scrape.auditResults.navigationDepth.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{scrape.auditResults.navigationDepth.details}</p>

                                {scrape.auditResults.navigationDepth.links && scrape.auditResults.navigationDepth.links.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Link Structure:</p>
                                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-white">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depth</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {scrape.auditResults.navigationDepth.links.map((link, idx) => (
                                                        <tr key={idx} className={link.depth <= 3 ? 'bg-green-50' : 'bg-red-50'}>
                                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{link.text}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                                <div className="flex items-center flex-wrap gap-1">
                                                                    <span className="font-medium text-gray-600">Home</span>
                                                                    {link.href === '/' ? null : (
                                                                        link.href.split('/').filter(Boolean).map((segment, i) => (
                                                                            <React.Fragment key={i}>
                                                                                <span className="text-gray-400">→</span>
                                                                                <span className="bg-white px-1 rounded border border-gray-200 text-gray-700">
                                                                                    {segment}
                                                                                </span>
                                                                            </React.Fragment>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-semibold">{link.depth}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Intrusive Interstitials */}
                        {scrape.auditResults.intrusiveInterstitials && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="font-semibold block mb-1">Intrusive Interstitials</span>
                                <div className="flex items-center mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.intrusiveInterstitials.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {scrape.auditResults.intrusiveInterstitials.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600">{scrape.auditResults.intrusiveInterstitials.details}</p>
                            </div>
                        )}

                        {/* Image Ratio Consistency */}
                        {scrape.auditResults.imageStability && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold">Image Ratio Consistency</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${scrape.auditResults.imageStability.score >= 90 ? 'bg-green-100 text-green-800' : scrape.auditResults.imageStability.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        Score: {scrape.auditResults.imageStability.score}/100
                                    </span>
                                </div>

                                {scrape.auditResults.imageStability.meta && (
                                    <p className="text-xs text-gray-600 mb-2">
                                        {scrape.auditResults.imageStability.meta.passed} passed out of {scrape.auditResults.imageStability.meta.total} images.
                                    </p>
                                )}

                                {scrape.auditResults.imageStability.details.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-red-600 font-semibold mb-1">{scrape.auditResults.imageStability.details.length} images missing dimensions:</p>
                                        <ul className="list-disc pl-4 text-xs text-gray-500 max-h-32 overflow-y-auto">
                                            {scrape.auditResults.imageStability.details.map((issue, idx) => (
                                                <li key={idx} className="truncate">
                                                    {issue.src}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {scrape.auditResults.imageStability.details.length === 0 && scrape.auditResults.imageStability.meta.total > 0 && (
                                    <p className="text-xs text-green-600">All images have explicit dimensions.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrapeDetails;
