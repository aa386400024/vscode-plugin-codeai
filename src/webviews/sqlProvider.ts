/* eslint-disable @typescript-eslint/naming-convention */
// sqlt图谱展示页面

import * as vscode from "vscode";


export class SqlProvider implements vscode.WebviewViewProvider {
    private webView?: vscode.WebviewView;

    public promptText?: string;

    constructor(private context: vscode.ExtensionContext) { }

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

        webviewView.webview.html = this.getWebviewContent(webviewView.webview);

    }

    // 发送信息到前端页面函数
    public async sendMessageToWebView(message: any) {
        if (this.webView) {
            this.webView?.show?.(true);
        } else {
            await vscode.commands.executeCommand("codeai-sql.view.focus");
        }

        this.webView?.webview.postMessage(message);
    }

    // 前端页面
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