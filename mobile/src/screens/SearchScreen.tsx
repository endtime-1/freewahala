import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PROPERTY_TYPES = [
    { id: 'SINGLE_ROOM', label: 'Single Room', icon: 'bed-outline' },
    { id: 'CHAMBER_HALL', label: 'Chamber & Hall', icon: 'home-outline' },
    { id: 'SELF_CONTAINED', label: 'Self Contained', icon: 'cube-outline' },
    { id: 'TWO_BEDROOM', label: '2 Bedroom', icon: 'business-outline' },
    { id: 'THREE_BEDROOM', label: '3 Bedroom', icon: 'business-outline' },
    { id: 'APARTMENT', label: 'Apartment', icon: 'layers-outline' },
];

const POPULAR_AREAS = [
    'East Legon', 'Madina', 'Kasoa', 'Tema', 'Spintex', 'Airport Residential',
    'Cantonments', 'Osu', 'Dansoman', 'Achimota',
];

export default function SearchScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Find Your Home</Text>
                    <Text style={styles.subtitle}>Search from 5,000+ verified properties</Text>
                </View>

                {/* Search Box */}
                <View style={styles.searchBox}>
                    <View style={styles.inputGroup}>
                        <Ionicons name="location-outline" size={20} color="#FF385C" />
                        <TextInput
                            style={styles.input}
                            placeholder="Where do you want to live?"
                            placeholderTextColor="#717171"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Ionicons name="cash-outline" size={20} color="#FF385C" />
                        <TextInput
                            style={styles.input}
                            placeholder="Budget (GH₵)"
                            placeholderTextColor="#717171"
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity style={styles.searchButton}>
                        <Ionicons name="search" size={20} color="#fff" />
                        <Text style={styles.searchButtonText}>Search Properties</Text>
                    </TouchableOpacity>
                </View>

                {/* Property Types */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Types</Text>
                    <View style={styles.propertyTypesGrid}>
                        {PROPERTY_TYPES.map(type => (
                            <TouchableOpacity key={type.id} style={styles.propertyTypeCard}>
                                <Ionicons name={type.icon as any} size={28} color="#FF385C" />
                                <Text style={styles.propertyTypeLabel}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Popular Areas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popular Areas in Accra</Text>
                    <View style={styles.areasGrid}>
                        {POPULAR_AREAS.map(area => (
                            <TouchableOpacity key={area} style={styles.areaChip}>
                                <Text style={styles.areaChipText}>{area}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    header: { padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '700', color: '#222' },
    subtitle: { fontSize: 15, color: '#717171', marginTop: 4 },
    searchBox: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EBEBEB', paddingVertical: 16 },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#222' },
    searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF385C', paddingVertical: 16, borderRadius: 12, marginTop: 16 },
    searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222', marginBottom: 16 },
    propertyTypesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    propertyTypeCard: { width: '30%', aspectRatio: 1, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginRight: 10, marginBottom: 10 },
    propertyTypeLabel: { fontSize: 12, color: '#222', marginTop: 8, textAlign: 'center' },
    areasGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    areaChip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#EBEBEB', marginRight: 10, marginBottom: 10 },
    areaChipText: { fontSize: 14, color: '#222' },
});
