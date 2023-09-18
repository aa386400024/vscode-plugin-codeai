/* eslint-disable @typescript-eslint/naming-convention */

// 导入所需的模块
import { Configuration, OpenAIApi } from 'openai';
import * as vscode from "vscode";

// 定义一个异步函数，用于与不同的模型进行对话
export async function chatWithModels(prompt: string){
    // 定义所需的变量
    let openai: OpenAIApi;
    let apiConfiguration: Configuration;
    let _apiKey: string;
    let _apiBase: string;
    let model_name: string;
    let model: string;
    // 从 VS Code 的配置中获取 'codeai' 的配置
    let config = vscode.workspace.getConfiguration('codeai');
    let temperature: number;
    let maxTokens: number;

    // 从配置中获取模型名称、温度和最大令牌数
    model_name = config.get("chatModel") || "Qwen";
    temperature = config.get("temperature") || 0.9;
    maxTokens = config.get("maxTokens") || 1024;

    // 根据模型名称获取相应的 API 基础路径、API 密钥和模型名称
    switch(model_name){
        case "GPT-3.5-turbo":{
            _apiBase = config.get("apiBase")||"https://api.openai.com/v1";
            _apiKey = config.get("apiKey")||"none";
            model = "gpt-3.5-turbo";
            break;
        }
        case "GPT-4":{
            _apiBase = config.get("apiBase") || "https://api.openai.com/v1";
            _apiKey = config.get("apiKey") || "none";
            model = "gpt-4";
            break;
        }
        case "Qwen":{
            _apiBase = "http://glm.citicsinfo.com/qwen/v1";
            _apiKey = "none";
            model = "qwen-7b";
            break;
        }
        case "Baichuan":{
            _apiBase = "http://glm.citicsinfo.com/baichuan/v1";
            _apiKey = "none";
            model = "baichuan-13b";
            break;
        }
        case "ChatGLM2":{
            _apiBase = "http://codeai.citicsinfo.com/glm/v1";
            _apiKey = "none";
            model = "chatglm-6b";
            break;
        }
        default:{
            _apiBase = "http://glm.citicsinfo.com/qwen/v1";
            _apiKey = "none";
            model = "qwen-7b";
            break;
        }
    }

    // 使用获取的 API 密钥和基础路径创建一个新的 OpenAIApi 接口
    apiConfiguration = new Configuration({
        apiKey: _apiKey,
        basePath: _apiBase
    });

    openai = new OpenAIApi(apiConfiguration);

    // 通过 OpenAIApi 接口获取模型的回复
    try {
        // 设置环境变量以禁用 TLS 证书验证（注意：这可能会导致安全问题）
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let completion;
        // 调用 OpenAIApi 的 createChatCompletion 方法发送消息给模型并获取回复
        completion = await openai.createChatCompletion({
            model: model || "qwen",
            messages: [{"role": "user", "content": prompt}],
            temperature: temperature,
            max_tokens: maxTokens
        });
        // 获取模型的回复内容
        const response = completion?.data.choices[0].message?.content;
        return response;
    } catch (error) {
        // 如果发生错误，打印错误并返回 null
        console.error(error);
        return null;
    }
}
