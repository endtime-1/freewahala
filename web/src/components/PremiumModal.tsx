'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactsRemaining: number;
}

const TIERS = [
    { id: 'BASIC', name: 'Basic', price: 50, contacts: 15 },
    { id: 'RELAX', name: 'Relax', price: 100, contacts: 40, popular: true },
    { id: 'SUPERUSER', name: 'SuperUser', price: 200, contacts: 'Unlimited' },
];

export default function PremiumModal({ isOpen, onClose, contactsRemaining }: PremiumModalProps) {
    const [selectedTier, setSelectedTier] = useState('RELAX');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
                    <p className="text-gray-500 mt-2">
                        You've used all {3 - contactsRemaining} of your free contacts this month
                    </p>
                </div>

                {/* Tier Selection */}
                <div className="space-y-3 mb-6">
                    {TIERS.map((tier) => (
                        <button
                            key={tier.id}
                            onClick={() => setSelectedTier(tier.id)}
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedTier === tier.id
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTier === tier.id
                                            ? 'border-pink-500 bg-pink-500'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {selectedTier === tier.id && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                                        {tier.name}
                                        {tier.popular && (
                                            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {tier.contacts} contacts/month
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900">GH₵{tier.price}</div>
                                <div className="text-xs text-gray-500">/month</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Benefits */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">What you'll get:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Direct access to property owners
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            No agent fees - save GH₵500+ per rental
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Rental agreement templates
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Priority customer support
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <button className="w-full btn-primary py-4 text-lg">
                    Upgrade Now
                </button>

                {/* Skip */}
                <button
                    onClick={onClose}
                    className="w-full text-gray-500 text-sm mt-4 hover:text-gray-700"
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}
