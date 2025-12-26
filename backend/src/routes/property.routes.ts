import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, optionalAuth, AuthRequest, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Ghana regions for validation
const GHANA_REGIONS = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo',
    'Western North', 'Ahafo', 'Bono East', 'Oti', 'North East', 'Savannah'
];

// Create property schema
const createPropertySchema = z.object({
    title: z.string().min(10).max(200),
    description: z.string().min(50).max(5000),
    price: z.number().positive(),
    rentAdvancePeriod: z.enum(['SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS']),
    propertyType: z.enum([
        'SINGLE_ROOM', 'CHAMBER_HALL', 'SELF_CONTAINED', 'ONE_BEDROOM',
        'TWO_BEDROOM', 'THREE_BEDROOM', 'FOUR_BEDROOM_PLUS', 'APARTMENT',
        'HOUSE', 'OFFICE_SPACE', 'SHOP', 'WAREHOUSE'
    ]),
    region: z.string(),
    city: z.string(),
    neighborhood: z.string(),
    address: z.string().optional(),
    locationLat: z.number().optional(),
    locationLng: z.number().optional(),
    // Ghana-specific amenities
    hasSelfMeter: z.boolean().default(false),
    waterFlow: z.enum(['CONSTANT', 'WEEKLY', 'IRREGULAR', 'BOREHOLE', 'NONE']).default('CONSTANT'),
    isWalledGated: z.boolean().default(false),
    hasPopCeiling: z.boolean().default(false),
    hasTiledFloor: z.boolean().default(false),
    hasTiledRoad: z.boolean().default(false),
    noLandlordOnCompound: z.boolean().default(false),
    hasKitchenCabinet: z.boolean().default(false),
    isNewlyBuilt: z.boolean().default(false),
    hasBoysQuarters: z.boolean().default(false),
    hasStoreRoom: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasAC: z.boolean().default(false),
    additionalAmenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).min(1).max(20),
});

// Search/filter schema
const searchSchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    region: z.string().optional(),
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    propertyType: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    rentAdvancePeriod: z.string().optional(),
    // Ghana-specific filters
    hasSelfMeter: z.coerce.boolean().optional(),
    waterFlow: z.string().optional(),
    isWalledGated: z.coerce.boolean().optional(),
    noLandlordOnCompound: z.coerce.boolean().optional(),
    hasKitchenCabinet: z.coerce.boolean().optional(),
    isNewlyBuilt: z.coerce.boolean().optional(),
    hasParking: z.coerce.boolean().optional(),
    // Sorting
    sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
});

