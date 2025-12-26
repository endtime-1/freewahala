'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const TEMPLATE_INFO: Record<string, { name: string; description: string; icon: string }> = {
    standard: { name: 'Standard Rental', description: 'For residential properties', icon: '🏠' },
    commercial: { name: 'Commercial Lease', description: 'For office spaces & shops', icon: '🏢' },
    furnished: { name: 'Furnished Property', description: 'Includes furniture inventory', icon: '🛋️' },
};

function CreateAgreementContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('template') || 'standard';
    const template = TEMPLATE_INFO[templateId] || TEMPLATE_INFO.standard;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        propertyAddress: '',
        propertyType: 'TWO_BEDROOM',
        tenantName: '',
        tenantPhone: '',
        tenantGhanaCard: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        securityDeposit: '',
        advanceAmount: '',
        utilities: 'TENANT',
        maintenanceResponsibility: 'SHARED',
        noticePeriod: '30',
        additionalTerms: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push('/agreements?created=true');
        }, 2000);
    };

    const calculateStampDuty = () => {
        const monthlyRent = parseFloat(formData.monthlyRent) || 0;
        const totalRent = monthlyRent * 12;
        return Math.ceil(totalRent * 0.005);
    };

    const steps = [
        { num: 1, label: 'Property & Tenant' },
        { num: 2, label: 'Rental Terms' },
        { num: 3, label: 'Review' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/agreements" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{template.icon}</span>
                            <span className="font-semibold text-white">{template.name}</span>
                        </div>
                        <span className="text-sm text-gray-400">Step {step}/3</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </header>

                {/* Step Indicators */}
                <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${step >= s.num
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-white/10 text-gray-500'
                                    }`}>
                                    {step > s.num ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        s.num
                                    )}
                                </div>
                                <span className={`ml-3 font-medium hidden sm:block ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                                    {s.label}
                                </span>
                                {i < steps.length - 1 && (
                                    <div className={`w-16 sm:w-24 h-0.5 mx-4 ${step > s.num ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <main className="max-w-3xl mx-auto px-4 py-8">
                    {/* Step 1: Property & Tenant */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white">Property & Tenant Details</h2>
                                <p className="text-gray-400 mt-2">Enter the property address and tenant information</p>
                            </div>

                            <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Property Address *</label>
                                    <textarea
                                        value={formData.propertyAddress}
                                        onChange={e => updateField('propertyAddress', e.target.value)}
                                        placeholder="Enter the full address..."
                                        rows={3}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Tenant Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.tenantName}
                                        onChange={e => updateField('tenantName', e.target.value)}
                                        placeholder="As it appears on Ghana Card"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.tenantPhone}
                                            onChange={e => updateField('tenantPhone', e.target.value)}
                                            placeholder="024 XXX XXXX"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Ghana Card *</label>
                                        <input
                                            type="text"
                                            value={formData.tenantGhanaCard}
                                            onChange={e => updateField('tenantGhanaCard', e.target.value)}
                                            placeholder="GHA-XXXXXXXXX-X"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Continue to Rental Terms
                            </button>
                        </div>
                    )}

                    {/* Step 2: Rental Terms */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white">Rental Terms</h2>
                                <p className="text-gray-400 mt-2">Set the duration and financial details</p>
                            </div>

                            <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Start Date *</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => updateField('startDate', e.target.value)}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">End Date *</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={e => updateField('endDate', e.target.value)}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Monthly Rent (GH₵) *</label>
                                        <input
                                            type="number"
                                            value={formData.monthlyRent}
                                            onChange={e => updateField('monthlyRent', e.target.value)}
                                            placeholder="3500"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Security Deposit (GH₵)</label>
                                        <input
                                            type="number"
                                            value={formData.securityDeposit}
                                            onChange={e => updateField('securityDeposit', e.target.value)}
                                            placeholder="3500"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Advance Payment (GH₵) *</label>
                                    <input
                                        type="number"
                                        value={formData.advanceAmount}
                                        onChange={e => updateField('advanceAmount', e.target.value)}
                                        placeholder="42000"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Utility Bills Responsibility</label>
                                    <select
                                        value={formData.utilities}
                                        onChange={e => updateField('utilities', e.target.value)}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    >
                                        <option value="TENANT" className="bg-gray-900">Tenant pays all utilities</option>
                                        <option value="LANDLORD" className="bg-gray-900">Landlord pays all utilities</option>
                                        <option value="SHARED" className="bg-gray-900">Shared equally</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Review Agreement
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white">Review & Create</h2>
                                <p className="text-gray-400 mt-2">Confirm the details and proceed with stamp duty</p>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                                    <span className="text-lg">📋</span> Agreement Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Property</span>
                                        <span className="text-white font-medium">{formData.propertyAddress || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Tenant</span>
                                        <span className="text-white font-medium">{formData.tenantName || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Duration</span>
                                        <span className="text-white font-medium">{formData.startDate} → {formData.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-gray-400">Monthly Rent</span>
                                        <span className="text-white font-medium">GH₵{formData.monthlyRent || '0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-400">Advance Payment</span>
                                        <span className="text-white font-medium">GH₵{formData.advanceAmount || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stamp Duty Card */}
                            <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-purple-500/20 p-8 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">🇬🇭</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Ghana Stamp Duty</h3>
                                            <p className="text-gray-400 text-sm mt-1">Required for legal validity</p>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        GH₵{calculateStampDuty().toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Terms */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <label className="block text-sm font-medium text-gray-300 mb-3">Additional Terms (Optional)</label>
                                <textarea
                                    value={formData.additionalTerms}
                                    onChange={e => updateField('additionalTerms', e.target.value)}
                                    placeholder="Any special conditions or agreements..."
                                    rows={4}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Create Agreement
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function CreateAgreementPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CreateAgreementContent />
        </Suspense>
    );
}
