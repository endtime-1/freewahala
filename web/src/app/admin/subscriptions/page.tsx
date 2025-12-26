'use client';

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Revenue Models by User Role
// 1. TENANTS: Subscription plans to unlock landlord contacts
// 2. LANDLORDS: Ad Boosting packages to promote properties
// 3. SERVICE PROVIDERS: Commission on completed bookings

interface Subscription {
    id: string;
    tier: string;
    status: string;
    contactsRemaining: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        phone: string;
        email: string | null;
        role: string;
    };
}

const TENANT_TIERS = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
const TENANT_TIER_PRICES: Record<string, number> = { FREE: 0, STARTER: 29, PRO: 79, ENTERPRISE: 199 };
const TIER_COLORS: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-700',
    STARTER: 'bg-blue-100 text-blue-700',
    PRO: 'bg-purple-100 text-purple-700',
    ENTERPRISE: 'bg-orange-100 text-orange-700'
};

// Landlord Ad Boost Packages
const AD_BOOST_PACKAGES = [
    { name: 'Basic Boost', price: 20, duration: '7 days', features: ['Homepage featured', 'Priority in search'] },
    { name: 'Premium Boost', price: 50, duration: '14 days', features: ['Homepage featured', 'Priority search', 'Badge indicator', 'Social promotion'] },
    { name: 'Ultimate Boost', price: 100, duration: '30 days', features: ['All Premium features', 'Top placement', 'Email blast', 'Dedicated support'] }
];

