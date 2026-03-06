import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScoreDisplay from '@/components/ScoreDisplay';
import { SentenceCard } from '@/components/SentenceCard';
import { GameLevelButton } from '@/components/GameLevelButton';
import { RecordingButton } from '@/components/RecordingButton';
import { KaraokeDisplay, KaraokeWord } from '@/components/KarokeDisplay';
import DrawingCanvas, { DrawingCanvasRef } from '@/components/DrawingCanvas';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import FairyBackground from '@/components/FairyBackground';

const { width } = Dimensions.get('window');

/* ──────────────────────────────────────────────
   Small helpers
────────────────────────────────────────────── */

const SectionHeader = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
    </View>
);

const ControlRow = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.controlRow}>{children}</View>
);

const CtrlBtn = ({
    label,
    color = '#6366F1',
    onPress,
    active = false,
}: {
    label: string;
    color?: string;
    onPress: () => void;
    active?: boolean;
}) => (
    <TouchableOpacity
        style={[styles.ctrlBtn, { backgroundColor: active ? color : '#EEF2FF', borderColor: color }]}
        onPress={onPress}
        activeOpacity={0.75}
    >
        <Text style={[styles.ctrlBtnText, { color: active ? '#fff' : color }]}>{label}</Text>
    </TouchableOpacity>
);

/* ──────────────────────────────────────────────
   Main Screen
────────────────────────────────────────────── */

