import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Admin middleware - check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'Authorization failed' });
    }
};

// ============================================
// ADMIN LOGIN
// ============================================

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // For development: allow hardcoded admin credentials WITHOUT database lookup
        const isDevMode = process.env.NODE_ENV !== 'production';
        const isHardcodedAdmin = isDevMode &&
            email === 'admin@freewahala.com' &&
            password === 'admin123';

        if (isHardcodedAdmin) {
            // Dev mode bypass - no database needed
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                { userId: 'dev-admin', role: 'ADMIN', email: email },
                process.env.JWT_SECRET || 'dev-secret-key',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: 'dev-admin',
                    email: email,
                    fullName: 'Dev Admin',
                    role: 'ADMIN'
                }
            });
        }

        // Production mode: verify against database
        const user = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                role: 'ADMIN'
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or not an admin' });
        }

        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'dev-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ============================================
// DASHBOARD STATS
// ============================================

router.get('/stats', async (req: Request, res: Response) => {
    try {
        // Get counts in parallel
        const [
            totalUsers,
            totalProperties,
            totalProviders,
            totalBookings,
            pendingVerifications,
            activeSubscriptions,
            recentUsers,
            recentBookings
        ] = await Promise.all([
            prisma.user.count(),
            prisma.property.count(),
            prisma.serviceProvider.count(),
            prisma.serviceBooking.count(),
            prisma.user.count({ where: { ghanaCardVerified: false } }),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, fullName: true, phone: true, role: true, createdAt: true }
            }),
            prisma.serviceBooking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { fullName: true } },
                    provider: { select: { businessName: true } }
                }
            })
        ]);

        // Calculate revenue from subscriptions (mock calculation)
        const subscriptions = await prisma.subscription.findMany({
            where: { status: 'ACTIVE' }
        });

        const tierPrices: Record<string, number> = {
            FREE: 0,
            STARTER: 29,
            PRO: 79,
            ENTERPRISE: 199
        };

        const monthlyRevenue = subscriptions.reduce((total, sub) => {
            return total + (tierPrices[sub.tier] || 0);
        }, 0);

        // Get booking stats by status
        const bookingStats = await prisma.serviceBooking.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        res.json({
            overview: {
                totalUsers,
                totalProperties,
                totalProviders,
                totalBookings,
                pendingVerifications,
                activeSubscriptions,
                monthlyRevenue
            },
            bookingStats: bookingStats.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {} as Record<string, number>),
            recentUsers,
            recentBookings
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// ============================================
// USER MANAGEMENT
// ============================================

router.get('/users', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', role, search, status } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = {};

        if (role && role !== 'ALL') {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { fullName: { contains: search as string, mode: 'insensitive' } },
                { phone: { contains: search as string } },
                { email: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (status === 'VERIFIED') {
            where.ghanaCardVerified = true;
        } else if (status === 'UNVERIFIED') {
            where.ghanaCardVerified = false;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    email: true,
                    role: true,
                    ghanaCardVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            properties: true,
                            serviceBookings: true
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                properties: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                serviceBookings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        provider: { select: { businessName: true } }
                    }
                },
                subscription: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Fetch user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.put('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role, ghanaCardVerified, suspended } = req.body;

        const updateData: any = {};
        if (role) updateData.role = role;
        if (typeof ghanaCardVerified === 'boolean') updateData.ghanaCardVerified = ghanaCardVerified;
        if (typeof suspended === 'boolean') updateData.suspended = suspended;

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json({ user, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// ============================================
// PROPERTY MANAGEMENT
// ============================================

router.get('/properties', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', status, search, verified } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { location: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (verified === 'true') {
            where.verified = true;
        } else if (verified === 'false') {
            where.verified = false;
        }

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: { id: true, fullName: true, phone: true }
                    }
                }
            }),
            prisma.property.count({ where })
        ]);

        res.json({
            properties,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Fetch properties error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

router.put('/properties/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, verified, featured, rejectionReason } = req.body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (typeof verified === 'boolean') updateData.verified = verified;
        if (typeof featured === 'boolean') updateData.featured = featured;
        if (rejectionReason) updateData.rejectionReason = rejectionReason;

        const property = await prisma.property.update({
            where: { id },
            data: updateData
        });

        res.json({ property, message: 'Property updated successfully' });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

router.delete('/properties/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.property.delete({
            where: { id }
        });

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// ============================================
// SERVICE PROVIDER MANAGEMENT
// ============================================

router.get('/providers', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', serviceType, verified, search } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = {};

        if (serviceType && serviceType !== 'ALL') {
            where.serviceType = serviceType;
        }

        if (verified === 'true') {
            where.verified = true;
        } else if (verified === 'false') {
            where.verified = false;
        }

        if (search) {
            where.OR = [
                { businessName: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [providers, total] = await Promise.all([
            prisma.serviceProvider.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, fullName: true, phone: true, ghanaCardVerified: true }
                    },
                    _count: {
                        select: { bookings: true, reviews: true }
                    }
                }
            }),
            prisma.serviceProvider.count({ where })
        ]);

        res.json({
            providers,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Fetch providers error:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});

router.put('/providers/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { verified, suspended, featured } = req.body;

        const updateData: any = {};
        if (typeof verified === 'boolean') updateData.verified = verified;
        if (typeof suspended === 'boolean') updateData.suspended = suspended;
        if (typeof featured === 'boolean') updateData.featured = featured;

        const provider = await prisma.serviceProvider.update({
            where: { id },
            data: updateData
        });

        res.json({ provider, message: 'Provider updated successfully' });
    } catch (error) {
        console.error('Update provider error:', error);
        res.status(500).json({ error: 'Failed to update provider' });
    }
});

