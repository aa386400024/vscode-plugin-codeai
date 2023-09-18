/* eslint-disable @typescript-eslint/naming-convention */
// 问答展示页面

// 导入VS Code的API模块，用于与VS Code编辑器进行交互
import * as vscode from "vscode";

// 导入工具函数，用于显示和隐藏状态消息
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";

// 导入与模型进行交互的函数
import { chatWithModels } from "../models/chatWithModels";

// 代码高亮与一键粘贴选项的类型定义
type Settings = {
    selectedInsideCodeblock?: boolean,
    pasteOnClick?: boolean,
};

// 问答页面的实现类
export class ViewProvider implements vscode.WebviewViewProvider {
    private webView?: vscode.WebviewView;  // 定义一个可能的Webview视图

    public promptText?: string;  // 定义一个可能的提示文本

    // 默认的设置选项
    private _settings: Settings = {
        selectedInsideCodeblock: false,
        pasteOnClick: true
    };

    // 构造函数，接收一个VS Code的扩展上下文
    constructor(private context: vscode.ExtensionContext) { }

    // 发送API请求并调用对话模型的函数
    public async sendApiRequest(prompt: string) {
        // 在状态栏显示等待消息
        showTemporaryStatusMessage("等待CodeAI...", undefined, true);

        // 在页面上显示提问内容
        await this.sendMessageToWebView({
            type: "askQuestion",
            question: prompt,
        });

        try {
            // 调用chatWithModel函数与对话模型进行交互
            const response = await chatWithModels(prompt);

            // 如果有返回结果，则在页面上显示，否则显示失败消息
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
            // 打印错误信息
            console.error(error);
        } finally {
            // 隐藏状态栏的消息
            hideStatusMessage();
        }
    }

    // 解析前端页面的函数
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this.webView = webviewView;  // 设置当前的Webview视图

        // 设置Webview的选项
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        // 设置Webview的HTML内容
        webviewView.webview.html = this.getWebviewContent(webviewView.webview);

        // 监听Webview上的消息
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                // 当选择了代码时
                case 'codeSelected':
                    {
                        // 如果pasteOnClick选项被禁用，则不执行任何操作
                        if (!this._settings.pasteOnClick) {
                            break;
                        }
                        let code = data.value;
                        const snippet = new vscode.SnippetString();
                        snippet.appendText(code);
                        // 将代码作为片段插入到活动的文本编辑器中
                        vscode.window.activeTextEditor?.insertSnippet(snippet);
                        break;
                    }
                // 当输入了提示时
                case 'prompt':
                    {
                        // 调用对话模型
                        this.sendApiRequest(data.value);
                        break;
                    }
            }
        });
    }

    // 发送消息到前端页面的函数
    public async sendMessageToWebView(message: any) {
        if (this.webView) {
            this.webView?.show?.(true);
        } else {
            await vscode.commands.executeCommand("codeai-vsc.view.focus");
        }

        this.webView?.webview.postMessage(message);
    }

    // 获取前端页面内容的函数
    getWebviewContent(webview: vscode.Webview) {
        // 定义资源的URI
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

        // 返回HTML内容
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
