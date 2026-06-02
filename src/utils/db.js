import { openDB } from 'idb'

const DB_NAME    = 'nexus-ai'
const DB_VERSION = 1

let dbPromise = null

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('conversations')) {
          const conv = db.createObjectStore('conversations', { keyPath: 'id' })
          conv.createIndex('updatedAt', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        if (!db.objectStoreNames.contains('messages')) {
          const msg = db.createObjectStore('messages', { keyPath: 'id' })
          msg.createIndex('conversationId', 'conversationId')
        }
      },
    })
  }
  return dbPromise
}

// ─── Conversations ────────────────────────────────────────────────
export async function getAllConversations() {
  const db = await initDB()
  const all = await db.getAllFromIndex('conversations', 'updatedAt')
  return all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export async function getConversation(id) {
  const db = await initDB()
  return db.get('conversations', id)
}

export async function saveConversation(conv) {
  const db = await initDB()
  return db.put('conversations', { ...conv, updatedAt: new Date().toISOString() })
}

export async function deleteConversation(id) {
  const db = await initDB()
  const tx = db.transaction(['conversations', 'messages'], 'readwrite')
  await tx.objectStore('conversations').delete(id)
  const msgIndex = tx.objectStore('messages').index('conversationId')
  const msgs = await msgIndex.getAllKeys(id)
  for (const key of msgs) {
    await tx.objectStore('messages').delete(key)
  }
  await tx.done
}

// ─── Messages ─────────────────────────────────────────────────────
export async function getMessages(conversationId) {
  const db = await initDB()
  const all = await db.getAllFromIndex('messages', 'conversationId', conversationId)
  return all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export async function saveMessage(msg) {
  const db = await initDB()
  return db.put('messages', { ...msg, createdAt: msg.createdAt || new Date().toISOString() })
}

export async function deleteMessage(id) {
  const db = await initDB()
  return db.delete('messages', id)
}

// ─── Settings ─────────────────────────────────────────────────────
export async function getSetting(key) {
  const db = await initDB()
  const row = await db.get('settings', key)
  return row ? row.value : null
}

export async function setSetting(key, value) {
  const db = await initDB()
  return db.put('settings', { key, value })
}

// ─── Storage estimate ─────────────────────────────────────────────
export async function getStorageUsage() {
  if (!navigator.storage?.estimate) return null
  const { usage, quota } = await navigator.storage.estimate()
  return {
    used: usage,
    total: quota,
    percent: Math.round((usage / quota) * 100),
    usedMB: (usage / 1024 / 1024).toFixed(1),
    totalMB: (quota / 1024 / 1024).toFixed(0),
  }
}
