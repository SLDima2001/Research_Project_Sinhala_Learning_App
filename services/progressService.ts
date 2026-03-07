import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameModule = 'text_to_image' | 'storytelling' | 'handwriting' | 'voice_feedback';

export interface ScoreRecord {
    module: GameModule;
    score: number;
    maxScore: number;
    correct: number;
    total: number;
    metadata?: Record<string, any>;
    completedAt: string; // ISO string
}

const getStorageKey = (userId: string) => `progress_${userId}`;

/**
 * Save a game score for a specific user account.
 */
export async function saveGameScore(userId: string, record: ScoreRecord): Promise<void> {
    try {
        const key = getStorageKey(userId);
        const raw = await AsyncStorage.getItem(key);
        const existing: ScoreRecord[] = raw ? JSON.parse(raw) : [];
        existing.push(record);
        // Keep last 200 records max
        const trimmed = existing.slice(-200);
        await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    } catch (e) {
        console.error('progressService.saveGameScore error:', e);
    }
}

/**
 * Get all score records for a user.
 */
export async function getUserProgress(userId: string): Promise<ScoreRecord[]> {
    try {
        const key = getStorageKey(userId);
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('progressService.getUserProgress error:', e);
        return [];
    }
}

/**
 * Summarize progress for a single module.
 */
export function summarizeModule(records: ScoreRecord[], module: GameModule) {
    const filtered = records.filter(r => r.module === module);
    if (!filtered.length) return { total: 0, avg: 0, count: 0, best: 0 };
    const total = filtered.reduce((s, r) => s + r.score, 0);
    const best = Math.max(...filtered.map(r => r.score));
    return { total, avg: Math.round(total / filtered.length), count: filtered.length, best };
}

/**
 * Get unique active days (for streak counting).
 */
export function getActivityDays(records: ScoreRecord[]): string[] {
    const days = new Set(records.map(r => r.completedAt.substring(0, 10)));
    return Array.from(days).sort();
}

/**
 * Calculate current streak (consecutive days including today).
 */
export function getCurrentStreak(records: ScoreRecord[]): number {
    const days = getActivityDays(records);
    if (!days.length) return 0;

    const today = new Date().toISOString().substring(0, 10);
    let streak = 0;
    let checkDay = new Date(today);

    while (true) {
        const dayStr = checkDay.toISOString().substring(0, 10);
        if (days.includes(dayStr)) {
            streak++;
            checkDay.setDate(checkDay.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

/**
 * Generate an AI-style insight based on progress records.
 */
export function generateInsight(records: ScoreRecord[]): string {
    if (records.length === 0) return "🚀 Start playing to see your progress!";

    const recent = records.slice(-10);
    const recentAvg = recent.reduce((s, r) => s + (r.score / Math.max(r.maxScore, 1)), 0) / recent.length;

    const storySummary = summarizeModule(records, 'storytelling');
    const tiSummary = summarizeModule(records, 'text_to_image');

    if (recentAvg >= 0.8) return "🌟 Excellent work! You're mastering Sinhala! Keep it up!";
    if (recentAvg >= 0.6) return "📈 You're improving steadily. Practice a bit more every day!";

    if (storySummary.count > tiSummary.count) {
        return "📖 You love stories! Try the Text-to-Image game to balance your skills.";
    } else if (tiSummary.count > 0) {
        return "🎨 You're exploring images! Try the story module to boost vocabulary.";
    }

    return "💪 Keep practicing — consistency is the key to fluency!";
}
