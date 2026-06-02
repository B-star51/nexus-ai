import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PixelLoader({ onComplete }) {
  const [dots, setDots]       = useState('')
  const [visible, setVisible] = useState(true)

  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#e86c28'

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)

    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onComplete?.(), 500)
    }, 2500)

    return () => {
      clearInterval(dotsInterval)
      clearTimeout(hideTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pixel-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          9999,
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'center',
            backgroundColor: '#0a0a0f',
            gap:             '32px',
          }}
        >
          {/* Scanline effect */}
          <div
            style={{
              position:   'absolute',
              inset:      0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
              pointerEvents: 'none',
            }}
          />

          {/* Logo wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      '13px',
              fontWeight:    600,
              letterSpacing: '0.3em',
              color:         'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
            }}
          >
            NEXUS AI
          </motion.div>

          {/* Pangolin character with glow pulse */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position:     'relative',
              padding:      '24px',
              borderRadius: '16px',
              background:   `radial-gradient(circle at center, ${primary}15 0%, transparent 70%)`,
            }}
          >
            {/* Glow ring */}
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position:     'absolute',
                inset:        0,
                borderRadius: '16px',
                boxShadow:    `0 0 40px ${primary}40, 0 0 80px ${primary}20`,
              }}
            />
            {/* Pangolin SVG */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 20px ${primary}80)` }}
            >
              <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="44" fill="none" stroke={primary} strokeWidth="2"/>
                <g fill={primary}>
                  <ellipse cx="68" cy="38" rx="9" ry="7"/>
                  <circle cx="71" cy="36" r="1.5" fill="#0a0a0f"/>
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
                <path d="M 20 76 Q 35 72 50 74 Q 65 76 80 73" stroke={primary} strokeWidth="1.5" fill="none" opacity="0.5"/>
                <line x1="50" y1="74" x2="50" y2="65" stroke={primary} strokeWidth="1.5"/>
                <ellipse cx="50" cy="63" rx="6" ry="3" fill={primary} opacity="0.6"/>
              </svg>
            </motion.div>
          </motion.div>

          {/* Loading text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      '12px',
              fontWeight:    500,
              letterSpacing: '0.25em',
              color:         primary,
              textTransform: 'uppercase',
              minWidth:      '220px',
              textAlign:     'center',
            }}
          >
            LOADING NEXUS AI{dots}
          </motion.div>

          {/* Progress bar */}
          <motion.div
            style={{
              width:           '160px',
              height:          '2px',
              borderRadius:    '1px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              overflow:        'hidden',
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              style={{
                height:          '100%',
                borderRadius:    '1px',
                backgroundColor: primary,
                boxShadow:       `0 0 8px ${primary}`,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
