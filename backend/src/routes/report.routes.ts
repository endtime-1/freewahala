import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Report a property
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const data = z.object({
            propertyId: z.string().uuid(),
            reason: z.enum(['FAKE_LISTING', 'WRONG_LOCATION', 'SCAM', 'ALREADY_RENTED', 'MISLEADING_IMAGES', 'OTHER']),
            description: z.string().max(1000).optional(),
        }).parse(req.body);

        const report = await prisma.fraudReport.create({
            data: {
                reporterId: req.user!.id,
                propertyId: data.propertyId,
                reason: data.reason,
                description: data.description,
            },
        });

        res.status(201).json({ report, message: 'Report submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// Get my reports
router.get('/my', authenticate, async (req: AuthRequest, res) => {
    try {
        const reports = await prisma.fraudReport.findMany({
            where: { reporterId: req.user!.id },
            include: { property: { select: { title: true, neighborhood: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

export default router;
