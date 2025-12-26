import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Linking,
    Dimensions,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ProviderService {
    name: string;
    price: number;
}

interface Review {
    id: string;
    rating: number;
    review: string;
    date: string;
    customerName: string;
}

interface Provider {
    id: string;
    name: string;
    businessName: string;
    phone: string;
    serviceType: string;
    rating: number;
    reviewCount: number;
    totalReviews?: number;
    verified: boolean;
    ghanaCardVerified: boolean;
    coverageAreas: string[];
    pricing: {
        services?: ProviderService[];
        minPrice?: number;
        maxPrice?: number;
    };
    description: string;
    memberSince: string;
    reviews: Review[];
    profileImageUrl?: string;
    responseTime?: string;
    completedJobs?: number;
}

const SERVICE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    ELECTRICIAN: { icon: 'flash', color: '#FFA000', label: 'Electrician' },
    PLUMBER: { icon: 'water', color: '#2196F3', label: 'Plumber' },
    PAINTER: { icon: 'color-palette', color: '#9C27B0', label: 'Painter' },
    CLEANER: { icon: 'sparkles', color: '#4CAF50', label: 'Cleaning' },
    AC_TECHNICIAN: { icon: 'snow', color: '#00BCD4', label: 'AC Technician' },
    CARPENTER: { icon: 'build', color: '#795548', label: 'Carpenter' },
    PACKERS_MOVERS: { icon: 'car', color: '#FF6B35', label: 'Movers' },
    TILER: { icon: 'grid', color: '#607D8B', label: 'Tiler' },
    MASON: { icon: 'construct', color: '#8D6E63', label: 'Mason' },
    GENERAL_HANDYMAN: { icon: 'hammer', color: '#455A64', label: 'Handyman' },
};

