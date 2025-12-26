'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RevenueStats {
    commissionRevenue: number;
    subscriptionRevenue: number;
    totalRevenue: number;
    bookingVolume: number;
    totalBookings: number;
    totalProviders: number;
    activeProviders: number;
}

interface SubscriptionBreakdown {
    FREE: number;
    FEATURED: number;
    PREMIUM: number;
}

interface RecentTransaction {
    id: string;
    type: 'COMMISSION' | 'SUBSCRIPTION';
    providerId: string;
    providerName: string;
    amount: number;
    date: string;
    description: string;
}

const MOCK_REVENUE: RevenueStats = {
    commissionRevenue: 15420,
    subscriptionRevenue: 4500,
    totalRevenue: 19920,
    bookingVolume: 128500,
    totalBookings: 412,
    totalProviders: 127,
    activeProviders: 89,
};

const MOCK_SUBSCRIPTIONS: SubscriptionBreakdown = {
    FREE: 89,
    FEATURED: 28,
    PREMIUM: 10,
};

const MOCK_TRANSACTIONS: RecentTransaction[] = [
    { id: '1', type: 'COMMISSION', providerId: 'p1', providerName: 'Kwame Electrical', amount: 48, date: '2024-12-22', description: 'Panel Upgrade booking' },
    { id: '2', type: 'SUBSCRIPTION', providerId: 'p2', providerName: 'Swift Cleaning', amount: 100, date: '2024-12-22', description: 'Featured subscription' },
    { id: '3', type: 'COMMISSION', providerId: 'p3', providerName: 'KM Plumbing', amount: 24, date: '2024-12-21', description: 'Pipe repair booking' },
    { id: '4', type: 'SUBSCRIPTION', providerId: 'p4', providerName: 'Pro Painters', amount: 250, date: '2024-12-21', description: 'Premium subscription' },
    { id: '5', type: 'COMMISSION', providerId: 'p1', providerName: 'Kwame Electrical', amount: 18, date: '2024-12-20', description: 'Wiring installation' },
];

export default function AdminServicesRevenuePage() {
    const [stats] = useState<RevenueStats>(MOCK_REVENUE);
    const [subscriptions] = useState<SubscriptionBreakdown>(MOCK_SUBSCRIPTIONS);
    const [transactions] = useState<RecentTransaction[]>(MOCK_TRANSACTIONS);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;

    return (
        <div className="space-y-6">
            {/* Page Controls */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-gray-500">Platform earnings from home services</p>
                </div>
                <div className="flex items-center gap-2">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${timeRange === range
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            This {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="">
                {/* Revenue Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                        <p className="text-white/80 text-sm mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                        <p className="text-sm text-white/80 mt-2">↑ 12% vs last month</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">Commission Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.commissionRevenue)}</p>
                        <p className="text-sm text-gray-500 mt-2">From {stats.totalBookings} bookings</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">Subscription Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.subscriptionRevenue)}</p>
                        <p className="text-sm text-gray-500 mt-2">{subscriptions.FEATURED + subscriptions.PREMIUM} paid providers</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">Booking Volume</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.bookingVolume)}</p>
                        <p className="text-sm text-gray-500 mt-2">Total service value</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Subscription Breakdown */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Provider Subscriptions</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                                    <span className="text-gray-700">Free Tier</span>
                                </div>
                                <span className="font-semibold text-gray-900">{subscriptions.FREE}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <span className="text-gray-700">Featured (GH₵100/mo)</span>
                                </div>
                                <span className="font-semibold text-gray-900">{subscriptions.FEATURED}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                                    <span className="text-gray-700">Premium (GH₵250/mo)</span>
                                </div>
                                <span className="font-semibold text-gray-900">{subscriptions.PREMIUM}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Total Providers</span>
                                <span className="font-semibold">{stats.totalProviders}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-gray-500">Active This Month</span>
                                <span className="font-semibold text-green-600">{stats.activeProviders}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                            <Link href="/admin/transactions" className="text-teal-600 text-sm font-medium">
                                View All →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                        <th className="pb-3 font-medium">Type</th>
                                        <th className="pb-3 font-medium">Provider</th>
                                        <th className="pb-3 font-medium">Description</th>
                                        <th className="pb-3 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn.id} className="border-b border-gray-50">
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${txn.type === 'COMMISSION'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-900">{txn.providerName}</td>
                                            <td className="py-3 text-gray-500 text-sm">{txn.description}</td>
                                            <td className="py-3 text-right font-semibold text-green-600">
                                                +{formatPrice(txn.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Commission Rates Info */}
                <div className="mt-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/80 text-sm">Free Tier</p>
                            <p className="text-2xl font-bold">12%</p>
                            <p className="text-sm text-white/60">Per booking</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/80 text-sm">Featured Tier</p>
                            <p className="text-2xl font-bold">10%</p>
                            <p className="text-sm text-white/60">+ GH₵100/month</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/80 text-sm">Premium Tier</p>
                            <p className="text-2xl font-bold">8%</p>
                            <p className="text-sm text-white/60">+ GH₵250/month</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
