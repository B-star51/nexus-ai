import { useState } from 'react'
import { Eye, EyeOff, ExternalLink, Check, X, Loader2, CheckSquare, Square } from 'lucide-react'
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
  const {
    providerKeys, setProviderKey,
    keyStatus, setKeyStatus,
    activeModels, addModel, removeModel,
  } = useAppStore()

  const [showKey, setShowKey]   = useState(false)
  const [testing, setTesting]   = useState(false)
  const [saved, setSaved]       = useState(false)

  const apiKey = providerKeys[providerId] || ''

  const enabledModelIds = new Set(
    activeModels.filter(m => m.providerId === providerId).map(m => m.modelId)
  )

  const handleToggleModel = (modelId) => {
    if (enabledModelIds.has(modelId)) {
      removeModel(providerId, modelId)
    } else {
      addModel({ id: `${providerId}:${modelId}`, providerId, modelId, apiKey })
    }
  }

  const handleSaveKey = () => {
    setProviderKey(providerId, apiKey)
    // Update all active models for this provider with new key
    for (const modelId of enabledModelIds) {
      addModel({ id: `${providerId}:${modelId}`, providerId, modelId, apiKey })
    }
    setSaved(true)
    setKeyStatus(providerId, 'untested')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestConnection = async () => {
    if (!apiKey) return
    setTesting(true)
    setKeyStatus(providerId, 'untested')
    try {
      await testProviderConnection(providerId, apiKey)
      setKeyStatus(providerId, 'ok')
    } catch {
      setKeyStatus(providerId, 'error')
    } finally {
      setTesting(false)
    }
  }

  const status = keyStatus[providerId]

  return (
    <div style={{ padding: '24px' }}>
      {/* Provider header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
        <div
          style={{
            width:           48,
            height:          48,
            borderRadius:    '12px',
            backgroundColor: `${provider.color}20`,
            border:          `2px solid ${provider.color}40`,
            color:           provider.color,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        '14px',
            fontWeight:      700,
            fontFamily:      'monospace',
            flexShrink:      0,
          }}
        >
          {provider.logo}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{provider.name}</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {provider.description}
          </p>
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        '4px',
              marginTop:  '6px',
              fontSize:   '12px',
              color:      'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            Get API Key <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Ollama local setup instructions */}
      {providerId === 'ollama' && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(68,168,179,0.08)',
          border: '1px solid rgba(68,168,179,0.2)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#44a8b3', marginBottom: 6 }}>
            Running Ollama locally
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            1. Download from <strong style={{ color: '#44a8b3' }}>ollama.com/download</strong><br/>
            2. Run: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>ollama pull llama3.2</code><br/>
            3. NexusAI connects to <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>http://localhost:11434</code> automatically<br/>
            4. No API key needed — just enable the models below
          </div>
        </div>
      )}

      {/* NVIDIA special note */}
      {providerId === 'nvidia' && (
        <div
          style={{
            padding:         '10px 14px',
            borderRadius:    '8px',
            backgroundColor: 'rgba(118, 185, 0, 0.08)',
            border:          '1px solid rgba(118, 185, 0, 0.2)',
            marginBottom:    '16px',
            fontSize:        '12px',
            color:           '#9dcc4a',
          }}
        >
          All NVIDIA NIM models have a <strong>free tier</strong> — get your API key at{' '}
          <a href="https://build.nvidia.com/explore/discover" target="_blank" rel="noopener noreferrer"
            style={{ color: '#76b900', textDecoration: 'underline' }}>
            build.nvidia.com
          </a>
        </div>
      )}

      {/* API Key input */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display:     'block',
            fontSize:    '12px',
            fontWeight:  600,
            color:       'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          API Key
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => { setProviderKey(providerId, e.target.value); setKeyStatus(providerId, 'untested') }}
              placeholder={`Enter your ${provider.name} API key...`}
              className="input-base"
              style={{ paddingRight: 40, fontFamily: apiKey && !showKey ? 'monospace' : undefined }}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowKey(s => !s)}
              style={{
                position:   'absolute',
                right:      10,
                top:        '50%',
                transform:  'translateY(-50%)',
                background: 'none',
                border:     'none',
                color:      'var(--text-muted)',
                cursor:     'pointer',
                padding:    2,
              }}
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            className="btn-secondary"
            onClick={handleTestConnection}
            disabled={!apiKey || testing}
            style={{ flexShrink: 0, fontSize: '12px' }}
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveKey}
            style={{ flexShrink: 0, fontSize: '12px' }}
          >
            {saved ? <Check size={14} /> : 'Save'}
          </button>
        </div>

        {/* Status indicator */}
        {status && (
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '6px',
              marginTop:  '8px',
              fontSize:   '12px',
              color:      status === 'ok' ? '#4ade80' : status === 'error' ? '#f87171' : 'var(--text-muted)',
            }}
          >
            {status === 'ok'      && <Check   size={13} />}
            {status === 'error'   && <X       size={13} />}
            {status === 'untested' && <span style={{ opacity: 0.6 }}>•</span>}
            {status === 'ok'       && 'Connection successful'}
            {status === 'error'    && 'Connection failed — check your key'}
            {status === 'untested' && 'Key saved, not tested yet'}
          </div>
        )}
      </div>

      {/* Model toggles */}
      <div>
        <p
          style={{
            margin:        '0 0 10px',
            fontSize:      '12px',
            fontWeight:    600,
            color:         'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Available Models
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {provider.models.map(model => {
            const enabled = enabledModelIds.has(model.id)
            return (
              <button
                key={model.id}
                onClick={() => handleToggleModel(model.id)}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '10px',
                  padding:         '10px 12px',
                  borderRadius:    '8px',
                  border:          enabled ? '1px solid var(--color-primary-20)' : '1px solid var(--border-subtle)',
                  backgroundColor: enabled ? 'var(--color-primary-10)' : 'transparent',
                  cursor:          'pointer',
                  textAlign:       'left',
                  transition:      'all 150ms',
                  width:           '100%',
                }}
                onMouseEnter={e => { if (!enabled) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (!enabled) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ color: enabled ? 'var(--color-primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                  {enabled ? <CheckSquare size={16} /> : <Square size={16} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: enabled ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                    {model.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {model.contextWindow > 0 && (
                      <span>{(model.contextWindow >= 1000000 ? `${model.contextWindow/1000000}M` : `${model.contextWindow/1000}K`)} context</span>
                    )}
                    <span>{model.category.join(' · ')}</span>
                  </div>
                </div>
                {model.free && <span className="badge-free">Free</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

async function testProviderConnection(providerId, apiKey) {
  const tests = {
    anthropic: async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    openai: async () => {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    google: async () => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    groq: async () => {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    mistral: async () => {
      const res = await fetch('https://api.mistral.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    // NVIDIA, SambaNova, Cerebras, GitHub, Together block browser CORS — validate format only
    nvidia: async () => {
      if (!apiKey.startsWith('nvapi-') || apiKey.length < 40)
        throw new Error('Invalid key — NVIDIA keys start with nvapi-')
    },
    sambanova: async () => {
      if (apiKey.length < 20)
        throw new Error('Key too short')
    },
    cerebras: async () => {
      if (!apiKey.startsWith('csk-') || apiKey.length < 20)
        throw new Error('Invalid key — Cerebras keys start with csk-')
    },
    github: async () => {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    together: async () => {
      if (apiKey.length < 20) throw new Error('Key too short')
    },
    openrouter: async () => {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    huggingface: async () => {
      const res = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
  }
  const fn = tests[providerId]
  if (fn) await fn()
}
