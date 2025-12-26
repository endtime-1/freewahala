'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardStats {
    overview: {
        totalUsers: number;
        totalProperties: number;
        totalProviders: number;
        totalBookings: number;
        pendingVerifications: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
    };
    bookingStats: Record<string, number>;
    recentUsers: any[];
    recentBookings: any[];
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/stats`);
            if (response.ok) {
                setStats(await response.json());
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="text-white/80 text-sm font-semibold">Monthly</span>
                    </div>
                    <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">GH₵ {stats?.overview?.monthlyRevenue?.toLocaleString() || '0'}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <Link href="/admin/users" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.totalUsers?.toLocaleString() || '0'}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <Link href="/admin/properties" className="text-purple-600 text-sm font-semibold hover:underline">View All</Link>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Properties</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.totalProperties?.toLocaleString() || '0'}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="text-yellow-500 text-sm font-semibold">Pending</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Pending Verifications</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.pendingVerifications || '0'}</h3>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Service Providers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalProviders || '0'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalBookings || '0'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Active Subscriptions</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.overview?.activeSubscriptions || '0'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Users */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
                        <Link href="/admin/users" className="text-sm font-medium text-orange-600 hover:text-orange-700">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {stats?.recentUsers?.map((user) => (
                            <div key={user.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                    {user.fullName?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{user.fullName || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{user.phone} • {user.role}</p>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                            <p className="text-center text-gray-500 py-4">No recent users</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/admin/users" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-orange-900">Manage Users</span>
                        </Link>
                        <Link href="/admin/properties" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-orange-900">Review Properties</span>
                        </Link>
                        <Link href="/admin/providers" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-orange-900">Verify Providers</span>
                        </Link>
                        <Link href="/admin/analytics" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-orange-900">View Analytics</span>
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-orange-900">System Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
