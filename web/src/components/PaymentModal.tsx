'use client';

import { useState } from 'react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    reference: string;
    onSuccess: (transactionId: string) => void;
}

type Provider = 'MTN' | 'VODAFONE' | 'AIRTELTIGO';

export default function PaymentModal({
    isOpen,
    onClose,
    amount,
    description,
    reference,
    onSuccess,
}: PaymentModalProps) {
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState<Provider>('MTN');
    const [status, setStatus] = useState<'idle' | 'processing' | 'waiting' | 'success' | 'failed'>('idle');
    const [transactionId, setTransactionId] = useState('');

    const providers: { id: Provider; name: string; color: string }[] = [
        { id: 'MTN', name: 'MTN MoMo', color: 'bg-yellow-400' },
        { id: 'VODAFONE', name: 'Vodafone Cash', color: 'bg-red-500' },
        { id: 'AIRTELTIGO', name: 'AirtelTigo', color: 'bg-blue-500' },
    ];

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    };

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;

    const handlePayment = async () => {
        const cleanPhone = phone.replace(/\s/g, '');
        if (!/^0[235][0-9]{8}$/.test(cleanPhone)) {
            alert('Please enter a valid Ghana phone number');
            return;
        }

        setStatus('processing');

        try {
            // Simulate payment initiation
            await new Promise(resolve => setTimeout(resolve, 1500));

            const txnId = `TXN_${Date.now()}`;
            setTransactionId(txnId);
            setStatus('waiting');

            // Simulate waiting for approval
            await new Promise(resolve => setTimeout(resolve, 3000));

            setStatus('success');
            setTimeout(() => onSuccess(txnId), 1500);
        } catch (error) {
            setStatus('failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Mobile Money Payment</h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">
                            ×
                        </button>
                    </div>
                    <p className="text-white/80 text-sm mt-1">{description}</p>
                </div>

                <div className="p-6">
                    {status === 'idle' && (
                        <>
                            {/* Amount */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-500">Amount to Pay</p>
                                <p className="text-3xl font-bold text-gray-900">{formatPrice(amount)}</p>
                            </div>

                            {/* Provider Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Payment Provider
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {providers.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setProvider(p.id)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${provider === p.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 ${p.color} rounded-full mx-auto mb-2`} />
                                            <p className="text-xs font-medium">{p.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Money Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    placeholder="024 XXX XXXX"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg"
                                />
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                            >
                                Pay {formatPrice(amount)}
                            </button>
                        </>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-gray-600">Initiating payment...</p>
                        </div>
                    )}

                    {status === 'waiting' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📱</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Payment</h3>
                            <p className="text-gray-600 mb-4">
                                A prompt has been sent to your phone.<br />
                                Please enter your PIN to approve.
                            </p>
                            <div className="animate-pulse text-sm text-gray-500">
                                Waiting for approval...
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✓</span>
                            </div>
                            <h3 className="text-lg font-semibold text-green-700 mb-2">Payment Successful!</h3>
                            <p className="text-gray-600">Transaction ID: {transactionId}</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✗</span>
                            </div>
                            <h3 className="text-lg font-semibold text-red-700 mb-2">Payment Failed</h3>
                            <p className="text-gray-600 mb-4">Please try again</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="btn-primary"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
