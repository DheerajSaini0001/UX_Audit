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
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-8">
                    UX Audit Tool
                </h1>
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <ScrapeForm onScrape={handleScrape} />
                </div>
            </div>
        </div>
    );
};

export default Home;
