import * as vscode from 'vscode';

// 定义歌词接口
export interface Lyric {
    id: number;
    content: string;
    song: string;
    album: string;
    tags: string[];
    link?: string;
}

const lyricsData = require('./lyrics.json') as Lyric[];

// 定义心情类型
type Mood = 'random' | 'acting' | 'brightness' | 'classic' | 'confused' | 'crazy' | 'dark' | 'freedom' | 'friendship' | 'healing' | 'humanity' | 'journey' | 'life' | 'lonely' | 'love' | 'memory' | 'money' | 'pain' | 'philosophy' | 'power' | 'pressure' | 'promise' | 'regret' | 'religion' | 'repeat' | 'sad' | 'self' | 'social' | 'soul' | 'story';

let myStatusBarItem: vscode.StatusBarItem;
let intervalId: NodeJS.Timeout | undefined;
let currentMood: Mood = 'random';
let currentLyric: Lyric | null = null;

export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('EasonCode is now active!');

        // 1. 创建状态栏项目
        myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        myStatusBarItem.command = 'eason.showMenu'; // 点击状态栏触发菜单
        context.subscriptions.push(myStatusBarItem);

        // 2. 注册命令
        const nextLyricCmd = vscode.commands.registerCommand('eason.nextLyric', () => {
            try {
                updateLyric();
            } catch (err) {
                console.error('Error in nextLyric:', err);
            }
        });

        const menuCmd = vscode.commands.registerCommand('eason.showMenu', async () => {
            try {
                const lyric = currentLyric;
                
                // Define menu items
                const menuItems = [];
                
                if (lyric) {
                    menuItems.push(
                        { label: '$(arrow-right) 切歌', description: '换下一句', action: 'next' }
                    );
                }
                
                menuItems.push(
                    { label: '$(heart) 切换心情', description: `当前: ${getMoodLabel(currentMood)}`, action: 'mood' }
                );
                
                if (lyric) {
                    menuItems.push(
                        { label: '$(link) 查看歌曲信息', description: `${lyric.song} - ${lyric.album}`, action: 'link' }
                    );
                }

                const placeHolder = lyric ? `正在播放: ${lyric.content}` : 'Eason 休息中... (当前分类无歌词)';

                const selection = await vscode.window.showQuickPick(menuItems, { placeHolder });

                if (selection) {
                    if (selection.action === 'next') {
                        updateLyric();
                    } else if (selection.action === 'mood') {
                        vscode.commands.executeCommand('eason.changeMood');
                    } else if (selection.action === 'link' && lyric) {
                        vscode.env.openExternal(vscode.Uri.parse(lyric.link || 'https://music.163.com'));
                    }
                }
            } catch (err) {
                console.error('Error in showMenu:', err);
                vscode.window.showErrorMessage(`EasonCode menu error: ${err}`);
            }
        });

        const changeMoodCmd = vscode.commands.registerCommand('eason.changeMood', async () => {
            try {
                // Calculate mood counts dynamically
                const moodCounts: Record<string, number> = {};
                lyricsData.forEach(lyric => {
                    lyric.tags.forEach(tag => {
                        moodCounts[tag] = (moodCounts[tag] || 0) + 1;
                    });
                });

                const moods: Mood[] = [
                    'random', 'sad', 'healing', 'love', 'philosophy', 'life', 'classic', 'memory',
                    'power', 'crazy', 'lonely', 'regret', 'social', 'dark', 'brightness', 'pain',
                    'story', 'friendship', 'freedom', 'self', 'journey', 'humanity', 'soul',
                    'confused', 'pressure', 'money', 'promise', 'acting', 'religion', 'repeat'
                ];
                
                // Filter and map moods to QuickPickItems
                const moodItems = moods
                    .map(m => {
                        const count = m === 'random' ? lyricsData.length : (moodCounts[m] || 0);
                        return {
                            label: getMoodLabel(m),
                            description: `${count} 句`,
                            mood: m,
                            count: count
                        };
                    })
                    .filter(item => item.count >= 5) // Only show moods with at least 5 songs
                    .sort((a, b) => {
                        if (a.mood === 'random') return -1; // Random always first
                        if (b.mood === 'random') return 1;
                        return b.count - a.count; // Sort by count descending
                    });

                const selected = await vscode.window.showQuickPick(moodItems, {
                    placeHolder: '选择你此刻的心情 (仅显示歌词数 > 5 的分类)'
                });
                
                if (selected) {
                    currentMood = selected.mood as Mood;
                    updateLyric();
                    vscode.window.showInformationMessage(`Eason 已切换至 ${getMoodLabel(currentMood)} 模式`);
                }
            } catch (err) {
                console.error('Error in changeMood:', err);
                vscode.window.showErrorMessage(`EasonCode changeMood error: ${err}`);
            }
        });

        context.subscriptions.push(nextLyricCmd, menuCmd, changeMoodCmd);

        // 监听配置变化
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('eason.updateInterval')) {
                startTimer();
            }
            if (e.affectsConfiguration('eason.lyricColor')) {
                updateLyric();
            }
        }));

        // 3. 初始化并开始轮播
        updateLyric();
        startTimer();
        myStatusBarItem.show();
    } catch (error) {
        console.error('Failed to activate EasonCode:', error);
        vscode.window.showErrorMessage(`EasonCode activation failed: ${error}`);
    }
}

