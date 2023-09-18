// 导入VS Code的API模块，用于与VS Code编辑器进行交互
import * as vscode from 'vscode';

// 导入node-fetch模块，用于进行HTTP请求
import fetch from 'node-fetch';

// 导入工具函数，用于显示和隐藏状态消息
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";

// 定义API的返回类型，其中results是一个数组，包含文本属性
type ApiResponse = {
    results: Array<{ text: string }>;
};

// 实现VS Code的InlineCompletionItemProvider接口，用于提供行内代码补全
export class WizardCoderInlineCompletionItemProvider implements vscode.InlineCompletionItemProvider {

    // 定义一个用于函数防抖的超时对象
    private debounceTimeout: NodeJS.Timeout | null = null;

    // 定义函数防抖的时间间隔为500毫秒
    private debounceTimeInMilliseconds = 500;

    // 提供行内代码补全项的函数
    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionList> {
        // 如果存在超时对象，则清除它，以确保不会重复请求
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // 返回一个新的Promise对象
        return new Promise((resolve) => {
            // 设置一个新的超时对象，延迟500毫秒后执行
            this.debounceTimeout = setTimeout(async () => {
                // 异步获取代码补全项
                const completionItems = await this.fetchCompletionItems(document, position);
                // 返回补全项列表
                resolve({ items: completionItems });
            }, this.debounceTimeInMilliseconds);
        });
    }

    // 从API获取代码补全项的私有函数
    private async fetchCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionItem[]> {
        // 设置环境变量以忽略TLS证书验证，这在开发环境中可能是必要的，但在生产环境中不建议这样做
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // 定义上下文窗口的大小为500个单词
        const contextWindow = 500;

        // 获取光标上方的文本，并将其分割为单词数组
        let textAboveCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        let wordsAbove = textAboveCursor.split(/\s+/);
        // 如果单词数量超过了上下文窗口的大小，则仅保留最后的500个单词
        if (wordsAbove.length > contextWindow) {
            wordsAbove = wordsAbove.slice(wordsAbove.length - contextWindow);
        }
        textAboveCursor = wordsAbove.join(' ');

        // 获取光标下方的文本，并将其分割为单词数组
        let textBelowCursor = document.getText(new vscode.Range(position, new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).range.end.character)));
        let wordsBelow = textBelowCursor.split(/\s+/);
        // 如果单词数量超过了上下文窗口的大小，则仅保留前500个单词
        if (wordsBelow.length > contextWindow) {
            wordsBelow = wordsBelow.slice(0, contextWindow);
        }
        textBelowCursor = wordsBelow.join(' ');

        // 使用上方和下方的文本构建提示
        const prompt = `<fim_prefix>${textAboveCursor}<fim_suffix>${textBelowCursor}<fim_middle>`;

        // 初始化一个空的补全项数组
        const completionItems: vscode.InlineCompletionItem[] = [];

        try {
            // 定义API的端点URL
            const apiEndpoint = 'http://codeai.citicsinfo.com/api/v1/generate';

            // 在状态栏中显示等待消息
            showTemporaryStatusMessage("等待CodeAI...", undefined, true);

            // 使用fetch函数发送POST请求到API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'contentType': 'application/json' },
                body: JSON.stringify({ prompt: prompt, max_new_tokens: 512, }),
            });

            // 将API的响应解析为JSON格式
            const json = await response.json() as ApiResponse;
            const predictions = json.results;

            // 遍历API返回的预测结果，并将其添加到补全项数组中
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
            // 如果在调用API时发生错误，打印错误信息
            console.error('调用AI API时出错:', err);
        } finally {
            // 无论是否发生错误，都隐藏状态栏的消息
            hideStatusMessage();
        }

        // 返回代码补全项数组
        return completionItems;
    }
}
