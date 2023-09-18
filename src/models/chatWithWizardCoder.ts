// 导入VS Code的API模块，用于与VS Code编辑器进行交互
import * as vscode from "vscode";

// 导入工具函数，用于显示和隐藏状态消息
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";

// 导入Web视图提供者，用于与Web视图进行交互
import { ViewProvider } from "../webviews/viewProvider";

// 导入node-fetch模块，用于进行HTTP请求
import fetch from 'node-fetch';

// 定义API的返回类型，其中results是一个数组，包含文本属性
type ApiResponse = {
    results: Array<{ text: string }>;
};

// 定义与CodeAI进行交互的函数
export const chatToWizardCoder = (
    webViewProvider: ViewProvider | undefined
) => {
    return async () => {
        // 如果Web视图提供者不可用，显示错误消息
        if (!webViewProvider) {
            vscode.window.showErrorMessage("Webview is not available.");
            return;
        }

        // 获取当前活动的文本编辑器
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // 获取编辑器中选中的文本
        const selectedText = editor.document.getText(editor.selection);
        const textForQuery = selectedText
            ? `
  \`\`\`
  ${selectedText}
  \`\`\`
  `
            : "";

        // 定义自定义查询模板
        const customQuery = "解释下列代码";

        // 拼接查询字符串
        const query = `${customQuery} : ${textForQuery}`;
        showTemporaryStatusMessage("等待CodeAI...", undefined, true);

        // 在对话界面显示问题
        await webViewProvider.sendMessageToWebView({
            type: "askQuestion",
            question: query,
        });

        // 调用wizardcoder API进行代码解释
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 设置环境变量以忽略TLS证书验证

            // 定义API的端点URL
            const apiEndpoint = 'http://codeai.citicsinfo.com/api/v1/generate';

            // 使用fetch函数发送POST请求到API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'contentType': 'application/json' },
                body: JSON.stringify({
                    prompt: `Below is an instruction that describes a task. Write a response that appropriately completes the request
### Instruction: ${query}
### Response:`,
                    max_new_tokens: 1000,
                }),
            });

            // 将API的响应解析为JSON格式
            const json = await response.json() as ApiResponse;
            const predictions = json.results;

            // 获取结果并返回
            if (predictions[0].text) {
                await webViewProvider.sendMessageToWebView({
                    type: "addResponse",
                    value: predictions[0].text,
                });
            } else {
                showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
                webViewProvider.sendMessageToWebView({
                    type: "addResponse",
                    value: "Failed to call chatgpt!",
                });
            }
        } catch (error) {
            // 如果在调用API时发生错误，打印错误信息
            console.error(error);
        } finally {
            // 无论是否发生错误，都隐藏状态栏的消息
            hideStatusMessage();
        }
    };
};
