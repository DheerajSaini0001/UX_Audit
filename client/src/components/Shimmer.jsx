import React from 'react';

const Shimmer = ({ onlyBody = false }) => {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header Shimmer - Only show if not body-only */}
            {!onlyBody && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                </div>
            )}

            {/* Metrics Grid Shimmer */}
            <div className={`${onlyBody ? 'p-6' : ''} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm h-32">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shimmer;
