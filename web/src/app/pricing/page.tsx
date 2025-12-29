'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

// Handle both cases: env var with or without /api suffix
const getApiUrl = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return base.endsWith('/api') ? base : `${base}/api`;
}
const API_URL = getApiUrl();

interface SubscriptionTier { tier: string; name: string; price: number; contacts: string | number; features: string[]; duration: string; currency: string; }

const AD_BOOST_PACKAGES = [
    { id: 'basic', name: 'Starter Boost', price: 20, duration: '7 days', icon: '⚡', features: ['Featured on homepage', 'Priority in search', 'Boost badge', 'Basic analytics'] },
    { id: 'premium', name: 'Pro Boost', price: 50, duration: '14 days', icon: '🚀', popular: true, features: ['All Starter features', 'Social media promotion', 'Weekly email feature', 'Highlighted border', 'Advanced analytics'] },
    { id: 'ultimate', name: 'Elite Boost', price: 100, duration: '30 days', icon: '💎', features: ['All Pro features', 'Top category placement', 'Dedicated support', 'Premium badge', 'Full analytics suite'] }
];

const COMMISSION_RATE = 10;
const COMMISSION_BENEFITS = [
    { icon: '📱', title: 'Free Listing', description: 'Create your profile for free' },
    { icon: '📩', title: 'Direct Bookings', description: 'Receive booking requests' },
    { icon: '💬', title: 'In-App Chat', description: 'Communicate securely' },
    { icon: '⭐', title: 'Reviews System', description: 'Build your reputation' },
    { icon: '🔒', title: 'Payment Protection', description: 'Secure transactions' },
    { icon: '📊', title: 'Analytics', description: 'Track performance' }
];

