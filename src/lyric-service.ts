import { Lyric, Mood } from './types';
const lyricsData = require('./lyrics.json') as Lyric[];

export class LyricService {
    private currentMood: Mood = 'random';
    private currentLyric: Lyric | null = null;

    constructor(defaultMood: Mood = 'random') {
        this.currentMood = defaultMood;
    }

    public getMood(): Mood {
        return this.currentMood;
    }

    public setMood(mood: Mood) {
        this.currentMood = mood;
    }

    public getCurrentLyric(): Lyric | null {
        return this.currentLyric;
    }

    public pickRandomLyric(): Lyric | null {
        const filtered = this.filterLyrics();
        if (filtered.length === 0) {
            this.currentLyric = null;
            return null;
        }

        const index = Math.floor(Math.random() * filtered.length);
        this.currentLyric = filtered[index];
        return this.currentLyric;
    }

    public getMoodCounts(): Record<string, number> {
        const moodCounts: Record<string, number> = {};
        lyricsData.forEach(lyric => {
            lyric.tags.forEach(tag => {
                moodCounts[tag] = (moodCounts[tag] || 0) + 1;
            });
        });
        return moodCounts;
    }

    public getTotalCount(): number {
        return lyricsData.length;
    }

    private filterLyrics(): Lyric[] {
        if (this.currentMood === 'random') {
            return lyricsData;
        }
        return lyricsData.filter(l => l.tags.includes(this.currentMood));
    }
}
