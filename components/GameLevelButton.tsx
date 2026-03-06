import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface GameLevelButtonProps {
    level: number;
    status: 'locked' | 'current' | 'completed';
    onPress: () => void;
    style?: any;
}

export const GameLevelButton: React.FC<GameLevelButtonProps> = ({
    level,
    status,
    onPress,
    style,
}) => {
    // Animation Values
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const translateY = useSharedValue(0);
    const innerLightOpacity = useSharedValue(0.6);

    // Continuous breathing animation for current/completed levels
    useEffect(() => {
        if (status !== 'locked') {
            translateY.value = withRepeat(
                withSequence(
                    withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );
        }
    }, [status]);

    const handlePressIn = () => {
        if (status === 'locked') return;
        // Squish effect
        scaleX.value = withSpring(1.15, { damping: 10 });
        scaleY.value = withSpring(0.85, { damping: 10 });
        innerLightOpacity.value = withTiming(0.8);
    };

    const handlePressOut = () => {
        if (status === 'locked') return;
        // Boing back
        scaleX.value = withSpring(1, { damping: 4, stiffness: 200 });
        scaleY.value = withSpring(1, { damping: 4, stiffness: 200 });
        innerLightOpacity.value = withTiming(0.6);
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scaleX: scaleX.value },
            { scaleY: scaleY.value },
            { translateY: translateY.value }
        ]
    }));

    // Visual configurations based on status
    const isLocked = status === 'locked';

    // Transparent Green Jelly Colors
    // Top gradient: Lighter, transparent
    // Bottom gradient: Darker, more opaque but still see-through
    const jellyColors = isLocked
        ? ['#D1D5DB', '#9CA3AF'] // Grey for locked
        : ['rgba(132, 255, 99, 0.8)', 'rgba(64, 189, 2, 0.85)']; // Green transparent!

    // Border color
    const borderColor = isLocked ? '#6B7280' : 'rgba(56, 160, 0, 0.6)';

    return (
        <Animated.View style={[styles.container, style, animatedStyle]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLocked}
                style={[styles.buttonWrapper]}
            >
                {/* Main Jelly Body */}
                <LinearGradient
                    colors={jellyColors as any}
                    style={[styles.jellyBody, { borderColor: borderColor }]}
                    start={{ x: 0.3, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                >
                    {/* Inner Refraction/Highlight (The "Jelly" Shine) */}
                    <View style={styles.highlightContainer}>
                        <View style={styles.shineWait} />
                        <View style={styles.shineDot} />
                    </View>

                    {/* Content */}
                    {isLocked ? (
                        <Ionicons name="lock-closed" size={24} color="rgba(255,255,255,0.7)" />
                    ) : (
                        <Text style={styles.levelText}>{level}</Text>
                    )}
                </LinearGradient>

                {/* Shadow (Separate to not scale with squish weirdly, or maybe it should?) 
                    Actually putting shadow on the wrapper or separate view below is better for 'floating' jelly
                */}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        // Drop shadow for the whole button
        shadowColor: '#4ca302',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonWrapper: {
        width: 70,
        height: 70,
    },
    jellyBody: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1, // Subtle rim
        borderBottomWidth: 4, // Thicker bottom for depth
    },
    highlightContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 35,
        overflow: 'hidden',
    },
    shineWait: {
        position: 'absolute',
        top: 8,
        left: 12,
        width: 25,
        height: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        transform: [{ rotate: '-20deg' }],
    },
    shineDot: {
        position: 'absolute',
        top: 10,
        right: 18,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    levelText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 50, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 2,
    },
});

export default GameLevelButton;
