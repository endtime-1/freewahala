'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Location {
    lat: number;
    lng: number;
    timestamp: Date;
}

interface TrackingData {
    bookingId: string;
    status: 'ASSIGNED' | 'EN_ROUTE_PICKUP' | 'AT_PICKUP' | 'LOADING' | 'EN_ROUTE_DELIVERY' | 'AT_DELIVERY' | 'UNLOADING' | 'COMPLETED';
    driver: {
        name: string;
        phone: string;
        photo: string;
        vehicleNumber: string;
        vehicleType: string;
    };
    pickup: {
        address: string;
        lat: number;
        lng: number;
    };
    delivery: {
        address: string;
        lat: number;
        lng: number;
    };
    currentLocation: Location;
    estimatedArrival: string;
}

const MOCK_TRACKING: TrackingData = {
    bookingId: 'MOV-2024-001',
    status: 'EN_ROUTE_PICKUP',
    driver: {
        name: 'Kwame Asante',
        phone: '024 555 1234',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        vehicleNumber: 'GR 1234-20',
        vehicleType: 'Medium Truck'
    },
    pickup: {
        address: 'East Legon, Accra',
        lat: 5.6350,
        lng: -0.1574,
    },
    delivery: {
        address: 'Tema Community 25, Tema',
        lat: 5.6700,
        lng: -0.0200,
    },
    currentLocation: {
        lat: 5.6450,
        lng: -0.1200,
        timestamp: new Date(),
    },
    estimatedArrival: '25 mins',
};

const statusSteps = [
    { key: 'ASSIGNED', label: 'Driver Assigned', icon: '👤' },
    { key: 'EN_ROUTE_PICKUP', label: 'On Way to Pickup', icon: '🚛' },
    { key: 'AT_PICKUP', label: 'At Pickup Location', icon: '📍' },
    { key: 'LOADING', label: 'Loading Items', icon: '📦' },
    { key: 'EN_ROUTE_DELIVERY', label: 'On Way to Delivery', icon: '🚛' },
    { key: 'AT_DELIVERY', label: 'At Delivery', icon: '📍' },
    { key: 'UNLOADING', label: 'Unloading', icon: '📦' },
    { key: 'COMPLETED', label: 'Completed', icon: '✓' },
];

export default function TrackMovingPage() {
    const params = useParams();
    const [tracking, setTracking] = useState<TrackingData>(MOCK_TRACKING);
    const [showCall, setShowCall] = useState(false);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTracking(prev => ({
                ...prev,
                currentLocation: {
                    lat: prev.currentLocation.lat + (Math.random() - 0.5) * 0.001,
                    lng: prev.currentLocation.lng + 0.002,
                    timestamp: new Date(),
                },
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const currentStepIndex = statusSteps.findIndex(s => s.key === tracking.status);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Map Area (Placeholder) */}
            <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-6xl">🗺️</span>
                        <p className="text-gray-600 mt-2">Live tracking map</p>
                        <p className="text-xs text-gray-500">
                            Location: {tracking.currentLocation.lat.toFixed(4)}, {tracking.currentLocation.lng.toFixed(4)}
                        </p>
                    </div>
                </div>

                {/* Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm">
                        <span className="text-green-600 font-medium">● Live</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm">
                        <span className="font-medium">ETA: {tracking.estimatedArrival}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Booking Info */}
                <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Booking ID</p>
                            <p className="font-semibold text-gray-900">{tracking.bookingId}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {statusSteps[currentStepIndex]?.label}
                        </span>
                    </div>
                </div>

                {/* Driver Card */}
                <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                            <img src={tracking.driver.photo} alt={tracking.driver.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{tracking.driver.name}</h3>
                            <p className="text-sm text-gray-500">{tracking.driver.vehicleType}</p>
                            <p className="text-sm text-gray-500">{tracking.driver.vehicleNumber}</p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={`tel:${tracking.driver.phone.replace(/\s/g, '')}`}
                                className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200"
                            >
                                📞
                            </a>
                            <button
                                onClick={() => alert('Opening chat...')}
                                className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200"
                            >
                                💬
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-xl p-6 mb-4 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Moving Progress</h3>
                    <div className="space-y-4">
                        {statusSteps.map((step, idx) => {
                            const isCompleted = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div key={step.key} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' :
                                            isCurrent ? 'bg-blue-500 text-white animate-pulse' :
                                                'bg-gray-100 text-gray-400'
                                        }`}>
                                        {isCompleted ? '✓' : step.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                            {step.label}
                                        </p>
                                        {isCurrent && (
                                            <p className="text-sm text-blue-600">In progress...</p>
                                        )}
                                    </div>
                                    {idx < statusSteps.length - 1 && (
                                        <div className={`absolute left-[1.1rem] top-10 w-0.5 h-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`} style={{ marginTop: '40px' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Locations */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            A
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pickup</p>
                            <p className="font-medium text-gray-900">{tracking.pickup.address}</p>
                        </div>
                    </div>
                    <div className="border-l-2 border-dashed border-gray-200 ml-4 h-4" />
                    <div className="flex items-start gap-4 mt-4">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            B
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Delivery</p>
                            <p className="font-medium text-gray-900">{tracking.delivery.address}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
