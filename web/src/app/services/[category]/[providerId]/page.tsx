'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProviderService { name: string; price: number; }
interface Review { id: string; rating: number; review: string; date: string; customerName: string; }
interface Provider {
    id: string; name: string; businessName: string; phone: string; serviceType: string;
    rating: number; reviewCount: number; verified: boolean; ghanaCardVerified: boolean;
    coverageAreas: string[]; pricing: { services?: ProviderService[]; minPrice?: number; maxPrice?: number };
    description: string; memberSince: string; reviews: Review[];
}

const SERVICE_INFO: Record<string, { name: string; icon: string; gradient: string }> = {
    electrician: { name: 'Electrician', icon: '⚡', gradient: 'from-yellow-500 to-orange-500' },
    plumber: { name: 'Plumber', icon: '🔧', gradient: 'from-blue-500 to-cyan-500' },
    painter: { name: 'Painter', icon: '🎨', gradient: 'from-purple-500 to-pink-500' },
    cleaner: { name: 'Cleaning', icon: '🧹', gradient: 'from-green-500 to-emerald-500' },
    ac: { name: 'AC Technician', icon: '❄️', gradient: 'from-cyan-500 to-blue-500' },
    carpenter: { name: 'Carpenter', icon: '🪚', gradient: 'from-amber-500 to-yellow-500' },
    tiler: { name: 'Tiler', icon: '🔲', gradient: 'from-gray-500 to-slate-500' },
    movers: { name: 'Packers & Movers', icon: '🚚', gradient: 'from-red-500 to-orange-500' },
};

