'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string, filters: SearchFilters) => void;
}

export interface SearchFilters {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, filters);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
            <div className="search-bar">
                {/* Location Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#717171" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>

                <input
                    type="text"
                    placeholder="Search by location, neighborhood..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                />

                {/* Filters Button */}
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                </button>

                {/* Search Button */}
                <button type="submit" className="search-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mt-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Property Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                value={filters.propertyType || ''}
                                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value || undefined })}
                            >
                                <option value="">All Types</option>
                                <option value="SINGLE_ROOM">Single Room</option>
                                <option value="CHAMBER_HALL">Chamber & Hall</option>
                                <option value="SELF_CONTAINED">Self Contained</option>
                                <option value="ONE_BEDROOM">1 Bedroom</option>
                                <option value="TWO_BEDROOM">2 Bedroom</option>
                                <option value="THREE_BEDROOM">3 Bedroom</option>
                                <option value="APARTMENT">Apartment</option>
                                <option value="HOUSE">House</option>
                            </select>
                        </div>

                        {/* Min Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (GH₵)</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="0"
                                value={filters.minPrice || ''}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                            />
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (GH₵)</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Any"
                                value={filters.maxPrice || ''}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setFilters({})}
                            className="btn-secondary text-sm"
                        >
                            Clear All
                        </button>
                        <button type="submit" className="btn-primary text-sm">
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
