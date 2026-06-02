import { useState, useRef } from 'react'
import { Eye, EyeOff, ExternalLink, Check, CheckSquare, Square, Search } from 'lucide-react'
import Modal from '../common/Modal'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS } from '../../utils/providers'

const PROVIDER_IDS = Object.keys(PROVIDERS)

export default function AddModelModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('anthropic')

  return (
    <Modal open={open} onClose={onClose} title="Configure API Keys & Models" size="lg">
      <div style={{ display: 'flex', height: 560 }}>
        {/* Tab list */}
        <div
          style={{
            width:           180,
            flexShrink:      0,
            borderRight:     '1px solid var(--border-subtle)',
            padding:         '8px',
            display:         'flex',
            flexDirection:   'column',
            gap:             '2px',
            overflowY:       'auto',
          }}
        >
          {PROVIDER_IDS.map(id => {
            const p       = PROVIDERS[id]
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '10px',
                  padding:         '9px 12px',
                  borderRadius:    '8px',
                  fontSize:        '13px',
                  fontWeight:      500,
                  cursor:          'pointer',
                  border:          isActive ? '1px solid var(--color-primary-20)' : '1px solid transparent',
                  backgroundColor: isActive ? 'var(--color-primary-10)' : 'transparent',
                  color:           isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  transition:      'all 150ms',
                  textAlign:       'left',
                  width:           '100%',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span
                  style={{
                    width:           22,
                    height:          22,
                    borderRadius:    '6px',
                    backgroundColor: `${p.color}20`,
                    border:          `1px solid ${p.color}40`,
                    color:           p.color,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    fontSize:        '9px',
                    fontWeight:      700,
                    fontFamily:      'monospace',
                    flexShrink:      0,
                  }}
                >
                  {p.logo}
                </span>
                {p.name}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ProviderTab providerId={activeTab} key={activeTab} />
        </div>
      </div>
    </Modal>
  )
}

function ProviderTab({ providerId }) {
  const provider = PROVIDERS[providerId]
  const { providerKeys, setProviderKey, activeModels, addModel, removeModel, nvidiaProxyUrl, setNvidiaProxyUrl } = useAppStore()

  const [showKey,   setShowKey]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [search,    setSearch]    = useState('')
  const [localKey,  setLocalKey]  = useState(providerKeys[providerId] || '')
  const [proxyUrl,  setProxyUrl]  = useState(nvidiaProxyUrl || '')
  const [proxySaved, setProxySaved] = useState(false)

  const enabledModelIds = new Set(
    activeModels.filter(m => m.providerId === providerId).map(m => m.modelId)
  )

  const handleSaveKey = () => {
    setProviderKey(providerId, localKey)
    // Update key on all already-enabled models for this provider
    for (const modelId of enabledModelIds) {
      addModel({ id: `${providerId}:${modelId}`, providerId, modelId, apiKey: localKey })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleToggleModel = (modelId) => {
    const currentKey = providerKeys[providerId] || localKey
    if (enabledModelIds.has(modelId)) {
      removeModel(providerId, modelId)
    } else {
      addModel({ id: `${providerId}:${modelId}`, providerId, modelId, apiKey: currentKey })
    }
  }

  const handleEnableAll = () => {
    const currentKey = providerKeys[providerId] || localKey
    for (const model of provider.models) {
      if (!enabledModelIds.has(model.id)) {
        addModel({ id: `${providerId}:${model.id}`, providerId, modelId: model.id, apiKey: currentKey })
      }
    }
  }

  const handleDisableAll = () => {
    for (const model of provider.models) {
      removeModel(providerId, model.id)
    }
  }

  const filtered = provider.models.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = provider.models.filter(m => enabledModelIds.has(m.id)).length
  const hasSavedKey = !!(providerKeys[providerId])

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflowY: 'auto' }}>

      {/* Provider header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          backgroundColor: `${provider.color}20`, border: `2px solid ${provider.color}40`,
          color: provider.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          {provider.logo}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{provider.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {activeCount} of {provider.models.length} models active
          </div>
        </div>
        <a href={provider.keySignupUrl || provider.docsUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          Get API Key <ExternalLink size={12}/>
        </a>
      </div>

      {/* Ollama instructions */}
      {providerId === 'ollama' && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(68,168,179,0.08)', border: '1px solid rgba(68,168,179,0.2)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 600, color: '#44a8b3', marginBottom: 4 }}>Local setup</div>
          1. Install from <strong style={{ color: '#44a8b3' }}>ollama.com/download</strong><br/>
          2. <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>ollama pull llama3.2</code><br/>
          3. No API key needed — just enable models below
        </div>
      )}

      {/* Puter — no key needed */}
      {providerId === 'puter' && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', fontSize: 12, color: '#22d3ee', lineHeight: 1.7 }}>
          <strong style={{ fontSize: 13 }}>☁️ No API key needed — completely free!</strong><br/>
          Puter provides GPT-4o, Claude, Gemini, DeepSeek and 500+ models free via their cloud infrastructure.<br/>
          <span style={{ opacity: 0.7 }}>Just enable models below and start chatting. A Puter sign-in popup may appear on first use.</span>
        </div>
      )}

      {providerId === 'pollinations' && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)', fontSize: 12, color: '#f472b6', lineHeight: 1.7 }}>
          <strong style={{ fontSize: 13 }}>🌸 100% free image generation — no key, no sign-up!</strong><br/>
          Generate images instantly with FLUX, realism, anime and 3D styles.<br/>
          <span style={{ opacity: 0.7 }}>Just enable a model below, select it in chat, and type what you want to see.</span>
        </div>
      )}

      {/* Cloudflare Workers AI */}
      {providerId === 'cloudflare' && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(246,130,31,0.08)', border: '1px solid rgba(246,130,31,0.25)', fontSize: 12, color: '#fb923c', lineHeight: 1.7 }}>
          <strong>Free 10,000 neurons/day</strong> — no credit card needed.<br/>
          1. Sign up at <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>dash.cloudflare.com</a> (free account)<br/>
          2. Copy your <strong>Account ID</strong> from the dashboard<br/>
          3. Create an <strong>API Token</strong> with Workers AI permissions<br/>
          4. Paste as: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>accountId|apiToken</code>
        </div>
      )}

      {/* NVIDIA note + proxy setup */}
      {providerId === 'nvidia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(118,185,0,0.08)', border: '1px solid rgba(118,185,0,0.2)', fontSize: 12, color: '#9dcc4a' }}>
            Free trial at <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>build.nvidia.com</a> — no credit card needed. Key starts with <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>nvapi-</code>.
          </div>

          {/* Cloudflare Worker proxy section */}
          <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>🚀 Fix CORS — Deploy a free Cloudflare Worker proxy</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>
              NVIDIA blocks browser requests. A Cloudflare Worker (free, 100k req/day) fixes this in minutes:
              <br/>1. Go to <a href="https://workers.cloudflare.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8' }}>workers.cloudflare.com</a> → Create Account → Create Worker
              <br/>2. Paste the code from <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>cloudflare-worker/nvidia-proxy.js</code> in your NexusAI repo
              <br/>3. Click Deploy → copy the Worker URL (e.g. <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3 }}>https://nexusai-nvidia.yourname.workers.dev/v1</code>)
              <br/>4. Paste it below — all NVIDIA models will work instantly ✅
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={proxyUrl}
                onChange={e => setProxyUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setNvidiaProxyUrl(proxyUrl); setProxySaved(true); setTimeout(() => setProxySaved(false), 2500) }}}
                placeholder="https://nexusai-nvidia.yourname.workers.dev/v1"
                className="input-base"
                style={{ flex: 1, fontSize: 12 }}
              />
              <button
                onClick={() => { setNvidiaProxyUrl(proxyUrl); setProxySaved(true); setTimeout(() => setProxySaved(false), 2500) }}
                style={{
                  padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: proxySaved ? '#22c55e' : '#6366f1', color: '#fff', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5, transition: 'background 200ms',
                }}
              >
                {proxySaved ? <><Check size={13}/> Saved!</> : 'Save Proxy'}
              </button>
            </div>
            {nvidiaProxyUrl && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#22c55e' }}>
                ✅ Proxy active — NVIDIA models routed through your worker
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub Models instructions */}
      {providerId === 'github' && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(110,64,201,0.08)', border: '1px solid rgba(110,64,201,0.25)', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>🐙 Free — uses your existing GitHub account</div>
          GPT-4o, Phi-4, Llama 3.3 70B, Mistral Large, DeepSeek R1 — all free (150 req/day per model)<br/>
          1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>github.com/settings/tokens</a><br/>
          2. Generate new token (classic) → check <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3 }}>read:org</code> scope<br/>
          3. Copy the token and paste it below as your API key
        </div>
      )}

      {/* API Key — hidden for Ollama and Puter */}
      {!provider.local && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            API Key {hasSavedKey && <span style={{ color: '#4ade80', marginLeft: 6 }}>● Saved</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={e => setLocalKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                placeholder={provider.keyPlaceholder || `Paste ${provider.name} API key…`}
                className="input-base"
                style={{ paddingRight: 38, fontFamily: localKey && !showKey ? 'monospace' : undefined }}
                autoComplete="off"
                spellCheck={false}
              />
              <button onClick={() => setShowKey(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            <button
              onClick={handleSaveKey}
              disabled={!localKey}
              style={{
                padding: '0 18px', borderRadius: 10, border: 'none', cursor: localKey ? 'pointer' : 'not-allowed',
                background: saved ? '#22c55e' : 'var(--color-primary)',
                color: '#fff', fontWeight: 600, fontSize: 13, flexShrink: 0,
                transition: 'background 200ms', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {saved ? <><Check size={14}/> Saved!</> : 'Save Key'}
            </button>
          </div>
          {!hasSavedKey && localKey && (
            <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 6 }}>
              ⚠ Click <strong>Save Key</strong> then enable models below
            </div>
          )}
        </div>
      )}

      {/* Models list */}
      <div style={{ flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
            Models ({filtered.length})
          </div>
          <button onClick={handleEnableAll}
            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
            All on
          </button>
          <button onClick={handleDisableAll}
            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            All off
          </button>
        </div>

        {/* Search */}
        {provider.models.length > 6 && (
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter models…"
              className="input-base"
              style={{ paddingLeft: 28, fontSize: 12, height: 32 }}
            />
          </div>
        )}

        {/* Model rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {filtered.map(model => {
            const enabled = enabledModelIds.has(model.id)
            return (
              <button key={model.id} onClick={() => handleToggleModel(model.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  border: enabled ? `1px solid ${provider.color}35` : '1px solid var(--border-subtle)',
                  background: enabled ? `${provider.color}0c` : 'transparent',
                  transition: 'all 120ms', width: '100%',
                }}
                onMouseEnter={e => { if (!enabled) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!enabled) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ color: enabled ? provider.color : 'var(--text-muted)', flexShrink: 0 }}>
                  {enabled ? <CheckSquare size={15}/> : <Square size={15}/>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {model.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                    {model.contextWindow >= 1000000 ? `${model.contextWindow/1000000}M` : model.contextWindow >= 1000 ? `${model.contextWindow/1000}K` : model.contextWindow} ctx
                    {' · '}{model.category.join(' · ')}
                  </div>
                </div>
                {model.preloaded && <span className="badge-preloaded">Free</span>}
                {model.local    && <span className="badge-local">Local</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// kept for possible future use
async function testProviderConnection(providerId, apiKey) {
  void providerId; void apiKey
}
