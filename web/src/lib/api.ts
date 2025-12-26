const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Property {
    id: string;
    title: string;
    description?: string;
    price: number;
    rentAdvancePeriod: string;
    propertyType: string;
    region: string;
    city: string;
    neighborhood: string;
    locationLat?: number;
    locationLng?: number;
    images: string[];
    hasSelfMeter: boolean;
    waterFlow: string;
    isWalledGated: boolean;
    noLandlordOnCompound: boolean;
    isNewlyBuilt: boolean;
    verificationStatus: boolean;
    priceTag?: 'GREAT_VALUE' | 'FAIR' | 'OVERPRICED';
    viewCount: number;
    createdAt: string;
    isFavorited?: boolean;
    owner?: {
        id: string;
        fullName: string;
        ghanaCardVerified: boolean;
    };
}

export interface SearchParams {
    page?: number;
    limit?: number;
    region?: string;
    city?: string;
    neighborhood?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    hasSelfMeter?: boolean;
    noLandlordOnCompound?: boolean;
    isNewlyBuilt?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
}

export async function getProperties(params: SearchParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.set(key, String(value));
        }
    });

    return fetchAPI(`/properties?${searchParams.toString()}`);
}

export async function getProperty(id: string) {
    return fetchAPI(`/properties/${id}`);
}

export async function getMapMarkers(params: { region?: string; city?: string }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
    });

    return fetchAPI(`/properties/map/markers?${searchParams.toString()}`);
}

export async function toggleFavorite(propertyId: string, token: string) {
    return fetchAPI(`/properties/${propertyId}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function unlockContact(propertyId: string, token: string) {
    return fetchAPI(`/contacts/unlock/${propertyId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function getSubscriptionTiers() {
    return fetchAPI('/subscriptions/tiers');
}
