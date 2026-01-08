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
type Mood = 'random' | 'sad' | 'healing' | 'crazy';

let myStatusBarItem: vscode.StatusBarItem;
let intervalId: NodeJS.Timeout | undefined;
let currentMood: Mood = 'random';

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
                const lyric = getCurrentLyric();
                if (!lyric) { return; }

                const selection = await vscode.window.showQuickPick(
                    [
                        { label: '$(arrow-right) 切歌 (Next)', description: '换下一句' },
                        { label: '$(heart) 切换心情 (Mood)', description: `当前: ${getMoodLabel(currentMood)}` },
                        { label: '$(link) 查看歌曲信息', description: `${lyric.song} - ${lyric.album}` }
                    ],
                    { placeHolder: `正在播放: ${lyric.content}` }
                );

                if (selection) {
                    if (selection.label.includes('切歌')) {
                        updateLyric();
                    } else if (selection.label.includes('切换心情')) {
                        vscode.commands.executeCommand('eason.changeMood');
                    } else if (selection.label.includes('查看歌曲信息')) {
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
                const moods: Mood[] = ['random', 'sad', 'healing', 'crazy'];
                const selected = await vscode.window.showQuickPick(moods, {
                    placeHolder: '选择你此刻的心情 (Select your mood)'
                });
                if (selected) {
                    currentMood = selected as Mood;
                    updateLyric();
                    vscode.window.showInformationMessage(`Eason 已切换至 ${getMoodLabel(currentMood)} 模式`);
                }
            } catch (err) {
                console.error('Error in changeMood:', err);
                vscode.window.showErrorMessage(`EasonCode changeMood error: ${err}`);
            }
        });

        context.subscriptions.push(nextLyricCmd, menuCmd, changeMoodCmd);

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
        'random': '🎲 随机漫步',
        'sad': '🌧️ 深夜抑郁',
        'healing': '☕ 治愈哲理',
        'crazy': '🔥 浮夸热血'
    };
    return labels[mood] || mood;
}

function filterLyrics(): Lyric[] {
    if (currentMood === 'random') { return lyricsData; }
    return lyricsData.filter(l => l.tags.includes(currentMood));
}

function getCurrentLyric(): Lyric | null {
    const filtered = filterLyrics();
    if (filtered.length === 0) { return null; }

    // 简单的随机逻辑
    const index = Math.floor(Math.random() * filtered.length);
    return filtered[index];
}

function updateLyric() {
    const lyric = getCurrentLyric();
    if (!lyric) {
        myStatusBarItem.text = '$(music) Eason 休息中...';
        return;
    }

    // 状态栏显示格式： 🎤 歌词内容
    myStatusBarItem.text = `$(music) ${lyric.content}`;
    myStatusBarItem.tooltip = `歌曲：${lyric.song}\n专辑：${lyric.album}\n\n点击查看更多选项`;
}

export function deactivate() {
    if (intervalId) { clearInterval(intervalId); }
}
