'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const formatPhoneForDisplay = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanPhone = phone.replace(/\s/g, '');
        if (!/^0[235][0-9]{8}$/.test(cleanPhone)) {
            setError('Please enter a valid Ghana phone number (e.g., 024 XXX XXXX)');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: cleanPhone }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            if (data.otp) {
                console.log('🔐 Development OTP:', data.otp);
                setOtp(data.otp);
            }

            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const cleanPhone = phone.replace(/\s/g, '');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: cleanPhone, code: otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Text Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                                <path d="M12 5.432l8.159 8.159c.753.753 1.417.809 1.761.595.694-.43 1.08-1.579 1.08-2.686V19.5a2.25 2.25 0 01-2.25 2.25h-2.25a.75.75 0 01-.75-.75v-3.75a3 3 0 00-3-3h-3a3 3 0 00-3 3V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-8.08c0-1.163.42-2.312 1.157-2.668.375-.18 1.097-.202 1.84.54l8-8z" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-baseline">
                                <span className="text-3xl font-black tracking-tighter text-gray-900">Free</span>
                                <span className="text-3xl font-black tracking-tighter text-orange-600">Wahala</span>
                            </div>
                            <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">Rent Direct. No Stress.</span>
                        </div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        {step === 'phone' ? 'Welcome back' : 'Enter verification code'}
                    </h1>
                    <p className="text-gray-500 text-center mb-8">
                        {step === 'phone'
                            ? 'Log in with your phone number'
                            : `We sent a 6-digit code to ${phone}`}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'phone' ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        🇬🇭 +233
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhoneForDisplay(e.target.value))}
                                        placeholder="024 XXX XXXX"
                                        className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="••••••"
                                    maxLength={6}
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-2xl text-center tracking-widest"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Log in'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('phone')}
                                className="w-full mt-4 text-gray-500 hover:text-gray-700"
                            >
                                ← Change phone number
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-pink-600 font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-sm mt-8">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
