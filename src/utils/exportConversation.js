import * as XLSX from 'xlsx'

// messages: array of { role, content, providerName, modelName, createdAt }
export function exportAsMarkdown(messages, title = 'conversation', branding = {}) {
  const lines = []
  if (branding.companyName) {
    lines.push(`> **${branding.companyName}** — exported from NexusAI`, '')
  }
  lines.push(`# ${title}`, '', `_Exported ${new Date().toLocaleString()}_`, '')
  for (const m of messages) {
    if (m.role === 'user') {
      lines.push(`## 🧑 You`, '', m.content, '')
    } else {
      const who = m.modelName ? `${m.providerName} / ${m.modelName}` : 'Assistant'
      const content = m.content?.startsWith('__IMAGE__')
        ? `![generated image](${m.content.replace('__IMAGE__','').replace('__END_IMAGE__','')})`
        : m.content
      lines.push(`## 🤖 ${who}`, '', content, '')
    }
  }
  downloadFile(lines.join('\n'), `${sanitize(title)}.md`, 'text/markdown')
}

export function exportAsExcel(messages, title = 'conversation', branding = {}) {
  const dataRows = messages.map((m, i) => ([
    i + 1,
    m.role === 'user' ? 'You' : (m.modelName ? `${m.providerName} / ${m.modelName}` : 'Assistant'),
    m.content?.startsWith('__IMAGE__') ? '[Generated image]' : (m.content || ''),
    m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
  ]))
  const header = ['#', 'Role', 'Message', 'Time']
  const aoa = []
  if (branding.companyName) {
    aoa.push([`${branding.companyName} — Conversation Export`], [])
  }
  aoa.push(header, ...dataRows)
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 4 }, { wch: 28 }, { wch: 90 }, { wch: 22 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Conversation')
  XLSX.writeFile(wb, `${sanitize(title)}.xlsx`)
}

export function exportAsCSV(messages, title = 'conversation', branding = {}) {
  const rows = messages.map((m, i) => ({
    '#': i + 1,
    Role: m.role === 'user' ? 'You' : (m.modelName ? `${m.providerName} / ${m.modelName}` : 'Assistant'),
    Message: m.content?.startsWith('__IMAGE__') ? '[Generated image]' : (m.content || ''),
    Time: m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  let csv = XLSX.utils.sheet_to_csv(ws)
  if (branding.companyName) {
    csv = `${branding.companyName} — Conversation Export\n\n${csv}`
  }
  downloadFile(csv, `${sanitize(title)}.csv`, 'text/csv')
}

function sanitize(name) {
  return (name || 'conversation').replace(/[^a-z0-9-_ ]/gi, '').trim().slice(0, 50) || 'conversation'
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
