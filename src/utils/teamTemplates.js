// Pre-built workflow templates the user can apply (loads into chat input or saves to prompt library)
export const TEAM_TEMPLATES = [
  { id: 'email-reply',    category: 'Communication', icon: 'Mail',        title: 'Email Reply',        desc: 'Draft a professional reply to an email',
    prompt: 'Draft a clear, professional reply to the following email. Keep it concise, address all questions, and end with a polite sign-off.\n\nEmail:\n[paste email here]' },
  { id: 'cold-outreach',  category: 'Sales',         icon: 'Send',        title: 'Cold Outreach',      desc: 'Write a cold outreach email that gets replies',
    prompt: 'Write a short, personalised cold outreach email. Hook in the first line, one clear value proposition, and a soft call-to-action. Avoid being salesy.\n\nProspect/context:\n[describe the prospect]' },
  { id: 'job-description', category: 'HR',            icon: 'Briefcase',   title: 'Job Description',    desc: 'Generate a complete job description',
    prompt: 'Write a complete, inclusive job description including: role summary, key responsibilities, required and preferred qualifications, and what we offer.\n\nRole:\n[job title and details]' },
  { id: 'meeting-summary',category: 'Productivity',  icon: 'FileText',    title: 'Meeting Summary',    desc: 'Summarise notes into decisions & action items',
    prompt: 'Summarise these meeting notes into: (1) Key decisions, (2) Action items with owners, (3) Open questions. Be concise.\n\nNotes:\n[paste notes]' },
  { id: 'contract-review',category: 'Legal',         icon: 'Scale',       title: 'Contract Review',    desc: 'Flag risks and unclear terms in a contract',
    prompt: 'Review the following contract text. List: (1) Potential risks or red flags, (2) Unclear or ambiguous terms, (3) Suggested questions to ask. End with a note that this is not formal legal advice.\n\nContract:\n[paste contract text]' },
  { id: 'social-post',    category: 'Marketing',     icon: 'Megaphone',   title: 'Social Post',        desc: 'Create on-brand social media posts',
    prompt: 'Create 3 engaging social media post variations for the topic below. Punchy, on-brand, with relevant hashtags and a hook.\n\nTopic:\n[describe topic]' },
  { id: 'product-desc',   category: 'E-commerce',    icon: 'Tag',         title: 'Product Description',desc: 'Write a persuasive product description',
    prompt: 'Write a persuasive, benefit-focused product description. Include a catchy headline, 3-4 key benefits, and a short closing line.\n\nProduct:\n[product details]' },
  { id: 'bug-report',     category: 'Engineering',   icon: 'Bug',         title: 'Bug Triage',         desc: 'Turn a vague report into a clear bug ticket',
    prompt: 'Turn this rough description into a clear bug ticket: Title, Steps to reproduce, Expected vs Actual, Severity, and Environment.\n\nDescription:\n[paste description]' },
]
