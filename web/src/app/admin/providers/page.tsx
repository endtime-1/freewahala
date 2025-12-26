'use client';

import React, { useState, useEffect } from 'react';

interface Provider {
    id: string;
    businessName: string;
    serviceType: string;
    description: string;
    verified: boolean;
    rating: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        phone: string;
        ghanaCardVerified: boolean;
    };
    _count: {
        bookings: number;
        reviews: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const SERVICE_TYPES = [
    'ELECTRICIAN', 'PLUMBER', 'PAINTER', 'CLEANER', 'AC_TECHNICIAN',
    'CARPENTER', 'PACKERS_MOVERS', 'TILER', 'MASON', 'GENERAL_HANDYMAN'
];

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [serviceFilter, setServiceFilter] = useState('ALL');
    const [verifiedFilter, setVerifiedFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProviders();
    }, [page, serviceFilter, verifiedFilter]);

    const fetchProviders = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                serviceType: serviceFilter,
                verified: verifiedFilter === 'ALL' ? '' : verifiedFilter,
                ...(search && { search })
            });

            const response = await fetch(`${API_URL}/api/admin/providers?${params}`);
            const data = await response.json();

            if (response.ok) {
                setProviders(data.providers);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Fetch providers error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProvider = async (providerId: string, updates: any) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/providers/${providerId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                fetchProviders();
            }
        } catch (error) {
            console.error('Update provider error:', error);
        }
    };

    const getServiceIcon = (type: string) => {
        const icons: Record<string, string> = {
            ELECTRICIAN: '⚡', PLUMBER: '🔧', PAINTER: '🎨', CLEANER: '✨',
            AC_TECHNICIAN: '❄️', CARPENTER: '🪚', PACKERS_MOVERS: '📦',
            TILER: '🔲', MASON: '🧱', GENERAL_HANDYMAN: '🛠️'
        };
        return icons[type] || '🔧';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
                <p className="text-gray-500 text-sm mt-1">Manage service provider accounts and verification</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search providers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <select
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl"
                    >
                        <option value="ALL">All Services</option>
                        {SERVICE_TYPES.map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    <select
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl"
                    >
                        <option value="ALL">All Status</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                    <button
                        onClick={fetchProviders}
                        className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Providers Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : providers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No providers found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Service</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stats</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {providers.map((provider) => (
                                <tr key={provider.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                                                {getServiceIcon(provider.serviceType)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{provider.businessName}</p>
                                                <p className="text-sm text-gray-500">{provider.user?.fullName} • {provider.user?.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                            {provider.serviceType.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-gray-900">{provider._count.bookings} bookings</p>
                                            <p className="text-gray-500">⭐ {provider.rating?.toFixed(1) || '0.0'} ({provider._count.reviews} reviews)</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {provider.verified ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Provider Verified
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not Verified</span>
                                            )}
                                            {provider.user?.ghanaCardVerified && (
                                                <span className="text-blue-600 text-xs">Ghana Card ✓</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleUpdateProvider(provider.id, { verified: !provider.verified })}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${provider.verified
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                            >
                                                {provider.verified ? 'Revoke' : 'Verify'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
