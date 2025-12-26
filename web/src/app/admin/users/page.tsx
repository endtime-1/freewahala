'use client';

import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    role: string;
    ghanaCardVerified: boolean;
    createdAt: string;
    _count: {
        properties: number;
        serviceBookings: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                role: roleFilter,
                status: statusFilter,
                ...(search && { search })
            });

            const response = await fetch(`${API_URL}/api/admin/users?${params}`);
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleUpdateUser = async (userId: string, updates: any) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                fetchUsers();
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'LANDLORD': return 'bg-blue-100 text-blue-700';
            case 'SERVICE_PROVIDER': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all platform users</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by name, phone, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="TENANT">Tenant</option>
                        <option value="LANDLORD">Landlord</option>
                        <option value="SERVICE_PROVIDER">Provider</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="UNVERIFIED">Unverified</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No users found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                                {user.fullName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.fullName || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">{user.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.ghanaCardVerified ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Unverified</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            <span>{user._count.properties} properties</span>
                                            <span className="mx-2">•</span>
                                            <span>{user._count.serviceBookings} bookings</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleUpdateUser(user.id, { ghanaCardVerified: !user.ghanaCardVerified })}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title={user.ghanaCardVerified ? 'Revoke verification' : 'Verify user'}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    defaultValue={selectedUser.role}
                                    onChange={(e) => handleUpdateUser(selectedUser.id, { role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                >
                                    <option value="TENANT">Tenant</option>
                                    <option value="LANDLORD">Landlord</option>
                                    <option value="SERVICE_PROVIDER">Service Provider</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Ghana Card Verified</span>
                                <button
                                    onClick={() => handleUpdateUser(selectedUser.id, { ghanaCardVerified: !selectedUser.ghanaCardVerified })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedUser.ghanaCardVerified ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedUser.ghanaCardVerified ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
