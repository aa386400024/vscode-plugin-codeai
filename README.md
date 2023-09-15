# CodeAI-vsc 
Developed by Citics Data Platform. A Visual Studio Code extension, developed as a proof of concept (POC) to demonstrate how AI-powered code auto-completion features like GitHub Copilot work.

GitLabs: http://gitlab.citicsinfo.com/codeai/vscode-plugin-codeai

## Usage
You can access the extension's commands by:

- Inline Completion: Using the copilot's inline completion the "toggle codeai activation" command: Shift+Ctrl+' (Windows/Linux) or Shift+Cmd+' (Mac).
- Explain the code: Right-clicking in the editor and selecting the `Explain code with CodeAI` command from the context menu.
- Chat with CodeAI: Click the `CodeAI问答助手` icon in the side bar; ask the question and press `enter` to chat with the code assistant. You can change different chat models using workspace settings by clicking on the gear icon in the bottom left corner. 
- Analyze SQL Lineage: Right-clicking in the editor and selecting the `Analyze SQL with CodeAI` command from the context menu. 

## Local Development
Prerequisites - Node.js (version >= 16)  - VSCode (version >= 1.79.0) - Git Bash(if using Windows) - Visual Studio Code extension packager (`npm install -g vsce`)

1. Clone the repository to your local machine.

2. Open the repository in Visual Studio Code.

3. Run the following command in the terminal to install the required dependencies:

```
npm install
```
You can skip this step if you have already installed the required dependencies in the `node_modules` file. 


4. In Visual Studio Code, click on the "Run and Debug" icon in the left corner and select "Launch Extension" from the dropdown menu on the top. This will open a new window with the extension running. You can also press "F5" to launch debugging.

5. To wrap up the extention, enter the file directory and run the following command to package the extension: 
``` 
vsce package 
``` 
This will generate a VSIX file that can be installed in Visual Studio Code.




