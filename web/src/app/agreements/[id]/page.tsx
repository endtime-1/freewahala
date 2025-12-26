'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

interface Agreement { id: string; propertyAddress: string; landlordName: string; tenantName: string; startDate: string; endDate: string; monthlyRent: number; advanceAmount: number; securityDeposit: number; stampDutyPaid: boolean; stampDutyAmount: number; landlordSigned: boolean; tenantSigned: boolean; status: 'DRAFT' | 'PENDING_SIGNATURES' | 'ACTIVE' | 'EXPIRED'; createdAt: string; }

const AGREEMENT: Agreement = { id: '1', propertyAddress: 'House No. 15, East Legon, Accra', landlordName: 'Kofi Mensah', tenantName: 'Ama Serwaa', startDate: '2024-01-01', endDate: '2025-01-01', monthlyRent: 3500, advanceAmount: 42000, securityDeposit: 3500, stampDutyPaid: true, stampDutyAmount: 210, landlordSigned: true, tenantSigned: true, status: 'ACTIVE', createdAt: '2023-12-20' };

export default function AgreementDetailPage({ params }: { params: { id: string } }) {
    const { isDark } = useTheme();
    const [agreement] = useState<Agreement>(AGREEMENT);

    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: 'from-green-500 to-emerald-500', text: 'Active', icon: '✓' };
            case 'PENDING_SIGNATURES': return { bg: 'from-yellow-500 to-orange-500', text: 'Pending', icon: '⏳' };
            case 'EXPIRED': return { bg: 'from-red-500 to-pink-500', text: 'Expired', icon: '✕' };
            default: return { bg: 'from-gray-500 to-gray-600', text: 'Draft', icon: '📝' };
        }
    };

    const status = getStatusStyle(agreement.status);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated Background */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-[120px]" />
                </div>
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className={`border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <Link href="/agreements" className={`inline-flex items-center gap-2 mb-6 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Back to Agreements
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Rental Agreement</h1>
                                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Created on {formatDate(agreement.createdAt)}</p>
                            </div>
                            <div className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${status.bg} rounded-full shadow-lg`}>
                                <span className="text-lg">{status.icon}</span>
                                <span className="font-semibold text-white">{status.text}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    {/* Property Card */}
                    <div className={`backdrop-blur-xl rounded-3xl border p-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-purple-100'}`}><span className="text-2xl">🏠</span></div>
                            <div>
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Property Details</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Location of the rental</p>
                            </div>
                        </div>
                        <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{agreement.propertyAddress}</p>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[{ emoji: '🏢', role: 'Landlord', name: agreement.landlordName, signed: agreement.landlordSigned }, { emoji: '👤', role: 'Tenant', name: agreement.tenantName, signed: agreement.tenantSigned }].map((party) => (
                            <div key={party.role} className={`backdrop-blur-xl rounded-3xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><span className="text-lg">{party.emoji}</span> {party.role}</h3>
                                    {party.signed ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span className="text-green-500 text-sm font-medium">Signed</span>
                                        </div>
                                    ) : (
                                        <button className="px-4 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-full hover:bg-purple-600 transition-colors">Sign Now</button>
                                    )}
                                </div>
                                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{party.name}</p>
                            </div>
                        ))}
                    </div>

                    {/* Duration */}
                    <div className={`backdrop-blur-xl rounded-3xl border p-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                        <h3 className={`font-semibold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}><span className="text-lg">📅</span> Tenancy Period</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex-1">
                                <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>From</p>
                                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(agreement.startDate)}</p>
                            </div>
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isDark ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20' : 'bg-purple-100'}`}>
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                            <div className="flex-1 text-right">
                                <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To</p>
                                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(agreement.endDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Terms */}
                    <div className={`backdrop-blur-xl rounded-3xl border p-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                        <h3 className={`font-semibold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}><span className="text-lg">💰</span> Financial Terms</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {[{ label: 'Monthly Rent', value: agreement.monthlyRent, gradient: 'from-green-400 to-emerald-400' }, { label: 'Advance Paid', value: agreement.advanceAmount, gradient: 'from-blue-400 to-cyan-400' }, { label: 'Security Deposit', value: agreement.securityDeposit, gradient: 'from-purple-400 to-pink-400' }].map((item) => (
                                <div key={item.label} className={`rounded-2xl p-5 text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.label}</p>
                                    <p className={`text-2xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>GH₵{formatPrice(item.value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stamp Duty */}
                    <div className={`relative rounded-3xl p-8 overflow-hidden ${agreement.stampDutyPaid ? (isDark ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200') : (isDark ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200')}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">🇬🇭</div>
                                <div>
                                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Ghana Stamp Duty</h3>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{agreement.stampDutyPaid ? 'Stamp duty has been paid' : 'Required for legal validity'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">GH₵{formatPrice(agreement.stampDutyAmount)}</p>
                                {agreement.stampDutyPaid ? (
                                    <div className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-500/20 rounded-full">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        <span className="text-green-500 text-sm font-medium">Paid</span>
                                    </div>
                                ) : (
                                    <button className="mt-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all">Pay Now</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        {[{ icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-purple-500', label: 'Download PDF' }, { icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', color: 'text-blue-500', label: 'Share Agreement' }].map((action) => (
                            <button key={action.label} className={`flex items-center justify-center gap-3 py-4 backdrop-blur-xl rounded-2xl border font-medium transition-all group ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-lg'}`}>
                                <svg className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} /></svg>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
