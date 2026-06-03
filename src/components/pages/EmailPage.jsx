import { useState, useEffect, useCallback } from 'react'
import { Mail, Sparkles, Copy, Check, AlertTriangle, Loader2, ArrowRight, Inbox, ClipboardList, RefreshCw, Send, Plug } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { callProviderAPI } from '../../store/chatStore'
import { PROVIDERS } from '../../utils/providers'
import { isConfigured, checkStatus, fetchEmails, refreshInbox, sendReply } from '../../utils/emailServer'

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

// Solid dot colour by triage level
function levelColor(level) {
  const l = (level || '').toLowerCase()
  if (l === 'urgent') return '#f87171'
  if (l === 'low')    return '#4ade80'
  return '#fbbf24' // normal / default
}

export default function EmailPage() {
  const {
    selectedProviderId, selectedModelId, providerKeys,
    emailRules, emailSignature, emailBannerDataUrl, emailTone,
    businessMode, company, setActivePage,
  } = useAppStore()

  const [mode, setMode]           = useState(isConfigured() ? 'live' : 'paste')
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
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          Triage your inbox with AI — urgency, key points, and ready-to-send replies.
        </p>

        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'live',  label: 'Live Inbox',  icon: Inbox },
            { id: 'paste', label: 'Paste Email', icon: ClipboardList },
          ].map(({ id, label, icon: Icon }) => {
            const active = mode === id
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  background: active ? 'var(--color-primary-10)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                  transition: 'all 150ms',
                }}
              >
                <Icon size={15} /> {label}
              </button>
            )
          })}
        </div>

        {mode === 'live' && <LiveInbox />}

        {mode === 'paste' && (<>
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
        </>)}
      </div>
    </div>
  )
}

// Build the reply HTML exactly like paste-mode's copyAsHtml (banner prepended if set)
function buildReplyHtml(replyText, bannerDataUrl) {
  const paragraphs = replyText
    .split('\n')
    .map(line => line.trim() ? `<p style="margin:0 0 10px">${escapeHtml(line)}</p>` : '<br/>')
    .join('')
  const bannerHtml = bannerDataUrl
    ? `<img src="${bannerDataUrl}" style="max-width:100%;border-radius:8px;margin-bottom:12px" />`
    : ''
  return `<div>${bannerHtml}${paragraphs}</div>`
}

