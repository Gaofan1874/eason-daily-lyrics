import * as vscode from 'vscode';
import { LyricService } from './lyric-service';
import { StatusBarManager } from './status-bar-manager';
import { PosterManager } from './poster-manager';
import { MOOD_LABELS } from './constant';
import { Mood } from './types';

export function registerCommands(
    context: vscode.ExtensionContext,
    service: LyricService,
    ui: StatusBarManager,
    posterManager: PosterManager
) {
    // Command: Next Lyric
    const nextLyricCmd = vscode.commands.registerCommand('eason.nextLyric', () => {
        const lyric = service.pickRandomLyric();
        ui.update(lyric);
    });

    // Command: Generate Poster
    const posterCmd = vscode.commands.registerCommand('eason.generatePoster', () => {
        const lyric = service.getCurrentLyric();
        if (lyric) {
            posterManager.generatePoster(lyric);
        } else {
            vscode.window.showInformationMessage('当前没有播放歌词，无法生成海报。');
        }
    });

    // Command: Show Menu
    const menuCmd = vscode.commands.registerCommand('eason.showMenu', async () => {
        const lyric = service.getCurrentLyric();
        const currentMood = service.getMood();
        
        const menuItems = [];
        
        if (lyric) {
            menuItems.push({ 
                label: '$(arrow-right) 切歌', 
                description: '换下一句', 
                action: 'next' 
            });
            
            menuItems.push({
                label: '$(file-media) 生成歌词海报',
                description: '分享此刻心情',
                action: 'poster'
            });
        }
        
        const moodLabel = MOOD_LABELS[currentMood] || currentMood;
        menuItems.push({ 
            label: '$(heart) 切换心情', 
            description: `当前: ${moodLabel}`, 
            action: 'mood' 
        });
        
        if (lyric) {
            menuItems.push({ 
                label: '$(link) 查看歌曲信息', 
                description: `${lyric.song} - ${lyric.album}`, 
                action: 'link' 
            });
        }

        const placeHolder = lyric ? `正在播放: ${lyric.content}` : 'Eason 休息中...';

        const selection = await vscode.window.showQuickPick(menuItems, { placeHolder });

        if (selection) {
            if (selection.action === 'next') {
                vscode.commands.executeCommand('eason.nextLyric');
            } else if (selection.action === 'mood') {
                vscode.commands.executeCommand('eason.changeMood');
            } else if (selection.action === 'poster') {
                vscode.commands.executeCommand('eason.generatePoster');
            } else if (selection.action === 'link' && lyric) {
                vscode.env.openExternal(vscode.Uri.parse(lyric.link || 'https://music.163.com'));
            }
        }
    });

    // Command: Change Mood
    const changeMoodCmd = vscode.commands.registerCommand('eason.changeMood', async () => {
        const moodCounts = service.getMoodCounts();
        const totalCount = service.getTotalCount();
        
        // Define all available moods from the keys of MOOD_LABELS + 'random'
        const moods = Object.keys(MOOD_LABELS) as Mood[];
        
        // Build QuickPick items
        const moodItems = moods
            .map(m => {
                const count = m === 'random' ? totalCount : (moodCounts[m] || 0);
                return {
                    label: MOOD_LABELS[m] || m,
                    description: `${count} 句`,
                    mood: m,
                    count: count
                };
            })
            .filter(item => item.count >= 5) // Same logic as before
            .sort((a, b) => {
                if (a.mood === 'random') return -1;
                if (b.mood === 'random') return 1;
                return b.count - a.count;
            });

        const selected = await vscode.window.showQuickPick(moodItems, {
            placeHolder: '选择你此刻的心情 (仅显示歌词数 > 5 的分类)'
        });
        
        if (selected) {
            const newMood = selected.mood as Mood;
            service.setMood(newMood);
            
            const newLyric = service.pickRandomLyric();
            ui.update(newLyric);
            
            const moodLabel = MOOD_LABELS[newMood];
            vscode.window.showInformationMessage(`Eason 已切换至 ${moodLabel} mode`);
        }
    });

    context.subscriptions.push(nextLyricCmd, posterCmd, menuCmd, changeMoodCmd);
}