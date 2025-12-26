'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SubscriptionStatusProps {
    className?: string;
}

export default function SubscriptionStatus({ className = '' }: SubscriptionStatusProps) {
    const [tier, setTier] = useState('FREE');
    const [contactsRemaining, setContactsRemaining] = useState(3);
    const [contactsUsed, setContactsUsed] = useState(0);

    // In real app, fetch from API
    useEffect(() => {
        // Mock data
        setContactsUsed(2);
        setContactsRemaining(1);
    }, []);

    const tierInfo: Record<string, { name: string; color: string; contacts: number | string }> = {
        FREE: { name: 'Free', color: '#717171', contacts: 3 },
        BASIC: { name: 'Basic', color: '#2196F3', contacts: 15 },
        RELAX: { name: 'Relax', color: '#9C27B0', contacts: 40 },
        SUPERUSER: { name: 'SuperUser', color: '#FF385C', contacts: 'Unlimited' },
    };

    const currentTier = tierInfo[tier] || tierInfo.FREE;
    const maxContacts = typeof currentTier.contacts === 'number' ? currentTier.contacts : 999;
    const progressPercent = Math.min((contactsUsed / maxContacts) * 100, 100);

    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: currentTier.color + '20' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={currentTier.color}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Current Plan</p>
                        <p className="font-semibold" style={{ color: currentTier.color }}>
                            {currentTier.name}
                        </p>
                    </div>
                </div>

                {tier === 'FREE' && (
                    <Link href="/pricing" className="text-pink-600 text-sm font-medium hover:underline">
                        Upgrade →
                    </Link>
                )}
            </div>

            {/* Contacts Usage */}
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Contacts used this month</span>
                    <span className="font-medium">
                        {contactsUsed} / {currentTier.contacts}
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: progressPercent > 80 ? '#EF4444' : currentTier.color,
                        }}
                    />
                </div>
            </div>

            {tier === 'FREE' && contactsRemaining <= 1 && (
                <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Running low on contacts! Upgrade for more.
                </p>
            )}
        </div>
    );
}
