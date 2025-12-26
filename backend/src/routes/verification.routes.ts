import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Ghana Card verification schema
const verifyGhanaCardSchema = z.object({
    ghanaCardNumber: z.string().regex(/^GHA-[0-9]{9}-[0-9]$/, 'Invalid Ghana Card format'),
    fullName: z.string().min(2),
    dateOfBirth: z.string(),
});

// Verify Ghana Card
router.post('/ghana-card', async (req, res) => {
    try {
        const { ghanaCardNumber, fullName, dateOfBirth } = verifyGhanaCardSchema.parse(req.body);

        // In production, this would call the NIA API
        // For now, we simulate verification with basic validation

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock verification logic
        const isValidFormat = /^GHA-[0-9]{9}-[0-9]$/.test(ghanaCardNumber);

        if (!isValidFormat) {
            return res.status(400).json({
                success: false,
                verified: false,
                error: 'Invalid Ghana Card number format',
            });
        }

        // In production: Call NIA API to verify
        // const niaResponse = await fetch('https://nia.gov.gh/api/verify', {
        //     method: 'POST',
        //     body: JSON.stringify({ cardNumber: ghanaCardNumber, name: fullName, dob: dateOfBirth }),
        // });

        // Mock successful verification
        res.json({
            success: true,
            verified: true,
            data: {
                ghanaCardNumber,
                fullName,
                verifiedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Ghana Card Verification Error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Mobile Money payment initiation
router.post('/initiate-payment', async (req, res) => {
    try {
        const paymentSchema = z.object({
            amount: z.number().positive(),
            phone: z.string().regex(/^0[235][0-9]{8}$/),
            provider: z.enum(['MTN', 'VODAFONE', 'AIRTELTIGO']),
            reference: z.string(),
            description: z.string(),
        });

        const { amount, phone, provider, reference, description } = paymentSchema.parse(req.body);

        // Format phone for international
        const formattedPhone = phone.startsWith('0') ? `+233${phone.slice(1)}` : phone;

        // In production, integrate with payment providers:
        // - MTN MoMo API
        // - Vodafone Cash API
        // - AirtelTigo Money API
        // - Hubtel Payment Gateway
        // - Paystack Ghana

        // Mock payment initiation
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        res.json({
            success: true,
            transactionId,
            status: 'PENDING',
            message: `Payment request sent to ${formattedPhone}. Please approve on your phone.`,
            provider,
            amount,
            reference,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Payment Initiation Error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

// Check payment status
router.get('/payment-status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        // In production, check with payment provider
        // Mock status check
        const statuses = ['PENDING', 'SUCCESS', 'FAILED'];
        const randomStatus = Math.random() > 0.3 ? 'SUCCESS' : 'PENDING';

        res.json({
            success: true,
            transactionId,
            status: randomStatus,
            message: randomStatus === 'SUCCESS'
                ? 'Payment completed successfully'
                : 'Awaiting customer approval',
        });
    } catch (error) {
        console.error('Payment Status Error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

export default router;
