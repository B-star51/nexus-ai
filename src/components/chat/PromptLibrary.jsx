import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookMarked, X, Trash2, Plus } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const STARTER_PROMPTS = [
  'Explain this code line by line:',
  'Summarise this in 3 bullet points:',
  'Rewrite this to be more professional:',
  'What are the pros and cons of:',
]

export default function PromptLibrary({ open, onClose, onUse }) {
  const { savedPrompts, addPrompt, removePrompt } = useAppStore()
  const [title, setTitle] = useState('')
  const [text, setText]   = useState('')

  const handleSave = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    addPrompt(title.trim(), trimmed)
    setTitle('')
    setText('')
  }

  const handleUse = (value) => {
    onUse?.(value)
    onClose?.()
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="prompt-lib-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
            }}
          />

          {/* Panel */}
          <motion.div
            key="prompt-lib-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9001,
              width: 'min(420px, 100vw)', background: '#111118',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookMarked size={18} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Prompt Library</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close prompt library"
                style={{
                  width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              {/* Add form */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                padding: 14, borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
                marginBottom: 18,
              }}>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Title (optional)"
                  style={inputStyle}
                />
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Prompt text..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
                <button
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="btn-primary"
                  style={{
                    justifyContent: 'center', fontSize: 13,
                    opacity: text.trim() ? 1 : 0.5,
                    cursor: text.trim() ? 'pointer' : 'default',
                  }}
                >
                  <Plus size={14} /> Save Prompt
                </button>
              </div>

              {/* Saved prompts */}
              {savedPrompts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 16px', color: 'rgba(255,255,255,0.35)' }}>
                  <BookMarked size={28} style={{ opacity: 0.4, marginBottom: 10 }} />
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                    No saved prompts yet. Save your favourites to reuse them.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {savedPrompts.map(p => (
                    <div
                      key={p.id}
                      style={{
                        padding: 12, borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
                        {p.title}
                      </div>
                      <div style={{
                        fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {p.text}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                        <button
                          onClick={() => handleUse(p.text)}
                          style={{
                            flex: 1, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                            border: '1px solid var(--color-primary-30)', background: 'var(--color-primary-10)',
                            color: 'var(--color-primary)', fontSize: 12, fontWeight: 600,
                          }}
                        >
                          Use
                        </button>
                        <button
                          onClick={() => removePrompt(p.id)}
                          aria-label="Delete prompt"
                          style={{
                            width: 30, height: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — suggestions */}
            <div style={{
              padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0, background: 'rgba(0,0,0,0.2)',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.3)', marginBottom: 8,
              }}>
                Suggestions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STARTER_PROMPTS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleUse(s)}
                    style={{
                      padding: '6px 10px', borderRadius: 99, cursor: 'pointer', fontSize: 11,
                      border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary-30)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
