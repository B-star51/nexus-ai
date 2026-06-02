import { create } from 'zustand'
import { nanoid } from '../utils/nanoid'
import {
  getAllConversations,
  getMessages,
  saveConversation,
  saveMessage,
  deleteConversation as dbDeleteConversation,
} from '../utils/db'
import { useAppStore } from './appStore'
import { PROVIDERS } from '../utils/providers'
import { buildSystemPrompt } from '../utils/buildSystemPrompt'

export const useChatStore = create((set, get) => ({
  // ─── Conversation list ────────────────────────────────────────
  conversations: [],
  loadingConversations: false,

  loadConversations: async () => {
    set({ loadingConversations: true })
    try {
      const convs = await getAllConversations()
      set({ conversations: convs })
    } finally {
      set({ loadingConversations: false })
    }
  },

  // ─── Active conversation ──────────────────────────────────────
  activeConversationId: null,
  messages: [],
  loadingMessages: false,

  selectConversation: async (id) => {
    set({ activeConversationId: id, loadingMessages: true, messages: [] })
    try {
      const msgs = await getMessages(id)
      set({ messages: msgs })
    } finally {
      set({ loadingMessages: false })
    }
  },

  newConversation: async (title = 'New conversation') => {
    const id = nanoid()
    const conv = {
      id,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      providerId: null,
      modelId: null,
    }
    await saveConversation(conv)
    set((s) => ({ conversations: [conv, ...s.conversations], activeConversationId: id, messages: [] }))
    return id
  },

  deleteConversation: async (id) => {
    await dbDeleteConversation(id)
    set((s) => {
      const convs = s.conversations.filter(c => c.id !== id)
      const activeId = s.activeConversationId === id ? (convs[0]?.id || null) : s.activeConversationId
      return { conversations: convs, activeConversationId: activeId }
    })
  },

  // ─── Sending messages ─────────────────────────────────────────
  sending: false,

  sendMessage: async ({ content, providerId, modelId, apiKey, providerName, modelName }) => {
    const { activeConversationId, newConversation } = get()
    let convId = activeConversationId

    if (!convId) {
      convId = await newConversation(content.slice(0, 60) || 'New conversation')
    }

    const userMsg = {
      id: nanoid(),
      conversationId: convId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    await saveMessage(userMsg)
    set((s) => ({ messages: [...s.messages, userMsg], sending: true }))

    // Update conversation metadata
    const conv = get().conversations.find(c => c.id === convId)
    if (conv) {
      const updated = {
        ...conv,
        title: conv.messageCount === 0 ? (content.slice(0, 60) || conv.title) : conv.title,
        messageCount: (conv.messageCount || 0) + 1,
        providerId,
        modelId,
        updatedAt: new Date().toISOString(),
      }
      await saveConversation(updated)
      set((s) => ({ conversations: s.conversations.map(c => c.id === convId ? updated : c) }))
    }

    // Placeholder assistant message
    const assistantMsg = {
      id: nanoid(),
      conversationId: convId,
      role: 'assistant',
      content: '',
      providerId,
      modelId,
      providerName,
      modelName,
      createdAt: new Date().toISOString(),
      streaming: true,
    }
    set((s) => ({ messages: [...s.messages, assistantMsg] }))

    try {
      const allMessages = get().messages.filter(m => !m.streaming).concat(userMsg)
      const responseText = await callProviderAPI({ providerId, modelId, apiKey, messages: allMessages })
      const finalMsg = { ...assistantMsg, content: responseText, streaming: false }
      await saveMessage(finalMsg)
      set((s) => ({
        messages: s.messages.map(m => m.id === assistantMsg.id ? finalMsg : m),
        sending: false,
      }))
    } catch (err) {
      const rawMsg = err.message || 'Failed to get response.'
      const isNetworkError = rawMsg.toLowerCase().includes('failed to fetch') ||
                             rawMsg.toLowerCase().includes('networkerror') ||
                             rawMsg.toLowerCase().includes('load failed')
      let displayMsg = rawMsg
      if (isNetworkError) {
        displayMsg = `**Network error reaching ${PROVIDERS[providerId]?.name || providerId}.**\n\n` +
          `Possible causes:\n` +
          `• The model **${modelId}** may not be available as a hosted endpoint yet\n` +
          `• Check your API key is saved correctly (+ Add Model → Save Key)\n` +
          `• Try a different model from the same provider\n` +
          `• Check your internet connection`
      }
      const errMsg = {
        ...assistantMsg,
        content: `${displayMsg}`,
        streaming: false,
        error: true,
      }
      await saveMessage(errMsg)
      set((s) => ({
        messages: s.messages.map(m => m.id === assistantMsg.id ? errMsg : m),
        sending: false,
      }))
    }
  },

  clearMessages: () => set({ messages: [], activeConversationId: null }),
}))

// ─── Provider API Caller ──────────────────────────────────────────
async function callProviderAPI({ providerId, modelId, apiKey, messages }) {
  // Pull agent settings from appStore
  const { agentName, agentUserName, agentPersonality, agentTaskFocus, agentCommStyle, agentResponseLength, agentCustomTraits, agentSystemPrompt, agentTemperature, agentMaxTokens, agentTopP, nvidiaProxyUrl } = useAppStore.getState()

  const provider = PROVIDERS[providerId]

  // Build message history (user + assistant only)
  const userMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }))

  // Check if this is an image generation model
  const isImageModel = provider?.models?.find(m => m.id === modelId)?.category?.includes('images')
  if (isImageModel) {
    return await callImageAPI({ providerId, modelId, apiKey, prompt: userMessages[userMessages.length - 1]?.content || '' })
  }

  // Build compiled system prompt from persona settings
  const compiledPrompt = buildSystemPrompt({ agentName, agentUserName, agentPersonality, agentTaskFocus, agentCommStyle, agentResponseLength, agentCustomTraits, agentSystemPrompt })

  // Prepend system prompt if set
  const history = compiledPrompt
    ? [{ role: 'system', content: compiledPrompt }, ...userMessages]
    : userMessages

  if (!apiKey && !provider?.local) {
    // Demo mode
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    return getDemoResponse(messages[messages.length - 1]?.content || '')
  }

  switch (providerId) {
    case 'anthropic': {
      // Anthropic uses system as a top-level field, not in messages array
      const anthropicMessages = history.filter(m => m.role !== 'system')
      const systemContent     = history.find(m => m.role === 'system')?.content || ''

      const body = {
        model:      modelId,
        max_tokens: agentMaxTokens || 4096,
        messages:   anthropicMessages,
      }
      if (systemContent) body.system = systemContent

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }
      const data = await res.json()
      return data.content?.[0]?.text || ''
    }

    case 'google': {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`
      const geminiMessages = userMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      const body = { contents: geminiMessages }
      if (compiledPrompt) {
        body.systemInstruction = { parts: [{ text: compiledPrompt }] }
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    case 'huggingface': {
      const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:       modelId,
          messages:    history,
          max_tokens:  agentMaxTokens || 2048,
          temperature: agentTemperature,
          top_p:       agentTopP,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    case 'ollama': {
      // Local Ollama — no API key, no auth header
      const baseUrl = provider?.baseUrl || 'http://localhost:11434/v1'
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:       modelId,
          messages:    history,
          stream:      false,
          temperature: agentTemperature,
          top_p:       agentTopP,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Ollama error ${res.status} — is Ollama running?`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    // OpenAI-compatible providers (standard /chat/completions)
    case 'openai':
    case 'groq':
    case 'together':
    case 'nvidia':
    case 'mistral':
    case 'openrouter':
    case 'cerebras':
    case 'sambanova':
    case 'github':
    case 'hyperbolic':
    case 'perplexity': {
      const baseUrls = {
        openai:     'https://api.openai.com/v1',
        groq:       'https://api.groq.com/openai/v1',
        together:   'https://api.together.xyz/v1',
        nvidia:     nvidiaProxyUrl ? nvidiaProxyUrl.replace(/\/$/, '') : 'https://integrate.api.nvidia.com/v1',
        mistral:    'https://api.mistral.ai/v1',
        openrouter: 'https://openrouter.ai/api/v1',
        cerebras:   'https://api.cerebras.ai/v1',
        sambanova:  'https://api.sambanova.ai/v1',
        github:     'https://models.github.ai/inference',
        hyperbolic: 'https://api.hyperbolic.xyz/v1',
        perplexity: 'https://api.perplexity.ai',
      }
      const url = `${baseUrls[providerId]}/chat/completions`
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      }
      // OpenRouter requires these headers
      if (providerId === 'openrouter') {
        headers['HTTP-Referer'] = 'https://nexusai.app'
        headers['X-Title'] = 'NexusAI'
      }
      const body = {
        model:       modelId,
        messages:    history,
        max_tokens:  agentMaxTokens || 4096,
        temperature: agentTemperature,
        top_p:       agentTopP,
        stream:      false,
      }
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    case 'puter': {
      // Puter.js — load SDK dynamically, no API key needed
      if (!window.puter) {
        await new Promise((resolve, reject) => {
          if (document.querySelector('script[src*="js.puter.com"]')) {
            const check = setInterval(() => { if (window.puter) { clearInterval(check); resolve() } }, 100)
            return
          }
          const script = document.createElement('script')
          script.src = 'https://js.puter.com/v2/'
          script.onload = () => {
            const check = setInterval(() => { if (window.puter) { clearInterval(check); resolve() } }, 100)
          }
          script.onerror = () => reject(new Error('Failed to load Puter.js'))
          document.head.appendChild(script)
        })
      }
      const lastMsg   = history[history.length - 1]?.content || ''
      const response  = await window.puter.ai.chat(history.length > 1 ? history : lastMsg, {
        model:       modelId,
        temperature: agentTemperature,
      })
      return typeof response === 'string' ? response : response?.message?.content || response?.content || String(response)
    }

    case 'cloudflare': {
      // Cloudflare Workers AI — key format: "accountId|apiToken"
      const [accountId, cfToken] = (apiKey || '').split('|')
      if (!accountId || !cfToken) throw new Error('Cloudflare key format: paste as accountId|apiToken')
      const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`
      const res = await fetch(cfUrl, {
        method:  'POST',
        headers: { Authorization: `Bearer ${cfToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId, messages: history, max_tokens: agentMaxTokens || 4096 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.errors?.[0]?.message || `Cloudflare API error ${res.status}`)
      }
      const data = await res.json()
      return data.result?.response || data.choices?.[0]?.message?.content || ''
    }

    case 'fal': {
      const res = await fetch(`https://fal.run/${modelId}`, {
        method: 'POST',
        headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: history[history.length - 1]?.content || '', image_size: 'square_hd', num_images: 1 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || `Fal.ai error ${res.status}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    default:
      throw new Error(`Provider "${providerId}" not yet supported.`)
  }
}

async function callImageAPI({ providerId, modelId, apiKey, prompt }) {
  if (providerId === 'huggingface') {
    const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `HuggingFace image error ${res.status}`)
    }
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    return `__IMAGE__${url}__END_IMAGE__`
  }

  if (providerId === 'together') {
    const res = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, prompt, n: 1, width: 1024, height: 1024 }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Together image error ${res.status}`)
    }
    const data = await res.json()
    const imgUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json
    if (!imgUrl) throw new Error('No image returned')
    if (imgUrl.startsWith('http')) return `__IMAGE__${imgUrl}__END_IMAGE__`
    return `__IMAGE__data:image/png;base64,${imgUrl}__END_IMAGE__`
  }

  if (providerId === 'openai') {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, prompt, n: 1, size: '1024x1024' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `OpenAI image error ${res.status}`)
    }
    const data = await res.json()
    const imgUrl = data.data?.[0]?.url
    if (!imgUrl) throw new Error('No image returned')
    return `__IMAGE__${imgUrl}__END_IMAGE__`
  }

  if (providerId === 'fal') {
    const res = await fetch(`https://fal.run/${modelId}`, {
      method: 'POST',
      headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, image_size: 'square_hd', num_images: 1 }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.detail || `Fal.ai error ${res.status}`)
    }
    const data = await res.json()
    const imgUrl = data.images?.[0]?.url
    if (!imgUrl) throw new Error('No image returned')
    return `__IMAGE__${imgUrl}__END_IMAGE__`
  }

  throw new Error(`Image generation not supported for ${providerId}`)
}

function getDemoResponse(userMsg) {
  const lower = userMsg.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I'm running in demo mode since no API key is configured. Add your API keys in Settings to get real responses from AI models. How can I help you today?"
  }
  if (lower.includes('code') || lower.includes('function') || lower.includes('program')) {
    return "```javascript\n// Demo response — add your API key for real code generation\nfunction example() {\n  return 'Configure your API key in Settings!';\n}\n```\n\nThis is a demo response. Head to **Settings** to add your provider keys."
  }
  return `**Demo Mode** — No API key configured.\n\nYou asked: *"${userMsg.slice(0, 100)}${userMsg.length > 100 ? '...' : ''}"*\n\nTo get real AI responses, add your API key for any provider. Many providers like Google (Gemini), Groq, and NVIDIA offer free tiers!`
}