export default function ProviderDetailPage() {
    const { isDark } = useTheme();
    const params = useParams();
    const router = useRouter();
    const category = params.category as string;
    const providerId = params.providerId as string;
    const serviceInfo = SERVICE_INFO[category] || { name: 'Service', icon: '🔧', gradient: 'from-gray-500 to-gray-600' };

    const [provider, setProvider] = useState<Provider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingData, setBookingData] = useState({ scheduledDate: '', scheduledTime: '', address: '', city: '', notes: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => { fetchProvider(); }, [providerId]);

    const fetchProvider = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/services/providers/${providerId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch');
            setProvider(data.provider);
        } catch (err: any) { setError(err.message); }
        finally { setIsLoading(false); }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBooking(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push(`/login?redirect=/services/${category}/${providerId}`); return; }
            const response = await fetch(`${API_URL}/api/services/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ providerId, ...bookingData }),
            });
            if (!response.ok) throw new Error('Booking failed');
            setBookingSuccess(true);
            setShowBookingForm(false);
        } catch (err: any) { setError(err.message); }
        finally { setIsBooking(false); }
    };

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <span className="text-5xl mb-4 block">😕</span>
                    <h2 className="text-xl font-semibold mb-2">Provider not found</h2>
                    <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                    <Link href={`/services/${category}`} className="text-teal-500 hover:underline">← Back to {serviceInfo.name}s</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Background */}
            {isDark && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/15 to-cyan-500/15 rounded-full blur-[100px]" />
                </div>
            )}

            {/* Success Modal */}
            {bookingSuccess && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`rounded-3xl p-8 max-w-md w-full text-center border ${isDark ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-200'}`}>
                        <span className="text-6xl mb-4 block">✅</span>
                        <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Booking Confirmed!</h3>
                        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your request has been sent to {provider.businessName}.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setBookingSuccess(false)} className={`flex-1 px-6 py-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>Close</button>
                            <Link href="/dashboard/bookings" className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium">View Bookings</Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className={`bg-gradient-to-r ${serviceInfo.gradient} py-16 px-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <Link href={`/services/${category}`} className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Back to {serviceInfo.name}s
                        </Link>
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shrink-0">
                                <span className="text-5xl">{serviceInfo.icon}</span>
                            </div>
                            <div className="flex-1 text-white">
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                    <h1 className="text-3xl font-bold">{provider.businessName}</h1>
                                    {provider.verified && <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">✓ Verified</span>}
                                    {provider.ghanaCardVerified && <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">🪪 ID</span>}
                                </div>
                                <p className="text-white/80">{provider.name}</p>
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-300 text-xl">★</span>
                                        <span className="text-2xl font-bold">{provider.rating?.toFixed(1)}</span>
                                        <span className="text-white/70">({provider.reviewCount} reviews)</span>
                                    </div>
                                    <span className="text-white/50">•</span>
                                    <span className="text-white/80">Since {provider.memberSince}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* About */}
                            <section className={`backdrop-blur-xl rounded-3xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><span>📝</span> About</h2>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{provider.description || `Professional ${serviceInfo.name.toLowerCase()} services.`}</p>
                            </section>

                            {/* Services & Pricing */}
                            <section className={`backdrop-blur-xl rounded-3xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><span>💰</span> Services & Pricing</h2>
                                {provider.pricing?.services?.length ? (
                                    <div className="space-y-3">
                                        {provider.pricing.services.map((service, idx) => (
                                            <div key={idx} className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{service.name}</span>
                                                <span className="font-semibold text-teal-500">{formatPrice(service.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                        <p>Starting from <span className="text-2xl font-bold text-teal-500">{formatPrice(provider.pricing?.minPrice || 50)}</span></p>
                                        <p className="text-sm mt-1">Contact for detailed pricing</p>
                                    </div>
                                )}
                            </section>

                            {/* Coverage Areas */}
                            <section className={`backdrop-blur-xl rounded-3xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><span>📍</span> Coverage Areas</h2>
                                <div className="flex flex-wrap gap-2">
                                    {(provider.coverageAreas || []).map((area) => (
                                        <span key={area} className={`border px-4 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{area}</span>
                                    ))}
                                </div>
                            </section>

                            {/* Reviews */}
                            <section className={`backdrop-blur-xl rounded-3xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><span>💬</span> Reviews ({provider.reviewCount})</h2>
                                {provider.reviews?.length ? (
                                    <div className="space-y-4">
                                        {provider.reviews.map((review) => (
                                            <div key={review.id} className={`border-b last:border-0 pb-4 last:pb-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20' : 'bg-teal-100'}`}>
                                                            <span className="text-teal-500 font-medium">{review.customerName?.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{review.customerName}</p>
                                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{formatDate(review.date)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span key={star} className={star <= review.rating ? 'text-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-300'}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{review.review}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><span className="text-4xl block mb-2">💬</span><p>No reviews yet</p></div>
                                )}
                            </section>
                        </div>

                        {/* Sidebar - Booking Card */}
                        <div className="lg:col-span-1">
                            <div className={`backdrop-blur-xl rounded-3xl border p-6 sticky top-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
                                {!showBookingForm ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Starting from</p>
                                            <p className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                                {formatPrice(provider.pricing?.minPrice || 50)}
                                            </p>
                                        </div>
                                        <button onClick={() => setShowBookingForm(true)} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">Book Now</button>
                                        <a href={`tel:${provider.phone}`} className={`w-full mt-3 flex items-center justify-center gap-2 border py-4 rounded-2xl font-medium transition-colors ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>📞 Call {provider.phone}</a>
                                    </>
                                ) : (
                                    <form onSubmit={handleBooking}>
                                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Book Service</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Date *</label>
                                                <input type="date" required value={bookingData.scheduledDate} onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })} min={new Date().toISOString().split('T')[0]} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Time</label>
                                                <select value={bookingData.scheduledTime} onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                                    <option value="" className={isDark ? 'bg-gray-900' : ''}>Any time</option>
                                                    <option value="morning" className={isDark ? 'bg-gray-900' : ''}>Morning</option>
                                                    <option value="afternoon" className={isDark ? 'bg-gray-900' : ''}>Afternoon</option>
                                                    <option value="evening" className={isDark ? 'bg-gray-900' : ''}>Evening</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Address *</label>
                                                <input type="text" required value={bookingData.address} onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })} placeholder="Your address" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`} />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>City *</label>
                                                <select required value={bookingData.city} onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                                    <option value="" className={isDark ? 'bg-gray-900' : ''}>Select city</option>
                                                    {(provider.coverageAreas || []).map((area) => (<option key={area} value={area} className={isDark ? 'bg-gray-900' : ''}>{area}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Notes</label>
                                                <textarea value={bookingData.notes} onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })} placeholder="Describe work..." rows={3} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`} />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-6">
                                            <button type="button" onClick={() => setShowBookingForm(false)} className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button>
                                            <button type="submit" disabled={isBooking} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">{isBooking ? 'Booking...' : 'Confirm'}</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
