import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Loader2, Copy, Check, Send } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { callProviderAPI } from '../../store/chatStore'
import { PROVIDERS } from '../../utils/providers'

function modelLabel(entry) {
  const provider = PROVIDERS[entry.providerId]
  const model = provider?.models.find(m => m.id === entry.modelId)
  return `${provider?.name || entry.providerId} / ${model?.name || entry.modelId}`
}

function ResultColumn({ side, model, state, onCopy, copied }) {
  const label = model ? modelLabel(model) : 'Model ' + side
  const isImage = state?.text?.startsWith('__IMAGE__')
  const imageUrl = isImage ? state.text.replace('__IMAGE__', '').replace('__END_IMAGE__', '') : null

  return (
    <div style={{
      flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column',
      borderRadius: 12, border: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
        fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
          background: 'var(--color-primary-10)', color: 'var(--color-primary)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {side}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </div>

      <div style={{ padding: 16, flex: 1, minHeight: 120, fontSize: 14, lineHeight: 1.65 }}>
        {!state ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            Select a model and run a prompt
          </div>
        ) : state.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...
          </div>
        ) : state.error ? (
          <div style={{ color: '#f87171', fontSize: 13, lineHeight: 1.6 }}>{state.error}</div>
        ) : isImage ? (
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', borderRadius: 10, display: 'block' }} />
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>{state.text}</div>
        )}
      </div>

      {state && !state.loading && !state.error && state.text && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onCopy(side, state.text)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
              border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-muted)',
            }}
          >
            {copied === side ? <Check size={12} /> : <Copy size={12} />}
            {copied === side ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  const { activeModels, providerKeys } = useAppStore()
  const [modelA, setModelA] = useState(activeModels[0] ? { providerId: activeModels[0].providerId, modelId: activeModels[0].modelId } : null)
  const [modelB, setModelB] = useState(activeModels[1] ? { providerId: activeModels[1].providerId, modelId: activeModels[1].modelId } : null)
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [resultA, setResultA] = useState(null)
  const [resultB, setResultB] = useState(null)
  const [copied, setCopied] = useState(null)

  const handleCopy = (side, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(side)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const parseValue = (val) => {
    if (!val) return null
    const [providerId, modelId] = val.split('|||')
    return { providerId, modelId }
  }

  const toValue = (sel) => (sel ? `${sel.providerId}|||${sel.modelId}` : '')

  const runOne = async (sel) => {
    return callProviderAPI({
      providerId: sel.providerId,
      modelId: sel.modelId,
      apiKey: providerKeys[sel.providerId] || '',
      messages: [{ role: 'user', content: prompt.trim() }],
    })
  }

  const handleCompare = async () => {
    const trimmed = prompt.trim()
    if (!trimmed || running) return
    if (!modelA || !modelB) {
      alert('Please select two models first')
      return
    }
    setRunning(true)
    setResultA({ loading: true })
    setResultB({ loading: true })

    const [a, b] = await Promise.allSettled([runOne(modelA), runOne(modelB)])

    setResultA(a.status === 'fulfilled'
      ? { text: a.value }
      : { error: a.reason?.message || 'Failed to get response.' })
    setResultB(b.status === 'fulfilled'
      ? { text: b.value }
      : { error: b.reason?.message || 'Failed to get response.' })

    setRunning(false)
  }

  const selectStyle = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <GitCompare size={22} style={{ color: 'var(--color-primary)' }} />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Compare Models</h1>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
          Run one prompt against two models side by side
        </p>
      </div>

      {activeModels.length < 2 ? (
        <div style={{
          padding: '32px 20px', borderRadius: 12, border: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)', textAlign: 'center', color: 'var(--text-muted)',
        }}>
          <GitCompare size={28} style={{ opacity: 0.4, marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 14 }}>Add at least two models to compare them.</p>
        </div>
      ) : (
        <>
          {/* Model selectors */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Model A
              </label>
              <select value={toValue(modelA)} onChange={e => setModelA(parseValue(e.target.value))} style={selectStyle}>
                {activeModels.map(m => (
                  <option key={`${m.providerId}|||${m.modelId}`} value={`${m.providerId}|||${m.modelId}`}>
                    {modelLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Model B
              </label>
              <select value={toValue(modelB)} onChange={e => setModelB(parseValue(e.target.value))} style={selectStyle}>
                {activeModels.map(m => (
                  <option key={`${m.providerId}|||${m.modelId}`} value={`${m.providerId}|||${m.modelId}`}>
                    {modelLabel(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt + run */}
          <div style={{ marginBottom: 20 }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter a prompt to run against both models..."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical',
                lineHeight: 1.6, fontFamily: 'inherit',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCompare}
              disabled={!prompt.trim() || running}
              className="btn-primary"
              style={{
                marginTop: 10, fontSize: 14,
                opacity: prompt.trim() && !running ? 1 : 0.5,
                cursor: prompt.trim() && !running ? 'pointer' : 'default',
              }}
            >
              {running
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Comparing...</>
                : <><Send size={15} /> Compare</>}
            </motion.button>
          </div>

          {/* Result columns */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <ResultColumn side="A" model={modelA} state={resultA} onCopy={handleCopy} copied={copied} />
            <ResultColumn side="B" model={modelB} state={resultB} onCopy={handleCopy} copied={copied} />
          </div>
        </>
      )}
    </div>
  )
}
