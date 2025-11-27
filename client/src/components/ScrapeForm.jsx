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
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Start Audit</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-1 ml-1">Website URL</label>
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="url"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="block w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2 ml-1">Device View</label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer relative rounded-xl px-4 py-3 flex items-center justify-center space-x-2 border transition-all duration-200 ${device === 'desktop' ? 'bg-purple-600 border-transparent shadow-lg shadow-purple-900/50' : 'bg-white/5 border-purple-300/30 hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="device"
                                value="desktop"
                                checked={device === 'desktop'}
                                onChange={(e) => setDevice(e.target.value)}
                                className="sr-only"
                            />
                            <span className="text-xl">💻</span>
                            <span className={`font-medium ${device === 'desktop' ? 'text-white' : 'text-purple-200'}`}>Desktop</span>
                        </label>

                        <label className={`cursor-pointer relative rounded-xl px-4 py-3 flex items-center justify-center space-x-2 border transition-all duration-200 ${device === 'mobile' ? 'bg-purple-600 border-transparent shadow-lg shadow-purple-900/50' : 'bg-white/5 border-purple-300/30 hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="device"
                                value="mobile"
                                checked={device === 'mobile'}
                                onChange={(e) => setDevice(e.target.value)}
                                className="sr-only"
                            />
                            <span className="text-xl">📱</span>
                            <span className={`font-medium ${device === 'mobile' ? 'text-white' : 'text-purple-200'}`}>Mobile</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </span>
                    ) : (
                        'Run Audit'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ScrapeForm;
