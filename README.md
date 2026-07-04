# Alpago GPT

Local prompt testing console for the Subconscious AI backend flows.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Chat Prompt** — rolling summary context (every 10 user turns) + Guru response
- **Questions Generation** — 4 MindScan categories with backend prompts
- **Analyze Answers** — parallel belief detector + mirror result calls
- **Shadow Analysis** — uses saved MindScan from analyze mode

## Setup

1. Paste your OpenAI API key in the top bar and press **Enter** or **Save**
2. Pick a model (10 chat models supported)
3. Select a mode from the sidebar, edit parameters/prompts, click **Send**

API key is stored in `localStorage`. Session data (chat, MindScans, call history) uses IndexedDB.

## Notes

- OpenAI calls go through `/api/openai/chat` (thin proxy; key is not stored server-side)
- Token usage and estimated cost are shown per call and as a session total
- Use **Export session** / **Import session** to share test fixtures
