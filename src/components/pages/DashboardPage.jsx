import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cpu, MessageSquare, Zap, TrendingUp, Code2, Image, BarChart3,
  Sparkles, ExternalLink, Plus, Grid3X3, Clock,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useChatStore } from '../../store/chatStore'
import { PROVIDERS, getAllModels } from '../../utils/providers'

const FREE_MODELS = getAllModels().filter(m => m.free)

const CATEGORY_ACTIONS = [
  { id: 'chat',     label: 'Start a Chat',    icon: MessageSquare, desc: 'Conversational AI assistant' },
  { id: 'code',     label: 'Generate Code',   icon: Code2,         desc: 'Programming & debugging'     },
  { id: 'images',   label: 'Create Images',   icon: Image,         desc: 'AI image generation'         },
  { id: 'analysis', label: 'Analyze Data',    icon: BarChart3,     desc: 'Charts, summaries & insights'},
  { id: 'creative', label: 'Creative Writing',icon: Sparkles,      desc: 'Stories, poems & more'       },
]

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding:         '18px 20px',
        borderRadius:    '12px',
        backgroundColor: 'var(--bg-surface)',
        border:          '1px solid var(--border-subtle)',
        display:         'flex',
        alignItems:      'flex-start',
        gap:             '14px',
      }}
    >
      <div
        style={{
          width:           42,
          height:          42,
          borderRadius:    '10px',
          backgroundColor: `${color}15`,
          border:          `1px solid ${color}25`,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
        }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function ProviderCard({ providerId, provider, activeCount }) {
  const { setActivePage, openAddModelModal } = useAppStore()
  const hasModels = activeCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{
        padding:         '16px',
        borderRadius:    '12px',
        backgroundColor: 'var(--bg-surface)',
        border:          hasModels ? `1px solid ${provider.color}25` : '1px solid var(--border-subtle)',
        cursor:          'pointer',
        transition:      'all 200ms',
      }}
      onClick={() => hasModels ? setActivePage('models') : openAddModelModal()}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div
          style={{
            width:           40,
            height:          40,
            borderRadius:    '10px',
            backgroundColor: `${provider.color}18`,
            border:          `1px solid ${provider.color}35`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        '11px',
            fontWeight:      700,
            fontFamily:      'monospace',
            color:           provider.color,
          }}
        >
          {provider.logo}
        </div>
        {hasModels ? (
          <span
            style={{
              fontSize:        '11px',
              fontWeight:      600,
              padding:         '2px 8px',
              borderRadius:    20,
              backgroundColor: 'var(--color-primary-10)',
              border:          '1px solid var(--color-primary-20)',
              color:           'var(--color-primary)',
            }}
          >
            {activeCount} active
          </span>
        ) : (
          <span
            style={{
              fontSize:  '11px',
              color:     'var(--text-muted)',
              padding:   '2px 8px',
              borderRadius: 20,
              border:    '1px dashed var(--border)',
            }}
          >
            Add
          </span>
        )}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600 }}>{provider.name}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 3 }}>
        {provider.models.length} model{provider.models.length !== 1 ? 's' : ''}
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { activeModels, openAddModelModal, setActivePage, setActiveCategory } = useAppStore()
  const { conversations, loadConversations, newConversation } = useChatStore()

  useEffect(() => { loadConversations() }, [])

  // Quick Start: pick category, start a fresh chat, go to chat
  const handleQuickStart = async (categoryId) => {
    if (activeModels.length === 0) { openAddModelModal(); return }
    setActiveCategory(categoryId)
    await newConversation()
    setActivePage('chat')
  }

  const totalModels    = activeModels.length
  const totalConvs     = conversations.length

  const providerCounts = {}
  for (const m of activeModels) {
    providerCounts[m.providerId] = (providerCounts[m.providerId] || 0) + 1
  }

  const freeModelsInUse = activeModels.filter(m => {
    const p = PROVIDERS[m.providerId]
    return p?.models.find(mod => mod.id === m.modelId)?.free
  }).length

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding:      '24px 28px',
          borderRadius: '16px',
          background:   'linear-gradient(135deg, var(--color-primary-10) 0%, transparent 100%)',
          border:       '1px solid var(--color-primary-20)',
          marginBottom: '24px',
          position:     'relative',
          overflow:     'hidden',
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position:        'absolute',
            top:             -40,
            right:           -40,
            width:           180,
            height:          180,
            borderRadius:    '50%',
            backgroundColor: 'var(--color-primary-10)',
            filter:          'blur(40px)',
            pointerEvents:   'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <h1
            style={{
              margin:     0,
              fontSize:   '22px',
              fontWeight: 700,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome to NexusAI
          </h1>
          <p style={{ margin: '6px 0 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Your unified dashboard for every major AI provider.
            {totalModels === 0 ? ' Get started by adding your first model.' : ` ${totalModels} model${totalModels !== 1 ? 's' : ''} ready to use.`}
          </p>
          {totalModels === 0 && (
            <button className="btn-primary" onClick={openAddModelModal} style={{ fontSize: '13px' }}>
              <Plus size={15} /> Add Your First Model
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <div
        style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(auto-fit, minmax(180px, 1fr))',
          gap:                   '12px',
          marginBottom:          '24px',
        }}
      >
        <StatCard icon={Cpu}         label="Active Models"   value={totalModels}    sub={`${Object.keys(providerCounts).length} provider${Object.keys(providerCounts).length !== 1 ? 's' : ''}`} color="var(--color-primary)" />
        <StatCard icon={MessageSquare} label="Conversations" value={totalConvs}     sub="Stored locally"    color="#60a5fa" />
        <StatCard icon={Zap}         label="Free Models"    value={freeModelsInUse} sub="No cost to run"   color="#4ade80" />
        <StatCard icon={TrendingUp}  label="Providers"      value={Object.keys(PROVIDERS).length} sub="Supported"  color="#c084fc" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '24px' }}>
        {/* Left column */}
        <div>
          {/* Provider grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                AI Providers
              </h2>
              <button className="btn-ghost" onClick={() => setActivePage('models')} style={{ fontSize: '12px' }}>
                View all
              </button>
            </div>
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap:                 '8px',
              }}
            >
              {Object.entries(PROVIDERS).map(([id, provider]) => (
                <ProviderCard
                  key={id}
                  providerId={id}
                  provider={provider}
                  activeCount={providerCounts[id] || 0}
                />
              ))}
            </div>
          </div>

          {/* Quick start */}
          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Quick Start
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
              {CATEGORY_ACTIONS.map(({ id, label, icon: Icon, desc }) => (
                <motion.button
                  key={id}
                  whileHover={{ y: -2 }}
                  onClick={() => handleQuickStart(id)}
                  style={{
                    padding:         '14px',
                    borderRadius:    '10px',
                    border:          '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    cursor:          'pointer',
                    textAlign:       'left',
                    transition:      'all 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <Icon size={18} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Recent conversations */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Recent Chats
              </h2>
              <button className="btn-ghost" onClick={() => setActivePage('chat')} style={{ fontSize: '12px' }}>
                Open
              </button>
            </div>
            {conversations.length === 0 ? (
              <div
                style={{
                  padding:         '24px',
                  textAlign:       'center',
                  borderRadius:    '10px',
                  border:          '1px dashed var(--border)',
                  color:           'var(--text-muted)',
                  fontSize:        '12px',
                }}
              >
                <MessageSquare size={20} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No conversations yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {conversations.slice(0, 6).map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActivePage('chat')}
                    style={{
                      display:         'flex',
                      alignItems:      'center',
                      gap:             '10px',
                      padding:         '10px 12px',
                      borderRadius:    '8px',
                      border:          '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      cursor:          'pointer',
                      textAlign:       'left',
                      transition:      'all 120ms',
                      width:           '100%',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                  >
                    <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {conv.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Free models highlight */}
          <div>
            <h2 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Featured Free Models
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {FREE_MODELS.slice(0, 5).map(model => {
                const provider = PROVIDERS[model.providerId]
                return (
                  <div
                    key={`${model.providerId}:${model.id}`}
                    style={{
                      display:         'flex',
                      alignItems:      'center',
                      gap:             '10px',
                      padding:         '9px 12px',
                      borderRadius:    '8px',
                      border:          '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    <span
                      style={{
                        width: 20, height: 20, borderRadius: 5,
                        backgroundColor: `${provider.color}18`,
                        color: provider.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '8px', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0,
                      }}
                    >
                      {provider.logo}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {model.name}
                    </span>
                    <span className="badge-free">Free</span>
                  </div>
                )
              })}
              <button
                className="btn-ghost"
                onClick={openAddModelModal}
                style={{ fontSize: '12px', justifyContent: 'center', marginTop: 2 }}
              >
                <Plus size={13} /> Add free models
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
