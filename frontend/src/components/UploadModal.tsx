/**
 * UploadModal - Content ingestion interface
 * Supports PDF, YouTube, images, and text
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import type { ContentType } from '../types';

interface UploadModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (type: ContentType, data: any) => Promise<void>;
}

const { width: screenWidth } = Dimensions.get('window');

export const UploadModal: React.FC<UploadModalProps> = ({
    visible,
    onClose,
    onUpload,
}) => {
    const [selectedType, setSelectedType] = useState<ContentType | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const contentTypes: { type: ContentType; icon: string; label: string }[] = [
        { type: 'pdf', icon: '📄', label: 'PDF' },
        { type: 'youtube', icon: '🎬', label: 'YouTube' },
        { type: 'image', icon: '📷', label: 'Photo' },
        { type: 'pptx', icon: '📊', label: 'Slides' },
        { type: 'text', icon: '📝', label: 'Text' },
    ];

    const handleSubmit = async () => {
        if (!selectedType) return;

        setIsLoading(true);
        setError(null);

        try {
            await onUpload(selectedType, {
                url: selectedType === 'youtube' ? inputValue : undefined,
                text: selectedType === 'text' ? inputValue : undefined,
                title: title || undefined,
            });
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedType(null);
        setInputValue('');
        setTitle('');
        setError(null);
        onClose();
    };

    const showInputField = selectedType === 'youtube' || selectedType === 'text';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {selectedType ? 'Add Details' : 'Drop your brain food! 🧠'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Type Selection */}
                    {!selectedType && (
                        <View style={styles.typeGrid}>
                            {contentTypes.map((item) => (
                                <TouchableOpacity
                                    key={item.type}
                                    style={styles.typeButton}
                                    onPress={() => setSelectedType(item.type)}
                                >
                                    <Text style={styles.typeIcon}>{item.icon}</Text>
                                    <Text style={styles.typeLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Input Fields */}
                    {selectedType && (
                        <View style={styles.inputContainer}>
                            {/* Title Input */}
                            <TextInput
                                style={styles.input}
                                placeholder="Title (optional)"
                                placeholderTextColor={colors.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />

                            {/* URL or Text Input */}
                            {showInputField && (
                                <TextInput
                                    style={[
                                        styles.input,
                                        selectedType === 'text' && styles.textArea,
                                    ]}
                                    placeholder={
                                        selectedType === 'youtube'
                                            ? 'Paste YouTube URL...'
                                            : 'Paste your notes here...'
                                    }
                                    placeholderTextColor={colors.textMuted}
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    multiline={selectedType === 'text'}
                                    numberOfLines={selectedType === 'text' ? 6 : 1}
                                />
                            )}

                            {/* File Picker Placeholder */}
                            {(selectedType === 'pdf' || selectedType === 'image') && (
                                <TouchableOpacity style={styles.filePicker}>
                                    <Text style={styles.filePickerIcon}>📁</Text>
                                    <Text style={styles.filePickerText}>
                                        Tap to select {selectedType.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Error Message */}
                            {error && <Text style={styles.errorText}>{error}</Text>}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isLoading && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={colors.arcticWhite} />
                                ) : (
                                    <Text style={styles.submitText}>
                                        ✨ Process Content ✨
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Back Button */}
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setSelectedType(null)}
                            >
                                <Text style={styles.backText}>← Choose different type</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Mascot Decoration */}
                    <View style={styles.mascotDecoration}>
                        <Text style={styles.mascotEmoji}>🦭</Text>
                        <Text style={styles.mascotEmoji}>🐧</Text>
                    </View>
                </View>
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
    modal: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerText: {
        fontSize: typography.fontSize.xl,
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
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    typeButton: {
        width: (screenWidth - spacing.lg * 2 - spacing.md * 2) / 3,
        aspectRatio: 1,
        backgroundColor: colors.softGray,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeIcon: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    typeLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text,
    },
    inputContainer: {
        marginTop: spacing.md,
    },
    input: {
        backgroundColor: colors.softGray,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.text,
        marginBottom: spacing.md,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    filePicker: {
        backgroundColor: colors.softGray,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.accentMint,
    },
    filePickerIcon: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    filePickerText: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
    },
    errorText: {
        color: colors.accentCoral,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: colors.accentMint,
        borderRadius: borderRadius.pill,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
        ...shadows.soft,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitText: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.penguinCharcoal,
    },
    backButton: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    backText: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
    },
    mascotDecoration: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    mascotEmoji: {
        fontSize: 24,
        marginHorizontal: spacing.xs,
    },
});

export default UploadModal;
