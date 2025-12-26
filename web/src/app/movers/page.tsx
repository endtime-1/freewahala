'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const INVENTORY_ITEMS = [
    { id: 'bed', name: 'Bed (Double/Queen)', category: 'Furniture', weight: 50 },
    { id: 'bed_single', name: 'Bed (Single)', category: 'Furniture', weight: 30 },
    { id: 'wardrobe', name: 'Wardrobe', category: 'Furniture', weight: 80 },
    { id: 'sofa', name: 'Sofa Set', category: 'Furniture', weight: 100 },
    { id: 'dining', name: 'Dining Table + Chairs', category: 'Furniture', weight: 60 },
    { id: 'tv', name: 'TV + Stand', category: 'Electronics', weight: 20 },
    { id: 'fridge', name: 'Refrigerator', category: 'Appliances', weight: 70 },
    { id: 'freezer', name: 'Deep Freezer', category: 'Appliances', weight: 80 },
    { id: 'washing', name: 'Washing Machine', category: 'Appliances', weight: 50 },
    { id: 'ac', name: 'Air Conditioner', category: 'Appliances', weight: 40 },
    { id: 'boxes_small', name: 'Small Boxes (5)', category: 'Boxes', weight: 25 },
    { id: 'boxes_medium', name: 'Medium Boxes (5)', category: 'Boxes', weight: 50 },
    { id: 'boxes_large', name: 'Large Boxes (5)', category: 'Boxes', weight: 75 },
];

interface QuoteResult {
    basePrice: number;
    distanceCharge: number;
    floorCharge: number;
    packingCharge: number;
    total: number;
}

export default function MoversPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [inventory, setInventory] = useState<Record<string, number>>({});
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [fromFloor, setFromFloor] = useState('0');
    const [toFloor, setToFloor] = useState('0');
    const [needPacking, setNeedPacking] = useState(false);
    const [movingDate, setMovingDate] = useState('');
    const [quote, setQuote] = useState<QuoteResult | null>(null);

    const updateInventory = (itemId: string, delta: number) => {
        setInventory(prev => {
            const newCount = (prev[itemId] || 0) + delta;
            if (newCount <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newCount };
        });
    };

    const calculateQuote = () => {
        // Calculate total weight
        let totalWeight = 0;
        Object.entries(inventory).forEach(([itemId, count]) => {
            const item = INVENTORY_ITEMS.find(i => i.id === itemId);
            if (item) totalWeight += item.weight * count;
        });

        // Base price by weight
        const basePrice = Math.max(200, Math.ceil(totalWeight * 2));

        // Distance charge (mock - would use actual distance API)
        const distanceCharge = 100;

        // Floor charges
        const floorCharge = (parseInt(fromFloor) + parseInt(toFloor)) * 30;

        // Packing charge
        const packingCharge = needPacking ? Math.ceil(totalWeight * 0.5) : 0;

        const total = basePrice + distanceCharge + floorCharge + packingCharge;

        setQuote({ basePrice, distanceCharge, floorCharge, packingCharge, total });
        setStep(3);
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);
    const totalItems = Object.values(inventory).reduce((sum, count) => sum + count, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 py-12 px-4">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <span className="text-4xl mb-4 block">🚚</span>
                    <h1 className="text-3xl font-bold mb-2">Packers & Movers</h1>
                    <p className="text-white/80">Get an instant quote for your move</p>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex justify-between">
                        {['Inventory', 'Details', 'Quote'].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > idx + 1 ? 'bg-green-500 text-white' :
                                    step === idx + 1 ? 'bg-orange-500 text-white' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > idx + 1 ? '✓' : idx + 1}
                                </div>
                                <span className={`ml-2 text-sm ${step === idx + 1 ? 'font-medium' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                                {idx < 2 && <div className="w-16 h-px bg-gray-200 mx-4" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">What are you moving?</h2>

                        {/* Categories */}
                        {['Furniture', 'Appliances', 'Electronics', 'Boxes'].map((category) => (
                            <div key={category} className="bg-white rounded-2xl p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
                                <div className="space-y-3">
                                    {INVENTORY_ITEMS.filter(i => i.category === category).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <span className="text-gray-700">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateInventory(item.id, -1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center font-medium">
                                                    {inventory[item.id] || 0}
                                                </span>
                                                <button
                                                    onClick={() => updateInventory(item.id, 1)}
                                                    className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setStep(2)}
                            disabled={totalItems === 0}
                            className="w-full btn-primary bg-orange-500 hover:bg-orange-600 py-4 disabled:opacity-50"
                        >
                            Continue ({totalItems} items selected)
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Moving Details</h2>

                        <div className="bg-white rounded-2xl p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Location *</label>
                                <input
                                    type="text"
                                    value={fromLocation}
                                    onChange={(e) => setFromLocation(e.target.value)}
                                    placeholder="e.g., East Legon, Accra"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Floor Level (From)</label>
                                <select
                                    value={fromFloor}
                                    onChange={(e) => setFromFloor(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                >
                                    <option value="0">Ground Floor</option>
                                    <option value="1">1st Floor</option>
                                    <option value="2">2nd Floor</option>
                                    <option value="3">3rd Floor</option>
                                    <option value="4">4th Floor+</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">To Location *</label>
                                <input
                                    type="text"
                                    value={toLocation}
                                    onChange={(e) => setToLocation(e.target.value)}
                                    placeholder="e.g., Spintex, Accra"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Floor Level (To)</label>
                                <select
                                    value={toFloor}
                                    onChange={(e) => setToFloor(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                >
                                    <option value="0">Ground Floor</option>
                                    <option value="1">1st Floor</option>
                                    <option value="2">2nd Floor</option>
                                    <option value="3">3rd Floor</option>
                                    <option value="4">4th Floor+</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Moving Date *</label>
                                <input
                                    type="date"
                                    value={movingDate}
                                    onChange={(e) => setMovingDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={needPacking}
                                    onChange={(e) => setNeedPacking(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-orange-500"
                                />
                                <span className="text-gray-700">I need packing services</span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 btn-secondary py-4">Back</button>
                            <button onClick={calculateQuote} className="flex-1 btn-primary bg-orange-500 hover:bg-orange-600 py-4">
                                Get Quote
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && quote && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Your Quote</h2>

                        <div className="bg-white rounded-2xl p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Base Price ({totalItems} items)</span>
                                    <span className="text-gray-900">GH₵{formatPrice(quote.basePrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Distance Charge</span>
                                    <span className="text-gray-900">GH₵{formatPrice(quote.distanceCharge)}</span>
                                </div>
                                {quote.floorCharge > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Floor Handling</span>
                                        <span className="text-gray-900">GH₵{formatPrice(quote.floorCharge)}</span>
                                    </div>
                                )}
                                {quote.packingCharge > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Packing Service</span>
                                        <span className="text-gray-900">GH₵{formatPrice(quote.packingCharge)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-4 flex justify-between">
                                    <span className="font-semibold text-gray-900">Total Estimate</span>
                                    <span className="text-2xl font-bold text-orange-600">GH₵{formatPrice(quote.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                            <p className="text-sm text-gray-600">
                                This is an estimated quote. Final price may vary based on actual items and distance.
                            </p>
                        </div>

                        <Link
                            href={`/services/movers?quote=${quote.total}&from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}&date=${movingDate}`}
                            className="w-full block text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors"
                        >
                            Find a Mover Provider
                        </Link>

                        <p className="text-center text-sm text-gray-500 mt-2">
                            Browse available movers and book your move
                        </p>

                        <button onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:underline">
                            Start Over
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
