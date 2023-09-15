/* eslint-disable @typescript-eslint/naming-convention */
// 问答展示页面

import * as vscode from "vscode";
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";
import { chatWithModels } from "../models/chatWithModels";

// 代码高亮与一键粘贴选项
type Settings = {
    selectedInsideCodeblock?: boolean,
    pasteOnClick?: boolean,
};

// 问答页面
export class ViewProvider implements vscode.WebviewViewProvider {
    private webView?: vscode.WebviewView;

    public promptText?: string;

    private _settings: Settings = {
        selectedInsideCodeblock: false,
        pasteOnClick: true
    };

    constructor(private context: vscode.ExtensionContext) { }

    // 发出request调用对话模型
    public async sendApiRequest(prompt: string) {

        showTemporaryStatusMessage("等待CodeAI...", undefined, true);  // 左下角展示等待字样
        
        // 在页面展示提问内容
        await this.sendMessageToWebView({
            type: "askQuestion",
            question: prompt,
        });
        try {           
            const response = await chatWithModels(prompt); // 调用chatWithModel与对话模型进行对话

            // 对话结果返回对话页面，无返回则输出Fail
            if (response) {
                await this.sendMessageToWebView({
                    type: "addResponse",
                    value: response,
                });
            } else {
                showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
                this.sendMessageToWebView({
                    type: "addResponse",
                    value: "Failed to call chatgpt!",
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            hideStatusMessage(); // 隐藏等待字样
        }
    }

    // 解析前端页面
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this.webView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        webviewView.webview.html = this.getWebviewContent(webviewView.webview); //解析html
        // 输入框输入或是选中代码粘贴
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                // 粘贴代码
                case 'codeSelected':
                    {
                        // do nothing if the pasteOnClick option is disabled
                        if (!this._settings.pasteOnClick) {
                            break;
                        }
                        let code = data.value;
                        const snippet = new vscode.SnippetString(); 
                        snippet.appendText(code);
                        // insert the code as a snippet into the active text editor
                        vscode.window.activeTextEditor?.insertSnippet(snippet); // 一键粘贴
                        break;
                    }
                // prompt输入
                case 'prompt':
                    {
                        // 调用对话模型
                        this.sendApiRequest(data.value);
                        break;
                    }
            }
        });

    }

    // 发送信息到前端页面函数
    public async sendMessageToWebView(message: any) {
        if (this.webView) {
            this.webView?.show?.(true);
        } else {
            await vscode.commands.executeCommand("codeai-vsc.view.focus");
        }

        this.webView?.webview.postMessage(message);
    }

    // 前端页面
    getWebviewContent(webview: vscode.Webview) {
        const stylesMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
        );
        const microlightUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'scripts', 'microlight.min.js')
        );
        const tailwindUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'scripts', 'showdown.min.js')
        );
        const showdownUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'scripts', 'tailwind.min.js')
        );

        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="${tailwindUri}"></script>
      <script src="${showdownUri}"></script>
      <script src="${microlightUri}"></script>
      <link rel="stylesheet" href="${stylesMainUri}">
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="overflow-hidden">
      <div class="flex flex-col h-screen">
      <input class="h-10 w-full text-white bg-stone-700 p-4 text-sm" placeholder="输入你的问题" id="prompt-input" />
      <div class="flex-1 overflow-y-auto" id="qa-list"></div>
      <div id="canvas" class="content"></div>
        
        <div id="in-progress" class="p-4 flex items-center hidden">
            <div style="text-align: center;">
                <div>Please wait while we handle your request ❤️</div>
                <div class="loader"></div>
            </div>
        </div>
      </div>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
    }
}