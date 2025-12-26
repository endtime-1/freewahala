'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import PropertyCard from '@/components/PropertyCard';
import MapPropertyPreview from '@/components/MapPropertyPreview';
import { Property } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-white/5 rounded-2xl">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
});

const MOCK_PROPERTIES: Property[] = [
  { id: '1', title: 'Modern 2 Bedroom Apartment', description: 'Beautiful apartment in East Legon', price: 3500, rentAdvancePeriod: 'ONE_YEAR', propertyType: 'TWO_BEDROOM', region: 'Greater Accra', city: 'Accra', neighborhood: 'East Legon', locationLat: 5.6350, locationLng: -0.1578, images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], hasSelfMeter: true, waterFlow: 'CONSTANT', isWalledGated: true, noLandlordOnCompound: true, isNewlyBuilt: true, verificationStatus: true, priceTag: 'GREAT_VALUE', viewCount: 245, createdAt: new Date().toISOString(), owner: { id: '1', fullName: 'Kofi Mensah', ghanaCardVerified: true } },
  { id: '2', title: 'Spacious Chamber and Hall', description: 'Well-maintained at Madina', price: 800, rentAdvancePeriod: 'ONE_YEAR', propertyType: 'CHAMBER_HALL', region: 'Greater Accra', city: 'Accra', neighborhood: 'Madina', locationLat: 5.6781, locationLng: -0.1674, images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], hasSelfMeter: true, waterFlow: 'WEEKLY', isWalledGated: false, noLandlordOnCompound: false, isNewlyBuilt: false, verificationStatus: false, priceTag: 'FAIR', viewCount: 89, createdAt: new Date().toISOString(), owner: { id: '2', fullName: 'Ama Serwaa', ghanaCardVerified: false } },
  { id: '3', title: 'Executive 3 Bedroom House', description: 'Luxury at Airport Residential', price: 8000, rentAdvancePeriod: 'TWO_YEARS', propertyType: 'THREE_BEDROOM', region: 'Greater Accra', city: 'Accra', neighborhood: 'Airport Residential', locationLat: 5.6055, locationLng: -0.1799, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], hasSelfMeter: true, waterFlow: 'CONSTANT', isWalledGated: true, noLandlordOnCompound: true, isNewlyBuilt: true, verificationStatus: true, priceTag: 'OVERPRICED', viewCount: 156, createdAt: new Date().toISOString(), owner: { id: '3', fullName: 'Kwame Asante', ghanaCardVerified: true } },
  { id: '4', title: 'Affordable Single Room', description: 'Clean room at Kasoa', price: 350, rentAdvancePeriod: 'ONE_YEAR', propertyType: 'SINGLE_ROOM', region: 'Central', city: 'Kasoa', neighborhood: 'Kasoa New Town', locationLat: 5.5348, locationLng: -0.4272, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], hasSelfMeter: false, waterFlow: 'IRREGULAR', isWalledGated: false, noLandlordOnCompound: false, isNewlyBuilt: false, verificationStatus: false, priceTag: 'GREAT_VALUE', viewCount: 312, createdAt: new Date().toISOString(), owner: { id: '4', fullName: 'Yaw Boateng', ghanaCardVerified: false } },
];

const STATS = [
  { value: '5,000+', label: 'Properties', icon: '🏠' },
  { value: '10,000+', label: 'Happy Tenants', icon: '😊' },
  { value: 'GH₵0', label: 'Agent Fees', icon: '💸' },
];

export default function HomePage() {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleSearch = (query: string, filters: any) => console.log('Search:', query, filters);
  const handleFilterToggle = (filterId: string) => setActiveFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]);
  const handlePropertyClick = (id: string) => window.location.href = `/properties/${id}`;
  const handleFavorite = (id: string) => console.log('Favorite:', id);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Background */}
      {isDark && (
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )}

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-8 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl rounded-full border mb-4 sm:mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-orange-50 border-orange-200'}`}>
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-orange-700'}`}>No Agents. No Brokers. Just Direct.</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              <span className={`bg-gradient-to-r ${isDark ? 'from-white via-gray-100 to-gray-400' : 'from-gray-900 via-gray-800 to-gray-600'} bg-clip-text text-transparent`}>Find Your</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">Perfect Home</span>
            </h1>
            <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect directly with landlords across Ghana. Save money, skip the middleman.
            </p>
            <div className={`max-w-xl mx-auto backdrop-blur-xl rounded-2xl p-2 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white shadow-xl'}`}>
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={`py-6 sm:py-8 border-y ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-6 text-center">
              {STATS.map((stat, idx) => (
                <div key={idx}>
                  <span className="text-lg sm:text-2xl mb-1 sm:mb-2 block">{stat.icon}</span>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{stat.value}</p>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <FilterPills activeFilters={activeFilters} onFilterToggle={handleFilterToggle} />

            {/* View Toggle */}
            <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'list'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'map'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                Map
              </button>
            </div>
          </div>

          {/* Results Count */}
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{properties.length}</span> properties available
          </p>

          {/* View Content */}
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} onClick={handlePropertyClick} onFavorite={handleFavorite} />
              ))}
            </div>
          ) : (
            <div className={`h-[70vh] rounded-2xl relative overflow-hidden ${isDark ? 'border border-white/10' : ''}`}>
              <PropertyMap properties={properties} onPropertySelect={setSelectedProperty} selectedProperty={selectedProperty} />
              {selectedProperty && <MapPropertyPreview property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
            </div>
          )}

          {/* Load More */}
          {viewMode === 'list' && (
            <div className="text-center mt-10">
              <button className={`px-8 py-4 rounded-2xl font-semibold transition-all ${isDark
                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-lg'}`}>
                Load more properties
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
