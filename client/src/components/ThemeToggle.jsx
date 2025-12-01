// src/components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Adjust path as needed

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg font-bold transition-colors duration-200
                       bg-gray-200 text-gray-800 
                       dark:bg-gray-700 dark:text-yellow-300"
        >
            {theme === 'dark' ? '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;