import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Shimmer from '../components/Shimmer';
import HistorySidebar from '../components/HistorySidebar';

// Reusing the ScrapeItem component logic (moved from App.jsx or duplicated for now)
// Ideally this should be a separate component file, but for speed I'll define it here or import if I extracted it.
// I'll extract it to a separate file to be clean.
import ScrapeDetails from '../components/ScrapeDetails';

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
        <div className="min-h-screen bg-gray-100 flex">
            {/* Main Content Area */}
            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto h-screen">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">UX Audit Report</h1>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            &larr; Back to Home
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {/* Show Header immediately with known params */}
                            <ScrapeDetails scrape={{
                                url: urlParam,
                                device: deviceParam,
                                title: 'Analyzing...',
                                // No auditResults yet, so ScrapeDetails will only render the header
                            }} />

                            {/* Show Shimmer for the body content */}
                            <div className="border-t border-gray-200">
                                <Shimmer onlyBody={true} />
                            </div>
                        </div>
                    ) : currentScrape ? (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <ScrapeDetails scrape={currentScrape} />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            Please enter a URL to generate a report.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l border-gray-200 bg-white hidden lg:block h-screen sticky top-0">
                <HistorySidebar history={history} onSelect={handleHistorySelect} />
            </div>
        </div>
    );
};

export default Report;
