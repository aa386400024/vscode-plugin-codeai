// 禁用一些TypeScript和ESLint的规则（这些规则与代码风格和格式有关）
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck

// 这个脚本将在webview内部运行，不能直接访问VS Code的主要API
(function () {
    // 获取VS Code API的引用，以便在webview内部与VS Code扩展进行通信
    const vscode = acquireVsCodeApi();

    // 获取ID为"qa-list"的DOM元素，这可能是一个用于显示问题和答案的列表
    const list = document.getElementById("qa-list");

    // 初始化一个空字符串，用于存储从扩展接收的响应
    let response = '';
    
    // 添加一个事件监听器，用于处理从VS Code扩展发送到webview的消息
    window.addEventListener("message", (event) => {
        // 获取发送的消息内容
        const message = event.data;

        // 根据消息的类型进行不同的处理
        switch (message.type) {
            case "askQuestion":
                // 使用marked库解析Markdown格式的问题
                const html = marked.parse(message.question);
                // 将解析后的HTML内容设置到qa-list元素中
                list.innerHTML = `<div class="p-4 self-end mb-4">
                          <p class="font-bold mb-5 flex">
                              <svg xmlns="http://www.w3.org/2000/svg" ... ></svg>
                              You
                          </p>
                          ${html}
                      </div>`;
                // 显示一个等待消息，告诉用户正在处理他们的请求
                document.getElementById("in-progress")?.classList?.remove("hidden");
                break;
            case "addResponse":
                // 隐藏等待消息
                document.getElementById("in-progress")?.classList?.add("hidden");
                // 存储从扩展接收的响应
                response = message.value;
                // 将响应添加到qa-list元素中
                list.innerHTML += `<p class="font-bold mb-5 flex">...</p>`;
                // 设置响应的格式
                setResponse();
                break;
            default:
                // 对于其他类型的消息，不进行任何操作
                break;
        }
    });

    // 高亮代码块的函数
    function fixCodeBlocks(response) {
        // 使用正则表达式查找字符串中的所有代码块标记
        const REGEX_CODEBLOCK = new RegExp('\\`\\`\\`', 'g');
        const matches = response.match(REGEX_CODEBLOCK);

        // 返回字符串中代码块标记的数量，并检查是否为偶数
        const count = matches ? matches.length : 0;
        if (count % 2 === 0) {
            return response;
        } else {
            // 如果不是偶数，则在字符串末尾添加```以完成最后一个代码块
            return response.concat('\\n\\`\\`\\`');
        }
    }

    // 设置响应格式的函数
    function setResponse() {
        // 使用showdown库转换Markdown格式的响应
        var converter = new showdown.Converter({
            omitExtraWLInCodeBlocks: true,
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            literalMidWordUnderscores: true,
            simpleLineBreaks: true
        });
        response = fixCodeBlocks(response);
        html = converter.makeHtml(response);
        console.log(html);
        document.getElementById("qa-list").innerHTML += html;

        // 为所有代码块添加样式
        var preCodeBlocks = document.querySelectorAll("pre code");
        for (var i = 0; i < preCodeBlocks.length; i++) {
            preCodeBlocks[i].classList.add(
                "p-2",
                "my-2",
                "codeblock",
                "overflow-x-scroll"
            );
        }

        // 为所有内联代码块添加样式和点击事件
        var codeBlocks = document.querySelectorAll('code');
        for (var i = 0; i < codeBlocks.length; i++) {
            // 检查内联代码块的文本是否以"Copy code"开头
            if (codeBlocks[i].innerText.startsWith("Copy code")) {
                codeBlocks[i].innerText = codeBlocks[i].innerText.replace("Copy code", "");
            }

            codeBlocks[i].classList.add("inline-flex", "max-w-full", "overflow-hidden", "rounded-sm", "cursor-pointer");

            // 当用户点击代码块时，发送一个消息到VS Code扩展
            codeBlocks[i].addEventListener('click', function (e) {
                e.preventDefault();
                vscode.postMessage({
                    type: 'codeSelected',
                    value: this.innerText
                });
            });

            const d = document.createElement('div');
            d.innerHTML = codeBlocks[i].innerHTML;
            codeBlocks[i].innerHTML = null;
            codeBlocks[i].appendChild(d);
            d.classList.add("code");
        }

        // microlight.reset('code');  // 这行代码被注释掉了，可能是用于重置代码高亮的函数

        //document.getElementById("response").innerHTML = document.getElementById("response").innerHTML.replaceAll('<', '&lt;').replaceAll('>', '&gt;');  // 这行代码被注释掉了，可能是用于转义HTML字符的函数
    }

    // 为ID为'prompt-input'的输入框添加键盘事件监听器
    document.getElementById('prompt-input').addEventListener('keyup', function (e) {
        // 如果按下的是Enter键
        if (e.keyCode === 13) {
            // 发送一个消息到VS Code扩展，告诉扩展用户已经输入了一个问题
            vscode.postMessage({
                type: 'prompt',
                value: this.value
            });
        }
    });

    // ... 其他函数和逻辑 ...

})();
