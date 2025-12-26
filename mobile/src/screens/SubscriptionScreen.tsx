import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Tier {
    tier: string;
    name: string;
    price: number;
    contacts: string | number;
    duration: string;
    currency: string;
    features: string[];
}

// Ad Boost Packages for Landlords
const AD_BOOST_PACKAGES = [
    { id: 'basic', name: 'Starter', price: 20, duration: '7 days', icon: 'flash', color: '#3B82F6', features: ['Homepage featured', 'Priority search', 'Boost badge'] },
    { id: 'premium', name: 'Pro', price: 50, duration: '14 days', icon: 'rocket', color: '#8B5CF6', popular: true, features: ['All Starter', 'Social promo', 'Email feature', 'Analytics'] },
    { id: 'ultimate', name: 'Elite', price: 100, duration: '30 days', icon: 'diamond', color: '#F59E0B', features: ['All Pro', 'Top placement', 'Premium badge', 'Dedicated support'] }
];

const COMMISSION_RATE = 10;
const COMMISSION_BENEFITS = [
    { icon: 'phone-portrait', text: 'Free Listing' },
    { icon: 'mail', text: 'Direct Bookings' },
    { icon: 'chatbubbles', text: 'In-App Chat' },
    { icon: 'star', text: 'Reviews System' },
    { icon: 'shield-checkmark', text: 'Payment Protection' },
];

