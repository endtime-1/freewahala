'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        platformCommission: 10,
        minBookingAdvance: 24,
        maxPropertyImages: 10,
        autoApproveVerifiedUsers: true,
        enableDevMode: true,
        maintenanceMode: false,
    });

    const [tierPricing, setTierPricing] = useState({
        STARTER: 29,
        PRO: 79,
        ENTERPRISE: 199
    });

    const [notificationSettings, setNotificationSettings] = useState({
        sendBookingConfirmation: true,
        sendPaymentReceipts: true,
        sendWeeklyReports: false,
        sendMarketingEmails: false
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        alert('Settings saved successfully!');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Configure platform settings and preferences</p>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">General Settings</h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Platform Commission (%)</p>
                            <p className="text-sm text-gray-500">Commission charged on service bookings</p>
                        </div>
                        <input
                            type="number"
                            value={settings.platformCommission}
                            onChange={(e) => setSettings({ ...settings, platformCommission: parseInt(e.target.value) })}
                            className="w-24 px-4 py-2 border border-gray-200 rounded-xl text-center font-medium"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Minimum Booking Advance (hours)</p>
                            <p className="text-sm text-gray-500">How far in advance users must book</p>
                        </div>
                        <input
                            type="number"
                            value={settings.minBookingAdvance}
                            onChange={(e) => setSettings({ ...settings, minBookingAdvance: parseInt(e.target.value) })}
                            className="w-24 px-4 py-2 border border-gray-200 rounded-xl text-center font-medium"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Max Property Images</p>
                            <p className="text-sm text-gray-500">Maximum images per property listing</p>
                        </div>
                        <input
                            type="number"
                            value={settings.maxPropertyImages}
                            onChange={(e) => setSettings({ ...settings, maxPropertyImages: parseInt(e.target.value) })}
                            className="w-24 px-4 py-2 border border-gray-200 rounded-xl text-center font-medium"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Auto-approve Verified Users</p>
                            <p className="text-sm text-gray-500">Automatically approve Ghana Card verified users</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, autoApproveVerifiedUsers: !settings.autoApproveVerifiedUsers })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoApproveVerifiedUsers ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoApproveVerifiedUsers ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscription Pricing */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Subscription Pricing (GH₵/month)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(tierPricing).map(([tier, price]) => (
                        <div key={tier} className="p-4 bg-gray-50 rounded-xl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{tier}</label>
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-2">GH₵</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setTierPricing({ ...tierPricing, [tier]: parseInt(e.target.value) })}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-medium"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Settings</h2>
                <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2">
                            <span className="font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                            <button
                                onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !value })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Developer Options */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Developer Options</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Dev Mode</p>
                            <p className="text-sm text-gray-500">Enable development features like test payments</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, enableDevMode: !settings.enableDevMode })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableDevMode ? 'bg-blue-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableDevMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Maintenance Mode</p>
                            <p className="text-sm text-red-500">⚠️ This will take the site offline for users</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>
        </div>
    );
}
