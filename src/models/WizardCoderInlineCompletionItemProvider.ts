// wizardcoder行间代码补全
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";

// 定义api返回结果类型
type ApiResponse = {
    results: Array<{ text: string }>;
};

export class WizardCoderInlineCompletionItemProvider implements vscode.InlineCompletionItemProvider {

    private debounceTimeout: NodeJS.Timeout | null = null;
    private debounceTimeInMilliseconds = 500;

    // 行间补全函数
    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionList> {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        return new Promise((resolve) => {
            this.debounceTimeout = setTimeout(async () => {
                const completionItems = await this.fetchCompletionItems(document, position);
                resolve({ items: completionItems });
            }, this.debounceTimeInMilliseconds);
        });
    }

    // 获取上下文调用api
    private async fetchCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionItem[]> {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // process context for the prompt
        const contextWindow = 500;
        // 光标上方代码
        let textAboveCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        let wordsAbove = textAboveCursor.split(/\s+/);
        if (wordsAbove.length > contextWindow) {
            wordsAbove = wordsAbove.slice(wordsAbove.length - contextWindow);
        }
        textAboveCursor = wordsAbove.join(' ');
        // 光标下方代码
        let textBelowCursor = document.getText(new vscode.Range(position, new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).range.end.character)));
        let wordsBelow = textBelowCursor.split(/\s+/);
        if (wordsBelow.length > contextWindow) {
            wordsBelow = wordsBelow.slice(0, contextWindow);
        }
        textBelowCursor = wordsBelow.join(' ');

        // 构建prompt
        const prompt = `<fim_prefix>${textAboveCursor}<fim_suffix>${textBelowCursor}<fim_middle>`;


        const completionItems: vscode.InlineCompletionItem[] = [];
        // 调用api
        try {
            // const apiEndpoint = vscode.workspace.getConfiguration('codeai').get<string>('apiEndpoint') ?? '';
            const apiEndpoint = 'http://codeai.citicsinfo.com/api/v1/generate';
            showTemporaryStatusMessage("等待CodeAI...", undefined, true);
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'contentType': 'application/json' },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                body: JSON.stringify({ prompt: prompt, max_new_tokens: 512, }),
            });

            const json = await response.json() as ApiResponse;
            const predictions = json.results;
            
            // 返回结果插入到光标处
            for (const prediction of predictions) {
                const code = prediction.text.trim();
                const completionText = code;
                const completionRange = new vscode.Range(position, position.translate(0, completionText.length));
                completionItems.push({
                    insertText: completionText,
                    range: completionRange
                });
            }

        } catch (err) {
            console.error('Error while calling AI API:', err);
        }finally {
            hideStatusMessage();
        }

        return completionItems;
    }
}
