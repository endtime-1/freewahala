import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FAVORITES = [
    { id: '1', title: 'Modern 2 Bedroom', location: 'East Legon', price: 3500, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' },
    { id: '2', title: 'Spacious Chamber', location: 'Madina', price: 800, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
];

export default function FavoritesScreen() {
    const formatPrice = (price: number) => new Intl.NumberFormat('en-GH').format(price);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Favorites</Text>
                <Text style={styles.subtitle}>{FAVORITES.length} saved properties</Text>
            </View>

            {FAVORITES.length > 0 ? (
                <FlatList
                    data={FAVORITES}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card}>
                            <Image source={{ uri: item.image }} style={styles.cardImage} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardLocation}>{item.location}</Text>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardPrice}>GH₵{formatPrice(item.price)}/mo</Text>
                            </View>
                            <TouchableOpacity style={styles.removeBtn}>
                                <Ionicons name="heart" size={24} color="#FF385C" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyTitle}>No favorites yet</Text>
                    <Text style={styles.emptySubtitle}>Save properties you like to view them here</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
    title: { fontSize: 24, fontWeight: '700', color: '#222' },
    subtitle: { fontSize: 14, color: '#717171', marginTop: 4 },
    list: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardImage: { width: 100, height: 100 },
    cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
    cardLocation: { fontSize: 14, fontWeight: '600', color: '#222' },
    cardTitle: { fontSize: 13, color: '#717171', marginTop: 2 },
    cardPrice: { fontSize: 16, fontWeight: '700', color: '#FF385C', marginTop: 8 },
    removeBtn: { justifyContent: 'center', paddingHorizontal: 16 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#222', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#717171', marginTop: 8, textAlign: 'center' },
});
