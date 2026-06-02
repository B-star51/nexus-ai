import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Palette } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { COLOR_PRESETS } from '../../utils/providers'

export default function ThemeCustomizer({ open, onClose }) {
  const { themePreset, customPrimary, setTheme } = useAppStore()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="theme-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position:        'fixed',
              inset:           0,
              zIndex:          800,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />

          {/* Slide-over panel */}
          <motion.div
            key="theme-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position:        'fixed',
              right:           0,
              top:             0,
              bottom:          0,
              zIndex:          801,
              width:           320,
              backgroundColor: 'var(--bg-elevated)',
              borderLeft:      '1px solid var(--border)',
              display:         'flex',
              flexDirection:   'column',
              boxShadow:       '-24px 0 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
                padding:         '18px 20px',
                borderBottom:    '1px solid var(--border-subtle)',
                flexShrink:      0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Palette size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Theme</h2>
              </div>
              <button
                className="btn-ghost"
                onClick={onClose}
                style={{ padding: 6 }}
                aria-label="Close theme panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Choose a color preset. Changes apply instantly.
              </p>

              {/* Color presets grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(COLOR_PRESETS).map(([name, colors]) => {
                  const isActive = themePreset === name && !customPrimary
                  return (
                    <button
                      key={name}
                      onClick={() => setTheme(name)}
                      style={{
                        display:         'flex',
                        alignItems:      'center',
                        gap:             10,
                        padding:         '10px 12px',
                        borderRadius:    10,
                        border:          isActive ? `2px solid ${colors.primary}` : '1px solid var(--border-subtle)',
                        backgroundColor: isActive ? `${colors.primary}12` : 'transparent',
                        cursor:          'pointer',
                        transition:      'all 150ms',
                        position:        'relative',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      {/* Color swatch */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width:        32,
                            height:       32,
                            borderRadius: 8,
                            background:   `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                            boxShadow:    isActive ? `0 0 12px ${colors.primary}60` : 'none',
                          }}
                        />
                        {isActive && (
                          <div
                            style={{
                              position:        'absolute',
                              inset:           0,
                              display:         'flex',
                              alignItems:      'center',
                              justifyContent:  'center',
                              borderRadius:    8,
                              backgroundColor: 'rgba(0,0,0,0.3)',
                            }}
                          >
                            <Check size={14} color="#fff" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <span
                        style={{
                          fontSize:   '12px',
                          fontWeight: 500,
                          color:      isActive ? colors.primary : 'var(--text-secondary)',
                          lineHeight: 1.2,
                          textAlign:  'left',
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Custom hex input */}
              <div style={{ marginTop: 20 }}>
                <label
                  style={{
                    display:       'block',
                    fontSize:      '12px',
                    fontWeight:    600,
                    color:         'var(--text-secondary)',
                    marginBottom:  8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Custom Primary Color
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="color"
                    defaultValue={customPrimary || COLOR_PRESETS[themePreset]?.primary || '#e86c28'}
                    onChange={e => setTheme('Custom', e.target.value, e.target.value)}
                    style={{
                      width:        44,
                      height:       38,
                      padding:      2,
                      borderRadius: 8,
                      border:       '1px solid var(--border)',
                      cursor:       'pointer',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                    aria-label="Pick custom primary color"
                  />
                  <input
                    type="text"
                    placeholder="#e86c28"
                    defaultValue={customPrimary || ''}
                    onChange={e => {
                      const val = e.target.value
                      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                        setTheme('Custom', val, val)
                      }
                    }}
                    className="input-base"
                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginTop: 24 }}>
                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Preview
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn-primary" style={{ justifyContent: 'center' }}>
                    Primary Button
                  </button>
                  <button className="btn-secondary" style={{ justifyContent: 'center' }}>
                    Secondary Button
                  </button>
                  <div
                    style={{
                      padding:         '10px 12px',
                      borderRadius:    8,
                      backgroundColor: 'var(--color-primary-10)',
                      border:          '1px solid var(--color-primary-20)',
                      fontSize:        '12px',
                      color:           'var(--color-primary)',
                      fontWeight:      500,
                    }}
                  >
                    Accent surface
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'var(--color-primary)' }} />
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'var(--color-secondary)' }} />
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'var(--color-primary-50)' }} />
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'var(--color-primary-20)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
