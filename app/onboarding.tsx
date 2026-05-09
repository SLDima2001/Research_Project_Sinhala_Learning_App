import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'Welcome to Sinhala Class',
        description: 'Start your adventure into the beautiful world of Sinhala language with our friendly village guides!',
        image: require('../assets/images/mascot_aliya.png'),
        color: Colors.leafGreen,
    },
    {
        id: '2',
        title: 'Learn Letters',
        description: 'Master the Sinhala alphabet with interactive handwriting practice and real-time AI feedback!',
        image: require('../assets/images/ob_char_letters.png'),
        color: Colors.skyBlue,
    },
    {
        id: '3',
        title: 'Play Learning Games',
        description: 'Have fun with voice challenges, interactive stories, and AI-powered learning games!',
        image: require('../assets/images/ob_char_games.png'),
        color: Colors.sunnyYellow,
    },
    {
        id: '4',
        title: 'Track Your Progress',
        description: 'Earn stars, unlock achievements, and see your skills grow as you explore the village!',
        image: require('../assets/images/ob_char_progress.png'),
        color: Colors.pastelPurple,
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const handleNext = async () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            await completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('has_seen_walkthrough_v1', 'true');
            router.replace('/auth/login' as any);
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            router.replace('/auth/login' as any);
        }
    };

    const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0], index: number }) => (
        <View style={[styles.slide, { backgroundColor: item.color }]}>
            <SafeAreaView style={styles.contentContainer} edges={['top']}>
                <Animated.View entering={FadeIn.delay(200)} style={styles.imageContainer}>
                    <Image source={item.image} style={styles.image} resizeMode="contain" />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400)} style={styles.textWrapper}>
                    {}
                    <View style={styles.svgContainer}>
                        <Svg
                            height="100"
                            width={width}
                            viewBox={`0 0 ${width} 100`}
                            preserveAspectRatio="none"
                            style={styles.waveSvg}
                        >
                            <Path
                                d={`M0 40 C ${width / 4} 0, ${width / 2} 80, ${width} 40 V 100 H 0 Z`}
                                fill="white"
                            />
                        </Svg>
                    </View>
                    <View style={styles.whiteSection}>
                        <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        <View style={styles.footer}>
                            <View style={styles.pagination}>
                                {ONBOARDING_DATA.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.dot,
                                            { backgroundColor: i === currentIndex ? item.color : '#E2E8F0' },
                                            i === currentIndex && { width: 24 }
                                        ]}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity 
                                style={[styles.nextButton, { backgroundColor: item.color }]} 
                                onPress={handleNext}
                            >
                                <Text style={styles.nextText}>
                                    {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                                </Text>
                                <Ionicons 
                                    name={currentIndex === ONBOARDING_DATA.length - 1 ? 'checkmark' : 'arrow-forward'} 
                                    size={20} 
                                    color="white" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    setCurrentIndex(Math.round(x / width));
                }}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        height,
    },
    contentContainer: {
        flex: 1,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginBottom: -30, 
    },
    image: {
        width: width * 0.75,
        height: width * 0.75,
    },
    textWrapper: {
        width: '100%',
    },
    svgContainer: {
        width: width,
        height: 100,
        marginBottom: -1, 
    },
    waveSvg: {
        position: 'absolute',
        bottom: 0,
    },
    whiteSection: {
        backgroundColor: 'white',
        paddingHorizontal: 32,
        paddingBottom: 40,
        paddingTop: 0,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        width: 8,
        borderRadius: 4,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    nextText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
