import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Linking,
    Modal,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Booking {
    id: string;
    serviceType: string;
    scheduledDate: string;
    scheduledTime?: string;
    address: string;
    city: string;
    status: string;
    notes?: string;
    rating?: number;
    review?: string;
    provider: {
        id: string;
        businessName: string;
        serviceType: string;
        user?: { phone: string; fullName: string };
    };
    createdAt: string;
    completedAt?: string;
}

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    PENDING: { bg: '#FFF3E0', text: '#E65100', icon: 'time-outline', label: 'Pending' },
    CONFIRMED: { bg: '#E3F2FD', text: '#1565C0', icon: 'checkmark-circle-outline', label: 'Confirmed' },
    IN_PROGRESS: { bg: '#FFF8E1', text: '#F9A825', icon: 'hammer-outline', label: 'In Progress' },
    COMPLETED: { bg: '#E8F5E9', text: '#2E7D32', icon: 'checkmark-done-outline', label: 'Completed' },
    CANCELLED: { bg: '#FFEBEE', text: '#C62828', icon: 'close-circle-outline', label: 'Cancelled' },
};

const SERVICE_CONFIG: Record<string, { icon: string; color: string }> = {
    ELECTRICIAN: { icon: 'flash', color: '#FFA000' },
    PLUMBER: { icon: 'water', color: '#2196F3' },
    PAINTER: { icon: 'color-palette', color: '#9C27B0' },
    CLEANER: { icon: 'sparkles', color: '#4CAF50' },
    AC_TECHNICIAN: { icon: 'snow', color: '#00BCD4' },
    CARPENTER: { icon: 'build', color: '#795548' },
    PACKERS_MOVERS: { icon: 'car', color: '#FF6B35' },
    TILER: { icon: 'grid', color: '#607D8B' },
    MASON: { icon: 'construct', color: '#8D6E63' },
    GENERAL_HANDYMAN: { icon: 'hammer', color: '#455A64' },
};

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'IN_PROGRESS', label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
];

