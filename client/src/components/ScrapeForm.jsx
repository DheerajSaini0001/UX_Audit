import React, { useState } from 'react';

const ScrapeForm = ({ onScrape }) => {
    const [url, setUrl] = useState('');
    const [device, setDevice] = useState('desktop');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onScrape(url, device);
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Scrape URL</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Device View</label>
                    <div className="mt-2 flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="desktop"
                                checked={device === 'desktop'}
                                onChange={(e) => setDevice(e.target.value)}
                                className="form-radio text-indigo-600"
                            />
                            <span className="ml-2">Desktop</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="mobile"
                                checked={device === 'mobile'}
                                onChange={(e) => setDevice(e.target.value)}
                                className="form-radio text-indigo-600"
                            />
                            <span className="ml-2">Mobile</span>
                        </label>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Scraping...' : 'Scrape'}
                </button>
            </form>
        </div>
    );
};

export default ScrapeForm;
