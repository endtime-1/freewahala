'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import PropertyCard from '@/components/PropertyCard';
import MapPropertyPreview from '@/components/MapPropertyPreview';
import { Property } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

// Handle both cases: env var with or without /api suffix
const getApiUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  return base.endsWith('/api') ? base : `${base}/api`;
}
const API_URL = getApiUrl();

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

const STATS = [
  { value: '5,000+', label: 'Properties', icon: '🏠' },
  { value: '10,000+', label: 'Happy Tenants', icon: '😊' },
  { value: 'GH₵0', label: 'Agent Fees', icon: '💸' },
];

export default function HomePage() {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/properties`);
        const data = await res.json();
        if (data.properties) {
          setProperties(data.properties);
        } else if (Array.isArray(data)) {
          setProperties(data);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter properties based on active filters and search
  const filteredProperties = useMemo(() => {
    let result = properties;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.neighborhood?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.region?.toLowerCase().includes(query)
      );
    }

    // Apply boolean filters
    if (activeFilters.length > 0) {
      result = result.filter(property => {
        return activeFilters.every(filter => {
          // Check if property has this filter property set to true
          return (property as any)[filter] === true;
        });
      });
    }

    return result;
  }, [properties, activeFilters, searchQuery]);

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query);
  };

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handlePropertyClick = (id: string) => {
    window.location.href = `/properties/${id}`;
  };

  const handleFavorite = (id: string) => {
    console.log('Favorite:', id);
  };

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

          {/* Active Filters Indicator */}
          {activeFilters.length > 0 && (
            <div className={`mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="text-sm">Active filters: {activeFilters.length}</span>
              <button
                onClick={() => setActiveFilters([])}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filteredProperties.length}</span> properties available
            {activeFilters.length > 0 && ` (filtered from ${properties.length})`}
          </p>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading properties...</p>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-5xl mb-4">🏠</p>
              <p className="text-xl font-semibold mb-2">No properties found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} onClick={handlePropertyClick} onFavorite={handleFavorite} />
              ))}
            </div>
          ) : (
            <div className={`h-[70vh] rounded-2xl relative overflow-hidden ${isDark ? 'border border-white/10' : ''}`}>
              <PropertyMap properties={filteredProperties} onPropertySelect={setSelectedProperty} selectedProperty={selectedProperty} />
              {selectedProperty && <MapPropertyPreview property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
            </div>
          )}

          {/* Load More */}
          {viewMode === 'list' && filteredProperties.length > 0 && (
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

