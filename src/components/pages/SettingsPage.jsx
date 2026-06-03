import { useState, useEffect } from 'react'
import { Key, Palette, Database, Shield, Info, Trash2, Download, HardDrive, RefreshCw, Briefcase, BarChart3, Check, TrendingUp, Headphones, Megaphone, Scale, X, Sliders, Mail, Upload, Send, FileText, Tag, Bug, ArrowRight } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { getStorageUsage, getAllConversations, deleteConversation } from '../../utils/db'
import APISettings from '../settings/APISettings'
import ThemeCustomizer from '../settings/ThemeCustomizer'
import { COLOR_PRESETS, PROVIDERS } from '../../utils/providers'
import { TEAM_TEMPLATES } from '../../utils/teamTemplates'

const SECTIONS = [
  { id: 'api',      label: 'API Keys',    icon: Key       },
  { id: 'theme',    label: 'Theme',       icon: Palette   },
  { id: 'business', label: 'Business',    icon: Briefcase },
  { id: 'usage',    label: 'Usage',       icon: BarChart3 },
  { id: 'advanced', label: 'Advanced',    icon: Sliders   },
  { id: 'data',     label: 'Data',        icon: Database  },
  { id: 'about',    label: 'About',       icon: Info      },
]

const ICON_MAP = { Mail, Send, Briefcase, FileText, Scale, Megaphone, Tag, Bug }

const EMAIL_TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly' },
  { id: 'concise',      label: 'Concise' },
  { id: 'formal',       label: 'Formal' },
]

