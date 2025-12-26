import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// GET CONVERSATIONS
// ============================================

router.get('/conversations', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participantA: userId },
                    { participantB: userId }
                ]
            },
            include: {
                userA: {
                    select: { id: true, fullName: true, profileImageUrl: true, role: true }
                },
                userB: {
                    select: { id: true, fullName: true, profileImageUrl: true, role: true }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        // Get unread counts for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId },
                        readAt: null
                    }
                });

                // Determine the other user
                const otherUser = conv.participantA === userId ? conv.userB : conv.userA;

                return {
                    id: conv.id,
                    type: conv.type,
                    propertyId: conv.propertyId,
                    bookingId: conv.bookingId,
                    otherUser,
                    lastMessage: conv.lastMessage,
                    lastMessageAt: conv.lastMessageAt,
                    unreadCount,
                    createdAt: conv.createdAt
                };
            })
        );

        res.json({ conversations: conversationsWithUnread });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// ============================================
// GET SINGLE CONVERSATION WITH MESSAGES
// ============================================

router.get('/conversations/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                OR: [
                    { participantA: userId },
                    { participantB: userId }
                ]
            },
            include: {
                userA: {
                    select: { id: true, fullName: true, profileImageUrl: true, role: true }
                },
                userB: {
                    select: { id: true, fullName: true, profileImageUrl: true, role: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: { id: true, fullName: true, profileImageUrl: true }
                        }
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId: id,
                senderId: { not: userId },
                readAt: null
            },
            data: { readAt: new Date() }
        });

        const otherUser = conversation.participantA === userId ? conversation.userB : conversation.userA;

        res.json({
            conversation: {
                id: conversation.id,
                type: conversation.type,
                propertyId: conversation.propertyId,
                bookingId: conversation.bookingId,
                otherUser,
                messages: conversation.messages,
                createdAt: conversation.createdAt
            }
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// ============================================
// START NEW CONVERSATION
// ============================================

router.post('/conversations', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { recipientId, propertyId, bookingId, type, initialMessage } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!recipientId) {
            return res.status(400).json({ error: 'Recipient ID is required' });
        }

        if (userId === recipientId) {
            return res.status(400).json({ error: 'Cannot start conversation with yourself' });
        }

        // Check if conversation already exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { participantA: userId, participantB: recipientId, propertyId: propertyId || null },
                    { participantA: recipientId, participantB: userId, propertyId: propertyId || null }
                ]
            }
        });

        if (!conversation) {
            // Create new conversation
            conversation = await prisma.conversation.create({
                data: {
                    type: type || 'GENERAL',
                    participantA: userId,
                    participantB: recipientId,
                    propertyId: propertyId || null,
                    bookingId: bookingId || null,
                    lastMessage: initialMessage || null,
                    lastMessageAt: initialMessage ? new Date() : null
                }
            });

            // If there's an initial message, create it
            if (initialMessage) {
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderId: userId,
                        content: initialMessage
                    }
                });
            }
        }

        res.json({ conversation });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// ============================================
// SEND MESSAGE
// ============================================

router.post('/messages', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { conversationId, content } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!conversationId || !content) {
            return res.status(400).json({ error: 'Conversation ID and content are required' });
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { participantA: userId },
                    { participantB: userId }
                ]
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                content
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, profileImageUrl: true }
                }
            }
        });

        // Update conversation's last message
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content.substring(0, 100),
                lastMessageAt: new Date()
            }
        });

        res.json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ============================================
// MARK MESSAGE AS READ
// ============================================

router.put('/messages/:id/read', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const message = await prisma.message.update({
            where: { id },
            data: { readAt: new Date() }
        });

        res.json({ message });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

// ============================================
// GET UNREAD COUNT
// ============================================

router.get('/unread-count', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get all conversations where user is a participant
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participantA: userId },
                    { participantB: userId }
                ]
            },
            select: { id: true }
        });

        const conversationIds = conversations.map(c => c.id);

        // Count unread messages
        const unreadCount = await prisma.message.count({
            where: {
                conversationId: { in: conversationIds },
                senderId: { not: userId },
                readAt: null
            }
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

export default router;
