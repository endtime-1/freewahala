import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Service type mapping for frontend to backend enum
const SERVICE_TYPE_MAP: Record<string, string> = {
    'movers': 'PACKERS_MOVERS',
    'electrician': 'ELECTRICIAN',
    'plumber': 'PLUMBER',
    'painter': 'PAINTER',
    'cleaner': 'CLEANER',
    'ac': 'AC_TECHNICIAN',
    'carpenter': 'CARPENTER',
    'tiler': 'TILER',
    'mason': 'MASON',
    'handyman': 'GENERAL_HANDYMAN',
};

// Get service categories
router.get('/categories', async (req, res) => {
    const categories = [
        { id: 'movers', name: 'Packers & Movers', icon: '🚚', description: 'Relocate with ease' },
        { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Electrical repairs & installation' },
        { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Plumbing fixes & installations' },
        { id: 'painter', name: 'Painter', icon: '🎨', description: 'Interior & exterior painting' },
        { id: 'cleaner', name: 'Cleaning', icon: '🧹', description: 'Deep cleaning & move-out cleaning' },
        { id: 'ac', name: 'AC Technician', icon: '❄️', description: 'AC repair & maintenance' },
        { id: 'carpenter', name: 'Carpenter', icon: '🪚', description: 'Furniture & woodwork' },
        { id: 'tiler', name: 'Tiler', icon: '🔲', description: 'Tile installation & repair' },
    ];
    res.json({ categories });
});

// Register as service provider
router.post('/providers/register', authenticate, async (req: AuthRequest, res) => {
    try {
        const data = z.object({
            serviceType: z.string(),
            businessName: z.string().min(2),
            description: z.string().optional(),
            coverageAreas: z.array(z.string()).min(1),
            pricing: z.object({
                services: z.array(z.object({
                    name: z.string(),
                    price: z.number(),
                })).optional(),
                minPrice: z.number().optional(),
                maxPrice: z.number().optional(),
            }).optional(),
            experience: z.string().optional(),
        }).parse(req.body);

        // Check if user is already a provider
        const existing = await prisma.serviceProvider.findUnique({
            where: { userId: req.user!.id },
        });

        if (existing) {
            return res.status(400).json({ error: 'You are already registered as a service provider' });
        }

        // Map frontend service type to enum
        const serviceTypeEnum = SERVICE_TYPE_MAP[data.serviceType] || data.serviceType.toUpperCase();

        // Update user role to SERVICE_PROVIDER
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { role: 'SERVICE_PROVIDER' },
        });

        // Create service provider profile
        const provider = await prisma.serviceProvider.create({
            data: {
                userId: req.user!.id,
                serviceType: serviceTypeEnum as any,
                businessName: data.businessName,
                description: data.description,
                coverageAreas: data.coverageAreas,
                pricing: data.pricing || {},
            },
            include: {
                user: { select: { fullName: true, phone: true, ghanaCardVerified: true } },
            },
        });

        res.status(201).json({ provider });
    } catch (error: any) {
        console.error('Provider registration error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to register as provider' });
    }
});