export default function SubscriptionScreen({ navigation }: any) {
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [userRole, setUserRole] = useState<string>('TENANT');
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'tenant' | 'landlord' | 'provider'>('tenant');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userStr = await AsyncStorage.getItem('user');

            if (userStr) {
                const user = JSON.parse(userStr);
                setUserRole(user.role || 'TENANT');
                if (user.role === 'LANDLORD') setActiveTab('landlord');
                else if (user.role === 'SERVICE_PROVIDER') setActiveTab('provider');
            }

            const tiersRes = await fetch(`${API_URL}/api/subscriptions/tiers`);
            const tiersData = await tiersRes.json();
            setTiers(tiersData.tiers || []);

            if (token) {
                const subRes = await fetch(`${API_URL}/api/subscriptions/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    setCurrentSubscription(subData.subscription);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async (tier: string) => {
        if (tier === 'FREE' || currentSubscription?.subscriptionTier === tier) return;

        setIsProcessing(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Login Required', 'Please log in to subscribe.', [
                    { text: 'Log In', onPress: () => navigation.navigate('Login') }
                ]);
                return;
            }

            const initRes = await fetch(`${API_URL}/api/subscriptions/initialize-payment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });

            const initData = await initRes.json();

            if (initData.devMode) {
                Alert.alert('Complete Payment', `Pay GH₵${initData.amount} for ${tier}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Pay Now',
                        onPress: async () => {
                            const res = await fetch(`${API_URL}/api/subscriptions/dev-complete`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ tier, reference: initData.reference }),
                            });
                            if (res.ok) {
                                Alert.alert('🎉 Success!', 'Subscription activated!', [{ text: 'OK', onPress: loadData }]);
                            }
                        },
                    },
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Payment failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const getTierGradient = (tier: string): [string, string] => {
        switch (tier) {
            case 'SUPERUSER': return ['#FFD700', '#FF8C00'];
            case 'RELAX': return ['#8B5CF6', '#EC4899'];
            case 'BASIC': return ['#3B82F6', '#06B6D4'];
            default: return ['#6B7280', '#374151'];
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient colors={['#0a0a0f', '#1a1a2e']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Pricing</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    {/* Hero */}
                    <View style={styles.heroSection}>
                        <View style={styles.badge}>
                            <View style={styles.badgeDot} />
                            <Text style={styles.badgeText}>Simple & Transparent</Text>
                        </View>
                        <Text style={styles.heroTitle}>Choose Your Perfect Plan</Text>
                        <Text style={styles.heroSubtitle}>No hidden fees. Cancel anytime.</Text>
                    </View>

                    {/* Role Tabs */}
                    <View style={styles.tabsContainer}>
                        <View style={styles.tabsWrapper}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'tenant' && styles.tabActive]}
                                onPress={() => setActiveTab('tenant')}
                            >
                                <LinearGradient
                                    colors={activeTab === 'tenant' ? ['#3B82F6', '#06B6D4'] : ['transparent', 'transparent']}
                                    style={styles.tabGradient}
                                >
                                    <Text style={[styles.tabText, activeTab === 'tenant' && styles.tabTextActive]}>🏠 Tenant</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'landlord' && styles.tabActive]}
                                onPress={() => setActiveTab('landlord')}
                            >
                                <LinearGradient
                                    colors={activeTab === 'landlord' ? ['#8B5CF6', '#EC4899'] : ['transparent', 'transparent']}
                                    style={styles.tabGradient}
                                >
                                    <Text style={[styles.tabText, activeTab === 'landlord' && styles.tabTextActive]}>🏢 Landlord</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'provider' && styles.tabActive]}
                                onPress={() => setActiveTab('provider')}
                            >
                                <LinearGradient
                                    colors={activeTab === 'provider' ? ['#10B981', '#059669'] : ['transparent', 'transparent']}
                                    style={styles.tabGradient}
                                >
                                    <Text style={[styles.tabText, activeTab === 'provider' && styles.tabTextActive]}>🔧 Provider</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ============ TENANT VIEW ============ */}
                    {activeTab === 'tenant' && (
                        <View style={styles.content}>
                            <Text style={styles.sectionTitle}>Subscription Plans</Text>
                            <Text style={styles.sectionSubtitle}>Unlock landlord contacts</Text>

                            {tiers.map((tier) => {
                                const isCurrent = currentSubscription?.subscriptionTier === tier.tier;
                                const isPopular = tier.tier === 'RELAX';

                                return (
                                    <View key={tier.tier} style={[styles.planCard, isPopular && styles.planCardPopular]}>
                                        {isPopular && (
                                            <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.popularBadge}>
                                                <Text style={styles.popularText}>POPULAR</Text>
                                            </LinearGradient>
                                        )}

                                        <View style={styles.planHeader}>
                                            <LinearGradient colors={getTierGradient(tier.tier)} style={styles.planIcon}>
                                                <Ionicons name={tier.tier === 'SUPERUSER' ? 'diamond' : tier.tier === 'RELAX' ? 'rocket' : 'star'} size={24} color="#fff" />
                                            </LinearGradient>
                                            <View style={styles.planInfo}>
                                                <Text style={styles.planName}>{tier.name}</Text>
                                                {isCurrent && (
                                                    <View style={styles.currentTag}>
                                                        <Text style={styles.currentTagText}>CURRENT</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.priceRow}>
                                            <Text style={styles.currency}>{tier.currency}</Text>
                                            <Text style={styles.price}>{tier.price}</Text>
                                            <Text style={styles.period}>/{tier.duration}</Text>
                                        </View>

                                        <View style={styles.contactsBadge}>
                                            <Ionicons name="call" size={16} color="#3B82F6" />
                                            <Text style={styles.contactsText}>{tier.contacts} contacts/month</Text>
                                        </View>

                                        <View style={styles.features}>
                                            {tier.features?.map((f, i) => (
                                                <View key={i} style={styles.featureRow}>
                                                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                                    <Text style={styles.featureText}>{f}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {!isCurrent && tier.tier !== 'FREE' && (
                                            <TouchableOpacity onPress={() => handleSubscribe(tier.tier)} disabled={isProcessing}>
                                                <LinearGradient
                                                    colors={isPopular ? ['#FF6B35', '#F7931E'] : ['#3B82F6', '#06B6D4']}
                                                    style={styles.subscribeButton}
                                                >
                                                    {isProcessing ? (
                                                        <ActivityIndicator color="#fff" />
                                                    ) : (
                                                        <Text style={styles.subscribeButtonText}>Subscribe</Text>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* ============ LANDLORD VIEW ============ */}
                    {activeTab === 'landlord' && (
                        <View style={styles.content}>
                            <Text style={styles.sectionTitle}>Property Boosts</Text>
                            <Text style={styles.sectionSubtitle}>Get more visibility</Text>

                            {AD_BOOST_PACKAGES.map((pkg) => (
                                <View key={pkg.id} style={[styles.planCard, pkg.popular && styles.planCardPopular]}>
                                    {pkg.popular && (
                                        <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.popularBadge}>
                                            <Text style={styles.popularText}>BEST VALUE</Text>
                                        </LinearGradient>
                                    )}

                                    <View style={styles.planHeader}>
                                        <LinearGradient colors={[pkg.color, pkg.color + '99']} style={styles.planIcon}>
                                            <Ionicons name={pkg.icon as any} size={24} color="#fff" />
                                        </LinearGradient>
                                        <View style={styles.planInfo}>
                                            <Text style={styles.planName}>{pkg.name}</Text>
                                            <Text style={styles.durationText}>{pkg.duration}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.priceRow}>
                                        <Text style={styles.currency}>GH₵</Text>
                                        <Text style={[styles.price, { color: pkg.color }]}>{pkg.price}</Text>
                                    </View>

                                    <View style={styles.features}>
                                        {pkg.features.map((f, i) => (
                                            <View key={i} style={styles.featureRow}>
                                                <Ionicons name="checkmark-circle" size={18} color={pkg.color} />
                                                <Text style={styles.featureText}>{f}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <TouchableOpacity>
                                        <LinearGradient colors={[pkg.color, pkg.color + 'CC']} style={styles.subscribeButton}>
                                            <Text style={styles.subscribeButtonText}>Boost Now</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* ============ PROVIDER VIEW ============ */}
                    {activeTab === 'provider' && (
                        <View style={styles.content}>
                            {/* Commission Card */}
                            <LinearGradient colors={['#10B981', '#059669']} style={styles.commissionCard}>
                                <Text style={styles.commissionLabel}>Platform Commission</Text>
                                <Text style={styles.commissionRate}>{COMMISSION_RATE}%</Text>
                                <Text style={styles.commissionDesc}>Only on completed jobs</Text>
                            </LinearGradient>

                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Free Benefits</Text>

                            <View style={styles.benefitsGrid}>
                                {COMMISSION_BENEFITS.map((b, i) => (
                                    <View key={i} style={styles.benefitCard}>
                                        <View style={styles.benefitIcon}>
                                            <Ionicons name={b.icon as any} size={24} color="#10B981" />
                                        </View>
                                        <Text style={styles.benefitText}>{b.text}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* How It Works */}
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>How It Works</Text>
                            <View style={styles.stepsRow}>
                                <View style={styles.stepCard}>
                                    <Text style={styles.stepEmoji}>📱</Text>
                                    <Text style={styles.stepTitle}>Get Booked</Text>
                                </View>
                                <View style={styles.stepCard}>
                                    <Text style={styles.stepEmoji}>🔧</Text>
                                    <Text style={styles.stepTitle}>Do Job</Text>
                                </View>
                                <View style={styles.stepCard}>
                                    <Text style={styles.stepEmoji}>💰</Text>
                                    <Text style={styles.stepTitle}>Get 90%</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    heroSection: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 8 },
    badgeText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
    heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
    tabsContainer: { paddingHorizontal: 16, marginBottom: 24 },
    tabsWrapper: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4 },
    tab: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    tabActive: {},
    tabGradient: { paddingVertical: 12, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    tabTextActive: { color: '#fff' },
    content: { paddingHorizontal: 16 },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
    sectionSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 },
    planCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    planCardPopular: { borderColor: '#FF6B35', borderWidth: 2 },
    popularBadge: { position: 'absolute', top: -12, right: 20, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    popularText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
    planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    planIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    planInfo: { marginLeft: 14, flex: 1 },
    planName: { fontSize: 20, fontWeight: '700', color: '#fff' },
    durationText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    currentTag: { backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
    currentTagText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    currency: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    price: { fontSize: 40, fontWeight: '800', color: '#fff', marginLeft: 4 },
    period: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 4 },
    contactsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 16 },
    contactsText: { fontSize: 14, fontWeight: '600', color: '#3B82F6', marginLeft: 8 },
    features: { marginBottom: 16 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    featureText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginLeft: 10 },
    subscribeButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    subscribeButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    commissionCard: { borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 8 },
    commissionLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
    commissionRate: { fontSize: 72, fontWeight: '800', color: '#fff', marginVertical: 8 },
    commissionDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
    benefitCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, margin: 4, alignItems: 'center' },
    benefitIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    benefitText: { fontSize: 13, fontWeight: '600', color: '#fff', textAlign: 'center' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center' },
    stepEmoji: { fontSize: 28, marginBottom: 8 },
    stepTitle: { fontSize: 12, fontWeight: '600', color: '#fff', textAlign: 'center' },
});
