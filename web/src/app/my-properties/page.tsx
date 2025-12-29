'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Handle both cases: env var with or without /api suffix
const getApiUrl = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return base.endsWith('/api') ? base : `${base}/api`;
}
const API_URL = getApiUrl();

interface Property {
    id: string;
    title: string;
    neighborhood: string;
    city: string;
    price: number;
    status: string;
    viewCount: number;
    images: string[];
    createdAt: string;
}

export default function MyPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RENTED'>('ALL');

    useEffect(() => {
        fetchMyProperties();
    }, []);

    const fetchMyProperties = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/properties/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProperties(data.properties || data || []);
            }
        } catch (err) {
            console.error('Failed to fetch properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties.filter(p =>
        filter === 'ALL' || p.status === filter
    );

    const formatPrice = (price: number) => `GH₵${price?.toLocaleString() || 0}`;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'RENTED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
                        <p className="text-gray-500">{properties.length} properties listed</p>
                    </div>
                    <Link href="/list-property" className="btn-primary">
                        + Add New Property
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500">Total Properties</p>
                        <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500">Active Listings</p>
                        <p className="text-2xl font-bold text-green-600">
                            {properties.filter(p => p.status === 'ACTIVE').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {properties.reduce((sum, p) => sum + (p.viewCount || 0), 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500">Rented</p>
                        <p className="text-2xl font-bold text-pink-600">
                            {properties.filter(p => p.status === 'RENTED').length}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['ALL', 'ACTIVE', 'RENTED'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === status
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Properties List */}
                <div className="space-y-4">
                    {filteredProperties.map((property) => (
                        <div key={property.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                                {property.images?.[0] ? (
                                    <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(property.status)}`}>
                                        {property.status || 'ACTIVE'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{property.neighborhood}, {property.city}</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(property.price)}/month</p>
                            </div>
                            <div className="hidden md:flex items-center gap-6 text-center">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{property.viewCount || 0}</p>
                                    <p className="text-xs text-gray-500">Views</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/properties/${property.id}/edit`}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                >
                                    ✏️
                                </Link>
                                <Link
                                    href={`/properties/${property.id}`}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                >
                                    👁️
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProperties.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <p className="text-gray-500 mb-4">No properties found</p>
                        <Link href="/list-property" className="btn-primary inline-block">
                            List Your First Property
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
