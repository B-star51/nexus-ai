/**
 * NexusAI Email Server
 * ─────────────────────────────────────────────────────────────
 * Connects to your mailbox over IMAP, polls for new mail, triages
 * each message with your chosen AI (Claude/OpenAI/Groq/etc.), drafts
 * replies following your preferences, and exposes a small REST API
 * that the NexusAI dashboard reads. Sends replies via SMTP.
 *
 * Run:  cp .env.example .env  &&  npm install  &&  npm start
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import fs from 'fs'

// ── Config ──────────────────────────────────────────────────
const cfg = {
  port:        parseInt(process.env.PORT || '8787'),
  apiToken:    process.env.API_TOKEN || '',
  origins:     (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()),
  imap: {
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT || '993'),
    secure: true,
    auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASS },
    logger: false,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  },
  fromName:    process.env.FROM_NAME || process.env.SMTP_USER,
  ai: {
    provider: process.env.AI_PROVIDER || 'anthropic',
    apiKey:   process.env.AI_API_KEY || '',
    model:    process.env.AI_MODEL || 'claude-sonnet-4-6',
    baseUrl:  process.env.AI_BASE_URL || '',
  },
  pollInterval: parseInt(process.env.POLL_INTERVAL || '60') * 1000,
  lookbackDays: parseInt(process.env.LOOKBACK_DAYS || '2'),
  autoDraft:    String(process.env.AUTO_DRAFT) !== 'false',
}

// ── Preferences (editable from dashboard, persisted to disk) ──
const PREF_FILE = './preferences.json'
let prefs = {
  rules:     'Be helpful, accurate, and professional. Flag anything urgent, financial, or legal.',
  tone:      'professional',
  signature: '',
}
try { if (fs.existsSync(PREF_FILE)) prefs = { ...prefs, ...JSON.parse(fs.readFileSync(PREF_FILE, 'utf8')) } } catch {}
const savePrefs = () => { try { fs.writeFileSync(PREF_FILE, JSON.stringify(prefs, null, 2)) } catch {} }

// ── In-memory triaged inbox ─────────────────────────────────
const inbox = new Map()  // uid -> { uid, from, fromName, subject, date, body, triage }
let lastError = null
let lastPoll  = null

// ── AI provider base URLs (OpenAI-compatible) ───────────────
const AI_BASE = {
  openai:     'https://api.openai.com/v1',
  groq:       'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  mistral:    'https://api.mistral.ai/v1',
  together:   'https://api.together.xyz/v1',
  github:     'https://models.github.ai/inference',
}

// ── Call the AI (Anthropic, Google, or OpenAI-compatible) ───
async function callAI(prompt) {
  const { provider, apiKey, model, baseUrl } = cfg.ai
  if (!apiKey) throw new Error('No AI_API_KEY configured')

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const d = await res.json()
    return d.content?.[0]?.text || ''
  }

  if (provider === 'google') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    })
    if (!res.ok) throw new Error(`Google ${res.status}: ${await res.text()}`)
    const d = await res.json()
    return d.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  // OpenAI-compatible
  const base = baseUrl || AI_BASE[provider] || 'https://api.openai.com/v1'
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`)
  const d = await res.json()
  return d.choices?.[0]?.message?.content || ''
}

// ── Strip quoted reply history (keep only the new message) ──
function stripQuotes(text) {
  if (!text) return ''
  const patterns = [
    /\r?\nOn .{10,200} wrote:\s*(\r?\n|$)/,
    /\r?\n-{5,}[ \t]*Original Message[ \t]*-{5,}/i,
    /\r?\nFrom:[ \t]+.+(\r?\n|$)/,
    /\r?\n_{10,}(\r?\n|$)/,
    /\r?\n>{1,}[ \t]*/m,
  ]
  let earliest = text.length
  for (const p of patterns) {
    const m = text.search(p)
    if (m !== -1 && m < earliest) earliest = m
  }
  return text.slice(0, earliest).trim()
}

// ── Triage one email with the AI ────────────────────────────
async function triageEmail(email) {
  const draftInstruction = cfg.autoDraft
    ? `DRAFT REPLY:\n<a complete, ready-to-send reply in a ${prefs.tone} tone${prefs.signature ? `, signed off with: ${prefs.signature}` : ''}>`
    : 'DRAFT REPLY:\n<leave blank>'

  const prompt = `You are an expert email assistant. Analyse the email and respond in EXACTLY this format with these section headers:

URGENCY: <one of: URGENT | NORMAL | LOW> — <short reason>
CATEGORY: <e.g. Customer support, Sales, Internal, Complaint, Billing, Spam>
SUMMARY: <2-3 sentences on what they want>
KEY POINTS:
- <point>
WATCH OUT FOR:
- <anything matching the rules below, deadlines, money, legal, or sensitive issues; "Nothing" if none>
${draftInstruction}

Rules to follow:
${prefs.rules}

Email from: ${email.fromName || email.from} <${email.from}>
Subject: ${email.subject}

Body:
"""
${email.body.slice(0, 6000)}
"""`

  const raw = await callAI(prompt)
  return { raw, ...parseTriage(raw) }
}

