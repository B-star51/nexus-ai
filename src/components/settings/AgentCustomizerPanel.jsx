import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Save } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const PRESETS = [
  { label: "Assistant",  prompt: "You are a helpful, harmless, and honest AI assistant." },
  { label: "Coder",      prompt: "You are an expert software engineer. Provide clear, well-commented code with explanations. Prefer modern best practices." },
  { label: "Researcher", prompt: "You are a thorough research assistant. Provide detailed, well-cited answers. When uncertain, say so." },
  { label: "Creative",   prompt: "You are a creative writing partner with a flair for vivid descriptions and engaging narratives." },
  { label: "Teacher",    prompt: "You are a patient, encouraging teacher who breaks complex topics into simple steps with helpful examples." },
  { label: "Analyst",    prompt: "You are a sharp data analyst and strategist. Think step-by-step, challenge assumptions, and provide structured analysis." },
]

export default function AgentCustomizerPanel({ open, onClose }) {
  const {
    agentName, agentSystemPrompt, agentTemperature, agentMaxTokens, agentTopP,
    setAgentName, setAgentSystemPrompt, setAgentTemperature, setAgentMaxTokens, setAgentTopP,
  } = useAppStore()

  const [localName, setLocalName] = useState(agentName)
  const [localSys,  setLocalSys]  = useState(agentSystemPrompt)
  const [localTemp, setLocalTemp] = useState(agentTemperature)
  const [localTok,  setLocalTok]  = useState(agentMaxTokens)
  const [localTopP, setLocalTopP] = useState(agentTopP)

  const handleSave = () => {
    setAgentName(localName)
    setAgentSystemPrompt(localSys)
    setAgentTemperature(localTemp)
    setAgentMaxTokens(localTok)
    setAgentTopP(localTopP)
    onClose()
  }

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
              width: 'min(420px, 100vw)',
              background: '#111118',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
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
              }}>
                <Bot size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Agent Customizer</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Personalize your AI behavior</div>
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

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>

              {/* Agent Name */}
              <div>
                <label style={labelStyle}>Agent Name</label>
                <input
                  value={localName}
                  onChange={e => setLocalName(e.target.value)}
                  placeholder="e.g. NexusAI, Atlas, Aria..."
                  style={inputStyle}
                />
              </div>

              {/* System Prompt */}
              <div>
                <label style={labelStyle}>System Prompt</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setLocalSys(p.prompt)}
                      style={{
                        padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                        border: localSys === p.prompt ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.12)',
                        background: localSys === p.prompt ? 'var(--color-primary-20)' : 'transparent',
                        color: localSys === p.prompt ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={localSys}
                  onChange={e => setLocalSys(e.target.value)}
                  rows={5}
                  placeholder="You are a helpful AI assistant..."
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: 13 }}
                />
              </div>

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

            {/* Save button */}
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
                Save Agent Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
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
