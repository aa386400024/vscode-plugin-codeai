/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";
import { ViewProvider } from "../webviews/viewProvider";
import fetch from 'node-fetch';


// 调用wizardcoder代码解释
type ApiResponse = {
    results: Array<{ text: string }>;
};

export const chatToWizardCoder = (
    webViewProvider: ViewProvider | undefined
) => {
    return async () => {
        if (!webViewProvider) {
            vscode.window.showErrorMessage("Webview is not available.");
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // vscode选中代码
        const selectedText = editor.document.getText(editor.selection);
        const textForQuery = selectedText
            ? `
  \`\`\`
  ${selectedText}
  \`\`\`
  `
            : "";

        
        const customQuery = "解释下列代码"; // prompt模板

        const query = `${customQuery} : ${textForQuery}`; // 拼接prompt
        showTemporaryStatusMessage("等待CodeAI...", undefined, true);

        // 对话界面展示问题
        await webViewProvider.sendMessageToWebView({
            type: "askQuestion",
            question: query,
        });

        // 调用wizardcoder api进行代码解释
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

            // const apiEndpoint = vscode.workspace.getConfiguration('codeai').get<string>('apiEndpoint') ?? '';
            const apiEndpoint = 'http://codeai.citicsinfo.com/api/v1/generate';

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
            const json = await response.json() as ApiResponse;
            const predictions = json.results;
            // 得到结果进行返回
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
            console.error(error);
        } finally {
            hideStatusMessage();
        }


    };
};