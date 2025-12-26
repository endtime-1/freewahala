import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Calculate stamp duty (Ghana-specific)
const calculateStampDuty = (monthlyRent: number, durationMonths: number): number => {
    // Ghana stamp duty: 0.5% of total rent value
    const totalRent = monthlyRent * durationMonths;
    return totalRent * 0.005;
};

// Create agreement schema
const createAgreementSchema = z.object({
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    monthlyRent: z.number().positive(),
    advancePaid: z.number().positive(),
    securityDeposit: z.number().optional(),
    terms: z.object({
        utilities: z.string().optional(),
        maintenance: z.string().optional(),
        noticePeriod: z.string().optional(),
        restrictions: z.array(z.string()).optional(),
        customTerms: z.array(z.string()).optional(),
    }).optional(),
});

// Get my agreements (as landlord or tenant)
router.get('/my', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        const agreements = await prisma.rentalAgreement.findMany({
            where: {
                OR: [
                    { landlordId: userId },
                    { tenantId: userId },
                ],
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        neighborhood: true,
                        city: true,
                        images: true,
                    },
                },
                landlord: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ agreements });
    } catch (error) {
        console.error('Get Agreements Error:', error);
        res.status(500).json({ error: 'Failed to fetch agreements' });
    }
});

// Create agreement (Landlord initiates)
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const data = createAgreementSchema.parse(req.body);
        const landlordId = req.user!.id;

        // Verify landlord owns the property
        const property = await prisma.property.findFirst({
            where: {
                id: data.propertyId,
                ownerId: landlordId,
            },
        });

        if (!property) {
            return res.status(403).json({ error: 'You can only create agreements for your own properties' });
        }

        // Calculate duration and stamp duty
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const durationMonths = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const stampDutyAmount = calculateStampDuty(data.monthlyRent, durationMonths);

        const agreement = await prisma.rentalAgreement.create({
            data: {
                propertyId: data.propertyId,
                landlordId,
                tenantId: data.tenantId,
                startDate: start,
                endDate: end,
                monthlyRent: data.monthlyRent,
                advancePaid: data.advancePaid,
                securityDeposit: data.securityDeposit,
                terms: data.terms || {},
                stampDutyAmount,
                status: 'PENDING_LANDLORD_SIGNATURE',
            },
            include: {
                property: {
                    select: { title: true, neighborhood: true },
                },
                tenant: {
                    select: { fullName: true, phone: true },
                },
            },
        });

        res.status(201).json({ agreement });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Create Agreement Error:', error);
        res.status(500).json({ error: 'Failed to create agreement' });
    }
});

// Get single agreement
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        const agreement = await prisma.rentalAgreement.findFirst({
            where: {
                id: req.params.id,
                OR: [
                    { landlordId: userId },
                    { tenantId: userId },
                ],
            },
            include: {
                property: true,
                landlord: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        ghanaCardVerified: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        ghanaCardVerified: true,
                    },
                },
            },
        });

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        res.json({ agreement });
    } catch (error) {
        console.error('Get Agreement Error:', error);
        res.status(500).json({ error: 'Failed to fetch agreement' });
    }
});

// Sign agreement
router.post('/:id/sign', authenticate, async (req: AuthRequest, res) => {
    try {
        const { signature } = z.object({
            signature: z.string(), // Base64 encoded signature image
        }).parse(req.body);

        const userId = req.user!.id;

        const agreement = await prisma.rentalAgreement.findUnique({
            where: { id: req.params.id },
        });

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const isLandlord = agreement.landlordId === userId;
        const isTenant = agreement.tenantId === userId;

        if (!isLandlord && !isTenant) {
            return res.status(403).json({ error: 'Not authorized to sign this agreement' });
        }

        // Update with signature
        const updateData: any = {};
        let newStatus = agreement.status;

        if (isLandlord) {
            updateData.landlordSignature = signature;
            updateData.landlordSignedAt = new Date();

            if (agreement.status === 'PENDING_LANDLORD_SIGNATURE') {
                newStatus = 'PENDING_TENANT_SIGNATURE';
            } else if (agreement.tenantSignature) {
                newStatus = 'ACTIVE';
            }
        }

        if (isTenant) {
            updateData.tenantSignature = signature;
            updateData.tenantSignedAt = new Date();

            if (agreement.landlordSignature) {
                newStatus = 'ACTIVE';
            }
        }

        updateData.status = newStatus;

        const updated = await prisma.rentalAgreement.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.json({
            success: true,
            status: updated.status,
            message: updated.status === 'ACTIVE'
                ? 'Agreement is now active!'
                : 'Signature saved. Awaiting other party signature.',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Sign Agreement Error:', error);
        res.status(500).json({ error: 'Failed to sign agreement' });
    }
});

// Pay stamp duty (simulate)
router.post('/:id/pay-stamp-duty', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        const agreement = await prisma.rentalAgreement.findFirst({
            where: {
                id: req.params.id,
                OR: [
                    { landlordId: userId },
                    { tenantId: userId },
                ],
            },
        });

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        // TODO: Integrate with Ghana Revenue Authority or payment provider
        // For now, simulate successful payment
        const stampDutyReference = `SD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const updated = await prisma.rentalAgreement.update({
            where: { id: req.params.id },
            data: {
                stampDutyPaid: true,
                stampDutyReference,
            },
        });

        res.json({
            success: true,
            stampDutyReference,
            amount: updated.stampDutyAmount,
        });
    } catch (error) {
        console.error('Pay Stamp Duty Error:', error);
        res.status(500).json({ error: 'Failed to process stamp duty payment' });
    }
});

// Get agreement templates
router.get('/templates/list', authenticate, async (req: AuthRequest, res) => {
    try {
        const templates = [
            {
                id: 'standard',
                name: 'Standard Rental Agreement',
                description: 'Basic rental agreement for residential properties',
                terms: {
                    utilities: 'Tenant pays for electricity and water',
                    maintenance: 'Minor repairs by tenant, major repairs by landlord',
                    noticePeriod: '2 months',
                    restrictions: ['No pets', 'No subletting'],
                },
            },
            {
                id: 'commercial',
                name: 'Commercial Lease Agreement',
                description: 'For office spaces and shops',
                terms: {
                    utilities: 'All utilities paid by tenant',
                    maintenance: 'Tenant responsible for interior maintenance',
                    noticePeriod: '3 months',
                    restrictions: ['No structural modifications', 'Business hours only'],
                },
            },
            {
                id: 'furnished',
                name: 'Furnished Property Agreement',
                description: 'For fully furnished rentals',
                terms: {
                    utilities: 'Included in rent',
                    maintenance: 'Landlord maintains all furniture and appliances',
                    noticePeriod: '1 month',
                    restrictions: ['No modifications to furniture', 'Damage costs apply'],
                },
            },
        ];

        res.json({ templates });
    } catch (error) {
        console.error('Get Templates Error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

export default router;
