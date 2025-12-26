import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface UnlockedContact {
    id: string;
    propertyTitle: string;
    location: string;
    price: number;
    image: string;
    ownerName: string;
    ownerPhone: string;
    verified: boolean;
    unlockedAt: string;
}

const MOCK_CONTACTS: UnlockedContact[] = [
    {
        id: '1',
        propertyTitle: 'Modern 2 Bedroom Apartment',
        location: 'East Legon, Accra',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
        ownerName: 'Kofi Mensah',
        ownerPhone: '+233241234567',
        verified: true,
        unlockedAt: '2024-12-20',
    },
    {
        id: '2',
        propertyTitle: 'Spacious Chamber and Hall',
        location: 'Madina, Accra',
        price: 800,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
        ownerName: 'Ama Serwaa',
        ownerPhone: '+233559876543',
        verified: false,
        unlockedAt: '2024-12-18',
    },
];

export default function UnlockedContactsScreen({ navigation }: any) {
    const [contacts] = useState<UnlockedContact[]>(MOCK_CONTACTS);
    const contactsRemaining = 1;

    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const renderContact = ({ item }: { item: UnlockedContact }) => (
        <View style={styles.contactCard}>
            <Image source={{ uri: item.image }} style={styles.propertyImage} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={styles.locationRow}>
                        <Text style={styles.location}>{item.location}</Text>
                        {item.verified && (
                            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                        )}
                    </View>
                    <Text style={styles.price}>GH₵{formatPrice(item.price)}/mo</Text>
                </View>
                <Text style={styles.propertyTitle} numberOfLines={1}>{item.propertyTitle}</Text>

                <View style={styles.ownerRow}>
                    <View style={styles.ownerInfo}>
                        <Ionicons name="person-circle" size={24} color="#D1D5DB" />
                        <Text style={styles.ownerName}>{item.ownerName}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(item.ownerPhone)}
                    >
                        <Ionicons name="call" size={18} color="#fff" />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Unlocked Contacts</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Contacts Remaining */}
            <View style={styles.remainingBanner}>
                <View>
                    <Text style={styles.remainingLabel}>Free contacts remaining</Text>
                    <View style={styles.remainingCount}>
                        <Text style={styles.remainingNumber}>{contactsRemaining}</Text>
                        <Text style={styles.remainingTotal}> of 3</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.upgradeButton}>
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
            </View>

            {/* Contacts List */}
            {contacts.length > 0 ? (
                <FlatList
                    data={contacts}
                    renderItem={renderContact}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="call-outline" size={64} color="#E5E5E5" />
                    <Text style={styles.emptyTitle}>No contacts unlocked</Text>
                    <Text style={styles.emptySubtitle}>
                        Unlock owner contacts to connect directly
                    </Text>
                </View>
            )}
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
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
    remainingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 20,
        padding: 20,
        backgroundColor: '#FFF5F6',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFE4E8',
    },
    remainingLabel: { fontSize: 13, color: '#717171' },
    remainingCount: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
    remainingNumber: { fontSize: 32, fontWeight: '700', color: '#FF385C' },
    remainingTotal: { fontSize: 16, color: '#717171' },
    upgradeButton: {
        backgroundColor: '#FF385C',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    upgradeButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    contactCard: {
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
    propertyImage: { width: '100%', height: 140 },
    cardContent: { padding: 16 },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    location: { fontSize: 15, fontWeight: '600', color: '#222' },
    price: { fontSize: 15, fontWeight: '700', color: '#FF385C' },
    propertyTitle: { fontSize: 13, color: '#717171', marginTop: 4, marginBottom: 12 },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    ownerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ownerName: { fontSize: 14, fontWeight: '500', color: '#222' },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#22C55E',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    callButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#222', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#717171', marginTop: 8, textAlign: 'center' },
});
