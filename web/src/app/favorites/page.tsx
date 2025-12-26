'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    image: string;
}

const MOCK_FAVORITES: Property[] = [
    {
        id: '1',
        title: 'Modern 2 Bedroom Apartment',
        location: 'East Legon, Accra',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    },
    {
        id: '3',
        title: 'Executive 3 Bedroom House',
        location: 'Airport Residential, Accra',
        price: 8000,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    },
];

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Property[]>(MOCK_FAVORITES);

    const removeFavorite = (id: string) => {
        setFavorites(prev => prev.filter(p => p.id !== id));
    };

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;

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
                                <Link href={`/properties/${property.id}`} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                    <Image src={property.image} alt={property.title} fill className="object-cover hover:scale-105 transition-transform" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/properties/${property.id}`}>
                                        <h3 className="font-semibold text-gray-900 truncate hover:text-pink-600">{property.title}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500">{property.location}</p>
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
