import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScoreDisplay from '@/components/ScoreDisplay';
import { RecordingButton } from '@/components/RecordingButton';
import { KaraokeDisplay } from '@/components/KarokeDisplay';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';

const { width } = Dimensions.get('window');

const API_IP = '192.168.1.108';
const API_URL = `http://${API_IP}:5000/api`;

// Offline fallback sentences shown if API is unreachable
const OFFLINE_SESSIONS = [
    { id: 'off_001', text: 'ආයුබෝවන් සුභ දවසක්', words: ['ආයුබෝවන්', 'සුභ', 'දවසක්'], translation: 'Good day!' },
    { id: 'off_002', text: 'ඔබ කොහෙද යන්නේ', words: ['ඔබ', 'කොහෙද', 'යන්නේ'], translation: 'Where are you going?' },
    { id: 'off_003', text: 'මගේ නම සිතාරා', words: ['මගේ', 'නම', 'සිතාරා'], translation: 'My name is Sitara' },
    { id: 'off_004', text: 'ඔබට ස්තූතියි', words: ['ඔබට', 'ස්තූතියි'], translation: 'Thank you' },
    { id: 'off_005', text: 'ගෙදර යමු', words: ['ගෙදර', 'යමු'], translation: "Let's go home" },
    { id: 'off_006', text: 'ඔයා කොහොමද', words: ['ඔයා', 'කොහොමද'], translation: 'How are you?' },
    { id: 'off_007', text: 'අම්මා හොඳ කෑම හදනවා', words: ['අම්මා', 'හොඳ', 'කෑම', 'හදනවා'], translation: 'Mother cooks good food' },
    { id: 'off_008', text: 'ලංකාව ලස්සන රටක්', words: ['ලංකාව', 'ලස්සන', 'රටක්'], translation: 'Sri Lanka is a beautiful country' },
    { id: 'off_009', text: 'හිරු එළිය ලස්සනයි', words: ['හිරු', 'එළිය', 'ලස්සනයි'], translation: 'The sunlight is beautiful' },
    { id: 'off_010', text: 'කලාව ජීවිතය සුන්දර කරයි', words: ['කලාව', 'ජීවිතය', 'සුන්දර', 'කරයි'], translation: 'Art makes life beautiful' },
];

// Convert API sentence to component session format
const toSession = (s: any) => ({
    id: s.id || String(Math.random()),
    text: s.text || '',
    words: s.words || (s.text ? s.text.split(' ') : []),
    translation: s.translation || '',
});

