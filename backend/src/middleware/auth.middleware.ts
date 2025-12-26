import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        phone: string;
        role: string;
        subscriptionTier: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Use same fallback secret as auth routes for dev mode
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-directrent-ghana';

        const decoded = jwt.verify(token, jwtSecret) as {
            userId: string;
            phone: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                phone: true,
                role: true,
                subscriptionTier: true,
                freeContactsRemaining: true,
                subscriptionExpiresAt: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = {
            id: user.id,
            phone: user.phone,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

// Optional auth - continues even without token
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        // Use same fallback secret as auth routes for dev mode
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-directrent-ghana';

        const decoded = jwt.verify(token, jwtSecret) as {
            userId: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                phone: true,
                role: true,
                subscriptionTier: true,
            },
        });

        if (user) {
            req.user = {
                id: user.id,
                phone: user.phone,
                role: user.role,
                subscriptionTier: user.subscriptionTier,
            };
        }

        next();
    } catch {
        next();
    }
};

// Role-based access control
export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

// Check subscription tier
export const requireSubscription = (...tiers: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!tiers.includes(req.user.subscriptionTier)) {
            return res.status(403).json({
                error: 'Subscription required',
                requiredTiers: tiers,
                currentTier: req.user.subscriptionTier
            });
        }

        next();
    };
};
