# Hivemind Overlay
![icon-256](https://github.com/user-attachments/assets/aebeb907-806c-4047-9235-f87c1950651d)

**Hivemind Overlay** is a Chrome extension and optional server-side assistant that enhances Twitch and YouTube livestream chat by:

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

![image](https://github.com/user-attachments/assets/dcd35c34-631a-4427-9033-35f1f872e8d7)


![image](https://github.com/user-attachments/assets/3fdc5cd6-265a-4e42-afd4-20406f6f02d6)

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

> Inspired by how drone bugs monitor and respond to collective behavior.  
> Designed for streamers who want **signal**—not **noise**.
