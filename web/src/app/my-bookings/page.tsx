'use client';

import { useState } from 'react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';

interface MovingBooking {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
    pickup: string;
    delivery: string;
    date: string;
    totalAmount: number;
    isPaid: boolean;
    items: { name: string; quantity: number }[];
}

const MOCK_BOOKINGS: MovingBooking[] = [
    {
        id: 'MOV-2024-001',
        status: 'IN_PROGRESS',
        pickup: 'East Legon, Accra',
        delivery: 'Tema Community 25',
        date: '2024-12-24',
        totalAmount: 1500,
        isPaid: true,
        items: [
            { name: 'Bed', quantity: 2 },
            { name: 'Sofa', quantity: 1 },
            { name: 'Boxes', quantity: 15 },
        ],
    },
    {
        id: 'MOV-2024-002',
        status: 'PENDING',
        pickup: 'Osu, Accra',
        delivery: 'Kumasi Central',
        date: '2024-12-28',
        totalAmount: 3200,
        isPaid: false,
        items: [
            { name: 'Refrigerator', quantity: 1 },
            { name: 'Wardrobe', quantity: 2 },
            { name: 'Boxes', quantity: 25 },
        ],
    },
];

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<MovingBooking[]>(MOCK_BOOKINGS);
    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        booking: MovingBooking | null;
    }>({ isOpen: false, booking: null });

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-green-100 text-green-700';
            case 'COMPLETED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handlePaymentSuccess = (bookingId: string, transactionId: string) => {
        setBookings(prev => prev.map(b =>
            b.id === bookingId ? { ...b, isPaid: true, status: 'CONFIRMED' as const } : b
        ));
        setPaymentModal({ isOpen: false, booking: null });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-500">Track your moving and service bookings</p>
                    </div>
                    <Link href="/movers" className="btn-primary">
                        + New Booking
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
                        Moving
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100">
                        Services
                    </button>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl p-6 border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">{booking.id}</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatDate(booking.date)}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(booking.status)}`}>
                                    {booking.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">From</p>
                                    <p className="font-medium text-gray-900">{booking.pickup}</p>
                                </div>
                                <div className="text-gray-400">→</div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">To</p>
                                    <p className="font-medium text-gray-900">{booking.delivery}</p>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 mb-4">
                                {booking.items.map((item, idx) => (
                                    <span key={idx}>
                                        {item.quantity}× {item.name}
                                        {idx < booking.items.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{formatPrice(booking.totalAmount)}</p>
                                    {booking.isPaid ? (
                                        <span className="text-sm text-green-600">✓ Paid</span>
                                    ) : (
                                        <span className="text-sm text-orange-600">Payment pending</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!booking.isPaid && (
                                        <button
                                            onClick={() => setPaymentModal({ isOpen: true, booking })}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                    {booking.status === 'IN_PROGRESS' && (
                                        <Link
                                            href={`/track-moving/${booking.id}`}
                                            className="btn-primary px-4 py-2"
                                        >
                                            Track Live
                                        </Link>
                                    )}
                                    {booking.status === 'COMPLETED' && (
                                        <button className="btn-secondary px-4 py-2">
                                            Rate Service
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {bookings.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <span className="text-4xl mb-4 block">📦</span>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 mb-6">Book a moving service to get started</p>
                        <Link href="/movers" className="btn-primary inline-block">
                            Get Moving Quote
                        </Link>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {paymentModal.booking && (
                <PaymentModal
                    isOpen={paymentModal.isOpen}
                    onClose={() => setPaymentModal({ isOpen: false, booking: null })}
                    amount={paymentModal.booking.totalAmount}
                    description={`Moving: ${paymentModal.booking.pickup} → ${paymentModal.booking.delivery}`}
                    reference={paymentModal.booking.id}
                    onSuccess={(txnId) => handlePaymentSuccess(paymentModal.booking!.id, txnId)}
                />
            )}
        </div>
    );
}
