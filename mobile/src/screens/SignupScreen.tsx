import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SignupScreen({ navigation }: any) {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        role: 'TENANT' as 'TENANT' | 'LANDLORD',
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'info' | 'otp'>('info');
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    };

    const handleSendOtp = async () => {
        if (!formData.fullName.trim()) {
            Alert.alert('Missing Name', 'Please enter your full name');
            return;
        }

        const cleanPhone = formData.phone.replace(/\s/g, '');
        if (!/^0[235][0-9]{8}$/.test(cleanPhone)) {
            Alert.alert('Invalid Phone', 'Please enter a valid Ghana phone number');
            return;
        }

        setIsLoading(true);
        try {
            setTimeout(() => {
                setStep('otp');
                setIsLoading(false);
                Alert.alert('OTP Sent', 'Development OTP: 123456');
            }, 1000);
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Error', 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            setTimeout(() => {
                setIsLoading(false);
                Alert.alert('Success', 'Account created successfully!');
                navigation.navigate('MainTabs');
            }, 1000);
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Error', 'Verification failed');
        }
    };

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>

                <View style={styles.decorativeCircle} />

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Create{'\n'}Account</Text>
                    <Text style={styles.headerSubtitle}>Join thousands of happy users</Text>
                </View>
            </LinearGradient>

            {/* White Card */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.card}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={{
                            width: 48, height: 48, borderRadius: 14, backgroundColor: '#FF6B35',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Ionicons name="home" size={24} color="#fff" />
                        </View>
                        <View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 26, fontWeight: '900', color: '#222', letterSpacing: -0.5 }}>Free</Text>
                                <Text style={{ fontSize: 26, fontWeight: '900', color: '#FF6B35', letterSpacing: -0.5 }}>Wahala</Text>
                            </View>
                            <Text style={{ fontSize: 8, fontWeight: '700', color: '#717171', letterSpacing: 1, textTransform: 'uppercase' }}>Rent Direct. No Stress.</Text>
                        </View>
                    </View>

                    {step === 'info' ? (
                        <>
                            {/* Role Selection */}
                            <Text style={styles.sectionLabel}>I want to</Text>
                            <View style={styles.roleContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleCard,
                                        formData.role === 'TENANT' && styles.roleCardActive,
                                    ]}
                                    onPress={() => setFormData({ ...formData, role: 'TENANT' })}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.roleIconContainer, formData.role === 'TENANT' && styles.roleIconContainerActive]}>
                                        <Ionicons name="home" size={24} color={formData.role === 'TENANT' ? '#FF6B35' : '#717171'} />
                                    </View>
                                    <Text style={[styles.roleTitle, formData.role === 'TENANT' && styles.roleTitleActive]}>
                                        Find a home
                                    </Text>
                                    <Text style={styles.roleSubtext}>I'm a tenant</Text>
                                    {formData.role === 'TENANT' && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark" size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.roleCard,
                                        formData.role === 'LANDLORD' && styles.roleCardActive,
                                    ]}
                                    onPress={() => setFormData({ ...formData, role: 'LANDLORD' })}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.roleIconContainer, formData.role === 'LANDLORD' && styles.roleIconContainerActive]}>
                                        <Ionicons name="key" size={24} color={formData.role === 'LANDLORD' ? '#FF6B35' : '#717171'} />
                                    </View>
                                    <Text style={[styles.roleTitle, formData.role === 'LANDLORD' && styles.roleTitleActive]}>
                                        List property
                                    </Text>
                                    <Text style={styles.roleSubtext}>I'm a landlord</Text>
                                    {formData.role === 'LANDLORD' && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark" size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Full Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.fullName}
                                        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                        placeholder="Kofi Mensah"
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                            </View>

                            {/* Phone Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.phoneInputContainer}>
                                    <View style={styles.countryCodeBox}>
                                        <Text style={styles.flag}>🇬🇭</Text>
                                        <Text style={styles.countryCode}>+233</Text>
                                    </View>
                                    <TextInput
                                        style={styles.phoneInput}
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: formatPhone(text) })}
                                        placeholder="024 XXX XXXX"
                                        keyboardType="phone-pad"
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                            </View>

                            {/* Get Started Button */}
                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleSendOtp}
                                disabled={isLoading}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#FF6B35', '#F7931E']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>
                                        {isLoading ? 'Sending...' : 'Get Started'}
                                    </Text>
                                    {!isLoading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* OTP Section */}
                            <View style={styles.otpHeader}>
                                <View style={styles.otpIconContainer}>
                                    <Ionicons name="shield-checkmark" size={32} color="#FF6B35" />
                                </View>
                                <Text style={styles.otpTitle}>Verification Code</Text>
                                <Text style={styles.otpSubtitle}>
                                    Enter the 6-digit code sent to{'\n'}{formData.phone}
                                </Text>
                            </View>

                            {/* OTP Input */}
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.otpInput}
                                    value={otp}
                                    onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="• • • • • •"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            {/* Create Account Button */}
                            <TouchableOpacity
                                style={[styles.button, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={isLoading || otp.length !== 6}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#FF6B35', '#F7931E']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>
                                        {isLoading ? 'Creating...' : 'Create Account'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Back Button */}
                            <TouchableOpacity onPress={() => setStep('info')} style={styles.changeNumber}>
                                <Ionicons name="arrow-back" size={16} color="#717171" />
                                <Text style={styles.changeNumberText}>Back</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FF6B35' },
    headerGradient: { height: height * 0.28, paddingHorizontal: 24 },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    decorativeCircle: {
        position: 'absolute',
        top: -50,
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerContent: { marginTop: 12 },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#fff', lineHeight: 42 },
    headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 24, flexDirection: 'row', justifyContent: 'center', gap: 10 },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 12 },
    roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    roleCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#EAEAEA',
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        position: 'relative',
    },
    roleCardActive: { borderColor: '#FF6B35', backgroundColor: '#FFF9F6' },
    roleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    roleIconContainerActive: { backgroundColor: '#FFF0EA' },
    roleTitle: { fontSize: 14, fontWeight: '600', color: '#222' },
    roleTitleActive: { color: '#FF6B35' },
    roleSubtext: { fontSize: 12, color: '#717171', marginTop: 4 },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 10 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#EAEAEA',
        paddingHorizontal: 16,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, paddingVertical: 16, color: '#222' },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#EAEAEA',
    },
    countryCodeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 16,
        borderRightWidth: 1,
        borderRightColor: '#EAEAEA',
        gap: 6,
    },
    flag: { fontSize: 18 },
    countryCode: { fontSize: 15, fontWeight: '600', color: '#222' },
    phoneInput: { flex: 1, fontSize: 16, paddingHorizontal: 14, paddingVertical: 16, color: '#222' },
    otpHeader: { alignItems: 'center', marginBottom: 24 },
    otpIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    otpTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
    otpSubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    otpInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 18,
        fontSize: 26,
        textAlign: 'center',
        letterSpacing: 10,
        color: '#222',
        fontWeight: '700',
        borderWidth: 1.5,
        borderColor: '#EAEAEA',
    },
    button: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    buttonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
    changeNumber: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
        gap: 6,
    },
    changeNumberText: { color: '#717171', fontSize: 15 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
    dividerText: { marginHorizontal: 16, fontSize: 13, color: '#A0A0A0', fontWeight: '500' },
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: '#717171', fontSize: 15 },
    footerLink: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
});
