<h1 align="center">Obsidian Agent</h1>

<p align="center">
  Lend your vault to an AI agent. Read, write, and search your notes with AI.<br/>
</p>

<div align="center">
  <div>
    <img src="https://img.shields.io/badge/Obsidian-%23483699.svg?&logo=obsidian&logoColor=white" alt="Obsidian">
    <img src="https://img.shields.io/badge/Google%20Gemini-886FBF?logo=googlegemini&logoColor=fff" alt="Google Gemini">
    <img src="https://img.shields.io/badge/Anthropic%20Claude-D97757?logo=anthropic&logoColor=fff" alt="Anthropic Claude">
    <img src="https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=fff" alt="OpenAI">
    <img src="https://img.shields.io/badge/Ollama-000000?logo=ollama&logoColor=fff" alt="Ollama">
    <a href="https://coff.ee/themanuelml" style="text-decoration: none">
      <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?&logo=buy-me-a-coffee&logoColor=black" alt="Buy mea coffe">
    </a>
  </div>
  <div>
    <img src="https://img.shields.io/badge/Licence-MIT-D93192" alt="Release">
    <img src="https://img.shields.io/github/stars/TheManuelML/obsidian-agent?style=social" alt="GitHub stars">
  </div>
</div>

## 🚀 Overview
A simple and lightweight AI extension for Obsidian. Connect Google Gemini, Anthropic Claude, OpenAI, or a local Ollama model, and delegate basic tasks to an agent that can write, edit, and create notes and folders within your vault.

It features a user-friendly UI, inspired by other agentic apps.

![main UI](./imgs/demo.png)


## 🧠 Getting Started

1. Clone the repository inside your `~/vault/.obsidian/plugins/` folder.
2. Enable the plugin from Obsidian's settings panel.
3. In the plugin's settings panel, choose your AI provider (Google, Anthropic, OpenAI, or Ollama) and add the corresponding credentials.

> [!IMPORTANT]  
> - For **Google**, **Anthropic**, and **OpenAI**, make sure you have a valid API key for the selected provider.
> - For **Ollama**, no API key is needed, just make sure your local Ollama server is running and the model has been pulled.
> - You can also add a custom base URL to connect to a different endpoint for the selected provider.

Start chating with the agent by locating  and clicking on the brain icon in the left and right sidebars. Or add a hotkey to kickly acces your most recent chat.

![hotkeys](./imgs/hotkeys.png)

## 💬 Chats

Manage your chats as Obsidian notes. Rename the chat by renaming the file.

![chat-management](./imgs/manage-chats.png)

> [!CAUTION]  
> Chat files are design to store the chat history and the messages metadata. Do not modify or move them.

## 🛠️ Tools

The agent can use the following tools to interact with your vault:

- **Create note**: Create a new note in your vault.   
e.g: *Create a note titled 'Project Ideas'*
- **Read note**: Read the content of a note.  
e.g: *Read the active note*
- **Edit note**: Edit an existing note.  
e.g: *Add a summary of this text: [...] to the note 'Book Review'*
- **Create folder**: Create a new folder.  
e.g: *Create a folder called '2024 Plans'*
- **List files**: List files in a folder.  
e.g: *List all files in the folder 'Research'*
- **Vault Search**: Search for content across your vault.  
e.g: *Search if it exist a note called 'AI agent'*
- **Note filtering**: Return note paths that fall inside a date range.  
e.g: *Give me yesterday's notes*
- **Web search**: Search for content on the web. Not available with Ollama models.  
e.g: *Search on the web for todays temperature in Austin, Texas*

Also you can right click over selected text, in your markdown notes, to `summarize selection` or `ask agent`.

<img height=400 src="./imgs/action-menu.png" alt="Obsidian">

And finally, you can also attach images by clicking the image icon, and notes with the `@` icon in the input.

## 🟡 Disclosures
This plugin can connect to remote AI services (Google Gemini, Anthropic Claude, or OpenAI) to process your requests, or to a local Ollama instance.

> **Why is this needed?**  
> The AI models that power these features run on external servers and require an internet connection, with the exception of Ollama, which runs locally on your machine. Your notes or queries are sent securely to the selected provider for processing, and the results are only returned to your vault.

To use Google, Anthropic, or OpenAI, you must set the corresponding API key. You are responsible for obtaining and managing your API keys. Ollama does not require an API key, but does require a local Ollama installation.

## 🫱🏼‍🫲🏼 Contributing & Support

- Found a bug? Open an issue [here](https://github.com/TheManuelML/obsidian-agent/issues).  
- Want to contribute? Create a new pull request.
