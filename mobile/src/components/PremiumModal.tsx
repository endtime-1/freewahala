import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumModalProps {
    visible: boolean;
    onClose: () => void;
    contactsRemaining: number;
    onSelectPlan: (planId: string) => void;
}

const PLANS = [
    { id: 'BASIC', name: 'Basic', price: 50, contacts: 15 },
    { id: 'RELAX', name: 'Relax', price: 100, contacts: 40, popular: true },
    { id: 'SUPERUSER', name: 'SuperUser', price: 200, contacts: 'Unlimited' },
];

export default function PremiumModal({ visible, onClose, contactsRemaining, onSelectPlan }: PremiumModalProps) {
    const [selectedPlan, setSelectedPlan] = useState('RELAX');

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#717171" />
                    </TouchableOpacity>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="star" size={32} color="#fff" />
                            </View>
                            <Text style={styles.title}>Upgrade to Premium</Text>
                            <Text style={styles.subtitle}>
                                You've used all {3 - contactsRemaining} free contacts this month
                            </Text>
                        </View>

                        {/* Plans */}
                        <View style={styles.plans}>
                            {PLANS.map((plan) => (
                                <TouchableOpacity
                                    key={plan.id}
                                    style={[
                                        styles.planCard,
                                        selectedPlan === plan.id && styles.planCardSelected,
                                    ]}
                                    onPress={() => setSelectedPlan(plan.id)}
                                >
                                    <View style={styles.planRadio}>
                                        <View style={[
                                            styles.radioOuter,
                                            selectedPlan === plan.id && styles.radioOuterSelected,
                                        ]}>
                                            {selectedPlan === plan.id && <View style={styles.radioInner} />}
                                        </View>
                                    </View>
                                    <View style={styles.planInfo}>
                                        <View style={styles.planNameRow}>
                                            <Text style={styles.planName}>{plan.name}</Text>
                                            {plan.popular && (
                                                <View style={styles.popularBadge}>
                                                    <Text style={styles.popularText}>Popular</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.planContacts}>{plan.contacts} contacts/month</Text>
                                    </View>
                                    <View style={styles.planPrice}>
                                        <Text style={styles.priceAmount}>GH₵{plan.price}</Text>
                                        <Text style={styles.pricePeriod}>/mo</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Benefits */}
                        <View style={styles.benefits}>
                            <Text style={styles.benefitsTitle}>What you'll get:</Text>
                            {[
                                'Direct access to property owners',
                                'No agent fees - save GH₵500+ per rental',
                                'Rental agreement templates',
                                'Priority customer support',
                            ].map((benefit, idx) => (
                                <View key={idx} style={styles.benefitRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                                    <Text style={styles.benefitText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>

                        {/* CTA */}
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => onSelectPlan(selectedPlan)}
                        >
                            <Text style={styles.ctaText}>Upgrade Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.laterButton}>
                            <Text style={styles.laterText}>Maybe later</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF385C',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#717171',
        textAlign: 'center',
    },
    plans: {
        gap: 12,
        marginBottom: 24,
    },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        marginBottom: 12,
    },
    planCardSelected: {
        borderColor: '#FF385C',
        backgroundColor: '#FFF5F6',
    },
    planRadio: {
        marginRight: 12,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#FF385C',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF385C',
    },
    planInfo: {
        flex: 1,
    },
    planNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    popularBadge: {
        backgroundColor: '#FFE4E8',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    popularText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FF385C',
    },
    planContacts: {
        fontSize: 13,
        color: '#717171',
        marginTop: 2,
    },
    planPrice: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    pricePeriod: {
        fontSize: 13,
        color: '#717171',
    },
    benefits: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    benefitsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
        marginBottom: 12,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    benefitText: {
        fontSize: 14,
        color: '#4B5563',
    },
    ctaButton: {
        backgroundColor: '#FF385C',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    ctaText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    laterButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    laterText: {
        color: '#717171',
        fontSize: 15,
    },
});
