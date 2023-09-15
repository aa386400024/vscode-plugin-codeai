/* eslint-disable @typescript-eslint/naming-convention */
// 调用sql血缘接口（待修改）
import * as vscode from "vscode";
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";
import { SqlProvider } from "../webviews/sqlProvider";
import axios from "axios";
import * as qs from "qs";

// type ApiResponse = {
//     code: number,
//     data: Data,
//     sqltext: string
// };

// type coordinate = {
//     'x': number,
//     'y': number,
//     'hashcode': string
// };

// type cocolumn = {
//     'id': string,
//     'name': string,
//     'coordinates': Array<coordinate>
// };

// type dbobj = {
//     'id': string,
//     'name': string,
//     'type': string,
//     'columns': Array<cocolumn>,
//     'coordinates': Array<coordinate>
// };

// type source = {
//     'id': string,
//     'column': string,
//     'parentID': string,
//     'coordinates': Array<coordinate>
// };

// type target = {
//     'id': string,
//     'column': string,
//     'parentId': string,
//     'parentName': string,
//     'coordinates': Array<coordinate>
// };

// type relation = {
//     'id': string,
//     'type': string,
//     'effectType': string,
//     'target': target,
//     'sources': Array<source>
// };

// type sqlflow = {
//     'dbvendor': string, 
//     'dbobjs': Array<dbobj>, 
//     'relations': Array<relation>
// };

// type Lable = {
//     'content': string,
//     'fontFamily': string,
//     'fontSize': string,
//     'height': number,
//     'width': number,
//     'x': number,
//     'y': number,
// };

// type column = {
//     'height': string,
//     'id': string,
//     'lable': Lable,
//     'width': number,
//     'x': number,
//     'y': number,
// };

// type Table = {
//     'columns': Array<column>,
//     'height': number,
//     'id': string,
//     'label': Lable,
//     'width': number,
//     'x': number,
//     'y': number,
// };

// type Edge = {
//     'id': string,
//     'sourceId': string,
//     'targetId': string,
// };

// type Element = {
//     'tables': Array<Table>,
//     'edges': Array<Edge>
// };

// type Graph = {
//     'elements': Element,
//     'tooltip': string,
//     'relationIdMap': string,
//     'listIdMap': string
// };

// type Data = {
//     'mode': string,
//     'summary': string,
//     'sqlflow': sqlflow,
//     'graph': Graph
// };



export const chatToSQL = (
    webViewProvider: SqlProvider | undefined
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

        // 从workspace设置中获得sqlType，并设置dbvendor变量
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

        // 或者ide选中代码
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

        showTemporaryStatusMessage("等待CodeAI...", undefined, true); // 调用等待图标控件
        
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            
            const response = await axios(config); // 调用api
            let json = await response.data;
            
            // 成功则将选择文本与数据库类型发送至sqlProvider页面，再次进行调用并展示结果（二次调用待改进）
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
            console.error(error);
        } finally {
            hideStatusMessage(); // 关闭等待图标控件
        }


    };
};