'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 md:h-28">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
                        {/* Icon */}
                        <div className="w-9 h-9 sm:w-10 md:w-12 sm:h-10 md:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7">
                                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                                <path d="M12 5.432l8.159 8.159c.753.753 1.417.809 1.761.595.694-.43 1.08-1.579 1.08-2.686V19.5a2.25 2.25 0 01-2.25 2.25h-2.25a.75.75 0 01-.75-.75v-3.75a3 3 0 00-3-3h-3a3 3 0 00-3 3V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-8.08c0-1.163.42-2.312 1.157-2.668.375-.18 1.097-.202 1.84.54l8-8z" />
                            </svg>
                        </div>
                        {/* Text */}
                        <div className="flex flex-col">
                            <div className="flex items-baseline">
                                <span className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-gray-900">Free</span>
                                <span className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-orange-600">Wahala</span>
                            </div>
                            <span className="hidden sm:block text-[10px] md:text-xs font-medium text-gray-500 tracking-widest uppercase -mt-1 ml-0.5">Rent Direct. No Stress.</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Browse
                        </Link>
                        <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Services
                        </Link>
                        <Link href="/agreements" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Agreements
                        </Link>
                        <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Pricing
                        </Link>
                    </nav>

                    {/* Auth Buttons / User Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Only show "List your property" for landlords */}
                        {user?.role === 'LANDLORD' && (
                            <Link
                                href="/list-property"
                                className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                List your property
                            </Link>
                        )}

                        {user ? (
                            /* Logged In State */
                            <div className="flex items-center gap-4">
                                {user.role === 'PROVIDER' && <NotificationDropdown />}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 border border-gray-200 rounded-full py-1.5 px-3 hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {user.fullName?.charAt(0) || user.phone.slice(-2)}
                                            </span>
                                        </div>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0" onClick={() => setIsProfileOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="font-medium text-gray-900">{user.fullName || 'User'}</p>
                                                    <p className="text-sm text-gray-500">{user.phone}</p>
                                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${user.role === 'LANDLORD'
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : 'bg-pink-100 text-pink-600'
                                                        }`}>
                                                        {user.role === 'LANDLORD' ? '🏠 Landlord' : '🔑 Tenant'}
                                                    </span>
                                                </div>

                                                {/* Role-specific menu items */}
                                                {user.role === 'LANDLORD' ? (
                                                    <>
                                                        <Link href="/my-properties" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            🏘️ My Properties
                                                        </Link>
                                                        <Link href="/list-property" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            ➕ Add New Property
                                                        </Link>
                                                        <Link href="/agreements" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            📄 Rental Agreements
                                                        </Link>
                                                        <Link href="/landlord-analytics" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            📊 Analytics
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link href="/unlocked-contacts" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            📞 My Contacts
                                                        </Link>
                                                        <Link href="/favorites" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            ❤️ Saved Properties
                                                        </Link>
                                                        <Link href="/agreements" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            📄 My Agreements
                                                        </Link>
                                                        <Link href="/services" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                            🔧 Home Services
                                                        </Link>
                                                    </>
                                                )}

                                                <Link href="/my-reports" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                    🛡️ My Reports
                                                </Link>

                                                {/* Logout */}
                                                <div className="border-t border-gray-100 mt-2 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                                    >
                                                        Log out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Logged Out State */
                            <>
                                <Link
                                    href="/login"
                                    className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-4"
                                >
                                    Log in
                                </Link>

                                <Link
                                    href="/signup"
                                    className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-4"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isMenuOpen ? (
                                    <path d="M18 6L6 18M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <nav className="flex flex-col gap-3">
                            <Link href="/" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                Browse Properties
                            </Link>
                            <Link href="/services" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                Home Services
                            </Link>
                            <Link href="/agreements" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                Rental Agreements
                            </Link>
                            <Link href="/pricing" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                Pricing
                            </Link>
                            {user && (
                                <Link href="/messages" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    Messages
                                </Link>
                            )}
                            {user?.role === 'LANDLORD' && (
                                <Link href="/list-property" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    List your property
                                </Link>
                            )}
                            {user && (
                                <button onClick={handleLogout} className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg">
                                    Log out
                                </button>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

