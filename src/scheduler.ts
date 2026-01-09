import * as vscode from 'vscode';

export class Scheduler {
    private intervalId: NodeJS.Timeout | undefined;
    private callback: () => void;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    public start() {
        const config = vscode.workspace.getConfiguration('eason');
        const interval = config.get<number>('updateInterval', 300) * 1000;

        this.stop(); // Clear existing timer if any

        this.intervalId = setInterval(() => {
            this.callback();
        }, interval);
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }

    public restart() {
        this.start();
    }
}
