import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Commission configuration
const PLATFORM_COMMISSION_RATE = 0.12; // 12% commission on bookings

// Provider subscription tiers
const PROVIDER_TIERS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['Basic listing', 'Standard search visibility', 'Up to 5 services'],
        commission: 0.12, // 12%
    },
    FEATURED: {
        id: 'featured',
        name: 'Featured',
        monthlyPrice: 100,
        features: [
            'Featured badge',
            'Priority in search results',
            'Unlimited services',
            'Lower commission (10%)',
            'Analytics dashboard',
        ],
        commission: 0.10, // 10%
    },
    PREMIUM: {
        id: 'premium',
        name: 'Premium',
        monthlyPrice: 250,
        features: [
            'Everything in Featured',
            'Top of search results',
            'Lowest commission (8%)',
            'Dedicated support',
            'Profile promotion',
            'Lead alerts',
        ],
        commission: 0.08, // 8%
    },
};

// In-memory booking/payment store for development
const bookingCommissions: Map<string, {
    bookingId: string;
    providerId: string;
    totalAmount: number;
    commissionAmount: number;
    providerPayout: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    createdAt: Date;
}> = new Map();

const providerSubscriptions: Map<string, {
    providerId: string;
    tier: 'FREE' | 'FEATURED' | 'PREMIUM';
    startDate: Date;
    endDate: Date | null;
    autoRenew: boolean;
}> = new Map();

// Get provider subscription tiers
router.get('/tiers', (req, res) => {
    res.json({
        success: true,
        tiers: Object.values(PROVIDER_TIERS),
    });
});

// Get provider's current subscription
router.get('/subscription/:providerId', (req, res) => {
    const { providerId } = req.params;

    const subscription = providerSubscriptions.get(providerId);

    if (!subscription) {
        // Default to free tier
        return res.json({
            success: true,
            subscription: {
                providerId,
                tier: 'FREE',
                tierDetails: PROVIDER_TIERS.FREE,
                startDate: new Date(),
                endDate: null,
            },
        });
    }

    res.json({
        success: true,
        subscription: {
            ...subscription,
            tierDetails: PROVIDER_TIERS[subscription.tier],
        },
    });
});