function parseTriage(raw) {
  const get = (label, next) => {
    const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n(?:${next})|$)`, 'i')
    const m = raw.match(re)
    return m ? m[1].trim() : ''
  }
  const headers = 'URGENCY|CATEGORY|SUMMARY|KEY POINTS|WATCH OUT FOR|DRAFT REPLY'
  const urgencyLine = get('URGENCY', headers)
  let level = 'normal'
  if (/urgent/i.test(urgencyLine)) level = 'urgent'
  else if (/low/i.test(urgencyLine)) level = 'low'
  return {
    level,
    urgency:  urgencyLine,
    category: get('CATEGORY', headers),
    summary:  get('SUMMARY', headers),
    keyPoints: get('KEY POINTS', headers),
    watchOut:  get('WATCH OUT FOR', headers),
    draft:     get('DRAFT REPLY', headers),
  }
}

// ── Poll the mailbox over IMAP ──────────────────────────────
let polling = false
async function pollMailbox() {
  if (polling) return
  polling = true
  const client = new ImapFlow(cfg.imap)
  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')
    try {
      const since = new Date(Date.now() - cfg.lookbackDays * 86400000)
      const uids = await client.search({ since }, { uid: true })
      const recent = (uids || []).slice(-25)  // cap to last 25
      for (const uid of recent) {
        if (inbox.has(uid)) continue  // already triaged
        const msg = await client.fetchOne(uid, { source: true, envelope: true, flags: true }, { uid: true })
        if (!msg) continue
        const parsed = await simpleParser(msg.source)
        const email = {
          uid,
          from:     parsed.from?.value?.[0]?.address || '',
          fromName: parsed.from?.value?.[0]?.name || '',
          subject:  parsed.subject || '(no subject)',
          date:     (parsed.date || new Date()).toISOString(),
          body:     stripQuotes(parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ') || ''),
          unread:   !(msg.flags && msg.flags.has('\\Seen')),
        }
        try {
          email.triage = await triageEmail(email)
        } catch (e) {
          email.triage = { error: e.message, level: 'normal' }
        }
        inbox.set(uid, email)
      }
    } finally {
      lock.release()
    }
    lastError = null
    lastPoll  = new Date().toISOString()
  } catch (e) {
    lastError = e.message
    console.error('[poll] error:', e.message)
  } finally {
    try { await client.logout() } catch {}
    polling = false
  }
}

// ── Send a reply over SMTP ──────────────────────────────────
const transporter = nodemailer.createTransport(cfg.smtp)
async function sendReply(uid, bodyText, bodyHtml) {
  const email = inbox.get(Number(uid)) || inbox.get(uid)
  if (!email) throw new Error('Email not found')
  const info = await transporter.sendMail({
    from: `"${cfg.fromName}" <${cfg.smtp.auth.user}>`,
    to: email.from,
    subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
    text: bodyText,
    html: bodyHtml || undefined,
  })
  email.replied = true
  email.repliedAt = new Date().toISOString()
  return info.messageId
}

// ── REST API ────────────────────────────────────────────────
const app = express()
app.use(express.json({ limit: '2mb' }))
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || cfg.origins.includes('*') || cfg.origins.includes(origin)) return cb(null, true)
    cb(null, false)
  },
}))

// Auth middleware
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next()
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!cfg.apiToken || token !== cfg.apiToken) return res.status(401).json({ error: 'Unauthorized' })
  next()
})

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'nexus-ai-email-server' }))

app.get('/api/status', (req, res) => res.json({
  connected: !lastError,
  lastError,
  lastPoll,
  count: inbox.size,
  provider: cfg.ai.provider,
  model: cfg.ai.model,
}))

app.get('/api/emails', (req, res) => {
  const list = [...inbox.values()]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => ({
      uid: e.uid, from: e.from, fromName: e.fromName, subject: e.subject,
      date: e.date, unread: e.unread, replied: !!e.replied,
      preview: e.body.slice(0, 160),
      triage: e.triage,
    }))
  res.json({ emails: list })
})

app.get('/api/emails/:uid', (req, res) => {
  const e = inbox.get(Number(req.params.uid)) || inbox.get(req.params.uid)
  if (!e) return res.status(404).json({ error: 'Not found' })
  res.json(e)
})

app.post('/api/emails/:uid/reply', async (req, res) => {
  try {
    const { text, html } = req.body || {}
    if (!text) return res.status(400).json({ error: 'Missing reply text' })
    const id = await sendReply(req.params.uid, text, html)
    res.json({ sent: true, messageId: id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/refresh', async (req, res) => {
  await pollMailbox()
  res.json({ refreshed: true, count: inbox.size, lastError })
})

app.get('/api/preferences', (req, res) => res.json(prefs))
app.post('/api/preferences', (req, res) => {
  const { rules, tone, signature } = req.body || {}
  if (rules !== undefined) prefs.rules = rules
  if (tone !== undefined) prefs.tone = tone
  if (signature !== undefined) prefs.signature = signature
  savePrefs()
  res.json(prefs)
})

// ── Boot ────────────────────────────────────────────────────
app.listen(cfg.port, () => {
  console.log(`\n  📬 NexusAI Email Server running on http://localhost:${cfg.port}`)
  console.log(`  Mailbox: ${cfg.imap.auth.user}  |  AI: ${cfg.ai.provider}/${cfg.ai.model}`)
  console.log(`  Polling every ${cfg.pollInterval / 1000}s\n`)
  if (!cfg.apiToken) console.warn('  ⚠  No API_TOKEN set — the API is unprotected!')
  pollMailbox()
  setInterval(pollMailbox, cfg.pollInterval)
})
