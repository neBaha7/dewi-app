/**
 * VideoCard - Full-screen video feed item
 * Displays kinetic typography with mascot reactions
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import type { Video, SRSStatus } from '../types';

interface VideoCardProps {
    video: Video;
    isActive: boolean;
    onLike: () => void;
    onSave: () => void;
    onLoopComplete: (count: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Background colors for different vibes
const backgroundColors: Record<string, string[]> = {
    hype: ['#667eea', '#764ba2'],
    cozy: ['#1a1a2e', '#16213e'],
    chaotic: ['#ff6b6b', '#feca57'],
    unhinged: ['#a29bfe', '#fd79a8'],
};

export const VideoCard: React.FC<VideoCardProps> = ({
    video,
    isActive,
    onLike,
    onSave,
    onLoopComplete,
}) => {
    const [loopCount, setLoopCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const textAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isActive) {
            // Start text animation when card becomes active
            animateText();

            // Simulate video loop (15 seconds)
            const loopInterval = setInterval(() => {
                setLoopCount((prev) => {
                    const newCount = prev + 1;
                    onLoopComplete(newCount);
                    return newCount;
                });
            }, 15000); // 15 second loops

            return () => clearInterval(loopInterval);
        }
    }, [isActive]);

    const animateText = () => {
        textAnim.setValue(0);
        Animated.timing(textAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        // Pulse animation
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
        onLike();
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        onSave();
    };

    const srsStatusColor: Record<SRSStatus, string> = {
        new: colors.srsNew,
        hard: colors.srsHard,
        learning: colors.srsLearning,
        mastered: colors.srsMastered,
    };

    return (
        <View style={styles.container}>
            {/* Background */}
            <View style={[styles.background, { backgroundColor: '#667eea' }]} />

            {/* Content */}
            <View style={styles.content}>
                {/* Hook Text */}
                <Animated.View
                    style={[
                        styles.hookContainer,
                        {
                            opacity: textAnim,
                            transform: [
                                {
                                    translateY: textAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Text style={styles.hookText}>{video.script.hook}</Text>
                </Animated.View>

                {/* Main Fact Text - Kinetic Typography */}
                <View style={styles.factContainer}>
                    {video.script.body.map((segment, index) => (
                        <Animated.Text
                            key={index}
                            style={[
                                styles.factText,
                                {
                                    opacity: textAnim.interpolate({
                                        inputRange: [0, 0.3 + index * 0.2, 1],
                                        outputRange: [0, 0, 1],
                                    }),
                                },
                            ]}
                        >
                            {segment}
                        </Animated.Text>
                    ))}
                </View>

                {/* Repeat Phrase */}
                <View style={styles.repeatContainer}>
                    <Text style={styles.repeatText}>
                        🔁 {video.script.repeatPhrase}
                    </Text>
                </View>
            </View>

            {/* Right Side Actions */}
            <View style={styles.actions}>
                {/* Like Button */}
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Animated.Text
                        style={[
                            styles.actionIcon,
                            { transform: [{ scale: pulseAnim }] },
                        ]}
                    >
                        {isLiked ? '❤️' : '🤍'}
                    </Animated.Text>
                    <Text style={styles.actionLabel}>Like</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                    <Text style={styles.actionIcon}>
                        {isSaved ? '🔖' : '📑'}
                    </Text>
                    <Text style={styles.actionLabel}>Save</Text>
                </TouchableOpacity>

                {/* Loop Counter */}
                <View style={styles.actionButton}>
                    <Text style={styles.actionIcon}>🔄</Text>
                    <Text style={styles.actionLabel}>{loopCount}x</Text>
                </View>

                {/* SRS Status Indicator */}
                <View
                    style={[
                        styles.srsIndicator,
                        { backgroundColor: srsStatusColor[video.srsStatus] },
                    ]}
                >
                    <Text style={styles.srsText}>
                        {video.srsStatus.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* Bottom Info */}
            <View style={styles.bottomInfo}>
                <View style={styles.topicTag}>
                    <Text style={styles.topicText}>
                        🧠 {video.script.background.replace('_', ' ')}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: screenWidth,
        height: screenHeight,
        position: 'relative',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: 100,
    },
    hookContainer: {
        marginBottom: spacing.lg,
    },
    hookText: {
        fontSize: typography.fontSize.lg,
        color: colors.arcticWhite,
        textAlign: 'center',
        opacity: 0.9,
    },
    factContainer: {
        alignItems: 'center',
    },
    factText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: '700',
        color: colors.arcticWhite,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        marginVertical: spacing.xs,
    },
    repeatContainer: {
        marginTop: spacing.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.pill,
    },
    repeatText: {
        fontSize: typography.fontSize.md,
        color: colors.arcticWhite,
        fontWeight: '600',
    },
    actions: {
        position: 'absolute',
        right: spacing.md,
        bottom: 150,
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    actionIcon: {
        fontSize: 28,
    },
    actionLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.arcticWhite,
        marginTop: spacing.xs,
    },
    srsIndicator: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginTop: spacing.sm,
    },
    srsText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.penguinCharcoal,
    },
    bottomInfo: {
        position: 'absolute',
        bottom: 100,
        left: spacing.md,
        right: 80,
    },
    topicTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.pill,
        alignSelf: 'flex-start',
    },
    topicText: {
        fontSize: typography.fontSize.sm,
        color: colors.arcticWhite,
    },
});

export default VideoCard;
