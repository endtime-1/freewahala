'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    readAt: string | null;
    createdAt: string;
    sender: {
        id: string;
        fullName: string | null;
        profileImageUrl: string | null;
    };
}

interface ConversationData {
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
    messages: Message[];
    createdAt: string;
}

export default function ChatPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const params = useParams();
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const conversationId = params.id as string;

    const [conversation, setConversation] = useState<ConversationData | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get current user ID from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.userId);
            } catch (e) {
                console.error('Failed to parse token');
            }
        }

        fetchConversation();
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchConversation, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages]);

    const fetchConversation = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view messages');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversation(data.conversation);
            } else {
                const errData = await response.json();
                setError(errData.error || 'Failed to load conversation');
            }
        } catch (err) {
            console.error('Fetch conversation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/chat/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage.trim()
                })
            });

            if (response.ok) {
                setNewMessage('');
                await fetchConversation();
            }
        } catch (err) {
            console.error('Send message error:', err);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        }
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { date: string; messages: Message[] }[] = [];
        let currentDate = '';

        messages.forEach((message) => {
            const messageDate = new Date(message.createdAt).toDateString();
            if (messageDate !== currentDate) {
                currentDate = messageDate;
                groups.push({ date: message.createdAt, messages: [message] });
            } else {
                groups[groups.length - 1].messages.push(message);
            }
        });

        return groups;
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Conversation not found'}</p>
                    <Link href="/messages" className="text-orange-600 hover:underline">
                        ← Back to Messages
                    </Link>
                </div>
            </div>
        );
    }

    const messageGroups = groupMessagesByDate(conversation.messages);

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-20 ${isDark ? 'bg-[#0a0a0f]/95 border-b border-white/10' : 'bg-white border-b border-gray-200'} backdrop-blur-lg`}>
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link href="/messages" className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>

                    {conversation.otherUser.profileImageUrl ? (
                        <img
                            src={conversation.otherUser.profileImageUrl}
                            alt={conversation.otherUser.fullName || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                            {conversation.otherUser.fullName?.charAt(0) || '?'}
                        </div>
                    )}

                    <div className="flex-1">
                        <h2 className="font-semibold">{conversation.otherUser.fullName || 'Unknown User'}</h2>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {conversation.otherUser.role === 'LANDLORD' && 'Landlord'}
                            {conversation.otherUser.role === 'TENANT' && 'Tenant'}
                            {conversation.otherUser.role === 'SERVICE_PROVIDER' && 'Service Provider'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messageGroups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-4">
                                <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                                    {formatDate(group.date)}
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="space-y-3">
                                {group.messages.map((message) => {
                                    const isOwn = message.senderId === currentUserId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${isOwn
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-br-md'
                                                        : isDark
                                                            ? 'bg-white/10 text-white rounded-bl-md'
                                                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {formatTime(message.createdAt)}
                                                    </span>
                                                    {isOwn && message.readAt && (
                                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className={`sticky bottom-0 ${isDark ? 'bg-[#0a0a0f]/95 border-t border-white/10' : 'bg-white border-t border-gray-200'} backdrop-blur-lg`}>
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-3 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSending ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
