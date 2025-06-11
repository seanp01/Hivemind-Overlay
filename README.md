# HivemindOverlay
![icon-1024](https://github.com/user-attachments/assets/08496d5c-2eda-4be1-bfa7-c0a364225d31)

**HivemindOverlay** is a Chrome extension and optional server-side assistant that enhances Twitch and YouTube livestream chat by:

- Filtering junk
 and spam in real time  
- Highlighting meaningful messages (questions, jokes, tips)  
- Using AI (LLMs like GPT or Claude) to summarize and analyze chat blocks  
- (Optionally) Listening to streamer voice via Web Speech API or Whisper  
- Calculating chat delay and aligning viewer reactions to voice input  
- Displaying highlights and summaries in a user-friendly overlay  

---

## 📦 Features

- ✨ Chrome Extension UI  
- 🔌 Twitch and YouTube API integration  
- 🧠 Pluggable LLM summarization  
- 🧹 Real-time spam filters  
- 🗣️ Optional speech-to-text sync  
- 🔄 Toggleable filter modes  
- 📊 Overlay-compatible output  

---

## 🧱 Tech Stack

- **Chrome Extension** (Manifest V3)  
- **Node.js backend** (optional, for LLM proxy or log capture)  
- **OpenAI/Claude API** integration  
- **Web Speech API** or **Whisper** for audio transcription  
- **LocalStorage** for user preferences  

---

## 🧰 File Structure (Overview)
```
HivemindOverlay/
├── extension/
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup logic
│   ├── content.js        # Injected script for Twitch/YouTube
│   ├── background.js     # Background service worker
│   ├── manifest.json     # Chrome extension config
│   └── styles.css        # UI styling
├── src/
│   ├── chatClient/       # Twitch & YouTube chat listeners
│   ├── filters/          # Junk filters & highlight engine
│   ├── llm/              # GPT/Claude interaction
│   ├── speech/           # Speech-to-text transcription
│   └── sync/             # Timestamp alignment logic
├── server/
│   ├── index.js          # Node.js entry point
│   └── routes/gpt.js     # Optional LLM proxy
└── README.md             # Project overview and instructions
```

---

## 🚀 Getting Started

1. Load the extension:
   - Go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `extension/` folder

2. Connect APIs:
   - Twitch IRC via `tmi.js` or WebSocket
   - YouTube Live Chat via official API
   - Add your OpenAI/Claude key to `llmService.js` (TODO)

3. (Optional) Run the backend:
```bash
cd server
npm install
node index.js
```

---

## 📌 Status

This is a WIP. All files currently contain **placeholders** with `// TODO` instructions. Contributions and issue tracking welcome!

---

https://github.com/user-attachments/assets/b2557c20-bf28-4313-8cb8-90cf6511894a

> Inspired by how drone bugs monitor and respond to collective behavior.  
> Designed for streamers who want **signal**—not **noise**.
