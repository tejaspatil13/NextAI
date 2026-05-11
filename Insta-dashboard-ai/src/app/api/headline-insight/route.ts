import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { Reel } from '@/lib/types'

function getAIProvider() {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.XAI_API_KEY) return 'xai'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

function buildPrompt(myReels: Reel[], competitorReels: Record<string, Reel[]>): string {
  const sorted = [...myReels].sort((a, b) => b.views - a.views)
  const avgViews = myReels.reduce((s, r) => s + r.views, 0) / (myReels.length || 1)
  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5)

  const er = (r: Reel) => (((r.likes + r.comments) / Math.max(r.views, 1)) * 100).toFixed(2)

  const formatReel = (r: Reel, rank: number) => {
    const hook = r.caption.split('\n')[0].slice(0, 120)
    const d = new Date(r.timestamp)
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
    const hour = d.getHours()
    const engIcon = parseFloat(er(r)) >= 5 ? '🔥' : parseFloat(er(r)) >= 2 ? '✓' : '↓'
    return (
      `[${rank}] ${r.views.toLocaleString()} views | ` +
      `${r.likes.toLocaleString()} likes | ${r.comments} comments | ER: ${er(r)}% ${engIcon} | ` +
      `Posted: ${day} ${hour}:00h\n` +
      `Hook: "${hook}"`
    )
  }

  const topAvg = top5.reduce((s, r) => s + r.views, 0) / (top5.length || 1)
  const botAvg = bottom5.reduce((s, r) => s + r.views, 0) / (bottom5.length || 1)
  const multiplier = (topAvg / Math.max(botAvg, 1)).toFixed(1)

  const compSummary = Object.entries(competitorReels)
    .filter(([, reels]) => reels.length > 0)
    .map(([username, reels]) => {
      const s = [...reels].sort((a, b) => b.views - a.views)
      const avg = reels.reduce((sum, r) => sum + r.views, 0) / reels.length
      const best = s[0]
      const bestHook = best.caption.split('\n')[0].slice(0, 100)
      return (
        `@${username}: ${reels.length} reels | avg ${Math.round(avg).toLocaleString()} views | ` +
        `best: ${best.views.toLocaleString()} views\n  Best hook: "${bestHook}"`
      )
    })
    .join('\n\n')

  const ownerHandle = myReels[0]?.ownerUsername ?? 'creator'

  return `You are a top-tier Instagram Reels growth strategist. You've scaled 200+ accounts across fitness, finance, comedy, lifestyle, and education — from 5K to 1M+ followers. Your edge is finding the ONE non-obvious lever that explains why some reels 10x while others flop, even when the production quality is identical.

═══ ACCOUNT: @${ownerHandle} ═══
Total reels analyzed: ${myReels.length}
Overall average views: ${Math.round(avgViews).toLocaleString()}
Top-5 avg vs Bottom-5 avg: ${Number(multiplier)}x gap

── TOP 5 REELS (your winners) ──
${top5.map((r, i) => formatReel(r, i + 1)).join('\n\n')}

── BOTTOM 5 REELS (your losers) ──
${bottom5.map((r, i) => formatReel(r, myReels.length - i)).join('\n\n')}

${compSummary ? `── COMPETITOR BENCHMARKS ──\n${compSummary}` : ''}

═══ YOUR ANALYSIS TASK ═══

Study the performance gap between top and bottom reels. Diagnose the single root cause — the ONE pattern that if changed would move the needle most. Examine:

1. Hook language — do winning reels open with a question, bold claim, or pain point that losers don't?
2. Emotional trigger — do top reels hit curiosity, fear, aspiration, or relatability more than low reels?
3. Engagement rate signal — high ER but low views = distribution issue; low ER + high views = viral but shallow. Which is it?
4. Post timing — is there a day/hour cluster in the winners that losers ignore?
5. Caption structure — first 3 words, length, use of line breaks or emojis
6. Competitor comparison — are they beating this account on a specific angle? What's the gap?

Return ONLY a JSON object — no markdown fences, no explanation, nothing else:
{
  "headline": "One sharp insight sentence, max 20 words. Must cite a real number or specific pattern. NOT generic advice.",
  "supporting": "2–3 sentences with evidence. Use exact view counts, percentages, or day/time data from the data above. Explain WHY this pattern drives the gap.",
  "action": "One concrete instruction for the creator's very next reel. Specific — not 'be more consistent' or 'improve quality'."
}

Examples of BAD headlines (do NOT produce these):
- "Focus on quality content to grow your account"
- "Post more consistently for better results"
- "Engage with your audience to build community"

Examples of GOOD headlines:
- "Your top 3 reels all open with a direct question — your bottom 5 start with 'I' statements that kill curiosity"
- "Friday 6 PM posts average 4.2x more views than your Monday posts — you've posted Monday 8 times this month"
- "Your ER of 8.3% is 3x the niche average, but views are capped — the algorithm isn't distributing you beyond followers"`
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Instagram content strategist. Always respond with valid JSON only — no markdown, no preamble, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.65,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.65 },
      }),
      signal: AbortSignal.timeout(30_000),
    }
  )
  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`)
  const data = await res.json()
  return data.candidates[0].content.parts[0].text as string
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Instagram content strategist. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.65,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}
async function callXAI(prompt: string, systemMsg?: string): Promise<string> {
  const messages = systemMsg
    ? [{ role: 'system', content: systemMsg }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }]
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages,
      max_tokens: 600,
      temperature: 0.65,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}


export async function POST(req: NextRequest) {
  const provider = getAIProvider()
  if (!provider) {
    return NextResponse.json(
      { error: 'No AI API key set (GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY)' },
      { status: 500 }
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '127.0.0.1'
  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Daily AI limit reached (${rateCheck.limit} calls/day). Resets at midnight UTC.`, rateLimited: true },
      { status: 429 }
    )
  }

  const { myReels, competitorReels } = (await req.json()) as {
    myReels: Reel[]
    competitorReels: Record<string, Reel[]>
  }

  if (!myReels?.length) {
    return NextResponse.json({ error: 'No reel data provided' }, { status: 400 })
  }

  const prompt = buildPrompt(myReels, competitorReels ?? {})

  try {
    let raw: string
    if (provider === 'gemini') raw = await callGemini(prompt)
    else if (provider === 'groq') raw = await callGroq(prompt)
    else if (provider === 'xai') raw = await callXAI(prompt)
    else raw = await callOpenAI(prompt)

    // Strip markdown fences if model ignored the instruction
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.headline || !parsed.supporting || !parsed.action) {
      throw new Error('Incomplete response from model')
    }

    return NextResponse.json({
      headline: String(parsed.headline),
      supporting: String(parsed.supporting),
      action: String(parsed.action),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
