import { useState, useEffect } from 'react'
import { Key, Palette, Database, Shield, Info, Trash2, Download, HardDrive, RefreshCw } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { getStorageUsage, getAllConversations, deleteConversation } from '../../utils/db'
import APISettings from '../settings/APISettings'
import ThemeCustomizer from '../settings/ThemeCustomizer'
import { COLOR_PRESETS } from '../../utils/providers'

const SECTIONS = [
  { id: 'api',      label: 'API Keys',    icon: Key      },
  { id: 'theme',    label: 'Theme',       icon: Palette  },
  { id: 'data',     label: 'Data',        icon: Database },
  { id: 'about',    label: 'About',       icon: Info     },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('api')
  const { openThemeCustomizer, themePreset, setTheme, dailyTokenCap, setDailyTokenCap, tokenUsage } = useAppStore()
  const [storageInfo, setStorageInfo] = useState(null)
  const [convCount, setConvCount]     = useState(0)
  const [clearing, setClearing]       = useState(false)
  const [capInput, setCapInput]       = useState(dailyTokenCap ? String(dailyTokenCap) : '')

  const todayTokens = tokenUsage?.[new Date().toISOString().slice(0, 10)] || 0

  useEffect(() => {
    getStorageUsage().then(setStorageInfo)
    getAllConversations().then(c => setConvCount(c.length))
  }, [])

  const handleClearData = async () => {
    if (!window.confirm('Delete ALL conversations? This cannot be undone.')) return
    setClearing(true)
    try {
      const convs = await getAllConversations()
      for (const c of convs) await deleteConversation(c.id)
      setConvCount(0)
      getStorageUsage().then(setStorageInfo)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Section nav */}
      <div
        style={{
          width:           200,
          flexShrink:      0,
          borderRight:     '1px solid var(--border-subtle)',
          padding:         '16px 8px',
          backgroundColor: 'var(--bg-sidebar)',
          display:         'flex',
          flexDirection:   'column',
          gap:             '2px',
        }}
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%', border: isActive ? undefined : '1px solid transparent' }}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Section content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {/* API Keys */}
        {activeSection === 'api' && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>API Keys</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Manage your provider API keys. Keys are stored locally in your browser and never sent to NexusAI servers.
            </p>
            <div
              style={{
                padding:         '10px 14px',
                borderRadius:    '8px',
                backgroundColor: 'rgba(251,191,36,0.08)',
                border:          '1px solid rgba(251,191,36,0.2)',
                marginBottom:    '20px',
                display:         'flex',
                alignItems:      'flex-start',
                gap:             '10px',
                fontSize:        '12px',
                color:           '#fbbf24',
              }}
            >
              <Shield size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                API keys are stored in your browser's localStorage. For production use, consider additional security measures.
                Always keep your API keys confidential.
              </span>
            </div>
            <APISettings />
          </div>
        )}

        {/* Theme */}
        {activeSection === 'theme' && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>Theme</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Customize the NexusAI color scheme.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', maxWidth: 600 }}>
              {Object.entries(COLOR_PRESETS).map(([name, colors]) => {
                const isActive = themePreset === name
                return (
                  <button
                    key={name}
                    onClick={() => setTheme(name)}
                    style={{
                      display:         'flex',
                      alignItems:      'center',
                      gap:             '10px',
                      padding:         '12px',
                      borderRadius:    '10px',
                      border:          isActive ? `2px solid ${colors.primary}` : '1px solid var(--border-subtle)',
                      backgroundColor: isActive ? `${colors.primary}12` : 'var(--bg-surface)',
                      cursor:          'pointer',
                      transition:      'all 150ms',
                    }}
                  >
                    <div
                      style={{
                        width:        28,
                        height:       28,
                        borderRadius: '7px',
                        background:   `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        flexShrink:   0,
                        boxShadow:    isActive ? `0 0 10px ${colors.primary}50` : 'none',
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: isActive ? colors.primary : 'var(--text-primary)', textAlign: 'left' }}>
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button className="btn-secondary" onClick={openThemeCustomizer}>
                <Palette size={14} /> Open full theme panel
              </button>
            </div>
          </div>
        )}

        {/* Data */}
        {activeSection === 'data' && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>Data & Storage</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              All your conversations are stored locally in IndexedDB — your device only.
            </p>

            {/* Storage stats */}
            <div
              style={{
                display:         'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap:             '12px',
                marginBottom:    '24px',
              }}
            >
              {[
                { icon: HardDrive,    label: 'Storage used',  value: storageInfo ? `${storageInfo.usedMB} MB` : '—',       sub: storageInfo ? `of ${storageInfo.totalMB} MB available` : 'Calculating...' },
                { icon: Database,     label: 'Conversations', value: convCount,                                              sub: 'Stored locally'             },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div
                  key={label}
                  style={{
                    padding:         '16px',
                    borderRadius:    '10px',
                    border:          '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
                  {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
                </div>
              ))}
            </div>

            {/* Storage bar */}
            {storageInfo && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>IndexedDB usage</span>
                  <span>{storageInfo.percent}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height:          '100%',
                      width:           `${storageInfo.percent}%`,
                      borderRadius:    3,
                      backgroundColor: 'var(--color-primary)',
                      transition:      'width 500ms ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Daily token cap */}
            <div style={{
              padding: '16px', borderRadius: 10, marginBottom: 24,
              border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Daily Token Cap</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Set a soft daily limit to track usage. Today: <strong style={{ color: 'var(--color-primary)' }}>{todayTokens.toLocaleString()} tokens</strong>
                {dailyTokenCap > 0 && ` of ${dailyTokenCap.toLocaleString()}`}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={capInput}
                  onChange={e => setCapInput(e.target.value)}
                  placeholder="e.g. 100000 (0 = unlimited)"
                  style={{
                    flex: 1, minWidth: 180, padding: '9px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                  }}
                />
                <button className="btn-primary" onClick={() => setDailyTokenCap(parseInt(capInput) || 0)} style={{ fontSize: 13 }}>
                  Save Cap
                </button>
                {dailyTokenCap > 0 && (
                  <button className="btn-secondary" onClick={() => { setDailyTokenCap(0); setCapInput('') }} style={{ fontSize: 13 }}>
                    Remove
                  </button>
                )}
              </div>
              {[25000, 100000, 500000].map(v => (
                <button key={v}
                  onClick={() => { setCapInput(String(v)); setDailyTokenCap(v) }}
                  style={{
                    marginTop: 10, marginRight: 6, padding: '4px 10px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
                    border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)',
                  }}>
                  {v >= 1000 ? `${v / 1000}K` : v}/day
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                onClick={() => getStorageUsage().then(setStorageInfo)}
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                className="btn-secondary"
                onClick={handleClearData}
                disabled={clearing || convCount === 0}
                style={{ color: convCount > 0 ? '#f87171' : undefined, borderColor: convCount > 0 ? 'rgba(248,113,113,0.3)' : undefined }}
              >
                <Trash2 size={14} /> {clearing ? 'Clearing...' : 'Clear all conversations'}
              </button>
            </div>
          </div>
        )}

        {/* About */}
        {activeSection === 'about' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>About NexusAI</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              NexusAI is a multi-model AI dashboard that lets you interact with models from multiple providers in one place.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {[
                ['Version', '0.1.0'],
                ['Tech Stack', 'React 18 + Vite + TailwindCSS'],
                ['State', 'Zustand + IndexedDB (via idb)'],
                ['Animations', 'Framer Motion'],
                ['Icons', 'Lucide React'],
                ['Deployment', 'GitHub Pages'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '12px', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 100 }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding:         '14px 16px',
                borderRadius:    '10px',
                backgroundColor: 'var(--bg-surface)',
                border:          '1px solid var(--border-subtle)',
                fontSize:        '12px',
                color:           'var(--text-secondary)',
                lineHeight:      1.6,
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Privacy:</strong> NexusAI is a client-side app.
              Your API keys and conversations are stored entirely in your browser — they never touch NexusAI servers.
              API calls are made directly from your browser to the respective AI provider APIs.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
