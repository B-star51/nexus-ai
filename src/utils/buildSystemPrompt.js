export function buildSystemPrompt({
  agentName, agentUserName, agentPersonality, agentTaskFocus,
  agentCommStyle, agentResponseLength, agentCustomTraits, agentSystemPrompt,
  business,
}) {
  const parts = []

  // Identity
  parts.push(`You are ${agentName || 'NexusAI'}, a highly capable AI assistant.`)

  // User name
  if (agentUserName?.trim()) {
    parts.push(`The person you are talking to is called "${agentUserName.trim()}". Address them by this name naturally in conversation.`)
  }

  // Personality
  const personalities = {
    friendly:     'Be warm, encouraging, and personable. Show genuine interest and use a conversational tone.',
    professional: 'Be professional, precise, and business-like. Keep responses polished and authoritative.',
    witty:        'Be clever, occasionally use humour, and show personality. Make interactions engaging.',
    concise:      'Be extremely concise. Minimum words, maximum impact. No filler.',
    creative:     'Be imaginative, inventive, and embrace unconventional approaches. Think outside the box.',
    blunt:        'Be direct and honest, even if blunt. No sugarcoating. Just the truth.',
  }
  if (personalities[agentPersonality]) parts.push(personalities[agentPersonality])

  // Task focus
  const focuses = {
    general:  '',
    coding:   'You specialise in software development. Prioritise code quality, best practices, and clear explanations. Always provide runnable code.',
    research: 'You are a thorough researcher. Back claims with reasoning, cite sources when possible, and acknowledge uncertainty.',
    creative: 'You excel at creative writing, storytelling, and imaginative tasks. Use vivid language and original ideas.',
    analysis: 'You are a sharp analyst. Break down problems methodically, provide structured insights, and challenge assumptions.',
    teaching: 'You are a patient, encouraging teacher. Break complex topics into digestible steps with practical examples.',
  }
  if (focuses[agentTaskFocus]) parts.push(focuses[agentTaskFocus])

  // Communication style
  const styles = {
    casual:    'Use casual, relaxed language. Contractions are fine.',
    balanced:  '',
    formal:    'Use formal language and proper grammar throughout.',
    technical: 'Use precise technical terminology. Assume a knowledgeable audience.',
  }
  if (styles[agentCommStyle]) parts.push(styles[agentCommStyle])

  // Response length
  const lengths = {
    brief:    'Keep responses short and punchy. Only elaborate when asked.',
    balanced: '',
    detailed: 'Provide thorough, comprehensive responses. Explain reasoning and cover edge cases.',
  }
  if (lengths[agentResponseLength]) parts.push(lengths[agentResponseLength])

  // Custom traits
  if (agentCustomTraits?.trim()) parts.push(agentCustomTraits.trim())

  // Manual system prompt override (appended)
  if (agentSystemPrompt?.trim()) parts.push(agentSystemPrompt.trim())

  // Business Mode — company context prepended to the top of the prompt
  let companyBlock = ''
  if (business?.enabled && business.company?.name?.trim()) {
    const c = business.company
    const lines = [`You are an AI assistant representing ${c.name}${c.industry ? `, a company in the ${c.industry} industry` : ''}.`]
    if (c.products?.trim())   lines.push(`Products/services: ${c.products.trim()}.`)
    if (c.brandVoice?.trim()) lines.push(`Always communicate in this brand voice: ${c.brandVoice.trim()}.`)
    if (c.website?.trim())    lines.push(`Company website: ${c.website.trim()}.`)
    lines.push(`Represent the company professionally and stay aligned with its brand and values in every response.`)
    companyBlock = lines.join(' ')
  }

  return [companyBlock, ...parts].filter(Boolean).join(' ')
}
