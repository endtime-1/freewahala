'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Call backend admin login API
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store admin session with JWT token
            localStorage.setItem('adminAuth', JSON.stringify({
                token: data.token,
                user: data.user,
                loginTime: new Date().toISOString()
            }));

            // Also store token separately for API calls
            localStorage.setItem('adminToken', data.token);

            // Redirect to admin dashboard
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                                <path d="M12 5.432l8.159 8.159c.753.753 1.417.809 1.761.595.694-.43 1.08-1.579 1.08-2.686V19.5a2.25 2.25 0 01-2.25 2.25h-2.25a.75.75 0 01-.75-.75v-3.75a3 3 0 00-3-3h-3a3 3 0 00-3 3V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-8.08c0-1.163.42-2.312 1.157-2.668.375-.18 1.097-.202 1.84.54l8-8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                Free<span className="text-orange-500">Wahala</span>
                            </h1>
                            <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Sign in to access the admin dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@freewahala.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <p className="text-orange-400 text-xs font-medium mb-2">Demo Credentials:</p>
                        <p className="text-gray-400 text-xs">Email: admin@freewahala.com</p>
                        <p className="text-gray-400 text-xs">Password: admin123</p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2024 FreeWahala. All rights reserved.
                </p>
            </div>
        </div>
    );
}