export default function ComponentsTestScreen() {
    // === ScoreDisplay ===
    const [score, setScore] = useState(75);

    // === RecordingButton ===
    const [isRecording, setIsRecording] = useState(false);

    // === KaraokeDisplay ===
    const karaokeWords: KaraokeWord[] = [
        { text: 'ආයුබෝවන්', status: 'correct' },
        { text: 'සුභ', status: 'incorrect' },
        { text: 'දවසක්', status: 'pending' as any },
    ];
    const [karaokeMode, setKaraokeMode] = useState<'idle' | 'playback' | 'recording'>('idle');
    const [karaokeWordIdx, setKaraokeWordIdx] = useState(0);

    // === DrawingCanvas ===
    const canvasRef = useRef<DrawingCanvasRef>(null);

    // === FeedbackDisplay ===
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackCorrect, setFeedbackCorrect] = useState(true);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Page Title */}
            <View style={styles.pageHeader}>
                <Ionicons name="flask" size={22} color="#6366F1" />
                <Text style={styles.pageTitle}>Component Showcase</Text>
                <Text style={styles.pageBadge}>DEV</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── 1. ScoreDisplay ─────────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="🏆" title="ScoreDisplay" subtitle="Tap buttons to change score" />
                    <ScoreDisplay score={score} maxScore={100} showStars />
                    <ControlRow>
                        <CtrlBtn label="−10" color="#EF4444" onPress={() => setScore(s => Math.max(0, s - 10))} />
                        <CtrlBtn label="Reset" color="#6B7280" onPress={() => setScore(50)} />
                        <CtrlBtn label="+10" color="#10B981" onPress={() => setScore(s => Math.min(100, s + 10))} />
                    </ControlRow>
                    <ControlRow>
                        <CtrlBtn label="0 (0 ⭐)" color="#EF4444" onPress={() => setScore(0)} />
                        <CtrlBtn label="60 (1 ⭐)" color="#F59E0B" onPress={() => setScore(60)} />
                        <CtrlBtn label="75 (2 ⭐)" color="#3B82F6" onPress={() => setScore(75)} />
                        <CtrlBtn label="95 (3 ⭐)" color="#10B981" onPress={() => setScore(95)} />
                    </ControlRow>
                </View>

                {/* ── 2. SentenceCard ─────────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="🃏" title="SentenceCard" subtitle="Tap a card to trigger onPress" />
                    {[
                        { id: '1', text: 'ආයුබෝවන් – Easy sentence', difficulty: 'easy', completed: false },
                        { id: '2', text: 'ඔබ කොහෙද යයේ? – Medium sentence', difficulty: 'medium', completed: false },
                        { id: '3', text: 'සිංහල ඉගෙනීම ප්‍රීතිජනකයි. – Hard', difficulty: 'hard', completed: false },
                        { id: '4', text: 'Completed sentence example ✓', difficulty: 'easy', completed: true },
                    ].map(s => (
                        <SentenceCard
                            key={s.id}
                            sentence={s}
                            onPress={() => Alert.alert('SentenceCard pressed', `id: ${s.id}\n"${s.text}"`)}
                        />
                    ))}
                </View>

                {/* ── 3. GameLevelButton ──────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="🎮" title="GameLevelButton" subtitle="3 states: locked · current · completed" />
                    <View style={styles.levelRow}>
                        {(['locked', 'current', 'completed'] as const).map((status, i) => (
                            <View key={status} style={styles.levelItem}>
                                <GameLevelButton
                                    level={i + 1}
                                    status={status}
                                    onPress={() => Alert.alert('Level pressed', `Level ${i + 1} – ${status}`)}
                                />
                                <Text style={styles.levelLabel}>{status}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── 4. RecordingButton ──────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="🎤" title="RecordingButton" subtitle="Toggle recording state" />
                    <View style={styles.centeredRow}>
                        <RecordingButton
                            isRecording={isRecording}
                            onPress={() => setIsRecording(r => !r)}
                        />
                    </View>
                    <ControlRow>
                        <CtrlBtn
                            label={isRecording ? '⏹ Stop Recording' : '▶ Start Recording'}
                            color={isRecording ? '#EF4444' : '#10B981'}
                            active={isRecording}
                            onPress={() => setIsRecording(r => !r)}
                        />
                    </ControlRow>
                </View>

                {/* ── 5. KaraokeDisplay ───────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="🎵" title="KaraokeDisplay" subtitle="Switch mode & highlighted word" />
                    <KaraokeDisplay
                        words={karaokeWords}
                        currentWordIndex={karaokeWordIdx}
                        mode={karaokeMode}
                        fontSize={28}
                    />
                    <ControlRow>
                        {(['idle', 'playback', 'recording'] as const).map(m => (
                            <CtrlBtn
                                key={m}
                                label={m}
                                color="#6366F1"
                                active={karaokeMode === m}
                                onPress={() => setKaraokeMode(m)}
                            />
                        ))}
                    </ControlRow>
                    <ControlRow>
                        <CtrlBtn label="← Word" color="#6B7280" onPress={() => setKaraokeWordIdx(i => Math.max(0, i - 1))} />
                        <Text style={styles.wordIdxText}>word {karaokeWordIdx}</Text>
                        <CtrlBtn label="Word →" color="#6B7280" onPress={() => setKaraokeWordIdx(i => Math.min(karaokeWords.length - 1, i + 1))} />
                    </ControlRow>
                </View>

                {/* ── 6. DrawingCanvas ────────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="✍️" title="DrawingCanvas" subtitle="Draw with your finger" />
                    <View style={styles.canvasWrapper}>
                        <DrawingCanvas
                            ref={canvasRef}
                            canvasWidth={width - 80}
                            canvasHeight={220}
                        />
                    </View>
                    <ControlRow>
                        <CtrlBtn label="↩ Undo" color="#F59E0B" onPress={() => canvasRef.current?.undo()} />
                        <CtrlBtn label="🗑 Clear" color="#EF4444" onPress={() => canvasRef.current?.clear()} />
                        <CtrlBtn
                            label="📸 Capture"
                            color="#6366F1"
                            onPress={async () => {
                                const uri = await canvasRef.current?.capture();
                                Alert.alert('Captured!', uri ? `URI: ${uri.substring(0, 50)}…` : 'Failed');
                            }}
                        />
                    </ControlRow>
                </View>

                {/* ── 7. FeedbackDisplay ──────────────────────── */}
                <View style={[styles.card, { minHeight: 220 }]}>
                    <SectionHeader emoji="💬" title="FeedbackDisplay" subtitle="Overlay pops at the bottom of this card" />
                    <ControlRow>
                        <CtrlBtn
                            label="✓ Show Correct"
                            color="#10B981"
                            active={feedbackVisible && feedbackCorrect}
                            onPress={() => { setFeedbackCorrect(true); setFeedbackVisible(true); }}
                        />
                        <CtrlBtn
                            label="✗ Show Incorrect"
                            color="#EF4444"
                            active={feedbackVisible && !feedbackCorrect}
                            onPress={() => { setFeedbackCorrect(false); setFeedbackVisible(true); }}
                        />
                    </ControlRow>
                    <ControlRow>
                        <CtrlBtn label="Hide" color="#6B7280" onPress={() => setFeedbackVisible(false)} />
                    </ControlRow>
                    <FeedbackDisplay
                        isCorrect={feedbackCorrect}
                        visible={feedbackVisible}
                        score={feedbackCorrect ? 90 : 30}
                        maxScore={100}
                        message={feedbackCorrect ? 'Excellent! 🎉' : 'Try Again! 💪'}
                    />
                </View>

                {/* ── 8. FairyBackground ──────────────────────── */}
                <View style={styles.card}>
                    <SectionHeader emoji="🌿" title="FairyBackground" subtitle="Animated bubble background" />
                    <View style={styles.fairyPreview}>
                        <FairyBackground>
                            <View style={styles.fairyInner}>
                                <Text style={styles.fairyText}>✨ Fairy Background ✨</Text>
                                <Text style={styles.fairySubText}>Bubbles float in background</Text>
                            </View>
                        </FairyBackground>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

/* ──────────────────────────────────────────────
   Styles
────────────────────────────────────────────── */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 8,
    },
    pageTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    pageBadge: {
        fontSize: 10,
        fontWeight: '800',
        color: '#6366F1',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        letterSpacing: 1,
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
        gap: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 10,
    },
    sectionEmoji: {
        fontSize: 26,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 1,
    },
    controlRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctrlBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    ctrlBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    levelItem: {
        alignItems: 'center',
        gap: 8,
    },
    levelLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    centeredRow: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    wordIdxText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        alignSelf: 'center',
        minWidth: 50,
        textAlign: 'center',
    },
    canvasWrapper: {
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    fairyPreview: {
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
    },
    fairyInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fairyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D6A4F',
        textShadowColor: 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    fairySubText: {
        fontSize: 12,
        color: '#40916C',
        marginTop: 4,
    },
});
