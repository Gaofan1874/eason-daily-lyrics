import * as vscode from 'vscode';
import { LyricService } from './lyric-service';
import { StatusBarManager } from './status-bar-manager';
import { PosterManager } from './poster-manager';
import { Scheduler } from './scheduler';
import { registerCommands } from './command-handler';
import { Mood } from './types';

let scheduler: Scheduler;
let statusBarManager: StatusBarManager;
let posterManager: PosterManager;

export function activate(context: vscode.ExtensionContext) {
    // 1. Initialize Services
    const config = vscode.workspace.getConfiguration('eason');
    const defaultMood = config.get<string>('defaultMood', 'random') as Mood;
    
    const lyricService = new LyricService(defaultMood);
    statusBarManager = new StatusBarManager();
    posterManager = new PosterManager(context);
    
    // 2. Initialize Scheduler
    scheduler = new Scheduler(() => {
        const lyric = lyricService.pickRandomLyric();
        statusBarManager.update(lyric);
    });

    // 3. Register Commands
    registerCommands(context, lyricService, statusBarManager, posterManager);

    // 4. Handle Configuration Changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('eason.updateInterval')) {
            scheduler.restart();
        }
        if (e.affectsConfiguration('eason.lyricColor')) {
            statusBarManager.updateColor();
        }
    }));

    context.subscriptions.push(statusBarManager);

    // 5. Start
    const initialLyric = lyricService.pickRandomLyric();
    statusBarManager.update(initialLyric);
    statusBarManager.show();
    scheduler.start();
}

export function deactivate() {
    if (scheduler) {
        scheduler.stop();
    }
}