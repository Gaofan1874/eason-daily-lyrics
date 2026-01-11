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

    public async generatePoster(lyric: Lyric) {
        // 1. User Selection for Background
        const selection = await vscode.window.showQuickPick(
            [
                { label: '$(file-media) 默认背景', description: '使用 Eason Code 默认提供的背景', type: 'default' },
                { label: '$(file-directory) 选择本地图片...', description: '使用自己的 Eason 照片', type: 'local' }
            ],
            { placeHolder: '选择海报背景图' }
        );

        if (!selection) {
            return;
        }

        let bgSrc = '';

        if (selection.type === 'local') {
            const fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'Images': ['png', 'jpg', 'jpeg', 'gif', 'webp']
                }
            });

            if (fileUri && fileUri[0]) {
                // Read file to Base64 to avoid Webview permission issues with arbitrary paths
                try {
                    const fileData = fs.readFileSync(fileUri[0].fsPath);
                    const mimeType = this.getMimeType(fileUri[0].fsPath);
                    bgSrc = `data:${mimeType};base64,${fileData.toString('base64')}`;
                } catch (e) {
                    vscode.window.showErrorMessage('读取图片失败，将使用默认背景');
                }
            }
        }

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

        // If bgSrc is still empty (default or error), use internal icon
        if (!bgSrc) {
            const iconPath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'light&eason.png'));
            bgSrc = this.panel.webview.asWebviewUri(iconPath).toString();
        }

        this.panel.webview.html = this.getHtmlForWebview(lyric, bgSrc);
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.png': return 'image/png';
            case '.jpg':
            case '.jpeg': return 'image/jpeg';
            case '.gif': return 'image/gif';
            case '.webp': return 'image/webp';
            default: return 'image/png';
        }
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

    private getHtmlForWebview(lyric: Lyric, bgSrc: string): string {
        // 1. Get Resource Paths
        const stylePath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'poster.css'));
        const scriptPath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'poster.js'));

        // 2. Convert to Webview URIs
        const styleUri = this.panel?.webview.asWebviewUri(stylePath);
        const scriptUri = this.panel?.webview.asWebviewUri(scriptPath);

        // 3. Prepare Data
        const posterData = {
            lyric: lyric,
            bgSrc: bgSrc
        };

        // 4. Read Template
        const htmlPath = path.join(this.context.extensionPath, 'media', 'poster.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');

        // 5. Inject Content
        html = html.replace('{{styleUri}}', styleUri?.toString() || '');
        html = html.replace('{{scriptUri}}', scriptUri?.toString() || '');
        html = html.replace('{{posterData}}', JSON.stringify(posterData));

        return html;
    }
}
