import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Unlock owner contact
router.post('/unlock/:propertyId', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const propertyId = req.params.propertyId;

        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                owner: {
                    select: {
                        id: true,
                        phone: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Check if already unlocked
        const existingUnlock = await prisma.contactUnlock.findUnique({
            where: {
                userId_propertyId: { userId, propertyId },
            },
        });

        if (existingUnlock) {
            // Already unlocked - return owner info
            return res.json({
                success: true,
                alreadyUnlocked: true,
                owner: {
                    id: property.owner.id,
                    phone: property.owner.phone,
                    fullName: property.owner.fullName,
                },
            });
        }

        // Get user's subscription status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                freeContactsRemaining: true,
                freeContactsResetAt: true,
                subscriptionTier: true,
                subscriptionExpiresAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user's free contacts need to be reset (monthly reset)
        const now = new Date();
        let freeContactsRemaining = user.freeContactsRemaining;

        if (user.freeContactsResetAt) {
            const resetDate = new Date(user.freeContactsResetAt);
            const daysSinceReset = Math.floor((now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceReset >= 30) {
                // Reset free contacts
                freeContactsRemaining = 3;
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        freeContactsRemaining: 3,
                        freeContactsResetAt: now,
                    },
                });
            }
        }

        // Check subscription status
        const hasActiveSubscription =
            user.subscriptionTier !== 'FREE' &&
            user.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) > now;

        // Determine contact limits based on tier
        const tierLimits: Record<string, number> = {
            FREE: 3,
            BASIC: 15,
            RELAX: 40,
            SUPERUSER: 999999, // Unlimited
        };

        // If no active subscription and no free contacts remaining
        if (!hasActiveSubscription && freeContactsRemaining <= 0) {
            return res.status(403).json({
                error: 'No contacts remaining',
                requiresSubscription: true,
                message: 'You have used all your free contacts this month. Upgrade to Premium to continue.',
                subscriptionTiers: [
                    { tier: 'BASIC', price: 50, contacts: 15, currency: 'GH₵' },
                    { tier: 'RELAX', price: 100, contacts: 40, currency: 'GH₵' },
                    { tier: 'SUPERUSER', price: 200, contacts: 'Unlimited', currency: 'GH₵' },
                ],
            });
        }

        // Deduct contact and create unlock record
        await prisma.$transaction([
            prisma.contactUnlock.create({
                data: { userId, propertyId },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    freeContactsRemaining: {
                        decrement: hasActiveSubscription ? 0 : 1,
                    },
                },
            }),
        ]);

        // Get updated remaining contacts
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { freeContactsRemaining: true },
        });

        res.json({
            success: true,
            owner: {
                id: property.owner.id,
                phone: property.owner.phone,
                fullName: property.owner.fullName,
            },
            contactsRemaining: hasActiveSubscription
                ? tierLimits[user.subscriptionTier]
                : updatedUser?.freeContactsRemaining || 0,
        });
    } catch (error) {
        console.error('Unlock Contact Error:', error);
        res.status(500).json({ error: 'Failed to unlock contact' });
    }
});

// Get unlocked contacts
router.get('/my/unlocked', authenticate, async (req: AuthRequest, res) => {
    try {
        const unlocks = await prisma.contactUnlock.findMany({
            where: { userId: req.user!.id },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        neighborhood: true,
                        city: true,
                        images: true,
                        owner: {
                            select: {
                                id: true,
                                phone: true,
                                fullName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { unlockedAt: 'desc' },
        });

        res.json({
            unlocks: unlocks.map(u => ({
                ...u.property,
                unlockedAt: u.unlockedAt,
            })),
        });
    } catch (error) {
        console.error('Get Unlocked Contacts Error:', error);
        res.status(500).json({ error: 'Failed to fetch unlocked contacts' });
    }
});

// Check unlock status for a property
router.get('/status/:propertyId', authenticate, async (req: AuthRequest, res) => {
    try {
        const unlock = await prisma.contactUnlock.findUnique({
            where: {
                userId_propertyId: {
                    userId: req.user!.id,
                    propertyId: req.params.propertyId,
                },
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                freeContactsRemaining: true,
                subscriptionTier: true,
                subscriptionExpiresAt: true,
            },
        });

        res.json({
            isUnlocked: !!unlock,
            freeContactsRemaining: user?.freeContactsRemaining || 0,
            subscriptionTier: user?.subscriptionTier || 'FREE',
            subscriptionActive: user?.subscriptionExpiresAt
                ? new Date(user.subscriptionExpiresAt) > new Date()
                : false,
        });
    } catch (error) {
        console.error('Check Unlock Status Error:', error);
        res.status(500).json({ error: 'Failed to check unlock status' });
    }
});

export default router;
