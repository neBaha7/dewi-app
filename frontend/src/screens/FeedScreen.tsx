/**
 * FeedScreen - Main TikTok-style video feed
 * Infinite scroll with gesture-based SRS
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Dimensions,
    ViewToken,
} from 'react-native';
import { VideoCard, DewiDuoFAB, ChatOverlay, UploadModal } from '../components';
import { colors } from '../styles/theme';
import type { Video, FeedItem, ContentType } from '../types';
import api from '../services/api';

const { height: screenHeight } = Dimensions.get('window');

// Mock data for initial development
const mockVideos: Video[] = [
    {
        id: '1',
        script: {
            id: '1',
            factId: 'f1',
            hook: 'Okay but like...',
            body: ['THE MITOCHONDRIA', "is literally THE POWERHOUSE", 'of the CELL!'],
            repeatPhrase: 'Powerhouse of the cell',
            mascotCues: [
                { timestamp: '0:05', character: 'penguin', action: 'directing' },
                { timestamp: '0:10', character: 'seal', action: 'clapping' },
            ],
            background: 'subway_surfers',
            audioVibe: 'phonk',
            durationSeconds: 15,
        },
        srsStatus: 'new',
        loopCount: 0,
    },
    {
        id: '2',
        script: {
            id: '2',
            factId: 'f2',
            hook: 'POV: You forgot this exists...',
            body: ['PHOTOSYNTHESIS', 'turns sunlight into FOOD', 'for plants 🌱'],
            repeatPhrase: 'Sunlight becomes food',
            mascotCues: [
                { timestamp: '0:03', character: 'penguin', action: 'shocked' },
                { timestamp: '0:08', character: 'seal', action: 'celebrating' },
            ],
            background: 'minecraft',
            audioVibe: 'lofi',
            durationSeconds: 15,
        },
        srsStatus: 'learning',
        loopCount: 2,
    },
    {
        id: '3',
        script: {
            id: '3',
            factId: 'f3',
            hook: 'Why does nobody talk about this??',
            body: ['DNA is a DOUBLE HELIX', 'shaped like a twisted ladder', 'carrying genetic info 🧬'],
            repeatPhrase: 'Double helix ladder',
            mascotCues: [
                { timestamp: '0:04', character: 'seal', action: 'balancing' },
                { timestamp: '0:12', character: 'penguin', action: 'dancing' },
            ],
            background: 'kinetic_sand',
            audioVibe: 'trending',
            durationSeconds: 15,
        },
        srsStatus: 'hard',
        loopCount: 0,
    },
];

export const FeedScreen: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>(mockVideos);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
        []
    );

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const handleLike = async (videoId: string) => {
        console.log('Liked video:', videoId);
        // Update SRS status via API
        // await api.recordGesture(videoId, 'like');
    };

    const handleSave = async (videoId: string) => {
        console.log('Saved video:', videoId);
        // Update SRS status to mastered
        // await api.recordGesture(videoId, 'save');
    };

    const handleLoopComplete = async (videoId: string, loopCount: number) => {
        console.log('Loop complete:', videoId, 'count:', loopCount);
        if (loopCount >= 3) {
            // Mark as learning after 3 loops
            // await api.recordGesture(videoId, 'loop', loopCount);
        }
    };

    const handleUpload = async (type: ContentType, data: any) => {
        console.log('Uploading:', type, data);

        if (type === 'youtube' && data.url) {
            await api.ingestYouTube(data.url, data.title);
        } else if (type === 'text' && data.text) {
            await api.ingestText(data.text, data.title);
        }

        // Refresh feed after upload
        // const newFacts = await api.getFeedFacts();
    };

    const handleChatMessage = async (message: string) => {
        const currentVideoId = videos[activeIndex]?.id;
        const response = await api.chat(message, currentVideoId);
        return {
            message: response.message || "Let me think about that~",
            mascot: response.mascot || 'seal',
            mascotEmotion: response.mascot_emotion || 'happy',
            suggestedQuestions: response.suggested_questions || [],
        };
    };

    const renderItem = ({ item, index }: { item: Video; index: number }) => (
        <VideoCard
            video={item}
            isActive={index === activeIndex}
            onLike={() => handleLike(item.id)}
            onSave={() => handleSave(item.id)}
            onLoopComplete={(count) => handleLoopComplete(item.id, count)}
        />
    );

    return (
        <View style={styles.container}>
            {/* Video Feed */}
            <FlatList
                ref={flatListRef}
                data={videos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                snapToInterval={screenHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                    length: screenHeight,
                    offset: screenHeight * index,
                    index,
                })}
            />

            {/* Add Content Button */}
            <View style={styles.addButton}>
                <DewiDuoFAB
                    onPress={() => setIsUploadOpen(true)}
                    mascotState="idle"
                    size={56}
                />
            </View>

            {/* Dewi Duo Chat FAB */}
            <DewiDuoFAB
                onPress={() => setIsChatOpen(true)}
                mascotState="idle"
            />

            {/* Chat Overlay */}
            <ChatOverlay
                visible={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                videoId={videos[activeIndex]?.id}
                onSendMessage={handleChatMessage}
            />

            {/* Upload Modal */}
            <UploadModal
                visible={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.penguinCharcoal,
    },
    addButton: {
        position: 'absolute',
        bottom: 32,
        left: 20,
        zIndex: 1000,
    },
});

export default FeedScreen;
