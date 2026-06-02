import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const AVATAR_OPTIONS = ['🤖', '🦾', '🧠', '🌟', '⚡', '🔮', '🦅', '🐉', '🦁', '🌙', '💎', '🔥', '🌊', '🎯', '🚀', '👁️', '🧬', '⚔️', '🌌', '🦊']

const PERSONALITY_OPTIONS = [
  { value: 'friendly',     emoji: '😊', label: 'Friendly',     desc: 'Warm and conversational' },
  { value: 'professional', emoji: '💼', label: 'Professional', desc: 'Polished and authoritative' },
  { value: 'witty',        emoji: '😄', label: 'Witty',        desc: 'Clever with a sense of humour' },
  { value: 'concise',      emoji: '⚡', label: 'Concise',      desc: 'Minimum words, max impact' },
  { value: 'creative',     emoji: '🎨', label: 'Creative',     desc: 'Inventive and unconventional' },
  { value: 'blunt',        emoji: '🎯', label: 'Blunt',        desc: 'Direct and no sugarcoating' },
]

const TASK_FOCUS_OPTIONS = ['General', 'Coding', 'Research', 'Creative', 'Analysis', 'Teaching']
const COMM_STYLE_OPTIONS  = ['Casual', 'Balanced', 'Formal', 'Technical']
const LENGTH_OPTIONS      = ['Brief', 'Balanced', 'Detailed']

