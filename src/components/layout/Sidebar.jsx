import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, MessageSquare, Cpu, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { COLOR_PRESETS } from '../../utils/providers'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat',      label: 'Chat',      icon: MessageSquare    },
  { id: 'models',    label: 'Models',    icon: Cpu              },
  { id: 'settings',  label: 'Settings',  icon: Settings         },
]

function PangolinLogoSVG({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-primary)" strokeWidth="2"/>
      <g fill="var(--color-primary)">
        <ellipse cx="68" cy="38" rx="9" ry="7"/>
        <circle cx="71" cy="36" r="1.5" fill="var(--color-bg, #0a0a0f)"/>
        <ellipse cx="76" cy="40" rx="5" ry="3"/>
        <ellipse cx="58" cy="42" rx="9" ry="5"/>
        <ellipse cx="49" cy="44" rx="9" ry="5"/>
        <ellipse cx="40" cy="48" rx="9" ry="5"/>
        <ellipse cx="33" cy="54" rx="9" ry="5"/>
        <ellipse cx="55" cy="49" rx="8" ry="4.5" opacity="0.7"/>
        <ellipse cx="46" cy="53" rx="8" ry="4.5" opacity="0.7"/>
        <ellipse cx="37" cy="59" rx="8" ry="4.5" opacity="0.7"/>
        <ellipse cx="34" cy="66" rx="10" ry="6"/>
        <ellipse cx="42" cy="72" rx="8" ry="5" opacity="0.7"/>
        <ellipse cx="52" cy="74" rx="7" ry="4"/>
        <ellipse cx="61" cy="70" rx="6" ry="3.5" opacity="0.7"/>
        <ellipse cx="44" cy="68" rx="4" ry="6"/>
        <ellipse cx="56" cy="66" rx="4" ry="5"/>
        <polygon points="80,25 81.5,28.5 85,28.5 82.5,31 83.5,34.5 80,32.5 76.5,34.5 77.5,31 75,28.5 78.5,28.5"/>
      </g>
      <path d="M 20 76 Q 35 72 50 74 Q 65 76 80 73" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <line x1="50" y1="74" x2="50" y2="65" stroke="var(--color-primary)" strokeWidth="1.5"/>
      <ellipse cx="50" cy="63" rx="6" ry="3" fill="var(--color-primary)" opacity="0.6"/>
    </svg>
  )
}

function NexusLogo({ collapsed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '0 12px' : '0 4px' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: 'var(--color-primary-10)',
          border: '1px solid var(--color-primary-30)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px var(--color-primary-20)',
        }}
      >
        <PangolinLogoSVG size={28} />
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
