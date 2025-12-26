import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    readAt: string | null;
    createdAt: string;
    sender: {
        id: string;
        fullName: string | null;
        profileImageUrl: string | null;
    };
}

interface OtherUser {
    id: string;
    fullName: string | null;
    profileImageUrl: string | null;
    role: string;
}

export default function ChatScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const flatListRef = useRef<FlatList>(null);
    const { conversationId, otherUser } = route.params as { conversationId: string; otherUser: OtherUser };

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get current user ID
        const getUserId = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setCurrentUserId(payload.userId);
                } catch (e) {
                    console.error('Failed to parse token');
                }
            }
        };
        getUserId();

        fetchMessages();
        // Poll for new messages
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.conversation.messages);
            }
        } catch (err) {
            console.error('Fetch messages error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/chat/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage.trim()
                })
            });

            if (response.ok) {
                setNewMessage('');
                await fetchMessages();
                flatListRef.current?.scrollToEnd({ animated: true });
            }
        } catch (err) {
            console.error('Send message error:', err);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isOwn = item.senderId === currentUserId;

        return (
            <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
                <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                    <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
                        {item.content}
                    </Text>
                </View>
                <View style={[styles.messageFooter, isOwn && styles.ownFooter]}>
                    <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
                    {isOwn && item.readAt && (
                        <Ionicons name="checkmark-done" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                    )}
                </View>
            </View>
        );
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'LANDLORD': return 'Landlord';
            case 'TENANT': return 'Tenant';
            case 'SERVICE_PROVIDER': return 'Service Provider';
            default: return role;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                {otherUser.profileImageUrl ? (
                    <Image source={{ uri: otherUser.profileImageUrl }} style={styles.headerAvatar} />
                ) : (
                    <View style={styles.headerAvatarPlaceholder}>
                        <Text style={styles.headerAvatarText}>
                            {otherUser.fullName?.charAt(0) || '?'}
                        </Text>
                    </View>
                )}

                <View style={styles.headerInfo}>
                    <Text style={styles.headerName} numberOfLines={1}>
                        {otherUser.fullName || 'Unknown User'}
                    </Text>
                    <Text style={styles.headerRole}>{getRoleLabel(otherUser.role)}</Text>
                </View>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#F97316" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        onLayout={() => flatListRef.current?.scrollToEnd()}
                    />
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor="#6B7280"
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    headerRole: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    ownMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    ownBubble: {
        backgroundColor: '#F97316',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#fff',
        lineHeight: 20,
    },
    ownMessageText: {
        color: '#fff',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ownFooter: {
        justifyContent: 'flex-end',
    },
    timeText: {
        fontSize: 11,
        color: '#6B7280',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#fff',
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        backgroundColor: '#F97316',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
