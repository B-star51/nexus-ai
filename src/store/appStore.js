import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COLOR_PRESETS } from '../utils/providers'

const DEFAULT_THEME = 'Anthropic Orange'

function applyThemeToDOM(presetName, customPrimary, customSecondary) {
  const preset = COLOR_PRESETS[presetName]
  const primary   = customPrimary   || (preset ? preset.primary   : COLOR_PRESETS[DEFAULT_THEME].primary)
  const secondary = customSecondary || (preset ? preset.secondary : COLOR_PRESETS[DEFAULT_THEME].secondary)
  const bg        = preset?.bg || '#0a0a0f'

  const root = document.documentElement
  root.style.setProperty('--color-primary', primary)
  root.style.setProperty('--color-secondary', secondary)
  root.style.setProperty('--color-bg', bg)
  root.style.backgroundColor = bg

  // Derive alpha variants from hex
  const r = parseInt(primary.slice(1,3), 16)
  const g = parseInt(primary.slice(3,5), 16)
  const b = parseInt(primary.slice(5,7), 16)
  root.style.setProperty('--color-primary-10', `rgba(${r},${g},${b},0.10)`)
  root.style.setProperty('--color-primary-20', `rgba(${r},${g},${b},0.20)`)
  root.style.setProperty('--color-primary-30', `rgba(${r},${g},${b},0.30)`)
  root.style.setProperty('--color-primary-50', `rgba(${r},${g},${b},0.50)`)
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Active Models ────────────────────────────────────────
      activeModels: [],

      addModel: (entry) => set((s) => ({
        activeModels: [...s.activeModels.filter(m => !(m.providerId === entry.providerId && m.modelId === entry.modelId)), entry],
      })),

      removeModel: (providerId, modelId) => set((s) => ({
        activeModels: s.activeModels.filter(m => !(m.providerId === providerId && m.modelId === modelId)),
      })),

      updateApiKey: (providerId, apiKey) => set((s) => ({
        activeModels: s.activeModels.map(m =>
          m.providerId === providerId ? { ...m, apiKey } : m
        ),
      })),

      getApiKey: (providerId) => {
        const found = get().activeModels.find(m => m.providerId === providerId)
        return found?.apiKey || null
      },

      // ─── Theme ───────────────────────────────────────────────
      themePreset:     DEFAULT_THEME,
      customPrimary:   null,
      customSecondary: null,
      bgColor:         '#0a0a0f',

      setTheme: (presetName, customPrimary = null, customSecondary = null) => {
        const preset = COLOR_PRESETS[presetName]
        const bg = preset?.bg || '#0a0a0f'
        applyThemeToDOM(presetName, customPrimary, customSecondary)
        set({ themePreset: presetName, customPrimary, customSecondary, bgColor: bg })
      },

      applyStoredTheme: () => {
        const { themePreset, customPrimary, customSecondary } = get()
        applyThemeToDOM(themePreset, customPrimary, customSecondary)
      },

      // ─── Navigation ──────────────────────────────────────────
      activePage:      'dashboard',
      setActivePage:   (page) => set({ activePage: page }),

      sidebarOpen:     true,
      setSidebarOpen:  (open) => set({ sidebarOpen: open }),
      toggleSidebar:   () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ─── Category filter ─────────────────────────────────────
      activeCategory:     'all',
      setActiveCategory:  (cat) => set({ activeCategory: cat }),

      // ─── Selected model for chat ─────────────────────────────
      selectedProviderId: null,
      selectedModelId:    null,
      selectModel: (providerId, modelId) => set({ selectedProviderId: providerId, selectedModelId: modelId }),

      // ─── UI flags ────────────────────────────────────────────
      showAddModelModal:    false,
      showThemeCustomizer:  false,
      showVotingModal:      false,
      showRoundtableModal:  false,

      openAddModelModal:    () => set({ showAddModelModal: true }),
      closeAddModelModal:   () => set({ showAddModelModal: false }),
      openThemeCustomizer:  () => set({ showThemeCustomizer: true }),
      closeThemeCustomizer: () => set({ showThemeCustomizer: false }),
      openVotingModal:      () => set({ showVotingModal: true }),
      closeVotingModal:     () => set({ showVotingModal: false }),
      openRoundtableModal:  () => set({ showRoundtableModal: true }),
      closeRoundtableModal: () => set({ showRoundtableModal: false }),

      // ─── API key status per provider ─────────────────────────
      keyStatus: {},
      setKeyStatus: (providerId, status) => set((s) => ({
        keyStatus: { ...s.keyStatus, [providerId]: status },
      })),

      // ─── Provider API keys (separate from activeModels) ──────
      providerKeys: {},
      setProviderKey: (providerId, key) => set((s) => ({
        providerKeys: { ...s.providerKeys, [providerId]: key },
      })),
      getProviderKey: (providerId) => get().providerKeys[providerId] || '',

      // ─── Agent settings ───────────────────────────────────────
      agentName:         'NexusAI',
      agentSystemPrompt: '',
      agentTemperature:  0.7,
      agentMaxTokens:    2048,
      agentTopP:         1.0,

      setAgentName:         (name)   => set({ agentName: name }),
      setAgentSystemPrompt: (prompt) => set({ agentSystemPrompt: prompt }),
      setAgentTemperature:  (temp)   => set({ agentTemperature: temp }),
      setAgentMaxTokens:    (tokens) => set({ agentMaxTokens: tokens }),
      setAgentTopP:         (topP)   => set({ agentTopP: topP }),

      // ─── Agent persona fields ─────────────────────────────────────
      agentUserName:         '',
      agentPersonality:      'friendly',
      agentTaskFocus:        'general',
      agentCommStyle:        'balanced',
      agentResponseLength:   'balanced',
      agentCustomTraits:     '',
      agentAvatar:           '🤖',

      setAgentUserName:        (v) => set({ agentUserName: v }),
      setAgentPersonality:     (v) => set({ agentPersonality: v }),
      setAgentTaskFocus:       (v) => set({ agentTaskFocus: v }),
      setAgentCommStyle:       (v) => set({ agentCommStyle: v }),
      setAgentResponseLength:  (v) => set({ agentResponseLength: v }),
      setAgentCustomTraits:    (v) => set({ agentCustomTraits: v }),
      setAgentAvatar:          (v) => set({ agentAvatar: v }),

      // ─── Proxy URLs ───────────────────────────────────────────────
      nvidiaProxyUrl: '',
      setNvidiaProxyUrl: (url) => set({ nvidiaProxyUrl: url }),

      // ─── Prompt Library ───────────────────────────────────────────
      savedPrompts: [],  // [{ id, title, text, createdAt }]
      addPrompt: (title, text) => set((s) => ({
        savedPrompts: [{ id: crypto.randomUUID(), title: title || text.slice(0, 40), text, createdAt: Date.now() }, ...s.savedPrompts],
      })),
      removePrompt: (id) => set((s) => ({ savedPrompts: s.savedPrompts.filter(p => p.id !== id) })),

      // ─── Web search (works for ALL models) ───────────────────────
      webSearchEnabled: false,
      toggleWebSearch: () => set((s) => ({ webSearchEnabled: !s.webSearchEnabled })),
      jinaApiKey: '',  // optional free key for full real-time search
      setJinaApiKey: (k) => set({ jinaApiKey: k }),

      // ─── Token usage tracking (per day) ──────────────────────────
      tokenUsage: {},        // { '2026-06-02': 12345 }
      dailyTokenCap: 0,      // 0 = unlimited
      setDailyTokenCap: (cap) => set({ dailyTokenCap: cap }),
      addTokenUsage: (count) => set((s) => {
        const day = new Date().toISOString().slice(0, 10)
        return { tokenUsage: { ...s.tokenUsage, [day]: (s.tokenUsage[day] || 0) + (count || 0) } }
      }),
      getTodayTokens: () => {
        const day = new Date().toISOString().slice(0, 10)
        return get().tokenUsage[day] || 0
      },
    }),
    {
      name: 'nexus-ai-app',
      partialize: (s) => ({
        activeModels:          s.activeModels,
        themePreset:           s.themePreset,
        customPrimary:         s.customPrimary,
        customSecondary:       s.customSecondary,
        bgColor:               s.bgColor,
        sidebarOpen:           s.sidebarOpen,
        selectedProviderId:    s.selectedProviderId,
        selectedModelId:       s.selectedModelId,
        providerKeys:          s.providerKeys,
        keyStatus:             s.keyStatus,
        agentName:             s.agentName,
        agentSystemPrompt:     s.agentSystemPrompt,
        agentTemperature:      s.agentTemperature,
        agentMaxTokens:        s.agentMaxTokens,
        agentTopP:             s.agentTopP,
        agentUserName:         s.agentUserName,
        agentPersonality:      s.agentPersonality,
        agentTaskFocus:        s.agentTaskFocus,
        agentCommStyle:        s.agentCommStyle,
        agentResponseLength:   s.agentResponseLength,
        agentCustomTraits:     s.agentCustomTraits,
        agentAvatar:           s.agentAvatar,
        nvidiaProxyUrl:        s.nvidiaProxyUrl,
        savedPrompts:          s.savedPrompts,
        tokenUsage:            s.tokenUsage,
        dailyTokenCap:         s.dailyTokenCap,
        webSearchEnabled:      s.webSearchEnabled,
        jinaApiKey:            s.jinaApiKey,
      }),
    }
  )
)
