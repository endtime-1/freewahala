'use client';

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Analytics {
    bookingsByStatus: Record<string, number>;
    propertiesByType: Record<string, number>;
    topProviders: any[];
    revenueByTier: { tier: string; count: number; revenue: number }[];
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [analyticsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/analytics?period=${period}`),
                fetch(`${API_URL}/api/admin/stats`)
            ]);

            if (analyticsRes.ok) {
                setAnalytics(await analyticsRes.json());
            }
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
        } catch (error) {
            console.error('Fetch analytics error:', error);
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

    const totalRevenue = analytics?.revenueByTier?.reduce((sum, item) => sum + item.revenue, 0) || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1">Platform performance and insights</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                    <p className="text-white/80 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold mt-1">GH₵ {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.overview?.totalUsers || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <p className="text-gray-500 text-sm">Total Properties</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.overview?.totalProperties || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <p className="text-gray-500 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.overview?.totalBookings || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Booking Status</h3>
                    <div className="space-y-4">
                        {Object.entries(analytics?.bookingsByStatus || {}).map(([status, count]) => {
                            const total = Object.values(analytics?.bookingsByStatus || {}).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            const colors: Record<string, string> = {
                                PENDING: 'bg-yellow-500',
                                CONFIRMED: 'bg-blue-500',
                                IN_PROGRESS: 'bg-indigo-500',
                                COMPLETED: 'bg-green-500',
                                CANCELLED: 'bg-red-500'
                            };
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{status.replace(/_/g, ' ')}</span>
                                        <span className="font-medium text-gray-900">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${colors[status] || 'bg-gray-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Revenue by Tier */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Revenue by Subscription Tier</h3>
                    <div className="space-y-4">
                        {analytics?.revenueByTier?.map(item => {
                            const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                            const colors: Record<string, string> = {
                                FREE: 'bg-gray-400',
                                STARTER: 'bg-blue-500',
                                PRO: 'bg-purple-500',
                                ENTERPRISE: 'bg-orange-500'
                            };
                            return (
                                <div key={item.tier}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{item.tier} ({item.count} users)</span>
                                        <span className="font-medium text-gray-900">GH₵ {item.revenue}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${colors[item.tier] || 'bg-gray-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Property Types */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Properties by Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(analytics?.propertiesByType || {}).map(([type, count]) => (
                            <div key={type} className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{count}</p>
                                <p className="text-xs text-gray-500 mt-1">{type.replace(/_/g, ' ')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Providers */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Top Service Providers</h3>
                    <div className="space-y-3">
                        {analytics?.topProviders?.slice(0, 5).map((provider, idx) => (
                            <div key={provider.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{provider.businessName}</p>
                                    <p className="text-xs text-gray-500">{provider.user?.fullName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{provider._count?.bookings || 0}</p>
                                    <p className="text-xs text-gray-500">bookings</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
