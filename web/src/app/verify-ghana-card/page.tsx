'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VerificationState {
    status: 'idle' | 'verifying' | 'success' | 'failed';
    message?: string;
}

export default function GhanaCardVerificationPage() {
    const [ghanaCardNumber, setGhanaCardNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [verification, setVerification] = useState<VerificationState>({ status: 'idle' });

    const formatGhanaCard = (value: string) => {
        // Format: GHA-XXXXXXXXX-X
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 12) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 12)}-${cleaned.slice(12, 13)}`;
    };

    const handleVerify = async () => {
        if (!ghanaCardNumber || !fullName || !dateOfBirth) {
            setVerification({ status: 'failed', message: 'Please fill all fields' });
            return;
        }

        setVerification({ status: 'verifying' });

        // Simulate API call to NIA verification service
        setTimeout(() => {
            // Mock verification - in production, this calls the NIA API
            const isValid = ghanaCardNumber.match(/^GHA-[0-9]{9}-[0-9]$/);

            if (isValid) {
                setVerification({
                    status: 'success',
                    message: 'Ghana Card verified successfully! Your profile is now trusted.'
                });

                // Update user in localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.ghanaCardVerified = true;
                user.ghanaCardNumber = ghanaCardNumber;
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                setVerification({
                    status: 'failed',
                    message: 'Verification failed. Please check your details and try again.'
                });
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-lg mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🪪</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Verify Your Ghana Card</h1>
                    <p className="text-gray-500 mt-2">
                        Get a verified badge and build trust with landlords
                    </p>
                </div>

                {/* Benefits */}
                <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-100">
                    <h3 className="font-semibold text-green-900 mb-3">Benefits of Verification</h3>
                    <ul className="text-sm text-green-700 space-y-2">
                        <li>✓ Verified badge on your profile</li>
                        <li>✓ Higher trust with property owners</li>
                        <li>✓ Priority responses from landlords</li>
                        <li>✓ Required for rental agreements</li>
                    </ul>
                </div>

                {/* Verification Form */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    {verification.status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✓</span>
                            </div>
                            <h3 className="text-xl font-bold text-green-700 mb-2">Verified!</h3>
                            <p className="text-gray-600 mb-6">{verification.message}</p>
                            <Link href="/" className="btn-primary inline-block">
                                Back to Home
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghana Card Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={ghanaCardNumber}
                                        onChange={(e) => setGhanaCardNumber(formatGhanaCard(e.target.value))}
                                        placeholder="GHA-XXXXXXXXX-X"
                                        maxLength={16}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name (as on card) *
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {verification.status === 'failed' && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {verification.message}
                                </div>
                            )}

                            <button
                                onClick={handleVerify}
                                disabled={verification.status === 'verifying'}
                                className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {verification.status === 'verifying' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span> Verifying...
                                    </span>
                                ) : (
                                    'Verify Ghana Card'
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Your data is securely verified with the National Identification Authority
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
