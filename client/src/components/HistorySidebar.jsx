import React from 'react';

const HistorySidebar = ({ history, onSelect }) => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-transparent transition-colors duration-300">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 dark:backdrop-blur-sm transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">History</h3>
            </div>
            <ul className="flex-1 divide-y divide-gray-200 dark:divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                {history.map((scrape) => (
                    <li
                        key={scrape._id}
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition duration-150 ease-in-out group"
                        onClick={() => onSelect(scrape)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-indigo-600 dark:text-purple-200 group-hover:text-indigo-800 dark:group-hover:text-white transition-colors truncate">
                                    {scrape.title || 'No Title'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                    {scrape.url}
                                </p>
                            </div>
                            {scrape.auditResults && (
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${scrape.auditResults.overallScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' :
                                        scrape.auditResults.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                                    }`}>
                                    {scrape.auditResults.overallScore}
                                </span>
                            )}
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${scrape.device === 'mobile' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                                }`}>
                                {scrape.device}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {new Date(scrape.scrapedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </li>
                ))}
                {history.length === 0 && (
                    <li className="px-6 py-10 text-center text-gray-500 text-sm italic">
                        No history yet
                    </li>
                )}
            </ul>
        </div>
    );
};

export default HistorySidebar;
