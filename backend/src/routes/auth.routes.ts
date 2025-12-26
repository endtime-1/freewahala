import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// In-memory OTP storage for development (when no database)
const devOtpStore: Map<string, { code: string; expiresAt: Date }> = new Map();

// In-memory user storage for development
const devUserStore: Map<string, any> = new Map();

// Generate 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP expiry time (5 minutes)
const OTP_EXPIRY_MINUTES = 5;

// Check if we're in dev mode (no database)
const isDev = process.env.NODE_ENV !== 'production';

// Validation schemas
const phoneSchema = z.object({
    phone: z.string().regex(/^0[235][0-9]{8}$/, 'Invalid Ghana phone number format'),
});

const verifyOtpSchema = z.object({
    phone: z.string(),
    code: z.string().length(6),
    fullName: z.string().optional(),
    role: z.enum(['TENANT', 'LANDLORD']).optional(),
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = phoneSchema.parse(req.body);

        // Format phone for international
        const formattedPhone = phone.startsWith('0')
            ? `+233${phone.slice(1)}`
            : phone;

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        let isNewUser = true;

        try {
            // Try database first
            const existingUser = await prisma.user.findUnique({
                where: { phone: formattedPhone },
            });
            isNewUser = !existingUser;

            // Store OTP in database
            await prisma.otpCode.create({
                data: {
                    phone: formattedPhone,
                    code,
                    expiresAt,
                    userId: existingUser?.id,
                },
            });
        } catch (dbError) {
            // Database not available, use in-memory storage
            console.log('📦 Using in-memory OTP storage (database not connected)');
            devOtpStore.set(formattedPhone, { code, expiresAt });
            isNewUser = !devUserStore.has(formattedPhone);
        }

        // Log OTP in development
        console.log(`📱 OTP for ${formattedPhone}: ${code}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            isNewUser,
            // Return OTP in development for testing
            otp: code
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP and login/register
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, code, fullName, role } = verifyOtpSchema.parse(req.body);

        const formattedPhone = phone.startsWith('0')
            ? `+233${phone.slice(1)}`
            : phone;

        let user: any = null;
        let otpValid = false;

        try {
            // Try database first
            const otpRecord = await prisma.otpCode.findFirst({
                where: {
                    phone: formattedPhone,
                    code,
                    verified: false,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { createdAt: 'desc' },
            });

            if (otpRecord) {
                otpValid = true;

                // Mark OTP as verified
                await prisma.otpCode.update({
                    where: { id: otpRecord.id },
                    data: { verified: true },
                });

                // Find or create user
                user = await prisma.user.findUnique({
                    where: { phone: formattedPhone },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            phone: formattedPhone,
                            fullName: fullName || null,
                            role: role || 'TENANT',
                            freeContactsRemaining: 3,
                            freeContactsResetAt: new Date(),
                        },
                    });
                }
            }
        } catch (dbError) {
            // Database not available, use in-memory storage
            console.log('📦 Using in-memory OTP verification (database not connected)');

            const storedOtp = devOtpStore.get(formattedPhone);
            if (storedOtp && storedOtp.code === code && storedOtp.expiresAt > new Date()) {
                otpValid = true;
                devOtpStore.delete(formattedPhone);

                // Get or create in-memory user
                user = devUserStore.get(formattedPhone);
                if (!user) {
                    user = {
                        id: `dev_${Date.now()}`,
                        phone: formattedPhone,
                        fullName: fullName || 'Test User',
                        role: role || 'TENANT',
                        subscriptionTier: 'FREE',
                        freeContactsRemaining: 3,
                        ghanaCardVerified: false,
                    };
                    devUserStore.set(formattedPhone, user);
                }
            }
        }

        if (!otpValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Generate JWT (use fallback secret in dev)
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-directrent-ghana';
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string;
        const token = jwt.sign(
            { userId: user.id, phone: user.phone },
            jwtSecret,
            { expiresIn }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                subscriptionTier: user.subscriptionTier || 'FREE',
                freeContactsRemaining: user.freeContactsRemaining || 3,
                ghanaCardVerified: user.ghanaCardVerified || false,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                phone: true,
                fullName: true,
                email: true,
                role: true,
                ghanaCardNumber: true,
                ghanaCardVerified: true,
                profileImageUrl: true,
                freeContactsRemaining: true,
                subscriptionTier: true,
                subscriptionExpiresAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update profile
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const updateSchema = z.object({
            fullName: z.string().min(2).optional(),
            email: z.string().email().optional(),
            ghanaCardNumber: z.string().optional(),
        });

        const data = updateSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data,
            select: {
                id: true,
                phone: true,
                fullName: true,
                email: true,
                role: true,
                profileImageUrl: true,
            },
        });

        res.json({ user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Switch role (Tenant <-> Landlord)
router.post('/switch-role', authenticate, async (req: AuthRequest, res) => {
    try {
        const { role } = z.object({
            role: z.enum(['TENANT', 'LANDLORD']),
        }).parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { role },
            select: {
                id: true,
                role: true,
            },
        });

        res.json({ success: true, role: user.role });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Switch Role Error:', error);
        res.status(500).json({ error: 'Failed to switch role' });
    }
});

export default router;
