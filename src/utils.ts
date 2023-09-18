// 导入VS Code的API模块，用于与VS Code编辑器进行交互
import * as vscode from "vscode";

// 定义ASCII加载动画的帧
const asciiLoadingFrames = ["|", "/", "-", "\\"];
// 定义状态栏项目变量，用于显示消息
let statusBarItem: vscode.StatusBarItem | undefined;
// 定义动画间隔变量，用于控制加载动画
let animationInterval: NodeJS.Timeout | undefined;

// 工具栏展示等待信息工具
// 这个函数用于在VS Code的状态栏中显示临时消息
export function showTemporaryStatusMessage(
    message: string,  // 要显示的消息文本
    timeout?: number,  // 消息显示的持续时间（毫秒）
    animate?: boolean  // 是否显示加载动画
) {
    // 如果状态栏项目未定义，则创建一个
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left  // 在状态栏的左侧显示
        );
    }
    // 设置并显示消息文本
    statusBarItem.text = message;
    statusBarItem.show();

    // 如果启用了加载动画
    if (animate) {
        let counter = 0;
        // 设置动画间隔，每100毫秒更新一次
        animationInterval = setInterval(() => {
            counter = (counter + 1) % asciiLoadingFrames.length;
            if (statusBarItem) {
                statusBarItem.text = message + " " + asciiLoadingFrames[counter];
            }
        }, 100);
    }

    // 如果设置了超时，则在超时后隐藏消息
    if (timeout) {
        setTimeout(() => {
            statusBarItem?.hide();
            if (animationInterval) {
                clearInterval(animationInterval);
            }
        }, timeout);
    }
}

// 工具栏隐藏等待信息工具
// 这个函数用于隐藏状态栏中的消息
export function hideStatusMessage() {
    if (statusBarItem) {
        statusBarItem.hide();
    }
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = undefined;
    }
}

// 删除文本中第一个三重反引号之前和之后的内容
// 这个函数用于从文本中提取被三重反引号包围的内容
export function removeTextBeforeAndAfterFirstTripleBackticks(
    response: string  // 输入的文本
): string {
    return response.replace(/[\s\S]*?```[\S]*\n?/, "").replace(/```$/, "");
}