export default function AgentCustomizerPanel({ open, onClose }) {
  const {
    agentName, agentSystemPrompt, agentTemperature, agentMaxTokens, agentTopP,
    agentUserName, agentPersonality, agentTaskFocus, agentCommStyle,
    agentResponseLength, agentCustomTraits, agentAvatar,
    setAgentName, setAgentSystemPrompt, setAgentTemperature, setAgentMaxTokens, setAgentTopP,
    setAgentUserName, setAgentPersonality, setAgentTaskFocus, setAgentCommStyle,
    setAgentResponseLength, setAgentCustomTraits, setAgentAvatar,
  } = useAppStore()

  const [localName,       setLocalName]       = useState(agentName)
  const [localSys,        setLocalSys]        = useState(agentSystemPrompt)
  const [localTemp,       setLocalTemp]       = useState(agentTemperature)
  const [localTok,        setLocalTok]        = useState(agentMaxTokens)
  const [localTopP,       setLocalTopP]       = useState(agentTopP)
  const [localUserName,   setLocalUserName]   = useState(agentUserName)
  const [localPersonality, setLocalPersonality] = useState(agentPersonality)
  const [localTaskFocus,  setLocalTaskFocus]  = useState(agentTaskFocus)
  const [localCommStyle,  setLocalCommStyle]  = useState(agentCommStyle)
  const [localLength,     setLocalLength]     = useState(agentResponseLength)
  const [localTraits,     setLocalTraits]     = useState(agentCustomTraits)
  const [localAvatar,     setLocalAvatar]     = useState(agentAvatar)
  const [advancedOpen,    setAdvancedOpen]    = useState(false)

  const handleSave = () => {
    setAgentName(localName)
    setAgentSystemPrompt(localSys)
    setAgentTemperature(localTemp)
    setAgentMaxTokens(localTok)
    setAgentTopP(localTopP)
    setAgentUserName(localUserName)
    setAgentPersonality(localPersonality)
    setAgentTaskFocus(localTaskFocus)
    setAgentCommStyle(localCommStyle)
    setAgentResponseLength(localLength)
    setAgentCustomTraits(localTraits)
    setAgentAvatar(localAvatar)
    onClose()
  }

  const displayUserName = localUserName?.trim() || 'you'
  const displayName     = localName?.trim() || 'NexusAI'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Slide-in panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(460px, 100vw)',
              background: '#111118',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Fixed header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--color-primary-10)',
                border: '1px solid var(--color-primary-20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {localAvatar}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Agent Customizer</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Shape your AI's personality</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  marginLeft: 'auto', padding: 8, borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                }}
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{
              padding: '20px 24px',
              display: 'flex', flexDirection: 'column', gap: 28,
              flex: 1, overflowY: 'auto', overflowX: 'hidden',
            }}>

              {/* ── Section 1: Identity ── */}
              <section>
                <SectionLabel>Identity</SectionLabel>

                {/* Avatar emoji grid */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Avatar</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gap: 6,
                  }}>
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setLocalAvatar(emoji)}
                        title={emoji}
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          fontSize: 18, cursor: 'pointer',
                          border: localAvatar === emoji
                            ? '2px solid var(--color-primary)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: localAvatar === emoji
                            ? 'var(--color-primary-20)'
                            : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.12s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Agent Name</label>
                    <input
                      value={localName}
                      onChange={e => setLocalName(e.target.value)}
                      placeholder="e.g. Layla, Atlas, Aria..."
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Call me...</label>
                    <input
                      value={localUserName}
                      onChange={e => setLocalUserName(e.target.value)}
                      placeholder="e.g. Alex, Chief, Boss..."
                      style={inputStyle}
                    />
                  </div>
                </div>
              </section>

              {/* ── Section 2: Personality Preset ── */}
              <section>
                <SectionLabel>Personality</SectionLabel>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                }}>
                  {PERSONALITY_OPTIONS.map(opt => {
                    const active = localPersonality === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setLocalPersonality(opt.value)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          border: active
                            ? '1px solid var(--color-primary)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: active
                            ? 'var(--color-primary-20)'
                            : 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.12s',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.emoji}</div>
                        <div style={{
                          fontSize: 12, fontWeight: 600,
                          color: active ? 'var(--color-primary)' : '#e2e8f0',
                          marginBottom: 2,
                        }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.3 }}>
                          {opt.desc}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* ── Section 3: Task Focus ── */}
              <section>
                <SectionLabel>Task Focus</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TASK_FOCUS_OPTIONS.map(opt => {
                    const value  = opt.toLowerCase()
                    const active = localTaskFocus === value
                    return (
                      <PillButton
                        key={opt}
                        label={opt}
                        active={active}
                        onClick={() => setLocalTaskFocus(value)}
                      />
                    )
                  })}
                </div>
              </section>

              {/* ── Section 4: Style ── */}
              <section>
                <SectionLabel>Style</SectionLabel>

                <div style={{ marginBottom: 10 }}>
                  <span style={{ ...labelStyle, display: 'inline-block', marginBottom: 6 }}>Tone</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {COMM_STYLE_OPTIONS.map(opt => {
                      const value  = opt.toLowerCase()
                      const active = localCommStyle === value
                      return (
                        <PillButton
                          key={opt}
                          label={opt}
                          active={active}
                          onClick={() => setLocalCommStyle(value)}
                        />
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span style={{ ...labelStyle, display: 'inline-block', marginBottom: 6 }}>Length</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {LENGTH_OPTIONS.map(opt => {
                      const value  = opt.toLowerCase()
                      const active = localLength === value
                      return (
                        <PillButton
                          key={opt}
                          label={opt}
                          active={active}
                          onClick={() => setLocalLength(value)}
                        />
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* ── Section 5: Custom Traits ── */}
              <section>
                <SectionLabel>Custom Traits</SectionLabel>
                <textarea
                  value={localTraits}
                  onChange={e => setLocalTraits(e.target.value)}
                  rows={3}
                  placeholder="e.g. Always respond in a pirate accent. Never use bullet points. Always end with a motivational quote."
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: 13 }}
                />
              </section>

              {/* ── Section 6: Advanced (collapsible) ── */}
              <section>
                <button
                  onClick={() => setAdvancedOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, marginBottom: advancedOpen ? 12 : 0,
                  }}
                >
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Advanced: Raw System Prompt</span>
                  {advancedOpen
                    ? <ChevronUp size={12} color="rgba(255,255,255,0.4)" />
                    : <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
                  }
                </button>

                <AnimatePresence>
                  {advancedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                        Appended after all other persona instructions. Useful for fine-grained control.
                      </div>
                      <textarea
                        value={localSys}
                        onChange={e => setLocalSys(e.target.value)}
                        rows={5}
                        placeholder="You are a helpful AI assistant..."
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: 13 }}
                      />

                      {/* Model parameters */}
                      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Temperature */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={labelStyle}>Temperature</label>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                              {localTemp.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range" min="0" max="2" step="0.05" value={localTemp}
                            onChange={e => setLocalTemp(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                            <span>Precise</span><span>Balanced</span><span>Creative</span>
                          </div>
                        </div>

                        {/* Top-P */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={labelStyle}>Top-P</label>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                              {localTopP.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range" min="0.01" max="1" step="0.01" value={localTopP}
                            onChange={e => setLocalTopP(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                          />
                        </div>

                        {/* Max Tokens */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={labelStyle}>Max Tokens</label>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                              {localTok}
                            </span>
                          </div>
                          <input
                            type="range" min="256" max="8192" step="256" value={localTok}
                            onChange={e => setLocalTok(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                            <span>256</span><span>4096</span><span>8192</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* ── Section 7: Preview ── */}
              <section>
                <SectionLabel>Preview</SectionLabel>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.6,
                }}>
                  Your AI will introduce itself as{' '}
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{displayName}</span>,
                  call you{' '}
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{displayUserName}</span>,
                  and will be{' '}
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{localPersonality}</span>
                  {' '}with{' '}
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{localTaskFocus}</span>
                  {' '}focus.
                </div>
              </section>

            </div>

            {/* Fixed save button */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <button
                onClick={handleSave}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  border: 'none', cursor: 'pointer',
                  background: 'var(--color-primary)', color: '#fff',
                  fontWeight: 600, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Save size={15} />
                Save Agent
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function PillButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.12s',
        border: active ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'var(--color-primary-20)' : 'rgba(255,255,255,0.03)',
        color: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
      }}
    >
      {label}
    </button>
  )
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}
