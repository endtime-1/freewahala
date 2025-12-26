import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

const SUBSCRIPTION_TIERS: Record<string, { price: number; contacts: number; duration: number; name: string; features: string[] }> = {
    FREE: {
        price: 0,
        contacts: 3,
        duration: 30,
        name: 'Free',
        features: ['3 owner contacts/month', 'Basic property search', 'Save favorites']
    },
    BASIC: {
        price: 50,
        contacts: 15,
        duration: 30,
        name: 'Basic',
        features: ['15 owner contacts/month', 'Priority search results', 'Agreement templates', 'Email support']
    },
    RELAX: {
        price: 100,
        contacts: 40,
        duration: 30,
        name: 'Relax',
        features: ['40 owner contacts/month', 'Priority search results', 'Agreement templates', 'Home services discount', 'Priority support']
    },
    SUPERUSER: {
        price: 200,
        contacts: 999999,
        duration: 30,
        name: 'SuperUser',
        features: ['Unlimited owner contacts', 'Top search placement', 'All agreement features', 'Maximum discounts', 'Dedicated support', 'Verified badge']
    },
};

// Check if we're in dev mode (no Paystack keys)
const isDev = !process.env.PAYSTACK_SECRET_KEY || process.env.NODE_ENV !== 'production';

// Get subscription tiers
router.get('/tiers', (req, res) => {
    res.json({
        tiers: Object.entries(SUBSCRIPTION_TIERS).map(([tier, data]) => ({
            tier,
            name: data.name,
            price: data.price,
            contacts: tier === 'SUPERUSER' ? 'Unlimited' : data.contacts,
            duration: `${data.duration} days`,
            currency: 'GH₵',
            features: data.features,
        })),
    });
});

// Get my subscription
router.get('/my', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                subscriptionTier: true,
                subscriptionExpiresAt: true,
                freeContactsRemaining: true,
                freeContactsResetAt: true,
            },
        });

        const isActive = user?.subscriptionTier !== 'FREE' &&
            user?.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) > new Date();

        res.json({
            subscription: {
                ...user,
                isActive,
                tierDetails: SUBSCRIPTION_TIERS[user?.subscriptionTier || 'FREE'],
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// Initialize payment (dev mode: simulates payment, production: uses Paystack)
router.post('/initialize-payment', authenticate, async (req: AuthRequest, res) => {
    try {
        const { tier } = z.object({
            tier: z.enum(['BASIC', 'RELAX', 'SUPERUSER']),
        }).parse(req.body);

        const tierData = SUBSCRIPTION_TIERS[tier];
        const reference = `DR_${Date.now()}_${req.user!.id.slice(0, 8)}`;

        if (isDev) {
            // Dev mode: Return a mock payment URL that auto-completes
            console.log(`💳 [DEV MODE] Payment initialized for ${tier}: GH₵${tierData.price}`);
            console.log(`📝 Reference: ${reference}`);

            return res.json({
                success: true,
                devMode: true,
                reference,
                tier,
                amount: tierData.price,
                message: 'Dev mode - use /api/subscriptions/dev-complete to simulate payment',
                // In dev mode, we give a direct endpoint to complete payment
                completeUrl: `/api/subscriptions/dev-complete?reference=${reference}&tier=${tier}`,
            });
        }

        // Production: Initialize Paystack payment
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: req.user!.phone + '@directrent.gh', // Paystack requires email
                amount: tierData.price * 100, // Paystack uses pesewas
                reference,
                callback_url: `${process.env.FRONTEND_URL}/pricing/callback`,
                metadata: {
                    userId: req.user!.id,
                    tier,
                    custom_fields: [
                        { display_name: 'Plan', variable_name: 'plan', value: tierData.name },
                    ],
                },
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            throw new Error(paystackData.message || 'Failed to initialize payment');
        }

        res.json({
            success: true,
            devMode: false,
            reference,
            authorizationUrl: paystackData.data.authorization_url,
            accessCode: paystackData.data.access_code,
        });
    } catch (error) {
        console.error('Initialize Payment Error:', error);
        res.status(500).json({ error: 'Failed to initialize payment' });
    }
});

// Dev mode: Complete payment simulation
router.post('/dev-complete', authenticate, async (req: AuthRequest, res) => {
    if (!isDev) {
        return res.status(403).json({ error: 'This endpoint is only available in development mode' });
    }

    try {
        const { tier, reference } = z.object({
            tier: z.enum(['BASIC', 'RELAX', 'SUPERUSER']),
            reference: z.string(),
        }).parse(req.body);

        const tierData = SUBSCRIPTION_TIERS[tier];
        const expiresAt = new Date(Date.now() + tierData.duration * 24 * 60 * 60 * 1000);

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                subscriptionTier: tier,
                subscriptionExpiresAt: expiresAt,
            },
        });

        console.log(`✅ [DEV MODE] Subscription activated: ${tier} for user ${req.user!.id}`);
        console.log(`📅 Expires: ${expiresAt.toISOString()}`);

        res.json({
            success: true,
            message: 'Subscription activated successfully (dev mode)',
            subscription: {
                tier: user.subscriptionTier,
                expiresAt: user.subscriptionExpiresAt,
                contactsPerMonth: tierData.contacts,
                tierDetails: tierData,
            },
        });
    } catch (error) {
        console.error('Dev Complete Error:', error);
        res.status(500).json({ error: 'Failed to complete subscription' });
    }
});

// Verify payment (for callback page)
router.get('/verify/:reference', authenticate, async (req: AuthRequest, res) => {
    try {
        const { reference } = req.params;

        if (isDev) {
            // In dev mode, just return current subscription status
            const user = await prisma.user.findUnique({
                where: { id: req.user!.id },
                select: {
                    subscriptionTier: true,
                    subscriptionExpiresAt: true,
                },
            });

            return res.json({
                success: true,
                devMode: true,
                verified: user?.subscriptionTier !== 'FREE',
                subscription: user,
            });
        }

        // Production: Verify with Paystack
        const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status || paystackData.data.status !== 'success') {
            return res.status(400).json({
                success: false,
                error: 'Payment verification failed'
            });
        }

        // Update subscription
        const tier = paystackData.data.metadata.tier;
        const tierData = SUBSCRIPTION_TIERS[tier];
        const expiresAt = new Date(Date.now() + tierData.duration * 24 * 60 * 60 * 1000);

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                subscriptionTier: tier,
                subscriptionExpiresAt: expiresAt,
            },
        });

        res.json({
            success: true,
            subscription: {
                tier: user.subscriptionTier,
                expiresAt: user.subscriptionExpiresAt,
                contactsPerMonth: tierData.contacts,
            },
        });
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// Subscribe to a plan (legacy - kept for backwards compatibility)
router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
    try {
        const { tier, paymentReference } = z.object({
            tier: z.enum(['BASIC', 'RELAX', 'SUPERUSER']),
            paymentReference: z.string(),
        }).parse(req.body);

        const tierData = SUBSCRIPTION_TIERS[tier];
        const expiresAt = new Date(Date.now() + tierData.duration * 24 * 60 * 60 * 1000);

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                subscriptionTier: tier,
                subscriptionExpiresAt: expiresAt,
            },
        });

        res.json({
            success: true,
            subscription: {
                tier: user.subscriptionTier,
                expiresAt: user.subscriptionExpiresAt,
                contactsPerMonth: tierData.contacts,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process subscription' });
    }
});

export default router;
