'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandlordAnalyticsPage() {
    const stats = {
        totalViews: 1245,
        totalInquiries: 67,
        contactsUnlocked: 23,
        activeListings: 3,
        avgResponseTime: '2.5 hrs',
        conversionRate: '34%',
    };

    const monthlyData = [
        { month: 'Oct', views: 320, inquiries: 15 },
        { month: 'Nov', views: 445, inquiries: 22 },
        { month: 'Dec', views: 480, inquiries: 30 },
    ];

    const topProperties = [
        { id: '1', title: 'Modern 2BR Apartment', views: 245, inquiries: 12 },
        { id: '2', title: 'Chamber and Hall', views: 189, inquiries: 8 },
        { id: '3', title: 'Single Room', views: 156, inquiries: 5 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Property Analytics</h1>
                    <p className="text-gray-500">Track your listings performance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Inquiries</p>
                        <p className="text-2xl font-bold text-pink-600">{stats.totalInquiries}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Contacts Unlocked</p>
                        <p className="text-2xl font-bold text-green-600">{stats.contactsUnlocked}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Active Listings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Avg Response</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Conversion</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Monthly Trend */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <h2 className="font-semibold text-gray-900 mb-4">Monthly Performance</h2>
                        <div className="space-y-4">
                            {monthlyData.map((month) => (
                                <div key={month.month} className="flex items-center gap-4">
                                    <span className="w-8 text-sm text-gray-500">{month.month}</span>
                                    <div className="flex-1">
                                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                                                style={{ width: `${(month.views / 500) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                        {month.views} views
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Properties */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <h2 className="font-semibold text-gray-900 mb-4">Top Performing Properties</h2>
                        <div className="space-y-4">
                            {topProperties.map((property, idx) => (
                                <div key={property.id} className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            idx === 1 ? 'bg-gray-100 text-gray-600' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{property.title}</p>
                                        <p className="text-sm text-gray-500">{property.views} views • {property.inquiries} inquiries</p>
                                    </div>
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="text-sm text-pink-600 hover:underline"
                                    >
                                        View
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="font-semibold text-purple-900 mb-2">💡 Tips to Get More Inquiries</h3>
                    <ul className="text-sm text-purple-700 space-y-2">
                        <li>• Add high-quality photos showing all rooms</li>
                        <li>• Keep your price competitive with market rates</li>
                        <li>• Respond to inquiries within 2 hours</li>
                        <li>• Complete Ghana Card verification for trust badge</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
