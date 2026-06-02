import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check, Zap } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS, formatContextWindow } from '../../utils/providers'

export default function ModelSelector({ compact = false, onChange }) {
  const {
    activeModels, selectedProviderId, selectedModelId, selectModel,
    providerKeys,
  } = useAppStore()

  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const ref = useRef(null)

  const currentProvider = PROVIDERS[selectedProviderId]
  const currentModel    = currentProvider?.models.find(m => m.id === selectedModelId)
  const activeEntry     = activeModels.find(m => m.providerId === selectedProviderId && m.modelId === selectedModelId)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Group active models by provider
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

  const hasModels = Object.keys(grouped).length > 0

  const handleSelect = (providerId, modelId) => {
    selectModel(providerId, modelId)
    onChange?.({ providerId, modelId })
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:         'flex',
          alignItems:      'center',
          gap:             '8px',
          padding:         compact ? '6px 12px' : '8px 14px',
          borderRadius:    '10px',
          border:          '1px solid var(--border)',
          backgroundColor: 'var(--bg-elevated)',
          color:           'var(--text-primary)',
          fontSize:        '13px',
          fontWeight:      500,
          cursor:          'pointer',
          transition:      'all 150ms',
          minWidth:        compact ? 180 : 220,
          maxWidth:        320,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {/* Provider logo */}
        {currentProvider ? (
          <span
            style={{
              fontSize:        '10px',
              fontWeight:      700,
              fontFamily:      'monospace',
              width:           24,
              height:          24,
              borderRadius:    '6px',
              backgroundColor: `${currentProvider.color}20`,
              border:          `1px solid ${currentProvider.color}40`,
              color:           currentProvider.color,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
            }}
          >
            {currentProvider.logo}
          </span>
        ) : (
          <Zap size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}

        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentModel?.name || 'Select a model'}
        </span>
        <ChevronDown
          size={14}
          style={{
            color:       'var(--text-muted)',
            flexShrink:  0,
            transform:   open ? 'rotate(180deg)' : 'none',
            transition:  'transform 150ms',
          }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="model-dropdown"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position:        'absolute',
              top:             'calc(100% + 6px)',
              left:            0,
              zIndex:          500,
              width:           320,
              backgroundColor: 'var(--bg-elevated)',
              border:          '1px solid var(--border)',
              borderRadius:    '12px',
              boxShadow:       '0 16px 48px rgba(0,0,0,0.6)',
              overflow:        'hidden',
              display:         'flex',
              flexDirection:   'column',
              maxHeight:       380,
            }}
          >
            {/* Search */}
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search models..."
                  className="input-base"
                  style={{ paddingLeft: 32, paddingRight: 10 }}
                />
              </div>
            </div>

            {/* Model list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {!hasModels ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <Zap size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {search ? 'No models match your search' : 'No models added yet'}
                  </p>
                  {!search && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Click "Add Model" to get started
                    </p>
                  )}
                </div>
              ) : (
                Object.entries(grouped).map(([providerId, { provider, models }]) => (
                  <div key={providerId}>
                    {/* Provider group header */}
                    <div
                      style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        '8px',
                        padding:    '8px 12px 4px',
                        fontSize:   '11px',
                        fontWeight: 600,
                        color:      'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        borderTop:  '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        style={{
                          fontSize:   '9px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          width:      18,
                          height:     18,
                          borderRadius: '4px',
                          backgroundColor: `${provider.color}20`,
                          color:       provider.color,
                          display:     'flex',
                          alignItems:  'center',
                          justifyContent: 'center',
                        }}
                      >
                        {provider.logo}
                      </span>
                      {provider.name}
                    </div>
                    {/* Models */}
                    {models.map(model => {
                      const isSelected = selectedProviderId === providerId && selectedModelId === model.id
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelect(providerId, model.id)}
                          style={{
                            width:           '100%',
                            display:         'flex',
                            alignItems:      'center',
                            gap:             '10px',
                            padding:         '8px 12px',
                            cursor:          'pointer',
                            border:          'none',
                            backgroundColor: isSelected ? 'var(--color-primary-10)' : 'transparent',
                            color:           isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                            textAlign:       'left',
                            transition:      'background-color 100ms',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {model.name}
                            </div>
                            {model.contextWindow > 0 && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>
                                {formatContextWindow(model.contextWindow)}
                              </div>
                            )}
                          </div>
                          {model.free && <span className="badge-free">Free</span>}
                          {isSelected && <Check size={14} style={{ flexShrink: 0 }} />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
