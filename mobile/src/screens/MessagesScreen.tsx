import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Conversation {
    id: string;
    type: string;
    propertyId: string | null;
    bookingId: string | null;
    otherUser: {
        id: string;
        fullName: string | null;
        profileImageUrl: string | null;
        role: string;
    };
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
    createdAt: string;
}

export default function MessagesScreen() {
    const navigation = useNavigation<any>();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchConversations();
        // Poll for updates
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setError('Please log in to view messages');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/chat/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations);
                setError('');
            }
        } catch (err) {
            console.error('Fetch conversations error:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchConversations();
    }, []);

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'LANDLORD': return '#3B82F6';
            case 'TENANT': return '#10B981';
            case 'SERVICE_PROVIDER': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'LANDLORD': return 'Landlord';
            case 'TENANT': return 'Tenant';
            case 'SERVICE_PROVIDER': return 'Provider';
            default: return role;
        }
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id, otherUser: item.otherUser })}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {item.otherUser.profileImageUrl ? (
                    <Image source={{ uri: item.otherUser.profileImageUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {item.otherUser.fullName?.charAt(0) || '?'}
                        </Text>
                    </View>
                )}
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                            {item.unreadCount > 9 ? '9+' : item.unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={[styles.userName, item.unreadCount > 0 && styles.unreadName]} numberOfLines={1}>
                        {item.otherUser.fullName || 'Unknown User'}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.otherUser.role) }]}>
                        <Text style={styles.roleText}>{getRoleLabel(item.otherUser.role)}</Text>
                    </View>
                </View>
                <Text
                    style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]}
                    numberOfLines={1}
                >
                    {item.lastMessage || 'No messages yet'}
                </Text>
            </View>

            <View style={styles.conversationMeta}>
                <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F97316" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {error ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Log In</Text>
                    </TouchableOpacity>
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No messages yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Start a conversation by contacting a landlord or service provider
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderConversation}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#F97316']} />
                    }
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    unreadBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F97316',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    unreadText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D1D5DB',
        marginRight: 8,
        flex: 1,
    },
    unreadName: {
        color: '#fff',
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    roleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    lastMessage: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    unreadMessage: {
        color: '#fff',
        fontWeight: '500',
    },
    conversationMeta: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    timeText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 84,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        marginTop: 16,
        marginBottom: 16,
    },
    loginButton: {
        backgroundColor: '#F97316',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
