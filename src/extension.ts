/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { WizardCoderInlineCompletionItemProvider } from './models/WizardCoderInlineCompletionItemProvider';
import { chatToWizardCoder } from './models/chatWithWizardCoder';
import { ViewProvider } from './webviews/viewProvider';
import { SqlProvider } from './webviews/sqlProvider';
import { chatToSQL } from './models/chatWithSQL';

let chatToWizardCoderDisposable: vscode.Disposable | undefined;
let chatToSQLDisposale: vscode.Disposable | undefined;

// 激活插件
export function activate(context: vscode.ExtensionContext) {
	let providerDisposable: vscode.Disposable | undefined;

	// Status bar item creation
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'codeai-vsc.toggleActivate';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Command registration
	let disposable = vscode.commands.registerCommand('codeai-vsc.toggleActivate', function () {
		let activated = context.globalState.get('codeai-vsc-activated') || false;
		activated = !activated; // toggle the activation state

		context.globalState.update('codeai-vsc-activated', activated);

		if (activated) {
			const provider = new WizardCoderInlineCompletionItemProvider();
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file', language: '*' },
				provider);
			context.subscriptions.push(providerDisposable);
			statusBarItem.text = 'CodeAI: ON'; // Change status bar text
			vscode.window.setStatusBarMessage('CodeAI activated!', 5000); // Show message for 5 seconds
		} else {
			if (providerDisposable) {
				providerDisposable.dispose(); // unregister the provider
				const index = context.subscriptions.indexOf(providerDisposable);
				if (index > -1) {
					context.subscriptions.splice(index, 1);
				}
				providerDisposable = undefined;
			}
			statusBarItem.text = 'CodeAI: OFF'; // Change status bar text
			vscode.window.setStatusBarMessage('CodeAI deactivated!', 5000); // Show message for 5 seconds
		}
	});
	context.subscriptions.push(disposable);

	// Automatically activate the extension if it was previously activated
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

// 关闭插件
export function deactivate() {
	if (chatToWizardCoderDisposable) {
		chatToWizardCoderDisposable.dispose();
	}
	if (chatToSQLDisposale) {
		chatToSQLDisposale.dispose();
	}
}
