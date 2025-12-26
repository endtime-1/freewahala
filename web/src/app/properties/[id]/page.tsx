'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PremiumModal from '@/components/PremiumModal';
import { useTheme } from '@/context/ThemeContext';

const PROPERTY = {
    id: '1',
    title: 'Modern 2 Bedroom Apartment in East Legon',
    description: `Beautiful and spacious 2-bedroom apartment in East Legon. Newly renovated with modern finishes - tiled floors, pop ceiling, and fitted kitchen.

Secure, walled compound with 24-hour security. Prepaid meter and constant water from borehole.

Perfect for professionals or small families in Accra's most sought-after neighborhood.`,
    price: 3500,
    rentAdvancePeriod: 'ONE_YEAR',
    propertyType: 'TWO_BEDROOM',
    region: 'Greater Accra',
    city: 'Accra',
    neighborhood: 'East Legon',
    address: 'Near A&C Mall, East Legon',
    images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    ],
    amenities: { hasSelfMeter: true, waterFlow: 'CONSTANT', isWalledGated: true, hasPopCeiling: true, hasTiledFloor: true, noLandlordOnCompound: true, hasKitchenCabinet: true, isNewlyBuilt: true, hasParking: true },
    priceTag: 'GREAT_VALUE',
    verificationStatus: true,
    neighborhoodAvgPrice: 4000,
    owner: { id: '1', fullName: 'Kofi Mensah', ghanaCardVerified: true, memberSince: '2023' },
};

const amenityLabels: Record<string, { label: string; icon: string }> = {
    hasSelfMeter: { label: 'Self Meter (Prepaid)', icon: '⚡' },
    waterFlow: { label: 'Constant Water', icon: '💧' },
    isWalledGated: { label: 'Walled & Gated', icon: '🏰' },
    hasPopCeiling: { label: 'Pop Ceiling', icon: '🏛️' },
    hasTiledFloor: { label: 'Tiled Floor', icon: '🔲' },
    noLandlordOnCompound: { label: 'No Landlord', icon: '🏠' },
    hasKitchenCabinet: { label: 'Kitchen Cabinet', icon: '🍳' },
    isNewlyBuilt: { label: 'Newly Built', icon: '✨' },
    hasParking: { label: 'Parking Space', icon: '🚗' },
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
    const { isDark } = useTheme();
    const [currentImage, setCurrentImage] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [contactUnlocked, setContactUnlocked] = useState(false);
    const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
    const [contactsRemaining, setContactsRemaining] = useState(0);

    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);

    const handleUnlockContact = async () => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        if (contactsRemaining <= 0) { setShowPremiumModal(true); return; }
        setContactUnlocked(true);
        setOwnerPhone('+233 24 XXX XXXX');
        setContactsRemaining(prev => prev - 1);
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-white'}`}>
            {/* Image Gallery */}
            <div className="relative h-[50vh] md:h-[60vh] bg-gray-900">
                <Image src={PROPERTY.images[currentImage]} alt={PROPERTY.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Back Button */}
                <Link href="/" className={`absolute top-4 left-4 w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg transition-all ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/90 hover:bg-white'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </Link>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-3">
                    <button className={`w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/90 hover:bg-white'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
                    </button>
                    <button onClick={() => setIsFavorited(!isFavorited)} className={`w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/90 hover:bg-white'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" stroke={isFavorited ? '#FF385C' : 'currentColor'} fill={isFavorited ? '#FF385C' : 'none'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                </div>

                {/* Image Dots */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                    {PROPERTY.images.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentImage(idx)} className={`h-2 rounded-full transition-all ${idx === currentImage ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
                    ))}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 left-4">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        ✓ Great Value - GH₵{formatPrice(PROPERTY.neighborhoodAvgPrice - PROPERTY.price)} below average
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`max-w-4xl mx-auto px-4 py-8 pb-32 ${isDark ? '' : ''}`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{PROPERTY.title}</h1>
                        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{PROPERTY.neighborhood}, {PROPERTY.city}</p>
                    </div>
                    {PROPERTY.verificationStatus && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            Verified
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-8">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>GH₵</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{formatPrice(PROPERTY.price)}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/month</span>
                    <span className={`mx-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>1 year advance</span>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(PROPERTY.amenities).map(([key, value]) => {
                            if (!value || key === 'waterFlow') return null;
                            const amenity = amenityLabels[key];
                            if (!amenity) return null;
                            return (
                                <div key={key} className={`flex items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="text-2xl">{amenity.icon}</span>
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{amenity.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>About this property</h3>
                    <p className={`whitespace-pre-line leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{PROPERTY.description}</p>
                </div>

                {/* Owner Info */}
                <div className={`border-t pt-6 mb-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Property Owner</h3>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20' : 'bg-gray-200'}`}>
                            <span className="text-2xl">👤</span>
                        </div>
                        <div>
                            <div className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {PROPERTY.owner.fullName}
                                {PROPERTY.owner.ghanaCardVerified && (
                                    <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded-full">✓ ID Verified</span>
                                )}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Member since {PROPERTY.owner.memberSince}</div>
                        </div>
                    </div>
                </div>

                {/* Report */}
                <div className="text-center">
                    <button className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>🚩 Report this listing</button>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 backdrop-blur-xl border-t ${isDark ? 'bg-[#0a0a0f]/90 border-white/10' : 'bg-white/90 border-gray-200'}`}>
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                    <div>
                        <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Monthly Rent</div>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>GH₵{formatPrice(PROPERTY.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Message Button */}
                        <Link
                            href={`/messages?new=true&recipientId=${PROPERTY.owner.id}&propertyId=${PROPERTY.id}&type=PROPERTY_INQUIRY`}
                            className={`flex items-center gap-2 px-4 py-4 rounded-2xl font-semibold transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Message</span>
                        </Link>

                        {/* Contact Button */}
                        {contactUnlocked ? (
                            <a href={`tel:${ownerPhone}`} className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/30">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                                <span className="hidden sm:inline">Call</span> {ownerPhone}
                            </a>
                        ) : (
                            <button onClick={handleUnlockContact} className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Contact Owner
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} contactsRemaining={contactsRemaining} />
        </div>
    );
}