// Subscribe to a tier
router.post('/subscribe', async (req, res) => {
    try {
        const schema = z.object({
            providerId: z.string(),
            tier: z.enum(['FEATURED', 'PREMIUM']),
            paymentMethod: z.enum(['MTN', 'VODAFONE', 'AIRTELTIGO', 'CARD']),
            phone: z.string().optional(),
        });

        const { providerId, tier, paymentMethod, phone } = schema.parse(req.body);
        const tierDetails = PROVIDER_TIERS[tier];

        // In production: Process payment via MTN MoMo / Paystack
        // Simulate payment success
        const transactionId = `SUB_${Date.now()}`;

        // Create subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        providerSubscriptions.set(providerId, {
            providerId,
            tier,
            startDate,
            endDate,
            autoRenew: true,
        });

        res.json({
            success: true,
            message: `Successfully subscribed to ${tierDetails.name} tier`,
            subscription: {
                tier,
                tierDetails,
                startDate,
                endDate,
                transactionId,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Subscription Error:', error);
        res.status(500).json({ error: 'Failed to process subscription' });
    }
});

// Calculate commission for a booking
router.post('/calculate-commission', (req, res) => {
    try {
        const schema = z.object({
            providerId: z.string(),
            bookingAmount: z.number().positive(),
        });

        const { providerId, bookingAmount } = schema.parse(req.body);

        // Get provider's subscription tier
        const subscription = providerSubscriptions.get(providerId);
        const tier = subscription?.tier || 'FREE';
        const commissionRate = PROVIDER_TIERS[tier].commission;

        const commissionAmount = bookingAmount * commissionRate;
        const providerPayout = bookingAmount - commissionAmount;

        res.json({
            success: true,
            breakdown: {
                bookingAmount,
                commissionRate: `${commissionRate * 100}%`,
                commissionAmount: Math.round(commissionAmount * 100) / 100,
                providerPayout: Math.round(providerPayout * 100) / 100,
                tier,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Failed to calculate commission' });
    }
});

// Process booking payment with commission
router.post('/process-booking-payment', async (req, res) => {
    try {
        const schema = z.object({
            bookingId: z.string(),
            providerId: z.string(),
            totalAmount: z.number().positive(),
            customerPhone: z.string(),
            paymentMethod: z.enum(['MTN', 'VODAFONE', 'AIRTELTIGO']),
        });

        const { bookingId, providerId, totalAmount, customerPhone, paymentMethod } = schema.parse(req.body);

        // Get provider's commission rate
        const subscription = providerSubscriptions.get(providerId);
        const tier = subscription?.tier || 'FREE';
        const commissionRate = PROVIDER_TIERS[tier].commission;

        const commissionAmount = totalAmount * commissionRate;
        const providerPayout = totalAmount - commissionAmount;

        // In production: 
        // 1. Charge customer via Mobile Money
        // 2. Hold funds in escrow
        // 3. After service completion, transfer to provider minus commission

        // Simulate payment processing
        const transactionId = `TXN_${Date.now()}`;

        // Record commission
        bookingCommissions.set(bookingId, {
            bookingId,
            providerId,
            totalAmount,
            commissionAmount: Math.round(commissionAmount * 100) / 100,
            providerPayout: Math.round(providerPayout * 100) / 100,
            status: 'PENDING',
            createdAt: new Date(),
        });

        res.json({
            success: true,
            message: 'Payment processed successfully',
            transactionId,
            breakdown: {
                totalAmount,
                platformCommission: Math.round(commissionAmount * 100) / 100,
                providerWillReceive: Math.round(providerPayout * 100) / 100,
                commissionRate: `${commissionRate * 100}%`,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Payment Processing Error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// Get provider earnings and commissions
router.get('/earnings/:providerId', (req, res) => {
    const { providerId } = req.params;

    // Get all commissions for this provider
    const providerCommissions = Array.from(bookingCommissions.values())
        .filter(c => c.providerId === providerId);

    const totalEarnings = providerCommissions.reduce((sum, c) => sum + c.providerPayout, 0);
    const totalCommissions = providerCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const pendingPayouts = providerCommissions
        .filter(c => c.status === 'PENDING')
        .reduce((sum, c) => sum + c.providerPayout, 0);

    res.json({
        success: true,
        earnings: {
            totalEarnings: Math.round(totalEarnings * 100) / 100,
            totalCommissions: Math.round(totalCommissions * 100) / 100,
            pendingPayouts: Math.round(pendingPayouts * 100) / 100,
            totalBookings: providerCommissions.length,
            recentTransactions: providerCommissions.slice(-10).reverse(),
        },
    });
});

// Admin: Get platform revenue
router.get('/admin/revenue', (req, res) => {
    const allCommissions = Array.from(bookingCommissions.values());

    const totalRevenue = allCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalBookingVolume = allCommissions.reduce((sum, c) => sum + c.totalAmount, 0);

    // Count subscriptions by tier
    const subscriptionsByTier = {
        FREE: 0,
        FEATURED: 0,
        PREMIUM: 0,
    };

    providerSubscriptions.forEach((sub) => {
        subscriptionsByTier[sub.tier]++;
    });

    // Calculate subscription revenue
    const subscriptionRevenue =
        subscriptionsByTier.FEATURED * PROVIDER_TIERS.FEATURED.monthlyPrice +
        subscriptionsByTier.PREMIUM * PROVIDER_TIERS.PREMIUM.monthlyPrice;

    res.json({
        success: true,
        revenue: {
            commissionRevenue: Math.round(totalRevenue * 100) / 100,
            subscriptionRevenue,
            totalRevenue: Math.round((totalRevenue + subscriptionRevenue) * 100) / 100,
            bookingVolume: Math.round(totalBookingVolume * 100) / 100,
            totalBookings: allCommissions.length,
            subscriptionsByTier,
            averageCommissionRate: '10-12%',
        },
    });
});

export default router;
