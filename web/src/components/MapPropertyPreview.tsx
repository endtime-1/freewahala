'use client';

import { Property } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface MapPropertyPreviewProps {
    property: Property;
    onClose: () => void;
}

export default function MapPropertyPreview({ property, onClose }: MapPropertyPreviewProps) {
    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);

    const images = property.images as string[] || [];
    const mainImage = images[0] || '/placeholder-property.jpg';

    return (
        <div className="absolute bottom-4 left-4 right-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="flex">
                    {/* Image */}
                    <div className="relative w-32 h-32 shrink-0">
                        <Image
                            src={mainImage}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                        {property.priceTag === 'GREAT_VALUE' && (
                            <div className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                                Great Value
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {property.neighborhood}, {property.city}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {property.propertyType.replace(/_/g, ' ').toLowerCase()}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            {property.hasSelfMeter && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">⚡ Self Meter</span>
                            )}
                            {property.isWalledGated && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">🏰 Gated</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div>
                                <span className="text-gray-500 text-sm">GH₵</span>
                                <span className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</span>
                                <span className="text-gray-500 text-sm">/mo</span>
                            </div>
                            <Link
                                href={`/properties/${property.id}`}
                                className="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
