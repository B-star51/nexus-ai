import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, MessageSquare, Mail, GitCompare, Cpu, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { COLOR_PRESETS } from '../../utils/providers'
import PangolinLogo from '../common/PangolinLogo'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat',      label: 'Chat',      icon: MessageSquare    },
  { id: 'email',     label: 'Email',     icon: Mail             },
  { id: 'compare',   label: 'Compare',   icon: GitCompare       },
  { id: 'models',    label: 'Models',    icon: Cpu              },
  { id: 'settings',  label: 'Settings',  icon: Settings         },
]

function NexusLogo({ collapsed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '0 12px' : '0 4px' }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '10px',
          background: 'var(--color-primary-10)',
          border: '1px solid var(--color-primary-30)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px var(--color-primary-20)',
          overflow: 'hidden',
        }}
      >
        <PangolinLogo size={34} />
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              letterSpacing: '-0.02em',
            }}
          >
            NexusAI
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar({ mobile = false, onMobileClose }) {
  const {
    activePage, setActivePage,
    sidebarOpen, toggleSidebar,
    activeModels, themePreset,
    openAddModelModal,
  } = useAppStore()

  const collapsed = !sidebarOpen && !mobile
  const width     = collapsed ? 64 : 240

  const themeColor = COLOR_PRESETS[themePreset]?.primary || '#e86c28'

  const handleNav = (id) => {
    setActivePage(id)
    onMobileClose?.()
  }

  const sidebarContent = (
    <div
      style={{
        width:          mobile ? 240 : width,
        height:         '100%',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight:    '1px solid var(--border-subtle)',
        display:        'flex',
        flexDirection:  'column',
        transition:     'width 200ms ease-in-out',
        overflow:       'hidden',
        flexShrink:     0,
      }}
    >
      {/* Logo + collapse toggle */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding:        '20px 12px 16px',
          borderBottom:   '1px solid var(--border-subtle)',
          flexShrink:     0,
        }}
      >
        <NexusLogo collapsed={collapsed && !mobile} />
        {!mobile && (
          <button
            onClick={toggleSidebar}
            className="btn-ghost"
            style={{ padding: '6px', flexShrink: 0 }}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                width:          '100%',
                justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
                border:         isActive ? undefined : '1px solid transparent',
                gap:            '10px',
              }}
              title={collapsed && !mobile ? label : undefined}
              aria-label={label}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {(!collapsed || mobile) && (
                <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
              )}
            </button>
          )
        })}

        {/* Quick Add Model */}
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={() => { openAddModelModal(); onMobileClose?.() }}
            style={{
              width:           '100%',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  collapsed && !mobile ? 'center' : 'flex-start',
              gap:             '10px',
              padding:         '10px 12px',
              borderRadius:    '8px',
              fontSize:        '13px',
              fontWeight:      500,
              cursor:          'pointer',
              border:          '1px dashed var(--border)',
              backgroundColor: 'transparent',
              color:           'var(--text-muted)',
              transition:      'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-30)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            title={collapsed && !mobile ? 'Add Model' : undefined}
            aria-label="Add model"
          >
            <Zap size={16} style={{ flexShrink: 0 }} />
            {(!collapsed || mobile) && <span>Add Model</span>}
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop:   '1px solid var(--border-subtle)',
          padding:     '12px 8px',
          display:     'flex',
          flexDirection: collapsed && !mobile ? 'column' : 'row',
          alignItems:  'center',
          gap:         '8px',
        }}
      >
        {/* Model count badge */}
        <div
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '6px',
            padding:         '6px 8px',
            borderRadius:    '8px',
            backgroundColor: 'var(--color-primary-10)',
            border:          '1px solid var(--color-primary-20)',
            fontSize:        '12px',
            fontWeight:      600,
            color:           'var(--color-primary)',
            whiteSpace:      'nowrap',
          }}
          title={`${activeModels.length} model${activeModels.length !== 1 ? 's' : ''} active`}
        >
          <Cpu size={12} />
          {(!collapsed || mobile) && <span>{activeModels.length} active</span>}
          {collapsed && !mobile && <span>{activeModels.length}</span>}
        </div>

        {/* Theme dot */}
        {(!collapsed || mobile) && (
          <div
            style={{
              width:        10,
              height:       10,
              borderRadius: '50%',
              backgroundColor: themeColor,
              boxShadow:    `0 0 8px ${themeColor}`,
              flexShrink:   0,
              marginLeft:   'auto',
            }}
            title={`Theme: ${themePreset}`}
          />
        )}
      </div>
    </div>
  )

  // Mobile: overlay drawer
  if (mobile) {
    return sidebarContent
  }

  return sidebarContent
}
