'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Conversation {
    id: string;
    type: string;
    propertyId: string | null;
    bookingId: string | null;
    otherUser: {
        id: string;
        fullName: string | null;
        profileImageUrl: string | null;
        role: string;
    };
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
    createdAt: string;
}

export default function MessagesPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchConversations();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view messages');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations);
            } else {
                const errData = await response.json();
                setError(errData.error || 'Failed to load conversations');
            }
        } catch (err) {
            console.error('Fetch conversations error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'LANDLORD':
                return { text: 'Landlord', color: 'bg-blue-500' };
            case 'TENANT':
                return { text: 'Tenant', color: 'bg-green-500' };
            case 'SERVICE_PROVIDER':
                return { text: 'Provider', color: 'bg-purple-500' };
            default:
                return { text: role, color: 'bg-gray-500' };
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated Background */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-[120px]" />
                </div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Chat with landlords and service providers
                    </p>
                </div>

                {/* Conversations List */}
                <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
                            <Link href="/login" className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700">
                                Log In
                            </Link>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-16">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center`}>
                                <svg className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Start a conversation by contacting a landlord or service provider
                            </p>
                            <Link href="/browse" className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700">
                                Browse Properties
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200/10">
                            {conversations.map((conversation) => {
                                const badge = getRoleBadge(conversation.otherUser.role);
                                return (
                                    <Link
                                        key={conversation.id}
                                        href={`/messages/${conversation.id}`}
                                        className={`flex items-center gap-4 p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            {conversation.otherUser.profileImageUrl ? (
                                                <img
                                                    src={conversation.otherUser.profileImageUrl}
                                                    alt={conversation.otherUser.fullName || 'User'}
                                                    className="w-14 h-14 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold">
                                                    {conversation.otherUser.fullName?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            {conversation.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-semibold truncate ${conversation.unreadCount > 0 ? '' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {conversation.otherUser.fullName || 'Unknown User'}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${badge.color}`}>
                                                    {badge.text}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? (isDark ? 'text-white' : 'text-gray-900') + ' font-medium' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {conversation.lastMessage || 'No messages yet'}
                                            </p>
                                        </div>

                                        {/* Time */}
                                        <div className="flex-shrink-0 text-right">
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {formatTime(conversation.lastMessageAt)}
                                            </p>
                                            {conversation.type === 'PROPERTY_INQUIRY' && (
                                                <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    Property
                                                </span>
                                            )}
                                            {conversation.type === 'SERVICE_BOOKING' && (
                                                <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                                    Service
                                                </span>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <svg className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
