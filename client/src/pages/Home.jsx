import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScrapeForm from '../components/ScrapeForm';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
    const navigate = useNavigate();

    const handleScrape = (url, device) => {
        navigate(`/report?url=${encodeURIComponent(url)}&device=${device}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Background Decor (Dark Mode Only) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none hidden dark:block">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            <div className="z-10 w-full max-w-md space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-purple-200 sm:text-5xl md:text-6xl">
                        UX Audit Tool
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-purple-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Analyze any webpage for UX/UI best practices, readability, and accessibility.
                    </p>
                </div>

                <div className="bg-white dark:bg-white/10 dark:backdrop-blur-lg border border-gray-200 dark:border-white/20 py-8 px-4 shadow-xl dark:shadow-2xl rounded-2xl sm:px-10 relative overflow-hidden transition-all duration-300">
                    <ScrapeForm onScrape={handleScrape} />
                </div>

                <div className="text-center text-xs text-gray-400 dark:text-purple-300/50">
                    <p>© 2024 UX Audit Tool. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
