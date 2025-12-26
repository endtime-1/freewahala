'use client';

import { useTheme } from '@/context/ThemeContext';

interface FilterPillsProps {
    activeFilters: string[];
    onFilterToggle: (filter: string) => void;
}

const GHANA_FILTERS = [
    { id: 'hasSelfMeter', label: 'Self Meter (Prepaid)', icon: '⚡' },
    { id: 'isWalledGated', label: 'Walled & Gated', icon: '🏰' },
    { id: 'noLandlordOnCompound', label: 'No Landlord', icon: '🏠' },
    { id: 'hasKitchenCabinet', label: 'Kitchen Cabinet', icon: '🍳' },
    { id: 'isNewlyBuilt', label: 'Newly Built', icon: '✨' },
    { id: 'hasParking', label: 'Parking', icon: '🚗' },
    { id: 'hasPopCeiling', label: 'Pop Ceiling', icon: '🏛️' },
    { id: 'hasTiledFloor', label: 'Tiled Floor', icon: '🔲' },
];

export default function FilterPills({ activeFilters, onFilterToggle }: FilterPillsProps) {
    const { isDark } = useTheme();

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {GHANA_FILTERS.map((filter) => {
                const isActive = activeFilters.includes(filter.id);
                return (
                    <button
                        key={filter.id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-medium text-sm transition-all ${isActive
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                : isDark
                                    ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        onClick={() => onFilterToggle(filter.id)}
                    >
                        <span>{filter.icon}</span>
                        <span>{filter.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
