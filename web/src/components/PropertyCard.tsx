'use client';

import { Property } from '@/lib/api';
import Image from 'next/image';
import { useState } from 'react';

interface PropertyCardProps {
    property: Property;
    onFavorite?: (id: string) => void;
    onClick?: (id: string) => void;
}

export default function PropertyCard({ property, onFavorite, onClick }: PropertyCardProps) {
    const [imageIndex, setImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);

    const images = property.images as string[] || [];
    const currentImage = images[imageIndex] || '/placeholder-property.jpg';

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-GH').format(price);
    };

    const formatAdvancePeriod = (period: string) => {
        const map: Record<string, string> = {
            'SIX_MONTHS': '6 months',
            'ONE_YEAR': '1 year',
            'TWO_YEARS': '2 years',
            'THREE_YEARS': '3 years',
        };
        return map[period] || period;
    };

    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFavorited(!isFavorited);
        onFavorite?.(property.id);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="property-card" onClick={() => onClick?.(property.id)}>
            {/* Image Carousel */}
            <div className="image-container relative">
                <Image
                    src={currentImage}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Favorite Button */}
                <button
                    className={`favorite-btn ${isFavorited ? 'active' : ''}`}
                    onClick={handleFavorite}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Image Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handlePrevImage}
                        >
                            ‹
                        </button>
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleNextImage}
                        >
                            ›
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === imageIndex ? 'bg-white w-2' : 'bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Price Tag Badge */}
                {property.priceTag && (
                    <div className={`price-tag absolute top-3 left-3 ${property.priceTag === 'GREAT_VALUE' ? 'great-value' :
                            property.priceTag === 'OVERPRICED' ? 'overpriced' : 'fair'
                        }`}>
                        {property.priceTag === 'GREAT_VALUE' && '✓ Great Value'}
                        {property.priceTag === 'FAIR' && '○ Fair Price'}
                        {property.priceTag === 'OVERPRICED' && '⚠ Above Average'}
                    </div>
                )}

                {/* Verified Badge */}
                {property.verificationStatus && (
                    <div className="verified-badge absolute bottom-3 left-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        Verified
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                        {property.neighborhood}, {property.city}
                    </h3>
                    {property.owner?.ghanaCardVerified && (
                        <span className="text-green-600 text-xs">✓</span>
                    )}
                </div>

                <p className="text-gray-500 text-sm mb-2 line-clamp-1">
                    {property.propertyType.replace(/_/g, ' ').toLowerCase()} • {formatAdvancePeriod(property.rentAdvancePeriod)} advance
                </p>

                {/* Quick Amenities */}
                <div className="flex gap-2 mb-3 text-xs text-gray-500">
                    {property.hasSelfMeter && <span className="bg-gray-100 px-2 py-0.5 rounded">Self Meter</span>}
                    {property.isWalledGated && <span className="bg-gray-100 px-2 py-0.5 rounded">Gated</span>}
                    {property.isNewlyBuilt && <span className="bg-gray-100 px-2 py-0.5 rounded">Newly Built</span>}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="price-currency">GH₵</span>
                    <span className="price-amount">{formatPrice(property.price)}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                </div>
            </div>
        </div>
    );
}
