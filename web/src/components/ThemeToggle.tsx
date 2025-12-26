'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isDark
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                }`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Toggle ball */}
            <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-8' : 'translate-x-1'
                    }`}
            >
                {/* Icon */}
                <span className="text-xs">
                    {isDark ? '🌙' : '☀️'}
                </span>
            </div>
        </button>
    );
}
