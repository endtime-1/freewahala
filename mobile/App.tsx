import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProviderDetailScreen from './src/screens/ProviderDetailScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Modern Welcome Screen with Clean White Background
function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={welcomeStyles.container}>
      <StatusBar style="dark" />

      <View style={welcomeStyles.content}>
        {/* Logo Section */}
        <View style={welcomeStyles.logoSection}>
          <View style={welcomeStyles.logoContainer}>
            <View style={welcomeStyles.logoIcon}>
              <Ionicons name="home" size={32} color="#fff" />
            </View>
            <View style={welcomeStyles.logoTextGroup}>
              <View style={welcomeStyles.logoTitle}>
                <Text style={welcomeStyles.logoTextDark}>Free</Text>
                <Text style={welcomeStyles.logoTextBrand}>Wahala</Text>
              </View>
              <Text style={welcomeStyles.logoTagline}>RENT DIRECT. NO STRESS.</Text>
            </View>
          </View>
        </View>

        {/* Hero Text */}
        <View style={welcomeStyles.heroSection}>
          <Text style={welcomeStyles.heroTitle}>
            Find Your{'\n'}Dream Home
          </Text>
          <Text style={welcomeStyles.heroSubtitle}>
            Connect directly with property owners.{'\n'}
            No brokers. No stress. Just homes.
          </Text>
        </View>

        {/* Features */}
        <View style={welcomeStyles.featuresContainer}>
          <View style={welcomeStyles.featureItem}>
            <View style={welcomeStyles.featureIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#FF6B35" />
            </View>
            <Text style={welcomeStyles.featureTitle}>Verified</Text>
            <Text style={welcomeStyles.featureText}>Properties</Text>
          </View>
          <View style={welcomeStyles.featureItem}>
            <View style={welcomeStyles.featureIconContainer}>
              <Ionicons name="cash-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={welcomeStyles.featureTitle}>Zero</Text>
            <Text style={welcomeStyles.featureText}>Broker Fees</Text>
          </View>
          <View style={welcomeStyles.featureItem}>
            <View style={welcomeStyles.featureIconContainer}>
              <Ionicons name="call-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={welcomeStyles.featureTitle}>Direct</Text>
            <Text style={welcomeStyles.featureText}>Contact</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={welcomeStyles.statsContainer}>
          <View style={welcomeStyles.statItem}>
            <Text style={welcomeStyles.statNumber}>10K+</Text>
            <Text style={welcomeStyles.statLabel}>Properties</Text>
          </View>
          <View style={welcomeStyles.statDivider} />
          <View style={welcomeStyles.statItem}>
            <Text style={welcomeStyles.statNumber}>5K+</Text>
            <Text style={welcomeStyles.statLabel}>Happy Users</Text>
          </View>
          <View style={welcomeStyles.statDivider} />
          <View style={welcomeStyles.statItem}>
            <Text style={welcomeStyles.statNumber}>4.8</Text>
            <Text style={welcomeStyles.statLabel}>App Rating</Text>
          </View>
        </View>
      </View>

      {/* Buttons Section */}
      <View style={welcomeStyles.buttonsSection}>
        <TouchableOpacity
          style={welcomeStyles.primaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={welcomeStyles.primaryButtonGradient}
          >
            <Text style={welcomeStyles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={welcomeStyles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={welcomeStyles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={welcomeStyles.skipButton}
          onPress={() => navigation.navigate('MainTabs')}
          activeOpacity={0.7}
        >
          <Text style={welcomeStyles.skipButtonText}>Browse as guest</Text>
          <Ionicons name="chevron-forward" size={16} color="#717171" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const welcomeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoTextGroup: { alignItems: 'flex-start' },
  logoTitle: { flexDirection: 'row', alignItems: 'baseline' },
  logoTextDark: { fontSize: 36, fontWeight: '900', color: '#222', letterSpacing: -1 },
  logoTextBrand: { fontSize: 36, fontWeight: '900', color: '#FF6B35', letterSpacing: -1 },
  logoTagline: { fontSize: 11, fontWeight: '700', color: '#717171', letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase' },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222',
    textAlign: 'center',
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#717171',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  featureItem: { alignItems: 'center' },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#222' },
  featureText: { fontSize: 12, color: '#717171', marginTop: 2 },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#FF6B35' },
  statLabel: { fontSize: 12, color: '#717171', marginTop: 4 },
  statDivider: { width: 1, height: 36, backgroundColor: '#E0E0E0' },
  buttonsSection: { paddingHorizontal: 24, paddingBottom: 32 },
  primaryButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    marginBottom: 14,
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: '#222' },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  skipButtonText: { fontSize: 14, color: '#717171' },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#717171',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="ProviderDetail"
          component={ProviderDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="PropertyDetail"
          component={PropertyDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
