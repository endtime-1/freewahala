'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Get stored theme or system preference
        const stored = localStorage.getItem('theme') as Theme;
        if (stored) {
            setTheme(stored);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('theme', theme);
            // Update document class for global CSS
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Theme-aware CSS class helper
export function getThemeClasses(isDark: boolean) {
    return {
        // Backgrounds
        pageBg: isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50',
        cardBg: isDark ? 'bg-white/5 backdrop-blur-xl' : 'bg-white',
        cardBorder: isDark ? 'border-white/10' : 'border-gray-200',

        // Text
        textPrimary: isDark ? 'text-white' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
        textMuted: isDark ? 'text-gray-500' : 'text-gray-500',

        // Form inputs
        inputBg: isDark ? 'bg-white/5' : 'bg-white',
        inputBorder: isDark ? 'border-white/10' : 'border-gray-300',
        inputText: isDark ? 'text-white' : 'text-gray-900',
        inputPlaceholder: isDark ? 'placeholder-gray-500' : 'placeholder-gray-400',

        // Hover states
        hoverBg: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    };
}
