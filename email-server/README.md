# NexusAI Email Server

Connects your mailbox to NexusAI. It reads new mail over **IMAP**, triages each email with **your AI** (Claude / OpenAI / Groq / etc.), drafts replies following **your preferences**, and sends replies over **SMTP** — all controlled from the NexusAI dashboard.

> Browsers can't open IMAP/SMTP connections or safely hold your email password, so this small server does it for you. It runs on your own machine (or a host you control) — your credentials never leave it.

---

## Quick start (5 minutes)

### 1. Install
```bash
cd email-server
npm install
```

### 2. Configure
```bash
cp .env.example .env
```
Open `.env` and fill in:
- **Mailbox** (IMAP + SMTP). For **Gmail** you must use an **App Password** (not your normal password):
  1. Enable 2-Step Verification on your Google account
  2. Go to https://myaccount.google.com/apppasswords
  3. Create an app password and paste it into `IMAP_PASS` and `SMTP_PASS`
- **AI provider** — the same key you'd add in NexusAI (e.g. `AI_PROVIDER=anthropic`, `AI_API_KEY=sk-ant-...`, `AI_MODEL=claude-sonnet-4-6`)
- **API_TOKEN** — invent a long random string. You'll paste this into NexusAI so only you can connect.

### 3. Run
```bash
npm start
```
You'll see:
```
📬 NexusAI Email Server running on http://localhost:8787
```

### 4. Connect NexusAI
In the NexusAI dashboard → **Email** page → **Connect Mailbox**:
- **Server URL**: `http://localhost:8787` (or your hosted URL)
- **Token**: the `API_TOKEN` you set

Your live, triaged inbox now appears in NexusAI.

---

## Mailbox settings cheat-sheet

| Provider | IMAP host / port | SMTP host / port |
|---|---|---|
| Gmail | imap.gmail.com / 993 | smtp.gmail.com / 465 (secure) |
| Outlook / Office365 | outlook.office365.com / 993 | smtp.office365.com / 587 |
| Yahoo | imap.mail.yahoo.com / 993 | smtp.mail.yahoo.com / 465 |
| iCloud | imap.mail.me.com / 993 | smtp.mail.me.com / 587 |

Gmail & Outlook require an **app password** with 2FA enabled.

---

## What it does

- **Polls** your inbox every `POLL_INTERVAL` seconds for new mail
- For each new email, asks your AI to return:
  - **Urgency** (🔴 Urgent / 🟡 Normal / 🟢 Low)
  - **Category**, **Summary**, **Key points**
  - **Watch out for** — anything matching your rules (deadlines, money, legal…)
  - **Draft reply** in your tone, with your signature
- Lets you **edit and send** the reply from NexusAI (over SMTP)
- Your **preferences** (rules / tone / signature) are editable from the dashboard

---

## Hosting (to keep it always-on)

Running `npm start` on your PC works while the PC is on. To run 24/7, deploy to a free/cheap host:

- **Render** (free tier) — New Web Service → connect repo → root `email-server` → build `npm install` → start `npm start` → add the `.env` vars in the dashboard
- **Railway** — similar
- **A small VPS** (~$5/mo) — `npm install && npm start` behind a process manager (pm2)

Set `ALLOWED_ORIGINS=https://b-star51.github.io` so only your NexusAI can call it, and use HTTPS in production.

---

## Security notes

- Credentials live **only** in your `.env` (gitignored) on the server you run.
- The API is protected by your `API_TOKEN`.
- Restrict `ALLOWED_ORIGINS` to your NexusAI URL.
- Use an **app password** so you can revoke access anytime without changing your main password.

---

## API (for reference)

All routes except `/api/health` require `Authorization: Bearer <API_TOKEN>`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/status` | Connection status, last poll, counts |
| GET | `/api/emails` | List triaged emails |
| GET | `/api/emails/:uid` | Full email + triage |
| POST | `/api/emails/:uid/reply` | Send a reply `{ text, html }` |
| POST | `/api/refresh` | Force a poll now |
| GET/POST | `/api/preferences` | Read/update `{ rules, tone, signature }` |
