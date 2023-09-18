/* eslint-disable @typescript-eslint/naming-convention */

// 导入VS Code的API
import * as vscode from 'vscode';

// 导入模型和功能
import { WizardCoderInlineCompletionItemProvider } from './models/WizardCoderInlineCompletionItemProvider';
import { chatToWizardCoder } from './models/chatWithWizardCoder';
import { ViewProvider } from './webviews/viewProvider';
import { SqlProvider } from './webviews/sqlProvider';
import { chatToSQL } from './models/chatWithSQL';

// 定义两个可释放的命令对象
let chatToWizardCoderDisposable: vscode.Disposable | undefined;
let chatToSQLDisposale: vscode.Disposable | undefined;

// 插件激活函数
export function activate(context: vscode.ExtensionContext) {
    let providerDisposable: vscode.Disposable | undefined;

    // 创建状态栏项并设置其属性
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'codeai-vsc.toggleActivate';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 注册一个命令，用于切换插件的激活状态
    let disposable = vscode.commands.registerCommand('codeai-vsc.toggleActivate', function () {
        let activated = context.globalState.get('codeai-vsc-activated') || false;
        activated = !activated; // 切换激活状态

        context.globalState.update('codeai-vsc-activated', activated);

        if (activated) {
            // 如果插件被激活，注册InlineCompletionItemProvider
            const provider = new WizardCoderInlineCompletionItemProvider();
            providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file', language: '*' },
                provider);
            context.subscriptions.push(providerDisposable);
            statusBarItem.text = 'CodeAI: ON'; // 更改状态栏文本
            vscode.window.setStatusBarMessage('CodeAI activated!', 5000); // 显示消息5秒
        } else {
            // 如果插件被停用，注销InlineCompletionItemProvider
            if (providerDisposable) {
                providerDisposable.dispose();
                const index = context.subscriptions.indexOf(providerDisposable);
                if (index > -1) {
                    context.subscriptions.splice(index, 1);
                }
                providerDisposable = undefined;
            }
            statusBarItem.text = 'CodeAI: OFF'; // 更改状态栏文本
            vscode.window.setStatusBarMessage('CodeAI deactivated!', 5000); // 显示消息5秒
        }
    });
    context.subscriptions.push(disposable);

    // 如果插件之前被激活，自动激活它
    if (context.globalState.get('codeai-vsc-activated')) {
        vscode.commands.executeCommand('codeai-vsc.toggleActivate');
    } else {
        statusBarItem.text = 'CodeAI: OFF';
    }

    // 启动activity bar页面并绑定
    const viewProvider = new ViewProvider(context);
    const sqlProvider = new SqlProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "codeai-vsc.view",
            viewProvider,
            {
                webviewOptions: { retainContextWhenHidden: true },
            }
        )
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "codeai-sql.view",
            sqlProvider,
            {
                webviewOptions: { retainContextWhenHidden: true },
            }
        )
    );

    // 注册与chatToWizardCoder和chatToSQL相关的命令
    chatToWizardCoderDisposable = vscode.commands.registerCommand(
        "codeai-vsc.chat",
        chatToWizardCoder(viewProvider)
    );

    chatToSQLDisposale = vscode.commands.registerCommand(
        "codeai-vsc.sql",
        chatToSQL(sqlProvider)
    );

    context.subscriptions.push(chatToWizardCoderDisposable);
    context.subscriptions.push(chatToSQLDisposale);
}

// 插件停用函数
export function deactivate() {
    // 释放与chatToWizardCoder和chatToSQL相关的资源
    if (chatToWizardCoderDisposable) {
        chatToWizardCoderDisposable.dispose();
    }
    if (chatToSQLDisposale) {
        chatToSQLDisposale.dispose();
    }
}
