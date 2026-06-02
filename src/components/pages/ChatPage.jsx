import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, MessageSquare, Copy, Check,
  Zap, Loader2, Code, Send, Search, Terminal,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useChatStore } from '../../store/chatStore'
import { PROVIDERS } from '../../utils/providers'
import ModelSelector from '../models/ModelSelector'

// ─── Pangolin logo for welcome screen ───────────────────────────────────────
function PangolinLogo({ size = 80 }) {
  return (
    <img
      src="/nexus-ai/android-chrome-512x512.png"
      width={size}
      height={size}
      alt="NexusAI"
      style={{ display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  )
}

// ─── Quick action chips ─────────────────────────────────────────────────────
const QUICK_ACTIONS = ['Write code', 'Explain concept', 'Analyze data', 'Creative writing']

export default function ChatPage() {
  const {
    activeModels, selectedProviderId, selectedModelId, selectModel,
    providerKeys, openVotingModal, openAddModelModal,
    agentName,
  } = useAppStore()

  const {
    conversations, loadConversations,
    activeConversationId, selectConversation,
    messages, loadingMessages,
    newConversation, deleteConversation,
    sendMessage, sending,
  } = useChatStore()

  const [input, setInput]   = useState('')
  const [copied, setCopied] = useState(null)
  const [mode, setMode]     = useState('chat')
  const messagesEndRef      = useRef(null)
  const textareaRef         = useRef(null)

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [input])

  const currentProvider = PROVIDERS[selectedProviderId]
  const currentModel    = currentProvider?.models.find(m => m.id === selectedModelId)

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return

    if (!selectedProviderId || !selectedModelId) {
      alert('Please select a model first')
      return
    }

    setInput('')

    await sendMessage({
      content:      trimmed,
      providerId:   selectedProviderId,
      modelId:      selectedModelId,
      apiKey:       providerKeys[selectedProviderId] || '',
      providerName: currentProvider?.name || '',
      modelName:    currentModel?.name || '',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const showWelcome = messages.length === 0 && !loadingMessages

  const iconBtnStyle = {
    width: 30, height: 30, borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }

  const modeBtnStyle = {
    padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
    background: 'transparent', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s',
  }

  const modeActivStyle = {
    background: 'var(--color-primary-20)',
    border: '1px solid var(--color-primary-30)',
    color: 'var(--color-primary)',
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Conversation list */}
      <div
        className="hidden md:flex"
        style={{
          width:           240,
          flexShrink:      0,
          borderRight:     '1px solid var(--border-subtle)',
          display:         'flex',
          flexDirection:   'column',
          backgroundColor: 'var(--bg-sidebar)',
          overflow:        'hidden',
        }}
      >
        <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            className="btn-primary"
            onClick={() => newConversation()}
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
          >
            <Plus size={14} /> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              <MessageSquare size={18} style={{ marginBottom: 6, opacity: 0.4 }} />
              <p style={{ margin: 0 }}>No chats yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = conv.id === activeConversationId
              return (
                <div key={conv.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <button
                    onClick={() => selectConversation(conv.id)}
                    style={{
                      flex:            1,
                      padding:         '8px 10px',
                      borderRadius:    '7px',
                      border:          isActive ? '1px solid var(--color-primary-20)' : '1px solid transparent',
                      backgroundColor: isActive ? 'var(--color-primary-10)' : 'transparent',
                      cursor:          'pointer',
                      textAlign:       'left',
                      transition:      'all 120ms',
                      overflow:        'hidden',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div style={{
                      fontSize: '12px', fontWeight: 500,
                      color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    style={{
                      padding: 4, borderRadius: 5, border: 'none', background: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer', opacity: 0,
                      transition: 'opacity 150ms', flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Messages / Welcome */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Odysseus-style welcome screen */}
          {showWelcome && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '40px 24px',
            }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PangolinLogo size={90} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontSize: 36, fontWeight: 700, color: '#f1f5f9',
                  letterSpacing: '-0.02em', textAlign: 'center',
                }}
              >
                {agentName}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
                }}
              >
                Yours to build.
              </motion.div>

              {/* Quick action chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}
              >
                {QUICK_ACTIONS.map(label => (
                  <button
                    key={label}
                    onClick={() => setInput(label)}
                    style={{
                      padding: '8px 16px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.6)', transition: 'all 0.15s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.color = 'var(--color-primary)'
                      e.currentTarget.style.background = 'var(--color-primary-10)'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>

              {activeModels.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <button className="btn-primary" onClick={openAddModelModal} style={{ marginTop: 8 }}>
                    <Plus size={15} /> Add a Model
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Messages */}
          {!showWelcome && (
            <div style={{ padding: '20px', flex: 1 }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onCopy={handleCopy}
                    copied={copied}
                  />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Odysseus-style floating input bar */}
        <div style={{ padding: '12px 16px 16px', position: 'sticky', bottom: 0, flexShrink: 0 }}>
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            {/* Textarea row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', padding: '12px 16px', gap: 10 }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedProviderId
                    ? `Message ${agentName}...`
                    : `Message ${agentName}... (select a model below)`
                }
                disabled={sending}
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  resize: 'none', color: 'var(--text-primary)', fontSize: 14,
                  lineHeight: 1.6, maxHeight: 160, overflowY: 'auto',
                  fontFamily: 'inherit', padding: 0,
                }}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim() || sending || !selectedProviderId}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  cursor: input.trim() && selectedProviderId ? 'pointer' : 'default',
                  background: input.trim() && selectedProviderId
                    ? 'var(--color-primary)'
                    : 'rgba(255,255,255,0.08)',
                  color: input.trim() && selectedProviderId ? '#fff' : 'rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                aria-label="Send message"
              >
                {sending
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={16} />
                }
              </motion.button>
            </div>

            {/* Bottom bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 16px 10px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Left icon buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={iconBtnStyle} title="Search" aria-label="Search">
                  <Search size={14} />
                </button>
                <button style={iconBtnStyle} title="Terminal" aria-label="Terminal">
                  <Terminal size={14} />
                </button>
              </div>

              {/* Model selector (compact) */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <ModelSelector compact onChange={() => {}} />
              </div>

              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  style={{ ...modeBtnStyle, ...(mode === 'agent' ? modeActivStyle : {}) }}
                  onClick={() => setMode('agent')}
                >
                  Agent
                </button>
                <button
                  style={{ ...modeBtnStyle, ...(mode === 'chat' ? modeActivStyle : {}) }}
                  onClick={() => setMode('chat')}
                >
                  Chat
                </button>
              </div>
            </div>
          </div>

          <p style={{ margin: '6px 0 0', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
            API keys stored locally. Never sent to NexusAI servers.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, onCopy, copied }) {
  const isUser  = msg.role === 'user'
  const provider = PROVIDERS[msg.providerId]
  const parts   = parseContent(msg.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display:       'flex',
        gap:           '10px',
        marginBottom:  '16px',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems:    'flex-start',
      }}
    >
      {!isUser && (
        <div style={{
          width:           32, height: 32, borderRadius: '8px',
          backgroundColor: provider ? `${provider.color}20` : 'var(--bg-elevated)',
          border:          `1px solid ${provider ? `${provider.color}30` : 'var(--border)'}`,
          display:         'flex', alignItems: 'center', justifyContent: 'center',
          fontSize:        '11px', fontWeight: 700, fontFamily: 'monospace',
          color:           provider?.color || 'var(--text-secondary)',
          flexShrink:      0, marginTop: 2,
        }}>
          {msg.streaming
            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            : (provider?.logo || 'AI')}
        </div>
      )}

      <div style={{ maxWidth: '72%', minWidth: 0 }}>
        {!isUser && msg.modelName && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 500 }}>
            {msg.providerName} / {msg.modelName}
          </div>
        )}

        <div style={{
          padding:         '10px 14px',
          borderRadius:    isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isUser ? 'var(--color-primary)' : 'var(--bg-elevated)',
          border:          isUser ? 'none' : '1px solid var(--border)',
          color:           isUser ? '#fff' : 'var(--text-primary)',
          position:        'relative',
        }}>
          {msg.streaming && !msg.content ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '14px', lineHeight: 1.65, wordBreak: 'break-word' }}>
              {parts.map((part, i) =>
                part.type === 'code' ? (
                  <CodeBlock key={i} lang={part.lang} code={part.code} onCopy={onCopy} copied={copied} id={`${i}`} />
                ) : (
                  <span key={i} style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(part.text) }} />
                )
              )}
            </div>
          )}
          {msg.error && (
            <div style={{ fontSize: '11px', color: '#f87171', marginTop: 6, fontStyle: 'italic' }}>
              Error — check your API key
            </div>
          )}
        </div>

        {!isUser && !msg.streaming && msg.content && (
          <button
            onClick={() => onCopy(msg.id, msg.content)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 5, padding: '3px 8px', borderRadius: 5,
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '11px', color: 'var(--text-muted)', transition: 'color 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {copied === msg.id ? <Check size={11} /> : <Copy size={11} />}
            {copied === msg.id ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function CodeBlock({ lang, code, onCopy, copied, id }) {
  return (
    <div className="code-block" style={{ margin: '8px 0', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Code size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{lang || 'code'}</span>
        </div>
        <button
          onClick={() => onCopy(id, code)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 5,
            border: '1px solid var(--border-subtle)', background: 'none',
            cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)',
          }}
        >
          {copied === id ? <Check size={11} /> : <Copy size={11} />}
          {copied === id ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '14px', overflowX: 'auto', fontSize: '13px', lineHeight: 1.6, color: '#e2e8f0' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function parseContent(content) {
  if (!content) return [{ type: 'text', text: '' }]
  const parts = []
  const re    = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0, match

  while ((match = re.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: 'text', text: content.slice(last, match.index) })
    parts.push({ type: 'code', lang: match[1] || '', code: match[2].trim() })
    last = match.index + match[0].length
  }

  if (last < content.length) parts.push({ type: 'text', text: content.slice(last) })
  return parts.length ? parts : [{ type: 'text', text: content }]
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="margin:12px 0 6px;font-size:15px;font-weight:600">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="margin:14px 0 7px;font-size:16px;font-weight:700">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="margin:16px 0 8px;font-size:18px;font-weight:700">$1</h1>')
    .replace(/^[-*] (.+)$/gm, '<div style="padding-left:16px;margin:2px 0">• $1</div>')
}
