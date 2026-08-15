import type { Member, Prospect } from '../types'

function bullets(lines: string[]): string {
  return lines.filter(Boolean).map((l) => `- ${l}`).join('\n')
}

export function prospectBrief(p: Prospect): string {
  return `# Prospect intelligence — ${p.name}

**${p.title} · ${p.company}**
${p.industry} · ${p.city}
${p.website ? p.website : ''}
${p.linkedin ? p.linkedin : ''}

## Who this is
${p.name} is ${p.title} at ${p.company}, a ${p.industry.toLowerCase()} business. Relationship is **${p.relationshipStatus.replace('-', ' ')}**, stage **${p.stage}**. Source: ${p.source}. Owner: ${p.owner}.

## What the company does
${p.notes || `${p.company} operates in ${p.industry}.`}

## Why they are worth a conversation
${bullets([
  p.objective,
  p.priorNotes,
  p.relationshipStatus === 'referral' ? 'Warm introduction already in hand — treat as borrowed trust.' : '',
  p.stage === 'commit' ? 'This is a close, not a discovery. Do not reopen the sale.' : '',
])}

## Possible pain points
${bullets([
  p.objective,
  'Time spent away from the operating business.',
  'Unclear personal vs. corporate liquidity.',
  p.notes.includes('brother') || p.notes.includes('sister') || p.notes.includes('wife')
    ? 'Family dynamics around control and succession.'
    : 'Decision rights may sit with more than one person.',
])}

## Business-development angles
${bullets(p.products.map((x) => `${x} — only if the conversation earns it.`))}

## Conversation starters
${bullets([
  `“${p.owner === 'James' ? 'Whitaker / the person who introduced us' : 'Your note'} said ${p.objective.split('.')[0].toLowerCase()}. Is that still the live issue?”`,
  `Ask how ${p.company} actually makes money this year — not the website version.`,
  'Ask who else has to be comfortable before anything moves.',
])}

## Suggested first-touch
Stay inside the objective. Do not lead with a fund. Tone: ${p.tone}.

## Risk notes (demo)
Simulated only — no compliance engine. Do not present this as advice. Do not invent holdings or performance.
`
}

export function callScript(p: Prospect, callType: string): string {
  const openers: Record<string, string> = {
    'cold call': `John — James at Solyco. I will be brief. I work with owners in ${p.industry.split('·')[0].trim()} on liquidity and succession. I am not calling to pitch a fund. Do you have four minutes?`,
    'warm call': `${p.name.split(' ')[0]} — James at Solyco. ${p.source} put us together. I wanted to respect that and not send a deck first.`,
    'follow-up': `${p.name.split(' ')[0]} — James. Picking up from ${p.lastTouch}. I said I would come back on ${p.objective.split('.')[0].toLowerCase()}.`,
    'referral intro': `${p.name.split(' ')[0]} — James at Solyco. ${p.source}. They said not to waste your time, so I will not.`,
    'meeting prep': `Open seated, no slide. Restate the objective in one sentence and ask if that is still the meeting.`,
  }
  return `# Call script — ${p.name}
**Type:** ${callType} · **Tone:** ${p.tone}

## Opening
${openers[callType] ?? openers['warm call']}

## Reason for the call
${p.objective}

## Value (one sentence)
Solyco sits with owners and LPs who are tired of stitching together a bank, a broker, and a fund admin — we make the next twelve months of money-decisions coherent.

## Discovery
${bullets([
  `What is the actual constraint at ${p.company} this year — cash, control, or succession?`,
  'Who else has to sleep well for this to move?',
  'What have you already tried, and what did you dislike about it?',
  'If we did nothing, what happens in 18 months?',
  'What would make this conversation a waste of your morning?',
])}

## Objection responses
- **“We already have advisors.”** Good. We are not here to fire them. We are here for the gap between them.
- **“Send a deck.”** I can. I would rather know which page is worth your time.
- **“We’re not selling.”** Neither am I. Most of this work never needs a transaction.
- **“Call me next quarter.”** I will. What would have to change between now and then for this to matter?

## Transition
“If it is useful I will send a one-page cash / control / succession map — no term sheet.”

## Close
Agree a next step with a date. Preferred: ${p.nextTouch}.

## Voicemail
“${p.name.split(' ')[0]}, James at Solyco, ${p.source || 'brief note'}. Ninety seconds on ${p.objective.split('.')[0].toLowerCase()}. I will not chase. 212-555-0100.”

## Follow-up email (draft)
Subject: ${p.company} — one page, no pitch

${p.name.split(' ')[0]} —

Thank you for the time. As promised, I am not attaching a deck.

I heard the live issue as: ${p.objective}

If I have that wrong, reply with one line and I will correct it. If I have it right, I will send a single page mapping cash, control, and succession — nothing to sign.

James
Solyco
`
}

