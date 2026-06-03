import { useState } from 'react'
import { Mail, Sparkles, Copy, Check, AlertTriangle, Loader2, ArrowRight } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { callProviderAPI } from '../../store/chatStore'
import { PROVIDERS } from '../../utils/providers'

// ─── Response parser ──────────────────────────────────────────────
const HEADERS = ['URGENCY', 'CATEGORY', 'SUMMARY', 'KEY POINTS', 'WATCH OUT FOR', 'DRAFT REPLY']

function parseResponse(text) {
  if (!text) return null
  // Build a regex that finds each header at a line start
  const sections = {}
  // Find index of each header
  const positions = []
  for (const h of HEADERS) {
    const re = new RegExp(`(^|\\n)\\s*${h.replace(/ /g, '\\s*')}\\s*:`, 'i')
    const m = re.exec(text)
    if (m) positions.push({ header: h, index: m.index + (m[1] ? m[1].length : 0), matchLen: m[0].length - (m[1] ? m[1].length : 0) })
  }
  if (!positions.length) return null
  positions.sort((a, b) => a.index - b.index)
  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i]
    const next = positions[i + 1]
    const start = cur.index + cur.matchLen
    const end = next ? next.index : text.length
    sections[cur.header] = text.slice(start, end).trim()
  }
  return sections
}