const ROLE_PRESETS = [
  {
    id: 'sales', label: 'Sales', icon: TrendingUp, color: '#4ade80',
    desc: 'Persuasive but honest. Understands needs and guides to a confident decision.',
    apply: (s) => {
      s.setAgentTaskFocus('general'); s.setAgentPersonality('friendly'); s.setAgentCommStyle('balanced')
      s.setAgentCustomTraits('You are a persuasive but honest sales assistant. Focus on understanding customer needs, highlighting value, and guiding toward a confident decision. Never be pushy.')
    },
  },
  {
    id: 'support', label: 'Support', icon: Headphones, color: '#60a5fa',
    desc: 'Patient and empathetic. Gives clear step-by-step solutions and confirms resolution.',
    apply: (s) => {
      s.setAgentTaskFocus('general'); s.setAgentPersonality('friendly'); s.setAgentCommStyle('balanced'); s.setAgentResponseLength('balanced')
      s.setAgentCustomTraits('You are a patient, empathetic customer support agent. Acknowledge the issue, give clear step-by-step solutions, and confirm resolution. Stay calm and reassuring.')
    },
  },
  {
    id: 'marketing', label: 'Marketing', icon: Megaphone, color: '#c084fc',
    desc: 'Creative and punchy. Generates catchy copy, campaign ideas, and on-brand content.',
    apply: (s) => {
      s.setAgentTaskFocus('creative'); s.setAgentPersonality('creative'); s.setAgentCommStyle('casual')
      s.setAgentCustomTraits('You are a creative marketing assistant. Generate catchy copy, campaign ideas, and on-brand content. Be punchy and audience-aware.')
    },
  },
  {
    id: 'legal', label: 'Legal', icon: Scale, color: '#fbbf24',
    desc: 'Precise and formal. Flags risks and adds a not-legal-advice disclaimer.',
    apply: (s) => {
      s.setAgentTaskFocus('analysis'); s.setAgentPersonality('professional'); s.setAgentCommStyle('formal'); s.setAgentResponseLength('detailed')
      s.setAgentCustomTraits('You are a careful legal-aware assistant. Be precise, flag risks, use formal language, and always add a brief disclaimer that this is not formal legal advice.')
    },
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('api')
  const {
    openThemeCustomizer, themePreset, setTheme, dailyTokenCap, setDailyTokenCap, tokenUsage, jinaApiKey, setJinaApiKey,
    businessMode, toggleBusinessMode, company, setCompany, modelUsage, usageDetail,
    setAgentTaskFocus, setAgentPersonality, setAgentCommStyle, setAgentResponseLength, setAgentCustomTraits,
    emailRules, setEmailRules, emailSignature, setEmailSignature, emailBannerDataUrl, setEmailBanner,
    emailTone, setEmailTone, addPrompt, setActivePage,
  } = useAppStore()
  const [templateState, setTemplateState] = useState({}) // { [id]: 'used' | 'saved' }
  const [appliedRole, setAppliedRole] = useState(null)
  const [jinaInput, setJinaInput] = useState('')
  const [jinaSaved, setJinaSaved] = useState(false)
  const [storageInfo, setStorageInfo] = useState(null)
  const [convCount, setConvCount]     = useState(0)
  const [clearing, setClearing]       = useState(false)
  const [capInput, setCapInput]       = useState(dailyTokenCap ? String(dailyTokenCap) : '')

  useEffect(() => { setJinaInput(jinaApiKey || '') }, [jinaApiKey])

  const todayTokens = tokenUsage?.[new Date().toISOString().slice(0, 10)] || 0

  useEffect(() => {
    getStorageUsage().then(setStorageInfo)
    getAllConversations().then(c => setConvCount(c.length))
  }, [])

  const handleApplyRole = (preset) => {
    preset.apply({ setAgentTaskFocus, setAgentPersonality, setAgentCommStyle, setAgentResponseLength, setAgentCustomTraits })
    setAppliedRole(preset.id)
    setTimeout(() => setAppliedRole(r => (r === preset.id ? null : r)), 2000)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCompany({ logoDataUrl: reader.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setEmailBanner(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleUseTemplate = (template) => {
    addPrompt(template.title, template.prompt)
    setTemplateState(s => ({ ...s, [template.id]: 'used' }))
    setTimeout(() => setActivePage('chat'), 400)
  }

  const handleSaveTemplate = (template) => {
    addPrompt(template.title, template.prompt)
    setTemplateState(s => ({ ...s, [template.id]: 'saved' }))
    setTimeout(() => setTemplateState(s => {
      if (s[template.id] !== 'saved') return s
      const next = { ...s }; delete next[template.id]; return next
    }), 1500)
  }

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

        {/* Business */}
        {activeSection === 'business' && (
          <div style={{ maxWidth: 720 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>Business Mode</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Turn NexusAI into a branded assistant for your company.
            </p>

            {/* Enable toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              padding: '14px 16px', borderRadius: 10, marginBottom: 24,
              border: businessMode ? '1px solid var(--color-primary-30)' : '1px solid var(--border-subtle)',
              background: businessMode ? 'var(--color-primary-10)' : 'var(--bg-surface)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Enable Business Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  When on, your company context is injected into every chat automatically.
                </div>
              </div>
              <button
                onClick={toggleBusinessMode}
                role="switch"
                aria-checked={businessMode}
                style={{
                  width: 48, height: 26, borderRadius: 99, flexShrink: 0, cursor: 'pointer', border: 'none',
                  position: 'relative', padding: 0, transition: 'background 150ms',
                  background: businessMode ? 'var(--color-primary)' : 'var(--bg-elevated)',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: businessMode ? 25 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            {/* Company profile */}
            <div style={{ opacity: businessMode ? 1 : 0.7, transition: 'opacity 150ms' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Company Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                <Field label="Company Name">
                  <input
                    type="text" value={company.name}
                    onChange={e => setCompany({ name: e.target.value })}
                    placeholder="Acme Inc."
                    style={fieldInputStyle}
                  />
                </Field>
                <Field label="Industry">
                  <input
                    type="text" value={company.industry}
                    onChange={e => setCompany({ industry: e.target.value })}
                    placeholder="e.g. SaaS, Legal, Healthcare"
                    style={fieldInputStyle}
                  />
                </Field>
                <Field label="Brand Voice">
                  <textarea
                    value={company.brandVoice}
                    onChange={e => setCompany({ brandVoice: e.target.value })}
                    placeholder="e.g. Professional, friendly, concise. Avoid jargon."
                    rows={2}
                    style={{ ...fieldInputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </Field>
                <Field label="Products / Services">
                  <textarea
                    value={company.products}
                    onChange={e => setCompany({ products: e.target.value })}
                    placeholder="What does your company offer?"
                    rows={2}
                    style={{ ...fieldInputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </Field>
                <Field label="Website">
                  <input
                    type="text" value={company.website}
                    onChange={e => setCompany({ website: e.target.value })}
                    placeholder="https://example.com"
                    style={fieldInputStyle}
                  />
                </Field>
                <Field label="Logo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {company.logoDataUrl ? (
                      <>
                        <img
                          src={company.logoDataUrl} alt="Company logo"
                          style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
                        />
                        <button className="btn-secondary" onClick={() => setCompany({ logoDataUrl: '' })} style={{ fontSize: 13 }}>
                          <X size={14} /> Remove
                        </button>
                      </>
                    ) : (
                      <label className="btn-secondary" style={{ fontSize: 13, cursor: 'pointer' }}>
                        <Download size={14} /> Upload logo
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                      </label>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Used on branded exports.</span>
                  </div>
                </Field>
              </div>

              {/* Workspace roles */}
              <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Workspace Roles</h3>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                Apply a preset to instantly tune the Agent Customizer for a specific job.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {ROLE_PRESETS.map(preset => {
                  const Icon = preset.icon
                  const applied = appliedRole === preset.id
                  return (
                    <div
                      key={preset.id}
                      style={{
                        padding: 14, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8,
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${preset.color}18`, border: `1px solid ${preset.color}35`,
                        }}>
                          <Icon size={16} style={{ color: preset.color }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{preset.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                        {preset.desc}
                      </p>
                      <button
                        className={applied ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => handleApplyRole(preset)}
                        style={{ fontSize: 12, justifyContent: 'center' }}
                      >
                        {applied ? (<><Check size={13} /> Applied</>) : 'Apply'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Usage */}
        {activeSection === 'usage' && (() => {
          const today = new Date().toISOString().slice(0, 10)
          const todayTotal = tokenUsage?.[today] || 0
          // Last 7 days
          const days = []
          for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            days.push({ key, value: tokenUsage?.[key] || 0, label: d.toLocaleDateString('en-US', { weekday: 'short' }) })
          }
          const maxDay = Math.max(1, ...days.map(d => d.value))
          const hasDayData = days.some(d => d.value > 0)
          // Per-model breakdown
          const modelRows = Object.entries(modelUsage || {})
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
          const maxModel = Math.max(1, ...modelRows.map(([, v]) => v))

          const resolveModel = (mkey) => {
            const [pid, ...rest] = mkey.split(':')
            const mid = rest.join(':')
            const provider = PROVIDERS[pid]
            const model = provider?.models?.find(m => m.id === mid)
            return {
              providerName: provider?.name || pid,
              modelName: model?.name || mid || mkey,
              logo: provider?.logo || '•',
              color: provider?.color || 'var(--color-primary)',
            }
          }

          return (
            <div style={{ maxWidth: 720 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>Usage &amp; Budgeting</h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Track token spend per day and per model.
              </p>

              {/* Today summary */}
              <div style={{
                padding: 16, borderRadius: 10, marginBottom: 24,
                border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Today's usage</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {todayTotal.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>tokens</span>
                </div>
                {dailyTokenCap > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    of {dailyTokenCap.toLocaleString()} daily cap
                  </div>
                )}
              </div>

              {/* Last 7 days bar chart */}
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Last 7 days</h3>
              <div style={{
                padding: 16, borderRadius: 10, marginBottom: 24,
                border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
              }}>
                {hasDayData ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
                    {days.map(d => (
                      <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                        <div
                          title={`${d.value.toLocaleString()} tokens`}
                          style={{
                            width: '100%', maxWidth: 36, borderRadius: '4px 4px 0 0',
                            height: `${Math.max(2, (d.value / maxDay) * 110)}px`,
                            background: 'var(--color-primary)', opacity: d.value > 0 ? 1 : 0.25,
                            transition: 'height 300ms ease',
                          }}
                        />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    No usage yet
                  </div>
                )}
              </div>

              {/* Per-model breakdown */}
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Per-model breakdown</h3>
              <div style={{
                padding: modelRows.length ? 8 : 16, borderRadius: 10, marginBottom: 16,
                border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
              }}>
                {modelRows.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {modelRows.map(([mkey, value]) => {
                      const info = resolveModel(mkey)
                      return (
                        <div key={mkey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px' }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                            background: `${info.color}18`, color: info.color,
                          }}>
                            {info.logo}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {info.modelName}
                            </div>
                            <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-elevated)', marginTop: 5, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(value / maxModel) * 100}%`, background: 'var(--color-primary)', borderRadius: 3 }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {value.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No usage yet
                  </div>
                )}
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Token counts are estimates (~4 chars/token) for budgeting guidance.
              </p>
            </div>
          )
        })()}

        {/* Advanced */}
        {activeSection === 'advanced' && (
          <div style={{ maxWidth: 760 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>Advanced</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Email assistant rules, branding, and team workflow templates.
            </p>

            {/* ── Email Assistant ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Mail size={16} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Email Assistant</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
              These settings shape how drafted replies are analysed and written.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <Field label="Email Reply Rules">
                <textarea
                  value={emailRules}
                  onChange={e => setEmailRules(e.target.value)}
                  placeholder="e.g. Always be polite. Flag anything about refunds or cancellations. Never commit to specific dates. Escalate legal threats."
                  rows={4}
                  style={{ ...fieldInputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                />
              </Field>

              <Field label="Tone">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EMAIL_TONES.map(t => {
                    const active = emailTone === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setEmailTone(t.id)}
                        style={{
                          padding: '7px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                          border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                          background: active ? 'var(--color-primary-10)' : 'transparent',
                          color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                          transition: 'all 150ms',
                        }}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Signature">
                <textarea
                  value={emailSignature}
                  onChange={e => setEmailSignature(e.target.value)}
                  placeholder={"e.g. Best regards,\nThe Acme Team"}
                  rows={3}
                  style={{ ...fieldInputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                />
              </Field>

              <Field label="Reply Banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {emailBannerDataUrl ? (
                    <>
                      <img
                        src={emailBannerDataUrl} alt="Reply banner"
                        style={{ maxHeight: 80, maxWidth: 240, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
                      />
                      <button className="btn-secondary" onClick={() => setEmailBanner('')} style={{ fontSize: 13 }}>
                        <X size={14} /> Remove
                      </button>
                    </>
                  ) : (
                    <label className="btn-secondary" style={{ fontSize: 13, cursor: 'pointer' }}>
                      <Upload size={14} /> Upload banner
                      <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Shown at the top of drafted replies and included when you Copy as HTML.
                </span>
              </Field>
            </div>

            <button className="btn-primary" onClick={() => setActivePage('email')} style={{ fontSize: 13, marginBottom: 32 }}>
              <Mail size={14} /> Open Email Assistant <ArrowRight size={14} />
            </button>

            {/* ── Team Templates ── */}
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Team Templates</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
              Pre-built workflows. Use one in chat instantly, or save it to your prompt library.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {TEAM_TEMPLATES.map(template => {
                const Icon = ICON_MAP[template.icon] || Mail
                const state = templateState[template.id]
                return (
                  <div
                    key={template.id}
                    style={{
                      padding: 14, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8,
                      border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--color-primary-10)', border: '1px solid var(--color-primary-20)',
                      }}>
                        <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.title}</div>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{template.category}</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                      {template.desc}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-primary"
                        onClick={() => handleUseTemplate(template)}
                        style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}
                      >
                        {state === 'used' ? (<><Check size={13} /> Added!</>) : 'Use in Chat'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleSaveTemplate(template)}
                        style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}
                      >
                        {state === 'saved' ? (<><Check size={13} /> Saved</>) : 'Save'}
                      </button>
                    </div>
                  </div>
                )
              })}
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

            {/* Jina web search key */}
            <div style={{
              padding: '16px', borderRadius: 10, marginBottom: 16,
              border: '1px solid rgba(56,189,248,0.25)', background: 'rgba(56,189,248,0.05)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                🌐 Web Search Key (Jina) {jinaApiKey && <span style={{ fontSize: 11, color: '#4ade80' }}>● Active</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
                Optional — supercharges the <strong>🌐 Web</strong> toggle with full real-time search for every model.
                Without it, web search falls back to free DuckDuckGo + Wikipedia.<br/>
                Get a <strong>free key (no payment)</strong> at <a href="https://jina.ai/api-dashboard/" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>jina.ai/api-dashboard</a> — 10M free tokens.
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="password"
                  value={jinaInput}
                  onChange={e => setJinaInput(e.target.value)}
                  placeholder="jina_..."
                  style={{
                    flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'monospace',
                  }}
                />
                <button className="btn-primary"
                  onClick={() => { setJinaApiKey(jinaInput.trim()); setJinaSaved(true); setTimeout(() => setJinaSaved(false), 2000) }}
                  style={{ fontSize: 13 }}>
                  {jinaSaved ? '✓ Saved' : 'Save Key'}
                </button>
                {jinaApiKey && (
                  <button className="btn-secondary" onClick={() => { setJinaApiKey(''); setJinaInput('') }} style={{ fontSize: 13 }}>
                    Remove
                  </button>
                )}
              </div>
            </div>

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

const fieldInputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, boxSizing: 'border-box',
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </label>
  )
}
