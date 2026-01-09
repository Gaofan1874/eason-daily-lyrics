export interface Lyric {
    id: number;
    content: string;
    song: string;
    album: string;
    tags: string[];
    link?: string;
}

export type Mood = 
    | 'random' | 'acting' | 'brightness' | 'classic' | 'confused' 
    | 'crazy' | 'dark' | 'freedom' | 'friendship' | 'healing' 
    | 'humanity' | 'journey' | 'life' | 'lonely' | 'love' 
    | 'memory' | 'money' | 'pain' | 'philosophy' | 'power' 
    | 'pressure' | 'promise' | 'regret' | 'religion' | 'repeat' 
    | 'sad' | 'self' | 'social' | 'soul' | 'story';
