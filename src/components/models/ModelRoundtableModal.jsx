import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, Play, Square, X, Loader2, Check } from 'lucide-react'
import Modal from '../common/Modal'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS } from '../../utils/providers'
import { callProviderAPI } from '../../store/chatStore'

const STAGES = { SETUP: 'setup', RUNNING: 'running' }

export default function ModelRoundtableModal({ open, onClose }) {
  const { activeModels, providerKeys } = useAppStore()

  const [stage, setStage]         = useState(STAGES.SETUP)
  const [participants, setParts]  = useState([])   // model keys
  const [topic, setTopic]         = useState('')
  const [rounds, setRounds]       = useState(2)
  const [transcript, setTranscript] = useState([]) // { name, color, logo, content, thinking }
  const [userInput, setUserInput] = useState('')
  const [running, setRunning]     = useState(false)
  const stopRef = useRef(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [transcript])

  const allModels = activeModels.map(entry => {
    const provider = PROVIDERS[entry.providerId]
    const model    = provider?.models.find(m => m.id === entry.modelId)
    return { entry, provider, model, key: `${entry.providerId}:${entry.modelId}`, label: `${provider?.name} / ${model?.name}` }
  }).filter(m => m.model)

  const toggle = (key) => {
    setParts(p => p.includes(key) ? p.filter(k => k !== key) : p.length < 5 ? [...p, key] : p)
  }

  const partList = () => allModels.filter(m => participants.includes(m.key))

  // Build a transcript string the models can read
  const buildContext = (entries, topicText) => {
    let ctx = `You are participating in a group discussion with other AI models about: "${topicText}".\n\n`
    if (entries.length > 0) {
      ctx += `Here is the conversation so far:\n\n`
      for (const e of entries) {
        ctx += `${e.name}: ${e.content}\n\n`
      }
    }
    ctx += `Respond with your own perspective. Be concise (2-4 sentences). You may agree, disagree, or build on what others said. Address points other models made when relevant. Do NOT prefix your name.`
    return ctx
  }

  const runDiscussion = async (seedEntries = [], topicText = topic) => {
    setRunning(true)
    stopRef.current = false
    const models = partList()
    let entries = [...seedEntries]

    for (let r = 0; r < rounds; r++) {
      for (const m of models) {
        if (stopRef.current) { setRunning(false); return entries }
        const apiKey = providerKeys[m.entry.providerId] || ''
        // Add a thinking placeholder
        const placeholder = { name: m.model.name, provider: m.provider.name, color: m.provider.color, logo: m.provider.logo, content: '', thinking: true }
        setTranscript([...entries, placeholder])
        try {
          const ctx = buildContext(entries, topicText)
          const content = await callProviderAPI({
            providerId: m.entry.providerId,
            modelId: m.entry.modelId,
            apiKey,
            messages: [{ role: 'user', content: ctx }],
          })
          const entry = { name: m.model.name, provider: m.provider.name, color: m.provider.color, logo: m.provider.logo, content: content?.startsWith('__IMAGE__') ? '[image]' : content }
          entries = [...entries, entry]
          setTranscript([...entries])
        } catch (err) {
          const entry = { name: m.model.name, provider: m.provider.name, color: m.provider.color, logo: m.provider.logo, content: `(error: ${err.message})`, error: true }
          entries = [...entries, entry]
          setTranscript([...entries])
        }
      }
    }
    setRunning(false)
    return entries
  }

  const handleStart = async () => {
    if (!topic.trim() || participants.length < 2) return
    setStage(STAGES.RUNNING)
    setTranscript([])
    await runDiscussion([], topic)
  }

  const handleUserInject = async () => {
    if (!userInput.trim() || running) return
    const userEntry = { name: 'You', provider: '', color: '#e86c28', logo: '🧑', content: userInput.trim(), isUser: true }
    const updated = [...transcript.filter(t => !t.thinking), userEntry]
    setTranscript(updated)
    setUserInput('')
    await runDiscussion(updated, topic)
  }

  const handleStop = () => { stopRef.current = true; setRunning(false) }

  const reset = () => {
    setStage(STAGES.SETUP)
    setTranscript([])
    setRunning(false)
    stopRef.current = false
  }

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Roundtable — Models Chat With Each Other" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', height: 600 }}>

        {stage === STAGES.SETUP && (
          <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-primary-10)', border: '1px solid var(--color-primary-20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Group Discussion</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pick 2–5 models, give them a topic, and watch them debate. You can jump in anytime.</div>
              </div>
            </div>

            {/* Topic */}
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>Discussion Topic</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              rows={2}
              placeholder="e.g. What's the best programming language for beginners and why?"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 20 }}
            />

            {/* Rounds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Rounds</span>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setRounds(n)}
                  style={{
                    padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: rounds === n ? '1px solid var(--color-primary)' : '1px solid var(--border)',
                    background: rounds === n ? 'var(--color-primary-10)' : 'transparent',
                    color: rounds === n ? 'var(--color-primary)' : 'var(--text-secondary)',
                  }}>
                  {n}
                </button>
              ))}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>each model speaks {rounds}×</span>
            </div>

            {/* Participants */}
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
              Participants ({participants.length}/5)
            </label>
            {allModels.length < 2 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 10 }}>
                Add at least 2 models first (+ Add Model)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {allModels.map(m => {
                  const on = participants.includes(m.key)
                  return (
                    <button key={m.key} onClick={() => toggle(m.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        border: on ? `1px solid ${m.provider.color}50` : '1px solid var(--border-subtle)',
                        background: on ? `${m.provider.color}0c` : 'transparent',
                      }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, border: on ? `2px solid ${m.provider.color}` : '2px solid var(--border)', background: on ? m.provider.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {on && <Check size={12} color="#fff" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: 14 }}>{m.provider.logo}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {stage === STAGES.RUNNING && (
          <div ref={scrollRef} style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0 8px', borderBottom: '1px solid var(--border-subtle)' }}>
              💬 Topic: <strong style={{ color: 'var(--text-primary)' }}>{topic}</strong>
            </div>
            {transcript.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: 10, flexDirection: t.isUser ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${t.color}20`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {t.logo}
                </div>
                <div style={{ maxWidth: '78%' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.color, marginBottom: 3, textAlign: t.isUser ? 'right' : 'left' }}>{t.name}</div>
                  <div style={{
                    padding: '9px 13px', borderRadius: t.isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: t.isUser ? 'var(--color-primary)' : 'var(--bg-elevated)',
                    border: t.isUser ? 'none' : '1px solid var(--border)',
                    color: t.isUser ? '#fff' : (t.error ? '#f87171' : 'var(--text-primary)'),
                    fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {t.thinking ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : t.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px', flexShrink: 0 }}>
          {stage === STAGES.SETUP ? (
            <button onClick={handleStart} disabled={!topic.trim() || participants.length < 2}
              style={{
                width: '100%', padding: 12, borderRadius: 12, border: 'none',
                cursor: (topic.trim() && participants.length >= 2) ? 'pointer' : 'not-allowed',
                background: (topic.trim() && participants.length >= 2) ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                color: (topic.trim() && participants.length >= 2) ? '#fff' : 'rgba(255,255,255,0.3)',
                fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              <Play size={15} /> Start Discussion
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserInject() } }}
                rows={1}
                placeholder={running ? 'Models are discussing...' : 'Jump in — add your thoughts...'}
                disabled={running}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
              />
              {running ? (
                <button onClick={handleStop} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <Square size={14} /> Stop
                </button>
              ) : (
                <>
                  <button onClick={handleUserInject} disabled={!userInput.trim()}
                    style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: userInput.trim() ? 'pointer' : 'default', background: userInput.trim() ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)', color: userInput.trim() ? '#fff' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Send size={16} />
                  </button>
                  <button onClick={reset} title="New discussion" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                    New
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
