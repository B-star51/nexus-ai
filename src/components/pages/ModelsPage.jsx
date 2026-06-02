import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Zap, ExternalLink, Grid3X3, MessageSquare, Code2, Image, BarChart3, Sparkles, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS, CATEGORIES, formatContextWindow } from '../../utils/providers'

const ICON_MAP = { Grid3X3, MessageSquare, Code2, Image, BarChart3, Sparkles }

export default function ModelsPage() {
  const {
    activeCategory,
    activeModels, addModel, removeModel,
    providerKeys,
    openAddModelModal,
  } = useAppStore()

  const [activeOpen, setActiveOpen] = useState(true)
  const [confirmRemove, setConfirmRemove] = useState(null)

  const handleRemove = (providerId, modelId) => {
    const key = `${providerId}:${modelId}`
    if (confirmRemove === key) {
      removeModel(providerId, modelId)
      setConfirmRemove(null)
    } else {
      setConfirmRemove(key)
      setTimeout(() => setConfirmRemove(null), 3000)
    }
  }

  const allProviderModels = []
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    for (const model of provider.models) {
      if (activeCategory === 'all' || model.category.includes(activeCategory)) {
        allProviderModels.push({ providerId, provider, model })
      }
    }
  }

  const isEnabled = (providerId, modelId) =>
    activeModels.some(m => m.providerId === providerId && m.modelId === modelId)

  const handleToggle = (providerId, modelId) => {
    if (isEnabled(providerId, modelId)) {
      removeModel(providerId, modelId)
    } else {
      addModel({
        id:       `${providerId}:${modelId}`,
        providerId,
        modelId,
        apiKey:   providerKeys[providerId] || '',
      })
    }
  }

  // Group by provider
  const grouped = {}
  for (const item of allProviderModels) {
    if (!grouped[item.providerId]) {
      grouped[item.providerId] = { provider: item.provider, models: [] }
    }
    grouped[item.providerId].models.push(item.model)
  }

  // Split providers into free-preloaded vs paid groups
  const freeProviders = []
  const paidProviders = []

  for (const [providerId, { provider, models }] of Object.entries(grouped)) {
    const hasFreeModels = models.some(m => m.preloaded === true || m.local === true)
    if (hasFreeModels) {
      freeProviders.push([providerId, { provider, models }])
    } else {
      paidProviders.push([providerId, { provider, models }])
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Models</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {activeModels.length} model{activeModels.length !== 1 ? 's' : ''} active across {Object.keys(PROVIDERS).length} providers
          </p>
        </div>
        <button className="btn-primary" onClick={openAddModelModal}>
          <Plus size={15} /> Configure API Keys
        </button>
      </div>

      {/* ── Active Models panel ── */}
      {activeModels.length > 0 && (
        <div style={{
          marginBottom: 28, borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setActiveOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-primary)',
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'var(--color-primary-20)', border: '1px solid var(--color-primary-30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={13} color="var(--color-primary)" strokeWidth={3}/>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Active Models</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
              background: 'var(--color-primary-20)', color: 'var(--color-primary)',
            }}>{activeModels.length}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
              {activeOpen ? 'hide' : 'show'}
            </span>
            {activeOpen ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }}/> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }}/>}
          </button>

          <AnimatePresence>
            {activeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                  padding: '4px 16px 14px',
                }}>
                  {activeModels.map(entry => {
                    const provider = PROVIDERS[entry.providerId]
                    const model    = provider?.models.find(m => m.id === entry.modelId)
                    if (!model) return null
                    const key      = `${entry.providerId}:${entry.modelId}`
                    const isConfirm = confirmRemove === key
                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px 5px 8px', borderRadius: 8,
                        background: isConfirm ? '#ef444412' : `${provider.color}10`,
                        border: isConfirm ? '1px solid #ef444440' : `1px solid ${provider.color}25`,
                        transition: 'all 150ms',
                      }}>
                        <span style={{ fontSize: 12 }}>{provider.logo}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {model.name}
                        </span>
                        <button
                          onClick={() => handleRemove(entry.providerId, entry.modelId)}
                          title={isConfirm ? 'Click again to remove' : 'Remove model'}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            border: 'none', background: 'none',
                            cursor: 'pointer', padding: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isConfirm ? '#ef4444' : 'rgba(255,255,255,0.3)',
                            transition: 'color 150ms',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => { if (!isConfirm) e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                        >
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Grid3X3 size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 500 }}>No models in this category</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Try switching to "All" or add models from a provider</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Free / Preloaded section */}
          {freeProviders.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Preloaded Free Models
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(34,197,94,0.2)' }} />
                <span style={{ fontSize: 11, color: 'rgba(34,197,94,0.7)' }}>No API key needed for many</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {freeProviders.map(([providerId, { provider, models }]) => (
                  <ProviderSection
                    key={providerId}
                    providerId={providerId}
                    provider={provider}
                    models={models}
                    activeModels={activeModels}
                    providerKeys={providerKeys}
                    isEnabled={isEnabled}
                    handleToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Paid / API key required section */}
          {paidProviders.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Paid / API Key Required
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(251,191,36,0.2)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {paidProviders.map(([providerId, { provider, models }]) => (
                  <ProviderSection
                    key={providerId}
                    providerId={providerId}
                    provider={provider}
                    models={models}
                    activeModels={activeModels}
                    providerKeys={providerKeys}
                    isEnabled={isEnabled}
                    handleToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function ProviderSection({ providerId, provider, models, activeModels, providerKeys, isEnabled, handleToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Provider header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '9px',
          backgroundColor: `${provider.color}18`,
          border: `1px solid ${provider.color}30`,
          color: provider.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0,
        }}>
          {provider.logo}
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>{provider.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {activeModels.filter(m => m.providerId === providerId).length} / {models.length} active
            {provider.local && <span style={{ marginLeft: 6, color: '#44a8b3' }}>• Local</span>}
          </div>
        </div>
        <a
          href={provider.keySignupUrl || provider.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{ marginLeft: 'auto', fontSize: '12px', padding: '5px 10px' }}
        >
          <ExternalLink size={13} /> {provider.local ? 'Download' : 'Get API Key'}
        </a>
      </div>

      {/* Models grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
        {models.map(model => {
          const enabled = isEnabled(providerId, model.id)
          const hasKey  = !!providerKeys[providerId] || provider.local
          return (
            <motion.button
              key={model.id}
              whileHover={{ y: -1 }}
              onClick={() => handleToggle(providerId, model.id)}
              style={{
                display:         'flex',
                alignItems:      'flex-start',
                gap:             '12px',
                padding:         '14px',
                borderRadius:    '10px',
                border:          enabled ? `1px solid ${provider.color}30` : '1px solid var(--border-subtle)',
                backgroundColor: enabled ? `${provider.color}08` : 'var(--bg-surface)',
                cursor:          'pointer',
                textAlign:       'left',
                transition:      'all 150ms',
                width:           '100%',
              }}
            >
              {/* Toggle checkbox */}
              <div style={{
                width: 20, height: 20, borderRadius: '5px',
                border:          enabled ? `2px solid ${provider.color}` : '2px solid var(--border)',
                backgroundColor: enabled ? provider.color : 'transparent',
                display:         'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink:      0, marginTop: 1, transition: 'all 150ms',
              }}>
                {enabled && <Check size={12} color="#fff" strokeWidth={3} />}
              </div>

              {/* Model info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {model.name}
                  </span>
                  {model.free && <span className="badge-free">Free</span>}
                  {model.preloaded && <span className="badge-preloaded">Preloaded</span>}
                  {model.local && <span className="badge-local">Local</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                  {model.category.map(cat => (
                    <span key={cat} className="tag">{cat}</span>
                  ))}
                </div>
                {model.contextWindow > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                    {formatContextWindow(model.contextWindow)}
                  </div>
                )}
                {!hasKey && !provider.local && (
                  <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={10} /> API key needed
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
