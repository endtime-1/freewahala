import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ServiceProvider {
    id: string;
    name: string;
    businessName?: string;
    rating: number;
    reviewCount: number;
    totalReviews?: number;
    completedJobs: number;
    verified: boolean;
    coverageAreas: string[];
    priceRange: { min: number; max: number };
    responseTime?: string;
    description?: string;
    profileImageUrl?: string;
}

interface ServiceCategory {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    description: string;
    providerCount?: number;
}

interface Booking {
    id: string;
    status: string;
    scheduledDate: string;
    provider: {
        businessName: string;
        serviceType: string;
    };
}

const SERVICES: ServiceCategory[] = [
    { id: 'movers', title: 'Packers & Movers', icon: 'car', color: '#FF6B35', description: 'Relocate with ease' },
    { id: 'electrician', title: 'Electrician', icon: 'flash', color: '#FFA000', description: 'Electrical repairs' },
    { id: 'plumber', title: 'Plumber', icon: 'water', color: '#2196F3', description: 'Plumbing fixes' },
    { id: 'painter', title: 'Painter', icon: 'color-palette', color: '#9C27B0', description: 'Interior & exterior' },
    { id: 'cleaner', title: 'Cleaning', icon: 'sparkles', color: '#4CAF50', description: 'Deep cleaning' },
    { id: 'ac', title: 'AC Technician', icon: 'snow', color: '#00BCD4', description: 'AC services' },
    { id: 'carpenter', title: 'Carpenter', icon: 'build', color: '#795548', description: 'Furniture repair' },
    { id: 'tiler', title: 'Tiler', icon: 'grid', color: '#607D8B', description: 'Tile work' },
];

const FEATURED_SERVICES = [
    { id: 'movers', title: 'Moving Day?', subtitle: 'Book trusted movers', image: '🚚', discount: '20% OFF' },
    { id: 'cleaner', title: 'Deep Cleaning', subtitle: 'Professional cleaners', image: '✨', discount: 'From GH₵50' },
];