// ============================================
// BOOKING MANAGEMENT
// ============================================

router.get('/bookings', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', status, search } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [bookings, total] = await Promise.all([
            prisma.serviceBooking.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: {
                        select: { id: true, fullName: true, phone: true }
                    },
                    provider: {
                        select: { id: true, businessName: true, serviceType: true }
                    }
                }
            }),
            prisma.serviceBooking.count({ where })
        ]);

        res.json({
            bookings,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Fetch bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

router.put('/bookings/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const booking = await prisma.serviceBooking.update({
            where: { id },
            data: {
                status,
                notes: adminNote ? `[Admin] ${adminNote}` : undefined
            }
        });

        res.json({ booking, message: 'Booking updated successfully' });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

router.get('/subscriptions', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', tier, status } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = {};

        if (tier && tier !== 'ALL') {
            where.tier = tier;
        }

        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [subscriptions, total, tierStats] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, fullName: true, phone: true, email: true }
                    }
                }
            }),
            prisma.subscription.count({ where }),
            prisma.subscription.groupBy({
                by: ['tier'],
                where: { status: 'ACTIVE' },
                _count: { tier: true }
            })
        ]);

        res.json({
            subscriptions,
            tierStats: tierStats.reduce((acc, item) => {
                acc[item.tier] = item._count.tier;
                return acc;
            }, {} as Record<string, number>),
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Fetch subscriptions error:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

router.put('/subscriptions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tier, status, contactsRemaining } = req.body;

        const updateData: any = {};
        if (tier) updateData.tier = tier;
        if (status) updateData.status = status;
        if (typeof contactsRemaining === 'number') updateData.contactsRemaining = contactsRemaining;

        const subscription = await prisma.subscription.update({
            where: { id },
            data: updateData
        });

        res.json({ subscription, message: 'Subscription updated successfully' });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// ============================================
// ANALYTICS
// ============================================

router.get('/analytics', async (req: Request, res: Response) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period as string);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get user registrations by day
        const usersByDay = await prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: startDate }
            },
            _count: { id: true }
        });

        // Get bookings by status
        const bookingsByStatus = await prisma.serviceBooking.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        // Get properties by type
        const propertiesByType = await prisma.property.groupBy({
            by: ['propertyType'],
            _count: { propertyType: true }
        });

        // Top providers by bookings
        const topProviders = await prisma.serviceProvider.findMany({
            take: 10,
            orderBy: {
                bookings: { _count: 'desc' }
            },
            include: {
                _count: { select: { bookings: true, reviews: true } },
                user: { select: { fullName: true } }
            }
        });

        // Revenue by tier
        const subscriptionsByTier = await prisma.subscription.groupBy({
            by: ['tier'],
            where: { status: 'ACTIVE' },
            _count: { tier: true }
        });

        const tierPrices: Record<string, number> = {
            FREE: 0, STARTER: 29, PRO: 79, ENTERPRISE: 199
        };

        const revenueByTier = subscriptionsByTier.map(item => ({
            tier: item.tier,
            count: item._count.tier,
            revenue: item._count.tier * (tierPrices[item.tier] || 0)
        }));

        res.json({
            userGrowth: usersByDay,
            bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {} as Record<string, number>),
            propertiesByType: propertiesByType.reduce((acc, item) => {
                acc[item.propertyType] = item._count.propertyType;
                return acc;
            }, {} as Record<string, number>),
            topProviders,
            revenueByTier
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
