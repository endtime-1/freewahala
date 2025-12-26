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
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginScreen({ navigation }: any) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    };

    const handleSendOtp = async () => {
        const cleanPhone = phone.replace(/\s/g, '');
        if (!/^0[235][0-9]{8}$/.test(cleanPhone)) {
            Alert.alert('Invalid Phone', 'Please enter a valid Ghana phone number');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/generate-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: cleanPhone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setStep('otp');
            // Show dev OTP if available
            if (data.devOtp) {
                Alert.alert('OTP Sent', `Development OTP: ${data.devOtp}`);
            } else {
                Alert.alert('OTP Sent', 'Check your phone for the verification code');
            }
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
            return;
        }

        const cleanPhone = phone.replace(/\s/g, '');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: cleanPhone, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            // Store the auth token
            await AsyncStorage.setItem('authToken', data.token);

            // Store user data if provided
            if (data.user) {
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
            }

            Alert.alert('Success', 'Logged in successfully!');

            // Reset navigation to MainTabs so user can't go back to login
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            Alert.alert('Error', error.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
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

                {/* Decorative Circle */}
                <View style={styles.decorativeCircle} />

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Welcome{'\n'}Back</Text>
                    <Text style={styles.headerSubtitle}>Sign in to continue</Text>
                </View>
            </LinearGradient>

            {/* White Card */}
            <View style={styles.card}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Logo */}
                    <View style={[styles.logoContainer, { flexDirection: 'row' }]}>
                        <View style={{
                            width: 50, height: 50, borderRadius: 16, backgroundColor: '#FF6B35',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Ionicons name="home" size={26} color="#fff" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 28, fontWeight: '900', color: '#222', letterSpacing: -0.5 }}>Free</Text>
                                <Text style={{ fontSize: 28, fontWeight: '900', color: '#FF6B35', letterSpacing: -0.5 }}>Wahala</Text>
                            </View>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: '#717171', letterSpacing: 1, textTransform: 'uppercase' }}>Rent Direct. No Stress.</Text>
                        </View>
                    </View>

                    {step === 'phone' ? (
                        <>
                            {/* Phone Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.countryCodeBox}>
                                        <Text style={styles.flag}>🇬🇭</Text>
                                        <Text style={styles.countryCode}>+233</Text>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={phone}
                                        onChangeText={(text) => setPhone(formatPhone(text))}
                                        placeholder="024 XXX XXXX"
                                        keyboardType="phone-pad"
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                            </View>

                            {/* Continue Button */}
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
                                        {isLoading ? 'Sending...' : 'Continue'}
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
                                    Enter the 6-digit code sent to{'\n'}{phone}
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

                            {/* Verify Button */}
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
                                        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Change Number */}
                            <TouchableOpacity onPress={() => setStep('phone')} style={styles.changeNumber}>
                                <Ionicons name="arrow-back" size={16} color="#717171" />
                                <Text style={styles.changeNumberText}>Change phone number</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.footerLink}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FF6B35' },
    headerGradient: { height: height * 0.32, paddingHorizontal: 24 },
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
    headerContent: { marginTop: 20 },
    headerTitle: { fontSize: 36, fontWeight: '800', color: '#fff', lineHeight: 44 },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        paddingHorizontal: 24,
        paddingTop: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    scrollContent: { flexGrow: 1 },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    inputGroup: { marginBottom: 24 },

    inputLabel: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1.5, borderColor: '#EAEAEA' },
    countryCodeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderRightWidth: 1,
        borderRightColor: '#EAEAEA',
    },
    flag: { fontSize: 20, marginRight: 6 },
    countryCode: { fontSize: 16, fontWeight: '600', color: '#222' },
    input: { flex: 1, fontSize: 18, paddingHorizontal: 16, paddingVertical: 18, color: '#222' },
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
        borderRadius: 16,
        padding: 20,
        fontSize: 28,
        textAlign: 'center',
        letterSpacing: 12,
        color: '#222',
        fontWeight: '700',
        borderWidth: 1.5,
        borderColor: '#EAEAEA',
    },
    button: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    buttonText: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 10 },
    changeNumber: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    changeNumberText: { color: '#717171', fontSize: 15, marginLeft: 6 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
    dividerText: { marginHorizontal: 16, fontSize: 13, color: '#A0A0A0', fontWeight: '500' },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 24 },
    footerText: { color: '#717171', fontSize: 15 },
    footerLink: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
});
