import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// In-memory payout store
const payouts: Map<string, {
    id: string;
    providerId: string;
    amount: number;
    method: 'MTN' | 'VODAFONE' | 'AIRTELTIGO' | 'BANK';
    accountNumber: string;
    accountName: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    reference: string;
    createdAt: Date;
    completedAt?: Date;
}> = new Map();

// Mock provider balances (in production this comes from DB)
const providerBalances: Map<string, number> = new Map([
    ['1', 1540], // Kwame
    ['2', 850],  // Ama
    ['3', 2100], // Kofi
]);

// Get provider balance and payout history
router.get('/history/:providerId', (req, res) => {
    const { providerId } = req.params;

    const balance = providerBalances.get(providerId) || 0;
    const history = Array.from(payouts.values())
        .filter(p => p.providerId === providerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
        success: true,
        data: {
            availableBalance: balance,
            payouts: history,
        },
    });
});

// Request a payout
router.post('/request', (req, res) => {
    try {
        const schema = z.object({
            providerId: z.string(),
            amount: z.number().min(10).max(5000), // Min GH₵10, Max GH₵5000 per transaction
            method: z.enum(['MTN', 'VODAFONE', 'AIRTELTIGO', 'BANK']),
            accountNumber: z.string().min(10),
            accountName: z.string().min(3),
        });

        const { providerId, amount, method, accountNumber, accountName } = schema.parse(req.body);

        // Check balance
        const currentBalance = providerBalances.get(providerId) || 0;
        if (currentBalance < amount) {
            return res.status(400).json({
                error: 'Insufficient funds',
                currentBalance,
            });
        }

        // Create payout request
        const id = `PAYOUT_${Date.now()}`;
        const payout = {
            id,
            providerId,
            amount,
            method,
            accountNumber,
            accountName,
            status: 'PENDING' as const,
            reference: `REF-${Math.floor(Math.random() * 1000000)}`,
            createdAt: new Date(),
        };

        // Deduct balance immediately (lock funds)
        providerBalances.set(providerId, currentBalance - amount);
        payouts.set(id, payout);

        // Simulate processing delay
        setTimeout(() => {
            const p = payouts.get(id);
            if (p) {
                p.status = 'COMPLETED';
                p.completedAt = new Date();
                payouts.set(id, p);
            }
        }, 5000); // 5 seconds processing

        res.json({
            success: true,
            message: 'Payout request initiated',
            payout,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Failed to request payout' });
    }
});

export default router;
