/**
 * Dewi Design System - Arctic Minimal Theme
 * Color palette, typography, and spacing tokens
 */

// ============ COLORS ============
export const colors = {
    // Core Palette
    arcticWhite: '#FAFBFC',
    softGray: '#E8EAED',
    mediumGray: '#9AA0A6',
    sealGray: '#8E9AAF',
    penguinCharcoal: '#2D3436',

    // Accent Colors
    accentMint: '#A8E6CF',
    accentMintDark: '#7BC9AB',
    accentLavender: '#DCD6F7',
    accentLavenderDark: '#B8ADE8',
    accentCoral: '#FFB5A7',
    accentCoralDark: '#FF9B8A',

    // Semantic Colors
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#2D3436',
    textMuted: '#9AA0A6',

    // Status Colors
    success: '#A8E6CF',
    warning: '#FFE0B2',
    error: '#FFB5A7',
    info: '#DCD6F7',

    // SRS Status Colors
    srsNew: '#DCD6F7',      // Lavender
    srsHard: '#FFB5A7',     // Coral
    srsLearning: '#FFE0B2', // Amber
    srsMastered: '#A8E6CF', // Mint
};

// ============ TYPOGRAPHY ============
export const typography = {
    fontFamily: {
        heading: 'System',
        body: 'System',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 22,
        xxl: 28,
        hero: 36,
    },

    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.7,
    },
};

// ============ SPACING ============
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// ============ BORDER RADIUS ============
export const borderRadius = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 9999,
};

// ============ SHADOWS ============
export const shadows = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 3,
    },

    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 5,
    },

    strong: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 30,
        elevation: 8,
    },
};

// ============ ANIMATION DURATIONS ============
export const animation = {
    fast: 150,
    normal: 300,
    slow: 500,
    mascot: 800,
};

// ============ BREAKPOINTS ============
export const breakpoints = {
    phone: 0,
    tablet: 768,
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    breakpoints,
};
