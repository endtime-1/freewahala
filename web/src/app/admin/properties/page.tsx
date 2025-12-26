'use client';

import React, { useState, useEffect } from 'react';

interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    propertyType: string;
    status: string;
    verified: boolean;
    featured: boolean;
    createdAt: string;
    images: string[];
    owner: {
        id: string;
        fullName: string;
        phone: string;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [verifiedFilter, setVerifiedFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    useEffect(() => {
        fetchProperties();
    }, [page, statusFilter, verifiedFilter]);

    const fetchProperties = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: statusFilter,
                verified: verifiedFilter === 'ALL' ? '' : verifiedFilter,
                ...(search && { search })
            });

            const response = await fetch(`${API_URL}/api/admin/properties?${params}`);
            const data = await response.json();

            if (response.ok) {
                setProperties(data.properties);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Fetch properties error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProperties();
    };

    const handleUpdateProperty = async (propertyId: string, updates: any) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/properties/${propertyId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                fetchProperties();
                setSelectedProperty(null);
            }
        } catch (error) {
            console.error('Update property error:', error);
        }
    };

    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/properties/${propertyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchProperties();
            }
        } catch (error) {
            console.error('Delete property error:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and manage property listings</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                            <p className="text-sm text-gray-500">Total Properties</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.status === 'PENDING').length}</p>
                            <p className="text-sm text-gray-500">Pending Review</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.verified).length}</p>
                            <p className="text-sm text-gray-500">Verified</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.featured).length}</p>
                            <p className="text-sm text-gray-500">Featured</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by title, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <select
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl"
                    >
                        <option value="ALL">All Verification</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No properties found
                    </div>
                ) : (
                    properties.map((property) => (
                        <div key={property.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Image */}
                            <div className="relative h-48 bg-gray-100">
                                {property.images?.[0] ? (
                                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(property.status)}`}>
                                        {property.status}
                                    </span>
                                    {property.featured && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            Featured
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{property.location}</p>
                                <p className="text-lg font-bold text-orange-600 mt-2">{formatPrice(property.price)}/month</p>

                                {/* Owner */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {property.owner?.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{property.owner?.fullName}</p>
                                        <p className="text-xs text-gray-500">{property.owner?.phone}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    {property.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateProperty(property.id, { status: 'APPROVED', verified: true })}
                                                className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUpdateProperty(property.id, { status: 'REJECTED' })}
                                                className="flex-1 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {property.status !== 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateProperty(property.id, { featured: !property.featured })}
                                                className={`flex-1 py-2 rounded-xl text-sm font-medium ${property.featured ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {property.featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProperty(property.id)}
                                                className="py-2 px-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