export default function ProviderDetailScreen({ route, navigation }: any) {
    const { providerId, category, providerName } = route.params;
    const insets = useSafeAreaInsets();

    const [provider, setProvider] = useState<Provider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        scheduledDate: '',
        scheduledTime: '',
        address: '',
        city: '',
        notes: '',
    });
    const [isBooking, setIsBooking] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        fetchProvider();
    }, [providerId]);

    const fetchProvider = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/services/providers/${providerId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch provider');
            }

            setProvider(data.provider);
        } catch (err: any) {
            console.error('Fetch provider error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBook = async () => {
        if (!bookingData.scheduledDate || !bookingData.address || !bookingData.city) {
            Alert.alert('Missing Information', 'Please fill in all required fields');
            return;
        }

        setIsBooking(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert(
                    'Login Required',
                    'Please log in to book a service',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Log In', onPress: () => navigation.navigate('Login') },
                    ]
                );
                return;
            }

            const response = await fetch(`${API_URL}/api/services/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    providerId,
                    ...bookingData,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Booking failed');
            }

            Alert.alert(
                '🎉 Booking Confirmed!',
                `Your booking with ${providerName} has been submitted. They will contact you shortly to confirm.`,
                [
                    {
                        text: 'View Bookings',
                        onPress: () => {
                            navigation.goBack();
                            navigation.navigate('MyBookings');
                        }
                    },
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]
            );
        } catch (err: any) {
            Alert.alert('Booking Failed', err.message);
        } finally {
            setIsBooking(false);
        }
    };

    const formatPrice = (price: number) => `GH₵${price}`;

    const getServiceConfig = () => {
        const serviceType = provider?.serviceType || category?.toUpperCase() || '';
        return SERVICE_CONFIG[serviceType] || { icon: 'construct', color: '#FF6B35', label: 'Service' };
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 4) return 'Very Good';
        if (rating >= 3.5) return 'Good';
        if (rating >= 3) return 'Average';
        return 'New';
    };

    const callProvider = () => {
        if (provider?.phone) {
            Linking.openURL(`tel:${provider.phone}`);
        }
    };

    const whatsappProvider = () => {
        if (provider?.phone) {
            const phone = provider.phone.replace(/\D/g, '');
            Linking.openURL(`whatsapp://send?phone=${phone}`);
        }
    };

    const validateStep = () => {
        if (bookingStep === 1 && !bookingData.scheduledDate) {
            Alert.alert('Required', 'Please select a date');
            return false;
        }
        if (bookingStep === 2 && (!bookingData.address || !bookingData.city)) {
            Alert.alert('Required', 'Please enter your address and city');
            return false;
        }
        return true;
    };

    const config = getServiceConfig();

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Loading provider details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !provider) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <Ionicons name="alert-circle-outline" size={64} color="#FF9800" />
                    </View>
                    <Text style={styles.errorTitle}>Provider Not Found</Text>
                    <Text style={styles.errorText}>{error || 'This provider may no longer be available'}</Text>
                    <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonLargeText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Gradient */}
                <LinearGradient
                    colors={[config.color, `${config.color}DD`]}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => setIsFavorite(!isFavorite)}
                            >
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={isFavorite ? '#FF4081' : '#fff'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons name="share-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            {provider.profileImageUrl ? (
                                <Image source={{ uri: provider.profileImageUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name={config.icon as any} size={40} color="#fff" />
                                </View>
                            )}
                            {provider.verified && (
                                <View style={styles.verifiedBadgeContainer}>
                                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.businessName}>{provider.businessName}</Text>
                        <Text style={styles.providerNameText}>{provider.name}</Text>

                        <View style={styles.ratingContainer}>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Ionicons
                                        key={star}
                                        name="star"
                                        size={18}
                                        color={star <= Math.round(provider.rating || 0) ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                                    />
                                ))}
                            </View>
                            <Text style={styles.ratingText}>
                                {provider.rating?.toFixed(1) || '0.0'} • {getRatingLabel(provider.rating || 0)}
                            </Text>
                            <Text style={styles.reviewCountText}>
                                ({provider.reviewCount || provider.totalReviews || 0} reviews)
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{provider.completedJobs || 0}</Text>
                        <Text style={styles.statLabel}>Jobs Done</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{provider.responseTime || '< 2h'}</Text>
                        <Text style={styles.statLabel}>Response</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{provider.memberSince || '2024'}</Text>
                        <Text style={styles.statLabel}>Member Since</Text>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>
                        {provider.description || `Professional ${config.label} service provider in Ghana. Quality workmanship and customer satisfaction guaranteed.`}
                    </Text>

                    {provider.ghanaCardVerified && (
                        <View style={styles.verificationBadge}>
                            <Ionicons name="shield-checkmark" size={18} color="#4CAF50" />
                            <Text style={styles.verificationText}>Ghana Card Verified</Text>
                        </View>
                    )}
                </View>

                {/* Services & Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services & Pricing</Text>
                    {provider.pricing?.services && provider.pricing.services.length > 0 ? (
                        provider.pricing.services.map((service, idx) => (
                            <View key={idx} style={styles.serviceRow}>
                                <View style={styles.serviceInfo}>
                                    <Ionicons name="checkmark-circle" size={18} color={config.color} />
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                </View>
                                <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.priceRangeCard}>
                            <Text style={styles.priceRangeLabel}>Starting from</Text>
                            <Text style={[styles.priceRangeValue, { color: config.color }]}>
                                {formatPrice(provider.pricing?.minPrice || 50)}
                            </Text>
                            {provider.pricing?.maxPrice && (
                                <Text style={styles.priceRangeMax}>
                                    up to {formatPrice(provider.pricing.maxPrice)}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Coverage Areas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Areas</Text>
                    <View style={styles.areasGrid}>
                        {(provider.coverageAreas || ['Accra']).map((area, idx) => (
                            <View key={idx} style={[styles.areaChip, { borderColor: config.color }]}>
                                <Ionicons name="location" size={14} color={config.color} />
                                <Text style={[styles.areaText, { color: config.color }]}>{area}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Reviews Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Reviews ({provider.reviewCount || provider.totalReviews || 0})
                        </Text>
                        {provider.reviews && provider.reviews.length > 3 && (
                            <TouchableOpacity>
                                <Text style={[styles.seeAllText, { color: config.color }]}>See All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {provider.reviews && provider.reviews.length > 0 ? (
                        provider.reviews.slice(0, 3).map((review, idx) => (
                            <View key={idx} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={[styles.reviewerAvatar, { backgroundColor: `${config.color}20` }]}>
                                        <Text style={[styles.reviewerInitial, { color: config.color }]}>
                                            {review.customerName?.charAt(0) || 'C'}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewerInfo}>
                                        <Text style={styles.reviewerName}>{review.customerName}</Text>
                                        <View style={styles.reviewStars}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Ionicons
                                                    key={star}
                                                    name="star"
                                                    size={12}
                                                    color={star <= review.rating ? '#FFB800' : '#E0E0E0'}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={styles.reviewDate}>
                                        {new Date(review.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                    </Text>
                                </View>
                                {review.review && (
                                    <Text style={styles.reviewText}>"{review.review}"</Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <View style={styles.noReviewsContainer}>
                            <Ionicons name="chatbubble-outline" size={32} color="#DDD" />
                            <Text style={styles.noReviewsText}>No reviews yet</Text>
                            <Text style={styles.noReviewsSubtext}>Be the first to book and review!</Text>
                        </View>
                    )}
                </View>

                {/* Booking Form */}
                {showBooking && (
                    <View style={styles.bookingSection}>
                        <View style={styles.bookingHeader}>
                            <Text style={styles.bookingTitle}>Book Service</Text>
                            <View style={styles.stepIndicator}>
                                {[1, 2, 3].map(step => (
                                    <View
                                        key={step}
                                        style={[
                                            styles.stepDot,
                                            step <= bookingStep && { backgroundColor: config.color },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        {bookingStep === 1 && (
                            <View>
                                <Text style={styles.stepTitle}>When do you need the service?</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Select Date (YYYY-MM-DD)"
                                    placeholderTextColor="#999"
                                    value={bookingData.scheduledDate}
                                    onChangeText={(text) => setBookingData({ ...bookingData, scheduledDate: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Preferred Time (e.g., 9:00 AM)"
                                    placeholderTextColor="#999"
                                    value={bookingData.scheduledTime}
                                    onChangeText={(text) => setBookingData({ ...bookingData, scheduledTime: text })}
                                />
                            </View>
                        )}

                        {bookingStep === 2 && (
                            <View>
                                <Text style={styles.stepTitle}>Where should we come?</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your Address"
                                    placeholderTextColor="#999"
                                    value={bookingData.address}
                                    onChangeText={(text) => setBookingData({ ...bookingData, address: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="City/Area (e.g., East Legon)"
                                    placeholderTextColor="#999"
                                    value={bookingData.city}
                                    onChangeText={(text) => setBookingData({ ...bookingData, city: text })}
                                />
                            </View>
                        )}

                        {bookingStep === 3 && (
                            <View>
                                <Text style={styles.stepTitle}>Any additional details?</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe the work needed..."
                                    placeholderTextColor="#999"
                                    multiline
                                    value={bookingData.notes}
                                    onChangeText={(text) => setBookingData({ ...bookingData, notes: text })}
                                />
                            </View>
                        )}

                        <View style={styles.bookingActions}>
                            {bookingStep > 1 && (
                                <TouchableOpacity
                                    style={styles.prevButton}
                                    onPress={() => setBookingStep(bookingStep - 1)}
                                >
                                    <Text style={styles.prevButtonText}>Back</Text>
                                </TouchableOpacity>
                            )}
                            {bookingStep < 3 ? (
                                <TouchableOpacity
                                    style={[styles.nextButton, { backgroundColor: config.color }]}
                                    onPress={() => {
                                        if (validateStep()) {
                                            setBookingStep(bookingStep + 1);
                                        }
                                    }}
                                >
                                    <Text style={styles.nextButtonText}>Continue</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.confirmButton, isBooking && styles.buttonDisabled]}
                                    onPress={handleBook}
                                    disabled={isBooking}
                                >
                                    <LinearGradient
                                        colors={[config.color, `${config.color}CC`]}
                                        style={styles.confirmButtonGradient}
                                    >
                                        <Text style={styles.confirmButtonText}>
                                            {isBooking ? 'Booking...' : 'Confirm Booking'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={styles.contactButtons}>
                    <TouchableOpacity style={styles.contactButton} onPress={callProvider}>
                        <Ionicons name="call" size={22} color={config.color} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactButton} onPress={whatsappProvider}>
                        <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.bookNowButton, { backgroundColor: config.color }]}
                    onPress={() => {
                        if (showBooking) {
                            setShowBooking(false);
                            setBookingStep(1);
                        } else {
                            setShowBooking(true);
                        }
                    }}
                >
                    <Text style={styles.bookNowButtonText}>
                        {showBooking ? 'Cancel' : 'Book Now'}
                    </Text>
                    {!showBooking && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#717171',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorIconContainer: {
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    errorText: {
        fontSize: 14,
        color: '#717171',
        textAlign: 'center',
        marginTop: 8,
    },
    backButtonLarge: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 14,
        backgroundColor: '#FF6B35',
        borderRadius: 24,
    },
    backButtonLargeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerGradient: {
        paddingTop: 10,
        paddingBottom: 30,
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerRight: {
        flexDirection: 'row',
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    verifiedBadgeContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 2,
    },
    businessName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginTop: 16,
    },
    providerNameText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    ratingContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    starsRow: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 6,
    },
    reviewCountText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    statLabel: {
        fontSize: 12,
        color: '#717171',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#EAEAEA',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 20,
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
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    verificationText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 6,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceName: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },
    priceRangeCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    priceRangeLabel: {
        fontSize: 13,
        color: '#717171',
    },
    priceRangeValue: {
        fontSize: 32,
        fontWeight: '700',
        marginTop: 4,
    },
    priceRangeMax: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
    areasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    areaText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
    },
    reviewCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewerInitial: {
        fontSize: 18,
        fontWeight: '600',
    },
    reviewerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    reviewStars: {
        flexDirection: 'row',
        marginTop: 4,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginTop: 12,
        fontStyle: 'italic',
    },
    noReviewsContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    noReviewsText: {
        fontSize: 16,
        color: '#717171',
        marginTop: 12,
    },
    noReviewsSubtext: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
    bookingSection: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 20,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    bookingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    stepIndicator: {
        flexDirection: 'row',
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
        marginLeft: 6,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        marginBottom: 12,
        color: '#222',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    bookingActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    prevButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        marginRight: 12,
    },
    prevButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#717171',
    },
    nextButton: {
        flex: 2,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    confirmButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    confirmButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    contactButtons: {
        flexDirection: 'row',
        marginRight: 12,
    },
    contactButton: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    bookNowButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
    },
    bookNowButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginRight: 8,
    },
});