export type PlanContext = {
  lastTouch?: string
  nextTouch?: string
  products?: string[]
  family?: string[]
  stage?: string
  notes?: string
  priorNotes?: string
  source?: string
  city?: string
  relationship?: string
}

export function interactionPlan(
  name: string,
  company: string,
  horizon: string,
  focus: string,
  ctx: PlanContext = {},
): string {
  const first = name.split(' ')[0]
  const family = ctx.family?.filter(Boolean) ?? []
  const products = ctx.products ?? []
  const file = [ctx.notes, ctx.priorNotes].filter(Boolean).join(' ')
  const brother = /brother/i.test(file)
  const cash = /working capital|cash|receivable|bank line/i.test(`${focus} ${file}`)
  const beats: Record<string, string[]> = {
    '7-day': [
      `Day 0: same-day recap to ${first} — three bullets on “${focus.split('.')[0]}”, no attachments.`,
      ctx.source
        ? `Day 2: one artifact that honors ${ctx.source} (borrowed trust — do not send a deck).`
        : 'Day 2: one useful artifact — cash map, IPS excerpt, or intro. Not a check-in.',
      cash
        ? 'Day 5: offer two call times with a one-page cash-conversion map. Recap stays in the drawer.'
        : `Day 5: offer two call times in ${ctx.city || 'their timezone'}.`,
      `Day 7: if silent, one line referencing ${ctx.nextTouch || 'the next date on the file'}, then stop.`,
    ],
    '30-day': [
      `Week 1: recap + the artifact that matches the live issue (${cash ? 'cash map' : 'one page on ' + focus.split('.')[0].toLowerCase()}).`,
      brother
        ? `Week 2: do not raise a recap. If you write, write something ${first} can hand his brother without drama.`
        : 'Week 2: one talking point tied to their book, not the tape.',
      family.length
        ? `Week 3: only involve ${family[0]} if ${first} opens that door.`
        : 'Week 3: introduce one relevant person or one relevant page.',
      ctx.stage === 'commit'
        ? `Week 4: this is a close. Paper the thing already agreed. Do not reopen discovery.`
        : `Week 4: propose the next meeting with a written agenda. Last touch was ${ctx.lastTouch || 'unrecorded'}.`,
    ],
    '60-day': [
      `Days 1–14: earn a second meeting on “${focus.split('.')[0]}.”`,
      products.length
        ? `Days 15–30: put ${products[0]} on paper as optional — never as the opener.`
        : 'Days 15–30: put a specific path on paper, still optional.',
      brother || family.length
        ? `Days 31–45: the other decision-maker (${brother ? 'the brother on the floor' : family[0]}) only after ${first} invites it.`
        : 'Days 31–45: involve the other decision-maker.',
      `Days 46–60: decide — advance, nurture, or drop. Relationship is ${ctx.relationship || 'unscored'}.`,
    ],
    '90-day': [
      `Month 1: diagnosis of ${company} as it actually makes money, not the website.`,
      cash
        ? 'Month 2: a reversible first step — corporate cash sleeve and a continuity signer. No term sheet.'
        : 'Month 2: a reversible first step (cash, IPS, continuity).',
      products.length
        ? `Month 3: only then a commitment conversation (${products.join(', ')}).`
        : 'Month 3: only then a commitment conversation.',
      'Cadence: one call, one written, one personal touch per month. No more.',
    ],
    annual: [
      `Q1: planning. Start from last touch ${ctx.lastTouch || 'on file'}, not a calendar default.`,
      'Q2: performance vs. the thing they actually care about.',
      family.length
        ? `Q3: family / succession — ${family.join('; ')}.`
        : 'Q3: family / succession / next generation.',
      products.length
        ? `Q4: commitments (${products.join(', ')}) and next year’s calendar.`
        : 'Q4: commitments and calendar for the following year.',
      'Personal: one non-commercial touch per quarter.',
    ],
  }
  const key = horizon in beats ? horizon : '30-day'
  return `# Interaction plan — ${name}
**${company}** · ${horizon} · focus: ${focus}
${ctx.source ? `Source: ${ctx.source}. ` : ''}${ctx.stage ? `Stage: ${ctx.stage}.` : ''}

${beats[key].map((l) => `- ${l}`).join('\n')}

## Cadence
- Calls: scheduled, never “just checking in.”
- Email: artifacts, not pulses.
- Market updates: only when they change a decision for ${first}.
- Personal: one thing you would do even if they never gave you a dollar.

## Next-best action
${cash ? `Send the cash map today. Do not mention a recap.` : `Do the Day 0 / Week 1 item today. Everything else is decoration until that is sent.`}
${brother ? `\nDo not put “recap” in a subject line ${first} might forward.` : ''}
`
}

