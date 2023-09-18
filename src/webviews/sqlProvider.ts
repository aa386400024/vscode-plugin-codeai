/* eslint-disable @typescript-eslint/naming-convention */
// sql图谱展示页面

// 导入VS Code的API模块，用于与VS Code编辑器进行交互
import * as vscode from "vscode";

// 定义SQL图谱的展示类
export class SqlProvider implements vscode.WebviewViewProvider {
    private webView?: vscode.WebviewView;  // 定义一个可能的Webview视图
    public promptText?: string;  // 定义一个可能的提示文本

    // 构造函数，接收一个VS Code的扩展上下文
    constructor(private context: vscode.ExtensionContext) { }

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
    }

    // 发送消息到前端页面的函数
    public async sendMessageToWebView(message: any) {
        if (this.webView) {
            this.webView?.show?.(true);
        } else {
            await vscode.commands.executeCommand("codeai-sql.view.focus");
        }

        this.webView?.webview.postMessage(message);
    }

    // 获取前端页面内容的函数
    getWebviewContent(webview: vscode.Webview) {
        // 获取js模块地址
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media","scripts", "uml.js")
        );
        const styleTextUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "scripts", "style.css")
        );
        const jqueryUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "scripts", "jquery-1.10.2.min.js")
        );
        const jsplumbUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "scripts", "jsplumb", "js", "jsplumb.js")
        );
        const tableUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "scripts", "jsplumb", "js", "table.js")
        );

        // 返回HTML内容
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <link rel="stylesheet" type="text/css" href="${styleTextUri}">
      <script src="${jqueryUri}"></script>
      <script src="${jsplumbUri}"></script>
      <script src="${tableUri}"></script>
    </head>
    <body class="overflow-hidden">
      <div class="tabcontent clearfix" content="sqlflowContent" id="uml">
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
