import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    const handleGetStarted = async () => {
        try {
            const hasSeenWalkthrough = await AsyncStorage.getItem('has_seen_walkthrough_v1');
            if (hasSeenWalkthrough === 'true') {
                router.push('/auth/login' as any);
            } else {
                router.push('/onboarding' as any);
            }
        } catch (e) {
            router.push('/onboarding' as any);
        }
    };

    const handleLogin = () => {
        router.push('/auth/login' as any);
    };

    return (
        <View style={styles.container}>
            {/* Background Decorations */}
            <View style={styles.bgDecor}>
                <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
                    <Circle cx={width * 0.1} cy={height * 0.1} r={60} fill={Colors.sunnyYellow} opacity={0.3} />
                    <Circle cx={width * 0.9} cy={height * 0.3} r={100} fill={Colors.skyBlue} opacity={0.2} />
                    <Circle cx={width * 0.2} cy={height * 0.8} r={80} fill={Colors.leafGreen} opacity={0.2} />
                </Svg>
            </View>

            <SafeAreaView style={styles.content}>
                <Animated.View entering={FadeInDown.duration(800)} style={styles.topSection}>
                    <Text style={styles.welcomeText}>ආයුබෝවන්!</Text>
                    <Text style={styles.brandName}>Sinhala Class</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(1000).delay(200)} style={styles.mascotContainer}>
                    <Image
                        source={require('../assets/images/mascot_aliya.png')}
                        style={styles.mascot}
                        resizeMode="contain"
                    />
                    <View style={styles.bubble}>
                        <Text style={styles.bubbleText}>Let's learn Sinhala with me!</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(800).delay(400)} style={styles.bottomSection}>
                    <Text style={styles.tagline}>
                        An interactive adventure for kids to master the beautiful Sinhala language.
                    </Text>

                    <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginContainer} onPress={handleLogin}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bgDecor: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    topSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.leafGreen,
        marginBottom: 5,
    },
    brandName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4A5568',
    },
    mascotContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    mascot: {
        width: width * 0.7,
        height: width * 0.7,
    },
    bubble: {
        backgroundColor: Colors.skyBlue,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 0,
        marginTop: -10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    bubbleText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bottomSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    tagline: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    getStartedButton: {
        backgroundColor: Colors.leafGreen,
        paddingVertical: 18,
        paddingHorizontal: 60,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: Colors.leafGreen,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
    },
    loginContainer: {
        marginTop: 25,
    },
    loginText: {
        fontSize: 15,
        color: '#718096',
    },
    loginLink: {
        color: Colors.leafGreen,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
