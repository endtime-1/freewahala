import { z } from 'zod';

// Phone number validation for Ghana
export const ghanaPhoneSchema = z.string()
    .regex(/^0[235][0-9]{8}$/, 'Invalid Ghana phone number')
    .transform(val => val.replace(/\s/g, ''));

// Ghana Card validation
export const ghanaCardSchema = z.string()
    .regex(/^GHA-[0-9]{9}-[0-9]$/, 'Invalid Ghana Card number');

// Email validation
export const emailSchema = z.string().email('Invalid email address').optional();

// Price validation (in Cedis)
export const priceSchema = z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price too high');

// Property validation
export const createPropertySchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(200),
    description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
    price: priceSchema,
    rentAdvancePeriod: z.enum(['SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS']),
    propertyType: z.enum([
        'SINGLE_ROOM', 'CHAMBER_HALL', 'SELF_CONTAINED', 'ONE_BEDROOM',
        'TWO_BEDROOM', 'THREE_BEDROOM', 'FOUR_BEDROOM_PLUS', 'APARTMENT', 'HOUSE'
    ]),
    region: z.string().min(1, 'Region is required'),
    city: z.string().min(1, 'City is required'),
    neighborhood: z.string().min(1, 'Neighborhood is required'),
    address: z.string().min(5, 'Address is required').optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    hasSelfMeter: z.boolean().default(false),
    waterFlow: z.enum(['CONSTANT', 'WEEKLY', 'IRREGULAR']).default('CONSTANT'),
    isWalledGated: z.boolean().default(false),
    hasPopCeiling: z.boolean().default(false),
    hasTiledFloor: z.boolean().default(false),
    noLandlordOnCompound: z.boolean().default(false),
    hasKitchenCabinet: z.boolean().default(false),
    isNewlyBuilt: z.boolean().default(false),
    hasBoysQuarters: z.boolean().default(false),
    hasStoreRoom: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasAC: z.boolean().default(false),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
});

// User registration validation
export const registerUserSchema = z.object({
    phone: ghanaPhoneSchema,
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    role: z.enum(['TENANT', 'LANDLORD', 'SERVICE_PROVIDER']),
    ghanaCard: ghanaCardSchema.optional(),
    email: emailSchema,
});

// OTP validation
export const verifyOtpSchema = z.object({
    phone: ghanaPhoneSchema,
    code: z.string().length(6, 'OTP must be 6 digits').regex(/^[0-9]+$/, 'OTP must be digits only'),
});

// Booking validation
export const createBookingSchema = z.object({
    serviceProviderId: z.string().uuid(),
    serviceType: z.string().min(1),
    preferredDate: z.string().datetime(),
    location: z.string().min(5),
    notes: z.string().max(1000).optional(),
});

// Agreement validation
export const createAgreementSchema = z.object({
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid().optional(),
    tenantName: z.string().min(2).max(100),
    tenantPhone: ghanaPhoneSchema,
    tenantGhanaCard: ghanaCardSchema,
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    monthlyRent: priceSchema,
    securityDeposit: priceSchema.optional(),
    advanceAmount: priceSchema,
    utilities: z.enum(['TENANT', 'LANDLORD', 'SHARED']).default('TENANT'),
    additionalTerms: z.string().max(5000).optional(),
});

// Report validation
export const createReportSchema = z.object({
    propertyId: z.string().uuid(),
    reason: z.enum([
        'FAKE_LISTING', 'WRONG_LOCATION', 'WRONG_PRICE', 'ALREADY_RENTED',
        'SCAM', 'AGENT_POSING', 'WRONG_PHOTOS', 'OTHER'
    ]),
    details: z.string().max(2000).optional(),
    contactBack: z.boolean().default(true),
});

// Movers quote validation
export const moversQuoteSchema = z.object({
    inventory: z.record(z.string(), z.number().int().positive()),
    fromLocation: z.string().min(5),
    toLocation: z.string().min(5),
    fromFloor: z.number().int().min(0).max(20),
    toFloor: z.number().int().min(0).max(20),
    needPacking: z.boolean().default(false),
    movingDate: z.string().datetime(),
});

// Sanitize string input
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>\"\'&]/g, (char) => {
            const entities: Record<string, string> = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '&': '&amp;',
            };
            return entities[char] || char;
        });
}

// Validate and sanitize object
export function validateAndSanitize<T extends z.ZodSchema>(
    schema: T,
    data: unknown
): z.infer<T> {
    const result = schema.parse(data);

    // Recursively sanitize strings
    const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') return sanitizeInput(obj);
        if (Array.isArray(obj)) return obj.map(sanitizeObject);
        if (obj && typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, sanitizeObject(value)])
            );
        }
        return obj;
    };

    return sanitizeObject(result);
}