function parseList(block) {
  if (!block) return []
  return block
    .split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

function urgencyColors(urgency) {
  const t = (urgency || '').toLowerCase()
  if (urgency?.includes('🔴') || t.includes('urgent')) return { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.4)', text: '#f87171' }
  if (urgency?.includes('🟡') || t.includes('normal')) return { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' }
  if (urgency?.includes('🟢') || t.includes('low'))    return { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.4)', text: '#4ade80' }
  return { bg: 'var(--color-primary-10)', border: 'var(--color-primary-30)', text: 'var(--color-primary)' }
}

export default function EmailPage() {
  const {
    selectedProviderId, selectedModelId, providerKeys,
    emailRules, emailSignature, emailBannerDataUrl, emailTone,
    businessMode, company, setActivePage,
  } = useAppStore()

  const [emailText, setEmailText] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [parsed, setParsed]       = useState(null)
  const [raw, setRaw]             = useState('')
  const [copied, setCopied]       = useState('')

  const provider = selectedProviderId ? PROVIDERS[selectedProviderId] : null
  const model    = provider?.models?.find(m => m.id === selectedModelId)
  const hasModel = Boolean(selectedProviderId && selectedModelId)

  const buildPrompt = () => {
    const repAs = businessMode && company.name ? `, representing ${company.name}` : ''
    return `You are an expert email assistant. Analyse the email below and respond in EXACTLY this format using these section headers:

URGENCY: <one of: 🔴 Urgent | 🟡 Normal | 🟢 Low> — <short reason>
CATEGORY: <e.g. Customer support, Sales enquiry, Internal, Complaint, etc.>
SUMMARY: <2-3 sentence summary of what they want>
KEY POINTS:
- <point>
- <point>
WATCH OUT FOR:
- <anything matching the user's rules, deadlines, sensitive issues, or things needing care>
DRAFT REPLY:
<a complete, ready-to-send reply in a ${emailTone} tone${repAs}>

Rules to follow when analysing and replying:
${emailRules || 'Be helpful, accurate, and professional.'}
${emailSignature ? `Sign the reply off with: ${emailSignature}` : ''}

Email to analyse:
"""
${emailText}
"""`
  }

  const handleAnalyze = async () => {
    if (!emailText.trim() || !hasModel || loading) return
    setLoading(true)
    setError('')
    setParsed(null)
    setRaw('')
    try {
      const apiKey = providerKeys?.[selectedProviderId] || ''
      const response = await callProviderAPI({
        providerId: selectedProviderId,
        modelId: selectedModelId,
        apiKey,
        messages: [{ role: 'user', content: buildPrompt() }],
      })
      const sections = parseResponse(response)
      if (sections && sections['DRAFT REPLY']) {
        setParsed(sections)
      } else {
        setRaw(response)
      }
    } catch (err) {
      setError(err.message || 'Failed to analyse the email.')
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(c => (c === key ? '' : c)), 1500)
    } catch { /* ignore */ }
  }

  const copyAsHtml = async (replyText) => {
    const paragraphs = replyText
      .split('\n')
      .map(line => line.trim() ? `<p style="margin:0 0 10px">${escapeHtml(line)}</p>` : '<br/>')
      .join('')
    const bannerHtml = emailBannerDataUrl
      ? `<img src="${emailBannerDataUrl}" style="max-width:100%;border-radius:8px;margin-bottom:12px" />`
      : ''
    const html = `<div>${bannerHtml}${paragraphs}</div>`
    try {
      const blob = new Blob([html], { type: 'text/html' })
      const textBlob = new Blob([replyText], { type: 'text/plain' })
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
      ])
      setCopied('html')
      setTimeout(() => setCopied(c => (c === 'html' ? '' : c)), 1500)
    } catch {
      // Fallback to plain text
      copyText(replyText, 'html')
    }
  }

  const reply = parsed?.['DRAFT REPLY'] || ''

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-primary-10)', border: '1px solid var(--color-primary-30)',
          }}>
            <Mail size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Email Assistant</h1>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          Paste an email — get urgency triage, key points, and a ready-to-send reply.
        </p>

        {/* Model indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '10px 14px', borderRadius: 10, marginBottom: 16, flexWrap: 'wrap',
          border: hasModel ? '1px solid var(--border-subtle)' : '1px solid rgba(251,191,36,0.3)',
          background: hasModel ? 'var(--bg-surface)' : 'rgba(251,191,36,0.06)',
        }}>
          {hasModel ? (
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              Using: <strong style={{ color: 'var(--text-primary)' }}>{provider?.name}</strong> / {model?.name || selectedModelId}
            </span>
          ) : (
            <>
              <span style={{ fontSize: 12.5, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> Select a model in Chat first
              </span>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setActivePage('chat')}>
                Go to Chat <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>

        {/* Email input */}
        <textarea
          value={emailText}
          onChange={e => setEmailText(e.target.value)}
          placeholder="Paste the email you received here..."
          rows={10}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, boxSizing: 'border-box',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
          }}
        />

        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={!emailText.trim() || !hasModel || loading}
          style={{
            marginTop: 14, fontSize: 14, padding: '11px 20px',
            opacity: (!emailText.trim() || !hasModel || loading) ? 0.55 : 1,
            cursor: (!emailText.trim() || !hasModel || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
          {loading ? 'Analysing email...' : 'Analyze & Draft Reply'}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, padding: '12px 14px', borderRadius: 10,
            border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)',
            color: '#f87171', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Loading spinner state */}
        {loading && (
          <div style={{
            marginTop: 20, display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--text-secondary)', fontSize: 13,
          }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
            Analysing email...
          </div>
        )}

        {/* Parsed result */}
        {parsed && !loading && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Urgency + Category row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {parsed['URGENCY'] && (() => {
                const c = urgencyColors(parsed['URGENCY'])
                return (
                  <span style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
                    background: c.bg, border: `1px solid ${c.border}`, color: c.text,
                  }}>
                    {parsed['URGENCY']}
                  </span>
                )
              })()}
              {parsed['CATEGORY'] && (
                <span style={{
                  padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
                }}>
                  {parsed['CATEGORY']}
                </span>
              )}
            </div>

            {/* Summary */}
            {parsed['SUMMARY'] && (
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>Summary</div>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{parsed['SUMMARY']}</p>
              </div>
            )}

            {/* Key Points */}
            {parseList(parsed['KEY POINTS']).length > 0 && (
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>Key Points</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {parseList(parsed['KEY POINTS']).map((p, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Watch Out For — amber callout */}
            {parseList(parsed['WATCH OUT FOR']).length > 0 && (
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.07)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={13} /> Watch Out For
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {parseList(parsed['WATCH OUT FOR']).map((p, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Draft Reply */}
            {reply && (
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid var(--color-primary-30)', background: 'var(--bg-surface)',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>Draft Reply</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => copyText(reply, 'reply')}>
                      {copied === 'reply' ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy Reply</>}
                    </button>
                    <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => copyAsHtml(reply)}>
                      {copied === 'html' ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy as HTML</>}
                    </button>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  {emailBannerDataUrl && (
                    <img
                      src={emailBannerDataUrl}
                      alt="Reply banner"
                      style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 14, display: 'block' }}
                    />
                  )}
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {reply}
                  </div>
                  {emailBannerDataUrl && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                      Banner added when pasted into your email client (use Copy as HTML).
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Raw fallback */}
        {raw && !loading && (
          <div style={{
            marginTop: 24, padding: 16, borderRadius: 12,
            border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
            fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap',
          }}>
            {raw}
          </div>
        )}
      </div>
    </div>
  )
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
