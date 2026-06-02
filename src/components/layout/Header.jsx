import { useState, useEffect } from 'react'
import { Plus, Palette, Menu, BarChart3, Grid3X3, MessageSquare, Code2, Image, Sparkles, HardDrive, Bot } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { CATEGORIES, PROVIDERS } from '../../utils/providers'
import { getStorageUsage } from '../../utils/db'
import ModelSelector from '../models/ModelSelector'
import AgentCustomizerPanel from '../settings/AgentCustomizerPanel'

const CATEGORY_ICONS = {
  Grid3X3, MessageSquare, Code2, Image, BarChart3, Sparkles,
}

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  chat:      'Chat',
  models:    'Models',
  settings:  'Settings',
}

export default function Header({ onMobileMenuOpen }) {
  const {
    activePage,
    activeCategory, setActiveCategory,
    openAddModelModal, openThemeCustomizer,
    selectedProviderId, selectedModelId, activeModels,
  } = useAppStore()

  const [storageInfo, setStorageInfo]       = useState(null)
  const [agentPanelOpen, setAgentPanelOpen] = useState(false)

  useEffect(() => {
    getStorageUsage().then(setStorageInfo).catch(() => {})
  }, [])

  const title = PAGE_TITLES[activePage] || 'NexusAI'

  return (
    <>
      <header
        style={{
          height:          56,
          display:         'flex',
          alignItems:      'center',
          gap:             '12px',
          padding:         '0 16px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom:    '1px solid var(--border-subtle)',
          flexShrink:      0,
          position:        'sticky',
          top:             0,
          zIndex:          100,
        }}
      >
        {/* Mobile menu button */}
        <button
          className="btn-ghost md:hidden"
          onClick={onMobileMenuOpen}
          style={{ padding: '6px', display: 'none' }}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </h1>
        </div>

        {/* Model selector (center, visible on chat page) */}
        {activePage === 'chat' && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <ModelSelector compact />
          </div>
        )}

        {/* Category pills (visible on models / dashboard) */}
        {(activePage === 'models' || activePage === 'dashboard') && (
          <div
            style={{
              flex:       1,
              display:    'flex',
              alignItems: 'center',
              gap:        '4px',
              overflowX:  'auto',
              msOverflowStyle: 'none',
              scrollbarWidth:  'none',
            }}
          >
            {CATEGORIES.map(cat => {
              const Icon    = CATEGORY_ICONS[cat.icon]
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display:         'flex',
                    alignItems:      'center',
                    gap:             '5px',
                    padding:         '5px 10px',
                    borderRadius:    '20px',
                    fontSize:        '12px',
                    fontWeight:      500,
                    cursor:          'pointer',
                    whiteSpace:      'nowrap',
                    transition:      'all 150ms',
                    border:          isActive ? '1px solid var(--color-primary-30)' : '1px solid transparent',
                    backgroundColor: isActive ? 'var(--color-primary-10)' : 'transparent',
                    color:           isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {Icon && <Icon size={13} />}
                  {cat.label}
                </button>
              )
            })}
          </div>
        )}

        {activePage !== 'chat' && activePage !== 'models' && activePage !== 'dashboard' && (
          <div style={{ flex: 1 }} />
        )}

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Storage indicator */}
          {storageInfo && (
            <div
              title={`IndexedDB: ${storageInfo.usedMB}MB / ${storageInfo.totalMB}MB (${storageInfo.percent}%)`}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'default',
              }}
            >
              <HardDrive size={13} />
              <span className="hidden sm:inline">{storageInfo.usedMB}MB</span>
            </div>
          )}

          {/* Agent Customizer */}
          <button
            className="btn-ghost"
            onClick={() => setAgentPanelOpen(true)}
            style={{ padding: '7px' }}
            aria-label="Agent customizer"
            title="Customize agent behavior"
          >
            <Bot size={16} />
          </button>

          {/* Theme */}
          <button
            className="btn-ghost"
            onClick={openThemeCustomizer}
            style={{ padding: '7px' }}
            aria-label="Theme customizer"
            title="Customize theme"
          >
            <Palette size={16} />
          </button>

          {/* Add model */}
          <button
            className="btn-primary"
            onClick={openAddModelModal}
            style={{ fontSize: '13px', padding: '7px 14px' }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Model</span>
          </button>
        </div>
      </header>

      <AgentCustomizerPanel open={agentPanelOpen} onClose={() => setAgentPanelOpen(false)} />
    </>
  )
}