// Get all providers (with optional category filter)
router.get('/providers', async (req, res) => {
    try {
        const { serviceType, city, category } = req.query;
        const where: any = { isActive: true };

        // Support both serviceType (enum) and category (frontend slug)
        if (category && typeof category === 'string') {
            const enumType = SERVICE_TYPE_MAP[category];
            if (enumType) {
                where.serviceType = enumType;
            }
        } else if (serviceType) {
            where.serviceType = serviceType;
        }

        const providers = await prisma.serviceProvider.findMany({
            where,
            include: {
                user: { select: { fullName: true, ghanaCardVerified: true, profileImageUrl: true } },
                bookings: {
                    where: { status: 'COMPLETED' },
                    select: { id: true },
                },
            },
            orderBy: { rating: 'desc' },
        });

        // Transform for frontend
        const transformedProviders = providers.map(p => ({
            id: p.id,
            userId: p.userId,
            name: p.user.fullName || 'Provider',
            businessName: p.businessName,
            serviceType: p.serviceType,
            rating: Number(p.rating),
            reviewCount: p.totalReviews,
            completedJobs: p.bookings.length,
            verified: p.verified,
            ghanaCardVerified: p.user.ghanaCardVerified,
            coverageAreas: p.coverageAreas as string[],
            pricing: p.pricing,
            description: p.description,
            profileImageUrl: p.user.profileImageUrl,
            memberSince: p.createdAt.getFullYear().toString(),
        }));

        res.json({ providers: transformedProviders });
    } catch (error) {
        console.error('Fetch providers error:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});

// Get providers by category (for category pages)
router.get('/providers/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const enumType = SERVICE_TYPE_MAP[category];

        if (!enumType) {
            // Return empty providers for unknown categories instead of error
            return res.json({ providers: [] });
        }

        const providers = await prisma.serviceProvider.findMany({
            where: {
                serviceType: enumType as any,
                isActive: true,
            },
            include: {
                user: { select: { fullName: true, ghanaCardVerified: true, profileImageUrl: true } },
                bookings: {
                    where: { status: 'COMPLETED' },
                    select: { id: true },
                },
            },
            orderBy: { rating: 'desc' },
        });

        const transformedProviders = providers.map(p => ({
            id: p.id,
            name: p.user.fullName || 'Provider',
            businessName: p.businessName,
            serviceType: p.serviceType,
            rating: Number(p.rating),
            reviewCount: p.totalReviews,
            completedJobs: p.bookings.length,
            verified: p.verified,
            ghanaCardVerified: p.user.ghanaCardVerified,
            coverageAreas: p.coverageAreas as string[],
            pricing: p.pricing,
            description: p.description,
            priceRange: {
                min: (p.pricing as any)?.minPrice || 50,
                max: (p.pricing as any)?.maxPrice || 500,
            },
            responseTime: '< 2 hours',
            memberSince: p.createdAt.getFullYear().toString(),
        }));

        res.json({ providers: transformedProviders });
    } catch (error: any) {
        console.error('Fetch category providers error:', error);
        // Return empty array instead of error for better UX
        res.json({ providers: [] });
    }
});

// Get single provider by ID
router.get('/providers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await prisma.serviceProvider.findUnique({
            where: { id },
            include: {
                user: { select: { fullName: true, phone: true, ghanaCardVerified: true, profileImageUrl: true } },
                bookings: {
                    where: { status: 'COMPLETED', review: { not: null } },
                    select: {
                        id: true,
                        rating: true,
                        review: true,
                        completedAt: true,
                        customer: { select: { fullName: true } },
                    },
                    orderBy: { completedAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        const result = {
            id: provider.id,
            name: provider.user.fullName || 'Provider',
            businessName: provider.businessName,
            phone: provider.user.phone,
            serviceType: provider.serviceType,
            rating: Number(provider.rating),
            reviewCount: provider.totalReviews,
            verified: provider.verified,
            ghanaCardVerified: provider.user.ghanaCardVerified,
            coverageAreas: provider.coverageAreas,
            pricing: provider.pricing,
            description: provider.description,
            profileImageUrl: provider.user.profileImageUrl,
            memberSince: provider.createdAt.getFullYear().toString(),
            reviews: provider.bookings.map(b => ({
                id: b.id,
                rating: b.rating,
                review: b.review,
                date: b.completedAt,
                customerName: b.customer.fullName || 'Customer',
            })),
        };

        res.json({ provider: result });
    } catch (error) {
        console.error('Fetch provider error:', error);
        res.status(500).json({ error: 'Failed to fetch provider' });
    }
});

// Update provider profile
router.put('/providers/profile', authenticate, async (req: AuthRequest, res) => {
    try {
        const provider = await prisma.serviceProvider.findUnique({
            where: { userId: req.user!.id },
        });

        if (!provider) {
            return res.status(404).json({ error: 'Provider profile not found' });
        }

        const data = z.object({
            businessName: z.string().min(2).optional(),
            description: z.string().optional(),
            coverageAreas: z.array(z.string()).optional(),
            pricing: z.any().optional(),
            isActive: z.boolean().optional(),
        }).parse(req.body);

        const updated = await prisma.serviceProvider.update({
            where: { id: provider.id },
            data,
        });

        res.json({ provider: updated });
    } catch (error: any) {
        console.error('Update provider error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Book service
router.post('/book', authenticate, async (req: AuthRequest, res) => {
    try {
        const data = z.object({
            providerId: z.string().uuid(),
            scheduledDate: z.string(),
            scheduledTime: z.string().optional(),
            address: z.string(),
            city: z.string(),
            notes: z.string().optional(),
        }).parse(req.body);

        const provider = await prisma.serviceProvider.findUnique({ where: { id: data.providerId } });
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        const booking = await prisma.serviceBooking.create({
            data: {
                customerId: req.user!.id,
                providerId: data.providerId,
                serviceType: provider.serviceType,
                scheduledDate: new Date(data.scheduledDate),
                scheduledTime: data.scheduledTime,
                address: data.address,
                city: data.city,
                notes: data.notes,
            },
            include: {
                provider: { select: { businessName: true, serviceType: true } },
            },
        });
        res.status(201).json({ booking });
    } catch (error: any) {
        console.error('Book service error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to book service' });
    }
});

// Get my bookings (as customer)
router.get('/bookings/my', authenticate, async (req: AuthRequest, res) => {
    try {
        const bookings = await prisma.serviceBooking.findMany({
            where: { customerId: req.user!.id },
            include: {
                provider: {
                    select: {
                        businessName: true,
                        serviceType: true,
                        user: { select: { phone: true } },
                    },
                },
            },
            orderBy: { scheduledDate: 'desc' },
        });
        res.json({ bookings });
    } catch (error) {
        console.error('Fetch my bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get bookings for provider
router.get('/providers/bookings', authenticate, async (req: AuthRequest, res) => {
    try {
        const provider = await prisma.serviceProvider.findUnique({
            where: { userId: req.user!.id },
        });

        if (!provider) {
            return res.status(404).json({ error: 'Provider profile not found' });
        }

        const { status } = req.query;
        const where: any = { providerId: provider.id };
        if (status) where.status = status;

        const bookings = await prisma.serviceBooking.findMany({
            where,
            include: {
                customer: { select: { fullName: true, phone: true } },
            },
            orderBy: { scheduledDate: 'desc' },
        });

        res.json({ bookings });
    } catch (error) {
        console.error('Fetch provider bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Update booking status (confirm, cancel, complete)
router.put('/bookings/:id/status', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { status } = z.object({
            status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
        }).parse(req.body);

        const booking = await prisma.serviceBooking.findUnique({
            where: { id },
            include: { provider: true },
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if user is the provider or customer
        const isProvider = booking.provider.userId === req.user!.id;
        const isCustomer = booking.customerId === req.user!.id;

        if (!isProvider && !isCustomer) {
            return res.status(403).json({ error: 'Not authorized to update this booking' });
        }

        // Only provider can confirm/complete
        if ((status === 'CONFIRMED' || status === 'COMPLETED' || status === 'IN_PROGRESS') && !isProvider) {
            return res.status(403).json({ error: 'Only provider can update to this status' });
        }

        const updateData: any = { status };
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
        }

        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: updateData,
        });

        res.json({ booking: updated });
    } catch (error: any) {
        console.error('Update booking status error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid status' });
        }
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// Add review to booking
router.post('/bookings/:id/review', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = z.object({
            rating: z.number().min(1).max(5),
            review: z.string().optional(),
        }).parse(req.body);

        const booking = await prisma.serviceBooking.findUnique({
            where: { id },
            include: { provider: true },
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.customerId !== req.user!.id) {
            return res.status(403).json({ error: 'Only customer can review this booking' });
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Can only review completed bookings' });
        }

        if (booking.rating) {
            return res.status(400).json({ error: 'Booking already reviewed' });
        }

        // Update booking with review
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { rating, review },
        });

        // Update provider rating
        const allReviews = await prisma.serviceBooking.findMany({
            where: { providerId: booking.providerId, rating: { not: null } },
            select: { rating: true },
        });

        const avgRating = allReviews.reduce((sum, b) => sum + (b.rating || 0), 0) / allReviews.length;

        await prisma.serviceProvider.update({
            where: { id: booking.providerId },
            data: {
                rating: avgRating,
                totalReviews: allReviews.length,
            },
        });

        res.json({ booking: updated });
    } catch (error: any) {
        console.error('Add review error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid review data' });
        }
        res.status(500).json({ error: 'Failed to add review' });
    }
});

export default router;
