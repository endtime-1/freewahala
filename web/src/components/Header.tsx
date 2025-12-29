'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';


interface User {
    id: string;
    fullName: string | null;
    phone: string;
    role: string;
}

export default function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check localStorage for user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsProfileOpen(false);
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
                    {/* Logo - Compact on mobile */}
                    <Link href="/" className="flex items-center gap-1.5 group flex-shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                                <path d="M12 5.432l8.159 8.159c.753.753 1.417.809 1.761.595.694-.43 1.08-1.579 1.08-2.686V19.5a2.25 2.25 0 01-2.25 2.25h-2.25a.75.75 0 01-.75-.75v-3.75a3 3 0 00-3-3h-3a3 3 0 00-3 3V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-8.08c0-1.163.42-2.312 1.157-2.668.375-.18 1.097-.202 1.84.54l8-8z" />
                            </svg>
                        </div>
                        <span className="text-base sm:text-lg md:text-xl font-black tracking-tight">
                            <span className="text-gray-900">Free</span>
                            <span className="text-orange-500">Wahala</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Browse
                        </Link>
                        <Link href="/services" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Services
                        </Link>
                        <Link href="/agreements" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Agreements
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Pricing
                        </Link>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle - Hidden on very small screens */}
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        {user ? (
                            /* Logged In State */
                            <div className="flex items-center gap-2 sm:gap-3">
                                {user.role === 'PROVIDER' && <NotificationDropdown />}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-1.5 sm:gap-2 border border-gray-200 rounded-full py-1 px-2 sm:py-1.5 sm:px-3 hover:shadow-md transition-all bg-white"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-xs sm:text-sm">
                                                {user.fullName?.charAt(0) || user.phone.slice(-2)}
                                            </span>
                                        </div>
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="font-semibold text-gray-900 truncate">{user.fullName || 'User'}</p>
                                                    <p className="text-sm text-gray-500">{user.phone}</p>
                                                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'LANDLORD'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {user.role === 'LANDLORD' ? '🏠 Landlord' : '🔑 Tenant'}
                                                    </span>
                                                </div>

                                                {/* Role-specific menu items */}
                                                <div className="py-1">
                                                    {user.role === 'LANDLORD' ? (
                                                        <>
                                                            <Link href="/my-properties" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>🏘️</span> My Properties
                                                            </Link>
                                                            <Link href="/list-property" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>➕</span> Add Property
                                                            </Link>
                                                            <Link href="/agreements" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>📄</span> Agreements
                                                            </Link>
                                                            <Link href="/landlord-analytics" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>📊</span> Analytics
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Link href="/unlocked-contacts" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>📞</span> My Contacts
                                                            </Link>
                                                            <Link href="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>❤️</span> Saved
                                                            </Link>
                                                            <Link href="/agreements" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>📄</span> Agreements
                                                            </Link>
                                                            <Link href="/services" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                                <span>🔧</span> Services
                                                            </Link>
                                                        </>
                                                    )}
                                                    <Link href="/messages" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                        <span>💬</span> Messages
                                                    </Link>
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-gray-100 pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <span>🚪</span> Log out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Logged Out State - Hide buttons on mobile, show in menu */
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 py-2 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Improved Design */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white py-3">
                        <nav className="flex flex-col">
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="text-lg">🏠</span>
                                <span className="font-medium">Browse Properties</span>
                            </Link>
                            <Link
                                href="/services"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="text-lg">🔧</span>
                                <span className="font-medium">Home Services</span>
                            </Link>
                            <Link
                                href="/agreements"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="text-lg">📄</span>
                                <span className="font-medium">Agreements</span>
                            </Link>
                            <Link
                                href="/pricing"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="text-lg">💰</span>
                                <span className="font-medium">Pricing</span>
                            </Link>
                            {user && (
                                <Link
                                    href="/messages"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="text-lg">💬</span>
                                    <span className="font-medium">Messages</span>
                                </Link>
                            )}
                            {user?.role === 'LANDLORD' && (
                                <Link
                                    href="/list-property"
                                    className="flex items-center gap-3 px-4 py-3 text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-lg mx-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="text-lg">➕</span>
                                    <span className="font-medium">List Property</span>
                                </Link>
                            )}

                            {/* Theme toggle for mobile */}
                            <div className="flex items-center justify-between px-4 py-3 mx-2 mt-2 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Theme</span>
                                <ThemeToggle />
                            </div>

                            {/* Auth buttons for mobile (when logged out) */}
                            {!user && (
                                <div className="flex gap-2 px-4 py-3 mx-2 mt-2 border-t border-gray-100">
                                    <Link
                                        href="/login"
                                        className="flex-1 text-center py-2.5 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="flex-1 text-center py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
