/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();
    const list = document.getElementById("qa-list");
    let response = '';
    
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
        const message = event.data;

        switch (message.type) {
            case "askQuestion":
                const html = marked.parse(message.question);
                list.innerHTML = `<div class="p-4 self-end mb-4">
                          <p class="font-bold mb-5 flex">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              You
                          </p>
                          ${html}
                      </div>`;

                document.getElementById("in-progress")?.classList?.remove("hidden");
                break;
            case "addResponse":
                document.getElementById("in-progress")?.classList?.add("hidden");
                response = message.value;
                list.innerHTML += `<p class="font-bold mb-5 flex">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>
                </p>`;
                setResponse();
                break;
            default:
                break;
        }
    });

    // 高亮代码块
    function fixCodeBlocks(response) {
        // Use a regular expression to find all occurrences of the substring in the string
        const REGEX_CODEBLOCK = new RegExp('\`\`\`', 'g');
        const matches = response.match(REGEX_CODEBLOCK);

        // Return the number of occurrences of the substring in the response, check if even
        const count = matches ? matches.length : 0;
        if (count % 2 === 0) {
            return response;
        } else {
            // else append ``` to the end to make the last code block complete
            return response.concat('\n\`\`\`');
        }
    }

    // 设置返回格式
    function setResponse() {
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

        var preCodeBlocks = document.querySelectorAll("pre code");
        for (var i = 0; i < preCodeBlocks.length; i++) {
            preCodeBlocks[i].classList.add(
                "p-2",
                "my-2",
                "codeblock",
                "overflow-x-scroll"
            );
        }

        var codeBlocks = document.querySelectorAll('code');
        for (var i = 0; i < codeBlocks.length; i++) {
            // Check if innertext starts with "Copy code"
            if (codeBlocks[i].innerText.startsWith("Copy code")) {
                codeBlocks[i].innerText = codeBlocks[i].innerText.replace("Copy code", "");
            }

            codeBlocks[i].classList.add("inline-flex", "max-w-full", "overflow-hidden", "rounded-sm", "cursor-pointer");

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

        // microlight.reset('code');

        //document.getElementById("response").innerHTML = document.getElementById("response").innerHTML.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    // 监听输入框按回车
    document.getElementById('prompt-input').addEventListener('keyup', function (e) {
        // If the key that was pressed was the Enter key
        if (e.keyCode === 13) {
            vscode.postMessage({
                type: 'prompt',
                value: this.value
            });
        }
    });


    

})();