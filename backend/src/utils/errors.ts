import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Custom error class for API errors
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Common error types
export const Errors = {
    badRequest: (message: string, details?: any) =>
        new ApiError(400, message, 'BAD_REQUEST', details),

    unauthorized: (message = 'Unauthorized') =>
        new ApiError(401, message, 'UNAUTHORIZED'),

    forbidden: (message = 'Forbidden') =>
        new ApiError(403, message, 'FORBIDDEN'),

    notFound: (resource = 'Resource') =>
        new ApiError(404, `${resource} not found`, 'NOT_FOUND'),

    conflict: (message: string) =>
        new ApiError(409, message, 'CONFLICT'),

    tooMany: (message = 'Too many requests') =>
        new ApiError(429, message, 'TOO_MANY_REQUESTS'),

    internal: (message = 'Internal server error') =>
        new ApiError(500, message, 'INTERNAL_ERROR'),

    validation: (errors: any) =>
        new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors),
};

// Global error handler middleware
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('[Error]', {
        name: err.name,
        message: err.message,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
            ...(err.details && { details: err.details }),
        });
    }

    // Handle unexpected errors
    return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
    });
}

// Async handler wrapper to catch promise rejections
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Request ID middleware for tracing
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    next();
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');

    next();
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
    });

    next();
}
