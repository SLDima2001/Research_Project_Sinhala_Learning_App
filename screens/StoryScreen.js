import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, useWindowDimensions, ToastAndroid, Platform, Modal, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { getStory } from '../services/api';
// Legacy Components
import NarrativeScene from '../components/story/NarrativeScene';
import DecisionScene from '../components/story/DecisionScene';
import ActivityScene from '../components/story/ActivityScene';
import QuizScene from '../components/story/QuizScene';
// New Video Components
import InteractionOverlay from '../components/story/InteractionOverlay';

export default function StoryScreen({ route, navigation }) {
    const { storyId } = route.params;
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);

    // Legacy State
    const [currentSceneId, setCurrentSceneId] = useState('scene_1_intro');
    
    // Video Engine State
    const videoRef = useRef(null);
    const [currentSegmentId, setCurrentSegmentId] = useState('segment_1_intro');
    const [interactionData, setInteractionData] = useState(null); // Used for both choices and questions
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [videoSource, setVideoSource] = useState(null); 
    const [userHistory, setUserHistory] = useState([]); 
    
    // NEW: Question State
    const [activeTimestamps, setActiveTimestamps] = useState([]);
    const [activeQuestions, setActiveQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [isQuestionMode, setIsQuestionMode] = useState(false);

    // UI State
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    useEffect(() => {
        loadStoryData();
        return () => {
             // Screen orientation unlock removed
        };
    }, []);

    const loadStoryData = async () => {
        const data = await getStory(storyId);
        if (data) {
            console.log("RECEIVED STORY DATA:", JSON.stringify(data, null, 2)); 
            setStory(data);
            if (data.type === 'video_interactive') {
               try {
                   // Screen orientation lock removed
               } catch (error) { console.warn(error); }
               setCurrentSegmentId(Object.keys(data.segments)[0]); 
            } else if (data.scenes && !data.scenes['scene_1_intro']) {
               setCurrentSceneId(Object.keys(data.scenes)[0]);
            }
        }
        setLoading(false);
    };

    // ==========================================
    // VIDEO ASSET LOADER (Fixes NAL Error)
    // ==========================================
    useEffect(() => {
        if (!story || story.type !== 'video_interactive') return;

        const segment = story.segments[currentSegmentId];
        const videoId = segment?.video_id;

        const loadVideo = async () => {
            if (!segment) return;

            // Priority 1: Direct URL from Database (User Request: "videos path only add the database")
            if (segment.video_url && segment.video_url.trim() !== '') {
                console.log(`Using Database Video URL: ${segment.video_url}`);
                setVideoSource({ uri: segment.video_url });
                return;
            }

            // Priority 2: Legacy Local Asset Map ("show the previous wize")
            if (!videoId) return;
            
            try {
                // Return if we already have this source loaded (optimisation)
                // But simple approach is safer: reset -> load -> set
                setVideoSource(null); 

                const { getVideoSource } = require('../services/videoMap');
                const resourceId = getVideoSource(videoId);
                
                if (resourceId) {
                    console.log(`Downloading asset for: ${videoId}`);
                    const asset = Asset.fromModule(resourceId);
                    await asset.downloadAsync();
                    
                    const uri = asset.localUri || asset.uri;
                    console.log(`Asset ready: ${uri}`);
                    setVideoSource({ uri: uri });
                } else {
                     console.warn(`No local asset found for video_id: ${videoId}`);
                }

            } catch (error) {
                console.error("Asset Download Error:", error);
                ToastAndroid.show("Video Load Error", ToastAndroid.SHORT);
            }
        };

        const setupQuestions = () => {
            if (!segment) return;
            const timestamps = segment.question_timestamps || [];
            const pool = segment.question_pool || [];
            
            if (timestamps.length > 0) {
                const sortedTimestamps = [...timestamps].sort((a,b)=>a-b);
                const selectedQuestions = [];
                
                // For each timestamp, find matching questions, or fallback to random
                sortedTimestamps.forEach(ts => {
                    const matchingQuestions = pool.filter(q => q.timestamp === ts);
                    if (matchingQuestions.length > 0) {
                        const randomMatch = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
                        selectedQuestions.push(randomMatch);
                    } else {
                        // Fallback logic if no timestamp match
                        const unselected = pool.filter(q => !selectedQuestions.includes(q));
                        if(unselected.length > 0) {
                             selectedQuestions.push(unselected[Math.floor(Math.random() * unselected.length)]);
                        }
                    }
                });
                
                setActiveTimestamps(sortedTimestamps);
                setActiveQuestions(selectedQuestions);
                console.log(`Prepared ${selectedQuestions.length} timestamp-matched questions for segment ${currentSegmentId}`);
            } else {
                setActiveTimestamps([]);
                setActiveQuestions([]);
            }
        };

        loadVideo();
        setupQuestions();

    }, [currentSegmentId, story]); // Re-run when segment changes


    // ==========================================
    // VIDEO LOGIC
    // ==========================================
    const handleVideoUpdate = (status) => {
        if (!status.isLoaded || !story || story.type !== 'video_interactive') return;
        setPlaybackStatus(status);

        const segment = story.segments[currentSegmentId];
        if (!segment) return; 

        // Match end time to finish segment
        if ((status.isPlaying && status.positionMillis >= segment.end_time) || status.didJustFinish) {
            videoRef.current.pauseAsync();
            const nextId = segment.next_segment_id;
            
            if (story.interactions[nextId]) {
                setInteractionData(story.interactions[nextId]);
            } else if (nextId === 'end_screen') {
                handleVideoEnd();
            } else {
                 changeSegment(nextId);
            }
            return;
        }

        // NEW: Check active timestamps
        if (status.isPlaying && activeTimestamps.length > 0) {
            const nextTimestamp = activeTimestamps[0];
            // If we have passed the timestamp
            if (status.positionMillis >= nextTimestamp) {
                // Pause the video
                videoRef.current.pauseAsync();
                
                // Show question popup
                const questionToAsk = activeQuestions[0];
                setCurrentQuestion(questionToAsk);
                setIsQuestionMode(true);
                
                // Remove this timestamp and question from the pending queues
                setActiveTimestamps(prev => prev.slice(1));
                setActiveQuestions(prev => prev.slice(1));
            }
        }
    };


    const handleOptionSelect = (option) => {
        setUserHistory(prev => [...prev, {
            interaction: interactionData.text,
            choice: option.text,
            isCorrect: option.is_correct
        }]);

        if (interactionData.type === 'quiz' && Platform.OS === 'android') {
            ToastAndroid.show(
                option.is_correct ? "Correct! Great job!" : "Incorrect, but let's continue!",
                ToastAndroid.SHORT
            );
        }
        proceedToNext(option.next_segment_id);
    };

    const handleQuestionAnswer = (selectedIndex) => {
        const isCorrect = selectedIndex === currentQuestion.correct_index;
        
        if(isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            if (Platform.OS === 'android') ToastAndroid.show("Correct!", ToastAndroid.SHORT);
        } else {
            setIncorrectAnswers(prev => prev + 1);
            if (Platform.OS === 'android') ToastAndroid.show("Incorrect", ToastAndroid.SHORT);
        }
        
        setUserHistory(prev => [...prev, {
            question: currentQuestion.text,
            isCorrect: isCorrect
        }]);

        // Cleanup question state and resume
        setIsQuestionMode(false);
        setCurrentQuestion(null);
        videoRef.current.playAsync();
    };

    const proceedToNext = async (nextId) => {
        // 1. Check if next step is another interaction (Chained Quiz)
        if (story.interactions[nextId]) {
            setInteractionData(story.interactions[nextId]);
            return;
        }

        // 2. Hide current overlay if moving to video/end
        setInteractionData(null);
        
        if (nextId === 'end_screen') {
            handleVideoEnd();
            return;
        }

        // 3. Change Video Segment
        changeSegment(nextId);
    };

    const changeSegment = async (segmentId) => {
        const segment = story.segments[segmentId];
        if (!segment) return;
        
        // Clean switch
        setInteractionData(null);
        setPlaybackStatus(null);
        setIsQuestionMode(false);
        
        setStory(prev => ({...prev, _reloading: true}));
        
        // Small delay to allow UI to clear before mounting new video
        setTimeout(() => {
            setCurrentSegmentId(segmentId);
            setStory(prev => ({...prev, _reloading: false}));
        }, 100);
    };

    const handleVideoEnd = async () => {
        // Includes choice interactions (filter) AND regular question history
        const points = correctAnswers * 10;
        
        const resultData = {
            storyId,
            mode: 'video_interactive',
            points: points,
            correct: correctAnswers,
            incorrect: incorrectAnswers,
            history: userHistory,
            completedAt: new Date().toISOString()
        };

        try {
            const existing = await AsyncStorage.getItem('user_progress');
            let progress = existing ? JSON.parse(existing) : [];
            progress.push(resultData);
            await AsyncStorage.setItem('user_progress', JSON.stringify(progress));
        } catch (e) {
            console.error("Failed to save progress", e);
        }

        setFinalScore(points);
        setShowScoreModal(true);
    };

    const handleTryAgain = () => {
        // Reset ALL progress
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        setUserHistory([]);
        setFinalScore(0);
        setShowScoreModal(false);
        
        // Reset back to intro segment and reload
        const firstSegmentId = Object.keys(story.segments)[0];
        changeSegment(firstSegmentId);
    };

    // ==========================================
    // RENDER
    // ==========================================
    if (loading || !story) return <View style={styles.center}><Text>Loading...</Text></View>;

    // 1. VIDEO INTERACTIVE MODE
    if (story.type === 'video_interactive') {
        const segment = story.segments[currentSegmentId];
        const videoId = segment?.video_id;

        // Transition State
        if (story._reloading || !videoSource) {
            return (
                <View style={[styles.center, {backgroundColor: 'black'}]}>
                    <Text style={{color: 'white'}}>Loading Video...</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.videoWrapper}>
                    <Video
                        key={`${videoId}_${currentSegmentId}`}
                        ref={videoRef}
                        style={styles.fullscreenVideo}
                        source={videoSource}
                        useNativeControls={true} 
                        resizeMode={isLandscape ? ResizeMode.COVER : ResizeMode.CONTAIN}
                        shouldPlay={true}
                        progressUpdateIntervalMillis={100}
                        onPlaybackStatusUpdate={handleVideoUpdate}
                        onLoad={() => {
                            if (segment && segment.start_time > 0) {
                                videoRef.current.setPositionAsync(segment.start_time);
                            }
                        }}
                        onError={(error) => {
                            console.error("VIDEO ERROR:", error);
                            ToastAndroid.show("Video Error: " + error, ToastAndroid.LONG);
                        }}
                    />
                </View>

                {/* DEBUG INFO */}
                {/* <View style={styles.debugBox}>
                    <Text style={styles.debugText}>DEBUG: {currentSegmentId}</Text>
                    <Text style={styles.debugText}>Vid: {videoId}</Text>
                    <Text style={styles.debugText}>Src: {videoSource?.uri ? 'Loaded' : 'Pending'}</Text>
                </View> */}

                {/* Branch Choice Overlay */}
                {interactionData && !isQuestionMode && (
                    <InteractionOverlay 
                        interaction={interactionData} 
                        onOptionSelect={handleOptionSelect} 
                    />
                )}

                {/* Question Mode Overlay */}
                {isQuestionMode && currentQuestion && (
                     <View style={[StyleSheet.absoluteFill, styles.questionOverlay]}>
                         <View style={styles.questionCard}>
                             <Text style={styles.questionText}>{currentQuestion.text}</Text>
                             
                             <View style={styles.optionsContainer}>
                                {currentQuestion.options.map((optionText, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.questionOptionBtn}
                                        onPress={() => handleQuestionAnswer(index)}
                                    >
                                        <Text style={styles.questionOptionText}>{optionText}</Text>
                                    </TouchableOpacity>
                                ))}
                             </View>
                         </View>
                     </View>
                )}

                {/* 3. FINAL SCORE MODAL */}
                <Modal
                    transparent={true}
                    visible={showScoreModal}
                    animationType="fade"
                    onRequestClose={() => navigation.goBack()}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Congratulations!</Text>
                            <Text style={styles.modalSubtitle}>You finished the story!</Text>
                            
                            <View style={styles.scoreDetailsRow}>
                                <View style={styles.scoreBox}>
                                    <Text style={styles.scoreLabel}>Correct</Text>
                                    <Text style={[styles.scoreValue, {color: 'green'}]}>{correctAnswers}</Text>
                                </View>
                                <View style={styles.scoreBox}>
                                    <Text style={styles.scoreLabel}>Incorrect</Text>
                                    <Text style={[styles.scoreValue, {color: 'red'}]}>{incorrectAnswers}</Text>
                                </View>
                            </View>

                            <View style={styles.scoreContainer}>
                                <Text style={styles.scoreLabel}>Final Score</Text>
                                <Text style={styles.scoreValue}>{finalScore}</Text>
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.tryAgainButton} onPress={handleTryAgain}>
                                    <Text style={styles.tryAgainButtonText}>Try Again</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.finishButton}
                                    onPress={() => {
                                        setShowScoreModal(false);
                                        navigation.goBack();
                                    }}
                                >
                                    <Text style={styles.finishButtonText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    } 

    // 2. LEGACY SCENE MODE
    const scene = story.scenes[currentSceneId];
    if (!scene) return <View style={styles.center}><Text>Scene not found</Text></View>;
    const sceneType = scene.type || 'narrative';

    const handleLegacyNext = (nextId) => {
        if (!nextId) { Alert.alert("End", "Finished!", [{ text: "Back", onPress: () => navigation.goBack()}]); return;}
        setCurrentSceneId(nextId);
    };

    return (
        <View style={styles.container}>
            {sceneType === 'narrative' && <NarrativeScene data={scene} onNext={handleLegacyNext} />}
            {sceneType === 'decision' && <DecisionScene data={scene} onNext={handleLegacyNext} />}
            {sceneType === 'activity' && <ActivityScene data={scene} onNext={handleLegacyNext} />}
            {sceneType === 'quiz' && <QuizScene data={scene} onNext={handleLegacyNext} />}
            {/* 3. FINAL SCORE MODAL */}
            <Modal
                transparent={true}
                visible={showScoreModal}
                animationType="fade"
                onRequestClose={() => navigation.goBack()}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Congratulations!</Text>
                        <Text style={styles.modalSubtitle}>You finished the story!</Text>
                        
                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreLabel}>Final Score</Text>
                            <Text style={styles.scoreValue}>{finalScore}</Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.finishButton}
                            onPress={() => {
                                setShowScoreModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={styles.finishButtonText}>Finish Story</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    videoWrapper: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    fullscreenVideo: { width: '100%', height: '100%' },
    debugBox: {
        position: 'absolute', top: 40, left: 20, 
        backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5
    },
    debugText: { color: 'white', fontSize: 10 },
    // Question Overlay Styles
    questionOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    questionCard: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 30, elevation: 10, alignItems: 'center'},
    questionText: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 25 },
    optionsContainer: { width: '100%' },
    questionOptionBtn: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    questionOptionText: { fontSize: 18, color: '#444', fontWeight: '500' },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    modalSubtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    scoreDetailsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
    scoreBox: { alignItems: 'center' },
    scoreContainer: { marginBottom: 30, alignItems: 'center', backgroundColor: '#FFF3E0', padding: 15, borderRadius: 15, width: '80%' },
    scoreLabel: { fontSize: 14, textTransform: 'uppercase', color: '#888', letterSpacing: 1, marginBottom: 5 },
    scoreValue: { fontSize: 48, fontWeight: 'bold', color: '#FFA500' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    tryAgainButton: { backgroundColor: '#ddd', paddingVertical: 12, flex: 1, marginRight: 10, borderRadius: 25, alignItems: 'center' },
    tryAgainButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
    finishButton: { backgroundColor: '#FFA500', paddingVertical: 12, flex: 1, marginLeft: 10, borderRadius: 25, alignItems: 'center' },
    finishButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
