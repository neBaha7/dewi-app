/**
 * ChatOverlay - Dewi Duo companion chat interface
 * Context-aware AI chat powered by the mascots
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import type { ChatMessage, MascotCharacter } from '../types';

interface ChatOverlayProps {
    visible: boolean;
    onClose: () => void;
    videoId?: string;
    onSendMessage: (message: string) => Promise<{
        message: string;
        mascot: MascotCharacter;
        mascotEmotion: string;
        suggestedQuestions: string[];
    }>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
    visible,
    onClose,
    videoId,
    onSendMessage,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
        "Explain this in more detail?",
        "Why is this important?",
        "Give me a memory trick!",
    ]);
    const scrollViewRef = useRef<ScrollView>(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: screenHeight,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleSend = async (text: string = inputText) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: text.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await onSendMessage(text);

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.message,
                mascot: response.mascot,
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (response.suggestedQuestions.length > 0) {
                setSuggestedQuestions(response.suggestedQuestions);
            }
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: "Oops! Something went wrong~ Try again? 🦭",
                mascot: 'seal',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    };

    const getMascotEmoji = (mascot?: MascotCharacter) => {
        return mascot === 'penguin' ? '🐧' : '🦭';
    };

    const getMascotColor = (mascot?: MascotCharacter) => {
        return mascot === 'penguin' ? colors.accentLavender : colors.accentMint;
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.mascotIcons}>🦭 🐧</Text>
                            <Text style={styles.headerTitle}>Dewi Duo</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                    >
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <View style={styles.welcomeContainer}>
                                <Text style={styles.welcomeEmoji}>🦭 🐧</Text>
                                <Text style={styles.welcomeText}>
                                    Hey there! We're here to help~ {'\n'}
                                    Ask us anything about what you're learning!
                                </Text>
                            </View>
                        )}

                        {/* Chat Messages */}
                        {messages.map((msg, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.messageBubble,
                                    msg.role === 'user'
                                        ? styles.userBubble
                                        : [
                                            styles.assistantBubble,
                                            { borderColor: getMascotColor(msg.mascot) },
                                        ],
                                ]}
                            >
                                {msg.role === 'assistant' && (
                                    <Text style={styles.mascotIndicator}>
                                        {getMascotEmoji(msg.mascot)}
                                    </Text>
                                )}
                                <Text
                                    style={[
                                        styles.messageText,
                                        msg.role === 'user' && styles.userMessageText,
                                    ]}
                                >
                                    {msg.content}
                                </Text>
                            </View>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <View style={[styles.messageBubble, styles.assistantBubble]}>
                                <Text style={styles.typingIndicator}>🦭 typing...</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Suggested Questions */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.suggestionsContainer}
                        contentContainerStyle={styles.suggestionsContent}
                    >
                        {suggestedQuestions.map((question, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionChip}
                                onPress={() => handleSend(question)}
                            >
                                <Text style={styles.suggestionText}>{question}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Input Area */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask the Dewi Duo..."
                                placeholderTextColor={colors.textMuted}
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={() => handleSend()}
                                returnKeyType="send"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    !inputText.trim() && styles.sendButtonDisabled,
                                ]}
                                onPress={() => handleSend()}
                                disabled={!inputText.trim() || isLoading}
                            >
                                <Text style={styles.sendIcon}>🚀</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        height: screenHeight * 0.75,
        ...shadows.strong,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.softGray,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mascotIcons: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.softGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 16,
        color: colors.textMuted,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing.md,
    },
    welcomeContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    welcomeEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    welcomeText: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: colors.accentMint,
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: colors.softGray,
        borderWidth: 2,
        borderColor: colors.accentMint,
    },
    mascotIndicator: {
        fontSize: 16,
        marginBottom: spacing.xs,
    },
    messageText: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        lineHeight: 22,
    },
    userMessageText: {
        color: colors.penguinCharcoal,
    },
    typingIndicator: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    suggestionsContainer: {
        maxHeight: 50,
        borderTopWidth: 1,
        borderTopColor: colors.softGray,
    },
    suggestionsContent: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    suggestionChip: {
        backgroundColor: colors.accentLavender,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
        marginRight: spacing.sm,
    },
    suggestionText: {
        fontSize: typography.fontSize.sm,
        color: colors.penguinCharcoal,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.softGray,
    },
    input: {
        flex: 1,
        backgroundColor: colors.softGray,
        borderRadius: borderRadius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
        color: colors.text,
        marginRight: spacing.sm,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accentMint,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendIcon: {
        fontSize: 20,
    },
});

export default ChatOverlay;
