import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check, Zap, Cpu, X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS, formatContextWindow } from '../../utils/providers'

export default function ModelSelector({ compact = false, onChange }) {
  const { activeModels, selectedProviderId, selectedModelId, selectModel } = useAppStore()
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')

  const currentProvider = PROVIDERS[selectedProviderId]
  const currentModel    = currentProvider?.models.find(m => m.id === selectedModelId)

  // Close on escape
  useEffect(() => {
    if (!open) return
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open])

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

  const modal = open && createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="ms-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '8vh 16px 16px',
        }}
      >
        {/* Modal card */}
        <motion.div
          key="ms-card"
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          style={{
            width: 'min(560px, 100%)',
            maxHeight: '80vh',
            background: 'linear-gradient(145deg, #1e1e2e, #16161e)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 18,
            boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Cpu size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Choose a Model</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: 'var(--color-primary-20)', color: 'var(--color-primary)',
              }}>
                {totalModels} active
              </span>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ padding: 6, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search models or providers..."
                style={{
                  width: '100%', padding: '11px 12px 11px 36px', borderRadius: 10, boxSizing: 'border-box',
                  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                  color: '#f1f5f9', fontSize: 14, outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Model list — big scroll area */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {!hasModels ? (
              <div style={{ padding: '48px 16px', textAlign: 'center' }}>
                <Zap size={32} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  {search ? 'No models match your search' : 'No models added yet'}
                </p>
                {!search && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                    Click + Add Model in the top bar to add some
                  </p>
                )}
              </div>
            ) : (
              Object.entries(grouped).map(([providerId, { provider, models }]) => (
                <div key={providerId}>
                  {/* Provider header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 6px',
                    background: `linear-gradient(90deg, ${provider.color}12, transparent)`,
                    position: 'sticky', top: 0, backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, fontSize: 12, flexShrink: 0,
                      backgroundColor: `${provider.color}20`, border: `1px solid ${provider.color}40`,
                      color: provider.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {provider.logo}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: provider.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {provider.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
                      {models.length} model{models.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Models */}
                  {models.map(model => {
                    const isSelected = selectedProviderId === providerId && selectedModelId === model.id
                    return (
                      <button
                        key={model.id}
                        onClick={() => handleSelect(providerId, model.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 20px 11px 50px', cursor: 'pointer',
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
                            fontSize: 14, fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? provider.color : 'rgba(255,255,255,0.9)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {model.name}
                          </div>
                          {model.contextWindow > 0 && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                              {formatContextWindow(model.contextWindow)} context
                            </div>
                          )}
                        </div>
                        {model.web && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                            background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
                            color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                          }}>
                            🌐 Live
                          </span>
                        )}
                        {model.category?.includes('images') && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                            background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
                            color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                          }}>
                            Image
                          </span>
                        )}
                        {model.free && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                            color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                          }}>
                            Free
                          </span>
                        )}
                        {isSelected && <Check size={15} style={{ color: provider.color, flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: compact ? '6px 12px' : '8px 14px', borderRadius: 10,
          border: open ? '1px solid var(--color-primary)' : '1px solid var(--border)',
          backgroundColor: open ? 'var(--color-primary-10)' : 'var(--bg-elevated)',
          color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', transition: 'all 150ms',
          minWidth: compact ? 160 : 200, maxWidth: 300, whiteSpace: 'nowrap',
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
        <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </button>
      {modal}
    </>
  )
}
