import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check, Zap, Cpu } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS, formatContextWindow } from '../../utils/providers'

export default function ModelSelector({ compact = false, onChange }) {
  const { activeModels, selectedProviderId, selectedModelId, selectModel } = useAppStore()
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const currentProvider = PROVIDERS[selectedProviderId]
  const currentModel    = currentProvider?.models.find(m => m.id === selectedModelId)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Group active models by provider, filtered by search
  const grouped = {}
  for (const entry of activeModels) {
    const provider = PROVIDERS[entry.providerId]
    if (!provider) continue
    const model = provider.models.find(m => m.id === entry.modelId)
    if (!model) continue
    if (search) {
      const q = search.toLowerCase()
      if (!model.name.toLowerCase().includes(q) && !provider.name.toLowerCase().includes(q)) continue
    }
    if (!grouped[entry.providerId]) grouped[entry.providerId] = { provider, models: [] }
    grouped[entry.providerId].models.push({ ...model, entry })
  }

  const hasModels   = Object.keys(grouped).length > 0
  const totalModels = activeModels.length

  const handleSelect = (providerId, modelId) => {
    selectModel(providerId, modelId)
    onChange?.({ providerId, modelId })
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:         'flex',
          alignItems:      'center',
          gap:             8,
          padding:         compact ? '6px 12px' : '8px 14px',
          borderRadius:    10,
          border:          open ? '1px solid var(--color-primary)' : '1px solid var(--border)',
          backgroundColor: open ? 'var(--color-primary-10)' : 'var(--bg-elevated)',
          color:           'var(--text-primary)',
          fontSize:        13,
          fontWeight:      500,
          cursor:          'pointer',
          transition:      'all 150ms',
          minWidth:        compact ? 160 : 200,
          maxWidth:        300,
          whiteSpace:      'nowrap',
        }}
      >
        {currentProvider ? (
          <span style={{
            fontSize: 11, width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            backgroundColor: `${currentProvider.color}25`,
            border: `1px solid ${currentProvider.color}50`,
            color: currentProvider.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {currentProvider.logo}
          </span>
        ) : (
          <Zap size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
          {currentModel?.name || 'Select a model'}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {/* ── Popup dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="model-dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position:     'absolute',
              bottom:       'calc(100% + 10px)',
              left:         '50%',
              transform:    'translateX(-50%)',
              zIndex:       9999,
              width:        420,
              maxWidth:     'calc(100vw - 32px)',
              background:   'linear-gradient(145deg, #1e1e2e, #16161e)',
              border:       '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16,
              boxShadow:    '0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04), 0 -2px 20px rgba(0,0,0,0.4)',
              display:      'flex',
              flexDirection:'column',
              overflow:     'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Choose a Model
                </span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: 'var(--color-primary-20)', color: 'var(--color-primary)',
              }}>
                {totalModels} active
              </span>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search models or providers..."
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
                    color: '#f1f5f9', fontSize: 13, outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Model list — scrollable */}
            <div style={{ overflowY: 'auto', maxHeight: 340, minHeight: 0 }}>
              {!hasModels ? (
                <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                  <Zap size={28} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 10 }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                    {search ? 'No models match your search' : 'No models added yet'}
                  </p>
                  {!search && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                      Click + Add Model to get started
                    </p>
                  )}
                </div>
              ) : (
                Object.entries(grouped).map(([providerId, { provider, models }]) => (
                  <div key={providerId}>
                    {/* Provider group header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px 4px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: `linear-gradient(90deg, ${provider.color}10, transparent)`,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, fontSize: 11, flexShrink: 0,
                        backgroundColor: `${provider.color}20`, border: `1px solid ${provider.color}40`,
                        color: provider.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {provider.logo}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: provider.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {provider.name}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
                        {models.length} model{models.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Model rows */}
                    {models.map(model => {
                      const isSelected = selectedProviderId === providerId && selectedModelId === model.id
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelect(providerId, model.id)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 14px 9px 42px', cursor: 'pointer',
                            border: 'none', textAlign: 'left', transition: 'background 100ms',
                            background: isSelected
                              ? `linear-gradient(90deg, ${provider.color}18, ${provider.color}08)`
                              : 'transparent',
                            borderLeft: isSelected ? `3px solid ${provider.color}` : '3px solid transparent',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: isSelected ? 600 : 500,
                              color: isSelected ? provider.color : 'rgba(255,255,255,0.85)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {model.name}
                            </div>
                            {model.contextWindow > 0 && (
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                                {formatContextWindow(model.contextWindow)} context
                              </div>
                            )}
                          </div>
                          {model.free && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                              color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                            }}>
                              Free
                            </span>
                          )}
                          {isSelected && <Check size={13} style={{ color: provider.color, flexShrink: 0 }} />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', flexShrink: 0,
              background: 'rgba(0,0,0,0.2)',
            }}>
              Click + Add Model in the top bar to add more
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
