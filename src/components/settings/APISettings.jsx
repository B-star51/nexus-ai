import { useState } from 'react'
import { Eye, EyeOff, Trash2, Edit3, Check, X, ExternalLink, Circle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { PROVIDERS } from '../../utils/providers'

function maskKey(key) {
  if (!key || key.length < 8) return '••••••••'
  return `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`
}

export default function APISettings() {
  const { providerKeys, setProviderKey, keyStatus, activeModels } = useAppStore()

  const configuredProviders = Object.entries(providerKeys).filter(([, k]) => k)

  if (configuredProviders.length === 0) {
    return (
      <div
        style={{
          textAlign:  'center',
          padding:    '48px 24px',
          color:      'var(--text-muted)',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: 12 }}>🔑</div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No API keys configured</p>
        <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
          Click "Add Model" in the header to add your first provider.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {configuredProviders
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([providerId, apiKey]) => (
          <ProviderKeyRow
            key={providerId}
            providerId={providerId}
            apiKey={apiKey}
            status={keyStatus[providerId]}
            activeCount={activeModels.filter(m => m.providerId === providerId).length}
          />
        ))}
    </div>
  )
}

function ProviderKeyRow({ providerId, apiKey, status, activeCount }) {
  const provider = PROVIDERS[providerId]
  const { setProviderKey, setKeyStatus } = useAppStore()

  const [editing,  setEditing]  = useState(false)
  const [editVal,  setEditVal]  = useState(apiKey)
  const [showKey,  setShowKey]  = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  if (!provider) return null

  const statusConfig = {
    ok:       { color: '#4ade80', icon: <Check size={12} />,  label: 'Verified' },
    error:    { color: '#f87171', icon: <X size={12} />,      label: 'Failed'   },
    untested: { color: '#a3a3a3', icon: <Circle size={12} />, label: 'Untested' },
  }
  const s = statusConfig[status] || statusConfig.untested

  const handleSave = () => {
    setProviderKey(providerId, editVal)
    setKeyStatus(providerId, 'untested')
    setEditing(false)
  }

  const handleDelete = () => {
    if (!confirm) { setConfirm(true); return }
    setProviderKey(providerId, '')
    setKeyStatus(providerId, null)
    setConfirm(false)
  }

  return (
    <div
      style={{
        padding:         '14px 16px',
        borderRadius:    '10px',
        border:          '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        display:         'flex',
        alignItems:      'center',
        gap:             '14px',
      }}
    >
      {/* Provider badge */}
      <div
        style={{
          width:           38,
          height:          38,
          borderRadius:    '10px',
          backgroundColor: `${provider.color}15`,
          border:          `1px solid ${provider.color}30`,
          color:           provider.color,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontSize:        '10px',
          fontWeight:      700,
          fontFamily:      'monospace',
          flexShrink:      0,
        }}
      >
        {provider.logo}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{provider.name}</span>
          {/* Status */}
          <span
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             4,
              padding:         '1px 7px',
              borderRadius:    20,
              fontSize:        '10px',
              fontWeight:      600,
              backgroundColor: `${s.color}15`,
              color:           s.color,
              border:          `1px solid ${s.color}30`,
            }}
          >
            {s.icon} {s.label}
          </span>
          {activeCount > 0 && (
            <span
              style={{
                fontSize:        '10px',
                fontWeight:      600,
                color:           'var(--color-primary)',
                backgroundColor: 'var(--color-primary-10)',
                border:          '1px solid var(--color-primary-20)',
                padding:         '1px 7px',
                borderRadius:    20,
              }}
            >
              {activeCount} model{activeCount !== 1 ? 's' : ''} active
            </span>
          )}
        </div>

        {editing ? (
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input
              type="text"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              className="input-base"
              style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
              autoFocus
            />
            <button className="btn-primary" onClick={handleSave} style={{ fontSize: '12px', padding: '5px 10px' }}>
              <Check size={13} /> Save
            </button>
            <button className="btn-secondary" onClick={() => setEditing(false)} style={{ fontSize: '12px', padding: '5px 8px' }}>
              Cancel
            </button>
          </div>
        ) : (
          <span
            style={{
              fontSize:   '12px',
              fontFamily: 'monospace',
              color:      'var(--text-muted)',
            }}
          >
            {showKey ? apiKey : maskKey(apiKey)}
          </span>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            className="btn-ghost"
            onClick={() => setShowKey(s => !s)}
            style={{ padding: 6 }}
            aria-label={showKey ? 'Hide key' : 'Show key'}
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            className="btn-ghost"
            onClick={() => { setEditing(true); setEditVal(apiKey) }}
            style={{ padding: 6 }}
            aria-label="Edit key"
            title="Edit key"
          >
            <Edit3 size={14} />
          </button>
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ padding: 6, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
            aria-label="View docs"
            title="View docs"
          >
            <ExternalLink size={14} />
          </a>
          <button
            className="btn-ghost"
            onClick={handleDelete}
            style={{ padding: 6, color: confirm ? '#f87171' : undefined }}
            aria-label={confirm ? 'Confirm delete' : 'Delete key'}
            title={confirm ? 'Click again to confirm' : 'Delete key'}
            onBlur={() => setTimeout(() => setConfirm(false), 200)}
          >
            <Trash2 size={14} />
          </button>
          {confirm && (
            <span style={{ fontSize: '11px', color: '#f87171', whiteSpace: 'nowrap' }}>
              Click again
            </span>
          )}
        </div>
      )}
    </div>
  )
}
