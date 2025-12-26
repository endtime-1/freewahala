'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

interface ServiceCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    gradient: string;
    providerCount: number;
}

interface FeaturedProvider {
    id: string;
    name: string;
    businessName: string;
    category: string;
    categoryId: string;
    rating: number;
    reviewCount: number;
    completedJobs: number;
    verified: boolean;
    startingPrice: number;
}

const SERVICES: ServiceCategory[] = [
    { id: 'movers', title: 'Packers & Movers', icon: '🚚', description: 'Relocate with ease', gradient: 'from-red-500 to-orange-500', providerCount: 45 },
    { id: 'electrician', title: 'Electrician', icon: '⚡', description: 'Electrical repairs', gradient: 'from-yellow-500 to-orange-500', providerCount: 127 },
    { id: 'plumber', title: 'Plumber', icon: '🔧', description: 'Plumbing fixes', gradient: 'from-blue-500 to-cyan-500', providerCount: 89 },
    { id: 'painter', title: 'Painter', icon: '🎨', description: 'Interior & exterior', gradient: 'from-purple-500 to-pink-500', providerCount: 76 },
    { id: 'cleaner', title: 'Cleaning', icon: '🧹', description: 'Deep cleaning', gradient: 'from-green-500 to-emerald-500', providerCount: 156 },
    { id: 'ac', title: 'AC Technician', icon: '❄️', description: 'AC maintenance', gradient: 'from-cyan-500 to-blue-500', providerCount: 52 },
    { id: 'carpenter', title: 'Carpenter', icon: '🪚', description: 'Woodwork', gradient: 'from-amber-600 to-yellow-600', providerCount: 68 },
    { id: 'tiler', title: 'Tiler', icon: '🔲', description: 'Tile installation', gradient: 'from-gray-500 to-slate-500', providerCount: 41 },
];

const FEATURED_PROVIDERS: FeaturedProvider[] = [
    { id: '1', name: 'Kwame Asante', businessName: 'Kwame Electrical', category: 'Electrician', categoryId: 'electrician', rating: 4.9, reviewCount: 127, completedJobs: 234, verified: true, startingPrice: 50 },
    { id: '2', name: 'Ama Serwaa', businessName: 'Swift Cleaning Pro', category: 'Cleaning', categoryId: 'cleaner', rating: 4.8, reviewCount: 203, completedJobs: 412, verified: true, startingPrice: 80 },
    { id: '3', name: 'Kofi Mensah', businessName: 'KM Plumbing', category: 'Plumber', categoryId: 'plumber', rating: 4.7, reviewCount: 89, completedJobs: 156, verified: true, startingPrice: 60 },
];

const STATS = [
    { value: '500+', label: 'Verified Providers', icon: '👨‍🔧' },
    { value: '15K+', label: 'Jobs Completed', icon: '✅' },
    { value: '4.8', label: 'Average Rating', icon: '⭐' },
    { value: '< 1hr', label: 'Avg Response', icon: '⚡' },
];

