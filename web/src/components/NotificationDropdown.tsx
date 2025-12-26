'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'BOOKING' | 'PAYMENT' | 'SYSTEM' | 'MESSAGE';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'BOOKING',
        title: 'New Booking Request',
        message: 'Ama S. requested "Wiring Installation" for Dec 24',
        read: false,
        createdAt: '30m ago'
    },
    {
        id: '2',
        type: 'PAYMENT',
        title: 'Payment Received',
        message: 'You received GH₵132 for Job #J8823',
        read: true,
        createdAt: '1d ago'
    },
    {
        id: '3',
        type: 'SYSTEM',
        title: 'Welcome to Featured!',
        message: 'Your profile is now featured in search results.',
        read: true,
        createdAt: '2d ago'
    }
];

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'BOOKING': return '📅';
            case 'PAYMENT': return '💰';
            case 'MESSAGE': return '💬';
            default: return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-teal-600 font-medium hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="text-2xl mb-2 block">🔕</span>
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-xl shrink-0 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {notification.createdAt}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                        <Link href="/notifications" className="text-sm text-teal-600 font-medium hover:underline" onClick={() => setIsOpen(false)}>
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
