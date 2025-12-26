import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PremiumModal from '../components/PremiumModal';

const { width } = Dimensions.get('window');

const PROPERTY = {
    id: '1',
    title: 'Modern 2 Bedroom Apartment in East Legon',
    description: 'Beautiful and spacious 2-bedroom apartment located in the heart of East Legon. This newly renovated property features modern finishes throughout.',
    price: 3500,
    location: 'East Legon, Accra',
    advancePeriod: '1 year',
    images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    amenities: [
        { icon: 'flash', label: 'Self Meter' },
        { icon: 'shield-checkmark', label: 'Walled & Gated' },
        { icon: 'home', label: 'No Landlord' },
        { icon: 'sparkles', label: 'Newly Built' },
        { icon: 'car', label: 'Parking' },
    ],
    priceTag: 'GREAT_VALUE',
    verified: true,
    owner: {
        name: 'Kofi Mensah',
        verified: true,
        memberSince: '2023',
        phone: '+233241234567',
    },
};

export default function PropertyDetailScreen({ navigation, route }: any) {
    const [currentImage, setCurrentImage] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [contactUnlocked, setContactUnlocked] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const contactsRemaining = 1;

    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);

    const handleUnlockContact = () => {
        if (contactsRemaining <= 0) {
            setShowPremiumModal(true);
            return;
        }
        setContactUnlocked(true);
    };

    const handleCall = () => {
        Linking.openURL(`tel:${PROPERTY.owner.phone}`);
    };

    const handleSelectPlan = (planId: string) => {
        setShowPremiumModal(false);
        // Navigate to payment
        console.log('Selected plan:', planId);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImage(idx);
                        }}
                    >
                        {PROPERTY.images.map((img, idx) => (
                            <Image key={idx} source={{ uri: img }} style={styles.image} />
                        ))}
                    </ScrollView>

                    {/* Back Button */}
                    <SafeAreaView style={styles.headerOverlay}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#222" />
                        </TouchableOpacity>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-outline" size={24} color="#222" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => setIsFavorited(!isFavorited)}
                            >
                                <Ionicons
                                    name={isFavorited ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={isFavorited ? '#FF385C' : '#222'}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Image Indicator */}
                    <View style={styles.imageIndicator}>
                        {PROPERTY.images.map((_, idx) => (
                            <View
                                key={idx}
                                style={[styles.dot, currentImage === idx && styles.dotActive]}
                            />
                        ))}
                    </View>

                    {/* Price Tag */}
                    {PROPERTY.priceTag === 'GREAT_VALUE' && (
                        <View style={styles.priceTag}>
                            <Text style={styles.priceTagText}>✓ Great Value</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title & Location */}
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.location}>{PROPERTY.location}</Text>
                            <Text style={styles.title}>{PROPERTY.title}</Text>
                        </View>
                        {PROPERTY.verified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        )}
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.currency}>GH₵</Text>
                        <Text style={styles.priceAmount}>{formatPrice(PROPERTY.price)}</Text>
                        <Text style={styles.pricePeriod}>/month</Text>
                        <Text style={styles.advancePeriod}>• {PROPERTY.advancePeriod} advance</Text>
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {PROPERTY.amenities.map((amenity, idx) => (
                                <View key={idx} style={styles.amenityItem}>
                                    <Ionicons name={amenity.icon as any} size={20} color="#FF385C" />
                                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this property</Text>
                        <Text style={styles.description}>{PROPERTY.description}</Text>
                    </View>

                    {/* Owner */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Property Owner</Text>
                        <View style={styles.ownerCard}>
                            <Ionicons name="person-circle" size={48} color="#E5E5E5" />
                            <View style={styles.ownerInfo}>
                                <View style={styles.ownerNameRow}>
                                    <Text style={styles.ownerName}>{PROPERTY.owner.name}</Text>
                                    {PROPERTY.owner.verified && (
                                        <View style={styles.idVerifiedBadge}>
                                            <Text style={styles.idVerifiedText}>ID Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.memberSince}>Member since {PROPERTY.owner.memberSince}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Monthly Rent</Text>
                    <Text style={styles.footerPrice}>GH₵{formatPrice(PROPERTY.price)}</Text>
                </View>
                {contactUnlocked ? (
                    <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                        <Ionicons name="call" size={20} color="#fff" />
                        <Text style={styles.callButtonText}>Call Owner</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.unlockButton} onPress={handleUnlockContact}>
                        <Text style={styles.unlockButtonText}>Contact Owner</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Premium Modal */}
            <PremiumModal
                visible={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                contactsRemaining={contactsRemaining}
                onSelectPlan={handleSelectPlan}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    imageContainer: { position: 'relative' },
    image: { width, height: 300 },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    headerActions: { flexDirection: 'row' },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageIndicator: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 3 },
    dotActive: { backgroundColor: '#fff', width: 12 },
    priceTag: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: 'rgba(232,245,233,0.95)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceTagText: { fontSize: 12, fontWeight: '600', color: '#22C55E' },
    content: { padding: 20 },
    titleRow: { flexDirection: 'row', marginBottom: 12 },
    location: { fontSize: 16, fontWeight: '600', color: '#222' },
    title: { fontSize: 14, color: '#717171', marginTop: 4 },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    verifiedText: { fontSize: 12, fontWeight: '500', color: '#22C55E', marginLeft: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
    currency: { fontSize: 16, color: '#717171' },
    priceAmount: { fontSize: 28, fontWeight: '700', color: '#222' },
    pricePeriod: { fontSize: 16, color: '#717171' },
    advancePeriod: { fontSize: 14, color: '#717171', marginLeft: 8 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '600', color: '#222', marginBottom: 12 },
    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    amenityLabel: { fontSize: 13, color: '#374151', marginLeft: 8 },
    description: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
    ownerCard: { flexDirection: 'row', alignItems: 'center' },
    ownerInfo: { flex: 1, marginLeft: 12 },
    ownerNameRow: { flexDirection: 'row', alignItems: 'center' },
    ownerName: { fontSize: 16, fontWeight: '600', color: '#222', marginRight: 8 },
    idVerifiedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    idVerifiedText: { fontSize: 10, fontWeight: '600', color: '#22C55E' },
    memberSince: { fontSize: 13, color: '#717171', marginTop: 2 },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        backgroundColor: '#fff',
    },
    footerLabel: { fontSize: 12, color: '#717171' },
    footerPrice: { fontSize: 20, fontWeight: '700', color: '#222' },
    unlockButton: {
        backgroundColor: '#FF385C',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 14,
    },
    unlockButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22C55E',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 14,
    },
    callButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