function pullLines(transcript: string, re: RegExp): string[] {
  return transcript
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && re.test(l))
}

export function meetingNotes(
  name: string,
  kind: 'internal' | 'external',
  transcript: string,
  objective: string,
  extras: { landmines?: string[]; products?: string[] } = {},
): {
  internal: string
  external: string
} {
  const first = name.split(' ')[0]
  const learned = pullLines(
    transcript,
    /\$|million|percent|bank line|receivable|IPS|Fund IV|lockup|signer|DAF|trust|muni|working capital|brother|wife|close|October|duration/i,
  )
  const promises = pullLines(transcript, /\bI will\b|\bwe (can|do|park|start|give|send)\b/i)
  const theirVoice = pullLines(transcript, new RegExp(`^${first}\\b|^[A-Z][a-z]+ [A-Z][a-z]+:`, 'i')).slice(0, 6)
  const upsells: string[] = []
  const blob = transcript.toLowerCase()
  if (/fund iv|three million|commitment/.test(blob)) upsells.push('Fund IV — they put a number on it. Do not enlarge it.')
  if (/working capital|bank line|receivable/.test(blob)) upsells.push('Corporate cash-management sleeve — this is conversion, not a sale.')
  if (/signer|succession|brother/.test(blob)) upsells.push('Continuity memo / authorized signer — volunteered, same-week fix.')
  if (/donor-advised|daf/.test(blob)) upsells.push('DAF — named, small, veto stays with the principal.')

  const learnedBlock = learned.length
    ? learned.map((l) => `- ${l}`).join('\n')
    : transcript
      ? '- Tape exists but no hard facts jumped. Read it again before you write a number down.'
      : '- No transcript yet — write from memory, then tighten.'

  const internal = `# Internal recap — ${name}

**Objective:** ${objective}

## What we learned
${learnedBlock}

## Their words
${theirVoice.length ? theirVoice.map((l) => `- ${l}`).join('\n') : '- Nothing attributed yet.'}

## What we promised
${promises.length ? promises.map((l) => `- ${l}`).join('\n') : '- No explicit promise on the tape. Do not invent one.'}

## Opportunities
${upsells.length ? upsells.map((u) => `- ${u}`).join('\n') : '- Nothing earned. Do not manufacture a ticket.'}
${extras.products?.length ? `- On the file already: ${extras.products.join(', ')}.` : ''}

## Risks
${extras.landmines?.length ? extras.landmines.map((d) => `- ${d}`).join('\n') : '- None flagged on the file.'}
- Any number we quoted we must stand behind.

## Follow-ups
- Same-day written recap (external version) — only what we promised.
- One artifact, not three.
- Log a touchpoint with a real date.
`
  const promisedThem = promises[0]?.replace(/^[^:]+:\s*/, '') ?? 'the one thing I said I would send'
  const external = kind === 'internal'
    ? ''
    : `# Note for ${name}

Thank you for the time today.

What I heard as the live issue: ${objective}

${learned[0] ? `I wrote down: ${learned[0].replace(/^[^:]+:\s*/, '')}\n` : ''}
I will send ${promisedThem.toLowerCase().startsWith('i will') ? promisedThem.charAt(0).toLowerCase() + promisedThem.slice(1) : promisedThem} — and nothing else — by end of day.

If I have any of this wrong, reply with a line and I will correct the file.

James
Solyco
`
  return { internal, external }
}

