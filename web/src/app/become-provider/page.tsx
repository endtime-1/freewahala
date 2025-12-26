'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const SERVICE_CATEGORIES = [
    { id: 'electrician', name: 'Electrician', icon: '⚡' },
    { id: 'plumber', name: 'Plumber', icon: '🔧' },
    { id: 'painter', name: 'Painter', icon: '🎨' },
    { id: 'cleaner', name: 'Cleaning', icon: '🧹' },
    { id: 'ac', name: 'AC Technician', icon: '❄️' },
    { id: 'carpenter', name: 'Carpenter', icon: '🪚' },
    { id: 'movers', name: 'Packers & Movers', icon: '🚚' },
    { id: 'tiler', name: 'Tiler', icon: '🔲' },
];

const GHANA_REGIONS = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern',
];

const COVERAGE_AREAS: Record<string, string[]> = {
    'Greater Accra': ['East Legon', 'Madina', 'Spintex', 'Tema', 'Adenta', 'Airport Residential', 'Cantonments', 'Osu', 'Labone', 'Dansoman', 'Achimota', 'Kasoa', 'Accra Central'],
    'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong'],
    'Western': ['Takoradi', 'Tarkwa'],
    'Eastern': ['Koforidua', 'Nkawkaw'],
    'Central': ['Cape Coast', 'Elmina', 'Winneba'],
    'Northern': ['Tamale', 'Yendi'],
};

export default function BecomeProviderPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        // Personal Info
        fullName: '',
        phone: '',
        ghanaCard: '',

        // Business Info
        businessName: '',
        serviceCategory: '',
        experience: '',
        bio: '',

        // Coverage & Pricing
        region: 'Greater Accra',
        coverageAreas: [] as string[],
        minPrice: '',
        maxPrice: '',

        // Services
        services: [{ name: '', price: '' }],
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const toggleCoverageArea = (area: string) => {
        setFormData(prev => ({
            ...prev,
            coverageAreas: prev.coverageAreas.includes(area)
                ? prev.coverageAreas.filter(a => a !== area)
                : [...prev.coverageAreas, area],
        }));
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { name: '', price: '' }],
        }));
    };

    const removeService = (index: number) => {
        if (formData.services.length > 1) {
            setFormData(prev => ({
                ...prev,
                services: prev.services.filter((_, i) => i !== index),
            }));
        }
    };

    const updateService = (index: number, field: string, value: string) => {
        const newServices = [...formData.services];
        newServices[index] = { ...newServices[index], [field]: value };
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const validateStep = (stepNum: number): boolean => {
        setError('');

        if (stepNum === 1) {
            if (!formData.fullName.trim()) {
                setError('Please enter your full name');
                return false;
            }
            if (!formData.phone.trim() || formData.phone.length < 10) {
                setError('Please enter a valid phone number');
                return false;
            }
        }

        if (stepNum === 2) {
            if (!formData.serviceCategory) {
                setError('Please select a service category');
                return false;
            }
            if (!formData.businessName.trim()) {
                setError('Please enter your business name');
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        if (formData.coverageAreas.length === 0) {
            setError('Please select at least one coverage area');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Get auth token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please log in to register as a provider');
                router.push('/login?redirect=/become-provider');
                return;
            }

            const response = await fetch(`${API_URL}/api/services/providers/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    serviceType: formData.serviceCategory,
                    businessName: formData.businessName || formData.fullName,
                    description: formData.bio,
                    coverageAreas: formData.coverageAreas,
                    pricing: {
                        services: formData.services
                            .filter(s => s.name && s.price)
                            .map(s => ({ name: s.name, price: parseFloat(s.price) })),
                        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
                        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
                    },
                    experience: formData.experience,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            // Success - redirect to services page with success message
            router.push('/services?registered=success');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const availableAreas = COVERAGE_AREAS[formData.region] || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-500 to-cyan-500 py-12 px-4">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h1 className="text-3xl font-bold mb-2">Become a Service Provider</h1>
                    <p className="text-white/80">Join our network and grow your business</p>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Step {step} of 3</span>
                        <span>{Math.round((step / 3) * 100)}% complete</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => updateField('fullName', e.target.value)}
                                placeholder="As on Ghana Card"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                placeholder="024 XXX XXXX"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ghana Card Number (Optional)</label>
                            <input
                                type="text"
                                value={formData.ghanaCard}
                                onChange={(e) => updateField('ghanaCard', e.target.value)}
                                placeholder="GHA-XXXXXXXXX-X"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-gray-500">Verified providers get more bookings</p>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Business Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Category *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {SERVICE_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => updateField('serviceCategory', cat.id)}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${formData.serviceCategory === cat.id
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <p className="text-sm font-medium mt-1">{cat.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => updateField('businessName', e.target.value)}
                                placeholder="Your business or trade name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                            <select
                                value={formData.experience}
                                onChange={(e) => updateField('experience', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                <option value="">Select experience</option>
                                <option value="1-2">1-2 years</option>
                                <option value="3-5">3-5 years</option>
                                <option value="5-10">5-10 years</option>
                                <option value="10+">10+ years</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">About Your Services</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => updateField('bio', e.target.value)}
                                placeholder="Tell customers about your skills and experience..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Back</button>
                            <button onClick={handleNext} className="flex-1 bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition-colors">
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Services & Coverage</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                            <select
                                value={formData.region}
                                onChange={(e) => {
                                    updateField('region', e.target.value);
                                    updateField('coverageAreas', []);
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                {GHANA_REGIONS.map((region) => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Areas *</label>
                            <p className="text-xs text-gray-500 mb-3">Select areas where you provide services</p>
                            <div className="flex flex-wrap gap-2">
                                {availableAreas.map((area) => (
                                    <button
                                        key={area}
                                        type="button"
                                        onClick={() => toggleCoverageArea(area)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${formData.coverageAreas.includes(area)
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {formData.coverageAreas.includes(area) && '✓ '}
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Services & Pricing</label>
                            {formData.services.map((service, idx) => (
                                <div key={idx} className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={service.name}
                                        onChange={(e) => updateService(idx, 'name', e.target.value)}
                                        placeholder="Service name (e.g., Wiring repair)"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => updateService(idx, 'price', e.target.value)}
                                        placeholder="Price (GH₵)"
                                        className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                    {formData.services.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeService(idx)}
                                            className="px-3 text-red-500 hover:bg-red-50 rounded-xl"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addService}
                                className="text-teal-600 text-sm font-medium hover:underline"
                            >
                                + Add another service
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min. Price (GH₵)</label>
                                <input
                                    type="number"
                                    value={formData.minPrice}
                                    onChange={(e) => updateField('minPrice', e.target.value)}
                                    placeholder="50"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max. Price (GH₵)</label>
                                <input
                                    type="number"
                                    value={formData.maxPrice}
                                    onChange={(e) => updateField('maxPrice', e.target.value)}
                                    placeholder="500"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-1 bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : 'Submit Application'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