export default function MyBookingsScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [activeFilter, bookings]);

    const filterBookings = () => {
        if (activeFilter === 'ALL') {
            setFilteredBookings(bookings);
        } else {
            setFilteredBookings(bookings.filter(b => b.status === activeFilter));
        }
    };

    const fetchBookings = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                setError('Please log in to view your bookings');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/services/bookings/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch bookings');
            }

            // Sort by date descending
            const sorted = (data.bookings || []).sort(
                (a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setBookings(sorted);
            setError('');
        } catch (err: any) {
            console.error('Fetch bookings error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleCancel = async (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('authToken');
                            const response = await fetch(`${API_URL}/api/services/bookings/${bookingId}/status`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({ status: 'CANCELLED' }),
                            });

                            if (!response.ok) {
                                throw new Error('Failed to cancel booking');
                            }

                            Alert.alert('Cancelled', 'Your booking has been cancelled.');
                            fetchBookings();
                        } catch (err: any) {
                            Alert.alert('Error', err.message);
                        }
                    },
                },
            ]
        );
    };

    const handleReview = (booking: Booking) => {
        setSelectedBooking(booking);
        setReviewRating(5);
        setReviewText('');
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!selectedBooking) return;

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/api/services/bookings/${selectedBooking.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating: reviewRating,
                    review: reviewText,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            Alert.alert('Thank You!', 'Your review has been submitted.');
            setShowReviewModal(false);
            fetchBookings();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const callProvider = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const formatFullDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const getServiceConfig = (serviceType: string) => {
        return SERVICE_CONFIG[serviceType] || { icon: 'construct', color: '#757575' };
    };

    const getBookingStats = () => {
        const pending = bookings.filter(b => b.status === 'PENDING').length;
        const active = bookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
        const completed = bookings.filter(b => b.status === 'COMPLETED').length;
        return { pending, active, completed, total: bookings.length };
    };

    const stats = getBookingStats();

    const renderBooking = ({ item }: { item: Booking }) => {
        const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
        const serviceConfig = getServiceConfig(item.serviceType);
        const canCancel = ['PENDING', 'CONFIRMED'].includes(item.status);
        const canReview = item.status === 'COMPLETED' && !item.rating;
        const hasReview = item.status === 'COMPLETED' && item.rating;

        return (
            <View style={styles.bookingCard}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
                    <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.text} />
                    <Text style={[styles.statusBannerText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                    </Text>
                    <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
                </View>

                {/* Main Content */}
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.serviceIcon, { backgroundColor: `${serviceConfig.color}15` }]}>
                            <Ionicons name={serviceConfig.icon as any} size={24} color={serviceConfig.color} />
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.providerName}>{item.provider.businessName}</Text>
                            <Text style={styles.serviceType}>
                                {item.serviceType.replace(/_/g, ' ')}
                            </Text>
                        </View>
                        {item.provider.user?.phone && (
                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={() => callProvider(item.provider.user!.phone)}
                            >
                                <Ionicons name="call" size={18} color="#4CAF50" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Schedule Info */}
                    <View style={styles.scheduleInfo}>
                        <View style={styles.scheduleItem}>
                            <Ionicons name="calendar-outline" size={16} color="#717171" />
                            <Text style={styles.scheduleText}>{formatDate(item.scheduledDate)}</Text>
                        </View>
                        {item.scheduledTime && (
                            <View style={styles.scheduleItem}>
                                <Ionicons name="time-outline" size={16} color="#717171" />
                                <Text style={styles.scheduleText}>{item.scheduledTime}</Text>
                            </View>
                        )}
                        <View style={styles.scheduleItem}>
                            <Ionicons name="location-outline" size={16} color="#717171" />
                            <Text style={styles.scheduleText} numberOfLines={1}>{item.city}</Text>
                        </View>
                    </View>

                    {/* Notes */}
                    {item.notes && (
                        <View style={styles.notesContainer}>
                            <Text style={styles.notesLabel}>Notes:</Text>
                            <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
                        </View>
                    )}

                    {/* Review Display */}
                    {hasReview && (
                        <View style={styles.reviewDisplay}>
                            <View style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Ionicons
                                        key={star}
                                        name="star"
                                        size={14}
                                        color={star <= (item.rating || 0) ? '#FFB800' : '#E0E0E0'}
                                    />
                                ))}
                                <Text style={styles.ratingValue}>{item.rating}/5</Text>
                            </View>
                            {item.review && (
                                <Text style={styles.reviewText} numberOfLines={2}>
                                    "{item.review}"
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Actions */}
                    {(canCancel || canReview) && (
                        <View style={styles.cardActions}>
                            {canCancel && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => handleCancel(item.id)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                            {canReview && (
                                <TouchableOpacity
                                    style={styles.reviewButton}
                                    onPress={() => handleReview(item)}
                                >
                                    <Ionicons name="star-outline" size={16} color="#fff" />
                                    <Text style={styles.reviewButtonText}>Leave Review</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Loading your bookings...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.title}>My Bookings</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={fetchBookings}>
                    <Ionicons name="refresh" size={22} color="#717171" />
                </TouchableOpacity>
            </View>

            {/* Stats Bar */}
            {bookings.length > 0 && (
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.active}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completed}</Text>
                        <Text style={styles.statLabel}>Done</Text>
                    </View>
                </View>
            )}

            {/* Filter Tabs */}
            {bookings.length > 0 && (
                <View style={styles.filterContainer}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={FILTERS}
                        keyExtractor={(item) => item.key}
                        contentContainerStyle={styles.filterList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.filterTab,
                                    activeFilter === item.key && styles.filterTabActive,
                                ]}
                                onPress={() => setActiveFilter(item.key)}
                            >
                                <Text
                                    style={[
                                        styles.filterTabText,
                                        activeFilter === item.key && styles.filterTabTextActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Content */}
            {error ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
                    </View>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : filteredBookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="calendar-outline" size={48} color="#DDD" />
                    </View>
                    <Text style={styles.emptyTitle}>
                        {activeFilter === 'ALL' ? 'No Bookings Yet' : `No ${activeFilter.toLowerCase()} bookings`}
                    </Text>
                    <Text style={styles.emptyText}>
                        {activeFilter === 'ALL'
                            ? 'Book a home service to see it here'
                            : 'Try selecting a different filter'
                        }
                    </Text>
                    {activeFilter === 'ALL' && (
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Services' })}
                        >
                            <Text style={styles.browseButtonText}>Browse Services</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchBookings();
                            }}
                            tintColor="#FF6B35"
                            colors={['#FF6B35']}
                        />
                    }
                />
            )}

            {/* Review Modal */}
            <Modal
                visible={showReviewModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowReviewModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rate Your Experience</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <Ionicons name="close" size={24} color="#717171" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            How was your service with {selectedBooking?.provider.businessName}?
                        </Text>

                        {/* Star Rating */}
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setReviewRating(star)}
                                >
                                    <Ionicons
                                        name={star <= reviewRating ? 'star' : 'star-outline'}
                                        size={40}
                                        color={star <= reviewRating ? '#FFB800' : '#E0E0E0'}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.ratingLabel}>
                            {reviewRating === 5 ? 'Excellent!' :
                                reviewRating === 4 ? 'Very Good' :
                                    reviewRating === 3 ? 'Good' :
                                        reviewRating === 2 ? 'Fair' : 'Poor'}
                        </Text>

                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share your experience (optional)"
                            placeholderTextColor="#999"
                            multiline
                            value={reviewText}
                            onChangeText={setReviewText}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            onPress={submitReview}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={['#FF6B35', '#F7931E']}
                                style={styles.submitButtonGradient}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
    },
    statLabel: {
        fontSize: 12,
        color: '#717171',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#EAEAEA',
    },
    filterContainer: {
        backgroundColor: '#fff',
        paddingBottom: 12,
    },
    filterList: {
        paddingHorizontal: 16,
    },
    filterTab: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: '#FF6B35',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#717171',
    },
    filterTabTextActive: {
        color: '#fff',
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
    listContent: {
        padding: 16,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    statusBannerText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
        flex: 1,
    },
    timeAgo: {
        fontSize: 11,
        color: '#999',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },
    serviceType: {
        fontSize: 13,
        color: '#717171',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    callButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    scheduleText: {
        fontSize: 13,
        color: '#555',
        marginLeft: 6,
    },
    notesContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#717171',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
    reviewDisplay: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFF9E6',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    ratingStars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#222',
        marginLeft: 8,
    },
    reviewText: {
        fontSize: 13,
        color: '#555',
        fontStyle: 'italic',
        marginTop: 6,
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
        borderRadius: 10,
        backgroundColor: '#FFF5F5',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#C62828',
        fontWeight: '600',
        fontSize: 14,
    },
    reviewButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF6B35',
        borderRadius: 10,
    },
    reviewButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    emptyText: {
        fontSize: 14,
        color: '#717171',
        textAlign: 'center',
        marginTop: 8,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    errorText: {
        fontSize: 14,
        color: '#FF9800',
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: '#FF6B35',
        borderRadius: 24,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    browseButton: {
        marginTop: 20,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: '#FF6B35',
        borderRadius: 24,
    },
    browseButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#717171',
        marginBottom: 24,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    starIcon: {
        marginHorizontal: 6,
    },
    ratingLabel: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 24,
    },
    reviewInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