// ─── Live Inbox ───────────────────────────────────────────────────
function LiveInbox() {
  const { emailServerUrl, emailServerToken, setEmailServerUrl, setEmailServerToken } = useAppStore()

  const [status, setStatus]       = useState(null)
  const [emails, setEmails]       = useState([])
  const [loading, setLoading]     = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState('')
  const [connecting, setConnecting] = useState(false)
  const [expandedUid, setExpandedUid] = useState(null)

  const load = useCallback(async () => {
    if (!isConfigured()) return
    setLoading(true)
    setError('')
    try {
      const st = await checkStatus()
      setStatus(st)
      const list = await fetchEmails()
      setEmails(list)
    } catch (err) {
      setError(err.message || 'Failed to connect to the email server.')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleConnect = async () => {
    if (!emailServerUrl || !emailServerToken || connecting) return
    setConnecting(true)
    setError('')
    try {
      const st = await checkStatus()
      setStatus(st)
      const list = await fetchEmails()
      setEmails(list)
    } catch (err) {
      setError(err.message || 'Could not connect. Check the URL and token.')
      setStatus(null)
    } finally {
      setConnecting(false)
    }
  }

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    setError('')
    try {
      await refreshInbox()
      const list = await fetchEmails()
      setEmails(list)
    } catch (err) {
      setError(err.message || 'Refresh failed.')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDisconnect = () => {
    setEmailServerUrl('')
    setEmailServerToken('')
    setStatus(null)
    setEmails([])
    setError('')
  }

  const markReplied = (uid) => {
    setEmails(list => list.map(e => e.uid === uid ? { ...e, replied: true } : e))
  }

  // ── Not configured: connect empty state ──
  if (!isConfigured()) {
    return (
      <div style={{
        padding: '28px 22px', borderRadius: 14, textAlign: 'center',
        border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-primary-10)', border: '1px solid var(--color-primary-30)',
        }}>
          <Plug size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Connect your mailbox</h2>
        <p style={{ margin: '0 auto 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 460 }}>
          Connect the NexusAI Email Server to read and reply to your real inbox.
          It runs on your computer or a host you control.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Server URL</span>
            <input
              type="text" value={emailServerUrl}
              onChange={e => setEmailServerUrl(e.target.value)}
              placeholder="http://localhost:8787"
              style={inboxInputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Access Token</span>
            <input
              type="password" value={emailServerToken}
              onChange={e => setEmailServerToken(e.target.value)}
              placeholder="Bearer token"
              style={{ ...inboxInputStyle, fontFamily: 'monospace' }}
            />
          </label>

          <button
            className="btn-primary"
            onClick={handleConnect}
            disabled={!emailServerUrl || !emailServerToken || connecting}
            style={{
              fontSize: 13.5, justifyContent: 'center', marginTop: 2,
              opacity: (!emailServerUrl || !emailServerToken || connecting) ? 0.55 : 1,
              cursor: (!emailServerUrl || !emailServerToken || connecting) ? 'not-allowed' : 'pointer',
            }}
          >
            {connecting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plug size={15} />}
            {connecting ? 'Connecting...' : 'Connect'}
          </button>

          {error && (
            <div style={{ fontSize: 12.5, color: '#f87171', lineHeight: 1.5 }}>{error}</div>
          )}
        </div>

        <p style={{ margin: '20px auto 0', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 440 }}>
          Don't have the server running? See the <strong>email-server/README.md</strong> in your project to set it up in 5 minutes.
        </p>
      </div>
    )
  }

  // ── Loading first fetch ──
  if (loading && !emails.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13, padding: '32px 0', justifyContent: 'center' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        Loading your inbox...
      </div>
    )
  }

  // ── Configured + connected ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Inbox</h2>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{emails.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {status && (
            <span style={{ fontSize: 11.5, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}>
              ● <span style={{ color: 'var(--text-muted)' }}>Connected to {status.provider}/{status.model}</span>
            </span>
          )}
          <button className="btn-secondary" onClick={handleRefresh} disabled={refreshing} style={{ fontSize: 12 }}>
            <RefreshCw size={13} style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleDisconnect}
            style={{ fontSize: 11.5, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
          >
            Disconnect
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)',
          color: '#f87171', fontSize: 12.5,
        }}>
          {error}
        </div>
      )}

      {/* Email list */}
      {emails.length === 0 ? (
        <div style={{
          padding: '32px 20px', textAlign: 'center', borderRadius: 12,
          border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
          fontSize: 13, color: 'var(--text-muted)',
        }}>
          No new emails. The server checks every minute — or hit Refresh.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {emails.map(email => (
            <EmailCard
              key={email.uid}
              email={email}
              expanded={expandedUid === email.uid}
              onToggle={() => setExpandedUid(u => (u === email.uid ? null : email.uid))}
              onReplied={() => markReplied(email.uid)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmailCard({ email, expanded, onToggle, onReplied }) {
  const { emailBannerDataUrl } = useAppStore()
  const triage = email.triage || {}

  const [draft, setDraft]     = useState(triage.draft || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [copied, setCopied]   = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => { setDraft(triage.draft || '') }, [triage.draft])

  const dot = levelColor(triage.level)
  const keyPoints = parseList(triage.keyPoints)
  const watchOut  = parseList(triage.watchOut).filter(p => {
    const t = p.toLowerCase()
    return t && t !== 'nothing' && !t.startsWith('nothing ')
  })

  const dateLabel = (() => {
    if (!email.date) return ''
    const d = new Date(email.date)
    if (isNaN(d)) return ''
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  })()

  const handleSend = async () => {
    if (!draft.trim() || sending) return
    setSending(true)
    setSendError('')
    try {
      const html = buildReplyHtml(draft, emailBannerDataUrl)
      await sendReply(email.uid, draft, html)
      setSent(true)
      onReplied()
    } catch (err) {
      setSendError(err.message || 'Failed to send reply.')
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  const replied = email.replied || sent

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: expanded ? '1px solid var(--color-primary-30)' : '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
    }}>
      {/* Card header — clickable */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Urgency dot */}
        <span style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5,
          background: dot, boxShadow: `0 0 6px ${dot}66`,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: email.unread ? 700 : 500 }}>
              {email.fromName || email.from}
            </span>
            {triage.category && (
              <span style={{
                padding: '2px 8px', borderRadius: 99, fontSize: 10.5, fontWeight: 600,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)',
              }}>
                {triage.category}
              </span>
            )}
            {replied && (
              <span style={{ fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Check size={12} /> Replied
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{dateLabel}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap' }}>
            {email.subject || '(no subject)'}
          </div>
          {(triage.summary || email.preview) && (
            <div style={{
              fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: expanded ? 'normal' : 'nowrap',
            }}>
              {triage.summary || email.preview}
            </div>
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {triage.error && (
            <div style={{
              padding: '10px 12px', borderRadius: 8, fontSize: 12,
              border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.07)', color: '#f87171',
            }}>
              Triage failed: {triage.error}
            </div>
          )}

          {/* Key Points */}
          {keyPoints.length > 0 && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Key Points</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {keyPoints.map((p, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Watch out for — amber */}
          {watchOut.length > 0 && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.07)',
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} /> Watch out for
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {watchOut.map((p, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Draft reply */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: 8 }}>Draft Reply</div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={6}
              placeholder="Write your reply..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10, boxSizing: 'border-box',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
                resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="btn-primary"
                onClick={handleSend}
                disabled={!draft.trim() || sending || sent}
                style={{
                  fontSize: 12.5,
                  opacity: (!draft.trim() || sending || sent) ? 0.6 : 1,
                  cursor: (!draft.trim() || sending || sent) ? 'not-allowed' : 'pointer',
                }}
              >
                {sent ? <><Check size={13} /> Sent</> :
                  sending ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> :
                  <><Send size={13} /> Send Reply</>}
              </button>
              <button className="btn-secondary" onClick={handleCopy} style={{ fontSize: 12.5 }}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
              {sendError && <span style={{ fontSize: 12, color: '#f87171' }}>{sendError}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inboxInputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, boxSizing: 'border-box',
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
