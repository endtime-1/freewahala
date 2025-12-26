'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ServiceProvider {
    id: string; name: string; businessName?: string; serviceType: string; rating: number;
    reviewCount: number; priceRange: { min: number; max: number }; coverageAreas: string[];
    verified: boolean; ghanaCardVerified: boolean; completedJobs: number; responseTime: string; memberSince: string;
}

const SERVICE_INFO: Record<string, { name: string; icon: string; description: string; gradient: string }> = {
    electrician: { name: 'Electrician', icon: '⚡', description: 'Electrical repairs, wiring & installation', gradient: 'from-yellow-500 to-orange-500' },
    plumber: { name: 'Plumber', icon: '🔧', description: 'Plumbing fixes, pipe repairs & installations', gradient: 'from-blue-500 to-cyan-500' },
    painter: { name: 'Painter', icon: '🎨', description: 'Interior & exterior painting services', gradient: 'from-purple-500 to-pink-500' },
    cleaner: { name: 'Cleaning', icon: '🧹', description: 'Deep cleaning & move-out cleaning', gradient: 'from-green-500 to-emerald-500' },
    ac: { name: 'AC Technician', icon: '❄️', description: 'AC repair, installation & maintenance', gradient: 'from-cyan-500 to-blue-500' },
    carpenter: { name: 'Carpenter', icon: '🪚', description: 'Furniture repair & custom woodwork', gradient: 'from-amber-600 to-yellow-600' },
    tiler: { name: 'Tiler', icon: '🔲', description: 'Tile installation & repair', gradient: 'from-gray-500 to-slate-500' },
    movers: { name: 'Packers & Movers', icon: '🚚', description: 'Relocation & moving services', gradient: 'from-red-500 to-orange-500' },
};

const COVERAGE_AREAS = ['East Legon', 'Madina', 'Spintex', 'Tema', 'Adenta', 'Airport Residential', 'Cantonments', 'Osu', 'Labone', 'Dansoman', 'Achimota', 'Kasoa'];
type SortOption = 'rating' | 'price_low' | 'price_high' | 'jobs';

