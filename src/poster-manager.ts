import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Lyric } from './types';

export class PosterManager {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public generatePoster(lyric: Lyric) {
        // Create or show panel
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'easonPoster',
                'Eason Lyric Poster',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
                        vscode.Uri.file(path.join(this.context.extensionPath, 'images'))
                    ]
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            }, null, this.context.subscriptions);

            // Handle messages from webview
            this.panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'savePoster':
                            await this.savePosterImage(message.data);
                            return;
                        case 'error':
                            vscode.window.showErrorMessage(message.text);
                            return;
                    }
                },
                null,
                this.context.subscriptions
            );
        }

        this.panel.webview.html = this.getHtmlForWebview(lyric);
    }

    private async savePosterImage(base64Data: string) {
        // Remove header
        const base64Image = base64Data.split(';base64,').pop();
        if (!base64Image) return;

        // Ask user where to save
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(vscode.workspace.rootPath || '', 'eason-lyric.png')),
            filters: {
                'Images': ['png']
            }
        });

        if (uri) {
            try {
                fs.writeFileSync(uri.fsPath, base64Image, { encoding: 'base64' });
                vscode.window.showInformationMessage(`海报已保存: ${path.basename(uri.fsPath)}`);
            } catch (err) {
                vscode.window.showErrorMessage(`保存失败: ${err}`);
            }
        }
    }

    private getHtmlForWebview(lyric: Lyric): string {
        // 1. Get Resource Paths
        const stylePath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'poster.css'));
        const scriptPath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'poster.js'));
        const iconPath = vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'eason_code_icon.png'));

        // 2. Convert to Webview URIs
        const styleUri = this.panel?.webview.asWebviewUri(stylePath);
        const scriptUri = this.panel?.webview.asWebviewUri(scriptPath);
        const bgUri = this.panel?.webview.asWebviewUri(iconPath);

        // 3. Prepare Data
        const posterData = {
            lyric: lyric,
            bgSrc: bgUri?.toString() || ''
        };

        // 4. Read Template
        const htmlPath = path.join(this.context.extensionPath, 'media', 'poster.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');

        // 5. Inject Content
        // Using simple string replacement. In a larger app, a template engine might be better.
        html = html.replace('{{styleUri}}', styleUri?.toString() || '');
        html = html.replace('{{scriptUri}}', scriptUri?.toString() || '');
        html = html.replace('{{posterData}}', JSON.stringify(posterData));

        return html;
    }
}
