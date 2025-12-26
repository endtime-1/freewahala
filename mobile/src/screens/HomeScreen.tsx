import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data
const PROPERTIES = [
    {
        id: '1',
        title: 'Modern 2 Bedroom Apartment',
        location: 'East Legon, Accra',
        price: 3500,
        advancePeriod: '1 year',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'],
        priceTag: 'GREAT_VALUE',
        verified: true,
        hasSelfMeter: true,
        isGated: true,
    },
    {
        id: '2',
        title: 'Spacious Chamber and Hall',
        location: 'Madina, Accra',
        price: 800,
        advancePeriod: '1 year',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
        priceTag: 'FAIR',
        verified: false,
        hasSelfMeter: true,
        isGated: false,
    },
    {
        id: '3',
        title: 'Executive 3 Bedroom House',
        location: 'Airport Residential, Accra',
        price: 8000,
        advancePeriod: '2 years',
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600'],
        priceTag: 'OVERPRICED',
        verified: true,
        hasSelfMeter: true,
        isGated: true,
    },
];

const FILTERS = [
    { id: 'selfMeter', label: 'Self Meter', icon: 'flash' },
    { id: 'gated', label: 'Gated', icon: 'shield-checkmark' },
    { id: 'noLandlord', label: 'No Landlord', icon: 'home' },
    { id: 'newlyBuilt', label: 'Newly Built', icon: 'sparkles' },
    { id: 'parking', label: 'Parking', icon: 'car' },
];

export default function HomeScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const toggleFilter = (id: string) => {
        setActiveFilters(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-GH').format(price);
    };

    const getPriceTagStyle = (tag: string) => {
        switch (tag) {
            case 'GREAT_VALUE':
                return { bg: '#E8F5E9', color: '#2E7D32', label: '✓ Great Value' };
            case 'OVERPRICED':
                return { bg: '#FFF3E0', color: '#F57C00', label: '⚠ Above Avg' };
            default:
                return { bg: '#E3F2FD', color: '#1976D2', label: '○ Fair Price' };
        }
    };

    const renderProperty = ({ item }: { item: typeof PROPERTIES[0] }) => {
        const priceTagStyle = getPriceTagStyle(item.priceTag);

        return (
            <TouchableOpacity
                style={styles.propertyCard}
                onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
                activeOpacity={0.9}
            >
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />

                    {/* Favorite Button */}
                    <TouchableOpacity style={styles.favoriteBtn}>
                        <Ionicons name="heart-outline" size={20} color="#222" />
                    </TouchableOpacity>

                    {/* Price Tag */}
                    <View style={[styles.priceTag, { backgroundColor: priceTagStyle.bg }]}>
                        <Text style={[styles.priceTagText, { color: priceTagStyle.color }]}>
                            {priceTagStyle.label}
                        </Text>
                    </View>

                    {/* Verified Badge */}
                    {item.verified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.propertyContent}>
                    <Text style={styles.propertyLocation}>{item.location}</Text>
                    <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>

                    {/* Amenities */}
                    <View style={styles.amenities}>
                        {item.hasSelfMeter && (
                            <View style={styles.amenityTag}>
                                <Text style={styles.amenityText}>Self Meter</Text>
                            </View>
                        )}
                        {item.isGated && (
                            <View style={styles.amenityTag}>
                                <Text style={styles.amenityText}>Gated</Text>
                            </View>
                        )}
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.currency}>GH₵</Text>
                        <Text style={styles.priceAmount}>{formatPrice(item.price)}</Text>
                        <Text style={styles.pricePeriod}>/month</Text>
                        <Text style={styles.advancePeriod}>• {item.advancePeriod} advance</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome to</Text>
                    <Text style={styles.brandName}>FreeWahala</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#222" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#717171" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by location..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#717171"
                    />
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Ionicons name="options-outline" size={20} color="#222" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {FILTERS.map(filter => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterPill,
                                activeFilters.includes(filter.id) && styles.filterPillActive,
                            ]}
                            onPress={() => toggleFilter(filter.id)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons
                                    name={filter.icon as any}
                                    size={16}
                                    color={activeFilters.includes(filter.id) ? '#FFFFFF' : '#333333'}
                                />
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: activeFilters.includes(filter.id) ? '#FFFFFF' : '#333333',
                                        marginLeft: 6,
                                    }}
                                >
                                    {filter.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    <Text style={styles.resultsCountBold}>{PROPERTIES.length}</Text> properties available
                </Text>
            </View>

            {/* Property List */}
            <FlatList
                data={PROPERTIES}
                renderItem={renderProperty}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.propertyList}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#fff',
    },
    greeting: {
        fontSize: 14,
        color: '#717171',
    },
    brandName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#222',
    },
    filterButton: {
        padding: 8,
    },
    filtersContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        minHeight: 60,
    },
    filtersContent: {
        paddingHorizontal: 20,
        minHeight: 50,
        alignItems: 'center',
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#FF6B35',
        marginRight: 10,
        minHeight: 40,
        overflow: 'visible',
    },
    filterPillActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    filterPillText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '600',
    },
    filterPillTextActive: {
        color: '#fff',
    },
    resultsHeader: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    resultsCount: {
        fontSize: 15,
        color: '#717171',
    },
    resultsCountBold: {
        fontWeight: '700',
        color: '#222',
    },
    propertyList: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    propertyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        height: 200,
        position: 'relative',
    },
    propertyImage: {
        width: '100%',
        height: '100%',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(232,245,233,0.95)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#2E7D32',
    },
    propertyContent: {
        padding: 16,
    },
    propertyLocation: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    propertyTitle: {
        fontSize: 14,
        color: '#717171',
        marginBottom: 10,
    },
    amenities: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    amenityTag: {
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    amenityText: {
        fontSize: 12,
        color: '#717171',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 14,
        color: '#717171',
        marginRight: 2,
    },
    priceAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
    },
    pricePeriod: {
        fontSize: 14,
        color: '#717171',
    },
    advancePeriod: {
        fontSize: 13,
        color: '#717171',
        marginLeft: 8,
    },
});
