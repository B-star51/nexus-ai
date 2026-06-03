import { useAppStore } from '../store/appStore'

function base() {
  const { emailServerUrl } = useAppStore.getState()
  return (emailServerUrl || '').replace(/\/$/, '')
}
function headers() {
  const { emailServerToken } = useAppStore.getState()
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${emailServerToken}` }
}
export function isConfigured() {
  const { emailServerUrl, emailServerToken } = useAppStore.getState()
  return Boolean(emailServerUrl && emailServerToken)
}
export async function checkStatus() {
  const res = await fetch(`${base()}/api/status`, { headers: headers() })
  if (!res.ok) throw new Error(res.status === 401 ? 'Invalid token' : `Server error ${res.status}`)
  return res.json()
}
export async function fetchEmails() {
  const res = await fetch(`${base()}/api/emails`, { headers: headers() })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return (await res.json()).emails || []
}
export async function refreshInbox() {
  const res = await fetch(`${base()}/api/refresh`, { method: 'POST', headers: headers() })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}
export async function sendReply(uid, text, html) {
  const res = await fetch(`${base()}/api/emails/${uid}/reply`, { method: 'POST', headers: headers(), body: JSON.stringify({ text, html }) })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Send failed ${res.status}`) }
  return res.json()
}
export async function savePreferences(prefs) {
  const res = await fetch(`${base()}/api/preferences`, { method: 'POST', headers: headers(), body: JSON.stringify(prefs) })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}
