import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// In-memory notification store
const notifications: Map<string, {
    id: string;
    userId: string;
    type: 'BOOKING' | 'PAYMENT' | 'SYSTEM' | 'MESSAGE';
    title: string;
    message: string;
    read: boolean;
    data?: any;
    createdAt: Date;
}> = new Map();

// Mock notifications
const populateMockData = () => {
    notifications.set('n1', {
        id: 'n1',
        userId: '1',
        type: 'BOOKING',
        title: 'New Booking Request',
        message: 'Ama S. wants to book Wiring Installation for Dec 24, 10:00 AM',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    });
    notifications.set('n2', {
        id: 'n2',
        userId: '1',
        type: 'PAYMENT',
        title: 'Payment Received',
        message: 'You received GH₵132 for completed job #J8823',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    });
};
populateMockData();

// Get user notifications
router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    // Sort by newest first
    const userNotifications = Array.from(notifications.values())
        .filter(n => n.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
        success: true,
        notifications: userNotifications,
        unreadCount: userNotifications.filter(n => !n.read).length,
    });
});

// Mark as read
router.post('/:notificationId/read', (req, res) => {
    const { notificationId } = req.params;
    const notification = notifications.get(notificationId);

    if (notification) {
        notification.read = true;
        notifications.set(notificationId, notification);
        res.json({ success: true, message: 'Marked as read' });
    } else {
        res.status(404).json({ error: 'Notification not found' });
    }
});

// Mark all as read
router.post('/read-all/:userId', (req, res) => {
    const { userId } = req.params;

    notifications.forEach((n) => {
        if (n.userId === userId && !n.read) {
            n.read = true;
            notifications.set(n.id, n);
        }
    });

    res.json({ success: true, message: 'All marked as read' });
});

export default router;
