import React, { useState, useEffect } from 'react';
import ScrapeForm from './components/ScrapeForm';

function App() {
    const [scrapes, setScrapes] = useState([]);
    const [error, setError] = useState(null);

    const fetchScrapes = async () => {
        try {
            const response = await fetch('http://localhost:202/api/scrapes');
            const data = await response.json();
            setScrapes(data);
        } catch (err) {
            console.error('Error fetching scrapes:', err);
        }
    };

    useEffect(() => {
        fetchScrapes();
    }, []);

    const handleScrape = async (url, device) => {
        setError(null);
        try {
            const response = await fetch('http://localhost:202/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, device }),
            });

            if (!response.ok) {
                throw new Error('Scrape failed');
            }

            const result = await response.json();
            console.log('Scrape result:', result);
            fetchScrapes(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    URL Scraper
                </h1>

                <ScrapeForm onScrape={handleScrape} />

                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md text-center">
                        {error}
                    </div>
                )}

                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Scrapes</h2>
                    {scrapes.length === 0 ? (
                        <p className="text-gray-500 text-center">No scrapes yet.</p>
                    ) : (
                        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
                            {scrapes.map((scrape) => (
                                <li key={scrape._id} className="border-b border-gray-200 last:border-none">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{scrape.title || 'No Title'}</p>
                                            <div className="ml-2 flex-shrink-0 flex space-x-2">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${scrape.device === 'mobile' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {scrape.device}
                                                </p>
                                                {scrape.auditResults && (
                                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${scrape.auditResults.overallScore >= 80 ? 'bg-green-100 text-green-800' : scrape.auditResults.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        Score: {scrape.auditResults.overallScore}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {scrape.url}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    {new Date(scrape.scrapedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Audit Details Section */}
                                        {scrape.auditResults && (
                                            <div className="mt-4 border-t border-gray-100 pt-4">
                                                <h4 className="text-md font-bold text-gray-700 mb-2">UX Audit Report</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">CLS (Layout Shift):</span>
                                                        <span className={`ml-2 ${scrape.auditResults.cls.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.cls.status.toUpperCase()}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">{scrape.auditResults.cls.details}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">Tap Targets:</span>
                                                        <span className={`ml-2 ${scrape.auditResults.tapTargets.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.tapTargets.status.toUpperCase()}
                                                        </span>
                                                        {scrape.auditResults.tapTargets.status === 'fail' && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">{scrape.auditResults.tapTargets.details.length} issues found:</p>
                                                                <ul className="list-disc pl-4 text-xs text-gray-500 max-h-32 overflow-y-auto">
                                                                    {scrape.auditResults.tapTargets.details.map((issue, idx) => (
                                                                        <li key={idx}>
                                                                            {issue.tag} ({Math.round(issue.width)}x{Math.round(issue.height)}): "{issue.text}"
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">Text Size:</span>
                                                        <span className={`ml-2 ${scrape.auditResults.textSize.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.textSize.status.toUpperCase()}
                                                        </span>
                                                        {scrape.auditResults.textSize.status === 'fail' && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">{scrape.auditResults.textSize.details.length} small text elements:</p>
                                                                <ul className="list-disc pl-4 text-xs text-gray-500 max-h-32 overflow-y-auto">
                                                                    {scrape.auditResults.textSize.details.map((issue, idx) => (
                                                                        <li key={idx}>
                                                                            {issue.tag} ({issue.fontSize}px): "{issue.text}"
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">Viewport:</span>
                                                        <span className={`ml-2 ${scrape.auditResults.viewport.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.viewport.status.toUpperCase()}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">{scrape.auditResults.viewport.details}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">Horizontal Scroll:</span>
                                                        <span className={`ml-2 ${scrape.auditResults.horizontalScroll.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.horizontalScroll.status.toUpperCase()}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">{scrape.auditResults.horizontalScroll.details}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">Sticky Header:</span>
                                                        <span className={`ml-2 ${scrape.auditResults.stickyHeader.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.stickyHeader.status.toUpperCase()}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">{scrape.auditResults.stickyHeader.details}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="font-semibold">Readability:</span>
                                                        <span className={`ml-2 ${scrape.auditResults.readability.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {scrape.auditResults.readability.status.toUpperCase()}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">{scrape.auditResults.readability.details}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
