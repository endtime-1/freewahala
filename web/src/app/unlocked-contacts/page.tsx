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

interface UnlockedContact {
    id: string;
    property: {
        id: string;
        title: string;
        neighborhood: string;
        city: string;
        price: number;
        images: string[];
    };
    owner: {
        fullName: string;
        phone: string;
        ghanaCardVerified: boolean;
    };
    unlockedAt: string;
}

export default function UnlockedContactsPage() {
    const [contacts, setContacts] = useState<UnlockedContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactsRemaining, setContactsRemaining] = useState(3);
    const [subscriptionTier, setSubscriptionTier] = useState('FREE');

    useEffect(() => {
        fetchUnlockedContacts();
        // Get user's subscription info
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setSubscriptionTier(user.subscriptionTier || 'FREE');
            } catch { }
        }
    }, []);

    const fetchUnlockedContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/contacts/unlocked`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setContacts(data.contacts || []);
                setContactsRemaining(data.remainingContacts ?? 3);
            }
        } catch (err) {
            console.error('Failed to fetch unlocked contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">Unlocked Contacts</h1>
                    <p className="text-gray-500 mt-1">Owner contacts you've unlocked</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Contacts Remaining Banner */}
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 mb-8 border border-pink-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Free contacts remaining this month</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-4xl font-bold text-pink-600">{contactsRemaining}</span>
                                <span className="text-gray-500">of 3</span>
                            </div>
                            {subscriptionTier === 'FREE' && (
                                <p className="text-sm text-gray-500 mt-2">Resets on the 1st of each month</p>
                            )}
                        </div>
                        {subscriptionTier === 'FREE' && (
                            <Link
                                href="/pricing"
                                className="btn-primary text-sm"
                            >
                                Upgrade for Unlimited
                            </Link>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all"
                            style={{ width: `${((3 - contactsRemaining) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Contacts List */}
                {contacts.length > 0 ? (
                    <div className="space-y-4">
                        {contacts.map((contact) => (
                            <div key={contact.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="flex gap-4">
                                    {/* Property Image */}
                                    <Link href={`/properties/${contact.property.id}`} className="shrink-0">
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-200">
                                            {contact.property.images?.[0] ? (
                                                <Image
                                                    src={contact.property.images[0]}
                                                    alt={contact.property.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/properties/${contact.property.id}`}>
                                            <h3 className="font-semibold text-gray-900 hover:text-pink-600">
                                                {contact.property.neighborhood}, {contact.property.city}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 truncate">{contact.property.title}</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">
                                            GH₵{formatPrice(contact.property.price)}/month
                                        </p>
                                    </div>

                                    {/* Owner Info */}
                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 justify-end">
                                            <span className="font-medium text-gray-900">{contact.owner.fullName}</span>
                                            {contact.owner.ghanaCardVerified && (
                                                <span className="text-green-600 text-xs">✓</span>
                                            )}
                                        </div>
                                        <a
                                            href={`tel:${contact.owner.phone}`}
                                            className="inline-flex items-center gap-2 mt-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                            </svg>
                                            Call
                                        </a>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Unlocked {formatDate(contact.unlockedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <div className="text-4xl mb-4">📞</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts unlocked yet</h3>
                        <p className="text-gray-500 mb-6">
                            When you unlock an owner's contact, it will appear here
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