function startTimer() {
    const config = vscode.workspace.getConfiguration('eason');
    const interval = config.get<number>('updateInterval', 300) * 1000;

    if (intervalId) { clearInterval(intervalId); }

    intervalId = setInterval(() => {
        updateLyric();
    }, interval);
}

function getMoodLabel(mood: Mood): string {
    const labels: Record<Mood, string> = {
        'random': '🎲 随机漫步 (Random)',
        'sad': '🌧️ 深夜抑郁 (Sad)',
        'healing': '☕ 治愈哲理 (Healing)',
        'love': '💗 爱与浪漫 (Love)',
        'philosophy': '🤔 人生哲理 (Philosophy)',
        'life': '🌱 生活感悟 (Life)',
        'classic': '📀 岁月金曲 (Classic)',
        'memory': '🎞️ 往事回忆 (Memory)',
        'power': '💪 给人力量 (Power)',
        'crazy': '🔥 浮夸热血 (Crazy)',
        'lonely': '🍂 孤独患者 (Lonely)',
        'regret': '🥀 遗憾惋惜 (Regret)',
        'social': '🏙️ 社会观察 (Social)',
        'dark': '🌑 黑色幽默 (Dark)',
        'brightness': '☀️ 寻找光明 (Brightness)',
        'pain': '💔 痛彻心扉 (Pain)',
        'story': '📖 故事人生 (Story)',
        'friendship': '🤝 最佳损友 (Friendship)',
        'freedom': '🕊️ 向往自由 (Freedom)',
        'self': '🧘 自我对话 (Self)',
        'journey': '🚀 漫长旅途 (Journey)',
        'humanity': '👥 人性探索 (Humanity)',
        'soul': '👻 灵魂深处 (Soul)',
        'confused': '😵 迷茫困惑 (Confused)',
        'pressure': '🏋️ 压力释放 (Pressure)',
        'money': '💰 现实主义 (Money)',
        'promise': '🤞 爱的承诺 (Promise)',
        'acting': '🎭 人生如戏 (Acting)',
        'religion': '🙏 因果轮回 (Religion)',
        'repeat': '🔁 循环往复 (Repeat)'
    };
    return labels[mood] || mood;
}

function filterLyrics(): Lyric[] {
    if (currentMood === 'random') { return lyricsData; }
    return lyricsData.filter(l => l.tags.includes(currentMood));
}

function pickRandomLyric(): Lyric | null {
    const filtered = filterLyrics();
    if (filtered.length === 0) { return null; }

    // 简单的随机逻辑
    const index = Math.floor(Math.random() * filtered.length);
    return filtered[index];
}

function updateLyric() {
    const lyric = pickRandomLyric();
     currentLyric = lyric;
    if (!lyric) {
        myStatusBarItem.text = '$(music) Eason 休息中...';
        return;
    }

    const config = vscode.workspace.getConfiguration('eason');
    const color = config.get<string>('lyricColor');
    if (color) {
        myStatusBarItem.color = color;
    } else {
        myStatusBarItem.color = undefined;
    }

    // 状态栏显示格式： 🎤 歌词内容
    myStatusBarItem.text = `$(music) ${lyric.content}`;
    myStatusBarItem.tooltip = `歌曲：${lyric.song}\n专辑：${lyric.album}\n\n点击查看更多选项`;
}

export function deactivate() {
    if (intervalId) { clearInterval(intervalId); }
}
