import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Send, Check, ChevronDown, ChevronUp, Trophy, Copy, Loader2, Users, X } from 'lucide-react'
import Modal from '../common/Modal'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS } from '../../utils/providers'

const STAGES = { SETUP: 'setup', GENERATING: 'generating', VOTING: 'voting', RESULTS: 'results' }

export default function ModelVotingModal({ open, onClose }) {
  const { activeModels, providerKeys } = useAppStore()

  const [stage, setStage]         = useState(STAGES.SETUP)
  const [prompt, setPrompt]       = useState('')
  const [experts, setExperts]     = useState([])
  const [voters, setVoters]       = useState([])
  const [answers, setAnswers]     = useState([])      // { entry, content, index }
  const [votes, setVotes]         = useState({})      // { answerIndex: count }
  const [voteLogs, setVoteLogs]   = useState([])      // { voterName, chosenIndex, reason }
  const [expanded, setExpanded]   = useState({})
  const [copied, setCopied]       = useState(false)
  const abortRef                  = useRef(null)

  const allModels = activeModels.map(entry => {
    const provider = PROVIDERS[entry.providerId]
    const model    = provider?.models.find(m => m.id === entry.modelId)
    return { entry, provider, model, label: `${provider?.name} / ${model?.name}` }
  }).filter(m => m.model)

  const toggleExpert = (key) => {
    setExperts(e => e.includes(key) ? e.filter(k => k !== key) : e.length < 8 ? [...e, key] : e)
  }
  const toggleVoter = (key) => {
    setVoters(v => v.includes(key) ? v.filter(k => k !== key) : [...v, key])
  }

  const modelKey = (entry) => `${entry.providerId}:${entry.modelId}`

  const handleStart = async () => {
    if (!prompt.trim() || experts.length < 1) return

    setStage(STAGES.GENERATING)
    setAnswers([])
    setVotes({})
    setVoteLogs([])

    const expertEntries = allModels.filter(m => experts.includes(modelKey(m.entry)))
    const voterEntries  = allModels.filter(m => voters.includes(modelKey(m.entry)))

    // Generate expert answers in parallel
    const results = await Promise.allSettled(
      expertEntries.map(async ({ entry, provider, model }, idx) => {
        const apiKey  = providerKeys[entry.providerId] || ''
        const content = await callModel(entry.providerId, entry.modelId, apiKey, [
          { role: 'user', content: prompt },
        ])
        return { entry, provider, model, content, index: idx }
      })
    )

    const successAnswers = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)

    setAnswers(successAnswers)
    setStage(STAGES.VOTING)

    if (voterEntries.length === 0 || successAnswers.length < 2) {
      setStage(STAGES.RESULTS)
      return
    }

    // Voters pick the best answer sequentially
    const voteMap = {}
    const logs    = []

    for (const { entry, provider, model } of voterEntries) {
      const apiKey   = providerKeys[entry.providerId] || ''
      const numbered = successAnswers.map((a, i) => `Answer #${i + 1} (by ${a.provider?.name} ${a.model?.name}):\n${a.content}`).join('\n\n---\n\n')
      const votingPrompt = `You are a fair evaluator. Here are ${successAnswers.length} answers to the question: "${prompt}"\n\n${numbered}\n\nWhich answer is BEST? Reply with ONLY a JSON object like: {"choice": 1, "reason": "brief explanation"}`

      try {
        const raw    = await callModel(entry.providerId, entry.modelId, apiKey, [
          { role: 'user', content: votingPrompt },
        ])
        const match  = raw.match(/\{[\s\S]*\}/)
        const parsed = match ? JSON.parse(match[0]) : null
        const idx    = parsed ? Math.min(Math.max(parseInt(parsed.choice) - 1, 0), successAnswers.length - 1) : 0
        const reason = parsed?.reason || 'Selected as best answer'

        voteMap[idx] = (voteMap[idx] || 0) + 1
        logs.push({ voterName: `${provider?.name} ${model?.name}`, chosenIndex: idx, reason })
        setVotes({ ...voteMap })
        setVoteLogs([...logs])
      } catch {
        // Voter failed, skip
      }
    }

    setStage(STAGES.RESULTS)
  }

  const rankedAnswers = [...answers].sort((a, b) => (votes[b.index] || 0) - (votes[a.index] || 0))

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleReset = () => {
    setStage(STAGES.SETUP)
    setAnswers([])
    setVotes({})
    setVoteLogs([])
    setExpanded({})
  }

  return (
    <Modal open={open} onClose={() => { handleReset(); onClose() }} title="Make Models Vote" size="xl">
      <div style={{ padding: '0 24px 24px', minHeight: 400 }}>
        {/* SETUP STAGE */}
        {stage === STAGES.SETUP && (
          <div style={{ paddingTop: 20 }}>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Ask multiple AI models the same question, then let another set of models vote on the best answer.
            </p>

            {/* Prompt */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Question / Prompt
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="What should the AI experts answer? e.g. 'Explain quantum entanglement in simple terms'"
                className="input-base"
                rows={3}
                style={{ resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {allModels.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                No models configured. Add API keys in Settings to use this feature.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Expert panel */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Expert Panel (answer the question) — max 8
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {allModels.map(({ entry, provider, model }) => {
                      const key     = modelKey(entry)
                      const checked = experts.includes(key)
                      return (
                        <button
                          key={key}
                          onClick={() => toggleExpert(key)}
                          style={{
                            display:         'flex',
                            alignItems:      'center',
                            gap:             8,
                            padding:         '8px 10px',
                            borderRadius:    7,
                            border:          checked ? '1px solid var(--color-primary-20)' : '1px solid var(--border-subtle)',
                            backgroundColor: checked ? 'var(--color-primary-10)' : 'transparent',
                            cursor:          'pointer',
                            textAlign:       'left',
                            transition:      'all 120ms',
                            width:           '100%',
                          }}
                        >
                          <span
                            style={{
                              width: 20, height: 20, borderRadius: 5,
                              backgroundColor: `${provider?.color}20`,
                              color: provider?.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '8px', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0,
                            }}
                          >
                            {provider?.logo}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: checked ? 'var(--color-primary)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {model?.name}
                          </span>
                          {checked && <Check size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Voter panel */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Voting Panel (pick the best answer)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {allModels.map(({ entry, provider, model }) => {
                      const key     = modelKey(entry)
                      const checked = voters.includes(key)
                      return (
                        <button
                          key={key}
                          onClick={() => toggleVoter(key)}
                          style={{
                            display:         'flex',
                            alignItems:      'center',
                            gap:             8,
                            padding:         '8px 10px',
                            borderRadius:    7,
                            border:          checked ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border-subtle)',
                            backgroundColor: checked ? 'rgba(99,102,241,0.08)' : 'transparent',
                            cursor:          'pointer',
                            textAlign:       'left',
                            transition:      'all 120ms',
                            width:           '100%',
                          }}
                        >
                          <span
                            style={{
                              width: 20, height: 20, borderRadius: 5,
                              backgroundColor: `${provider?.color}20`,
                              color: provider?.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '8px', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0,
                            }}
                          >
                            {provider?.logo}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: checked ? '#818cf8' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {model?.name}
                          </span>
                          {checked && <Users size={12} style={{ color: '#818cf8', flexShrink: 0 }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={handleStart}
                disabled={!prompt.trim() || experts.length < 1}
                style={{ gap: 8 }}
              >
                <Zap size={15} /> Start Voting Session
              </button>
            </div>
          </div>
        )}

        {/* GENERATING + VOTING STAGE */}
        {(stage === STAGES.GENERATING || stage === STAGES.VOTING) && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600 }}>
                {stage === STAGES.GENERATING ? 'Generating expert answers...' : 'Models are voting...'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>"{prompt.slice(0, 120)}{prompt.length > 120 ? '...' : ''}"</p>
            </div>

            {/* Answers so far */}
            {answers.map((ans, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-surface)',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>#{i + 1}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {ans.provider?.name} / {ans.model?.name}
                  </span>
                  {votes[ans.index] !== undefined && (
                    <motion.span
                      key={votes[ans.index]}
                      initial={{ scale: 1.4, color: '#fbbf24' }}
                      animate={{ scale: 1, color: '#4ade80' }}
                      style={{ fontSize: '12px', fontWeight: 700, marginLeft: 'auto' }}
                    >
                      {votes[ans.index] || 0} vote{votes[ans.index] !== 1 ? 's' : ''}
                    </motion.span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {ans.content}
                </p>
              </motion.div>
            ))}

            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <Loader2 size={16} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {stage === STAGES.GENERATING
                  ? `Waiting for ${experts.length} expert${experts.length > 1 ? 's' : ''} to respond...`
                  : `${Object.values(votes).reduce((a, b) => a + b, 0)} / ${voters.length} votes cast...`
                }
              </span>
            </div>
          </div>
        )}

        {/* RESULTS STAGE */}
        {stage === STAGES.RESULTS && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Results</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {Object.values(votes).reduce((a, b) => a + b, 0)} total votes across {answers.length} answers
                </p>
              </div>
              <button className="btn-secondary" onClick={handleReset} style={{ fontSize: '12px' }}>
                New Session
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rankedAnswers.map((ans, rank) => {
                const voteCount = votes[ans.index] || 0
                const isWinner  = rank === 0 && voteCount > 0
                const logsForAnswer = voteLogs.filter(l => l.chosenIndex === ans.index)
                const isExpandedState = expanded[ans.index]

                return (
                  <motion.div
                    key={ans.index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rank * 0.05 }}
                    style={{
                      borderRadius:    12,
                      border:          isWinner ? '1px solid var(--color-primary-30)' : '1px solid var(--border)',
                      backgroundColor: isWinner ? 'var(--color-primary-10)' : 'var(--bg-surface)',
                      overflow:        'hidden',
                    }}
                  >
                    {/* Answer header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                      {isWinner && <Trophy size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />}
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isWinner ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                        #{rank + 1}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {ans.provider?.name} / {ans.model?.name}
                      </span>
                      <motion.span
                        key={voteCount}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        style={{
                          marginLeft:      'auto',
                          fontSize:        '12px',
                          fontWeight:      700,
                          color:           isWinner ? '#4ade80' : 'var(--text-muted)',
                          backgroundColor: isWinner ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255,255,255,0.05)',
                          border:          `1px solid ${isWinner ? 'rgba(74,222,128,0.25)' : 'var(--border-subtle)'}`,
                          padding:         '2px 8px',
                          borderRadius:    20,
                        }}
                      >
                        {voteCount} vote{voteCount !== 1 ? 's' : ''}
                      </motion.span>
                    </div>

                    {/* Answer body */}
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                        {ans.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        className="btn-ghost"
                        onClick={() => handleCopy(ans.content)}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        <Copy size={13} />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      {logsForAnswer.length > 0 && (
                        <button
                          className="btn-ghost"
                          onClick={() => setExpanded(e => ({ ...e, [ans.index]: !e[ans.index] }))}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          {isExpandedState ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {isExpandedState ? 'Hide' : 'Show'} voter reasoning
                        </button>
                      )}
                    </div>

                    {/* Voter reasoning accordion */}
                    <AnimatePresence>
                      {isExpandedState && logsForAnswer.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden', borderTop: '1px solid var(--border-subtle)' }}
                        >
                          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {logsForAnswer.map((log, i) => (
                              <div key={i} style={{ fontSize: '12px', lineHeight: 1.5 }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{log.voterName}:</span>
                                {' '}
                                <span style={{ color: 'var(--text-secondary)' }}>{log.reason}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

async function callModel(providerId, modelId, apiKey, messages) {
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000))
    return `[Demo] This is a simulated response from ${providerId}/${modelId}. Add an API key to get real answers.`
  }

  const baseUrls = {
    openai:   'https://api.openai.com/v1',
    groq:     'https://api.groq.com/openai/v1',
    together: 'https://api.together.xyz/v1',
    nvidia:   'https://integrate.api.nvidia.com/v1',
    mistral:  'https://api.mistral.ai/v1',
  }

  if (providerId === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: modelId, max_tokens: 1024, messages }),
    })
    const data = await res.json()
    return data.content?.[0]?.text || ''
  }

  if (providerId === 'google') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }),
    })
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  if (baseUrls[providerId]) {
    const res = await fetch(`${baseUrls[providerId]}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages, max_tokens: 1024 }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }

  if (providerId === 'huggingface') {
    const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages, max_tokens: 1024 }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }

  throw new Error(`Unsupported provider: ${providerId}`)
}
