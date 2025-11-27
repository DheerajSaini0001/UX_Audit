import React from 'react';

const HistorySidebar = ({ history, onSelect }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">History</h3>
            </div>
            <ul className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
                {history.map((scrape) => (
                    <li
                        key={scrape._id}
                        className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                        onClick={() => onSelect(scrape)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-indigo-600 truncate">
                                    {scrape.title || 'No Title'}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                    {scrape.url}
                                </p>
                            </div>
                            {scrape.auditResults && (
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${scrape.auditResults.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                                        scrape.auditResults.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {scrape.auditResults.overallScore}
                                </span>
                            )}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${scrape.device === 'mobile' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {scrape.device}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(scrape.scrapedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </li>
                ))}
                {history.length === 0 && (
                    <li className="px-4 py-8 text-center text-gray-500 text-sm">
                        No history yet
                    </li>
                )}
            </ul>
        </div>
    );
};

export default HistorySidebar;
