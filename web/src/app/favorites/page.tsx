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
    images: string[];
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/properties/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFavorites(data.properties || data || []);
            }
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/properties/${id}/favorite`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFavorites(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    const formatPrice = (price: number) => `GH₵${(price || 0).toLocaleString()}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
                    <p className="text-gray-500">{favorites.length} properties saved</p>
                </div>

                {favorites.length > 0 ? (
                    <div className="space-y-4">
                        {favorites.map((property) => (
                            <div key={property.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                                <Link href={`/properties/${property.id}`} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                                    {property.images?.[0] ? (
                                        <Image src={property.images[0]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/properties/${property.id}`}>
                                        <h3 className="font-semibold text-gray-900 truncate hover:text-pink-600">{property.title}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500">{property.neighborhood}, {property.city}</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(property.price)}/month</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="btn-primary text-sm px-4 py-2"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => removeFavorite(property.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                        title="Remove from favorites"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-4xl mb-4">❤️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties yet</h3>
                        <p className="text-gray-500 mb-6">
                            Start browsing and click the heart icon to save properties you like.
                        </p>
                        <Link href="/" className="btn-primary inline-block">
                            Browse Properties
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
