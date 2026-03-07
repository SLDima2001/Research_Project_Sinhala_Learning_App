import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
    getUserProgress, summarizeModule, getCurrentStreak, generateInsight, ScoreRecord
} from '@/services/progressService';

const { width } = Dimensions.get('window');

interface ModuleStat {
    label: string;
    key: 'text_to_image' | 'storytelling' | 'handwriting' | 'voice_feedback';
    color: string;
    icon: string;
}

const MODULES: ModuleStat[] = [
    { label: 'Text to Image', key: 'text_to_image', color: '#9333ea', icon: '🎨' },
    { label: 'Storytelling', key: 'storytelling', color: '#f59e0b', icon: '📖' },
    { label: 'Handwriting', key: 'handwriting', color: '#10b981', icon: '✏️' },
    { label: 'Voice Feedback', key: 'voice_feedback', color: '#3b82f6', icon: '🎤' },
];

function ProgressRing({ totalScore, maxScore }: { totalScore: number; maxScore: number }) {
    const pct = maxScore > 0 ? Math.min(totalScore / maxScore, 1) : 0;
    const grade = pct >= 0.8 ? 'A' : pct >= 0.6 ? 'B' : pct >= 0.4 ? 'C' : 'D';
    const gradeColor = pct >= 0.8 ? '#10b981' : pct >= 0.6 ? '#3b82f6' : pct >= 0.4 ? '#f59e0b' : '#ef4444';
    return (
        <View style={styles.ringWrapper}>
            <View style={[styles.ringOuter, { borderColor: gradeColor }]}>
                <View style={styles.ringInner}>
                    <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
                    <Text style={styles.ringScore}>{totalScore}</Text>
                    <Text style={styles.ringLabel}>Total Points</Text>
                </View>
            </View>
        </View>
    );
}

function ModuleBar({ mod, records }: { mod: ModuleStat; records: ScoreRecord[] }) {
    const summary = summarizeModule(records, mod.key);
    const pct = summary.count === 0 ? 0 : Math.min(summary.avg / 100, 1);
    return (
        <View style={styles.moduleRow}>
            <Text style={styles.moduleIcon}>{mod.icon}</Text>
            <View style={styles.moduleInfo}>
                <View style={styles.moduleTopRow}>
                    <Text style={styles.moduleLabel}>{mod.label}</Text>
                    <Text style={styles.moduleStats}>{summary.count} games · {summary.total} pts</Text>
                </View>
                <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: mod.color }]} />
                </View>
            </View>
        </View>
    );
}

export default function ProgressScreen() {
    const { user } = useAuth();
    const [records, setRecords] = useState<ScoreRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!user?.id) { setLoading(false); return; }
        const data = await getUserProgress(user.id);
        setRecords(data);
        setLoading(false);
        setRefreshing(false);
    }, [user?.id]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const totalScore = records.reduce((s, r) => s + r.score, 0);
    const maxScore = records.reduce((s, r) => s + r.maxScore, 0);
    const streak = getCurrentStreak(records);
    const insight = generateInsight(records);
    const recent = [...records].reverse().slice(0, 8);
    const moduleColors: Record<string, string> = Object.fromEntries(MODULES.map(m => [m.key, m.color]));
    const moduleIcons: Record<string, string> = Object.fromEntries(MODULES.map(m => [m.key, m.icon]));

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#9333ea" /></View>;
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>Login to see your progress</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#9333ea" />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerGreeting}>Progress Report</Text>
                        <Text style={styles.headerName}>{user.name || user.email}</Text>
                    </View>
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={styles.streakDays}>{streak}d</Text>
                    </View>
                </View>

                {/* AI Insight */}
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>🤖 AI Insight</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                </View>

                {/* Overview Ring */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Overall Performance</Text>
                    <ProgressRing totalScore={totalScore} maxScore={maxScore} />
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{records.length}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <View style={[styles.statItem, styles.statDivider]}>
                            <Text style={styles.statNum}>{totalScore}</Text>
                            <Text style={styles.statLabel}>Total Points</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{streak}</Text>
                            <Text style={styles.statLabel}>Day Streak 🔥</Text>
                        </View>
                    </View>
                </View>

                {/* Module Breakdown */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Module Breakdown</Text>
                    {MODULES.map(mod => (
                        <ModuleBar key={mod.key} mod={mod} records={records} />
                    ))}
                </View>

                {/* Recent Activity */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {recent.length === 0 ? (
                        <View style={styles.emptyActivity}>
                            <Text style={styles.emptyActivityText}>No activity yet — start playing!</Text>
                        </View>
                    ) : recent.map((r, i) => {
                        const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
                        const dateStr = new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        return (
                            <View key={i} style={styles.activityRow}>
                                <Text style={styles.activityIcon}>{moduleIcons[r.module] || '🎯'}</Text>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityModule}>{MODULES.find(m => m.key === r.module)?.label ?? r.module}</Text>
                                    <Text style={styles.activityDate}>{dateStr}</Text>
                                </View>
                                <View style={[styles.activityScore, { backgroundColor: (moduleColors[r.module] ?? '#9333ea') + '20' }]}>
                                    <Text style={[styles.activityScoreText, { color: moduleColors[r.module] ?? '#9333ea' }]}>
                                        {r.score} pts · {pct}%
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    headerGreeting: { fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 },
    headerName: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 2 },
    streakBadge: {
        backgroundColor: '#fef3c7', borderRadius: 20, paddingHorizontal: 14,
        paddingVertical: 8, alignItems: 'center',
    },
    streakEmoji: { fontSize: 18 },
    streakDays: { fontSize: 12, fontWeight: '700', color: '#d97706' },
    insightCard: {
        margin: 16, marginBottom: 0, padding: 16, borderRadius: 16,
        backgroundColor: '#ede9fe', borderLeftWidth: 4, borderLeftColor: '#9333ea',
    },
    insightTitle: { fontSize: 13, fontWeight: '700', color: '#6d28d9', marginBottom: 4 },
    insightText: { fontSize: 15, color: '#4c1d95', lineHeight: 22 },
    card: {
        margin: 16, marginBottom: 0, padding: 20, borderRadius: 20, backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 8, elevation: 3,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
    // Ring
    ringWrapper: { alignItems: 'center', marginBottom: 20 },
    ringOuter: {
        width: 140, height: 140, borderRadius: 70, borderWidth: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    ringInner: { alignItems: 'center' },
    gradeText: { fontSize: 36, fontWeight: '800' },
    ringScore: { fontSize: 16, fontWeight: '600', color: '#374151' },
    ringLabel: { fontSize: 11, color: '#9ca3af' },
    // Stats row
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
    statItem: { alignItems: 'center', flex: 1 },
    statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f3f4f6' },
    statNum: { fontSize: 22, fontWeight: '800', color: '#111827' },
    statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
    // Module bars
    moduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    moduleIcon: { fontSize: 24, marginRight: 12 },
    moduleInfo: { flex: 1 },
    moduleTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    moduleLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
    moduleStats: { fontSize: 12, color: '#9ca3af' },
    barBg: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4 },
    // Activity
    activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
    activityIcon: { fontSize: 22, marginRight: 12 },
    activityInfo: { flex: 1 },
    activityModule: { fontSize: 14, fontWeight: '600', color: '#374151' },
    activityDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    activityScore: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    activityScoreText: { fontSize: 12, fontWeight: '700' },
    emptyActivity: { alignItems: 'center', paddingVertical: 20 },
    emptyActivityText: { color: '#9ca3af', fontSize: 14 },
    emptyTitle: { fontSize: 18, color: '#9ca3af', marginTop: 16, textAlign: 'center' },
});