export default function ServicesPage() {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredServices = SERVICES.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated Background - Dark mode only */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
            )}

            <div className="relative z-10">
                {/* Hero */}
                <section className="pt-8 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl rounded-full border mb-4 sm:mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-teal-50 border-teal-200'}`}>
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                            <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-teal-700'}`}>Trusted by 10,000+ Ghanaians</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                            <span className={`bg-gradient-to-r ${isDark ? 'from-white via-gray-100 to-gray-400' : 'from-gray-900 via-gray-800 to-gray-600'} bg-clip-text text-transparent`}>Home</span>
                            <br />
                            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Services</span>
                        </h1>
                        <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Trusted professionals at your doorstep. Book verified service providers.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for a service..."
                                className={`w-full px-6 py-4 sm:py-5 pl-12 sm:pl-14 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-lg'}`}
                            />
                            <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-lg sm:text-xl">🔍</span>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className={`py-6 sm:py-8 border-y ${isDark ? 'border-white/5' : 'border-gray-200 bg-white'}`}>
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {STATS.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <span className="text-lg sm:text-2xl mb-1 sm:mb-2 block">{stat.icon}</span>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</p>
                                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Services</h2>
                            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose a category to find verified professionals</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredServices.map(service => (
                            <Link key={service.id} href={`/services/${service.id}`} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                                <div className={`relative backdrop-blur-xl rounded-3xl border p-6 text-center transition-all duration-500 h-full group-hover:-translate-y-1 ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-teal-300 shadow-lg hover:shadow-xl'}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                        <span className="text-4xl">{service.icon}</span>
                                    </div>
                                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>
                                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{service.description}</p>
                                    <p className="text-xs text-teal-500 font-medium">{service.providerCount} providers</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className={`text-center py-12 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No services found for "{searchQuery}"</p>
                        </div>
                    )}
                </section>

                {/* Featured Providers */}
                <section className={`py-16 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Rated Providers</h2>
                                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Professionals with excellent reviews</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {FEATURED_PROVIDERS.map((provider) => (
                                <Link
                                    key={provider.id}
                                    href={`/services/${provider.categoryId}/${provider.id}`}
                                    className={`backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 group ${isDark ? 'bg-white/5 border-white/10 hover:border-teal-500/30' : 'bg-white border-gray-200 hover:border-teal-300 shadow-lg hover:shadow-xl'}`}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shrink-0">
                                            <span className="text-2xl text-white">
                                                {provider.category === 'Electrician' ? '⚡' : provider.category === 'Cleaning' ? '🧹' : '🔧'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold truncate group-hover:text-teal-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{provider.businessName}</h3>
                                                {provider.verified && <span className="text-green-500 text-sm">✓</span>}
                                            </div>
                                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{provider.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mb-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-400">★</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{provider.rating}</span>
                                            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>({provider.reviewCount})</span>
                                        </div>
                                        <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                        <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{provider.completedJobs} jobs</span>
                                    </div>

                                    <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            From <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>GH₵{provider.startingPrice}</span>
                                        </span>
                                        <span className="text-teal-500 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">View →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className={`py-16 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <div className="max-w-5xl mx-auto px-4">
                        <h2 className={`text-2xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: '1', icon: '🔍', title: 'Choose a Service', desc: 'Browse categories and find the service you need', color: 'from-blue-500 to-cyan-500' },
                                { step: '2', icon: '📅', title: 'Book & Schedule', desc: 'Select a provider, pick a date and time', color: 'from-purple-500 to-pink-500' },
                                { step: '3', icon: '✨', title: 'Get it Done', desc: 'Professional arrives and completes the job', color: 'from-green-500 to-emerald-500' },
                            ].map((item, idx) => (
                                <div key={idx} className="text-center relative">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                        <span className="text-4xl">{item.icon}</span>
                                    </div>
                                    <div className={`inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r ${item.color} text-white text-sm font-bold rounded-full mb-4`}>
                                        {item.step}
                                    </div>
                                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Badges */}
                <section className={`py-16 border-y ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { icon: '✓', title: 'Verified Providers', desc: 'Background checked', color: 'text-green-500' },
                                { icon: '🪪', title: 'ID Verified', desc: 'Ghana Card verified', color: 'text-blue-500' },
                                { icon: '💬', title: 'Honest Reviews', desc: 'Real customer feedback', color: 'text-yellow-500' },
                                { icon: '🔒', title: 'Secure Payments', desc: 'Mobile money & cards', color: 'text-purple-500' },
                            ].map((badge, idx) => (
                                <div key={idx}>
                                    <div className={`text-4xl mb-3 ${badge.color}`}>{badge.icon}</div>
                                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{badge.title}</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{badge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Become a Provider CTA */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className={`relative rounded-3xl border p-12 text-center overflow-hidden ${isDark ? 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'}`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <span className="text-5xl mb-6 block">🛠️</span>
                                <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Are you a service provider?</h2>
                                <p className={`mb-8 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Join our network of verified professionals. Get more customers, manage bookings, and grow your business.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/become-provider" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                        Register as Provider
                                    </Link>
                                    <Link href="/provider-info" className={`px-8 py-4 border font-semibold rounded-2xl transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
