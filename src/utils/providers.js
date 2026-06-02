export const PROVIDERS = {
  anthropic: {
    name: "Anthropic",
    logo: "🔶",
    color: "#e86c28",
    baseUrl: "https://api.anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    keyPlaceholder: "sk-ant-...",
    keySignupUrl: "https://console.anthropic.com/settings/keys",
    description: "Claude — the most capable AI assistant for complex tasks.",
    models: [
      { id: "claude-opus-4-8", name: "Claude Opus 4.8", category: ["chat","code","analysis"], contextWindow: 200000, free: false },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", category: ["chat","code","analysis"], contextWindow: 200000, free: false },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", category: ["chat","code"], contextWindow: 200000, free: false },
    ]
  },
  openai: {
    name: "OpenAI",
    logo: "⚡",
    color: "#10a37f",
    baseUrl: "https://api.openai.com/v1",
    docsUrl: "https://platform.openai.com/docs",
    keyPlaceholder: "sk-...",
    keySignupUrl: "https://platform.openai.com/api-keys",
    description: "GPT and DALL-E models from OpenAI.",
    models: [
      { id: "gpt-4o", name: "GPT-4o", category: ["chat","code","analysis"], contextWindow: 128000, free: false },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", category: ["chat","code"], contextWindow: 128000, free: false },
      { id: "dall-e-3", name: "DALL-E 3", category: ["images"], contextWindow: 0, free: false },
    ]
  },
  google: {
    name: "Google",
    logo: "🌐",
    color: "#4285f4",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    docsUrl: "https://ai.google.dev/docs",
    keyPlaceholder: "AIza...",
    keySignupUrl: "https://aistudio.google.com/app/apikey",
    description: "Gemini models with massive context windows.",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", category: ["chat","code","analysis"], contextWindow: 1000000, free: true, preloaded: true },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", category: ["chat","code"], contextWindow: 1000000, free: true, preloaded: true },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", category: ["chat","code"], contextWindow: 1000000, free: true, preloaded: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", category: ["chat","code","analysis"], contextWindow: 2000000, free: false },
    ]
  },
  openrouter: {
    name: "OpenRouter",
    logo: "🔀",
    color: "#6366f1",
    baseUrl: "https://openrouter.ai/api/v1",
    docsUrl: "https://openrouter.ai/docs",
    keyPlaceholder: "sk-or-v1-...",
    keySignupUrl: "https://openrouter.ai/keys",
    description: "Access hundreds of models through a single API.",
    models: [
      { id: "deepseek/deepseek-r1:free",                         name: "DeepSeek R1",             category: ["chat","code","analysis"], contextWindow: 163840,  free: true, preloaded: true },
      { id: "deepseek/deepseek-chat-v3-0324:free",               name: "DeepSeek V3",             category: ["chat","code"],            contextWindow: 163840,  free: true, preloaded: true },
      { id: "meta-llama/llama-3.3-70b-instruct:free",            name: "Llama 3.3 70B",           category: ["chat","code"],            contextWindow: 131072,  free: true, preloaded: true },
      { id: "google/gemma-3-27b-it:free",                        name: "Gemma 3 27B",             category: ["chat","code"],            contextWindow: 131072,  free: true, preloaded: true },
      { id: "microsoft/phi-4:free",                              name: "Phi-4",                   category: ["chat","code"],            contextWindow: 131072,  free: true, preloaded: true },
      { id: "qwen/qwen3-235b-a22b:free",                         name: "Qwen3 235B",              category: ["chat","code","analysis"], contextWindow: 131072,  free: true, preloaded: true },
      { id: "mistralai/mistral-7b-instruct:free",                name: "Mistral 7B",              category: ["chat","code"],            contextWindow: 32768,   free: true, preloaded: true },
      { id: "nousresearch/hermes-3-llama-3.1-405b:free",         name: "Hermes 3 Llama 405B",     category: ["chat","code","analysis"], contextWindow: 131072,  free: true, preloaded: true },
      { id: "google/gemma-2-9b-it:free",                         name: "Gemma 2 9B",              category: ["chat"],                   contextWindow: 8192,    free: true, preloaded: true },
      { id: "openchat/openchat-7b:free",                         name: "OpenChat 7B",             category: ["chat"],                   contextWindow: 8192,    free: true, preloaded: true },
      { id: "meta-llama/llama-4-maverick:free",                  name: "Llama 4 Maverick",        category: ["chat","code","analysis"], contextWindow: 524288,  free: true, preloaded: true },
      { id: "anthropic/claude-3-haiku",                          name: "Claude 3 Haiku",          category: ["chat","code"],            contextWindow: 200000,  free: false },
    ]
  },
  groq: {
    name: "Groq",
    logo: "⚡",
    color: "#f55036",
    baseUrl: "https://api.groq.com/openai/v1",
    docsUrl: "https://console.groq.com/docs",
    keyPlaceholder: "gsk_...",
    keySignupUrl: "https://console.groq.com/keys",
    description: "Blazing-fast inference on open-source models.",
    models: [
      { id: "llama-3.3-70b-versatile",        name: "Llama 3.3 70B",       category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "llama-3.1-8b-instant",           name: "Llama 3.1 8B Instant", category: ["chat"],                  contextWindow: 128000, free: true, preloaded: true },
      { id: "mixtral-8x7b-32768",             name: "Mixtral 8x7B",         category: ["chat","code"],            contextWindow: 32768,  free: true, preloaded: true },
      { id: "gemma2-9b-it",                   name: "Gemma 2 9B",           category: ["chat"],                   contextWindow: 8192,   free: true, preloaded: true },
      { id: "llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout",        category: ["chat","code"],            contextWindow: 131072, free: true, preloaded: true },
    ]
  },
  cerebras: {
    name: "Cerebras",
    logo: "🧠",
    color: "#ff6b35",
    baseUrl: "https://api.cerebras.ai/v1",
    docsUrl: "https://inference-docs.cerebras.ai",
    keyPlaceholder: "csk-...",
    keySignupUrl: "https://cloud.cerebras.ai/platform/",
    description: "Ultra-fast inference on Cerebras hardware.",
    models: [
      { id: "llama3.1-8b",                    name: "Llama 3.1 8B",         category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "llama3.3-70b",                   name: "Llama 3.3 70B",        category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B",    category: ["chat","code"],            contextWindow: 131072, free: true, preloaded: true },
    ]
  },
  sambanova: {
    name: "SambaNova",
    logo: "🔥",
    color: "#e84040",
    baseUrl: "https://api.sambanova.ai/v1",
    docsUrl: "https://docs.sambanova.ai",
    keyPlaceholder: "sn-...",
    keySignupUrl: "https://cloud.sambanova.ai/apis",
    description: "High-performance inference on SambaNova hardware.",
    models: [
      { id: "Meta-Llama-3.1-405B-Instruct",   name: "Llama 3.1 405B",       category: ["chat","code","analysis"], contextWindow: 16384,  free: true, preloaded: true },
      { id: "Meta-Llama-3.3-70B-Instruct",    name: "Llama 3.3 70B",        category: ["chat","code"],            contextWindow: 131072, free: true, preloaded: true },
      { id: "DeepSeek-R1-Distill-Llama-70B",  name: "DeepSeek R1 Distill",  category: ["chat","code","analysis"], contextWindow: 16384,  free: true, preloaded: true },
      { id: "Qwen3-32B",                      name: "Qwen3 32B",            category: ["chat","code"],            contextWindow: 32768,  free: true, preloaded: true },
    ]
  },
  github: {
    name: "GitHub Models",
    logo: "🐙",
    color: "#6e40c9",
    baseUrl: "https://models.inference.ai.azure.com",
    docsUrl: "https://docs.github.com/en/github-models",
    keyPlaceholder: "ghp_... or github_pat_...",
    keySignupUrl: "https://github.com/settings/tokens",
    description: "Free AI models via GitHub's model marketplace.",
    models: [
      { id: "gpt-4o",                              name: "GPT-4o",              category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "gpt-4o-mini",                         name: "GPT-4o Mini",         category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "meta-llama-3.3-70b-instruct",         name: "Llama 3.3 70B",       category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "mistral-large-2411",                  name: "Mistral Large",        category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "phi-4",                               name: "Phi-4",               category: ["chat","code"],            contextWindow: 16384,  free: true, preloaded: true },
      { id: "AI21-Jamba-1.5-Large",                name: "Jamba 1.5 Large",     category: ["chat","analysis"],        contextWindow: 256000, free: true, preloaded: true },
    ]
  },
  nvidia: {
    name: "NVIDIA",
    logo: "🟢",
    color: "#76b900",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    docsUrl: "https://build.nvidia.com/models",
    keyPlaceholder: "nvapi-...",
    keySignupUrl: "https://build.nvidia.com/",
    description: "Free trial credits for 50+ hosted open-source models via NVIDIA NIM. Sign up at build.nvidia.com — no credit card required.",
    models: [
      // Meta Llama
      { id: "meta/llama-3.1-405b-instruct",              name: "Llama 3.1 405B Instruct",    category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "meta/llama-3.1-70b-instruct",               name: "Llama 3.1 70B Instruct",     category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "meta/llama-3.1-8b-instruct",                name: "Llama 3.1 8B Instruct",      category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "meta/llama-3.2-3b-instruct",                name: "Llama 3.2 3B Instruct",      category: ["chat"],                   contextWindow: 128000, free: true, preloaded: true },
      { id: "meta/llama-3.3-70b-instruct",               name: "Llama 3.3 70B Instruct",     category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "meta/llama-4-scout-17b-16e-instruct",       name: "Llama 4 Scout 17B",          category: ["chat","code"],            contextWindow: 131072, free: true, preloaded: true },
      { id: "meta/llama-4-maverick-17b-128e-instruct",   name: "Llama 4 Maverick 17B",       category: ["chat","code","analysis"], contextWindow: 524288, free: true, preloaded: true },
      // NVIDIA
      { id: "nvidia/nemotron-4-340b-instruct",           name: "Nemotron 340B Instruct",     category: ["chat","code","analysis"], contextWindow: 4096,   free: true, preloaded: true },
      { id: "nvidia/nemotron-mini-4b-instruct",          name: "Nemotron Mini 4B",           category: ["chat","code"],            contextWindow: 4096,   free: true, preloaded: true },
      { id: "nvidia/llama-3.1-nemotron-70b-instruct",    name: "Nemotron 70B Instruct",      category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "nvidia/llama-3.1-nemotron-nano-8b-v1",      name: "Nemotron Nano 8B",           category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      // DeepSeek
      { id: "deepseek-ai/deepseek-r1",                   name: "DeepSeek R1",                category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "deepseek-ai/deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B",    category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "deepseek-ai/deepseek-v3",                   name: "DeepSeek V3",                category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "deepseek-ai/deepseek-v3-0324",              name: "DeepSeek V3 0324",           category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      { id: "deepseek-ai/deepseek-v2.5",                 name: "DeepSeek V2.5",              category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      // Mistral / Mixtral
      { id: "mistralai/mixtral-8x7b-instruct-v0.1",      name: "Mixtral 8x7B",               category: ["chat","code"],            contextWindow: 32000,  free: true, preloaded: true },
      { id: "mistralai/mixtral-8x22b-instruct-v0.1",     name: "Mixtral 8x22B",              category: ["chat","code","analysis"], contextWindow: 65536,  free: true, preloaded: true },
      { id: "mistralai/mistral-7b-instruct-v0.3",        name: "Mistral 7B v0.3",            category: ["chat","code"],            contextWindow: 32000,  free: true, preloaded: true },
      { id: "mistralai/mistral-large-2-instruct",        name: "Mistral Large 2",            category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true },
      { id: "mistralai/codestral-22b-instruct-v0.1",     name: "Codestral 22B",              category: ["code"],                   contextWindow: 32000,  free: true, preloaded: true },
      // Qwen
      { id: "qwen/qwen2.5-72b-instruct",                 name: "Qwen 2.5 72B",               category: ["chat","code","analysis"], contextWindow: 32000,  free: true, preloaded: true },
      { id: "qwen/qwen2.5-coder-32b-instruct",           name: "Qwen 2.5 Coder 32B",         category: ["code"],                   contextWindow: 32000,  free: true, preloaded: true },
      { id: "qwen/qwen3-235b-a22b",                      name: "Qwen3 235B",                 category: ["chat","code","analysis"], contextWindow: 131072, free: true, preloaded: true },
      // Google
      { id: "google/gemma-3n-e2b-it",                     name: "Gemma 3n E2B",               category: ["chat","code"],            contextWindow: 8192,   free: true, preloaded: true },
      { id: "google/gemma-3-27b-it",                     name: "Gemma 3 27B",                category: ["chat","code"],            contextWindow: 131072, free: true, preloaded: true },
      { id: "google/gemma-3-12b-it",                     name: "Gemma 3 12B",                category: ["chat","code"],            contextWindow: 131072, free: true, preloaded: true },
      { id: "google/gemma-2-9b-it",                      name: "Gemma 2 9B",                 category: ["chat"],                   contextWindow: 8192,   free: true, preloaded: true },
      // Microsoft
      { id: "microsoft/phi-3-medium-4k-instruct",        name: "Phi-3 Medium 4K",            category: ["chat","code"],            contextWindow: 4096,   free: true, preloaded: true },
      { id: "microsoft/phi-3.5-moe-instruct",            name: "Phi-3.5 MoE",                category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true },
      // AI21 / Cohere / IBM
      { id: "ai21labs/jamba-1.5-large-instruct",         name: "Jamba 1.5 Large",            category: ["chat","analysis"],        contextWindow: 256000, free: true, preloaded: true },
      { id: "ibm/granite-34b-code-instruct",             name: "Granite 34B Code",           category: ["code"],                   contextWindow: 8192,   free: true, preloaded: true },
      { id: "ibm/granite-8b-code-instruct",              name: "Granite 8B Code",            category: ["code"],                   contextWindow: 4096,   free: true, preloaded: true },
    ]
  },
  mistral: {
    name: "Mistral",
    logo: "💫",
    color: "#ff7000",
    baseUrl: "https://api.mistral.ai/v1",
    docsUrl: "https://docs.mistral.ai",
    keyPlaceholder: "...",
    keySignupUrl: "https://console.mistral.ai/api-keys/",
    description: "Efficient European AI models.",
    models: [
      { id: "open-mistral-7b",        name: "Mistral 7B",     category: ["chat","code"],            contextWindow: 32000,  free: true,  preloaded: true },
      { id: "open-mixtral-8x7b",      name: "Mixtral 8x7B",   category: ["chat","code"],            contextWindow: 32000,  free: true,  preloaded: true },
      { id: "mistral-large-latest",   name: "Mistral Large",  category: ["chat","code","analysis"], contextWindow: 128000, free: false },
      { id: "mistral-small-latest",   name: "Mistral Small",  category: ["chat","code"],            contextWindow: 128000, free: false },
    ]
  },
  ollama: {
    name: "Ollama",
    logo: "🦙",
    color: "#44a8b3",
    baseUrl: "http://localhost:11434/v1",
    docsUrl: "https://ollama.com/library",
    keyPlaceholder: "ollama (no key needed)",
    keySignupUrl: "https://ollama.com/download",
    description: "Run open-source models locally on your own hardware.",
    local: true,
    models: [
      { id: "llama3.2:latest",      name: "Llama 3.2 (local)",   category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true, local: true },
      { id: "llama3.1:latest",      name: "Llama 3.1 (local)",   category: ["chat","code"],            contextWindow: 128000, free: true, preloaded: true, local: true },
      { id: "mistral:latest",       name: "Mistral (local)",     category: ["chat","code"],            contextWindow: 32000,  free: true, preloaded: true, local: true },
      { id: "deepseek-r1:latest",   name: "DeepSeek R1 (local)", category: ["chat","code","analysis"], contextWindow: 128000, free: true, preloaded: true, local: true },
      { id: "qwen2.5:latest",       name: "Qwen 2.5 (local)",    category: ["chat","code"],            contextWindow: 32000,  free: true, preloaded: true, local: true },
      { id: "phi4:latest",          name: "Phi-4 (local)",       category: ["chat","code"],            contextWindow: 16384,  free: true, preloaded: true, local: true },
      { id: "gemma3:latest",        name: "Gemma 3 (local)",     category: ["chat"],                   contextWindow: 128000, free: true, preloaded: true, local: true },
      { id: "codellama:latest",     name: "Code Llama (local)",  category: ["code"],                   contextWindow: 16384,  free: true, preloaded: true, local: true },
    ]
  },
  huggingface: {
    name: "HuggingFace",
    logo: "🤗",
    color: "#ffcc00",
    baseUrl: "https://api-inference.huggingface.co/v1",
    docsUrl: "https://huggingface.co/docs/api-inference",
    keyPlaceholder: "hf_...",
    keySignupUrl: "https://huggingface.co/settings/tokens",
    description: "Open-source model hub with free inference.",
    models: [
      { id: "meta-llama/Llama-3.2-3B-Instruct",  name: "Llama 3.2 3B",   category: ["chat"],        contextWindow: 128000, free: true, preloaded: true },
      { id: "microsoft/Phi-3.5-mini-instruct",   name: "Phi 3.5 Mini",   category: ["chat","code"], contextWindow: 128000, free: true, preloaded: true },
    ]
  },
  together: {
    name: "Together AI",
    logo: "🔗",
    color: "#8b5cf6",
    baseUrl: "https://api.together.xyz/v1",
    docsUrl: "https://docs.together.ai",
    keyPlaceholder: "...",
    keySignupUrl: "https://api.together.ai/settings/api-keys",
    description: "Run fine-tuned and open-source models at scale.",
    models: [
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", name: "Llama 3.1 70B Turbo", category: ["chat","code"], contextWindow: 128000, free: false },
      { id: "mistralai/Mixtral-8x22B-Instruct-v0.1",        name: "Mixtral 8x22B",        category: ["chat","code"], contextWindow: 65000,  free: false },
    ]
  },
}

export const CATEGORIES = [
  { id: "all",      label: "All",      icon: "Grid3X3"       },
  { id: "chat",     label: "Chat",     icon: "MessageSquare" },
  { id: "code",     label: "Code",     icon: "Code2"         },
  { id: "images",   label: "Images",   icon: "Image"         },
  { id: "analysis", label: "Analysis", icon: "BarChart3"     },
  { id: "creative", label: "Creative", icon: "Sparkles"      },
]

export const COLOR_PRESETS = {
  "Anthropic Orange": { primary: "#e86c28", secondary: "#f5a76c", bg: "#0a0a0f" },
  "Taylor Gold":      { primary: "#c9a96e", secondary: "#e2c99a", bg: "#1a1d2e" },
  "Sky Blue":         { primary: "#38bdf8", secondary: "#7dd3fc", bg: "#0a0a0f" },
  "Purple":           { primary: "#a855f7", secondary: "#c084fc", bg: "#0a0a0f" },
  "Electric Green":   { primary: "#22c55e", secondary: "#4ade80", bg: "#0a0a0f" },
  "Sage Green":       { primary: "#84cc16", secondary: "#a3e635", bg: "#0a0a0f" },
  "Forest Green":     { primary: "#15803d", secondary: "#16a34a", bg: "#0d0f0e" },
  "Khaki":            { primary: "#a3a063", secondary: "#c4bc8a", bg: "#0a0a0f" },
  "Canvas":           { primary: "#d4c5a9", secondary: "#e8dcc8", bg: "#0a0a0f" },
  "Turquoise":        { primary: "#14b8a6", secondary: "#2dd4bf", bg: "#0a0a0f" },
  "Grey":             { primary: "#6b7280", secondary: "#9ca3af", bg: "#0a0a0f" },
  "Black":            { primary: "#e2e8f0", secondary: "#cbd5e1", bg: "#000000" },
  "Orange":           { primary: "#f97316", secondary: "#fb923c", bg: "#0a0a0f" },
}

export function getAllModels() {
  const all = []
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    for (const model of provider.models) {
      all.push({ ...model, providerId, providerName: provider.name, providerColor: provider.color, providerLogo: provider.logo })
    }
  }
  return all
}

export function formatContextWindow(n) {
  if (!n) return null
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ctx`
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}K ctx`
  return `${n} ctx`
}
