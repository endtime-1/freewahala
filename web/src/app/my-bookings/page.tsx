'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';

// Handle both cases: env var with or without /api suffix
const getApiUrl = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return base.endsWith('/api') ? base : `${base}/api`;
}
const API_URL = getApiUrl();

interface MovingBooking {
    id: string;
    status: string;
    pickupLocation: string;
    deliveryLocation: string;
    scheduledDate: string;
    totalAmount: number;
    isPaid: boolean;
    items: { name: string; quantity: number }[];
}

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<MovingBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        booking: MovingBooking | null;
    }>({ isOpen: false, booking: null });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/services/bookings/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings || data || []);
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => `GH₵${(price || 0).toLocaleString()}`;
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
            b.id === bookingId ? { ...b, isPaid: true, status: 'CONFIRMED' } : b
        ));
        setPaymentModal({ isOpen: false, booking: null });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

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
                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-xl p-6 border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">#{booking.id.substring(0, 8)}</p>
                                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.scheduledDate)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(booking.status)}`}>
                                        {(booking.status || 'PENDING').replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">From</p>
                                        <p className="font-medium text-gray-900">{booking.pickupLocation || 'N/A'}</p>
                                    </div>
                                    <div className="text-gray-400">→</div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">To</p>
                                        <p className="font-medium text-gray-900">{booking.deliveryLocation || 'N/A'}</p>
                                    </div>
                                </div>

                                {booking.items && booking.items.length > 0 && (
                                    <div className="text-sm text-gray-500 mb-4">
                                        {booking.items.map((item, idx) => (
                                            <span key={idx}>
                                                {item.quantity}× {item.name}
                                                {idx < booking.items.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </div>
                                )}

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
                ) : (
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
                    description={`Moving: ${paymentModal.booking.pickupLocation} → ${paymentModal.booking.deliveryLocation}`}
                    reference={paymentModal.booking.id}
                    onSuccess={(txnId) => handlePaymentSuccess(paymentModal.booking!.id, txnId)}
                />
            )}
        </div>
    );
}
