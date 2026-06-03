import { useState, useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { useTheme } from './hooks/useTheme'
import { initDB } from './utils/db'
import PixelLoader from './components/common/PixelLoader'
import Layout from './components/layout/Layout'
import DashboardPage from './components/pages/DashboardPage'
import ChatPage from './components/pages/ChatPage'
import EmailPage from './components/pages/EmailPage'
import ComparePage from './components/pages/ComparePage'
import ModelsPage from './components/pages/ModelsPage'
import SettingsPage from './components/pages/SettingsPage'

export default function App() {
  const { activePage } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dbReady, setDbReady] = useState(false)

  // Apply theme on mount
  useTheme()

  // Initialize IndexedDB
  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch(err => {
        console.error('IndexedDB init failed:', err)
        setDbReady(true) // still show app even if DB fails
      })
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'chat':      return <ChatPage />
      case 'email':     return <EmailPage />
      case 'compare':   return <ComparePage />
      case 'models':    return <ModelsPage />
      case 'settings':  return <SettingsPage />
      default:          return <DashboardPage />
    }
  }

  return (
    <>
      {/* Pixel art loading screen */}
      {loading && <PixelLoader onComplete={() => setLoading(false)} />}

      {/* Main app (rendered underneath loader, visible after fade) */}
      {dbReady && (
        <div
          style={{
            opacity:    loading ? 0 : 1,
            transition: 'opacity 0.4s ease-out',
            height:     '100dvh',
          }}
        >
          <Layout>
            {renderPage()}
          </Layout>
        </div>
      )}
    </>
  )
}