export default function ServiceCategoryPage() {
    const { isDark } = useTheme();
    const params = useParams();
    const category = params.category as string;
    const serviceInfo = SERVICE_INFO[category] || { name: 'Service', icon: '🔧', description: '', gradient: 'from-gray-500 to-gray-600' };

    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('rating');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => { fetchProviders(); }, [category]);

    const fetchProviders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/services/providers/category/${category}`);
            const data = await response.json();
            setProviders(data.providers || []);
        } catch (err: any) { setError(err.message); }
        finally { setIsLoading(false); }
    };

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;

    const filteredAndSortedProviders = useMemo(() => {
        let result = [...providers];
        if (selectedArea) result = result.filter(p => p.coverageAreas?.includes(selectedArea));
        if (verifiedOnly) result = result.filter(p => p.verified);
        switch (sortBy) {
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
            case 'price_low': result.sort((a, b) => (a.priceRange?.min || 0) - (b.priceRange?.min || 0)); break;
            case 'price_high': result.sort((a, b) => (b.priceRange?.max || 0) - (a.priceRange?.max || 0)); break;
            case 'jobs': result.sort((a, b) => b.completedJobs - a.completedJobs); break;
        }
        return result;
    }, [providers, selectedArea, verifiedOnly, sortBy]);

    const ProviderSkeleton = () => (
        <div className={`rounded-3xl p-6 border animate-pulse ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-4">
                <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className="flex-1">
                    <div className={`h-5 rounded w-1/3 mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className={`h-4 rounded w-1/4 mb-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated Background */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/15 to-cyan-500/15 rounded-full blur-[100px]" />
                </div>
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className={`bg-gradient-to-r ${serviceInfo.gradient} py-16 px-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="max-w-5xl mx-auto relative z-10">
                        <Link href="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            All Services
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center">
                                <span className="text-5xl">{serviceInfo.icon}</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">{serviceInfo.name}</h1>
                                <p className="text-white/80 mt-1">{serviceInfo.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="max-w-5xl mx-auto px-4 py-8">
                    {/* Filters Bar */}
                    <div className={`backdrop-blur-xl rounded-2xl border p-4 mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className={`px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="" className={isDark ? 'bg-gray-900' : ''}>All Areas</option>
                                    {COVERAGE_AREAS.map((area) => (<option key={area} value={area} className={isDark ? 'bg-gray-900' : ''}>{area}</option>))}
                                </select>
                                <label className="hidden md:flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="w-4 h-4 text-teal-500 rounded" />
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Verified only</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filteredAndSortedProviders.length}</span> providers
                                </p>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={`px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="rating" className={isDark ? 'bg-gray-900' : ''}>Highest Rated</option>
                                    <option value="price_low" className={isDark ? 'bg-gray-900' : ''}>Price: Low to High</option>
                                    <option value="price_high" className={isDark ? 'bg-gray-900' : ''}>Price: High to Low</option>
                                    <option value="jobs" className={isDark ? 'bg-gray-900' : ''}>Most Jobs</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error / Loading / List */}
                    {error && (
                        <div className={`rounded-2xl p-6 mb-6 text-center border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                            <p className="text-red-500">{error}</p>
                            <button onClick={fetchProviders} className="mt-2 text-teal-500 hover:underline">Try again</button>
                        </div>
                    )}

                    {isLoading && <div className="space-y-4"><ProviderSkeleton /><ProviderSkeleton /><ProviderSkeleton /></div>}

                    {!isLoading && !error && (
                        <div className="space-y-4">
                            {filteredAndSortedProviders.map((provider) => (
                                <Link key={provider.id} href={`/services/${category}/${provider.id}`} className={`block backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 group ${isDark ? 'bg-white/5 border-white/10 hover:border-teal-500/30' : 'bg-white border-gray-200 hover:border-teal-300 shadow-lg hover:shadow-xl'}`}>
                                    <div className="flex gap-5">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${serviceInfo.gradient} flex items-center justify-center shrink-0`}>
                                            <span className="text-3xl text-white">{serviceInfo.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className={`font-semibold group-hover:text-teal-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{provider.businessName || provider.name}</h3>
                                                        {provider.verified && <span className="bg-green-500/10 text-green-500 text-xs px-2.5 py-1 rounded-full font-medium">✓ Verified</span>}
                                                        {provider.ghanaCardVerified && <span className="bg-blue-500/10 text-blue-500 text-xs px-2.5 py-1 rounded-full font-medium">🪪 ID</span>}
                                                    </div>
                                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{provider.name}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-400 text-lg">★</span>
                                                        <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{provider.rating?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{provider.reviewCount || 0} reviews</p>
                                                </div>
                                            </div>
                                            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <span>{provider.completedJobs || 0} jobs</span>
                                                <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                                <span className="text-green-500">Responds {provider.responseTime || '< 2 hours'}</span>
                                                <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                                <span>Since {provider.memberSince}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {(provider.coverageAreas || []).slice(0, 4).map((area) => (
                                                    <span key={area} className={`text-xs border px-3 py-1.5 rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>📍 {area}</span>
                                                ))}
                                            </div>
                                            <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                <div className="text-sm">
                                                    <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>Starting from </span>
                                                    <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{formatPrice(provider.priceRange?.min || 50)}</span>
                                                </div>
                                                <span className="text-teal-500 font-medium text-sm group-hover:translate-x-1 transition-transform">View Profile →</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && filteredAndSortedProviders.length === 0 && (
                        <div className={`backdrop-blur-xl rounded-3xl border p-16 text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            <span className="text-5xl mb-6 block">🔍</span>
                            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>No providers found</h3>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{providers.length === 0 ? 'No providers registered yet.' : 'Try adjusting your filters.'}</p>
                            {(selectedArea || verifiedOnly) && <button onClick={() => { setSelectedArea(''); setVerifiedOnly(false); }} className="text-teal-500 font-medium hover:underline">Clear all filters</button>}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
