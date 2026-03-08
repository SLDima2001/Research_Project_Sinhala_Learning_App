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
    if (records.length === 0) return "🚀 Start playing to see your progress! Your journey to mastering Sinhala starts here.";

    const moduleKeys: GameModule[] = ['text_to_image', 'storytelling', 'handwriting', 'voice_feedback'];
    const summaries = moduleKeys.map(k => ({ key: k, ...summarizeModule(records, k) }));

    // Find the module with the lowest average score (if practiced)
    const practiced = summaries.filter(s => s.count > 0);
    const weakest = [...practiced].sort((a, b) => a.avg - b.avg)[0];
    const strongest = [...practiced].sort((a, b) => b.avg - a.avg)[0];

    // Predict progress based on recent trend
    const recent = records.slice(-10);
    const recentAvg = recent.reduce((s, r) => s + (r.score / Math.max(r.maxScore, 1)), 0) / Math.max(recent.length, 1);

    let prediction = "";
    if (recentAvg >= 0.8) {
        prediction = "🌟 You're on track to becoming a Sinhala expert! ";
    } else if (recentAvg >= 0.5) {
        prediction = "📈 You're showing steady improvement. ";
    } else {
        prediction = "💪 You're building your foundation. ";
    }

    // Specific improvement advice
    if (weakest && weakest.avg < 70) {
        const moduleName = weakest.key.replace(/_/g, ' ');
        return `${prediction}To improve faster, try focusing more on ${moduleName} practice. Your average there is ${weakest.avg}%.`;
    }

    if (practiced.length < 4) {
        const unpracticed = moduleKeys.find(k => !records.some(r => r.module === k));
        if (unpracticed) {
            return `${prediction}Great job so far! Try exploring the ${unpracticed.replace(/_/g, ' ')} module to become more well-rounded.`;
        }
    }

    if (strongest && strongest.avg > 90) {
        return `${prediction}You're doing amazing in ${strongest.key.replace(/_/g, ' ')}! Keep up the great work and keep challenging yourself!`;
    }

    return `${prediction}Consistency is key. Practicing 15 minutes every day will lead to amazing results!`;
}
