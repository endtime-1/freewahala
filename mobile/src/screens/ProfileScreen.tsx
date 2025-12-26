import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
    id: string;
    phone: string;
    fullName: string | null;
    email: string | null;
    role: 'TENANT' | 'LANDLORD';
    ghanaCardVerified: boolean;
    profileImageUrl: string | null;
    freeContactsRemaining: number;
    subscriptionTier: string;
    subscriptionExpiresAt: string | null;
    createdAt: string;
}

interface SubscriptionInfo {
    subscriptionTier: string;
    subscriptionExpiresAt: string | null;
    freeContactsRemaining: number;
    isActive: boolean;
    tierDetails: {
        name: string;
        price: number;
        contacts: number | string;
        features: string[];
    };
}

const MENU_SECTIONS = [
    {
        title: 'My Activity',
        items: [
            { id: 'listings', title: 'My Listings', icon: 'home-outline', screen: 'MyListings', badge: null },
            { id: 'unlocked', title: 'Unlocked Contacts', icon: 'call-outline', screen: 'UnlockedContacts', badge: null },
            { id: 'bookings', title: 'My Bookings', icon: 'calendar-outline', screen: 'MyBookings', badge: null },
            { id: 'agreements', title: 'My Agreements', icon: 'document-text-outline', screen: 'Agreements', badge: null },
            { id: 'favorites', title: 'Saved Properties', icon: 'heart-outline', screen: 'Favorites', badge: null },
        ],
    },
    {
        title: 'Account',
        items: [
            { id: 'edit', title: 'Edit Profile', icon: 'person-outline', screen: 'EditProfile', badge: null },
            { id: 'verify', title: 'Verify Ghana Card', icon: 'shield-checkmark-outline', screen: 'Verify', badge: 'NEW' },
            { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', screen: 'Notifications', badge: null },
        ],
    },
    {
        title: 'Support',
        items: [
            { id: 'help', title: 'Help Center', icon: 'help-circle-outline', screen: 'Help', badge: null },
            { id: 'report', title: 'Report an Issue', icon: 'warning-outline', screen: 'Report', badge: null },
            { id: 'rate', title: 'Rate Our App', icon: 'star-outline', screen: 'Rate', badge: null },
        ],
    },
    {
        title: 'Legal',
        items: [
            { id: 'privacy', title: 'Privacy Policy', icon: 'lock-closed-outline', screen: 'Privacy', badge: null },
            { id: 'terms', title: 'Terms of Service', icon: 'document-outline', screen: 'Terms', badge: null },
        ],
    },
];

export default function ProfileScreen({ navigation }: any) {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const loadUserData = useCallback(async () => {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken) {
                setToken(storedToken);

                // Fetch fresh user data
                const [profileRes, subscriptionRes] = await Promise.all([
                    fetch(`${API_URL}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    }),
                    fetch(`${API_URL}/api/subscriptions/my`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    })
                ]);

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUser(profileData.user);
                    await AsyncStorage.setItem('user', JSON.stringify(profileData.user));
                } else if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                if (subscriptionRes.ok) {
                    const subData = await subscriptionRes.json();
                    setSubscription(subData.subscription);
                }
            } else if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Try to load from cache
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    useEffect(() => {
        const unsubscribe = navigation?.addListener?.('focus', () => {
            loadUserData();
        });
        return unsubscribe;
    }, [navigation, loadUserData]);

    const onRefresh = () => {
        setIsRefreshing(true);
        loadUserData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out of your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.multiRemove(['authToken', 'user']);
                        setUser(null);
                        setToken(null);
                        setSubscription(null);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    },
                },
            ]
        );
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleUpgrade = () => {
        navigation.navigate('Subscription');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getContactsPercentage = () => {
        if (!subscription) return 100;
        const total = typeof subscription.tierDetails.contacts === 'number'
            ? subscription.tierDetails.contacts
            : 999;
        const remaining = subscription.freeContactsRemaining || 0;
        return Math.min((remaining / total) * 100, 100);
    };

    const getTierColor = (tier: string): [string, string] => {
        switch (tier) {
            case 'SUPERUSER': return ['#FFD700', '#FFA500'];
            case 'RELAX': return ['#8B5CF6', '#6366F1'];
            case 'BASIC': return ['#3B82F6', '#2563EB'];
            default: return ['#6B7280', '#4B5563'];
        }
    };

    const getDaysRemaining = () => {
        if (!subscription?.subscriptionExpiresAt) return 0;
        const expires = new Date(subscription.subscriptionExpiresAt);
        const now = new Date();
        const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Profile Card */}
                {user ? (
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            {user.profileImageUrl ? (
                                <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
                            ) : (
                                <LinearGradient
                                    colors={['#FF6B35', '#F7931E']}
                                    style={styles.avatarPlaceholder}
                                >
                                    <Text style={styles.avatarText}>
                                        {(user.fullName || user.phone)?.[0]?.toUpperCase() || 'U'}
                                    </Text>
                                </LinearGradient>
                            )}
                            {user.ghanaCardVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                </View>
                            )}
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>
                                {user.fullName || 'FreeWahala User'}
                            </Text>
                            <Text style={styles.userPhone}>{user.phone}</Text>
                            <View style={styles.roleBadge}>
                                <Ionicons
                                    name={user.role === 'LANDLORD' ? 'key' : 'home'}
                                    size={12}
                                    color="#FF6B35"
                                />
                                <Text style={styles.roleText}>{user.role}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Ionicons name="pencil" size={18} color="#FF6B35" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.guestCard}>
                        <View style={styles.guestAvatarContainer}>
                            <Ionicons name="person-circle-outline" size={60} color="#CCC" />
                        </View>
                        <Text style={styles.guestTitle}>Welcome to FreeWahala</Text>
                        <Text style={styles.guestSubtitle}>
                            Log in to access all features and manage your account
                        </Text>
                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <LinearGradient
                                colors={['#FF6B35', '#F7931E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginButtonGradient}
                            >
                                <Ionicons name="log-in-outline" size={20} color="#fff" />
                                <Text style={styles.loginButtonText}>Log In</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Subscription Card */}
                {user && (
                    <View style={styles.subscriptionCard}>
                        <View style={styles.subscriptionHeader}>
                            <View style={styles.tierBadgeContainer}>
                                <LinearGradient
                                    colors={getTierColor(subscription?.subscriptionTier || 'FREE')}
                                    style={styles.tierBadge}
                                >
                                    <Ionicons
                                        name={subscription?.subscriptionTier === 'SUPERUSER' ? 'diamond' : 'star'}
                                        size={14}
                                        color="#fff"
                                    />
                                    <Text style={styles.tierText}>
                                        {subscription?.tierDetails?.name || 'Free'}
                                    </Text>
                                </LinearGradient>
                            </View>
                            {subscription?.subscriptionTier !== 'SUPERUSER' && (
                                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                                    <Ionicons name="arrow-forward" size={14} color="#FF6B35" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.contactsSection}>
                            <View style={styles.contactsInfo}>
                                <Text style={styles.contactsLabel}>Contacts Remaining</Text>
                                <Text style={styles.contactsValue}>
                                    {subscription?.freeContactsRemaining || 0}
                                    <Text style={styles.contactsTotal}>
                                        /{typeof subscription?.tierDetails?.contacts === 'number'
                                            ? subscription.tierDetails.contacts
                                            : '∞'}
                                    </Text>
                                </Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        { width: `${getContactsPercentage()}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        {subscription?.isActive && (
                            <View style={styles.renewalInfo}>
                                <Ionicons name="calendar-outline" size={14} color="#717171" />
                                <Text style={styles.renewalText}>
                                    Renews in {getDaysRemaining()} days
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Quick Stats */}
                {user && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="eye-outline" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Viewed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="call-outline" size={20} color="#2196F3" />
                            </View>
                            <Text style={styles.statNumber}>
                                {3 - (subscription?.freeContactsRemaining || 0)}
                            </Text>
                            <Text style={styles.statLabel}>Unlocked</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Ionicons name="calendar-outline" size={20} color="#FF9800" />
                            </View>
                            <Text style={styles.statNumber}>2</Text>
                            <Text style={styles.statLabel}>Bookings</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#FCE4EC' }]}>
                                <Ionicons name="heart-outline" size={20} color="#E91E63" />
                            </View>
                            <Text style={styles.statNumber}>8</Text>
                            <Text style={styles.statLabel}>Saved</Text>
                        </View>
                    </View>
                )}

                {/* Menu Sections */}
                {MENU_SECTIONS.map((section, sectionIndex) => (
                    <View key={section.title} style={styles.menuSection}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        index === section.items.length - 1 && styles.menuItemLast,
                                    ]}
                                    onPress={() => {
                                        if (item.screen === 'MyBookings') {
                                            navigation.navigate('MyBookings');
                                        }
                                    }}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={styles.menuIconContainer}>
                                            <Ionicons name={item.icon as any} size={20} color="#555" />
                                        </View>
                                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                                    </View>
                                    <View style={styles.menuItemRight}>
                                        {item.badge && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{item.badge}</Text>
                                            </View>
                                        )}
                                        <Ionicons name="chevron-forward" size={18} color="#CCC" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                {user && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                )}

                {/* Version & Footer */}
                <View style={styles.footer}>
                    <Text style={styles.appName}>FreeWahala</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                    {user && (
                        <Text style={styles.memberSince}>
                            Member since {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                        </Text>
                    )}
                </View>
            </ScrollView>
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#222',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    userPhone: {
        fontSize: 14,
        color: '#717171',
        marginTop: 2,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B35',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 24,
        borderRadius: 16,
    },
    guestAvatarContainer: {
        marginBottom: 16,
    },
    guestTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    guestSubtitle: {
        fontSize: 14,
        color: '#717171',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    loginButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    subscriptionCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tierBadgeContainer: {},
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tierText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 6,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    upgradeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
        marginRight: 4,
    },
    contactsSection: {
        marginTop: 16,
    },
    contactsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    contactsLabel: {
        fontSize: 14,
        color: '#717171',
    },
    contactsValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
    },
    contactsTotal: {
        fontSize: 14,
        fontWeight: '400',
        color: '#717171',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#EAEAEA',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF6B35',
        borderRadius: 3,
    },
    renewalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    renewalText: {
        fontSize: 12,
        color: '#717171',
        marginLeft: 6,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    statLabel: {
        fontSize: 11,
        color: '#717171',
        marginTop: 2,
    },
    menuSection: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#717171',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemTitle: {
        fontSize: 15,
        color: '#222',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE5E5',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingBottom: 50,
    },
    appName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF6B35',
    },
    version: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    memberSince: {
        fontSize: 11,
        color: '#BBB',
        marginTop: 8,
    },
});
