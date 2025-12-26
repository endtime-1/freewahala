'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const REPORT_REASONS = [
    { id: 'FAKE_LISTING', label: 'Fake or misleading listing', icon: '🚫' },
    { id: 'WRONG_LOCATION', label: 'Wrong location/address', icon: '📍' },
    { id: 'WRONG_PRICE', label: 'Price is incorrect', icon: '💰' },
    { id: 'ALREADY_RENTED', label: 'Property already rented', icon: '🏠' },
    { id: 'SCAM', label: 'Suspected scam', icon: '⚠️' },
    { id: 'AGENT_POSING', label: 'Agent posing as owner', icon: '🎭' },
    { id: 'WRONG_PHOTOS', label: 'Photos don\'t match property', icon: '📷' },
    { id: 'OTHER', label: 'Other issue', icon: '❓' },
];

export default function ReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const propertyId = searchParams.get('property');

    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [contactBack, setContactBack] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) {
            alert('Please select a reason for reporting');
            return;
        }

        setIsLoading(true);
        // API call would go here
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h1>
                    <p className="text-gray-500 mb-6">
                        Thank you for helping keep FreeWahala safe. Our team will review your report within 24 hours.
                    </p>
                    <Link href="/" className="btn-primary inline-block">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block">
                        ← Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Report a Problem</h1>
                    <p className="text-gray-500 mt-1">Help us maintain a safe marketplace</p>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Fraud Guard Banner */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">🛡️</div>
                        <div>
                            <h3 className="font-semibold text-gray-900">FreeWahala Fraud Guard</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                We take fraud seriously. All reports are reviewed by our team and
                                verified properties are protected. Repeated scammers are permanently banned.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report Reason */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">What's the issue?</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {REPORT_REASONS.map((reason) => (
                            <button
                                key={reason.id}
                                onClick={() => setSelectedReason(reason.id)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedReason === reason.id
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-xl">{reason.icon}</span>
                                <p className="text-sm font-medium mt-2">{reason.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Additional Details</h2>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Please provide any additional information that may help us investigate..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                {/* Contact Preference */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={contactBack}
                            onChange={(e) => setContactBack(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-red-500"
                        />
                        <span className="text-gray-700">
                            Contact me about this report
                        </span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedReason}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>

                {/* Info */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    False reports may result in account restrictions. Please only report genuine issues.
                </p>
            </main>
        </div>
    );
}
