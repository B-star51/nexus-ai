import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, MessageSquare, Cpu, Settings } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAppStore } from '../../store/appStore'
import AddModelModal from '../models/AddModelModal'
import ModelVotingModal from '../models/ModelVotingModal'
import ThemeCustomizer from '../settings/ThemeCustomizer'

function MobileBottomNav() {
  const { activePage, setActivePage } = useAppStore()

  const items = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'chat',      label: 'Chat',      Icon: MessageSquare    },
    { id: 'models',    label: 'Models',    Icon: Cpu              },
    { id: 'settings',  label: 'Settings',  Icon: Settings         },
  ]

  return (
    <nav
      style={{
        height:          56,
        backgroundColor: 'var(--bg-sidebar)',
        borderTop:       '1px solid var(--border-subtle)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-around',
        flexShrink:      0,
      }}
      className="flex md:hidden"
    >
      {items.map(({ id, label, Icon }) => {
        const active = activePage === id
        return (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '3px',
              padding:       '8px 16px',
              cursor:        'pointer',
              border:        'none',
              background:    'none',
              color:         active ? 'var(--color-primary)' : 'var(--text-muted)',
              transition:    'color 150ms',
              fontSize:      '10px',
              fontWeight:    500,
            }}
            aria-label={label}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function Layout({ children }) {
  const {
    showAddModelModal, closeAddModelModal,
    showThemeCustomizer, closeThemeCustomizer,
    showVotingModal, closeVotingModal,
    activePage,
  } = useAppStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div
      style={{
        display:         'flex',
        height:          '100dvh',
        overflow:        'hidden',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      {/* Desktop sidebar */}
      <div
        className="hidden md:flex"
        style={{ flexShrink: 0 }}
      >
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position:        'fixed',
                inset:           0,
                zIndex:          200,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter:  'blur(2px)',
              }}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 201 }}
            >
              <Sidebar mobile onMobileClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div
        style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          minWidth:       0,
          overflow:       'hidden',
        }}
      >
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <MobileBottomNav />
      </div>

      {/* Global modals */}
      <AddModelModal    open={showAddModelModal}    onClose={closeAddModelModal}    />
      <ModelVotingModal open={showVotingModal}      onClose={closeVotingModal}      />
      <ThemeCustomizer  open={showThemeCustomizer}  onClose={closeThemeCustomizer}  />
    </div>
  )
}