// Get properties with filters
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const params = searchSchema.parse(req.query);
        const { page, limit, sortBy, ...filters } = params;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = { isActive: true };

        if (filters.region) where.region = filters.region;
        if (filters.city) where.city = filters.city;
        if (filters.neighborhood) where.neighborhood = { contains: filters.neighborhood, mode: 'insensitive' };
        if (filters.propertyType) where.propertyType = filters.propertyType;
        if (filters.rentAdvancePeriod) where.rentAdvancePeriod = filters.rentAdvancePeriod;

        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice) where.price.gte = filters.minPrice;
            if (filters.maxPrice) where.price.lte = filters.maxPrice;
        }

        // Ghana-specific filters
        if (filters.hasSelfMeter) where.hasSelfMeter = true;
        if (filters.waterFlow) where.waterFlow = filters.waterFlow;
        if (filters.isWalledGated) where.isWalledGated = true;
        if (filters.noLandlordOnCompound) where.noLandlordOnCompound = true;
        if (filters.hasKitchenCabinet) where.hasKitchenCabinet = true;
        if (filters.isNewlyBuilt) where.isNewlyBuilt = true;
        if (filters.hasParking) where.hasParking = true;

        // Sorting
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'price_asc') orderBy = { price: 'asc' };
        if (sortBy === 'price_desc') orderBy = { price: 'desc' };
        if (sortBy === 'popular') orderBy = { viewCount: 'desc' };

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    price: true,
                    rentAdvancePeriod: true,
                    propertyType: true,
                    region: true,
                    city: true,
                    neighborhood: true,
                    locationLat: true,
                    locationLng: true,
                    images: true,
                    hasSelfMeter: true,
                    waterFlow: true,
                    isWalledGated: true,
                    noLandlordOnCompound: true,
                    isNewlyBuilt: true,
                    verificationStatus: true,
                    priceTag: true,
                    viewCount: true,
                    createdAt: true,
                    owner: {
                        select: {
                            id: true,
                            fullName: true,
                            ghanaCardVerified: true,
                            // NEVER expose phone here - contact masking!
                        },
                    },
                },
            }),
            prisma.property.count({ where }),
        ]);

        // If user is authenticated, add favorite status
        let propertiesWithFavorites = properties;
        if (req.user) {
            const favorites = await prisma.favorite.findMany({
                where: {
                    userId: req.user.id,
                    propertyId: { in: properties.map(p => p.id) },
                },
                select: { propertyId: true },
            });
            const favoriteIds = new Set(favorites.map(f => f.propertyId));
            propertiesWithFavorites = properties.map(p => ({
                ...p,
                isFavorited: favoriteIds.has(p.id),
            }));
        }

        res.json({
            properties: propertiesWithFavorites,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get Properties Error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// Get single property
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: req.params.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        ghanaCardVerified: true,
                        profileImageUrl: true,
                        createdAt: true,
                        // NEVER expose phone - contact masking!
                    },
                },
            },
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Increment view count
        await prisma.property.update({
            where: { id: req.params.id },
            data: { viewCount: { increment: 1 } },
        });

        // Check if user has unlocked this contact
        let contactUnlocked = false;
        let ownerPhone = null;

        if (req.user) {
            const unlock = await prisma.contactUnlock.findUnique({
                where: {
                    userId_propertyId: {
                        userId: req.user.id,
                        propertyId: property.id,
                    },
                },
            });

            if (unlock) {
                contactUnlocked = true;
                // Fetch owner phone only if unlocked
                const owner = await prisma.user.findUnique({
                    where: { id: property.ownerId },
                    select: { phone: true },
                });
                ownerPhone = owner?.phone;
            }

            // Check favorite status
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_propertyId: {
                        userId: req.user.id,
                        propertyId: property.id,
                    },
                },
            });

            return res.json({
                property: {
                    ...property,
                    isFavorited: !!favorite,
                    contactUnlocked,
                    ownerPhone,
                },
            });
        }

        res.json({ property: { ...property, contactUnlocked: false } });
    } catch (error) {
        console.error('Get Property Error:', error);
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// Create property (Landlords only)
router.post('/', authenticate, requireRole('LANDLORD', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const data = createPropertySchema.parse(req.body);

        // Calculate price tag based on neighborhood average
        let priceTag = 'FAIR';
        const neighborhoodData = await prisma.neighborhoodPricing.findFirst({
            where: {
                neighborhood: data.neighborhood,
                propertyType: data.propertyType,
            },
        });

        if (neighborhoodData) {
            const avgPrice = Number(neighborhoodData.avgPrice);
            const listingPrice = data.price;

            if (listingPrice < avgPrice * 0.85) {
                priceTag = 'GREAT_VALUE';
            } else if (listingPrice > avgPrice * 1.15) {
                priceTag = 'OVERPRICED';
            }
        }

        const property = await prisma.property.create({
            data: {
                ...data,
                ownerId: req.user!.id,
                priceTag,
                neighborhoodAvgPrice: neighborhoodData?.avgPrice || null,
            },
        });

        res.status(201).json({ property });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Create Property Error:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// Update property (Owner only)
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: req.params.id },
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to edit this property' });
        }

        const updateSchema = createPropertySchema.partial();
        const data = updateSchema.parse(req.body);

        const updated = await prisma.property.update({
            where: { id: req.params.id },
            data,
        });

        res.json({ property: updated });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Update Property Error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// Delete property (Owner only)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: req.params.id },
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to delete this property' });
        }

        await prisma.property.delete({ where: { id: req.params.id } });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete Property Error:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// Get my properties (Landlord dashboard)
router.get('/my/listings', authenticate, async (req: AuthRequest, res) => {
    try {
        const properties = await prisma.property.findMany({
            where: { ownerId: req.user!.id },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ properties });
    } catch (error) {
        console.error('Get My Properties Error:', error);
        res.status(500).json({ error: 'Failed to fetch your properties' });
    }
});

// Toggle favorite
router.post('/:id/favorite', authenticate, async (req: AuthRequest, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user!.id;

        const existing = await prisma.favorite.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { userId_propertyId: { userId, propertyId } },
            });
            return res.json({ favorited: false });
        }

        await prisma.favorite.create({
            data: { userId, propertyId },
        });

        res.json({ favorited: true });
    } catch (error) {
        console.error('Toggle Favorite Error:', error);
        res.status(500).json({ error: 'Failed to update favorite' });
    }
});

// Get favorites
router.get('/my/favorites', authenticate, async (req: AuthRequest, res) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user!.id },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        propertyType: true,
                        neighborhood: true,
                        city: true,
                        images: true,
                        priceTag: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ favorites: favorites.map(f => f.property) });
    } catch (error) {
        console.error('Get Favorites Error:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Get properties for map (minimal data)
router.get('/map/markers', async (req, res) => {
    try {
        const { region, city, minLat, maxLat, minLng, maxLng } = req.query;

        const where: any = {
            isActive: true,
            locationLat: { not: null },
            locationLng: { not: null },
        };

        if (region) where.region = region;
        if (city) where.city = city;

        // Bounding box filter for map viewport
        if (minLat && maxLat && minLng && maxLng) {
            where.locationLat = { gte: Number(minLat), lte: Number(maxLat) };
            where.locationLng = { gte: Number(minLng), lte: Number(maxLng) };
        }

        const markers = await prisma.property.findMany({
            where,
            select: {
                id: true,
                price: true,
                locationLat: true,
                locationLng: true,
                propertyType: true,
                priceTag: true,
            },
            take: 500, // Limit markers for performance
        });

        res.json({ markers });
    } catch (error) {
        console.error('Get Map Markers Error:', error);
        res.status(500).json({ error: 'Failed to fetch map data' });
    }
});

export default router;
