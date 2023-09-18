/* eslint-disable @typescript-eslint/naming-convention */
// 调用sql血缘接口（待修改）

// 导入VS Code的API模块，用于与VS Code编辑器进行交互
import * as vscode from "vscode";

// 导入工具函数，用于显示和隐藏状态消息
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";

// 导入Web视图提供者，用于与Web视图进行交互
import { SqlProvider } from "../webviews/sqlProvider";

// 导入axios库，用于发送HTTP请求
import axios from "axios";

// 导入qs库，用于处理查询字符串
import * as qs from "qs";

// 下面的类型定义部分被注释掉了，可能是因为当前版本不需要这些类型定义，或者它们将在未来的版本中使用

// 定义与SQL进行交互的函数
export const chatToSQL = (
    webViewProvider: SqlProvider | undefined
) => {
    return async () => {
        // 检查Web视图提供者是否可用
        if (!webViewProvider) {
            vscode.window.showErrorMessage("Webview is not available.");
            return;
        }

        // 获取当前活动的文本编辑器
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // 从workspace设置中获取sqlType，并设置dbvendor变量
        let dbvendor: string;
        let dbtype: string;
        dbtype = vscode.workspace.getConfiguration('codeai').get("sqlType") || "Oracle";
        switch (dbtype) {
            case "Oracle": {
                dbvendor = "dbvoracle";
                break;
            }
            case "GreenPlum": {
                dbvendor = "dbvgreenplum";
                break;
            }
            case "PostgreSQL": {
                dbvendor = "dbvpostgresql";
                break;
            }
            case "SqlServer": {
                dbvendor = "dbvsqlserver";
                break;
            }
            default: {
                dbvendor = "dbvoracle";
                break;
            }
        }

        // 获取IDE中选中的代码
        const selectedText = editor.document.getText(editor.selection);

        // 编码并生成调用api参数
        const sqltxt = btoa(encodeURIComponent(encodeURIComponent(selectedText)));
        const data: string = qs.stringify({
            'sqltext': sqltxt,
            'dbvendor': dbvendor,
            'showRelationType': 'fdd',
            'ignoreFunction': 'true',
            'ignoreRecordSet': 'false'
        });

        // 定义API的URL
        const url: string = "http://dms.citicsinfo.com/provenance/sjzl/gspLive_backend/sqlflow/generation/sqlflow/graph.vot";
        const config = {
            method: 'post',
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'provenance=0B6DBC4653162E7822B45B8C5756A1AE'
            },
            data: data
        };

        // 调用等待图标控件
        showTemporaryStatusMessage("等待CodeAI...", undefined, true);
        
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            
            // 调用API
            const response = await axios(config);
            let json = await response.data;
            
            // 成功则将选中文本与数据库类型发送到sqlProvider页面，再次进行调用并显示结果（二次调用待改进）
            if (json.code === 200) {
                await webViewProvider.sendMessageToWebView({
                    type: "addGraph",
                    sqltext: selectedText,
                    sqltype: dbvendor
                });
            } else {
                showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
            }
        } catch (error) {
            // 打印错误信息
            console.error(error);
        } finally {
            // 关闭等待图标控件
            hideStatusMessage();
        }
    };
};