export default function VoiceFeedbackScreen() {
    const [sessions, setSessions] = useState<any[]>(OFFLINE_SESSIONS);
    const [loadingSentences, setLoadingSentences] = useState(true);
    const [score, setScore] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [karaokeMode, setKaraokeMode] = useState<'idle' | 'playback' | 'recording'>('idle');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [words, setWords] = useState<any[]>(
        OFFLINE_SESSIONS[0].words.map(w => ({ text: w, status: 'pending' }))
    );
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackCorrect, setFeedbackCorrect] = useState(false);
    const [sessionIndex, setSessionIndex] = useState(0);

    // Fetch sentences from MongoDB backend on mount
    useEffect(() => {
        const fetchSentences = async () => {
            try {
                const response = await fetch(`${API_URL}/sentences/random?count=20`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                const fetched = (data.sentences || []).map(toSession);
                if (fetched.length > 0) {
                    setSessions(fetched);
                    setWords(fetched[0].words.map((w: string) => ({ text: w, status: 'pending' })));
                    console.log(`Loaded ${fetched.length} sentences from ${data.source || 'API'}`);
                }
            } catch (error) {
                console.warn('Using offline sentences fallback:', error);
            } finally {
                setLoadingSentences(false);
            }
        };
        fetchSentences();
    }, []);

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setKaraokeMode('recording');
            setCurrentWordIndex(0);
            setFeedbackVisible(false);

            let i = 0;
            const interval = setInterval(() => {
                i++;
                if (i >= words.length) {
                    clearInterval(interval);
                    finishRecording();
                } else {
                    setCurrentWordIndex(i);
                }
            }, 1000);
        } else {
            finishRecording();
        }
    };

    const finishRecording = () => {
        setIsRecording(false);
        setKaraokeMode('idle');

        const isCorrect = Math.random() > 0.3;
        const earnedPoints = isCorrect
            ? Math.floor(Math.random() * 21) + 80
            : Math.floor(Math.random() * 40) + 20;

        const updatedWords = words.map(w => ({
            ...w,
            status: isCorrect ? 'correct' : (Math.random() > 0.5 ? 'correct' : 'incorrect'),
        }));
        setWords(updatedWords);
        setScore(earnedPoints);
        setFeedbackCorrect(isCorrect);
        setFeedbackVisible(true);
        setTimeout(() => setFeedbackVisible(false), 3000);
    };

    const nextSession = () => {
        const nextIdx = (sessionIndex + 1) % sessions.length;
        setSessionIndex(nextIdx);
        setWords(sessions[nextIdx].words.map((w: string) => ({ text: w, status: 'pending' })));
        setScore(0);
        setCurrentWordIndex(0);
        setKaraokeMode('idle');
        setFeedbackVisible(false);
    };

    const playAudio = () => {
        setKaraokeMode('playback');
        setCurrentWordIndex(0);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            if (i >= words.length) {
                clearInterval(interval);
                setKaraokeMode('idle');
            } else {
                setCurrentWordIndex(i);
            }
        }, 800);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.pageHeader}>
                <Ionicons name="mic-circle" size={28} color="#2196F3" />
                <Text style={styles.pageTitle}>Pronunciation Practice</Text>
                {!loadingSentences && (
                    <Text style={styles.sessionCount}>{sessionIndex + 1}/{sessions.length}</Text>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.card}>
                    <ScoreDisplay score={score} maxScore={100} showStars />
                </View>

                <View style={[styles.card, styles.karaokeCard]}>
                    <View style={styles.karaokeHeader}>
                        <Text style={styles.instruction}>Read the sentence aloud:</Text>
                        <Ionicons
                            name="volume-medium"
                            size={24}
                            color="#666"
                            onPress={playAudio}
                            style={styles.audioIcon}
                        />
                    </View>

                    {loadingSentences ? (
                        <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#2196F3" />
                            <Text style={{ color: '#666', marginTop: 8 }}>Loading sentences...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={{ height: 120, justifyContent: 'center' }}>
                                <KaraokeDisplay
                                    words={words}
                                    currentWordIndex={currentWordIndex}
                                    mode={karaokeMode}
                                    fontSize={32}
                                />
                            </View>
                            {sessions[sessionIndex]?.translation ? (
                                <Text style={styles.translationText}>
                                    {sessions[sessionIndex].translation}
                                </Text>
                            ) : null}
                        </>
                    )}
                </View>

                <View style={styles.recordingArea}>
                    <Text style={styles.recordingText}>
                        {isRecording ? 'Listening... Speak now!' : 'Tap to start speaking'}
                    </Text>
                    <RecordingButton isRecording={isRecording} onPress={toggleRecording} />
                </View>

                <View style={styles.controls}>
                    <Text style={styles.controlBtn} onPress={nextSession}>
                        Skip to Next Sentence →
                    </Text>
                </View>

            </ScrollView>

            <FeedbackDisplay
                isCorrect={feedbackCorrect}
                visible={feedbackVisible}
                score={score}
                maxScore={100}
                message={feedbackCorrect ? 'Excellent Pronunciation! 🎉' : 'Needs Improvement! 💪'}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 10,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
    },
    sessionCount: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
    scroll: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    karaokeCard: {
        paddingVertical: 24,
    },
    karaokeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    instruction: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
    },
    audioIcon: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
    },
    translationText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    recordingArea: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        marginVertical: 10,
    },
    recordingText: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
        fontWeight: '500',
    },
    controls: {
        alignItems: 'center',
        marginTop: 10,
    },
    controlBtn: {
        color: '#2196F3',
        fontWeight: 'bold',
        fontSize: 16,
        padding: 10,
    },
});
