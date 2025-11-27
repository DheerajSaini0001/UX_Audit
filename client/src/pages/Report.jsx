import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Shimmer from '../components/Shimmer';
import HistorySidebar from '../components/HistorySidebar';

// Reusing the ScrapeItem component logic (moved from App.jsx or duplicated for now)
// Ideally this should be a separate component file, but for speed I'll define it here or import if I extracted it.
// I'll extract it to a separate file to be clean.
import ScrapeDetails from '../components/ScrapeDetails';

import ThemeToggle from '../components/ThemeToggle';

const Report = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlParam = searchParams.get('url');
    const deviceParam = searchParams.get('device') || 'desktop';

    const [loading, setLoading] = useState(true);
    const [currentScrape, setCurrentScrape] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    // Fetch History
    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:202/api/scrapes');
            const data = await response.json();
            // Sort by date desc
            const sorted = data.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt));
            setHistory(sorted);
            return sorted;
        } catch (err) {
            console.error('Error fetching history:', err);
            return [];
        }
    };

    const processingRef = React.useRef(null);

    // Perform Scrape or Load Existing
    useEffect(() => {
        const loadData = async () => {
            // Prevent double-execution for the same URL/Device combo
            const requestKey = `${urlParam}-${deviceParam}`;
            if (processingRef.current === requestKey) {
                return;
            }

            setLoading(true);
            setError(null);

            // Mark as processing immediately
            if (urlParam) {
                processingRef.current = requestKey;
            }

            // 1. Fetch History first to see if we already have it? 
            // Or just fetch history for the sidebar.
            const historyData = await fetchHistory();

            if (!urlParam) {
                setLoading(false);
                return;
            }

            try {
                // Trigger Scrape
                const response = await fetch('http://localhost:202/api/scrape', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: urlParam, device: deviceParam }),
                });

                if (!response.ok) {
                    throw new Error('Scrape failed');
                }

                const result = await response.json();
                // The API returns { message: '...', data: { ... } }
                // We need to set currentScrape to the data object
                setCurrentScrape(result.data || result);

                // Refresh history to include the new one
                fetchHistory();
            } catch (err) {
                setError(err.message);
                // Reset ref on error so user can retry if needed
                processingRef.current = null;
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [urlParam, deviceParam]);

    const handleHistorySelect = (scrape) => {
        // When selecting from history, we can either:
        // 1. Navigate to /report?url=... (which triggers a re-scrape? No, we don't want that if it's history)
        // 2. Just set the currentScrape state.
        // The user said "show the url... and at the right side it will show the history".
        // If I click history, I probably want to see that report.
        // Let's just set the state for now to avoid re-scraping.
        setCurrentScrape(scrape);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 flex relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50 lg:hidden">
                <ThemeToggle />
            </div>
            <div className="absolute top-4 right-8 z-50 hidden lg:block">
                <ThemeToggle />
            </div>

            {/* Background Decor (Dark Mode Only) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none hidden dark:block">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto h-screen z-10 scrollbar-hide">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8 animate-fade-in-up">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-purple-200">
                            UX Audit Report
                        </h1>
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-purple-200 bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-300/20 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 backdrop-blur-sm shadow-sm"
                        >
                            <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
                            Back to Home
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-200 rounded-xl backdrop-blur-sm animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up transition-colors duration-300">
                            {/* Show Header immediately with known params */}
                            <ScrapeDetails scrape={{
                                url: urlParam,
                                device: deviceParam,
                                title: 'Analyzing...',
                                // No auditResults yet, so ScrapeDetails will only render the header
                            }} loading={true} />

                            {/* Show Shimmer for the body content */}
                            <div className="border-t border-gray-200 dark:border-white/10">
                                <Shimmer onlyBody={true} />
                            </div>
                        </div>
                    ) : currentScrape ? (
                        <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up transition-colors duration-300">
                            <ScrapeDetails scrape={currentScrape} />
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 dark:text-purple-200/50 animate-fade-in-up">
                            <p className="text-xl font-light">Please enter a URL to generate a report.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 dark:backdrop-blur-xl hidden lg:block h-screen sticky top-0 z-20 transition-colors duration-300">
                <HistorySidebar history={history} onSelect={handleHistorySelect} />
            </div>
        </div>
    );
};

export default Report;
