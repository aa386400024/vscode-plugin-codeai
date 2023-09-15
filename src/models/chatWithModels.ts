/* eslint-disable @typescript-eslint/naming-convention */

import { Configuration, OpenAIApi } from 'openai';
import * as vscode from "vscode";

// 调用对话模型
export async function chatWithModels(prompt: string){
    let openai: OpenAIApi;
    let apiConfiguration: Configuration;
    let _apiKey: string;
    let _apiBase: string;
    let model_name: string;
    let model: string;
    let config = vscode.workspace.getConfiguration('codeai');
    let temperature: number;
    let maxTokens: number;

    // get model name from config
    model_name = config.get("chatModel") || "Qwen";
    temperature = config.get("temperature") || 0.9;
    maxTokens = config.get("maxTokens") || 1024;

    // get model config depends on model name
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

    // create openai interface
    apiConfiguration = new Configuration({
        apiKey: _apiKey,
        basePath: _apiBase
    });

    openai = new OpenAIApi(apiConfiguration);


    // get completion from openai interface
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let completion;
        completion = await openai.createChatCompletion({
            model: model || "qwen",
            messages: [{"role": "user", "content": prompt}],
            temperature: temperature,
            max_tokens: maxTokens
        });
        const response = completion?.data.choices[0].message?.content;
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
}