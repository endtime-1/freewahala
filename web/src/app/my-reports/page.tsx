'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FraudReport {
    id: string;
    propertyTitle: string;
    propertyLocation: string;
    reason: string;
    status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
    createdAt: string;
}

const MOCK_REPORTS: FraudReport[] = [
    {
        id: '1',
        propertyTitle: '2 Bedroom at East Legon',
        propertyLocation: 'East Legon, Accra',
        reason: 'FAKE_LISTING',
        status: 'INVESTIGATING',
        createdAt: '2024-12-20T10:30:00Z',
    },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
    INVESTIGATING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Under Investigation' },
    RESOLVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' },
    DISMISSED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Dismissed' },
};

const REASON_LABELS: Record<string, string> = {
    FAKE_LISTING: 'Fake listing',
    WRONG_LOCATION: 'Wrong location',
    WRONG_PRICE: 'Incorrect price',
    ALREADY_RENTED: 'Already rented',
    SCAM: 'Suspected scam',
    AGENT_POSING: 'Agent posing as owner',
    WRONG_PHOTOS: 'Misleading photos',
    OTHER: 'Other issue',
};

export default function MyReportsPage() {
    const [reports, setReports] = useState<FraudReport[]>(MOCK_REPORTS);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                    <p className="text-gray-500 mt-1">Track status of your fraud reports</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.map((report) => {
                            const status = STATUS_STYLES[report.status] || STATUS_STYLES.PENDING;
                            return (
                                <div key={report.id} className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{report.propertyTitle}</h3>
                                            <p className="text-sm text-gray-500">{report.propertyLocation}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-gray-500">Reason: </span>
                                            <span className="text-gray-900">{REASON_LABELS[report.reason]}</span>
                                        </div>
                                        <span className="text-gray-400">Reported {formatDate(report.createdAt)}</span>
                                    </div>

                                    {report.status === 'RESOLVED' && (
                                        <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm text-green-700">
                                            ✓ This listing has been removed. Thank you for helping keep FreeWahala safe.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <div className="text-4xl mb-4">🛡️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't reported any properties. If you see something suspicious, let us know!
                        </p>
                        <Link href="/report" className="btn-primary inline-block bg-red-500 hover:bg-red-600">
                            Report a Problem
                        </Link>
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">How we handle reports</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Reports are reviewed within 24 hours</li>
                        <li>• We contact property owners for verification</li>
                        <li>• Confirmed fake listings are removed immediately</li>
                        <li>• Repeat offenders are permanently banned</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
