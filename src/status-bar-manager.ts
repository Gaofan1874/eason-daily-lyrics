import * as vscode from 'vscode';
import { Lyric } from './types';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'eason.showMenu';
    }

    public show() {
        this.statusBarItem.show();
    }

    public update(lyric: Lyric | null) {
        if (!lyric) {
            this.statusBarItem.text = '$(music) Eason 休息中...';
            this.statusBarItem.tooltip = '当前分类无歌词';
            return;
        }

        this.updateColor();
        this.statusBarItem.text = `$(music) ${lyric.content}`;
        this.statusBarItem.tooltip = `歌曲：${lyric.song}\n专辑：${lyric.album}\n\n点击查看更多选项`;
    }

    public updateColor() {
        const config = vscode.workspace.getConfiguration('eason');
        const color = config.get<string>('lyricColor');
        if (color) {
            this.statusBarItem.color = color;
        } else {
            this.statusBarItem.color = undefined;
        }
    }

    public dispose() {
        this.statusBarItem.dispose();
    }
}
