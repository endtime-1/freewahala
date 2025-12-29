'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PROPERTY_TYPES = [
    { value: 'SINGLE_ROOM', label: 'Single Room' },
    { value: 'CHAMBER_HALL', label: 'Chamber & Hall' },
    { value: 'SELF_CONTAINED', label: 'Self Contained' },
    { value: 'ONE_BEDROOM', label: '1 Bedroom' },
    { value: 'TWO_BEDROOM', label: '2 Bedroom' },
    { value: 'THREE_BEDROOM', label: '3 Bedroom' },
    { value: 'FOUR_BEDROOM_PLUS', label: '4+ Bedroom' },
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
];

const ADVANCE_PERIODS = [
    { value: 'SIX_MONTHS', label: '6 Months' },
    { value: 'ONE_YEAR', label: '1 Year' },
    { value: 'TWO_YEARS', label: '2 Years' },
    { value: 'THREE_YEARS', label: '3 Years' },
];

const GHANA_REGIONS = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Volta', 'Northern', 'Brong-Ahafo',
];

export default function ListPropertyPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        rentAdvancePeriod: 'ONE_YEAR',
        propertyType: 'TWO_BEDROOM',
        region: 'Greater Accra',
        city: '',
        neighborhood: '',
        address: '',
        // Amenities
        hasSelfMeter: false,
        waterFlow: 'CONSTANT',
        isWalledGated: false,
        hasPopCeiling: false,
        hasTiledFloor: false,
        noLandlordOnCompound: false,
        hasKitchenCabinet: false,
        isNewlyBuilt: false,
        hasParking: false,
        // Images
        images: [] as string[],
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        // API call would go here
        setTimeout(() => {
            setIsLoading(false);
            alert('Property listed successfully!');
            router.push('/');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-gray-500 hover:text-gray-700">
                        ← Back
                    </Link>
                    <span className="font-medium">List Your Property</span>
                    <span className="text-sm text-gray-500">Step {step}/3</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-pink-500 transition-all"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>

                        {/* Property Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Property Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {PROPERTY_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => updateField('propertyType', type.value)}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.propertyType === type.value
                                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Property Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => updateField('title', e.target.value)}
                                placeholder="e.g., Spacious 2 Bedroom Apartment in East Legon"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Price & Advance */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Rent (GH₵)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => updateField('price', e.target.value)}
                                    placeholder="2500"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Advance Period
                                </label>
                                <select
                                    value={formData.rentAdvancePeriod}
                                    onChange={e => updateField('rentAdvancePeriod', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    {ADVANCE_PERIODS.map(period => (
                                        <option key={period.value} value={period.value}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => updateField('description', e.target.value)}
                                placeholder="Describe your property in detail..."
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full btn-primary py-4"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Location & Amenities</h2>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                                <select
                                    value={formData.region}
                                    onChange={e => updateField('region', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                >
                                    {GHANA_REGIONS.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => updateField('city', e.target.value)}
                                    placeholder="e.g., Accra"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood</label>
                            <input
                                type="text"
                                value={formData.neighborhood}
                                onChange={e => updateField('neighborhood', e.target.value)}
                                placeholder="e.g., East Legon, Madina, Spintex"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                            />
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">Amenities</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { field: 'hasSelfMeter', label: 'Self Meter (Prepaid)', icon: '⚡' },
                                    { field: 'isWalledGated', label: 'Walled & Gated', icon: '🏰' },
                                    { field: 'noLandlordOnCompound', label: 'No Landlord on Compound', icon: '🏠' },
                                    { field: 'hasKitchenCabinet', label: 'Kitchen Cabinet', icon: '🍳' },
                                    { field: 'isNewlyBuilt', label: 'Newly Built', icon: '✨' },
                                    { field: 'hasParking', label: 'Parking Space', icon: '🚗' },
                                    { field: 'hasPopCeiling', label: 'Pop Ceiling', icon: '🏛️' },
                                    { field: 'hasTiledFloor', label: 'Tiled Floor', icon: '🔲' },
                                ].map(amenity => (
                                    <button
                                        key={amenity.field}
                                        type="button"
                                        onClick={() => updateField(amenity.field, !formData[amenity.field as keyof typeof formData])}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData[amenity.field as keyof typeof formData]
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">{amenity.icon}</span>
                                        <span className="text-sm font-medium">{amenity.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 btn-secondary py-4">
                                Back
                            </button>
                            <button onClick={() => setStep(3)} className="flex-1 btn-primary py-4">
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
                        <p className="text-gray-500">Add at least 3 photos of your property</p>

                        {/* Photo Upload */}
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-pink-300 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('photo-input')?.click()}
                        >
                            <div className="text-4xl mb-4">📷</div>
                            <p className="font-medium text-gray-900 mb-2">Drop photos here or click to upload</p>
                            <p className="text-sm text-gray-500">JPG, PNG up to 10MB each</p>
                            <input
                                id="photo-input"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                        const newImages: string[] = [];
                                        Array.from(files).forEach(file => {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                if (event.target?.result) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        images: [...prev.images, event.target!.result as string]
                                                    }));
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        });
                                    }
                                }}
                            />
                            <button type="button" className="mt-4 btn-secondary">
                                Choose Files
                            </button>
                        </div>

                        {/* Photo Previews */}
                        {formData.images.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">{formData.images.length} photo(s) selected</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Property photo ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    images: prev.images.filter((_, i) => i !== index)
                                                }))}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                ✕
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                                                    Cover
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="flex-1 btn-secondary py-4">
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || formData.images.length < 1}
                                className="flex-1 btn-primary py-4 disabled:opacity-50"
                            >
                                {isLoading ? 'Publishing...' : 'Publish Listing'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
