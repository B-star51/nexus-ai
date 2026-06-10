# NexusAI Dashboard

> **Multi-model AI dashboard** — chat with 50+ models across every major provider, fully customizable, installable as a PWA.

**Live:** [https://b-star51.github.io/nexus-ai/](https://b-star51.github.io/nexus-ai/)

---


## What is NexusAI?

NexusAI is a single, polished web app that puts **50+ AI models from 15+ providers** behind one interface — OpenAI, Anthropic, Google, Groq, Cerebras, Mistral, NVIDIA, DeepSeek, Llama and more. Bring your own free API keys and switch between frontier models instantly, with no vendor lock-in and no backend storing your data.

But the reason it's more than "another chat wrapper" is what it lets models do **together**: vote on each other's answers, debate a topic at a roundtable, and search the live web — all from the browser.

**Built with:** React · Vite · Zustand · TailwindCSS · Framer Motion · IndexedDB · installable PWA · a Cloudflare Worker proxy and a Node email server for the parts the browser can't do alone.

---

## ✨ Flagship Features

| Feature | What it does |
|---|---|
| 🗳️ **Make Models Vote** | Ask several models the same question, then let a separate panel of models **vote on the best answer** — with full voter reasoning and a ranked winner. |
| 🧑‍🤝‍🧑 **Roundtable** | Pick 2–5 models, give them a topic, and watch them **debate each other** over multiple rounds. Jump into the conversation anytime. |
| 🌐 **Web Search** | Toggle on real-time web access for *any* model. Uses Jina when a free key is set, otherwise falls back to DuckDuckGo + Wikipedia — results are injected into the model's context. |
| 🤖 **Agent Customizer** | Reshape any model's behaviour: system prompt, temperature, top-p, max tokens, plus built-in preset roles (Coder, Researcher, Teacher…). |
| 📱 **Installable PWA** | Installs as a full offline app. All chats and settings live in your device's IndexedDB — nothing leaves your machine except your chosen provider's API call. |
| 🎨 **Theme Customizer** | 13 presets plus any custom hex colour. |

---

## Adding LLMs / Models

NexusAI supports two types of models: **Preloaded free models** (ready to use with just an API key) and **custom models** you add yourself.

---

### Method 1 — Preloaded Free Models

These are already built in. You just need a free API key from each provider.

Click **Add Model** (top-right button) → select the provider tab → paste your key → save.

| Provider | Free? | Get API Key | Notes |
|---|---|---|---|
| **OpenRouter** | ✅ Free tier | [openrouter.ai/keys](https://openrouter.ai/keys) | 10+ free models including DeepSeek R1, Llama 4, Qwen3 |
| **Groq** | ✅ Free | [console.groq.com/keys](https://console.groq.com/keys) | Fastest inference available |
| **Cerebras** | ✅ Free | [cloud.cerebras.ai](https://cloud.cerebras.ai/platform/) | Ultra-fast Llama 3.3 70B |
| **SambaNova** | ✅ Free | [cloud.sambanova.ai](https://cloud.sambanova.ai/apis) | Llama 405B, DeepSeek R1 |
| **GitHub Models** | ✅ Free | [github.com/settings/tokens](https://github.com/settings/tokens) | GPT-4o free with GitHub account |
| **Google AI Studio** | ✅ Free tier | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | Gemini 2.0 Flash, 1.5 Flash |
| **NVIDIA** | ✅ Free credits | [build.nvidia.com](https://build.nvidia.com/) | Llama 405B, DeepSeek R1, Nemotron |
| **Mistral** | ✅ Free tier | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys/) | Mistral 7B, Mixtral 8x7B |
| **HuggingFace** | ✅ Free | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Llama 3.2, Phi 3.5 |
| **Anthropic** | 💳 Paid | [console.anthropic.com](https://console.anthropic.com/settings/keys) | Claude Opus, Sonnet, Haiku |
| **OpenAI** | 💳 Paid | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | GPT-4o, DALL-E 3 |

---

### Method 1b — GitHub Models (Free GPT-4o, DeepSeek, Llama 4, Grok with your GitHub account)

GitHub Models gives you access to frontier AI models completely free using your existing GitHub account.

**Available free models** (as of 2026):

| Model | Notes |
|---|---|
| GPT-4o, GPT-4.1, o3-mini, o4-mini | OpenAI's best models |
| DeepSeek R1, R1-0528, V3 | Top reasoning & coding |
| Llama 4 Maverick 17B, Llama 4 Scout 17B | Meta's latest |
| Llama 3.3 70B, Llama 3.1 405B | Proven workhorses |
| Phi-4, Phi-4 Mini, Phi-4 Reasoning | Microsoft compact models |
| MAI-DS-R1 | Microsoft x DeepSeek collaboration |
| Mistral Small 3.1, Codestral, Ministral 3B | Efficient European models |
| Grok 3, Grok 3 Mini | xAI models |
| Cohere Command R+, Command A | RAG-optimised |
| AI21 Jamba 1.5 Large | 256K context |

**Setup (2 minutes):**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name (e.g. `NexusAI`) — no scopes needed, just scroll down and click **Generate token**
4. Copy the token (starts with `ghp_...`)
5. In NexusAI → **+ Add Model** → **GitHub Models** tab → paste token → **Save Key**
6. Enable the models you want → close the modal

> **Note:** Rate limits apply — typically 150 requests/day per model for free accounts. Sufficient for personal use.
> API endpoint used: `https://models.github.ai/inference`

---

### Method 2 — Ollama (Local Models, 100% Free & Private)

Run any open-source model locally on your own PC — no internet required after download, no API key, completely private.

**Step 1 — Install Ollama**
Download from [ollama.com/download](https://ollama.com/download) (Windows / Mac / Linux)

**Step 2 — Pull a model**

Open your terminal and run one of these:

```bash
# General chat
ollama pull llama3.2

# Coding
ollama pull codellama
ollama pull deepseek-coder

# Reasoning
ollama pull deepseek-r1

# Fast & lightweight
ollama pull phi4
ollama pull gemma3

# Large & powerful (needs 16GB+ RAM)
ollama pull llama3.1:70b
```

Browse all available models at [ollama.com/library](https://ollama.com/library)

**Step 3 — Connect in NexusAI**

In the **Add Model** modal → click the **Ollama** tab → the app connects to `http://localhost:11434` automatically. No API key needed. Enable the models you pulled.

> **Tip:** Ollama must be running in the background while you use NexusAI. It starts automatically after install on most systems.

---

### Method 3 — OpenRouter (Access 200+ Models With One Key)

OpenRouter is a single API that routes to almost every model from every provider — including many with a **free tier**.

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get your key at [openrouter.ai/keys](https://openrouter.ai/keys)
3. In NexusAI → **Add Model** → **OpenRouter** tab → paste key

**Free models available on OpenRouter** (no credits needed):

| Model | Good For |
|---|---|
| `deepseek/deepseek-r1:free` | Reasoning, math, code |
| `deepseek/deepseek-chat-v3-0324:free` | General chat, code |
| `meta-llama/llama-4-maverick:free` | Long context, analysis |
| `meta-llama/llama-3.3-70b-instruct:free` | General purpose |
| `qwen/qwen3-235b-a22b:free` | Multilingual, reasoning |
| `google/gemma-3-27b-it:free` | Fast chat |
| `microsoft/phi-4:free` | Code, reasoning |
| `mistralai/mistral-7b-instruct:free` | Fast, lightweight |

See the full list at [openrouter.ai/models?q=free](https://openrouter.ai/models?q=free)

---

### Method 4 — Any OpenAI-Compatible API

NexusAI uses the OpenAI chat completions format internally. Any API that is OpenAI-compatible can be added by editing `src/utils/providers.js` directly.

**Example — adding a custom provider:**

Open `src/utils/providers.js` and add a new entry to the `PROVIDERS` object:

```js
myProvider: {
  name: "My Provider",
  logo: "🔷",
  color: "#6366f1",
  baseUrl: "https://api.myprovider.com/v1",   // must support /chat/completions
  docsUrl: "https://myprovider.com/docs",
  keyPlaceholder: "key-...",
  keySignupUrl: "https://myprovider.com/signup",
  models: [
    {
      id: "my-model-id",
      name: "My Model Name",
      category: ["chat", "code"],   // chat | code | images | analysis | creative
      ctx: 32000,                   // context window in tokens
      free: true,
      preloaded: true,              // show in "Preloaded Free Models" section
    }
  ]
}
```

Then rebuild and redeploy:

```bash
npm run build
npm run deploy
```

---

### Method 5 — NVIDIA NIM (Free Credits)

NVIDIA hosts hundreds of open-source models with free credits on signup.

1. Create account at [build.nvidia.com](https://build.nvidia.com)
2. Browse models at [build.nvidia.com/models](https://build.nvidia.com/models)
3. Get your API key from the dashboard
4. In NexusAI → **Add Model** → **NVIDIA** tab → paste key

Notable models: Llama 3.1 405B, DeepSeek R1, Nemotron 340B, Mistral Large

---

## Make Models Vote

A unique NexusAI feature. Instead of asking one model, you ask many — and let them vote on the best answer.

1. In the chat input bar, click the **⚡ Vote** button
2. Type your question
3. Select your **Expert Panel** (2–8 models that generate answers)
4. Select your **Voter Panel** (remaining models that rank the answers)
5. Click **Start** — answers generate in parallel, then voters rank them
6. See the winning answer with vote counts and voter reasoning

Best used for: important decisions, code review, research, creative writing comparison.

---

## Roundtable — Models Chat With Each Other

Instead of one answer, host a **group discussion** between models.

1. In the chat input bar, click the **🧑‍🤝‍🧑 Roundtable** button
2. Enter a **discussion topic** (e.g. *"What's the best programming language for beginners and why?"*)
3. Choose **Rounds** (1–3) — how many times each model speaks
4. Select **2–5 participants**
5. Watch them respond to and challenge each other in turn — and **jump in yourself** whenever you want to steer the debate

Great for stress-testing ideas, comparing reasoning styles, and surfacing disagreements between models.

---

## Web Search

Give any model live internet access — no special "search" model required.

- Click the **🌐 Web Search** toggle in the chat input bar
- For each question, NexusAI runs a search and feeds the results into the model's context before it answers
- **With a free [Jina](https://jina.ai/) key** (added in Settings): real-time, full-text results
- **Without a key:** automatic fallback to DuckDuckGo Instant Answer + Wikipedia — still free, no signup

Useful for current events, documentation lookups, and grounding answers in real sources.

---

## Agent Customizer

Click the **Bot** icon (top-right header) to customize your AI's behavior:

| Setting | What it does |
|---|---|
| **Agent Name** | Changes the name shown in the chat welcome screen |
| **System Prompt** | Persistent instructions sent to every model before your messages |
| **Temperature** | 0 = precise/deterministic, 2 = creative/random |
| **Top-P** | Controls diversity of responses |
| **Max Tokens** | Maximum length of each response |

**Built-in preset roles:** Assistant · Coder · Researcher · Creative · Teacher · Analyst

---

## Theme Customizer

Click the **Palette** icon (top-right) to change colors:

`Anthropic Orange` · `Taylor Gold` · `Sky Blue` · `Purple` · `Electric Green` · `Sage Green` · `Forest Green` · `Khaki` · `Canvas` · `Turquoise` · `Grey` · `Black` · `Orange`

Or enter any custom hex color.

---

## PWA Installation

NexusAI installs as a full app — no browser UI, offline support, stores conversations locally.

**Android (Chrome):** Menu → Add to Home Screen

**iPhone (Safari):** Share → Add to Home Screen

**PC (Chrome/Edge):** Click ⊕ in address bar → Install

All conversations and settings are stored in your device's **IndexedDB** — nothing is sent to any server except your chosen AI provider API.

---

## Development

```bash
git clone https://github.com/B-star51/nexus-ai.git
cd nexus-ai
npm install
npm run dev        # localhost:5173
npm run build      # production build
npm run deploy     # build + push to GitHub Pages
```

**Stack:** React 18 · Vite · TailwindCSS · Zustand · Framer Motion · IndexedDB (idb) · PWA

---

### NVIDIA NIM CORS Proxy (Optional)

NVIDIA's API blocks direct browser requests. To use NVIDIA models, deploy the included Cloudflare Worker:

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) → Create Worker
2. Paste the code from `cloudflare-worker/nvidia-proxy.js`
3. Deploy → copy the Worker URL (e.g. `https://nexusai-nvidia.yourname.workers.dev`)
4. In NexusAI → **+ Add Model** → **NVIDIA** tab → paste URL + `/v1` → **Save Proxy**

---

## License

MIT — free to use, modify, and distribute.
