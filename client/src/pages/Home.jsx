import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScrapeForm from '../components/ScrapeForm';

const Home = () => {
    const navigate = useNavigate();

    const handleScrape = (url, device) => {
        // Navigate to report page with query params
        navigate(`/report?url=${encodeURIComponent(url)}&device=${device}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="z-10 w-full max-w-md space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 mb-2 tracking-tight">
                        UX Audit Tool
                    </h1>
                    <p className="text-lg text-purple-200 font-light">
                        Elevate your user experience with AI-powered insights.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                    <ScrapeForm onScrape={handleScrape} />
                </div>

                <p className="text-center text-xs text-purple-300/60 mt-8">
                    Powered by Puppeteer & Advanced Heuristics
                </p>
            </div>
        </div>
    );
};

export default Home;
