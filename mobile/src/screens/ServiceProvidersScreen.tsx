import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ServiceProvider {
    id: string;
    name: string;
    businessName?: string;
    rating: number;
    reviewCount: number;
    minPrice: number;
    verified: boolean;
    completedJobs: number;
}

const PROVIDERS: ServiceProvider[] = [
    { id: '1', name: 'Kwame Asante', businessName: 'Kwame Electrical', rating: 4.8, reviewCount: 127, minPrice: 50, verified: true, completedJobs: 234 },
    { id: '2', name: 'Ama Boateng', businessName: 'Swift Electricals', rating: 4.6, reviewCount: 89, minPrice: 80, verified: true, completedJobs: 156 },
    { id: '3', name: 'Yaw Mensah', rating: 4.3, reviewCount: 45, minPrice: 40, verified: false, completedJobs: 67 },
];

export default function ServiceProvidersScreen({ navigation, route }: any) {
    const { category, title, icon } = route.params || { category: 'electrician', title: 'Electrician', icon: '⚡' };
    const [providers] = useState<ServiceProvider[]>(PROVIDERS);

    const formatPrice = (price: number) => `GH₵${price}`;

    const renderProvider = ({ item }: { item: ServiceProvider }) => (
        <TouchableOpacity
            style={styles.providerCard}
            onPress={() => navigation.navigate('ServiceProviderDetail', { id: item.id })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.providerInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.providerName}>{item.businessName || item.name}</Text>
                    {item.verified && (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.providerSubname}>{item.businessName ? item.name : ''}</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.rating}>★ {item.rating}</Text>
                    <Text style={styles.reviews}>({item.reviewCount})</Text>
                    <Text style={styles.jobs}>{item.completedJobs} jobs</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>From </Text>
                    <Text style={styles.priceAmount}>{formatPrice(item.minPrice)}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerIcon}>{icon}</Text>
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Provider Count */}
            <View style={styles.countBar}>
                <Text style={styles.countText}>
                    <Text style={styles.countNumber}>{providers.length}</Text> providers available
                </Text>
            </View>

            {/* Provider List */}
            <FlatList
                data={providers}
                renderItem={renderProvider}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerIcon: { fontSize: 24 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
    countBar: { paddingHorizontal: 20, paddingVertical: 12 },
    countText: { fontSize: 14, color: '#717171' },
    countNumber: { fontWeight: '600', color: '#222' },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    providerCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 28 },
    providerInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    providerName: { fontSize: 16, fontWeight: '600', color: '#222' },
    verifiedBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    verifiedText: { fontSize: 10, color: '#22C55E', fontWeight: '600' },
    providerSubname: { fontSize: 13, color: '#717171', marginTop: 2 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    rating: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },
    reviews: { fontSize: 12, color: '#9CA3AF' },
    jobs: { fontSize: 12, color: '#9CA3AF', marginLeft: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    priceLabel: { fontSize: 12, color: '#717171' },
    priceAmount: { fontSize: 14, fontWeight: '700', color: '#222' },
});
