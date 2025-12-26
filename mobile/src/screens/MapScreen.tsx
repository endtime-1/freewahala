import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    lat: number;
    lng: number;
    image: string;
    priceTag?: 'GREAT_VALUE' | 'FAIR' | 'OVERPRICED';
}

const PROPERTIES: Property[] = [
    { id: '1', title: 'Modern 2 Bedroom', location: 'East Legon', price: 3500, lat: 5.6350, lng: -0.1578, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', priceTag: 'GREAT_VALUE' },
    { id: '2', title: 'Chamber and Hall', location: 'Madina', price: 800, lat: 5.6781, lng: -0.1674, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', priceTag: 'FAIR' },
    { id: '3', title: '3 Bedroom House', location: 'Airport Residential', price: 8000, lat: 5.6055, lng: -0.1799, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', priceTag: 'OVERPRICED' },
];

export default function MapScreen({ navigation }: any) {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const formatPrice = (price: number) => {
        if (price >= 1000) return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
        return price.toString();
    };

    const initialRegion = {
        latitude: 5.6037,
        longitude: -0.1870,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {PROPERTIES.map((property) => (
                    <Marker
                        key={property.id}
                        coordinate={{ latitude: property.lat, longitude: property.lng }}
                        onPress={() => setSelectedProperty(property)}
                    >
                        <View style={[
                            styles.priceBubble,
                            selectedProperty?.id === property.id && styles.priceBubbleActive
                        ]}>
                            <Text style={[
                                styles.priceBubbleText,
                                selectedProperty?.id === property.id && styles.priceBubbleTextActive
                            ]}>
                                GH₵{formatPrice(property.price)}
                            </Text>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Back Button */}
            <SafeAreaView style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Map View</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            {/* Property Preview */}
            {selectedProperty && (
                <View style={styles.previewContainer}>
                    <TouchableOpacity
                        style={styles.previewCard}
                        onPress={() => navigation.navigate('PropertyDetail', { id: selectedProperty.id })}
                    >
                        <Image source={{ uri: selectedProperty.image }} style={styles.previewImage} />
                        <View style={styles.previewContent}>
                            <View style={styles.previewHeader}>
                                <Text style={styles.previewLocation}>{selectedProperty.location}</Text>
                                <TouchableOpacity onPress={() => setSelectedProperty(null)}>
                                    <Ionicons name="close" size={20} color="#717171" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.previewTitle} numberOfLines={1}>{selectedProperty.title}</Text>
                            <View style={styles.previewFooter}>
                                <Text style={styles.previewPrice}>GH₵{formatPrice(selectedProperty.price)}/mo</Text>
                                <View style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    backButton: {
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
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    priceBubble: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    priceBubbleActive: {
        backgroundColor: '#222',
        transform: [{ scale: 1.1 }],
    },
    priceBubbleText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#222',
    },
    priceBubbleTextActive: {
        color: '#fff',
    },
    previewContainer: {
        position: 'absolute',
        bottom: 32,
        left: 16,
        right: 16,
    },
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    previewImage: {
        width: 100,
        height: 100,
    },
    previewContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewLocation: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    previewTitle: {
        fontSize: 13,
        color: '#717171',
        marginTop: 2,
    },
    previewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    previewPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF385C',
    },
    viewButton: {
        backgroundColor: '#FF385C',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
