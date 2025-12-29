'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

// Handle both cases: env var with or without /api suffix
const getApiUrl = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return base.endsWith('/api') ? base : `${base}/api`;
}
const API_URL = getApiUrl();

const TEMPLATES = [
    { id: 'standard', name: 'Standard Rental', description: 'For residential properties', icon: '🏠', popular: true, color: 'from-blue-500 to-cyan-500' },
    { id: 'commercial', name: 'Commercial Lease', description: 'For offices & shops', icon: '🏢', popular: false, color: 'from-purple-500 to-pink-500' },
    { id: 'furnished', name: 'Furnished Property', description: 'With furniture inventory', icon: '🛋️', popular: false, color: 'from-orange-500 to-red-500' },
];

interface Agreement {
    id: string;
    property?: { title: string; neighborhood: string; city: string };
    propertyTitle?: string;
    tenant?: { fullName: string };
    tenantName?: string;
    status: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
}

export default function AgreementsPage() {
    const { isDark } = useTheme();
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/agreements`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAgreements(data.agreements || data || []);
            }
        } catch (err) {
            console.error('Failed to fetch agreements:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAgreements = agreements.filter(a =>
        filter === 'ALL' || a.status === filter
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: 'bg-green-500/10', text: 'text-green-500', dot: 'bg-green-500', label: 'Active' };
            case 'PENDING_SIGNATURES': return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500', label: 'Pending' };
            case 'EXPIRED': return { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500', label: 'Expired' };
            default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-500', label: 'Draft' };
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated Background */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
            )}

            <div className="relative z-10">
                {/* Hero */}
                <section className="pt-20 pb-16 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl rounded-full border mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-purple-50 border-purple-200'}`}>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-purple-700'}`}>Legally Binding Digital Contracts</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                            <span className={`bg-gradient-to-r ${isDark ? 'from-white via-gray-100 to-gray-400' : 'from-gray-900 via-gray-800 to-gray-600'} bg-clip-text text-transparent`}>Rental</span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">Agreements</span>
                        </h1>
                        <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Create, sign, and manage rental agreements with digital signatures and stamp duty payment
                        </p>
                    </div>
                </section>

                {/* Create New Agreement */}
                <section className="max-w-5xl mx-auto px-4 mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Agreement</h2>
                            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose a template to get started</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TEMPLATES.map((template) => (
                            <Link key={template.id} href={`/agreements/create?template=${template.id}`} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${template.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                                <div className={`relative backdrop-blur-xl rounded-3xl border p-8 transition-all duration-500 h-full ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl'}`}>
                                    {template.popular && (
                                        <span className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">POPULAR</span>
                                    )}
                                    <div className="text-5xl mb-6">{template.icon}</div>
                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{template.name}</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{template.description}</p>
                                    <div className="flex items-center text-purple-500 font-medium text-sm group-hover:text-purple-400 transition-colors">
                                        Use this template
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* My Agreements */}
                <section className="max-w-5xl mx-auto px-4 pb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Agreements</h2>
                            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{agreements.length} agreement{agreements.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex gap-2">
                            {[{ key: 'ALL', label: 'All' }, { key: 'ACTIVE', label: 'Active' }, { key: 'PENDING_SIGNATURES', label: 'Pending' }].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-4 py-2 rounded-xl text-sm transition-colors ${filter === f.key
                                        ? 'bg-purple-500 text-white'
                                        : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredAgreements.length > 0 ? (
                        <div className="space-y-4">
                            {filteredAgreements.map((agreement) => {
                                const status = getStatusStyle(agreement.status);
                                const propertyName = agreement.property?.title || agreement.propertyTitle || 'Property';
                                const tenantName = agreement.tenant?.fullName || agreement.tenantName || 'Tenant';
                                return (
                                    <Link key={agreement.id} href={`/agreements/${agreement.id}`} className="block group">
                                        <div className={`backdrop-blur-xl rounded-2xl border p-6 transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:border-purple-500/30' : 'bg-white border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-purple-100'}`}>
                                                        <span className="text-2xl">📄</span>
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-semibold group-hover:text-purple-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{propertyName}</h3>
                                                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tenant: {tenantName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden md:block">
                                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>GH₵{(agreement.monthlyRent || 0).toLocaleString()}/mo</p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{agreement.startDate} → {agreement.endDate}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                                                        <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                                        <span className={`text-sm font-medium ${status.text}`}>{status.label}</span>
                                                    </div>
                                                    <svg className={`w-5 h-5 group-hover:text-purple-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={`backdrop-blur-xl rounded-3xl border p-16 text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                            <div className="text-6xl mb-6">📄</div>
                            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>No agreements yet</h3>
                            <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Create your first rental agreement using one of our professionally designed templates</p>
                            <Link href="/agreements/create" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                Create Agreement
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
