'use client';

import React, { useState, useEffect } from 'react';

interface Booking {
    id: string;
    status: string;
    scheduledDate: string;
    scheduledTime: string;
    address: string;
    city: string;
    notes: string;
    createdAt: string;
    customer: {
        id: string;
        fullName: string;
        phone: string;
    };
    provider: {
        id: string;
        businessName: string;
        serviceType: string;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBookings();
    }, [page, statusFilter]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: statusFilter
            });

            const response = await fetch(`${API_URL}/api/admin/bookings?${params}`);
            const data = await response.json();

            if (response.ok) {
                setBookings(data.bookings);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId: string, status: string) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchBookings();
            }
        } catch (error) {
            console.error('Update booking error:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
                <p className="text-gray-500 text-sm mt-1">Monitor and manage all service bookings</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    All
                </button>
                {STATUS_OPTIONS.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === status ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        {status.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No bookings found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Booking</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Schedule</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.provider?.serviceType.replace(/_/g, ' ')}</p>
                                            <p className="text-sm text-gray-500">{booking.city}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.customer?.fullName}</p>
                                            <p className="text-sm text-gray-500">{booking.customer?.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{booking.provider?.businessName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-gray-900">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                                            <p className="text-gray-500">{booking.scheduledTime || 'TBD'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            {STATUS_OPTIONS.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