export default function ServicesScreen({ navigation }: any) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllCategories, setShowAllCategories] = useState(false);

    const loadRecentBookings = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch(`${API_URL}/api/services/bookings/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setRecentBookings(data.bookings?.slice(0, 3) || []);
            }
        } catch (error) {
            console.log('Could not load recent bookings');
        }
    }, []);

    useEffect(() => {
        loadRecentBookings();
    }, [loadRecentBookings]);

    useEffect(() => {
        if (selectedCategory) {
            fetchProviders(selectedCategory);
        }
    }, [selectedCategory]);

    const fetchProviders = async (category: string) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/services/providers/category/${category}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch providers');
            }

            setProviders(data.providers || []);
        } catch (err: any) {
            console.error('Fetch providers error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        loadRecentBookings();
        if (selectedCategory) {
            fetchProviders(selectedCategory);
        } else {
            setIsRefreshing(false);
        }
    };

    const formatPrice = (price: number) => `GH₵${price}`;

    const handleCategoryPress = (category: ServiceCategory) => {
        if (selectedCategory === category.id) {
            setSelectedCategory(null);
            setProviders([]);
        } else {
            setSelectedCategory(category.id);
        }
    };

    const handleProviderPress = (provider: ServiceProvider) => {
        navigation.navigate('ProviderDetail', {
            providerId: provider.id,
            category: selectedCategory,
            providerName: provider.businessName || provider.name,
        });
    };

    const getStatusColor = (status: string): [string, string] => {
        switch (status) {
            case 'CONFIRMED': return ['#4CAF50', '#E8F5E9'];
            case 'PENDING': return ['#FF9800', '#FFF3E0'];
            case 'IN_PROGRESS': return ['#2196F3', '#E3F2FD'];
            case 'COMPLETED': return ['#9E9E9E', '#F5F5F5'];
            default: return ['#757575', '#EEEEEE'];
        }
    };

    const categoriesToShow = showAllCategories ? SERVICES : SERVICES.slice(0, 4);

    const renderProvider = ({ item }: { item: ServiceProvider }) => {
        const selectedService = SERVICES.find(s => s.id === selectedCategory);

        return (
            <TouchableOpacity
                style={styles.providerCard}
                onPress={() => handleProviderPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.providerTop}>
                    <View style={[styles.providerAvatar, { backgroundColor: selectedService?.color || '#FF6B35' }]}>
                        {item.profileImageUrl ? (
                            <Image source={{ uri: item.profileImageUrl }} style={styles.providerImage} />
                        ) : (
                            <Text style={styles.providerInitial}>
                                {(item.businessName || item.name)?.[0]?.toUpperCase() || 'P'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.providerInfo}>
                        <View style={styles.providerNameRow}>
                            <Text style={styles.providerName} numberOfLines={1}>
                                {item.businessName || item.name}
                            </Text>
                            {item.verified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                </View>
                            )}
                        </View>
                        <View style={styles.ratingRow}>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color="#FFB800" />
                                <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
                            </View>
                            <Text style={styles.reviewCount}>
                                ({item.reviewCount || item.totalReviews || 0} reviews)
                            </Text>
                            <View style={styles.dotSeparator} />
                            <Text style={styles.jobsText}>{item.completedJobs || 0} jobs</Text>
                        </View>
                    </View>
                </View>

                {item.description && (
                    <Text style={styles.providerDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.providerBottom}>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Starting from</Text>
                        <Text style={styles.priceValue}>{formatPrice(item.priceRange?.min || 50)}</Text>
                    </View>
                    {item.responseTime && (
                        <View style={styles.responseTime}>
                            <Ionicons name="time-outline" size={14} color="#717171" />
                            <Text style={styles.responseText}>{item.responseTime}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: selectedService?.color || '#FF6B35' }]}
                        onPress={() => handleProviderPress(item)}
                    >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF6B35"
                        colors={['#FF6B35']}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Home Services</Text>
                        <Text style={styles.headerSubtitle}>Trusted professionals at your doorstep</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.myBookingsButton}
                        onPress={() => navigation.navigate('MyBookings')}
                    >
                        <Ionicons name="calendar-outline" size={22} color="#FF6B35" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#717171" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for services..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Featured Promos */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.promosContainer}
                >
                    {FEATURED_SERVICES.map((promo) => {
                        const service = SERVICES.find(s => s.id === promo.id);
                        return (
                            <TouchableOpacity
                                key={promo.id}
                                style={styles.promoCard}
                                onPress={() => handleCategoryPress(service!)}
                            >
                                <LinearGradient
                                    colors={[service?.color || '#FF6B35', `${service?.color}CC` || '#FF6B35CC']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.promoGradient}
                                >
                                    <View style={styles.promoContent}>
                                        <Text style={styles.promoEmoji}>{promo.image}</Text>
                                        <View style={styles.promoText}>
                                            <Text style={styles.promoTitle}>{promo.title}</Text>
                                            <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.promoBadge}>
                                        <Text style={styles.promoBadgeText}>{promo.discount}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Recent Bookings */}
                {recentBookings.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Bookings</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {recentBookings.map((booking) => {
                                const [textColor, bgColor] = getStatusColor(booking.status);
                                return (
                                    <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                                        <View style={[styles.bookingStatus, { backgroundColor: bgColor }]}>
                                            <Text style={[styles.bookingStatusText, { color: textColor }]}>
                                                {booking.status}
                                            </Text>
                                        </View>
                                        <Text style={styles.bookingProvider} numberOfLines={1}>
                                            {booking.provider?.businessName || 'Service'}
                                        </Text>
                                        <Text style={styles.bookingDate}>
                                            {new Date(booking.scheduledDate).toLocaleDateString()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Service Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>All Services</Text>
                        <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
                            <Text style={styles.seeAllText}>
                                {showAllCategories ? 'Show Less' : 'See All'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {categoriesToShow.map(service => (
                            <TouchableOpacity
                                key={service.id}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory === service.id && styles.categoryCardSelected,
                                    selectedCategory === service.id && { borderColor: service.color }
                                ]}
                                onPress={() => handleCategoryPress(service)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.categoryIcon, { backgroundColor: `${service.color}15` }]}>
                                    <Ionicons name={service.icon} size={28} color={service.color} />
                                </View>
                                <Text style={styles.categoryTitle}>{service.title}</Text>
                                <Text style={styles.categoryDescription}>{service.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Providers Section */}
                {selectedCategory && (
                    <View style={styles.providersSection}>
                        <View style={styles.providersSectionHeader}>
                            <View style={styles.providersTitleRow}>
                                <View style={[
                                    styles.categoryBadge,
                                    { backgroundColor: `${SERVICES.find(s => s.id === selectedCategory)?.color}15` }
                                ]}>
                                    <Ionicons
                                        name={SERVICES.find(s => s.id === selectedCategory)?.icon || 'construct'}
                                        size={16}
                                        color={SERVICES.find(s => s.id === selectedCategory)?.color}
                                    />
                                </View>
                                <Text style={styles.providersTitle}>
                                    {SERVICES.find(s => s.id === selectedCategory)?.title} Providers
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                                <Ionicons name="close-circle" size={24} color="#999" />
                            </TouchableOpacity>
                        </View>

                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#FF6B35" />
                                <Text style={styles.loadingText}>Finding the best providers...</Text>
                            </View>
                        )}

                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="warning-outline" size={48} color="#FF9800" />
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => fetchProviders(selectedCategory)}
                                >
                                    <Text style={styles.retryButtonText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isLoading && !error && providers.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Ionicons name="construct-outline" size={48} color="#DDD" />
                                </View>
                                <Text style={styles.emptyTitle}>No Providers Yet</Text>
                                <Text style={styles.emptyText}>
                                    We're currently onboarding {SERVICES.find(s => s.id === selectedCategory)?.title.toLowerCase()} in your area
                                </Text>
                                <TouchableOpacity style={styles.notifyButton}>
                                    <Ionicons name="notifications-outline" size={18} color="#FF6B35" />
                                    <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isLoading && !error && providers.length > 0 && (
                            <FlatList
                                data={providers}
                                renderItem={renderProvider}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                            />
                        )}
                    </View>
                )}

                {/* Become a Provider CTA */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.becomeProviderCard}>
                        <LinearGradient
                            colors={['#1A1A2E', '#16213E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.becomeProviderGradient}
                        >
                            <View style={styles.becomeProviderIcon}>
                                <Ionicons name="briefcase" size={32} color="#FFD700" />
                            </View>
                            <View style={styles.becomeProviderContent}>
                                <Text style={styles.becomeProviderTitle}>Become a Service Provider</Text>
                                <Text style={styles.becomeProviderText}>
                                    Earn money by offering your skills to thousands of customers
                                </Text>
                            </View>
                            <Ionicons name="arrow-forward-circle" size={28} color="#FFD700" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Rental Agreements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other Tools</Text>
                    <TouchableOpacity style={styles.toolCard}>
                        <View style={styles.toolIconContainer}>
                            <Ionicons name="document-text" size={28} color="#FF6B35" />
                        </View>
                        <View style={styles.toolContent}>
                            <Text style={styles.toolTitle}>Rental Agreements</Text>
                            <Text style={styles.toolDescription}>
                                Generate legally binding rental agreements with digital signatures
                            </Text>
                        </View>
                        <View style={styles.toolArrow}>
                            <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#222',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#717171',
        marginTop: 4,
    },
    myBookingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
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
    promosContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    promoCard: {
        width: width * 0.7,
        marginRight: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    promoGradient: {
        padding: 20,
        minHeight: 120,
        justifyContent: 'space-between',
    },
    promoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoEmoji: {
        fontSize: 40,
        marginRight: 12,
    },
    promoText: {},
    promoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    promoSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    promoBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
    },
    promoBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 160,
    },
    bookingStatus: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    bookingStatusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    bookingProvider: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    bookingDate: {
        fontSize: 12,
        color: '#717171',
        marginTop: 4,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    categoryCard: {
        width: (width - 52) / 2,
        margin: 6,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardSelected: {
        backgroundColor: '#FFF9F6',
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
    },
    categoryDescription: {
        fontSize: 12,
        color: '#717171',
        marginTop: 4,
        textAlign: 'center',
    },
    providersSection: {
        backgroundColor: '#fff',
        marginTop: 8,
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    providersSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    providersTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    providersTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    providerCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        padding: 16,
    },
    providerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    providerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    providerImage: {
        width: '100%',
        height: '100%',
    },
    providerInitial: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    providerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    providerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        flex: 1,
    },
    verifiedBadge: {
        marginLeft: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#222',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: '#717171',
        marginLeft: 8,
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCC',
        marginHorizontal: 8,
    },
    jobsText: {
        fontSize: 12,
        color: '#717171',
    },
    providerDescription: {
        fontSize: 13,
        color: '#555',
        marginTop: 12,
        lineHeight: 18,
    },
    providerBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#EAEAEA',
    },
    priceInfo: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 11,
        color: '#717171',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginTop: 2,
    },
    responseTime: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    responseText: {
        fontSize: 12,
        color: '#717171',
        marginLeft: 4,
    },
    bookButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    bookButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#717171',
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#FF9800',
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#FF6B35',
        borderRadius: 20,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    emptyText: {
        fontSize: 14,
        color: '#717171',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    notifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFF5F0',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#FFE5D9',
    },
    notifyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
        marginLeft: 8,
    },
    becomeProviderCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    becomeProviderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    becomeProviderIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,215,0,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    becomeProviderContent: {
        flex: 1,
        marginHorizontal: 16,
    },
    becomeProviderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    becomeProviderText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    toolIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolContent: {
        flex: 1,
        marginHorizontal: 14,
    },
    toolTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    toolDescription: {
        fontSize: 13,
        color: '#717171',
        marginTop: 4,
    },
    toolArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