export default function PricingPage() {
    const { isDark } = useTheme();
    const router = useRouter();
    const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processingTier, setProcessingTier] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'tenant' | 'landlord' | 'provider'>('tenant');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                if (parsed.role === 'LANDLORD') setActiveTab('landlord');
                else if (parsed.role === 'SERVICE_PROVIDER') setActiveTab('provider');
            } catch (e) { }
        }
        fetchTiers();
        setLoading(false);
    }, []);

    const fetchTiers = async () => {
        try {
            const res = await fetch(`${API_URL}/subscriptions/tiers`);
            const data = await res.json();
            if (data.tiers) setTiers(data.tiers);
        } catch (err) { }
    };

    const handleSubscribe = async (tier: string) => {
        if (!user) { router.push(`/login?redirect=/pricing`); return; }
        if (tier === 'FREE') return;
        setProcessingTier(tier);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const initRes = await fetch(`${API_URL}/subscriptions/initialize-payment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });
            const initData = await initRes.json();
            if (!initData.success) throw new Error(initData.error);
            if (initData.devMode) {
                const completeRes = await fetch(`${API_URL}/subscriptions/dev-complete`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tier, reference: initData.reference }),
                });
                const completeData = await completeRes.json();
                if (completeData.success) {
                    setSuccess(`Welcome to ${tier}! 🎉`);
                    const updatedUser = { ...user, subscriptionTier: tier };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            } else {
                window.location.href = initData.authorizationUrl;
            }
        } catch (err: any) { setError(err.message); }
        finally { setProcessingTier(null); }
    };

    return (
        <div className={`min-h-screen overflow-hidden ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated Background */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
            )}

            <div className="relative z-10">
                {/* Hero Header */}
                <div className="pt-20 pb-12 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl rounded-full border mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-green-50 border-green-200'}`}>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-green-700'}`}>Trusted by 10,000+ Ghanaians</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                            <span className={`bg-gradient-to-r ${isDark ? 'from-white via-gray-100 to-gray-400' : 'from-gray-900 via-gray-800 to-gray-600'} bg-clip-text text-transparent`}>Simple, Transparent</span>
                            <br />
                            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">Pricing for Everyone</span>
                        </h1>
                        <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Choose the perfect plan. No hidden fees, cancel anytime.
                        </p>
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="max-w-4xl mx-auto px-4 mb-12">
                    <div className="flex justify-center">
                        <div className={`inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                            {[
                                { id: 'tenant', label: '🏠 Tenants', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30' },
                                { id: 'landlord', label: '🏢 Landlords', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/30' },
                                { id: 'provider', label: '🔧 Providers', gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/30' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.shadow}`
                                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Success/Error */}
                {(success || error) && (
                    <div className="max-w-4xl mx-auto px-4 mb-8">
                        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-4 rounded-2xl">{success}</div>}
                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-2xl">{error}</div>}
                    </div>
                )}

                {/* ============ TENANT PRICING ============ */}
                {activeTab === 'tenant' && (
                    <div className="max-w-6xl mx-auto px-4 pb-20">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Subscription Plans</h2>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Unlock landlord contacts and find your dream home</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tiers.map((tier: any) => {
                                const isPopular = tier.tier === 'RELAX' || tier.tier === 'PRO';
                                const isCurrent = user?.subscriptionTier === tier.tier || (!user?.subscriptionTier && tier.tier === 'FREE');
                                return (
                                    <div key={tier.tier} className={`relative ${isPopular ? 'lg:-mt-4 lg:mb-4' : ''}`}>
                                        {isPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                                <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">MOST POPULAR</span>
                                            </div>
                                        )}
                                        <div className={`h-full rounded-3xl border overflow-hidden transition-all duration-500 ${isPopular ? 'border-orange-500/50 shadow-2xl shadow-orange-500/20' : isCurrent ? 'border-green-500/50' : isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300 shadow-lg'}`}>
                                            <div className={`h-full p-6 ${isDark ? 'bg-[#12121a]' : 'bg-white'} ${isPopular ? 'pt-10' : ''}`}>
                                                {isCurrent && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-500 text-xs font-medium mb-4">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Current Plan
                                                    </div>
                                                )}
                                                <div className="mb-6">
                                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{tier.price === 0 ? 'Free' : `₵${tier.price}`}</span>
                                                        {tier.price > 0 && <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>/month</span>}
                                                    </div>
                                                </div>
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    <span className="text-blue-500 font-semibold">{tier.contacts} contacts</span>
                                                </div>
                                                <ul className="space-y-3 mb-8">
                                                    {tier.features?.map((feature: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={() => handleSubscribe(tier.tier)}
                                                    disabled={isCurrent || processingTier !== null}
                                                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${isCurrent ? (isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400') : isPopular ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5' : tier.price === 0 ? (isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500') : (isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-900 text-white hover:bg-gray-800')}`}
                                                >
                                                    {processingTier === tier.tier ? 'Processing...' : isCurrent ? 'Current Plan' : tier.price === 0 ? 'Free Forever' : 'Get Started'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ============ LANDLORD PRICING ============ */}
                {activeTab === 'landlord' && (
                    <div className="max-w-5xl mx-auto px-4 pb-20">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Property Boost Packages</h2>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Get more visibility and find tenants faster</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {AD_BOOST_PACKAGES.map((pkg) => (
                                <div key={pkg.id} className={`relative ${pkg.popular ? 'md:-mt-4 md:mb-4' : ''}`}>
                                    {pkg.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                            <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">BEST VALUE</span>
                                        </div>
                                    )}
                                    <div className={`h-full rounded-3xl border overflow-hidden transition-all duration-500 ${pkg.popular ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20' : isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-purple-300 shadow-lg'}`}>
                                        <div className={`h-full p-8 ${isDark ? 'bg-[#12121a]' : 'bg-white'} ${pkg.popular ? 'pt-12' : ''}`}>
                                            <div className="text-5xl mb-4">{pkg.icon}</div>
                                            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</h3>
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">₵{pkg.price}</span>
                                                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>/ {pkg.duration}</span>
                                            </div>
                                            <ul className="space-y-3 mb-8">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${pkg.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5' : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                                Boost Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* How It Works */}
                        <div className={`mt-20 rounded-3xl border p-8 ${isDark ? 'bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                            <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>How Property Boosting Works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { step: '1', title: 'Choose Package', desc: 'Select a boost duration' },
                                    { step: '2', title: 'Pick Property', desc: 'Select listing to boost' },
                                    { step: '3', title: 'Go Live', desc: 'Instant visibility boost' },
                                    { step: '4', title: 'Get Tenants', desc: 'Receive more inquiries' }
                                ].map((item, i) => (
                                    <div key={i} className="text-center">
                                        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{item.step}</div>
                                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ SERVICE PROVIDER PRICING ============ */}
                {activeTab === 'provider' && (
                    <div className="max-w-5xl mx-auto px-4 pb-20">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Commission-Based Model</h2>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No upfront costs — pay only when you get paid</p>
                        </div>

                        {/* Commission Hero Card */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-12 mb-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="relative z-10 text-center">
                                <p className="text-green-100 font-medium mb-2">Platform Commission</p>
                                <div className="text-8xl font-black text-white mb-4">{COMMISSION_RATE}%</div>
                                <p className="text-green-100 text-lg max-w-md mx-auto">Only deducted from completed bookings. You keep 90%.</p>
                            </div>
                        </div>

                        {/* Benefits Grid */}
                        <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>What's Included — For Free</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {COMMISSION_BENEFITS.map((benefit, i) => (
                                <div key={i} className={`rounded-2xl border p-6 transition-all duration-300 group ${isDark ? 'bg-white/5 border-white/10 hover:border-green-500/30' : 'bg-white border-gray-200 hover:border-green-300 shadow-lg'}`}>
                                    <div className="text-3xl mb-4">{benefit.icon}</div>
                                    <h4 className={`font-semibold mb-2 group-hover:text-green-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h4>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{benefit.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* How It Works */}
                        <div className={`rounded-3xl border p-8 ${isDark ? 'bg-gradient-to-b from-green-500/10 to-transparent border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                            <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>How You Earn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { emoji: '📱', title: 'Get Booked', desc: 'Customers find you' },
                                    { emoji: '🔧', title: 'Do The Job', desc: 'Provide great service' },
                                    { emoji: '✅', title: 'Mark Complete', desc: 'Customer confirms' },
                                    { emoji: '💰', title: 'Get Paid', desc: 'Receive 90% instantly' }
                                ].map((item, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-4xl mb-4">{item.emoji}</div>
                                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-12 text-center">
                            <Link href="/become-provider" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                Start Earning Today
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Footer CTA */}
                <div className={`border-t ${isDark ? 'border-white/10 bg-gradient-to-b from-transparent to-white/5' : 'border-gray-200 bg-gray-100'}`}>
                    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                        <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Still have questions?</h2>
                        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Our team is here to help you choose the right plan</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact" className={`px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>Contact Support</Link>
                            <Link href="/faq" className={`px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>View FAQ</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