export function emailVariants(fromName: string, inbound: string, tone: string): { label: string; subject: string; body: string }[] {
  const first = fromName.split(' ')[0]
  const about = inbound.trim().split('\n')[0]?.slice(0, 140) || 'your note'
  return [
    {
      label: 'Short',
      subject: `Re: ${about.slice(0, 60)}`,
      body: `${first} —\n\nReceived. I will come back with a clean answer by tomorrow morning.\n\nJames`,
    },
    {
      label: 'Professional',
      subject: `Re: ${about.slice(0, 60)}`,
      body: `${first} —\n\nThank you for this. I want to answer the substance, not the inbox.\n\nI will send a short written reply covering (1) what I think you are asking, (2) what I would do next, and (3) what I need from you. If that framing is wrong, say so and I will redo it.\n\nJames\nSolyco`,
    },
    {
      label: 'Warmer',
      subject: `Re: ${about.slice(0, 60)}`,
      body: `${first} —\n\nI read this twice. I do not want to give you a fast answer that wastes a slower one.\n\nGive me until tomorrow. I will write it the way we actually talk — ${tone || 'direct, no theater'}.\n\nJames`,
    },
  ]
}

export function marketBrief(): string {
  return `# Daily market brief — Saturday, 15 August 2026

_Simulated desk note. Not a recommendation. Not for clients as-is._

## Snapshot
Futures quiet into the weekend. The story is still the path of cuts, not the last print. Credit is orderly. The dollar is heavy. Oil is the only thing that looks like it wants a headline.

## Headlines (desk)
- Labor market: cooling without breaking. Useful for owners who still cannot hire.
- A regional bank sold a CRE sleeve overnight — talking point for anyone with a building and a floating rate.
- Another AI-capex pause rumor in megacap tech. Do not turn this into a monologue.

## Rates
Front-end softer. Tens roughly unchanged on the week. Municipal ratios a touch richer after July’s rally — Shah and Voss will ask. Have the duration answer ready.

## Equities
Narrow tape. Equal-weight still lagging. Fine for Chen’s 10b5-1 conversation (“we sell process, not a view on NVDA”).

## Credit / PE
New-issue calendars thin in August. Private credit still clearing. Okonkwo’s sleeve is not urgent; do not manufacture urgency.

## Talking points
**Business owners:** working capital is the conversation, not valuation. Smith is the template.
**Retirees / income:** the muni book did its job; do not chase the rally.
**PE / LPs:** DPI questions are in season (Brooks). Lead with realizations, not IRR.

## Suggested conversations today
- Priya Shah: duration, then Fund IV funded from taxable, not the trust.
- John Smith: cash-conversion, not a recap.
- Eleanor Voss: where Park Ave proceeds sit for 90 days.

## Suggested social (do not auto-post)
“Most owners do not need a transaction this year. They need a map of cash, control, and who can sign if they cannot.”

## Client angles already in the book
- Chen: lockup in November — process over price.
- Alvarez: consolidation, not markets.
- Park: she will smell a market email. Do not send one.
`
}

export function memberUpsells(m: Member): { title: string; why: string }[] {
  const out: { title: string; why: string }[] = []
  if (m.missingInfo.some((x) => x.toLowerCase().includes('529'))) {
    out.push({ title: 'Open 529', why: 'Named as missing info — reversible, high-trust.' })
  }
  if (m.family.some((f) => /son|daughter|child/i.test(f.relation))) {
    out.push({ title: 'Next-gen introduction', why: `${m.family.filter((f) => /son|daughter|child/i.test(f.relation)).map((f) => f.name).join(', ')} is already on the file.` })
  }
  if (m.products.some((p) => /funds*IV|Fund IV/i.test(p) || p.includes('Fund IV'))) {
    out.push({ title: 'Fund IV path', why: 'Already on the product list — only if liquidity is real.' })
  }
  if (m.kind === 'portfolio') {
    out.push({ title: 'Founder liquidity / 10b5-1', why: 'Portfolio chairman/founder — personal book often lags the deal.' })
  }
  if (m.missingInfo.length) {
    out.push({ title: 'Close missing-info gaps', why: m.missingInfo[0] })
  }
  return out.slice(0, 4)
}

export function talkingPoints(name: string, objective: string, extras: string[]): string[] {
  return [
    `Restate the objective in their words: ${objective}`,
    `Ask what would make this meeting a waste of time for ${name}.`,
    ...extras,
    'Leave with one dated next step, not a feeling.',
  ]
}