// Service Provider Commission Rate
const COMMISSION_RATE = 10; // 10% of booking value

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [tierStats, setTierStats] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tenant' | 'landlord' | 'provider'>('tenant');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchSubscriptions();
    }, [page]);

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: 'ACTIVE'
            });

            const response = await fetch(`${API_URL}/api/admin/subscriptions?${params}`);
            const data = await response.json();

            if (response.ok) {
                setSubscriptions(data.subscriptions);
                setTierStats(data.tierStats || {});
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Fetch subscriptions error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const tenantRevenue = Object.entries(tierStats).reduce((sum, [tier, count]) => {
        return sum + (TENANT_TIER_PRICES[tier] || 0) * count;
    }, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Revenue & Monetization</h1>
                <p className="text-gray-500 text-sm mt-1">Manage subscriptions, ad boosts, and commissions</p>
            </div>

            {/* Revenue Model Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 p-2 inline-flex gap-2">
                <button
                    onClick={() => setActiveTab('tenant')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'tenant'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    🏠 Tenant Subscriptions
                </button>
                <button
                    onClick={() => setActiveTab('landlord')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'landlord'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    📢 Landlord Ad Boosting
                </button>
                <button
                    onClick={() => setActiveTab('provider')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'provider'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    🔧 Provider Commissions
                </button>
            </div>

            {/* TENANT SUBSCRIPTIONS TAB */}
            {activeTab === 'tenant' && (
                <div className="space-y-6">
                    {/* Explanation Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🏠</span>
                            <div>
                                <h3 className="font-bold text-blue-900">Tenant Subscription Model</h3>
                                <p className="text-blue-700 text-sm mt-1">
                                    Tenants pay monthly subscription fees to unlock landlord contact information.
                                    Higher tiers get more contact unlocks and premium features.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                            <p className="text-white/80 text-sm font-medium">Monthly Revenue</p>
                            <p className="text-3xl font-bold mt-2">GH₵ {tenantRevenue.toLocaleString()}</p>
                            <p className="text-white/60 text-xs mt-1">From tenant subscriptions</p>
                        </div>
                        {TENANT_TIERS.map(tier => (
                            <div key={tier} className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${TIER_COLORS[tier]}`}>
                                        {tier}
                                    </span>
                                    <span className="text-sm text-gray-500">GH₵{TENANT_TIER_PRICES[tier]}/mo</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mt-3">{tierStats[tier] || 0}</p>
                                <p className="text-sm text-gray-500">tenants</p>
                            </div>
                        ))}
                    </div>

                    {/* Subscriptions Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-900">Active Tenant Subscriptions</h3>
                        </div>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tenant</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contacts Left</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Started</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subscriptions.filter(s => s.user?.role === 'TENANT' || !s.user?.role).map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{sub.user?.fullName}</p>
                                                <p className="text-sm text-gray-500">{sub.user?.phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${TIER_COLORS[sub.tier]}`}>
                                                    {sub.tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{sub.contactsRemaining}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* LANDLORD AD BOOSTING TAB */}
            {activeTab === 'landlord' && (
                <div className="space-y-6">
                    {/* Explanation Banner */}
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📢</span>
                            <div>
                                <h3 className="font-bold text-purple-900">Landlord Ad Boosting Model</h3>
                                <p className="text-purple-700 text-sm mt-1">
                                    Property owners pay to boost their listings for more visibility.
                                    Boosted properties appear higher in search results and on the homepage.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ad Boost Packages */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {AD_BOOST_PACKAGES.map((pkg, idx) => (
                            <div key={pkg.name} className={`bg-white rounded-2xl border-2 p-6 ${idx === 1 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-200'}`}>
                                {idx === 1 && (
                                    <span className="inline-block px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full mb-4">POPULAR</span>
                                )}
                                <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold text-purple-600">GH₵{pkg.price}</span>
                                    <span className="text-gray-500">/ {pkg.duration}</span>
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {pkg.features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Active Boosts (Mock Data) */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Active Property Boosts</h3>
                        <div className="text-center py-8 text-gray-500">
                            <span className="text-4xl mb-2 block">📊</span>
                            <p>No active boosts at the moment</p>
                            <p className="text-sm mt-1">Landlords can boost their properties from their dashboard</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVICE PROVIDER COMMISSIONS TAB */}
            {activeTab === 'provider' && (
                <div className="space-y-6">
                    {/* Explanation Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🔧</span>
                            <div>
                                <h3 className="font-bold text-green-900">Service Provider Commission Model</h3>
                                <p className="text-green-700 text-sm mt-1">
                                    Service providers (plumbers, electricians, movers, etc.) pay a {COMMISSION_RATE}% commission
                                    on completed bookings. This is deducted automatically from their payouts.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Commission Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                            <p className="text-white/80 text-sm font-medium">Commission Rate</p>
                            <p className="text-4xl font-bold mt-2">{COMMISSION_RATE}%</p>
                            <p className="text-white/60 text-xs mt-1">Per completed booking</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <p className="text-gray-500 text-sm">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                            <p className="text-xs text-gray-400 mt-1">This month</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <p className="text-gray-500 text-sm">Booking Value</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">GH₵ 0</p>
                            <p className="text-xs text-gray-400 mt-1">This month</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <p className="text-gray-500 text-sm">Commission Earned</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">GH₵ 0</p>
                            <p className="text-xs text-gray-400 mt-1">This month</p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">How Commission Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">1️⃣</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">Tenant Books</h4>
                                <p className="text-sm text-gray-500 mt-1">Tenant books a service from a provider</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">2️⃣</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">Service Done</h4>
                                <p className="text-sm text-gray-500 mt-1">Provider completes the service</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">3️⃣</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">Payment Made</h4>
                                <p className="text-sm text-gray-500 mt-1">Tenant pays through the platform</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">4️⃣</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">{COMMISSION_RATE}% Deducted</h4>
                                <p className="text-sm text-gray-500 mt-1">Platform takes commission, rest goes to provider</p>
                            </div>
                        </div>
                    </div>

                    {/* Commission Settings */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Commission Settings</h3>
                        <div className="flex items-center justify-between max-w-md">
                            <div>
                                <p className="font-medium text-gray-900">Platform Commission Rate</p>
                                <p className="text-sm text-gray-500">Applied to all service bookings</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    defaultValue={COMMISSION_RATE}
                                    className="w-20 px-4 py-2 border border-gray-200 rounded-xl text-center font-bold text-lg"
                                />
                                <span className="text-gray-500 font-medium">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
