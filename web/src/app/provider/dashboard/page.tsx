'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';

interface ProviderStats {
    totalEarnings: number;
    pendingPayouts: number;
    totalBookings: number;
    averageRating: number;
    thisMonthBookings: number;
    thisMonthEarnings: number;
}

interface Transaction {
    id: string;
    service: string;
    customer: string;
    amount: number;
    commission: number;
    payout: number;
    date: string;
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

const MOCK_STATS: ProviderStats = {
    totalEarnings: 12450,
    pendingPayouts: 850,
    totalBookings: 67,
    averageRating: 4.8,
    thisMonthBookings: 12,
    thisMonthEarnings: 2100,
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', service: 'Wiring Installation', customer: 'Ama S.', amount: 150, commission: 18, payout: 132, date: '2024-12-22', status: 'COMPLETED' },
    { id: '2', service: 'Panel Upgrade', customer: 'Kofi M.', amount: 400, commission: 48, payout: 352, date: '2024-12-20', status: 'COMPLETED' },
    { id: '3', service: 'Smart Home Setup', customer: 'Yaw B.', amount: 300, commission: 36, payout: 264, date: '2024-12-18', status: 'PENDING' },
    { id: '4', service: 'Basic Repair', customer: 'Abena G.', amount: 50, commission: 6, payout: 44, date: '2024-12-15', status: 'COMPLETED' },
];

const SUBSCRIPTION_TIERS = [
    {
        id: 'FREE',
        name: 'Free',
        price: 0,
        commission: '12%',
        features: ['Basic listing', 'Standard search visibility', 'Up to 5 services'],
        highlighted: false,
    },
    {
        id: 'FEATURED',
        name: 'Featured',
        price: 100,
        commission: '10%',
        features: [
            'Featured badge ⭐',
            'Priority in search results',
            'Unlimited services',
            'Lower commission (10%)',
            'Analytics dashboard',
        ],
        highlighted: true,
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        price: 250,
        commission: '8%',
        features: [
            'Everything in Featured',
            'Top of search results',
            'Lowest commission (8%)',
            'Dedicated support',
            'Profile promotion',
            'Lead alerts',
        ],
        highlighted: false,
    },
];

export default function ProviderDashboardPage() {
    const [stats] = useState<ProviderStats>(MOCK_STATS);
    const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [currentTier, setCurrentTier] = useState('FREE');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState<typeof SUBSCRIPTION_TIERS[0] | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('MTN');
    const [accountNumber, setAccountNumber] = useState('');

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;

    const handleUpgrade = (tier: typeof SUBSCRIPTION_TIERS[0]) => {
        setSelectedTier(tier);
        setShowPayment(true);
    };

    const handleWithdraw = async () => {
        // Simulate API call
        if (Number(withdrawAmount) > stats.totalEarnings) {
            alert('Insufficient funds');
            return;
        }
        alert(`Withdrawal request for GH₵${withdrawAmount} sent via ${withdrawMethod}! Funds will arrive in 24 hours.`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setAccountNumber('');
    };

    const handlePaymentSuccess = (txnId: string) => {
        if (selectedTier) {
            setCurrentTier(selectedTier.id);
        }
        setShowPayment(false);
        setShowUpgradeModal(false);
        alert('Subscription upgraded successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Provider Dashboard</h1>
                            <p className="text-gray-400">Manage your services and earnings</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentTier === 'PREMIUM' ? 'bg-purple-500 text-white' :
                                currentTier === 'FEATURED' ? 'bg-yellow-400 text-gray-900' :
                                    'bg-gray-600 text-white'
                                }`}>
                                {currentTier === 'PREMIUM' ? '👑 Premium' :
                                    currentTier === 'FEATURED' ? '⭐ Featured' : 'Free Tier'}
                            </span>
                            {currentTier === 'FREE' && (
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="bg-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-600"
                                >
                                    Upgrade
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-500">Available Funds</p>
                            <button onClick={() => setShowWithdrawModal(true)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200">
                                Withdraw
                            </button>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalEarnings)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Pending Payouts</p>
                        <p className="text-2xl font-bold text-orange-500">{formatPrice(stats.pendingPayouts)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Rating</p>
                        <p className="text-2xl font-bold text-gray-900">
                            <span className="text-yellow-500">★</span> {stats.averageRating}
                        </p>
                    </div>
                </div>

                {/* Commission Info */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Your Commission Rate</h3>
                            <p className="text-white/80">
                                {currentTier === 'PREMIUM' ? '8%' :
                                    currentTier === 'FEATURED' ? '10%' : '12%'} platform fee per booking
                            </p>
                        </div>
                        {currentTier !== 'PREMIUM' && (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                            >
                                Lower Your Rate →
                            </button>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                        <Link href="/provider/transactions" className="text-teal-600 text-sm font-medium">
                            View All →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                    <th className="pb-3 font-medium">Service</th>
                                    <th className="pb-3 font-medium">Customer</th>
                                    <th className="pb-3 font-medium">Total</th>
                                    <th className="pb-3 font-medium">Commission</th>
                                    <th className="pb-3 font-medium">Your Payout</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="border-b border-gray-50">
                                        <td className="py-4">
                                            <p className="font-medium text-gray-900">{txn.service}</p>
                                            <p className="text-xs text-gray-500">{txn.date}</p>
                                        </td>
                                        <td className="py-4 text-gray-600">{txn.customer}</td>
                                        <td className="py-4 text-gray-900">{formatPrice(txn.amount)}</td>
                                        <td className="py-4 text-red-500">-{formatPrice(txn.commission)}</td>
                                        <td className="py-4 font-semibold text-green-600">{formatPrice(txn.payout)}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${txn.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/provider/services" className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <span className="text-2xl mb-2 block">🛠️</span>
                        <h3 className="font-semibold text-gray-900">Manage Services</h3>
                        <p className="text-sm text-gray-500">Edit your service offerings and prices</p>
                    </Link>
                    <Link href="/provider/schedule" className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <span className="text-2xl mb-2 block">📅</span>
                        <h3 className="font-semibold text-gray-900">View Schedule</h3>
                        <p className="text-sm text-gray-500">Upcoming bookings and availability</p>
                    </Link>
                    <Link href="/provider/reviews" className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <span className="text-2xl mb-2 block">⭐</span>
                        <h3 className="font-semibold text-gray-900">Customer Reviews</h3>
                        <p className="text-sm text-gray-500">See what customers are saying</p>
                    </Link>
                </div>
            </main>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWithdrawModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
                            <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                <p className="text-sm text-gray-500">Available to Withdraw</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalEarnings)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                    placeholder="Min GH₵10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={withdrawMethod}
                                    onChange={(e) => setWithdrawMethod(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                >
                                    <option value="MTN">MTN Mobile Money</option>
                                    <option value="VODAFONE">Vodafone Cash</option>
                                    <option value="AIRTELTIGO">AirtelTigo Money</option>
                                    <option value="BANK">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                    placeholder="e.g. 0244123456"
                                />
                            </div>

                            <button
                                onClick={handleWithdraw}
                                disabled={!withdrawAmount || !accountNumber}
                                className="w-full bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-600 disabled:opacity-50 mt-4"
                            >
                                Confirm Withdrawal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradeModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
                                    <p className="text-gray-500">Lower your commission and get more customers</p>
                                </div>
                                <button onClick={() => setShowUpgradeModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {SUBSCRIPTION_TIERS.map((tier) => (
                                    <div
                                        key={tier.id}
                                        className={`rounded-2xl p-6 border-2 ${tier.highlighted
                                            ? 'border-teal-500 bg-teal-50'
                                            : currentTier === tier.id
                                                ? 'border-gray-300 bg-gray-50'
                                                : 'border-gray-200'
                                            }`}
                                    >
                                        {tier.highlighted && (
                                            <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-4 inline-block">
                                                MOST POPULAR
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {tier.price === 0 ? 'Free' : formatPrice(tier.price)}
                                            {tier.price > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
                                        </p>
                                        <p className="text-sm text-teal-600 font-medium mt-2">
                                            {tier.commission} commission
                                        </p>

                                        <ul className="mt-6 space-y-3">
                                            {tier.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span className="text-teal-500">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleUpgrade(tier)}
                                            disabled={currentTier === tier.id}
                                            className={`w-full mt-6 py-3 rounded-xl font-semibold ${currentTier === tier.id
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : tier.highlighted
                                                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {currentTier === tier.id ? 'Current Plan' : tier.price === 0 ? 'Downgrade' : 'Subscribe'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && selectedTier && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={selectedTier.price}
                    description={`${selectedTier.name} Provider Subscription - 1 Month`}
                    reference={`PROV_SUB_${Date.now()}`}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
