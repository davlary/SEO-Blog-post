# Agent (Server/agent)

This folder contains a small marketing agent that uses Ollama via the LangChain
wrappers. It provides a factory `createMarketingAgent()` and a convenience
function `runMarketingPrompt(prompt)`.

Quick start

1. From this directory run:

```powershell
npm install
npm start
```

2. `npm start` runs `index.js` which calls a short sample marketing prompt.

Notes
- Ensure you have the model installed locally in Ollama (for example `qwen3`).
- If you prefer a different model name, edit `agent.js` and change the `new
  Ollama({ model: "qwen3" })` line.
- The `jsExecutor` tool is intentionally disabled from executing arbitrary
  code for safety — it returns the code and a placeholder response.

If you want me to wire an Express HTTP endpoint around the agent or persist
checkpoints on disk, tell me and I can add it.
